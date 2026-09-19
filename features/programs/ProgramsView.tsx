import Link from "next/link";
import MaterialCard from "@/features/training-library/MaterialCard";
import type { GatewayEventSeries } from "@/lib/gateway/types";
import type { SelectedProgram } from "./api";

interface ProgramsViewProps {
  programs: GatewayEventSeries[];
  selectedProgram: SelectedProgram | null;
}

function programHref(programId: string): string {
  return `/programs?program=${encodeURIComponent(programId)}#program-detail`;
}

function ProgramCard({
  program,
  selected,
}: Readonly<{ program: GatewayEventSeries; selected: boolean }>) {
  const href = programHref(program.id);
  return (
    <article className={`program-card${selected ? " program-card--selected" : ""}`}>
      <span className="eyebrow">Training series</span>
      <h3>
        <Link href={href} aria-current={selected ? "page" : undefined}>
          {program.name}
        </Link>
      </h3>
      <p>Explore representative training materials associated with this series.</p>
      <Link className="text-link program-card__link" href={href}>
        View collection <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function ProgramOverview({
  programs,
  selectedProgramId,
}: Readonly<{ programs: GatewayEventSeries[]; selectedProgramId?: string }>) {
  return (
    <section className="section" aria-labelledby="program-overview-heading">
      <div className="section-shell">
        <div className="section-heading">
          <span className="eyebrow">Browse collections</span>
          <h2 id="program-overview-heading">
            Choose a program to see representative training.
          </h2>
        </div>
        {programs.length > 0 ? (
          <div className="program-grid">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={program.id === selectedProgramId}
              />
            ))}
          </div>
        ) : (
          <div className="programs-status" role="status">
            <p>No programs or series are currently listed.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramDetail({ program }: Readonly<{ program: SelectedProgram | null }>) {
  return (
    <section
      className="section section--soft"
      id="program-detail"
      aria-labelledby="program-detail-heading"
    >
      <div className="section-shell">
        {program ? (
          <>
            <div className="section-heading section-heading--split">
              <div>
                <span className="eyebrow">Selected series</span>
                <h2 id="program-detail-heading">{program.name}</h2>
                <p>
                  Showing {program.materials.length} representative{" "}
                  {program.materials.length === 1 ? "material" : "materials"} from{" "}
                  {program.total} associated with this series.
                </p>
              </div>
              <Link className="text-link" href="/materials">
                Browse the Training Library <span aria-hidden="true">→</span>
              </Link>
            </div>
            {program.materials.length > 0 ? (
              <div className="program-material-grid">
                {program.materials.map((material) => (
                  <MaterialCard compact key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="programs-status" role="status">
                <p>No training materials are currently connected to this series.</p>
              </div>
            )}
          </>
        ) : (
          <div className="section-heading">
            <span className="eyebrow">How programs help</span>
            <h2 id="program-detail-heading">
              Collections add context to individual materials.
            </h2>
            <p>Select a program above to see training associated with that series.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProgramsView({
  programs,
  selectedProgram,
}: Readonly<ProgramsViewProps>) {
  return (
    <div className="programs-page">
      <section className="page-hero" aria-labelledby="programs-heading">
        <div className="page-hero__shell">
          <span className="eyebrow">Programs &amp; Series</span>
          <h1 id="programs-heading">
            See how individual sessions fit into a larger program.
          </h1>
          <p>
            Explore our various training programs and recurring series to find the
            right fit for your learning goals.
          </p>
        </div>
      </section>
      <ProgramOverview
        programs={programs}
        selectedProgramId={selectedProgram?.id}
      />
      <ProgramDetail program={selectedProgram} />
    </div>
  );
}
