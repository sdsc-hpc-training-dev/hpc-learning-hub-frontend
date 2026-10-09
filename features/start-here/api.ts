import { gatewayFetch } from "@/lib/gateway/client";
import { getUpcomingEvents } from "@/features/events/api";
import { getProgramsData } from "@/features/programs/api";
import { normalizeMaterial } from "@/features/training-library/api";
import type {
  CatalogMaterial,
  GatewayEventEdition,
  GatewayEventSeries,
  GatewayLearningPath,
  GatewayListResponse,
  GatewayMaterial,
  GatewayMaterialPage,
} from "@/lib/gateway/types";

const MATERIALS_ENDPOINT = "/api/v1/materials";
const MATERIALS_PAGE_SIZE = 100;
const BROWSE_FILTERS: readonly Pick<StartHereFilter, "type" | "name">[] = [
  { type: "system", name: "Expanse" },
  { type: "topic", name: "GPU Programming" },
  { type: "tool", name: "Slurm" },
  { type: "system", name: "TSCC" },
];
const FEATURED_MATERIALS = [
  {
    id: "20000013",
    title: "Expanse 101: Accessing and Running Jobs on Expanse",
  },
  {
    id: "20000058",
    title: "Getting Started with Batch Job Scheduling: Slurm Edition",
  },
  {
    id: "20000070",
    title: "GPU Computing and Programming on Expanse",
  },
] as const;

export interface StartHereFilter {
  type: "topic" | "tool" | "system";
  name: string;
  count: number;
}

export interface StartHereData {
  browseOptions: StartHereFilter[];
  featuredMaterials: CatalogMaterial[];
  learningPaths: GatewayLearningPath[];
  upcomingEvents: GatewayEventEdition[];
  programs: GatewayEventSeries[];
  errors: string[];
}

function materialsUrl(page: number): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(MATERIALS_PAGE_SIZE),
  });
  return `${MATERIALS_ENDPOINT}?${params.toString()}`;
}

function listFrom<T>(payload: GatewayListResponse<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.data ?? payload.results ?? [];
}

async function getAllMaterials(): Promise<GatewayMaterial[]> {
  const firstPage = await gatewayFetch<GatewayMaterialPage>(materialsUrl(1), {
    cache: "no-store",
  });
  const materials = [...firstPage.items];
  const totalPages = Math.max(firstPage.totalPages, 1);

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await gatewayFetch<GatewayMaterialPage>(
      materialsUrl(page),
      { cache: "no-store" },
    );
    materials.push(...response.items);
  }

  return materials;
}

function hasPublicResource(material: GatewayMaterial | CatalogMaterial) {
  return material.resources.some((resource) => Boolean(resource.url?.trim()));
}

function filterValues(
  material: GatewayMaterial,
  type: StartHereFilter["type"],
) {
  if (type === "topic") return material.topics;
  if (type === "tool") return material.tools;
  return material.systems;
}

function browseOptions(materials: GatewayMaterial[]): StartHereFilter[] {
  if (materials.length === 0) return [];

  return BROWSE_FILTERS.map((filter) => {
    const expectedName = filter.name.toLocaleLowerCase();
    const count = materials.filter((material) =>
      filterValues(material, filter.type).some(
        (item) => item.name.trim().toLocaleLowerCase() === expectedName,
      ),
    ).length;

    return { ...filter, count };
  });
}

function featuredMaterials(materials: CatalogMaterial[]): CatalogMaterial[] {
  const availableMaterials = materials.filter(hasPublicResource);
  const selected = FEATURED_MATERIALS.map(({ id, title }) =>
    availableMaterials.find(
      (material) => material.id === id || material.title === title,
    ),
  ).filter((material): material is CatalogMaterial => material !== undefined);

  if (selected.length === FEATURED_MATERIALS.length) return selected;

  const selectedIds = new Set(selected.map((material) => material.id));
  const fallback = availableMaterials
    .filter((material) => !selectedIds.has(material.id))
    .sort((left, right) => (right.date ?? "").localeCompare(left.date ?? ""));

  return [...selected, ...fallback].slice(0, FEATURED_MATERIALS.length);
}

async function getAllLearningPaths(): Promise<GatewayLearningPath[]> {
  const payload = await gatewayFetch<GatewayListResponse<GatewayLearningPath>>(
    "/api/v1/learning-paths",
    { cache: "no-store" },
  );
  return listFrom(payload);
}

export async function getStartHereData(): Promise<StartHereData> {
  const [materialsResult, pathsResult, eventsResult, programsResult] =
    await Promise.allSettled([
      getAllMaterials(),
      getAllLearningPaths(),
      getUpcomingEvents(new Date(), 3),
      getProgramsData().then((data) => data.programs),
    ]);
  const errors = [
    materialsResult.status === "rejected"
      ? "Training materials could not be loaded."
      : null,
    pathsResult.status === "rejected"
      ? "Learning paths could not be loaded."
      : null,
    eventsResult.status === "rejected"
      ? "Upcoming events could not be loaded."
      : null,
    programsResult.status === "rejected"
      ? "Programs could not be loaded."
      : null,
  ].filter((message): message is string => message !== null);
  const materials =
    materialsResult.status === "fulfilled" ? materialsResult.value : [];
  const learningPaths =
    pathsResult.status === "fulfilled" ? pathsResult.value : [];
  const upcomingEvents =
    eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const programs =
    programsResult.status === "fulfilled" ? programsResult.value : [];
  const catalogMaterials = materials.map(normalizeMaterial);

  return {
    browseOptions: browseOptions(materials),
    featuredMaterials: featuredMaterials(catalogMaterials),
    learningPaths: learningPaths.slice(0, 3),
    upcomingEvents,
    programs: programs.slice(0, 3),
    errors,
  };
}
