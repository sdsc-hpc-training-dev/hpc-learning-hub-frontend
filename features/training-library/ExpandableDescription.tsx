"use client";

import { useId, useState } from "react";

const DEFAULT_LIMIT = 150;

function truncateAtWord(text: string, limit: number) {
  if (text.length <= limit) return text;

  const candidate = text.slice(0, limit + 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const boundary = lastSpace > limit * 0.6 ? lastSpace : limit;
  return `${text.slice(0, boundary).trimEnd()}...`;
}

export default function ExpandableDescription({
  text,
  limit = DEFAULT_LIMIT,
}: Readonly<{ text: string; limit?: number }>) {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();
  const isLong = text.length > limit;

  return (
    <div className="material-summary">
      <p id={descriptionId}>
        {expanded || !isLong ? text : truncateAtWord(text, limit)}
      </p>
      {isLong ? (
        <button
          aria-controls={descriptionId}
          aria-expanded={expanded}
          className="material-summary__toggle"
          onClick={() => {
            setExpanded((current) => !current);
          }}
          type="button"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
