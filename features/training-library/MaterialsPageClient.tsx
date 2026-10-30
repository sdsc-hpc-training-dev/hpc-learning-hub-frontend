"use client";
/* eslint-disable sonarjs/no-nested-conditional */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import TrainingLibraryView from "./TrainingLibraryView";
import type { CatalogMaterial, GatewayEventSeries } from "@/lib/gateway/types";
import type { CatalogFacets, MaterialListFilters } from "./api";
import { publicResourceTypeLabel } from "./presentation";
import { catalogUrl, emptyFilterValues, type FilterValues } from "./navigation";

interface MaterialsPageClientProps {
  materials: CatalogMaterial[];
  total?: number;
  page?: number;
  totalPages?: number;
  programs?: GatewayEventSeries[];
  facets?: CatalogFacets;
  initialFilters?: MaterialListFilters;
  initialError?: string;
}

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizedTerms(terms: string[]) {
  const seen = new Set<string>();
  return terms.reduce<string[]>((result, term) => {
    const value = normalizeWhitespace(term);
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key)) return result;
    seen.add(key);
    result.push(value);
    return result;
  }, []);
}

type TermValidation = { terms: string[] } | { error: string };

function validatedTerms(terms: string[]): TermValidation {
  if (terms.some((term) => normalizeWhitespace(term).length > 100)) {
    return { error: "Each search term must be 100 characters or fewer." };
  }
  const normalized = normalizedTerms(terms);
  if (normalized.length > 10) {
    return { error: "Use at most 10 search terms." };
  }
  return { terms: normalized };
}

function filterValues(initialFilters: MaterialListFilters): FilterValues {
  const initialQuery = initialFilters.query;
  const queries = Array.isArray(initialQuery)
    ? initialQuery
    : initialQuery
      ? [initialQuery]
      : [];
  return {
    query: normalizedTerms(queries),
    topic: initialFilters.topic ?? "",
    tool: initialFilters.tool ?? "",
    system: initialFilters.system ?? "",
    program: initialFilters.program ?? "",
    resource: initialFilters.resource ?? "",
    date: initialFilters.date ?? "",
    sort: initialFilters.sort ?? emptyFilterValues.sort,
  };
}

function namedOptions(items: CatalogFacets["topics"], selected: string) {
  const options = items.map(({ name }) => ({ label: name, value: name }));
  if (selected && !options.some((option) => option.value === selected)) {
    options.push({
      label: items.find((item) => item.id === selected)?.name ?? selected,
      value: selected,
    });
  }
  return options;
}

function filterOptions(
  facets: CatalogFacets,
  programs: GatewayEventSeries[],
  filters: FilterValues,
) {
  return {
    topics: namedOptions(facets.topics, filters.topic),
    tools: namedOptions(facets.tools, filters.tool),
    systems: namedOptions(facets.systems, filters.system),
    programs: programs.map(({ id, name }) => ({ label: name, value: id })),
    resourceTypes: [
      "repository",
      "repository_session",
      "slides",
      "transcript",
      "video",
      "webpage",
    ].map((value) => ({
      label: publicResourceTypeLabel(value) ?? value,
      value,
    })),
  };
}

const filterLabels: Record<Exclude<keyof FilterValues, "query">, string> = {
  topic: "Topic",
  tool: "Tool",
  system: "System",
  program: "Program",
  resource: "Resource",
  date: "Date",
  sort: "Sort",
};

function sortChipLabel(value: string) {
  switch (value) {
    case "title": return "Title A–Z";
    case "date_desc": return "Newest First";
    case "date_asc": return "Oldest First";
    default: return value;
  }
}

function activeFilterEntries(
  filters: FilterValues,
  programs: GatewayEventSeries[],
) {
  const terms = filters.query.map((value) => ({
    key: "query" as const,
    value,
  }));
  const facets = (Object.entries(filters) as [keyof FilterValues, string | string[]][])
    .filter(([key, value]) => key !== "query" && value && value !== "recommended")
    .map(([key, value]) => {
      const selected = String(value);
      const displayValue =
        key === "program"
          ? (programs.find((program) => program.id === selected)?.name ?? selected)
          : key === "resource"
            ? (publicResourceTypeLabel(selected) ?? selected)
            : key === "sort"
              ? sortChipLabel(selected)
              : selected;
      return {
      key: key as Exclude<keyof FilterValues, "query">,
      value: `${filterLabels[key as Exclude<keyof FilterValues, "query">]}: ${displayValue}`,
    }; });
  return [...terms, ...facets];
}

function useServerFilters(initialFilters: MaterialListFilters) {
  const serverFilterKey = JSON.stringify(initialFilters);
  const serverFilters = useMemo(() => filterValues(initialFilters), [serverFilterKey]);
  const [filters, setFilters] = useState<FilterValues>(serverFilters);
  useEffect(() => {
    setFilters(serverFilters);
  }, [serverFilters]);
  return [filters, setFilters] as const;
}

function useCatalogFilters(initialFilters: MaterialListFilters) {
  const pathname = usePathname();
  const router = useRouter();
  const currentQuery = useSearchParams().toString();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useServerFilters(initialFilters);
  const [termError, setTermError] = useState<string>();
  const [resetVersion, setResetVersion] = useState(0);
  const commit = (nextFilters: FilterValues, page = 1) => {
    setFilters(nextFilters);
    startTransition(() => {
      router.push(catalogUrl(pathname, currentQuery, nextFilters, page), {
        scroll: false,
      });
    });
  };
  const changeFilter = (key: Exclude<keyof FilterValues, "query">, value: string) => { commit({ ...filters, [key]: value }); };
  const changeQueries = (queries: string[]) => {
    const validated = validatedTerms(queries);
    if ("error" in validated) {
      setTermError(validated.error);
      return false;
    }
    setTermError(undefined);
    commit({ ...filters, query: validated.terms });
    return true;
  };
  const removeFilter = (key: keyof FilterValues, value?: string) => {
    if (key === "query") {
      changeQueries(filters.query.filter((term) => term !== value));
      return;
    }
    changeFilter(key, key === "sort" ? "recommended" : "");
  };
  const changePage = (nextPage: number) => {
    startTransition(() => {
      router.push(catalogUrl(pathname, currentQuery, filters, nextPage), {
        scroll: false,
      });
    });
  };
  const reset = () => {
    setTermError(undefined);
    setResetVersion((current) => current + 1);
    commit({ ...emptyFilterValues });
  };
  return {
    filters,
    changeFilter,
    changeQueries,
    removeFilter,
    changePage,
    reset,
    termError,
    resetVersion,
    pending,
  };
}

export default function MaterialsPageClient({
  materials,
  total = materials.length,
  page = 1,
  totalPages = 1,
  programs = [],
  facets = { topics: [], tools: [], systems: [] },
  initialFilters = {},
  initialError,
}: Readonly<MaterialsPageClientProps>) {
  const navigation = useCatalogFilters(initialFilters);
  const { filters } = navigation;
  return (
    <TrainingLibraryView
      materials={materials}
      total={total}
      error={initialError}
      activeFilters={activeFilterEntries(filters, programs)}
      onRemoveFilter={navigation.removeFilter}
      onReset={navigation.reset}
      searchTerms={filters.query}
      onSearch={navigation.changeQueries}
      searchError={navigation.termError}
      resetVersion={navigation.resetVersion}
      filters={filterOptions(facets, programs, filters)}
      values={filters}
      onChange={navigation.changeFilter}
      page={page}
      totalPages={totalPages}
      pending={navigation.pending}
      onPageChange={navigation.changePage}
    />
  );
}
