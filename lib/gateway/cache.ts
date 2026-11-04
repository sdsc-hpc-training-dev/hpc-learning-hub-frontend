export const CATALOG_CACHE_TAG = "catalog";
export const CATALOG_LIST_TTL_SECONDS = 300;
export const CATALOG_DETAIL_TTL_SECONDS = 3600;

interface CatalogCacheOptions {
  detail?: boolean;
  tags?: string[];
}

export function catalogFetchOptions({
  detail = false,
  tags = [],
}: CatalogCacheOptions = {}) {
  return {
    next: {
      revalidate: detail
        ? CATALOG_DETAIL_TTL_SECONDS
        : CATALOG_LIST_TTL_SECONDS,
      tags: [CATALOG_CACHE_TAG, ...tags],
    },
  };
}
