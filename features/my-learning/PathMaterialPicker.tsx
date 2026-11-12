"use client";

import { useEffect, useId, useState } from "react";
import type { GatewayMaterialPage } from "@/lib/gateway/types";
import { catalogPlainText } from "@/features/training-library/presentation";
import type { Bookmark } from "./api";

interface MaterialChoice {
  id: string;
  title: string;
}
type CatalogResults =
  | { page: number; search: string; items: MaterialChoice[]; more: boolean }
  | { page: number; search: string; error: true };

async function loadCatalog(
  page: number,
  term: string,
  signal: AbortSignal,
): Promise<CatalogResults> {
  try {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: "10",
      sort: "title",
    });
    if (term) query.set("term", term);
    const response = await fetch(`/api/v1/materials?${query}`, {
      credentials: "omit",
      signal,
    });
    if (!response.ok) throw new Error("Catalog unavailable");
    const data = (await response.json()) as GatewayMaterialPage;
    return {
      page,
      search: term,
      more: page < data.totalPages,
      items: data.items.map(({ id, title }) => ({
        id,
        title: catalogPlainText(title) || "Untitled material",
      })),
    };
  } catch {
    return { page, search: term, error: true };
  }
}

function MaterialChoices({
  choices,
  selected,
  onAdd,
}: Readonly<{
  choices?: MaterialChoice[];
  selected: string[];
  onAdd: (material: MaterialChoice) => void;
}>) {
  if (!choices) return <p role="status">Loading materials...</p>;
  if (!choices.length) return <p role="status">No matching materials.</p>;
  return (
    <>
      {choices.map((material) => (
        <label key={material.id}>
          <input
            type="checkbox"
            checked={selected.includes(material.id)}
            disabled={selected.includes(material.id)}
            onChange={() => {
              onAdd(material);
            }}
          />{" "}
          {material.title}
        </label>
      ))}
    </>
  );
}

// eslint-disable-next-line complexity, max-lines-per-function -- Keep the source, search, and pagination controls together.
export default function PathMaterialPicker({
  bookmarks,
  titles,
  selected,
  onAdd,
}: Readonly<{
  bookmarks: Bookmark[];
  titles: Map<string, string>;
  selected: string[];
  onAdd: (material: MaterialChoice) => void;
}>) {
  const id = useId();
  const [source, setSource] = useState(
    bookmarks.length ? "bookmarks" : "library",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, retry] = useState(0);
  const [results, setResults] = useState<CatalogResults>();
  const term = search.trim();
  const current =
    results?.search === term && results.page === page ? results : undefined;
  useEffect(() => {
    if (source !== "library") return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadCatalog(page, term, controller.signal).then((result) => {
        if (!controller.signal.aborted) setResults(result);
        return undefined;
      });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [source, page, term, attempt]);

  const catalog = current && "items" in current ? current : undefined;
  const choices =
    source === "bookmarks"
      ? bookmarks
          .map(({ materialId }) => ({
            id: materialId,
            title: titles.get(materialId) ?? `Material ${materialId}`,
          }))
          .filter(({ title }) =>
            title.toLowerCase().includes(term.toLowerCase()),
          )
      : catalog?.items;

  return (
    <fieldset className="path-picker">
      <legend>Add materials</legend>
      <div className="path-picker__filters">
        <label htmlFor={`${id}-search`}>
          Find a material
          <input
            id={`${id}-search`}
            type="search"
            maxLength={100}
            value={search}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label htmlFor={`${id}-source`}>
          Look in
          <select
            id={`${id}-source`}
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
          >
            <option value="library">Training Library</option>
            <option value="bookmarks">My bookmarks</option>
          </select>
        </label>
      </div>
      {source === "library" && current && "error" in current ? (
        <p role="status">
          The library could not be loaded.{" "}
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setResults(undefined);
              retry(attempt + 1);
            }}
          >
            Try again
          </button>
        </p>
      ) : (
        <MaterialChoices choices={choices} selected={selected} onAdd={onAdd} />
      )}
      {source === "library" && catalog && (page > 1 || catalog.more) ? (
        <div className="learner-actions" aria-label="Material search pages">
          <button
            className="button button--secondary"
            type="button"
            disabled={page === 1}
            onClick={() => {
              setPage(page - 1);
            }}
          >
            Previous
          </button>
          <button
            className="button button--secondary"
            type="button"
            disabled={!catalog.more}
            onClick={() => {
              setPage(page + 1);
            }}
          >
            Next
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}
