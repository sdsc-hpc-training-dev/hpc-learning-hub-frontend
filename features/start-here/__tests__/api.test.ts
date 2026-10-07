import { getStartHereData } from "../api";

const gatewayMaterials = [
  {
    id: "material-1",
    title: "Material 1",
    description: "Description 1",
    topics: [{ id: "topic-1", name: "MPI" }],
    systems: [{ id: "system-1", name: "Expanse" }],
    tools: [{ id: "tool-1", name: "Slurm" }],
    instructors: [],
    resources: [],
    eventEditions: [],
  },
  {
    id: "material-2",
    title: "Material 2",
    description: "Description 2",
    topics: [{ id: "topic-2", name: "Python" }],
    systems: [{ id: "system-2", name: "Comet" }],
    tools: [{ id: "tool-2", name: "Jupyter" }],
    instructors: [],
    resources: [],
    eventEditions: [],
  },
  {
    id: "material-3",
    title: "Material 3",
    description: "Description 3",
    topics: [{ id: "topic-3", name: "GPU" }],
    systems: [{ id: "system-1", name: "Expanse" }],
    tools: [{ id: "tool-3", name: "CUDA" }],
    instructors: [],
    resources: [],
    eventEditions: [],
  },
  {
    id: "material-4",
    title: "Material 4",
    description: "Description 4",
    topics: [{ id: "topic-4", name: "Data" }],
    systems: [],
    tools: [],
    instructors: [],
    resources: [],
    eventEditions: [],
  },
  {
    id: "material-5",
    title: "Material 5",
    description: "Description 5",
    topics: [],
    systems: [],
    tools: [],
    instructors: [],
    resources: [],
    eventEditions: [],
  },
];

const gatewayLearningPaths = [
  { id: "path-1", title: "Path 1" },
  { id: "path-2", title: "Path 2" },
  { id: "path-3", title: "Path 3" },
  { id: "path-4", title: "Path 4" },
];

const gatewayEvents = [
  {
    id: "event-1",
    title: "Upcoming Workshop",
    description: "Learn with SDSC.",
    startAt: new Date(Date.now() + 86_400_000).toISOString(),
    endAt: null,
    format: "Workshop",
    location: "Online",
  },
];

const gatewayPrograms = [
  { id: "series-1", name: "Series 1" },
  { id: "series-2", name: "Series 2" },
  { id: "series-3", name: "Series 3" },
  { id: "series-4", name: "Series 4" },
];

function gatewayFixture(url: string): unknown {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith("/materials")) {
    return {
      items: gatewayMaterials,
      page: 1,
      pageSize: 100,
      total: gatewayMaterials.length,
      totalPages: 1,
    };
  }
  if (pathname.endsWith("/learning-paths")) return gatewayLearningPaths;
  if (pathname.endsWith("/event-editions")) return gatewayEvents;
  if (pathname.endsWith("/event-series")) return gatewayPrograms;
  return [];
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function installGatewayMock(): () => void {
  const originalFetch = global.fetch;
  const originalGatewayUrl = process.env.GATEWAY_URL;
  process.env.GATEWAY_URL = "https://gateway.test";
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = requestUrl(input);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(gatewayFixture(url)),
    } as Response);
  });

  return () => {
    global.fetch = originalFetch;
    if (originalGatewayUrl === undefined) delete process.env.GATEWAY_URL;
    else process.env.GATEWAY_URL = originalGatewayUrl;
  };
}

describe("Start Here data", () => {
  it("returns empty collections when the optional Gateway is unavailable", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("Gateway unavailable"));

    try {
      await expect(getStartHereData()).resolves.toEqual({
        browseOptions: [],
        featuredMaterials: [],
        learningPaths: [],
        upcomingEvents: [],
        programs: [],
        errors: [
          "Training materials could not be loaded.",
          "Learning paths could not be loaded.",
          "Upcoming events could not be loaded.",
          "Programs could not be loaded.",
        ],
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("selects browse filters and featured items from the full Gateway collections", async () => {
    const restoreGateway = installGatewayMock();
    try {
      const data = await getStartHereData();
      expect(data.browseOptions).toHaveLength(4);
      expect(data.featuredMaterials.map((material) => material.id)).toEqual([
        "material-1",
        "material-2",
        "material-3",
      ]);
      expect(data.learningPaths.map((path) => path.id)).toEqual([
        "path-1",
        "path-2",
        "path-3",
      ]);
      expect(data.upcomingEvents.map((event) => event.id)).toEqual(["event-1"]);
      expect(data.programs.map((program) => program.id)).toEqual([
        "series-1",
        "series-2",
        "series-3",
      ]);
      expect(data.errors).toEqual([]);
    } finally {
      restoreGateway();
    }
  });
});
