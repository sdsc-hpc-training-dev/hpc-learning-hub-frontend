import MaterialsPageClient from "@/features/training-library/MaterialsPageClient";
import { getTrainingLibraryData } from "@/features/training-library/api";
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
  };
  const programsPromise = getProgramsData()
    .then(({ programs }) => programs)
    .catch((error: unknown) => {
      console.error("Failed to load program filters", error);
      return [];
    });
  const [{ materials, error }, programs] = await Promise.all([
    getTrainingLibraryData(filters),
    programsPromise,
  ]);

  return (
    <MaterialsPageClient
      materials={materials}
      programs={programs}
      initialFilters={filters}
      initialError={
        error ? "The Training Library could not be loaded." : undefined
      }
    />
  );
}
