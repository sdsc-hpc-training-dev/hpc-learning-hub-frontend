import Link from "next/link";
import type { CatalogMaterial } from "@/lib/gateway/types";
import MaterialCard from "./MaterialCard";

interface MaterialDetailProps {
  material: CatalogMaterial;
  relatedMaterials: CatalogMaterial[];
}

function formatDate(value?: string | null) {
  if (!value) return "Not specified";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not specified"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function listOrFallback(items: string[]) {
  return items.length ? items.join(", ") : "Not specified";
}

function resourceLabel(type: string) {
  return type.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function relatedScore(material: CatalogMaterial, candidate: CatalogMaterial) {
  if (material.id === candidate.id) return -1;

  return (
    candidate.topics.filter((item) => material.topics.includes(item)).length * 3
    + candidate.tools.filter((item) => material.tools.includes(item)).length * 2
    + candidate.systems.filter((item) => material.systems.includes(item)).length * 2
    + (candidate.series && candidate.series === material.series ? 2 : 0)
  );
}

export function rankRelatedMaterials(material: CatalogMaterial, candidates: CatalogMaterial[]) {
  return candidates
    .map((candidate) => ({ candidate, score: relatedScore(material, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

export default function MaterialDetail({ material, relatedMaterials }: Readonly<MaterialDetailProps>) {
  const resources = material.resources.filter((resource) => resource.url);
  const tags = [...material.topics, ...material.tools, ...material.systems].slice(0, 8);
  const related = rankRelatedMaterials(material, relatedMaterials);

  return (
    <>
      <section className="material-hero">
        <div className="section-shell material-hero__layout">
          <div id="material-body">
            <span className="eyebrow">{material.series ?? "SDSC training material"}</span>
            <div className="material-title-row">
              <h1>{material.title}</h1>
            </div>
            <p className="material-summary">{material.summary ?? material.description ?? "No summary available."}</p>
            <div className="tag-row" aria-label="Material topics and tools">
              {tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
            </div>
          </div>
          <aside className="material-facts" aria-label="Material details">
            <div className="fact-row"><strong>Date</strong><span>{formatDate(material.date)}</span></div>
            <div className="fact-row"><strong>Instructor</strong><span>{listOrFallback(material.instructors)}</span></div>
            <div className="fact-row"><strong>Systems</strong><span>{listOrFallback(material.systems)}</span></div>
            <div className="fact-row"><strong>Format</strong><span>{resourceLabel(resources[0]?.type ?? "Catalog material")}</span></div>
            <div className="fact-row"><strong>Freshness</strong><span>Not assessed</span></div>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="resources-heading">
        <div className="section-shell">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Use the material</span>
              <h2 id="resources-heading">Available resources</h2>
              <p>Every destination below comes from the selected Snapshot v2 catalog record.</p>
            </div>
          </div>
          {resources.length ? (
            <div className="resource-list">
              {resources.map((resource) => (
                <a className="resource-link" href={resource.url ?? "#"} target="_blank" rel="noopener noreferrer" key={resource.id}>
                  <span><strong>{resource.title}</strong><br /><small>{resourceLabel(resource.type)}</small></span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-state"><h2>No public resource link is available</h2><p>This catalog record does not include a destination.</p></div>
          )}
        </div>
      </section>

      <section className="section section--soft" aria-labelledby="related-heading">
        <div className="section-shell">
          <div className="section-heading">
            <span className="eyebrow">Continue exploring</span>
            <h2 id="related-heading">Related materials</h2>
            <p>Related items are chosen from overlapping topics, tools, systems, and programs in the prototype subset.</p>
          </div>
          {related.length ? (
            <div className="related-materials-grid">
              {related.map((candidate) => (
                <MaterialCard key={candidate.id} material={candidate} compact />
              ))}
            </div>
          ) : <p>No related materials were identified in the curated subset.</p>}
        </div>
      </section>

      <section className="section section--compact section--blue">
        <div className="section-shell material-canonical">
          <p><strong>Canonical material ID:</strong> <span>{material.id}</span></p>
          <Link className="text-link" href={material.systems[0] ? `/materials?system=${encodeURIComponent(material.systems[0])}` : "/materials"}>Return to related catalog results →</Link>
        </div>
      </section>
    </>
  );
}