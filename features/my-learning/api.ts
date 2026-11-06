import type { LearnerRequest } from "@/features/auth/api";

export interface Bookmark {
  id: string;
  materialId: string;
  createdAt: string;
}
export interface PathItem {
  position: number;
  materialId?: string;
  material?: { id: string; title: string | null };
}
export interface PersonalPath {
  id: string;
  title: string;
  description: string | null;
  items: PathItem[];
}
export interface PathInput {
  title: string;
  description: string | null;
  items?: { materialId: string; position: number }[];
}
const activityHeader = { "X-Learning-Hub-Activity": "1" };
export const getBookmarks = (request: LearnerRequest, activity = false) =>
  request<Bookmark[]>("/me/bookmarks", {
    headers: activity ? activityHeader : {},
  });
export const addBookmark = (request: LearnerRequest, materialId: string) =>
  request("/me/bookmarks", {
    method: "POST",
    body: JSON.stringify({ materialId }),
  });
export const removeBookmark = (request: LearnerRequest, materialId: string) =>
  request(`/me/bookmarks/${encodeURIComponent(materialId)}`, {
    method: "DELETE",
  });
export const getPaths = (request: LearnerRequest) =>
  request<PersonalPath[]>("/me/learning-paths", { headers: activityHeader });
export const savePath = (
  request: LearnerRequest,
  input: PathInput,
  id?: string,
) =>
  request(
    id ? `/me/learning-paths/${encodeURIComponent(id)}` : "/me/learning-paths",
    { method: id ? "PATCH" : "POST", body: JSON.stringify(input) },
  );
export const deletePath = (request: LearnerRequest, id: string) =>
  request(`/me/learning-paths/${encodeURIComponent(id)}`, { method: "DELETE" });
