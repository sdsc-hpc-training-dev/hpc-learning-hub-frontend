import { getStartHereData } from "../api";

const gatewayMaterials = [
  {
    id: "20000013",
    title: "Expanse 101: Accessing and Running Jobs on Expanse",
    description: "Description 1",
    topics: [{ id: "topic-1", name: "MPI" }],
    systems: [{ id: "system-1", name: "Expanse" }],
    tools: [{ id: "tool-1", name: "Slurm" }],
    instructors: [],
    resources: [
      {
        id: "resource-1",
        title: "Recording",
        type: "video",
        url: "https://example.test/1",
      },
    ],
    eventEditions: [],
  },
  {
    id: "20000058",
    title: "Getting Started with Batch Job Scheduling: Slurm Edition",
    description: "Description 2",
    topics: [{ id: "topic-2", name: "Python" }],
    systems: [
      { id: "system-1", name: "Expanse" },
      { id: "system-2", name: "TSCC" },
    ],
    tools: [{ id: "tool-1", name: "Slurm" }],
    instructors: [],
    resources: [
      {
        id: "resource-2",
        title: "Repository",
        type: "repository",
        url: "https://example.test/2",
      },
    ],
    eventEditions: [],
  },
  {
    id: "20000070",
    title: "GPU Computing and Programming on Expanse",
    description: "Description 3",
    topics: [{ id: "topic-3", name: "GPU Programming" }],
    systems: [{ id: "system-1", name: "Expanse" }],
    tools: [{ id: "tool-3", name: "CUDA" }],
    instructors: [],
    resources: [
      {
        id: "resource-3",
        title: "Recording",
        type: "video",
        url: "https://example.test/3",
      },
    ],
    eventEditions: [],
  },
  {
    id: "material-4",
    title: "Material 4",
    description: "Description 4",
    topics: [{ id: "topic-4", name: "GPU Programming" }],
    systems: [{ id: "system-2", name: "TSCC" }],
    tools: [{ id: "tool-1", name: "Slurm" }],
    instructors: [],
    resources: [
      {
        id: "resource-4",
        title: "Slides",
        type: "slides",
        url: "https://example.test/4",
      },
    ],
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
      expect(data.browseOptions).toEqual([
        { type: "system", name: "Expanse", count: 3 },
        { type: "topic", name: "GPU Programming", count: 2 },
        { type: "tool", name: "Slurm", count: 3 },
        { type: "system", name: "TSCC", count: 2 },
      ]);
      expect(data.featuredMaterials.map((material) => material.id)).toEqual([
        "20000013",
        "20000058",
        "20000070",
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
