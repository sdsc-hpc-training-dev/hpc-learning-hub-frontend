"use client";
/* eslint-disable sonarjs/no-nested-conditional */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
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

function normalizedTerms(terms: string[]) {
  const seen = new Set<string>();
  return terms.reduce<string[]>((result, term) => {
    const value = term.trim().slice(0, 100);
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key) || result.length >= 10) return result;
    seen.add(key);
    result.push(value);
    return result;
  }, []);
}

function filterValues(initialFilters: MaterialListFilters): FilterValues {
  const initialQuery = initialFilters.query;
  const queries = Array.isArray(initialQuery)
    ? initialQuery
    : initialQuery
      ? [initialQuery]
      : [];
  return {
    ...emptyFilterValues,
    ...Object.fromEntries(
      Object.entries(initialFilters).filter(([, value]) => value !== undefined),
    ),
    query: normalizedTerms(queries),
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
      return {
      key: key as Exclude<keyof FilterValues, "query">,
      value: `${filterLabels[key as Exclude<keyof FilterValues, "query">]}: ${
        key === "program"
          ? (programs.find((program) => program.id === selected)?.name ?? selected)
          : selected
      }`,
    }; });
  return [...terms, ...facets];
}

function useCatalogFilters(initialFilters: MaterialListFilters) {
  const pathname = usePathname();
  const router = useRouter();
  const currentQuery = useSearchParams().toString();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterValues>(() =>
    filterValues(initialFilters),
  );
  const commit = (nextFilters: FilterValues, page = 1) => {
    setFilters(nextFilters);
    startTransition(() => {
      router.replace(catalogUrl(pathname, currentQuery, nextFilters, page), {
        scroll: false,
      });
    });
  };
  const changeFilter = (
    key: Exclude<keyof FilterValues, "query">,
    value: string,
  ) => { commit({ ...filters, [key]: value }); };
  const changeQueries = (queries: string[]) => {
    commit({ ...filters, query: normalizedTerms(queries) });
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
      router.replace(catalogUrl(pathname, currentQuery, filters, nextPage), {
        scroll: false,
      });
    });
  };
  const reset = () => { commit({ ...emptyFilterValues }); };
  return {
    filters,
    changeFilter,
    changeQueries,
    removeFilter,
    changePage,
    reset,
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
