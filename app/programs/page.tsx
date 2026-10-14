import type { Metadata } from "next";
import ProgramsView from "@/features/programs/ProgramsView";
import { getProgramsData } from "@/features/programs/api";

export const metadata: Metadata = {
  title: "Programs & Series | HPC Learning Hub",
  description:
    "Browse SDSC training programs, recurring series, and associated materials.",
};

export const dynamic = "force-dynamic";

interface ProgramsPageProps {
  searchParams?: Promise<{ program?: string | string[] }>;
}

export default async function ProgramsPage({
  searchParams = Promise.resolve({}),
}: Readonly<ProgramsPageProps> = {}) {
  const params = await searchParams;
  const programId = Array.isArray(params.program)
    ? params.program[0]
    : params.program;
  try {
    const data = await getProgramsData(programId);
    return <ProgramsView {...data} />;
  } catch (error) {
    console.error("Failed to load programs", error);
    return (
      <ProgramsView
        programs={[]}
        selectedProgram={null}
        error="We could not reach the training collections. Please try again."
      />
    );
  }
}
