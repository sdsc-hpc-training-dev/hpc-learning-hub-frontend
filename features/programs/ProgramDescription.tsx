"use client";

import { useId, useState } from "react";

export function collapsedSeriesDescription(text: string): string {
  if (text.length <= 200) return text;
  const candidate = text.slice(0, 199);
  const space = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, space > 120 ? space : 199).trimEnd()}…`;
}

export default function ProgramDescription({
  text,
  name,
}: Readonly<{ text: string; name: string }>) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 200;
  return (
    <div className="program-description">
      <div
        id={id}
        className="program-description__text"
        role="region"
        aria-label={`${name} description`}
        tabIndex={0}
      >
        <p>{expanded ? text : collapsedSeriesDescription(text)}</p>
      </div>
      <div className="program-description__control">
        {long ? (
          <button
            type="button"
            className="material-summary__toggle"
            aria-controls={id}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Show less" : "Show more"} about ${name}`}
            onClick={() => {
              setExpanded((current) => !current);
            }}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
