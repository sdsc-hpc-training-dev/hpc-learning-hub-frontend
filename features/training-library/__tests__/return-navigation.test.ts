import { catalogReturnTo, materialDetailsHref } from "../navigation";

describe("material return navigation", () => {
  const results = "/materials?query=Machine%20Learning&query=Containers&system=Comet&sort=date_desc&page=2";

  it("preserves phrases, filters, sort, pagination and hashes", () => {
    expect(catalogReturnTo(results + "#results")).toBe(results + "#results");
    const detail = new URL(materialDetailsHref("20000528", results), "https://catalog.invalid");
    expect(detail.pathname).toBe("/materials/20000528");
    expect(detail.searchParams.get("returnTo")).toBe(results);
    expect(catalogReturnTo([results])).toBe(results);
    expect(materialDetailsHref("example/id")).toBe("/materials/example%2Fid");
  });

  it.each([
    undefined, "", "https://evil.example/materials", "//evil.example/materials",
    "javascript:alert(1)", "/admin", "/materials/20000528", "/materials/../admin",
    "/\\evil.example/materials", "/materials%2F..%2Fadmin", "/materials?" + "x".repeat(8192),
  ])("falls back to the library for unsafe or missing destinations: %s", (value) => {
    expect(catalogReturnTo(value)).toBe("/materials");
  });
});
