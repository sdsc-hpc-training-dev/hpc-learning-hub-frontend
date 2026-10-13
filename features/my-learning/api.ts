"use client";

import { gatewayBrowserFetch } from "@/lib/gateway/browser-client";
import type { CatalogMaterial, GatewayMaterial } from "@/lib/gateway/types";

export interface Bookmark {
  id: string;
  materialId: string;
  createdAt: string;
}

export interface PersonalPathItem {
  position: number;
  materialId?: string;
  material?: {
    id: string;
    title: string | null;
    description?: string | null;
  };
}

export interface PersonalLearningPath {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: PersonalPathItem[];
}

export function getBookmarks() {
  return gatewayBrowserFetch<Bookmark[]>("/me/bookmarks");
}

export function addBookmark(materialId: string) {
  return gatewayBrowserFetch<Bookmark>("/me/bookmarks", {
    method: "POST",
    body: JSON.stringify({ materialId }),
  });
}

export function removeBookmark(materialId: string) {
  return gatewayBrowserFetch(`/me/bookmarks/${encodeURIComponent(materialId)}`, {
    method: "DELETE",
  });
}

export async function getMaterialForLearner(materialId: string) {
  const material = await gatewayBrowserFetch<GatewayMaterial>(
    `/materials/${encodeURIComponent(materialId)}`,
  );
  const names = (items?: { name: string }[]) =>
    Array.isArray(items) ? items.map((item) => item.name) : [];
  return {
    id: material.id,
    title: material.title ?? "Untitled material",
    description: material.description,
    summary: material.description,
    topics: names(material.topics),
    tools: names(material.tools),
    systems: names(material.systems),
    instructors: names(material.instructors),
    resources: Array.isArray(material.resources) ? material.resources : [],
  } satisfies CatalogMaterial;
}

export function getPersonalPaths() {
  return gatewayBrowserFetch<PersonalLearningPath[]>("/me/learning-paths");
}

export function createPersonalPath(input: {
  title: string;
  description?: string;
  items?: { materialId: string; position: number }[];
}) {
  return gatewayBrowserFetch<PersonalLearningPath>("/me/learning-paths", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePersonalPath(
  pathId: string,
  input: {
    title?: string;
    description?: string | null;
    items?: { materialId: string; position: number }[];
  },
) {
  return gatewayBrowserFetch<PersonalLearningPath>(
    `/me/learning-paths/${encodeURIComponent(pathId)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function deletePersonalPath(pathId: string) {
  return gatewayBrowserFetch(
    `/me/learning-paths/${encodeURIComponent(pathId)}`,
    { method: "DELETE" },
  );
}
