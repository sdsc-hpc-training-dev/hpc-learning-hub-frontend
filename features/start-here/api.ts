import { randomInt } from "node:crypto";
import { gatewayFetch } from "@/lib/gateway/client";
import { getUpcomingEvents } from "@/features/events/api";
import { getProgramsData } from "@/features/programs/api";
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

function toCatalogMaterial(material: GatewayMaterial): CatalogMaterial | null {
  if (!material.id || !material.title) return null;
  return {
    id: material.id,
    title: material.title,
    description: material.description,
    summary: material.description,
    topics: material.topics.map((item) => item.name),
    tools: material.tools.map((item) => item.name),
    systems: material.systems.map((item) => item.name),
    instructors: material.instructors.map((item) => item.name),
    resources: material.resources,
  };
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

function sampleFilters(
  materials: GatewayMaterial[],
  count: number,
): StartHereFilter[] {
  const options = new Map<string, StartHereFilter>();
  for (const material of materials) {
    addFilterValues(options, material.topics, "topic");
    addFilterValues(options, material.tools, "tool");
    addFilterValues(options, material.systems, "system");
  }

  const shuffled = [...options.values()];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1);
    // Both indexes are bounded by the array length and crypto.randomInt.
    /* eslint-disable security/detect-object-injection */
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
    /* eslint-enable security/detect-object-injection */
  }
  return shuffled.slice(0, count);
}

function addFilterValues(
  options: Map<string, StartHereFilter>,
  values: { name: string }[],
  type: StartHereFilter["type"],
) {
  for (const { name: rawName } of values) {
    const name = rawName.trim();
    if (!name) continue;
    const key = `${type}:${name.toLocaleLowerCase()}`;
    const existing = options.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }
    options.set(key, { type, name, count: 1 });
  }
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
  const catalogMaterials = materials
    .map(toCatalogMaterial)
    .filter((material): material is CatalogMaterial => material !== null);

  return {
    browseOptions: sampleFilters(materials, 4),
    featuredMaterials: catalogMaterials.slice(0, 3),
    learningPaths: learningPaths.slice(0, 3),
    upcomingEvents,
    programs: programs.slice(0, 3),
    errors,
  };
}
