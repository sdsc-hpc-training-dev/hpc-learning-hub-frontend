/** @jest-environment node */

import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { POST } from "./route";

jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }));

describe("catalog cache invalidation route", () => {
  const originalSecret = process.env.CACHE_REVALIDATION_SECRET;

  afterEach(() => {
    jest.mocked(revalidateTag).mockReset();
    if (originalSecret === undefined) {
      delete process.env.CACHE_REVALIDATION_SECRET;
    } else {
      process.env.CACHE_REVALIDATION_SECRET = originalSecret;
    }
  });

  it("fails closed when no invalidation secret is configured", () => {
    delete process.env.CACHE_REVALIDATION_SECRET;
    const response = POST(
      new NextRequest("http://localhost/api/internal/revalidate-catalog", {
        method: "POST",
      }),
    );

    expect(response.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects an invalid secret", () => {
    process.env.CACHE_REVALIDATION_SECRET = "correct-secret";
    const response = POST(
      new NextRequest("http://localhost/api/internal/revalidate-catalog", {
        method: "POST",
        headers: { "x-revalidation-secret": "wrong-secret" },
      }),
    );

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("invalidates the shared catalog tag for a valid secret", () => {
    process.env.CACHE_REVALIDATION_SECRET = "correct-secret";
    const response = POST(
      new NextRequest("http://localhost/api/internal/revalidate-catalog", {
        method: "POST",
        headers: { "x-revalidation-secret": "correct-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("catalog", "max");
  });
});
