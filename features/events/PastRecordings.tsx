"use client";

import Link from "next/link";
import { useState } from "react";
import type { RecordedMaterial } from "./api";

const MATERIALS_PER_PAGE = 6;

function formatDate(value: string | null): string {
  if (!value) return "Recording date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recording date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date);
}

function truncate(value: string | null, length = 180): string {
  const clean = (value ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return "Additional event details are not available yet.";
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

function RecordingCard({ recording }: Readonly<{ recording: RecordedMaterial }>) {
  const href = `/materials/${encodeURIComponent(recording.id)}`;
  return (
    <article className="event-card">
      <div className="event-card__date">{formatDate(recording.recordedAt)}</div>
      <span className="event-card__type">Recorded session</span>
      <h3>
        <Link href={href}>{recording.title}</Link>
      </h3>
      <p>{truncate(recording.description)}</p>
      <Link className="text-link event-card__link" href={href}>
        Open recording or material <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default function PastRecordings({
  recordings,
}: Readonly<{ recordings: RecordedMaterial[] }>) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(recordings.length / MATERIALS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const visibleRecordings = recordings.slice(
    currentPage * MATERIALS_PER_PAGE,
    (currentPage + 1) * MATERIALS_PER_PAGE,
  );
  const firstMaterial = currentPage * MATERIALS_PER_PAGE + 1;
  const lastMaterial = Math.min(
    (currentPage + 1) * MATERIALS_PER_PAGE,
    recordings.length,
  );

  return (
    <section className="section" aria-labelledby="recordings-heading">
      <div className="section-shell">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">Training archive</span>
            <h2 id="recordings-heading">Past sessions and recordings</h2>
            <p>Open a material to explore its recording and supporting resources.</p>
          </div>
          <Link className="text-link" href="/materials">
            Browse the Training Library <span aria-hidden="true">→</span>
          </Link>
        </div>
        {recordings.length > 0 ? (
          <>
            <div className="event-grid">
              {visibleRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
            {pageCount > 1 ? (
              <nav className="event-pagination" aria-label="Recording pages">
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span aria-live="polite">
                  Showing {firstMaterial}–{lastMaterial} of {recordings.length}
                  {" · "}Page {currentPage + 1} of {pageCount}
                </span>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </nav>
            ) : null}
          </>
        ) : (
          <div className="events-status" role="status">
            <p>No recorded training sessions are currently available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
