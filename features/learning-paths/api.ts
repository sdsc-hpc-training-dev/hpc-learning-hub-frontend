import { gatewayFetch, GatewayRequestError } from "@/lib/gateway/client";
import type { LearningPath } from "@/lib/gateway/types";

const LEARNING_PATHS_ENDPOINT = "/api/v1/learning-paths";

export function getLearningPaths(): Promise<LearningPath[]> {
  return gatewayFetch<LearningPath[]>(LEARNING_PATHS_ENDPOINT, {
    cache: "no-store",
  });
}

export async function getLearningPath(
  pathId: string,
): Promise<LearningPath | null> {
  try {
    return await gatewayFetch<LearningPath>(
      `${LEARNING_PATHS_ENDPOINT}/${encodeURIComponent(pathId)}`,
      { cache: "no-store" },
    );
  } catch (error) {
    if (error instanceof GatewayRequestError && error.status === 404)
      return null;
    throw error;
  }
}
