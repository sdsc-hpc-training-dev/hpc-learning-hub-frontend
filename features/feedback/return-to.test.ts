import { safeReturnTo } from "./return-to";

it("preserves allowed public destinations and search parameters", () => {
  expect(safeReturnTo("/materials?query=HPC&topic=AI")).toBe("/materials?query=HPC&topic=AI");
  expect(safeReturnTo("/events?page=2")).toBe("/events?page=2");
});

it.each([undefined, "https://evil.example/", "//evil.example/", "/\\evil.example", "/materials/../account", "/feedback", "/materials#fragment", "/%2f%2fevil.example", "/materials\n"]) ("falls back for unsafe destination %s", (value) => {
  expect(safeReturnTo(value)).toBe("/");
});
