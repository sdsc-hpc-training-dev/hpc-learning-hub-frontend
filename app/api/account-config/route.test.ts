/** @jest-environment node */
import { GET } from "./route";
afterEach(() => {
  delete process.env.ENABLE_ACCOUNTS;
});
test("accounts are runtime opt-in and uncached", async () => {
  expect(await GET().json()).toEqual({ enabled: false });
  process.env.ENABLE_ACCOUNTS = "true";
  const result = GET();
  expect(await result.json()).toEqual({ enabled: true });
  expect(result.headers.get("Cache-Control")).toBe("no-store");
});
