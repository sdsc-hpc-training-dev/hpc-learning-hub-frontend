import { getTrainingLibraryData } from "../api";
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

describe("Training Library API search", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

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
