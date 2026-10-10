import { gatewayFetch } from "@/lib/gateway/client";
import { catalogFetchOptions } from "@/lib/gateway/cache";
import type {
  CatalogMaterial,
  GatewayEventSeries,
  GatewayMaterialPage,
} from "@/lib/gateway/types";
import { normalizeMaterial } from "@/features/training-library/api";

export const SERIES_PAGE_SIZE = 6;

export interface SelectedProgram extends GatewayEventSeries {
  materials: CatalogMaterial[];
  total: number;
}

export interface ProgramsData {
  programs: GatewayEventSeries[];
  selectedProgram: SelectedProgram | null;
}

export interface SeriesMaterialsData {
  program: SelectedProgram | null;
  page: number;
  totalPages: number;
}

export function parseSeriesPage(value?: string | string[]): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function seriesMaterialsHref(programId: string, page = 1): string {
  const params = new URLSearchParams({
    program: programId,
    page: String(page),
  });
  return `/programs/materials?${params}`;
}

async function loadSeriesPage(selected: GatewayEventSeries, page: number) {
  const params = new URLSearchParams({
    eventSeries: selected.id,
    page: String(page),
    pageSize: String(SERIES_PAGE_SIZE),
  });
  const response = await gatewayFetch<GatewayMaterialPage>(
    `/api/v1/materials?${params}`,
    catalogFetchOptions({ tags: ["catalog:programs"] }),
  );
  return {
    program: {
      ...selected,
      materials: response.items.map((material) => ({
        ...normalizeMaterial(material),
        program: selected.name,
        series: selected.name,
      })),
      total: response.total,
    },
    page: response.page,
    totalPages: response.totalPages,
  };
}

export async function getProgramsData(
  selectedProgramId?: string,
): Promise<ProgramsData> {
  const programs = await gatewayFetch<GatewayEventSeries[]>(
    "/api/v1/event-series",
    catalogFetchOptions({ tags: ["catalog:programs"] }),
  );
  const selected = programs.find((program) => program.id === selectedProgramId);
  if (!selected) return { programs, selectedProgram: null };
  const { program } = await loadSeriesPage(selected, 1);
  return { programs, selectedProgram: program };
}

export async function getSeriesMaterialsData(
  programId?: string,
  requestedPage = 1,
): Promise<SeriesMaterialsData> {
  const programs = await gatewayFetch<GatewayEventSeries[]>(
    "/api/v1/event-series",
    catalogFetchOptions({ tags: ["catalog:programs"] }),
  );
  const selected = programs.find((program) => program.id === programId);
  if (!selected) return { program: null, page: 1, totalPages: 0 };
  const result = await loadSeriesPage(
    selected,
    parseSeriesPage(String(requestedPage)),
  );
  // Clamp stale direct links with at most one additional bounded Gateway request.
  const lastPage = Math.max(1, result.totalPages);
  if (result.page > lastPage) return loadSeriesPage(selected, lastPage);
  return result;
}
