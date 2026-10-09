import {
  getProgramsData,
  getSeriesMaterialsData,
  parseSeriesPage,
  seriesMaterialsHref,
} from "../api";

const series = [
  { id: "series-1", name: "COMPLECS" },
  { id: "series-2", name: "CIML" },
];
const material = {
  id: "material-1",
  title: "Linux training",
  description: "Learn Linux.",
  eventEditions: [],
  topics: [{ id: "topic-1", name: "Linux" }],
  tools: [],
  systems: [],
  instructors: [],
  resources: [],
};
const responseWith = (body: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as Response;

// Keep request-budget assertions with their shared Gateway mock.
// eslint-disable-next-line max-lines-per-function
describe("series Gateway pagination", () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
    fetchMock.mockImplementation((input: string) => {
      const url = new URL(input);
      if (url.pathname.endsWith("event-series"))
        return Promise.resolve(responseWith(series));
      const page = Number(url.searchParams.get("page"));
      const empty = url.searchParams.get("eventSeries") === "series-2";
      return Promise.resolve(
        responseWith({
          items:
            empty || page > 3
              ? []
              : [material, { ...material, id: "material-2" }],
          page,
          pageSize: 6,
          total: empty ? 0 : 13,
          totalPages: empty ? 0 : 3,
        }),
      );
    });
  });
  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("loads only series when no program is selected", async () => {
    expect(await getProgramsData()).toEqual({
      programs: series,
      selectedProgram: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("bounds the preview to one six-record request and retains same-title records", async () => {
    const data = await getProgramsData("series-1");
    expect(data.selectedProgram?.materials).toHaveLength(2);
    expect(data.selectedProgram?.materials[0]).toMatchObject({
      title: "Linux training",
      topics: ["Linux"],
      series: "COMPLECS",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://gateway.example/api/v1/materials?eventSeries=series-1&page=1&pageSize=6",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("loads only the deep-linked page and returns the Gateway total", async () => {
    const data = await getSeriesMaterialsData("series-1", 2);
    expect(data).toMatchObject({
      page: 2,
      totalPages: 3,
      program: { total: 13 },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://gateway.example/api/v1/materials?eventSeries=series-1&page=2&pageSize=6",
      expect.anything(),
    );
  });

  it("clamps an out-of-range link with one extra bounded request", async () => {
    expect(await getSeriesMaterialsData("series-1", 999)).toMatchObject({
      page: 3,
      totalPages: 3,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("eventSeries=series-1&page=3&pageSize=6"),
      expect.anything(),
    );
  });

  it("returns truthful zero results and normalizes a stale page to one", async () => {
    expect(await getSeriesMaterialsData("series-2", 8)).toMatchObject({
      page: 1,
      totalPages: 0,
      program: { id: "series-2", total: 0, materials: [] },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("never requests unfiltered materials for a missing or unknown series", async () => {
    expect((await getSeriesMaterialsData("unknown")).program).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("propagates service failures rather than presenting a false empty collection", async () => {
    fetchMock.mockRejectedValue(new Error("Offline"));
    await expect(getSeriesMaterialsData("series-1")).rejects.toThrow("Offline");
  });

  it.each([undefined, "0", "-1", "1.2", "no", "Infinity", "9007199254740992"])(
    "normalizes invalid page %s",
    (page) => {
      expect(parseSeriesPage(page)).toBe(1);
    },
  );
  it("accepts deep links and safely encodes the series", () => {
    expect(parseSeriesPage(["2", "3"])).toBe(2);
    expect(seriesMaterialsHref("series & 1", 2)).toBe(
      "/programs/materials?program=series+%26+1&page=2",
    );
  });
});
