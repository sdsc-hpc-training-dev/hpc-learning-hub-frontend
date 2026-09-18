"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MaterialDetail from "@/features/training-library/MaterialDetail";
import { fallbackMaterials, getMaterialById, getTrainingLibraryData } from "@/features/training-library/api";
import type { CatalogMaterial } from "@/lib/gateway/types";

interface MaterialPageProps {
	params?: Promise<{ materialId: string }>;
}

export default function MaterialPage({ params = Promise.resolve({ materialId: fallbackMaterials[0].id }) }: Readonly<MaterialPageProps>) {
	const [materialId, setMaterialId] = useState(fallbackMaterials[0].id);
	const [material, setMaterial] = useState<CatalogMaterial | null>(fallbackMaterials[0]);
	const [materials, setMaterials] = useState<CatalogMaterial[]>(fallbackMaterials);

	useEffect(() => {
		let active = true;

		const loadMaterial = async () => {
			const resolvedParams = await params;

			setMaterialId(resolvedParams.materialId);
			const [result, catalog] = await Promise.all([
				getMaterialById(resolvedParams.materialId),
				getTrainingLibraryData(),
			]);

			if (active) {
				setMaterial(result);
				setMaterials(catalog.materials);
			}
		};

		void loadMaterial();

		return () => {
			active = false;
		};
	}, [params]);

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

	return <MaterialDetail key={materialId} material={material} relatedMaterials={materials} />;
}
