import { randomInt } from "node:crypto";
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

function randomItems(items: string[], count: number): string[] {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index -= 1) {
		const randomIndex = randomInt(index + 1);
		[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
	}
	return shuffled.slice(0, count);
}

export async function getStartHereData(): Promise<StartHereData> {
	const [materials, events, learningPaths, programs] = await Promise.all([
		optionalList<GatewayMaterial>("/api/v1/materials"),
		optionalList<GatewayEvent>("/api/v1/events?status=upcoming&limit=3"),
		optionalList<GatewayLearningPath>("/api/v1/learning-paths"),
		optionalList<GatewayProgram>("/api/v1/programs?limit=3"),
	]);

	const materialCards = materials.map(toMaterial).filter((material): material is StartHereMaterial => material !== null);
	const browseOptions = randomItems([...new Set(materials.flatMap((material) => [
		...(material.topics ?? []),
		...(material.systems ?? []),
		...(material.tools ?? []),
	]))], 4);
	const recordings = materials
		.filter((material) => (material.content_type ?? material.contentType)?.toLowerCase() === "recording")
		.map(toMaterial)
		.filter((material): material is StartHereMaterial => material !== null)
		.slice(0, 3);

	return {
		browseOptions,
		featuredMaterials: materialCards.slice(0, 3),
		upcomingEvents: events,
		learningPaths: learningPaths.slice(0, 3),
		programs,
	};
}