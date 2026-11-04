import {
  CATALOG_CACHE_TAG,
  CATALOG_DETAIL_TTL_SECONDS,
  CATALOG_LIST_TTL_SECONDS,
  catalogFetchOptions,
} from "../cache";

describe("catalog cache options", () => {
  it("uses a short shared catalog window for collection requests", () => {
    expect(catalogFetchOptions({ tags: ["catalog:materials"] })).toEqual({
      next: {
        revalidate: CATALOG_LIST_TTL_SECONDS,
        tags: [CATALOG_CACHE_TAG, "catalog:materials"],
      },
    });
  });

  it("uses a longer window for public detail requests", () => {
    expect(catalogFetchOptions({ detail: true })).toEqual({
      next: {
        revalidate: CATALOG_DETAIL_TTL_SECONDS,
        tags: [CATALOG_CACHE_TAG],
      },
    });
  });
});
