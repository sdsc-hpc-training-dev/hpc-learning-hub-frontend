import type { Metadata } from "next";
import { LearningPathsView } from "@/features/learning-paths/LearningPathsView";
import { getLearningPaths } from "@/features/learning-paths/api";

export const metadata: Metadata = {
  title: "Learning Paths | HPC Learning Hub",
  description: "Curated SDSC learning paths for building practical HPC skills.",
};

export const dynamic = "force-dynamic";

export default async function LearningPathsPage() {
  try {
    const paths = await getLearningPaths();
    return <LearningPathsView paths={paths} />;
  } catch (error) {
    console.error("Failed to load learning paths", error);
    return (
      <LearningPathsView
        paths={[]}
        error="We could not reach the learning path catalog. Please try again."
      />
    );
  }
}
