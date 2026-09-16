import { getStartHereData } from "../api";

describe("Start Here data", () => {
	it("returns empty collections when the optional Gateway is unavailable", async () => {
		const originalFetch = global.fetch;
		global.fetch = jest.fn().mockRejectedValue(new Error("Gateway unavailable"));

		await expect(getStartHereData()).resolves.toEqual({
			browseOptions: [],
			featuredMaterials: [],
			upcomingEvents: [],
			learningPaths: [],
			programs: [],
		});

		global.fetch = originalFetch;
	});
});