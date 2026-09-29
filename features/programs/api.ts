import { gatewayFetch } from "@/lib/gateway/client";
import type {
  CatalogMaterial,
  GatewayEventSeries,
  GatewayMaterial,
  GatewayMaterialPage,
} from "@/lib/gateway/types";

const EVENT_SERIES_ENDPOINT = "/api/v1/event-series";
const MATERIALS_ENDPOINT = "/api/v1/materials";
const CANDIDATE_POOL_SIZE = 20;
const REPRESENTATIVE_LIMIT = 6;

export interface SelectedProgram extends GatewayEventSeries {
  materials: CatalogMaterial[];
  total: number;
}

export interface ProgramsData {
  programs: GatewayEventSeries[];
  selectedProgram: SelectedProgram | null;
}

function namedValues(items: { name: string }[]): string[] {
  return items.map((item) => item.name);
}

function materialTitle(material: GatewayMaterial): string {
  const title = material.title?.trim();
  if (!title) return "Untitled training material";
  return title;
}

function toCatalogMaterial(
  material: GatewayMaterial,
  seriesName: string,
): CatalogMaterial {
  const trimmedDescription = material.description?.trim();
  let description: string | null = null;
  if (trimmedDescription) description = trimmedDescription;
  return {
    id: material.id,
    title: materialTitle(material),
    description,
    summary: description,
    topics: namedValues(material.topics),
    tools: namedValues(material.tools),
    systems: namedValues(material.systems),
    instructors: namedValues(material.instructors),
    program: seriesName,
    series: seriesName,
    resources: material.resources,
  };
}

function materialsUrl(seriesId: string, page: number): string {
  const params = new URLSearchParams({
    eventSeries: seriesId,
    page: String(page),
    pageSize: String(CANDIDATE_POOL_SIZE),
  });
  return `${MATERIALS_ENDPOINT}?${params}`;
}

function representativeMaterials(
  materials: GatewayMaterial[],
  seriesName: string,
): CatalogMaterial[] {
  const seenTitles = new Set<string>();
  return materials
    .filter((material) => {
      const title = materialTitle(material).toLowerCase();
      if (seenTitles.has(title)) return false;
      seenTitles.add(title);
      return true;
    })
    .slice(0, REPRESENTATIVE_LIMIT)
    .map((material) => toCatalogMaterial(material, seriesName));
}

function distinctTitleCount(materials: GatewayMaterial[]): number {
  return new Set(materials.map((material) => materialTitle(material).toLowerCase()))
    .size;
}

async function getRepresentativeMaterials(
  selected: GatewayEventSeries,
): Promise<{ materials: CatalogMaterial[]; total: number }> {
  const candidates: GatewayMaterial[] = [];
  let page = 1;
  let response: GatewayMaterialPage;

  do {
    response = await gatewayFetch<GatewayMaterialPage>(
      materialsUrl(selected.id, page),
      { cache: "no-store" },
    );
    candidates.push(...response.items);
    page += 1;
  } while (
    distinctTitleCount(candidates) < REPRESENTATIVE_LIMIT &&
    page <= response.totalPages
  );

  return {
    materials: representativeMaterials(candidates, selected.name),
    total: response.total,
  };
}

export async function getProgramsData(
  selectedProgramId?: string,
): Promise<ProgramsData> {
  const programs = await gatewayFetch<GatewayEventSeries[]>(
    EVENT_SERIES_ENDPOINT,
    { cache: "no-store" },
  );
  const selected = programs.find((program) => program.id === selectedProgramId);

  if (!selected) {
    return { programs, selectedProgram: null };
  }

  const collection = await getRepresentativeMaterials(selected);

  return {
    programs,
    selectedProgram: {
      ...selected,
      ...collection,
    },
  };
}
