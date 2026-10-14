"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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

function filterValues(initialFilters: MaterialListFilters): FilterValues {
  return Object.fromEntries(
    Object.keys(emptyFilterValues).map((key) => [
      key,
      initialFilters[key as keyof FilterValues] ?? "",
    ]),
  ) as FilterValues;
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

function activeFilterEntries(
  filters: FilterValues,
  programs: GatewayEventSeries[],
) {
  return Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key,
      value:
        key === "program"
          ? (programs.find((program) => program.id === value)?.name ?? value)
          : value,
    }));
}

function useCatalogFilters(initialFilters: MaterialListFilters) {
  const pathname = usePathname();
  const router = useRouter();
  const currentQuery = useSearchParams().toString();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FilterValues>(() =>
    filterValues(initialFilters),
  );
  const filterQuery = JSON.stringify(filters);
  const initialQuery = JSON.stringify(filterValues(initialFilters));
  useEffect(() => {
    if (filterQuery === initialQuery) return;
    const timeout = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          catalogUrl(
            pathname,
            currentQuery,
            JSON.parse(filterQuery) as FilterValues,
          ),
          { scroll: false },
        );
      });
    }, 300);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [filterQuery, initialQuery, pathname, currentQuery, router]);
  const changeFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };
  const changePage = (nextPage: number) => {
    startTransition(() => {
      router.replace(catalogUrl(pathname, currentQuery, filters, nextPage), {
        scroll: false,
      });
    });
  };
  const reset = () => {
    setFilters({ ...emptyFilterValues });
    startTransition(() => {
      router.replace(catalogUrl(pathname, currentQuery, emptyFilterValues), {
        scroll: false,
      });
    });
  };
  return {
    filters,
    changeFilter,
    changePage,
    reset,
    pending: pending || filterQuery !== initialQuery,
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
  const { filters, changeFilter } = navigation;
  return (
    <TrainingLibraryView
      materials={materials}
      total={total}
      error={initialError}
      activeFilters={activeFilterEntries(filters, programs)}
      onRemoveFilter={(key) => {
        changeFilter(key, "");
      }}
      onReset={navigation.reset}
      searchValue={filters.query}
      onSearch={(value) => {
        changeFilter("query", value);
      }}
      filters={filterOptions(facets, programs, filters)}
      values={filters}
      onChange={changeFilter}
      page={page}
      totalPages={totalPages}
      pending={navigation.pending}
      onPageChange={navigation.changePage}
    />
  );
}
