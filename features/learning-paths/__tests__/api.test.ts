import { getLearningPath, getLearningPaths } from "../api";
import type { LearningPath } from "@/lib/gateway/types";

const samplePath: LearningPath = {
  id: "new-to-hpc",
  title: "New to HPC",
  description: "Build a practical foundation.",
  audience: "New HPC learners",
  prerequisites: "None",
  estimatedScope: "Four guided steps",
  items: [],
};

function responseWith(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () =>
      Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  } as Response;
}

describe("learning paths API", () => {
  const fetchMock = jest.fn<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >();

  beforeEach(() => {
    process.env.GATEWAY_URL = "https://gateway.example";
    global.fetch = fetchMock;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.GATEWAY_URL;
  });

  it("loads the public learning path collection", async () => {
    fetchMock.mockResolvedValue(responseWith([samplePath]));

    await expect(getLearningPaths()).resolves.toEqual([samplePath]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example/api/v1/learning-paths",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("encodes an opaque path identifier", async () => {
    fetchMock.mockResolvedValue(responseWith(samplePath));

    await expect(getLearningPath("path/one")).resolves.toEqual(samplePath);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://gateway.example/api/v1/learning-paths/path%2Fone",
      expect.any(Object),
    );
  });

  it("returns null when a path does not exist", async () => {
    fetchMock.mockResolvedValue(responseWith({}, 404));
    await expect(getLearningPath("missing")).resolves.toBeNull();
  });

  it("surfaces other gateway failures", async () => {
    fetchMock.mockResolvedValue(responseWith({}, 503));
    await expect(getLearningPath("new-to-hpc")).rejects.toMatchObject({
      status: 503,
    });
  });
});
