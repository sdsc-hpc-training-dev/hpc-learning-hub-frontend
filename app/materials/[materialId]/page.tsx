import Link from "next/link";
import MaterialDetail from "@/features/training-library/MaterialDetail";
import { fallbackMaterials, getMaterialById, getTrainingLibraryData } from "@/features/training-library/api";

interface MaterialPageProps {
	params?: Promise<{ materialId: string }>;
}

export default async function MaterialPage({ params = Promise.resolve({ materialId: fallbackMaterials[0].id }) }: Readonly<MaterialPageProps>) {
	const { materialId } = await params;
	const [material, catalog] = await Promise.all([
		getMaterialById(materialId),
		getTrainingLibraryData(),
	]);

	if (!material) {
		return (
			<>
				<section className="page-hero">
					<div className="page-hero__shell">
						<span className="eyebrow">Material not found</span>
						<h1>This material is not part of the prototype subset.</h1>
						<p>Return to the Training Library to choose one of the curated Snapshot v2 records.</p>
					</div>
				</section>
				<section className="section"><div className="section-shell"><Link className="button button--primary" href="/materials">Open Training Library</Link></div></section>
			</>
		);
	}

	return <MaterialDetail material={material} relatedMaterials={catalog.materials} />;
}
