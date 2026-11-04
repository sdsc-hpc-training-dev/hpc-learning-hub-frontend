/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "./route";

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function request(body: unknown) {
  return new NextRequest("http://localhost/api/v1/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "session=private" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.GATEWAY_URL = "https://gateway.example/";
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

afterEach(() => {
  delete process.env.GATEWAY_URL;
});

it("forwards only the anonymous feedback payload and returns no-store acceptance", async () => {
  fetchMock.mockResolvedValue({ status: 201 } as Response);
  const response = await POST(request({ rating: 5, foundWhatNeeded: null, workedWell: "Useful", improvements: null }));
  expect(response.status).toBe(201);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ accepted: true });
  expect(fetchMock).toHaveBeenCalledWith("https://gateway.example/api/v1/feedback", expect.objectContaining({
    credentials: "omit",
    cache: "no-store",
  }));
  const init = fetchMock.mock.calls[0]?.[1];
  expect(new Headers(init?.headers).has("Cookie")).toBe(false);
});

it("rejects unknown client fields without calling the gateway", async () => {
  const response = await POST(request({ rating: 5, identity: "not allowed" }));
  expect(response.status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("rejects a raw body above the route limit before parsing or proxying", async () => {
  const response = await POST(request({ rating: 5, workedWell: "x".repeat(8200) }));
  expect(response.status).toBe(413);
  expect(fetchMock).not.toHaveBeenCalled();
});
