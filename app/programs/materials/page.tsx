import type { Metadata } from "next";
import Link from "next/link";
import InlineError from "@/components/ui/InlineError";
import SeriesMaterialsView from "@/features/programs/SeriesMaterialsView";
import {
  getSeriesMaterialsData,
  parseSeriesPage,
  seriesMaterialsHref,
} from "@/features/programs/api";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Series Materials | HPC Learning Hub",
};
export const dynamic = "force-dynamic";

export default async function SeriesMaterialsPage({
  searchParams = Promise.resolve({}),
}: Readonly<{
  searchParams?: Promise<{
    program?: string | string[];
    page?: string | string[];
  }>;
}> = {}) {
  const params = await searchParams;
  const programId = Array.isArray(params.program)
    ? params.program[0]
    : params.program;
  const requestedPage = parseSeriesPage(params.page);
  let data;
  try {
    data = await getSeriesMaterialsData(programId, requestedPage);
  } catch (error) {
    console.error("Failed to load series materials", error);
    return (
      <section className="section">
        <div className="section-shell">
          <h1>Series materials unavailable</h1>
          <InlineError
            title="Materials are unavailable."
            message="We could not reach this collection. Please try again."
          />
          <Link className="text-link" href="/programs">
            Programs &amp; Series
          </Link>
        </div>
      </section>
    );
  }
  if (data.program && data.page !== requestedPage)
    redirect(seriesMaterialsHref(data.program.id, data.page));
  return <SeriesMaterialsView {...data} />;
}
