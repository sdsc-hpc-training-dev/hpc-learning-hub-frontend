import { getTrainingLibraryData, normalizeMaterial } from "../api";
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

function searchPage(isSecondPage: boolean) {
  return responseWith({
    items: isSecondPage
      ? [
          material(
            "description-match",
            "Scheduling compute jobs",
            "An introduction to batch computing.",
          ),
          material("cross-field-only", "Batch", "Computing jobs"),
        ]
      : [
          material(
            "title-match",
            "Batch Computing with Slurm",
            "Scheduling jobs on shared systems.",
          ),
          material(
            "metadata-only",
            "Scheduling compute jobs",
            "Learn to schedule compute jobs.",
          ),
        ],
    page: isSecondPage ? 2 : 1,
    pageSize: 100,
    total: 4,
    totalPages: 2,
  });
}

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

describe("Training Library API search", () => {
  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
    fetchMock.mockImplementation((input) => {
      return Promise.resolve(searchPage(requestUrl(input).includes("page=2")));
    });
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("queries every Gateway page and keeps title or description matches", async () => {
    const result = await getTrainingLibraryData({ query: "batch computing" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example/api/v1/materials?search=batch+computing&page=1&pageSize=100",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example/api/v1/materials?search=batch+computing&page=2&pageSize=100",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(result.materials.map(({ id }) => id)).toEqual([
      "title-match",
      "description-match",
    ]);
    expect(result.total).toBe(2);
  });

  it("filters materials by the selected event-series ID", async () => {
    await getTrainingLibraryData({ program: "series-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("eventSeries=series-1"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });
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
