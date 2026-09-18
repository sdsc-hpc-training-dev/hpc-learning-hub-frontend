import { gatewayFetch, GatewayRequestError } from "../client";

describe("gateway client", () => {
	let fetchMock: jest.MockedFunction<typeof fetch>;

	beforeEach(() => {
		delete process.env.GATEWAY_URL;
		delete process.env.NEXT_PUBLIC_GATEWAY_URL;
		fetchMock = jest.fn<typeof fetch>();
		global.fetch = fetchMock;
	});

	it("rejects when no gateway URL is configured", async () => {
		await expect(gatewayFetch("materials")).rejects.toMatchObject({
			message: "Gateway URL is not configured",
			status: 500,
		});
	});

	it("fetches JSON and normalizes the API path", async () => {
		process.env.GATEWAY_URL = "https://gateway.example/";
		fetchMock.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: "ok" }),
		} as Response);

		await expect(gatewayFetch<{ data: string }>("api/v1/materials", {
			headers: { Authorization: "Bearer test" },
		})).resolves.toEqual({ data: "ok" });

		const [requestUrl, requestInit] = fetchMock.mock.calls[0];
		expect(requestUrl).toBe("https://gateway.example/api/v1/materials");
		expect(requestInit?.headers).toBeInstanceOf(Headers);
	});

	it("uses the public gateway URL fallback", async () => {
		process.env.NEXT_PUBLIC_GATEWAY_URL = "https://public-gateway.example";
		fetchMock.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true }),
		} as Response);

		await expect(gatewayFetch("/health")).resolves.toEqual({ ok: true });
	});

	it("raises the response message for failed requests", async () => {
		process.env.GATEWAY_URL = "https://gateway.example";
		fetchMock.mockResolvedValue({
			ok: false,
			status: 503,
			text: () => Promise.resolve("service unavailable"),
		} as Response);

		await expect(gatewayFetch("health")).rejects.toEqual(new GatewayRequestError("service unavailable", 503));
	});

	it("uses a fallback message when a failed response has no body", async () => {
		process.env.GATEWAY_URL = "https://gateway.example";
		fetchMock.mockResolvedValue({
			ok: false,
			status: 500,
			text: () => Promise.resolve(""),
		} as Response);

		await expect(gatewayFetch("health")).rejects.toEqual(new GatewayRequestError("Gateway request failed", 500));
	});
});
