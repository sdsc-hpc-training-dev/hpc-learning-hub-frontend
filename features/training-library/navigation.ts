export const MATERIALS_PAGE_SIZE = 10;

export function catalogReturnTo(value?: string | string[]): string {
  const target = Array.isArray(value) ? value[0] : value;
  if (!target?.startsWith("/") || target.length > 8192) return "/materials";
  try {
    const url = new URL(target, "https://catalog.invalid");
    if (url.origin !== "https://catalog.invalid" || url.pathname !== "/materials") {
      return "/materials";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/materials";
  }
}

export function materialDetailsHref(materialId: string, returnTo?: string) {
  const path = `/materials/${encodeURIComponent(materialId)}`;
  if (!returnTo) return path;
  return `${path}?${new URLSearchParams({ returnTo: catalogReturnTo(returnTo) })}`;
}

export const emptyFilterValues = {
  query: [] as string[],
  topic: "",
  tool: "",
  system: "",
  program: "",
  resource: "",
  date: "",
  sort: "recommended",
};
export type FilterValues = typeof emptyFilterValues;

export function catalogPage(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

// Rebuilding repeated query values while retaining unrelated URL state has a
// small, deliberate branch count.
// eslint-disable-next-line complexity
export function catalogUrl(
  pathname: string,
  currentQuery: string,
  filters: FilterValues,
  page = 1,
) {
  const params = new URLSearchParams(currentQuery);
  // Rebuild catalog-owned parameters so repeated query values do not retain
  // stale phrases while preserving unrelated parameters.
  for (const key of Object.keys(emptyFilterValues)) params.delete(key);
  for (const [key, value] of Object.entries(filters)) {
    if (key === "query") {
      for (const phrase of value as string[]) params.append("query", phrase);
    } else if (typeof value === "string" && value.trim()) {
      if (key !== "sort" || value !== "recommended") params.set(key, value.trim());
    }
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  return params.size ? `${pathname}?${params}` : pathname;
}
