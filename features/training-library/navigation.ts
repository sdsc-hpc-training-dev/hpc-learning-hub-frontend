export const MATERIALS_PAGE_SIZE = 10;
export const emptyFilterValues = {
  query: "",
  topic: "",
  tool: "",
  system: "",
  program: "",
  resource: "",
  date: "",
};
export type FilterValues = typeof emptyFilterValues;

export function catalogPage(value?: string): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function catalogUrl(
  pathname: string,
  currentQuery: string,
  filters: FilterValues,
  page = 1,
) {
  const params = new URLSearchParams(currentQuery);
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim());
    else params.delete(key);
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  return params.size ? `${pathname}?${params}` : pathname;
}
