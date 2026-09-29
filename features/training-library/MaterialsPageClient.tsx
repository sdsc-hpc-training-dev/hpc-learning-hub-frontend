"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import TrainingLibraryView from "./TrainingLibraryView";
import type { CatalogMaterial } from "@/lib/gateway/types";

const emptyFilterValues = {
  query: "",
  topic: "",
  tool: "",
  system: "",
  program: "",
  resource: "",
  date: "",
};

function normalizeMaterials(materials: CatalogMaterial[]) {
  return materials.map((material) => ({
    ...material,
    topics: Array.isArray(material.topics) ? material.topics : [],
    tools: Array.isArray(material.tools) ? material.tools : [],
    systems: Array.isArray(material.systems) ? material.systems : [],
    instructors: Array.isArray(material.instructors) ? material.instructors : [],
    resources: Array.isArray(material.resources) ? material.resources : [],
  }));
}

function matchesSearch(material: CatalogMaterial, query: string) {
  const haystack = [
    material.title,
    material.description ?? "",
    material.summary ?? "",
    material.program ?? "",
    material.series ?? "",
    ...material.topics,
    ...material.tools,
    ...material.systems,
    ...material.instructors,
    ...material.resources.map((resource) => resource.title),
  ].join(" ").toLowerCase();

  return !query || haystack.includes(query);
}

function matchesDate(material: CatalogMaterial, date: string) {
  const materialDate = material.date ? new Date(material.date).toISOString().slice(0, 10) : "";
  return !date || materialDate === date;
}

function matchesFilters(material: CatalogMaterial, filters: typeof emptyFilterValues) {
  const query = filters.query.trim().toLowerCase();

  return [
    matchesSearch(material, query),
    !filters.topic || material.topics.includes(filters.topic),
    !filters.tool || material.tools.includes(filters.tool),
    !filters.system || material.systems.includes(filters.system),
    !filters.program || (material.program ?? "") === filters.program,
    !filters.resource || material.resources.some((resource) => resource.type === filters.resource),
    matchesDate(material, filters.date),
  ].every(Boolean);
}

function updateTopicQuery(pathname: string, value: string, router: ReturnType<typeof useRouter>) {
  const params = new URLSearchParams(window.location.search);
  if (value.trim()) {
    params.set("topic", value.trim());
  } else {
    params.delete("topic");
  }

  const query = params.toString();
  router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
}

export default function MaterialsPageClient({
  materials: initialMaterials,
  initialQuery = "",
}: Readonly<{ materials: CatalogMaterial[]; initialQuery?: string }>) {
  const pathname = usePathname();
  const router = useRouter();
  const materials = useMemo(() => normalizeMaterials(initialMaterials), [initialMaterials]);
  const [filters, setFilters] = useState({ ...emptyFilterValues, query: initialQuery });

  const options = useMemo(() => {
    const unique = <T extends string>(items: T[]) => Array.from(new Set(items.filter(Boolean))).sort((left, right) => left.localeCompare(right));

    return {
      topics: unique(materials.flatMap((material) => material.topics)).map((value) => ({ label: value, value })),
      tools: unique(materials.flatMap((material) => material.tools)).map((value) => ({ label: value, value })),
      systems: unique(materials.flatMap((material) => material.systems)).map((value) => ({ label: value, value })),
      programs: unique(materials.map((material) => material.program ?? "").filter(Boolean)).map((value) => ({ label: value, value })),
      resourceTypes: unique(materials.flatMap((material) => material.resources.map((resource) => resource.type))).map((value) => ({ label: value, value })),
    };
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => matchesFilters(material, filters));
  }, [filters, materials]);

  const handleChange = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));

    if (key === "query") {
      updateTopicQuery(pathname, value, router);
    }
  };

  const handleReset = () => {
    setFilters({ ...emptyFilterValues });
  };
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value }));

  return (
    <TrainingLibraryView
      materials={filteredMaterials}
      total={filteredMaterials.length}
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
    />
  );
}