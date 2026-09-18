import Link from "next/link";
import type { LearningPath, LearningPathItem } from "@/lib/gateway/types";

interface LearningPathsViewProps {
  paths: LearningPath[];
}

interface LearningPathDetailProps {
  path: LearningPath;
}

function PathCard({ path }: Readonly<{ path: LearningPath }>) {
  const stepLabel = `${String(path.items.length)} ${path.items.length === 1 ? "step" : "steps"}`;

  return (
    <article className="learning-path-card">
      <span className="eyebrow">{path.estimatedScope ?? stepLabel}</span>
      <h2>
        <Link href={`/learning-paths/${encodeURIComponent(path.id)}`}>
          {path.title}
        </Link>
      </h2>
      <p>
        {path.description ??
          "Open this path to explore its recommended training sequence."}
      </p>
      <div className="learning-path-card__footer">
        <span>{stepLabel}</span>
        <Link
          className="text-link"
          href={`/learning-paths/${encodeURIComponent(path.id)}`}
        >
          View path <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function EmptyPathsStatus() {
  return (
    <div className="learning-path-status" role="status">
      <h2>No learning paths are available yet.</h2>
      <p>
        Browse the Training Library to find individual materials while paths are
        being prepared.
      </p>
      <Link className="button button--gold" href="/materials">
        Browse training
      </Link>
    </div>
  );
}

function EmptyPathMaterialsStatus() {
  return (
    <div className="learning-path-status" role="status">
      <h2>No training materials have been added to this path yet.</h2>
      <p>Please check back later or browse the Training Library.</p>
      <Link className="button button--gold" href="/materials">
        Browse training
      </Link>
    </div>
  );
}

export function LearningPathsView({
  paths,
}: Readonly<LearningPathsViewProps>) {
  return (
    <div className="learning-paths-page">
      <section
        className="page-hero page-hero--paths"
        aria-labelledby="learning-paths-heading"
      >
        <div className="page-hero__shell">
          <span className="eyebrow">Learning Paths</span>
          <h1 id="learning-paths-heading">
            Start with a sequence, not a search box.
          </h1>
          <p>
            Start with a curated learning path to build your skills in High
            Performance Computing (HPC). These two paths arrange HPC trainings
            into a clear first journey. They are proposed guidance, not a
            completed curriculum.
          </p>
        </div>
      </section>
      <section className="section" aria-labelledby="available-paths-heading">
        <div className="section-shell">
          <div className="section-heading">
            <span className="eyebrow">Choose a goal</span>
            <h2 id="available-paths-heading">Available learning paths</h2>
            <p>
              Each path organizes existing public materials into a practical
              progression.
            </p>
          </div>
          {paths.length > 0 ? (
            <div className="learning-path-grid">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          ) : (
            <EmptyPathsStatus />
          )}
        </div>
      </section>
    </div>
  );
}

function PathStep({ item }: Readonly<{ item: LearningPathItem }>) {
  return (
    <li className="learning-path-step">
      <span className="learning-path-step__number" aria-hidden="true">
        {item.position}
      </span>
      <div>
        <h2>
          <Link href={`/materials/${encodeURIComponent(item.material.id)}`}>
            {item.material.title ?? "Untitled training material"}
          </Link>
        </h2>
        {item.material.description ? <p>{item.material.description}</p> : null}
        <Link
          className="text-link"
          href={`/materials/${encodeURIComponent(item.material.id)}`}
        >
          Open material <span aria-hidden="true">→</span>
        </Link>
      </div>
    </li>
  );
}

function PathMetadata({ path }: Readonly<{ path: LearningPath }>) {
  return (
    <aside className="learning-path-meta" aria-label="Path information">
      <div>
        <strong>Designed for</strong>
        <p>{path.audience ?? "All HPC learners"}</p>
      </div>
      <div>
        <strong>Before you begin</strong>
        <p>{path.prerequisites ?? "No prerequisites specified"}</p>
      </div>
      <div>
        <strong>Estimated scope</strong>
        <p>
          {path.estimatedScope ?? `${String(path.items.length)} guided steps`}
        </p>
      </div>
    </aside>
  );
}

export function LearningPathDetail({
  path,
}: Readonly<LearningPathDetailProps>) {
  const orderedItems = [...path.items].sort(
    (first, second) => first.position - second.position,
  );
  return (
    <div className="learning-path-detail-page">
      <section className="page-hero page-hero--path-detail">
        <div className="page-hero__shell">
          <Link className="page-hero__back" href="/learning-paths">
            ← All learning paths
          </Link>
          <span className="eyebrow">Guided learning path</span>
          <h1>{path.title}</h1>
          <p>
            {path.description ??
              "Follow the recommended materials below in order."}
          </p>
        </div>
      </section>
      <section className="section section--soft">
        <div className="section-shell learning-path-detail__layout">
          <div>
            <div className="section-heading">
              <span className="eyebrow">Suggested progression</span>
              <h2>Work through these materials in order</h2>
            </div>
            {orderedItems.length > 0 ? (
              <ol className="learning-path-steps">
                {orderedItems.map((item) => (
                  <PathStep
                    key={`${String(item.position)}-${item.material.id}`}
                    item={item}
                  />
                ))}
              </ol>
            ) : (
              <EmptyPathMaterialsStatus />
            )}
          </div>
          <PathMetadata path={path} />
        </div>
      </section>
    </div>
  );
}
