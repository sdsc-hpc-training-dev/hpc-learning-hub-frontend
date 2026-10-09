"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import TrainingLibraryView from "./TrainingLibraryView";
import type { CatalogMaterial, GatewayEventSeries } from "@/lib/gateway/types";
import type { MaterialListFilters } from "./api";
import { publicResourceTypeLabel } from "./presentation";

const MATERIALS_PER_PAGE = 24;

const emptyFilterValues = {
  query: "",
  topic: "",
  tool: "",
  system: "",
  program: "",
  resource: "",
  date: "",
};

function initialFilterState(filters: MaterialListFilters = {}) {
  return {
    ...emptyFilterValues,
    ...filters,
    query: filters.query ?? "",
    topic: filters.topic ?? "",
    tool: filters.tool ?? "",
    system: filters.system ?? "",
    program: filters.program ?? "",
    resource: filters.resource ?? "",
    date: filters.date ?? "",
  };
}

function normalizeMaterials(materials: CatalogMaterial[]) {
  return materials.map((material) => ({
    ...material,
    topics: Array.isArray(material.topics) ? material.topics : [],
    tools: Array.isArray(material.tools) ? material.tools : [],
    systems: Array.isArray(material.systems) ? material.systems : [],
    instructors: Array.isArray(material.instructors)
      ? material.instructors
      : [],
    resources: Array.isArray(material.resources) ? material.resources : [],
  }));
}

function hasCaseInsensitiveValue(values: string[], value: string) {
  const normalizedValue = value.toLocaleLowerCase();
  return values.some((item) => item.toLocaleLowerCase() === normalizedValue);
}

function matchesDate(material: CatalogMaterial, date: string) {
  const materialDate = material.date
    ? new Date(material.date).toISOString().slice(0, 10)
    : "";
  return !date || materialDate === date;
}

function matchesFilters(
  material: CatalogMaterial,
  filters: typeof emptyFilterValues,
) {
  return [
    !filters.topic || hasCaseInsensitiveValue(material.topics, filters.topic),
    !filters.tool || hasCaseInsensitiveValue(material.tools, filters.tool),
    !filters.system ||
      hasCaseInsensitiveValue(material.systems, filters.system),
    !filters.resource ||
      material.resources.some(
        (resource) =>
          resource.type.toLocaleLowerCase() ===
          filters.resource.toLocaleLowerCase(),
      ),
    matchesDate(material, filters.date),
  ].every(Boolean);
}

function activeFilterEntries(
  filters: typeof emptyFilterValues,
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

function filterOptions(
  materials: CatalogMaterial[],
  programs: GatewayEventSeries[],
) {
  const unique = <T extends string>(items: T[]) =>
    Array.from(new Set(items.filter(Boolean))).sort((left, right) =>
      left.localeCompare(right),
    );

  return {
    topics: unique(materials.flatMap((material) => material.topics)).map(
      (value) => ({ label: value, value }),
    ),
    tools: unique(materials.flatMap((material) => material.tools)).map(
      (value) => ({ label: value, value }),
    ),
    systems: unique(materials.flatMap((material) => material.systems)).map(
      (value) => ({ label: value, value }),
    ),
    programs: programs
      .map(({ id, name }) => ({ label: name, value: id }))
      .sort((left, right) => left.label.localeCompare(right.label)),
    resourceTypes: unique(
      materials.flatMap((material) =>
        material.resources.map((resource) => resource.type),
      ),
    )
      .map((value) => ({ label: publicResourceTypeLabel(value), value }))
      .filter(
        (option): option is { label: string; value: string } =>
          Boolean(option.label),
      ),
  };
}

function useMaterialPagination(
  materials: CatalogMaterial[],
  filters: typeof emptyFilterValues,
) {
  const [page, setPage] = useState(1);
  const filteredMaterials = useMemo(
    () => materials.filter((material) => matchesFilters(material, filters)),
    [filters, materials],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMaterials.length / MATERIALS_PER_PAGE),
  );
  const pagedMaterials = filteredMaterials.slice(
    (page - 1) * MATERIALS_PER_PAGE,
    page * MATERIALS_PER_PAGE,
  );
  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return {
    page,
    setPage,
    filteredMaterials,
    totalPages,
    pagedMaterials,
    changePage,
  };
}

function useServerFilterNavigation(
  pathname: string,
  query: string,
  program: string,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("query", query.trim());
      } else {
        params.delete("query");
      }
      if (program.trim()) {
        params.set("program", program.trim());
      } else {
        params.delete("program");
      }

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentQuery = searchParams.toString();
      const currentUrl = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname;

      if (nextUrl !== currentUrl) {
        startTransition(() => {
          router.replace(nextUrl, { scroll: false });
        });
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, program, query, router, searchParams]);

  return () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };
}

interface MaterialsPageClientProps {
  materials: CatalogMaterial[];
  programs?: GatewayEventSeries[];
  initialFilters?: MaterialListFilters;
  initialError?: string;
}

export default function MaterialsPageClient({
  materials: initialMaterials,
  programs = [],
  initialFilters = {},
  initialError,
}: Readonly<MaterialsPageClientProps>) {
  const pathname = usePathname();
  const materials = useMemo(
    () => normalizeMaterials(initialMaterials),
    [initialMaterials],
  );
  const [filters, setFilters] = useState(initialFilterState(initialFilters));

  const options = useMemo(
    () => filterOptions(materials, programs),
    [materials, programs],
  );
  const navigateToCatalog = useServerFilterNavigation(
    pathname,
    filters.query,
    filters.program,
  );

  const pagination = useMaterialPagination(materials, filters);

  const handleChange = (key: string, value: string) => {
    pagination.setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...emptyFilterValues });
    pagination.setPage(1);
    navigateToCatalog();
  };
  const activeFilters = activeFilterEntries(filters, programs);

  return (
    <TrainingLibraryView
      materials={pagination.pagedMaterials}
      total={pagination.filteredMaterials.length}
      error={initialError}
      activeFilters={activeFilters}
      onRemoveFilter={(key) => {
        handleChange(key, "");
      }}
      onReset={handleReset}
      searchValue={filters.query}
      onSearch={(value) => {
        handleChange("query", value);
      }}
      filters={options}
      values={filters}
      onChange={(key, value) => {
        handleChange(key, value);
      }}
      page={pagination.page}
      totalPages={pagination.totalPages}
      onPageChange={pagination.changePage}
    />
  );
}
