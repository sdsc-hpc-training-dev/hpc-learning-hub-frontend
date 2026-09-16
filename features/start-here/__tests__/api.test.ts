import { getStartHereData } from "../api";

describe("Start Here data", () => {
	it("returns empty collections when the optional Gateway is unavailable", async () => {
		const originalFetch = global.fetch;
		global.fetch = jest.fn().mockRejectedValue(new Error("Gateway unavailable"));

		await expect(getStartHereData()).resolves.toEqual({
			browseOptions: [],
			featuredMaterials: [],
			recordings: [],
			upcomingEvents: [],
			learningPaths: [],
			programs: [],
		});

		global.fetch = originalFetch;
	});

	it("selects browse filters, featured materials, recordings, and paths from full collections", async () => {
		const originalFetch = global.fetch;
		const originalGatewayUrl = process.env.GATEWAY_URL;
		process.env.GATEWAY_URL = "https://gateway.test";
		const materials = [
			{ id: "material-1", title: "Material 1", topics: ["MPI"], systems: ["Expanse"], tools: ["Slurm"], content_type: "tutorial" },
			{ id: "material-2", title: "Material 2", topics: ["Python"], systems: ["Comet"], tools: ["Jupyter"], content_type: "recording" },
			{ id: "material-3", title: "Material 3", topics: ["GPU"], systems: ["Expanse"], tools: ["CUDA"], content_type: "recording" },
			{ id: "material-4", title: "Material 4", topics: ["Data"], content_type: "recording" },
			{ id: "material-5", title: "Material 5", content_type: "recording" },
		];
		const learningPaths = [
			{ id: "path-1", title: "Path 1" },
			{ id: "path-2", title: "Path 2" },
			{ id: "path-3", title: "Path 3" },
			{ id: "path-4", title: "Path 4" },
		];

		global.fetch = jest.fn((input: RequestInfo | URL) => {
			let path: string;
			if (typeof input === "string") path = input;
			else if (input instanceof URL) path = input.toString();
			else path = input.url;
			let payload: unknown[] = [];
			if (path.includes("/materials")) payload = materials;
			else if (path.includes("/learning-paths")) payload = learningPaths;
			return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) } as Response);
		});

		try {
			const data = await getStartHereData();
			expect(data.browseOptions).toHaveLength(4);
			expect(data.featuredMaterials.map((material) => material.id)).toEqual(["material-1", "material-2", "material-3"]);
			expect(data.recordings.map((material) => material.id)).toEqual(["material-2", "material-3", "material-4"]);
			expect(data.learningPaths.map((path) => path.id)).toEqual(["path-1", "path-2", "path-3"]);
		} finally {
			global.fetch = originalFetch;
			if (originalGatewayUrl === undefined) delete process.env.GATEWAY_URL;
			else process.env.GATEWAY_URL = originalGatewayUrl;
		}
	});
});