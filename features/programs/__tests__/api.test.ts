import { getProgramsData } from "../api";

const series = [
  { id: "series-1", name: "COMPLECS" },
  { id: "series-2", name: "Summer Institute" },
];

const materialPage = {
  items: [
    {
      id: "material-1",
      title: "Linux training",
      description: "Learn Linux.",
      eventEditions: [],
      topics: [{ id: "topic-1", name: "Linux" }],
      tools: [],
      systems: [],
      instructors: [],
      resources: [],
    },
    {
      id: "material-duplicate",
      title: "  LINUX TRAINING ",
      description: "A duplicate edition.",
      eventEditions: [],
      topics: [],
      tools: [],
      systems: [],
      instructors: [],
      resources: [],
    },
  ],
  page: 1,
  pageSize: 20,
  total: 12,
  totalPages: 2,
};

const secondMaterialPage = {
  ...materialPage,
  items: [
    {
      id: "material-2",
      title: "Batch computing",
      description: "   ",
      eventEditions: [],
      topics: [],
      tools: [],
      systems: [],
      instructors: [],
      resources: [],
    },
  ],
  page: 2,
};

function responseWith(body: unknown): Response {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as Response;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.toString() : input.url;
}

function mockSelectedProgramResponses(
  fetchMock: jest.MockedFunction<typeof fetch>,
) {
  fetchMock.mockImplementation((input) => {
    const url = requestUrl(input);
    let body: unknown = materialPage;
    if (url.endsWith("/api/v1/event-series")) body = series;
    else if (url.includes("page=2")) body = secondMaterialPage;
    return Promise.resolve(responseWith(body));
  });
}

describe("programs API", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("loads only the series list when no program is selected", async () => {
    fetchMock.mockResolvedValue(responseWith(series));

    await expect(getProgramsData()).resolves.toEqual({
      programs: series,
      selectedProgram: null,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("loads representative materials for the selected series", async () => {
    mockSelectedProgramResponses(fetchMock);

    const data = await getProgramsData("series-1");

    expect(data.selectedProgram).toMatchObject({
      id: "series-1",
      name: "COMPLECS",
      total: 12,
      materials: [
        expect.objectContaining({
          id: "material-1",
          series: "COMPLECS",
          topics: ["Linux"],
        }),
        expect.objectContaining({
          id: "material-2",
          description: null,
        }),
      ],
    });
    expect(data.selectedProgram?.materials).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("eventSeries=series-1"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("does not request materials for an unknown series", async () => {
    fetchMock.mockResolvedValue(responseWith(series));

    const data = await getProgramsData("unknown");

    expect(data.selectedProgram).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("programs API normalization", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("normalizes empty material titles", async () => {
    fetchMock.mockImplementation((input) => {
      const body = requestUrl(input).endsWith("/api/v1/event-series")
        ? series
        : {
            ...materialPage,
            items: [{ ...materialPage.items[0], title: "   " }],
            totalPages: 1,
          };
      return Promise.resolve(responseWith(body));
    });

    const data = await getProgramsData("series-1");

    expect(data.selectedProgram?.materials[0].title).toBe(
      "Untitled training material",
    );
  });
});
