import { gatewayFetch } from "@/lib/gateway/client";
import type {
	GatewayEvent,
	GatewayLearningPath,
	GatewayListResponse,
	GatewayMaterial,
	GatewayProgram,
} from "@/lib/gateway/types";

export interface StartHereMaterial {
	id: string;
	title: string;
	summary: string;
	href: string;
};

export interface StartHereData {
	browseOptions: string[];
	featuredMaterials: StartHereMaterial[];
	upcomingEvents: GatewayEvent[];
	learningPaths: GatewayLearningPath[];
	programs: GatewayProgram[];
};

function listFrom<T>(payload: GatewayListResponse<T>): T[] {
	if (Array.isArray(payload)) return payload;
	return payload.items ?? payload.data ?? payload.results ?? [];
}

async function optionalList<T>(path: string): Promise<T[]> {
	try {
		return listFrom(await gatewayFetch<GatewayListResponse<T>>(path));
	} catch {
		return [];
	}
}

function toMaterial(material: GatewayMaterial): StartHereMaterial | null {
	if (!material.id || !material.title) return null;
	return {
		id: material.id,
		title: material.title,
		summary: material.summary ?? "Explore this training material in the library.",
		href: `/materials/${encodeURIComponent(material.id)}`,
	};
}

export async function getStartHereData(): Promise<StartHereData> {
	const [materials, events, learningPaths, programs] = await Promise.all([
		optionalList<GatewayMaterial>("/api/v1/materials?limit=6"),
		optionalList<GatewayEvent>("/api/v1/events?status=upcoming&limit=3"),
		optionalList<GatewayLearningPath>("/api/v1/learning-paths?limit=3"),
		optionalList<GatewayProgram>("/api/v1/programs?limit=3"),
	]);

	const materialCards = materials.map(toMaterial).filter((material): material is StartHereMaterial => material !== null);
	const browseOptions = [...new Set(materials.flatMap((material) => [
		...(material.topics ?? []),
		...(material.systems ?? []),
		...(material.tools ?? []),
	]))].slice(0, 12);

	return {
		browseOptions,
		featuredMaterials: materialCards,
		upcomingEvents: events,
		learningPaths,
		programs,
	};
}