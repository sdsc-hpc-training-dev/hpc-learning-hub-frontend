import Link from "next/link";
import MaterialCard from "@/features/training-library/MaterialCard";
import type { SeriesMaterialsData } from "./api";
import { seriesMaterialsHref } from "./api";
import { seriesDescription } from "./descriptions";

function SeriesPagination({
  program,
  page,
  totalPages,
}: Readonly<SeriesMaterialsData>) {
  if (!program) return null;
  return (
    <nav
      className="catalog-pagination"
      aria-label={`${program.name} materials pages`}
    >
      {page > 1 ? (
        <Link
          className="text-link"
          href={seriesMaterialsHref(program.id, page - 1)}
        >
          Previous page
        </Link>
      ) : (
        <span aria-disabled="true">Previous page</span>
      )}
      <span aria-current="page">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          className="text-link"
          href={seriesMaterialsHref(program.id, page + 1)}
        >
          Next page
        </Link>
      ) : (
        <span aria-disabled="true">Next page</span>
      )}
    </nav>
  );
}

export default function SeriesMaterialsView({
  program,
  page,
  totalPages,
}: Readonly<SeriesMaterialsData>) {
  if (!program)
    return (
      <section className="section">
        <div className="section-shell">
          <h1>Series unavailable</h1>
          <p role="status">Choose a listed series to explore its materials.</p>
          <Link className="text-link" href="/programs">
            Programs &amp; Series
          </Link>
        </div>
      </section>
    );

  return (
    <section className="section" aria-labelledby="series-materials-heading">
      <div className="section-shell">
        <Link
          className="text-link"
          href={`/programs?program=${encodeURIComponent(program.id)}#program-detail`}
        >
          Back to {program.name}
        </Link>
        <div className="section-heading">
          <span className="eyebrow">Series materials</span>
          <h1 id="series-materials-heading">{program.name}</h1>
          <p>{seriesDescription(program.name)}</p>
        </div>
        {program.total === 0 ? (
          <p className="programs-status" role="status">
            No training materials are currently connected to this series.
          </p>
        ) : (
          <>
            <p role="status">
              {program.total} associated{" "}
              {program.total === 1 ? "material" : "materials"}. Page {page} of{" "}
              {totalPages}.
            </p>
            <div className="program-material-grid">
              {program.materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
            <SeriesPagination
              program={program}
              page={page}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </section>
  );
}
