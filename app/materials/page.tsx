import MaterialsPageClient from "@/features/training-library/MaterialsPageClient";
import {
  getTrainingLibraryData,
  getTrainingLibraryFacets,
} from "@/features/training-library/api";
import { getProgramsData } from "@/features/programs/api";

interface MaterialsPageProps {
  searchParams?: Promise<{
    topic?: string | string[];
    tool?: string | string[];
    system?: string | string[];
    program?: string | string[];
    resource?: string | string[];
    query?: string | string[];
    date?: string | string[];
    page?: string | string[];
    sort?: string | string[];
  }>;
}

export default async function MaterialsPage({
  searchParams = Promise.resolve({}),
}: Readonly<MaterialsPageProps>) {
  const params = await searchParams;
  const getValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const filters = {
    topic: getValue(params.topic),
    tool: getValue(params.tool),
    system: getValue(params.system),
    program: getValue(params.program),
    resource: getValue(params.resource),
    query: getValue(params.query),
    date: getValue(params.date),
    page: getValue(params.page),
    sort: getValue(params.sort),
  };
  const programsPromise = getProgramsData()
    .then(({ programs }) => programs)
    .catch((error: unknown) => {
      console.error("Failed to load program filters", error);
      return [];
    });
  const [{ materials, error, total, page, totalPages }, programs, facets] =
    await Promise.all([
      getTrainingLibraryData(filters),
      programsPromise,
      getTrainingLibraryFacets().catch(() => ({
        topics: [],
        tools: [],
        systems: [],
      })),
    ]);

  return (
    <MaterialsPageClient
      key={JSON.stringify(filters)}
      materials={materials}
      total={total}
      page={page}
      totalPages={totalPages}
      facets={facets}
      programs={programs}
      initialFilters={filters}
      initialError={
        error ? "The Training Library could not be loaded." : undefined
      }
    />
  );
}
