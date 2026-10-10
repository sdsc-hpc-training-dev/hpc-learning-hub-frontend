import {
  getTrainingLibraryData,
  getTrainingLibraryFacets,
  normalizeMaterial,
} from "../api";
import type { GatewayMaterial } from "@/lib/gateway/types";

function material(
  id: string,
  title: string,
  description: string,
): GatewayMaterial {
  return {
    id,
    title,
    description,
    eventEditions: [],
    topics: [],
    tools: [],
    systems: [],
    instructors: [],
    resources: [],
  };
}
function responseWith(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response;
}
function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

beforeEach(() => {
  process.env.GATEWAY_URL = "https://gateway.example";
  global.fetch = fetchMock;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    responseWith({
      items: Array.from({ length: 10 }, (_, i) =>
        material(String(i), "Material " + String(i), "Description"),
      ),
      page: 2,
      pageSize: 10,
      total: 530,
      totalPages: 53,
    }),
  );
});
afterEach(() => {
  delete process.env.GATEWAY_URL;
});

it("requests exactly one ten-item Gateway page with every filter and preserves server order and totals", async () => {
  const result = await getTrainingLibraryData({
    page: "2",
    query: "batch computing",
    program: "series-1",
    topic: "Batch Computing",
    tool: "Slurm",
    system: "Expanse",
    resource: "video",
    date: "2025-01-01",
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const url = new URL(requestUrl(fetchMock.mock.calls[0][0]));
  expect(Object.fromEntries(url.searchParams)).toEqual({
    search: "batch computing",
    searchMode: "phrase",
    eventSeries: "series-1",
    page: "2",
    pageSize: "10",
    topic: "Batch Computing",
    tool: "Slurm",
    system: "Expanse",
    resourceType: "video",
    date: "2025-01-01",
    sort: "recommended",
  });
  expect(result.materials.map((item) => item.id)).toEqual(
    Array.from({ length: 10 }, (_, i) => String(i)),
  );
  expect(result).toMatchObject({ page: 2, total: 530, totalPages: 53 });
});

it.each([undefined, "0", "-1", "1.5", "invalid"])(
  "normalizes invalid page %s without downloading extra pages",
  async (page) => {
    await getTrainingLibraryData({ page, sort: "title" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(requestUrl(fetchMock.mock.calls[0][0])).toContain("page=1");
    expect(requestUrl(fetchMock.mock.calls[0][0])).toContain("sort=title");
  },
);

it("keeps an empty page and server totals, including incomplete records", async () => {
  fetchMock.mockResolvedValueOnce(
    responseWith({
      items: [],
      page: 54,
      pageSize: 10,
      total: 530,
      totalPages: 53,
    }),
  );
  expect(await getTrainingLibraryData({ page: "54" })).toMatchObject({
    materials: [],
    total: 530,
    page: 54,
    totalPages: 53,
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("reports failures without falling back to a full-catalog download", async () => {
  fetchMock.mockRejectedValueOnce(new Error("offline"));
  expect(await getTrainingLibraryData()).toMatchObject({
    materials: [],
    total: 0,
    error: true,
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("loads catalog-wide facet options from small lookup endpoints", async () => {
  fetchMock.mockResolvedValue(responseWith([{ id: "id", name: "Name" }]));
  expect(await getTrainingLibraryFacets()).toEqual({
    topics: [{ id: "id", name: "Name" }],
    tools: [{ id: "id", name: "Name" }],
    systems: [{ id: "id", name: "Name" }],
  });
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
    "https://gateway.example/api/v1/topics",
    "https://gateway.example/api/v1/tools",
    "https://gateway.example/api/v1/systems",
  ]);
});

describe("Training Library repository normalization", () => {
  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("repairs repository-derived records before rendering", async () => {
    fetchMock.mockResolvedValueOnce(
      responseWith({
        items: [
          {
            ...material(
              "repository-material",
              "",
              "[![DOI](https://zenodo.org/badge.svg)](https://doi.org/example) # Summer Institute &amp; HPC",
            ),
            eventEditions: [
              {
                id: "event-1",
                title: "Summer Institute 2019",
                description: null,
                startAt: "2019-08-05T07:00:00Z",
                endAt: null,
                format: "online",
                location: "Remote event",
              },
            ],
            resources: [
              {
                id: "repo-1",
                title: "2019: High Performance Computing and Data Science",
                type: "repository",
                url: "https://github.com/sdsc/example",
              },
            ],
          },
        ],
        page: 1,
        pageSize: 100,
        total: 1,
        totalPages: 1,
      }),
    );

    const result = await getTrainingLibraryData();

    expect(result.materials[0]).toEqual(
      expect.objectContaining({
        title: "2019: High Performance Computing and Data Science",
        description: "Summer Institute & HPC",
        date: "2019-08-05T07:00:00Z",
        primaryUrl: "https://github.com/sdsc/example",
      }),
    );
  });
});

describe("Training Library material presentation", () => {
  it("falls back to event metadata when a repository title is a license badge", () => {
    const badge =
      '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/" <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" / </a';
    const normalized = normalizeMaterial({
      ...material(
        "summer-institute-material",
        badge,
        `${badge} SDSC Summer Institute 2021 materials and slides.`,
      ),
      eventEditions: [
        {
          id: "summer-institute-2021",
          title: "High Performance Computing and Data Science Summer Institute",
          description: "Annual SDSC training event.",
          startAt: "2021-08-02T15:00:00Z",
          endAt: "2021-08-06T21:00:00Z",
          format: "online",
          location: "Remote event",
          eventUrl: null,
          registrationUrl: null,
          isTimeDisplayed: false,
        },
      ],
      resources: [
        {
          id: "summer-institute-repository",
          title: badge,
          type: "repository",
          url: "https://github.com/sdsc/sdsc-summer-institute-2021",
        },
      ],
    });

    expect(normalized).toEqual(
      expect.objectContaining({
        title: "High Performance Computing and Data Science Summer Institute",
        description: "SDSC Summer Institute 2021 materials and slides.",
      }),
    );
  });

  it("prioritizes a system named in the material title", () => {
    const normalized = normalizeMaterial({
      ...material(
        "expanse-material",
        "Expanse 101: Accessing and Running Jobs on Expanse",
        "Learn to use Expanse.",
      ),
      systems: [
        { id: "comet", name: "Comet" },
        { id: "expanse", name: "Expanse" },
      ],
    });

    expect(normalized.systems).toEqual(["Expanse", "Comet"]);
  });
});
