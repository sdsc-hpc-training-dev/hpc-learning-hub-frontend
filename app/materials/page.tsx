import MaterialsPageClient from "@/features/training-library/MaterialsPageClient";
import { getTrainingLibraryData } from "@/features/training-library/api";

interface MaterialsPageProps {
  searchParams?: Promise<{ topic?: string | string[] }>;
}

export default async function MaterialsPage({ searchParams = Promise.resolve({}) }: Readonly<MaterialsPageProps>) {
  const params = await searchParams;
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const { materials } = await getTrainingLibraryData({ topic });

  return <MaterialsPageClient materials={materials} initialQuery={topic ?? ""} />;
}
