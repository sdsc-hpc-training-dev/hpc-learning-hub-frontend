import { getEventsData } from "../api";

const futureSoon = {
  id: "event-soon",
  title: "Upcoming workshop",
  description: "Learn something new.",
  startAt: "2027-01-10T18:00:00.000Z",
  endAt: "2027-01-10T19:00:00.000Z",
  format: "online",
  location: "Remote event",
};

const futureLate = {
  ...futureSoon,
  id: "event-late",
  title: "Later workshop",
  startAt: "2027-02-10T18:00:00.000Z",
  endAt: "2027-02-10T19:00:00.000Z",
};

function material(id: string, title: string, startAt: string) {
  return {
    id,
    title,
    description: `${title} description`,
    eventEditions: [{ ...futureSoon, id: `${id}-event`, title, startAt }],
    topics: [],
    tools: [],
    systems: [],
    instructors: [],
    resources: [],
  };
}

function responseWith(body: unknown): Response {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as Response;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.toString() : input.url;
}

describe("events API", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("selects future events and recent recording materials", async () => {
    fetchMock.mockImplementation((input) => {
      const url = requestUrl(input);
      if (url.endsWith("/api/v1/event-editions")) {
        return Promise.resolve(
          responseWith([
            futureLate,
            {
              ...futureSoon,
              id: "past",
              startAt: "2025-01-01T00:00:00.000Z",
              endAt: "2099-01-01T00:00:00.000Z",
            },
            futureSoon,
          ]),
        );
      }
      const isSecondPage = url.includes("page=2");
      return Promise.resolve(
        responseWith({
          items: isSecondPage
            ? [material("newer", "Newer recording", "2026-06-01T18:00:00.000Z")]
            : [
                material("older", "Older recording", "2025-06-01T18:00:00.000Z"),
                material("future", "Future livestream", "2028-06-01T18:00:00.000Z"),
              ],
          page: isSecondPage ? 2 : 1,
          pageSize: 100,
          total: 3,
          totalPages: 2,
        }),
      );
    });

    const data = await getEventsData(new Date("2027-01-01T00:00:00.000Z"));

    expect(data.upcomingEvents.map((event) => event.id)).toEqual([
      "event-soon",
      "event-late",
    ]);
    expect(data.recordings.map((recording) => recording.id)).toEqual([
      "newer",
      "older",
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("resourceType=video"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
