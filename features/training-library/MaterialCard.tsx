import Link from "next/link";
import type { CatalogMaterial } from "@/lib/gateway/types";
import { catalogPlainText, resourceTypeSummary } from "./presentation";

interface MaterialCardProps {
  material: CatalogMaterial;
  compact?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function truncate(value: string | null | undefined, length: number) {
  const clean = (value ?? "").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

export default function MaterialCard({ material, compact = false }: Readonly<MaterialCardProps>) {
  const meta = [
    formatDate(material.date),
    material.series,
    material.systems[0],
    material.instructors.length ? `Instructor: ${material.instructors.join(", ")}` : null,
  ].filter(Boolean);
  const href = `/materials/${encodeURIComponent(material.id)}`;
  const cardClassName = compact
    ? "material-card material-card--compact"
    : "material-card";
  const title = catalogPlainText(material.title) || "Untitled material";
  const summary = truncate(
    catalogPlainText(material.summary ?? material.description) ||
      "No summary available.",
    compact ? 112 : 180,
  );

  return (
    <article className={cardClassName}>
      <div className="material-card__body">
        <div className="material-card__meta">{meta.join(" | ") || "SDSC training material"}</div>
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        <p>{summary}</p>
        <div className="tag-row" role="group" aria-label="Topics and tools">
          {[...material.topics, ...material.tools].slice(0, compact ? 2 : 3).map((item) => (
            <span className="tag" key={`${material.id}-${item}`}>{item}</span>
          ))}
        </div>
      </div>
      <div className="material-card__footer">
        <span>{resourceTypeSummary(material.resources)}</span>
        <Link className="text-link" href={href}>
          View material <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
