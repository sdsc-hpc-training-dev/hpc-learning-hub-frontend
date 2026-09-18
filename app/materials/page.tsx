"use client";

import { useEffect, useMemo, useState } from "react";
import TrainingLibraryView from "@/features/training-library/TrainingLibraryView";
import { getTrainingLibraryData, type MaterialListFilters } from "@/features/training-library/api";
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

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
  const [filters, setFilters] = useState<MaterialListFilters>({ ...emptyFilterValues });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const result = await getTrainingLibraryData(filters);
        if (active) {
          setMaterials(normalizeMaterials(result.materials));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [filters]);

  const options = useMemo(() => {
    const unique = <T extends string>(items: T[]) => Array.from(new Set(items.filter(Boolean))).sort();

    return {
      topics: unique(materials.flatMap((material) => material.topics)).map((value) => ({ label: value, value })),
      tools: unique(materials.flatMap((material) => material.tools)).map((value) => ({ label: value, value })),
      systems: unique(materials.flatMap((material) => material.systems)).map((value) => ({ label: value, value })),
      programs: unique(materials.map((material) => material.program ?? "").filter(Boolean)).map((value) => ({ label: value, value })),
      resourceTypes: unique(materials.flatMap((material) => material.resources.map((resource) => resource.type))).map((value) => ({ label: value, value })),
    };
  }, [materials]);

  const activeFilters = Object.entries(filters)
    .filter(([, value]) => value)
    .map(([key, value]) => ({ key, value: String(value) }));

  const filteredMaterials = useMemo(() => {
    const query = filters.query?.trim().toLowerCase() ?? "";

    return materials.filter((material) => {
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
      ]
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (filters.topic && !material.topics.includes(filters.topic)) {
        return false;
      }

      if (filters.tool && !material.tools.includes(filters.tool)) {
        return false;
      }

      if (filters.system && !material.systems.includes(filters.system)) {
        return false;
      }

      if (filters.program && (material.program ?? "") !== filters.program) {
        return false;
      }

      if (filters.resource && !material.resources.some((resource) => resource.type === filters.resource)) {
        return false;
      }

      if (filters.date) {
        const matchDate = material.date ? new Date(material.date).toISOString().slice(0, 10) : "";
        if (matchDate !== filters.date) {
          return false;
        }
      }

      return true;
    });
  }, [filters, materials]);

  const handleChange = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ ...emptyFilterValues });
  };

  const handleRemoveFilter = (key: string) => {
    setFilters((current) => ({ ...current, [key]: "" }));
  };

  return (
    <>
      <TrainingLibraryView
        materials={filteredMaterials}
        total={filteredMaterials.length}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onReset={handleReset}
        searchValue={filters.query ?? ""}
        onSearch={(value) => handleChange("query", value)}
        filters={options}
        values={{
          query: filters.query ?? "",
          topic: filters.topic ?? "",
          tool: filters.tool ?? "",
          system: filters.system ?? "",
          program: filters.program ?? "",
          resource: filters.resource ?? "",
          date: filters.date ?? "",
        }}
        onChange={handleChange}
      />

      {loading && (
        <div className="mx-auto max-w-[1200px] px-4 pb-10 text-sm text-slate-500">Loading catalog…</div>
      )}
    </>
  );
}
