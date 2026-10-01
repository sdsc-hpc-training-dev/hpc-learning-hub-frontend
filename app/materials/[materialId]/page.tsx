import { notFound } from "next/navigation";
import InlineError from "@/components/ui/InlineError";
import MaterialDetail from "@/features/training-library/MaterialDetail";
import {
  getMaterialById,
  getTrainingLibraryData,
} from "@/features/training-library/api";
import type { CatalogMaterial } from "@/lib/gateway/types";

interface MaterialPageProps {
  params: Promise<{ materialId: string }>;
}

export default async function MaterialPage({
  params,
}: Readonly<MaterialPageProps>) {
  const { materialId } = await params;
  let material: CatalogMaterial | null;
  try {
    material = await getMaterialById(materialId);
  } catch (error) {
    console.error("Failed to load training material", error);
    return (
      <InlineError
        title="This training material is unavailable."
        message="We could not reach the training catalog. Please try again."
      />
    );
  }

  if (!material) notFound();
  const catalog = await getTrainingLibraryData();

  return (
    <MaterialDetail
      material={material}
      relatedMaterials={catalog.materials}
      relatedMaterialsError={
        catalog.error
          ? "We could not load recommendations. Please try again."
          : undefined
      }
    />
  );
}
