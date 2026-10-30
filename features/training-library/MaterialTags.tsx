"use client";

import { useMemo, useState } from "react";

const INITIAL_VISIBLE = 8;
const EXPANDED_PAGE_SIZE = 30;

export function uniqueMaterialTags(tags: string[]) {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const label = tag.trim();
    const key = label.toLocaleLowerCase();
    if (!label || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MaterialTags({ tags }: Readonly<{ tags: string[] }>) {
  const labels = useMemo(() => uniqueMaterialTags(tags), [tags]);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const start = expanded ? page * EXPANDED_PAGE_SIZE : 0;
  const visible = labels.slice(start, expanded ? start + EXPANDED_PAGE_SIZE : INITIAL_VISIBLE);
  const end = start + visible.length;
  const pageCount = Math.ceil(labels.length / EXPANDED_PAGE_SIZE);

  if (!labels.length) return null;

  return (
    <div className="material-tags" aria-label="Material topics, tools, and systems">
      <div className="tag-row">
        {visible.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      {labels.length > INITIAL_VISIBLE && !expanded ? (
        <button type="button" className="text-link material-tags__control" onClick={() => { setExpanded(true); setPage(0); }}>
          Show more tags ({labels.length})
        </button>
      ) : null}
      {expanded ? (
        <div className="material-tags__pagination">
          <span aria-live="polite">Showing tags {start + 1}–{end} of {labels.length}</span>
          <button type="button" className="text-link material-tags__control" disabled={page === 0} onClick={() => { setPage((current) => current - 1); }}>Previous</button>
          <button type="button" className="text-link material-tags__control" disabled={page >= pageCount - 1} onClick={() => { setPage((current) => current + 1); }}>Next</button>
          <button type="button" className="text-link material-tags__control" onClick={() => { setExpanded(false); setPage(0); }}>Show fewer</button>
        </div>
      ) : null}
    </div>
  );
}
