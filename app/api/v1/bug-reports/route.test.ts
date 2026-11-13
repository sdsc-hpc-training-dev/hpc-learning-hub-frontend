/** @jest-environment node */
import { NextRequest } from "next/server";
import { POST } from "./route";

const upstream = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const report = { title: "Search filter", description: "It cleared unexpectedly" };

function request(body: string, type = "application/json") {
  return new NextRequest("http://localhost/api/v1/bug-reports", {
    method: "POST",
    headers: { "Content-Type": type, Cookie: "session=private" },
    body,
  });
}

beforeEach(() => {
  process.env.BUG_REPORT_LOCAL_RELAY = "true";
  process.env.GATEWAY_URL = "https://gateway.example";
  upstream.mockReset();
  global.fetch = upstream;
});

afterEach(() => {
  delete process.env.BUG_REPORT_LOCAL_RELAY;
  delete process.env.GATEWAY_URL;
});

it("keeps the relay disabled unless explicitly enabled for local testing", async () => {
  delete process.env.BUG_REPORT_LOCAL_RELAY;
  expect((await POST(request(JSON.stringify(report)))).status).toBe(404);
  expect(upstream).not.toHaveBeenCalled();
});

it("relays the report without cookies or redirects and returns no-store acceptance", async () => {
  upstream.mockResolvedValue(new Response(null, { status: 201 }));
  const response = await POST(request(JSON.stringify(report)));
  expect(response.status).toBe(201);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ accepted: true });
  expect(upstream).toHaveBeenCalledWith(new URL("https://gateway.example/api/v1/bug-reports"), expect.objectContaining({
    credentials: "omit", redirect: "error", body: JSON.stringify(report),
  }));
  expect(new Headers(upstream.mock.calls[0]?.[1]?.headers).has("Cookie")).toBe(false);
});

it.each([
  ["{", "application/json", 400],
  ["[]", "application/json", 400],
  ["null", "application/json", 400],
  ['{"email":"private@example.test"}', "application/json", 400],
  ["x".repeat(8193), "application/json", 413],
  ["{}", "text/plain", 415],
])("rejects invalid requests without contacting the Gateway", async (body, type, status) => {
  expect((await POST(request(body, type))).status).toBe(status);
  expect(upstream).not.toHaveBeenCalled();
});

it("redacts upstream errors, but preserves a rate-limit status", async () => {
  upstream.mockResolvedValueOnce(new Response("private", { status: 500 }));
  const error = await POST(request(JSON.stringify(report)));
  expect(error.status).toBe(503);
  expect(await error.text()).not.toContain("private");
  upstream.mockResolvedValueOnce(new Response(null, { status: 429 }));
  expect((await POST(request(JSON.stringify(report)))).status).toBe(429);
  upstream.mockRejectedValueOnce(new Error("private"));
  expect((await POST(request(JSON.stringify(report)))).status).toBe(503);
  delete process.env.GATEWAY_URL;
  expect((await POST(request(JSON.stringify(report)))).status).toBe(503);
});
