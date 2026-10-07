/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { createServer } from "node:http";

const program = { id: "a11y-program", name: "HPC workshops" };
const pastEvent = {
  id: "a11y-recording",
  title: "Batch computing workshop",
  description: "An introduction to batch computing.",
  startAt: "2024-03-21T18:00:00Z",
  endAt: "2024-03-21T19:00:00Z",
  format: "online",
  location: "Online",
};
const materials = [
  {
    id: "a11y-material",
    title: "Introduction to HPC computing",
    description: "Learn batch computing with Slurm on Expanse.",
    topics: [{ id: "hpc", name: "High Performance Computing" }],
    tools: [{ id: "slurm", name: "Slurm" }],
    systems: [{ id: "expanse", name: "Expanse" }],
    instructors: [{ id: "instructor", name: "Workshop instructor" }],
    eventEditions: [pastEvent],
    resources: [
      {
        id: "video",
        title: "Recording",
        type: "video",
        url: "https://www.sdsc.edu/",
      },
      {
        id: "slides",
        title: "Slides",
        type: "slides",
        url: "https://www.sdsc.edu/",
      },
    ],
  },
];
const learningPath = {
  id: "a11y-path",
  title: "Getting started with HPC",
  description: "A practical introduction to HPC computing.",
  audience: "Beginners",
  prerequisites: "None",
  estimatedScope: "One workshop",
  items: [{ position: 1, material: materials[0] }],
};

// Each endpoint intentionally returns its own API response shape.
// eslint-disable-next-line sonarjs/function-return-type
function fixtureResponse(url) {
  switch (url.pathname) {
    case "/api/v1/materials": {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const items = materials.filter((material) =>
        `${material.title} ${material.description}`
          .toLowerCase()
          .includes(search),
      );
      return {
        items,
        page: 1,
        pageSize: 100,
        total: items.length,
        totalPages: 1,
      };
    }
    case "/api/v1/materials/a11y-material":
      return materials[0];
    case "/api/v1/event-series":
      return [program];
    case "/api/v1/event-editions":
      return [
        pastEvent,
        {
          ...pastEvent,
          id: "a11y-upcoming",
          title: "Upcoming HPC workshop",
          startAt: "2099-01-10T18:00:00Z",
          endAt: "2099-01-10T19:00:00Z",
        },
      ];
    case "/api/v1/learning-paths":
      return [learningPath];
    case "/api/v1/learning-paths/a11y-path":
      return learningPath;
    default:
      return null;
  }
}

export async function startFixtureGateway() {
  const server = createServer((request, response) => {
    const data = fixtureResponse(new URL(request.url, "http://127.0.0.1"));
    response.writeHead(data === null ? 404 : 200, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify(data));
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    url: `http://127.0.0.1:${String(server.address().port)}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}
