import { gatewayFetch } from "@/lib/gateway/client";
import type {
  GatewayEventEdition,
  GatewayMaterial,
  GatewayMaterialPage,
} from "@/lib/gateway/types";

const EVENT_EDITIONS_ENDPOINT = "/api/v1/event-editions";
const MATERIALS_ENDPOINT = "/api/v1/materials";
const PAGE_SIZE = 100;
const SECTION_LIMIT = 6;

export interface RecordedMaterial {
  id: string;
  title: string;
  description: string | null;
  recordedAt: string | null;
}

export interface EventsData {
  upcomingEvents: GatewayEventEdition[];
  recordings: RecordedMaterial[];
}

function eventTimestamp(event: GatewayEventEdition): number | null {
  if (!event.startAt) return null;
  const timestamp = Date.parse(event.startAt);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function latestEdition(material: GatewayMaterial): GatewayEventEdition | null {
  return [...material.eventEditions].sort(
    (left, right) =>
      (eventTimestamp(right) ?? Number.NEGATIVE_INFINITY) -
      (eventTimestamp(left) ?? Number.NEGATIVE_INFINITY),
  )[0] ?? null;
}

function toRecording(material: GatewayMaterial): RecordedMaterial {
  const edition = latestEdition(material);
  return {
    id: material.id,
    title: material.title ?? "Untitled training material",
    description: material.description,
    recordedAt: edition?.startAt ?? null,
  };
}

function recordingsUrl(page: number): string {
  const params = new URLSearchParams({
    resourceType: "video",
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  return `${MATERIALS_ENDPOINT}?${params}`;
}

async function getRecordingMaterials(): Promise<GatewayMaterial[]> {
  const firstPage = await gatewayFetch<GatewayMaterialPage>(recordingsUrl(1), {
    cache: "no-store",
  });
  const remainingPages = Array.from(
    { length: Math.max(firstPage.totalPages - 1, 0) },
    (_, index) => index + 2,
  );
  const responses = await Promise.all(
    remainingPages.map((page) =>
      gatewayFetch<GatewayMaterialPage>(recordingsUrl(page), {
        cache: "no-store",
      }),
    ),
  );
  return [firstPage, ...responses].flatMap((page) => page.items);
}

export async function getEventsData(now = new Date()): Promise<EventsData> {
  const [eventEditions, recordingMaterials] = await Promise.all([
    gatewayFetch<GatewayEventEdition[]>(EVENT_EDITIONS_ENDPOINT, {
      cache: "no-store",
    }),
    getRecordingMaterials(),
  ]);
  const nowTimestamp = now.getTime();
  const upcomingEvents = eventEditions
    .filter((event) => (eventTimestamp(event) ?? 0) >= nowTimestamp)
    .sort(
      (left, right) =>
        (Date.parse(left.startAt ?? "") || Number.MAX_SAFE_INTEGER) -
        (Date.parse(right.startAt ?? "") || Number.MAX_SAFE_INTEGER),
    )
    .slice(0, SECTION_LIMIT);
  const recordings = recordingMaterials
    .map(toRecording)
    .filter((recording) => {
      if (!recording.recordedAt) return true;
      const timestamp = Date.parse(recording.recordedAt);
      return Number.isNaN(timestamp) || timestamp <= nowTimestamp;
    })
    .sort(
      (left, right) =>
        (Date.parse(right.recordedAt ?? "") || Number.NEGATIVE_INFINITY) -
        (Date.parse(left.recordedAt ?? "") || Number.NEGATIVE_INFINITY),
    )
    .slice(0, SECTION_LIMIT);

  return { upcomingEvents, recordings };
}
