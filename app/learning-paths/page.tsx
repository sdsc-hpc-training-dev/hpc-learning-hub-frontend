import type { Metadata } from "next";
import { LearningPathsView } from "@/features/learning-paths/LearningPathsView";
import { getLearningPaths } from "@/features/learning-paths/api";

export const metadata: Metadata = {
  title: "Learning Paths | HPC Learning Hub",
  description: "Curated SDSC learning paths for building practical HPC skills.",
};

export const dynamic = "force-dynamic";

export default async function LearningPathsPage() {
  const paths = await getLearningPaths();
  return <LearningPathsView paths={paths} />;
}
