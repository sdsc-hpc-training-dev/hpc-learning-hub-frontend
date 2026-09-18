import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPathDetail } from "@/features/learning-paths/LearningPathsView";
import { getLearningPath } from "@/features/learning-paths/api";

export const metadata: Metadata = {
  title: "Learning Path | HPC Learning Hub",
  description: "Follow a curated sequence of SDSC training materials.",
};

interface LearningPathPageProps {
  readonly params: Promise<{ readonly pathId: string }>;
}

export default async function LearningPathPage(
  props: Readonly<LearningPathPageProps>,
) {
  const { pathId } = await props.params;
  const path = await getLearningPath(pathId);

  if (!path) notFound();
  return <LearningPathDetail path={path} />;
}
