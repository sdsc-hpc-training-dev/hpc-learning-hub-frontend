import type { Metadata } from "next";
import MyLearningView from "@/features/my-learning/MyLearningView";

export const metadata: Metadata = {
  title: "My Learning | HPC Learning Hub",
  description: "Your bookmarked training materials and personal learning paths.",
};

export default function MyLearningPage() {
  return <MyLearningView />;
}
