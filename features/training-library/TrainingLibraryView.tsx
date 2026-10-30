"use client";
/* eslint-disable @typescript-eslint/no-confusing-void-expression, max-lines-per-function */

import { useEffect, useState } from "react";
import TrainingLibraryFilters from "./TrainingLibraryFilters";
import MaterialCard from "./MaterialCard";
import InlineError from "@/components/ui/InlineError";
import type { CatalogMaterial } from "@/lib/gateway/types";
import type { FilterValues } from "./navigation";

export interface TrainingLibraryViewProps {
  pending?: boolean;
  materials: CatalogMaterial[];
  returnTo?: string;
  total: number;
  error?: string;
  activeFilters: { key: keyof FilterValues; value: string }[];
  onRemoveFilter: (key: keyof FilterValues, value?: string) => void;
  onReset: () => void;
  searchTerms: string[];
  onSearch: (terms: string[]) => boolean;
  searchError?: string;
  resetVersion: number;
  filters: {
    topics: { label: string; value: string }[];
    tools: { label: string; value: string }[];
    systems: { label: string; value: string }[];
    programs: { label: string; value: string }[];
    resourceTypes: { label: string; value: string }[];
  };
  values: FilterValues;
  onChange: (key: Exclude<keyof FilterValues, "query">, value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function CatalogHero() {
  return (
    <section className="page-hero" aria-labelledby="catalog-heading">
      <div className="page-hero__shell">
        <span className="eyebrow">Training Library</span>
        <h1 id="catalog-heading">Search by what you want to learn or use.</h1>
        <p>
          Browse the current SDSC training catalog. Filters combine topics,
          tools, systems, programs, and available resource types.
        </p>
      </div>
    </section>
  );
}

function ActiveFilterList({
  activeFilters,
  onRemoveFilter,
}: Readonly<{
  activeFilters: TrainingLibraryViewProps["activeFilters"];
  onRemoveFilter: TrainingLibraryViewProps["onRemoveFilter"];
}>) {
  return (
    <div
      className="active-filters"
      aria-label={activeFilters.length ? "Active filters" : "No active filters"}
    >
      {activeFilters.map(({ key, value }) => (
        <button
          key={`${key}-${value}`}
          className="filter-chip"
          type="button"
          aria-label={`Remove ${value}`}
          onClick={() => onRemoveFilter(key, value)}
        >
          {value} <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
}

function CatalogSearchControls({
  total,
  activeFilters,
  onRemoveFilter,
  onReset,
  searchTerms,
  onSearch,
  searchError,
  resetVersion,
}: Readonly<Pick<
  TrainingLibraryViewProps,
  | "total"
  | "activeFilters"
  | "onRemoveFilter"
  | "onReset"
  | "searchTerms"
  | "onSearch"
  | "searchError"
  | "resetVersion"
>>) {
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);
  const commit = (value: string) => {
    const phrases = value.split(",").map((phrase) => phrase.trim());
    if (onSearch([...searchTerms, ...phrases])) setDraft("");
  };
  useEffect(() => {
    setDraft("");
  }, [resetVersion]);
  return (
    <>
      <label htmlFor="catalog-search" className="sr-only">
        Search training materials
      </label>
      <p id="catalog-search-helper" className="catalog-search-helper">
        Type comma-separated terms to filter training materials.
      </p>
      <div className="catalog-search-wrap">
        <input
          id="catalog-search"
          className="catalog-search"
          type="search"
          placeholder="Search training materials…"
          value={draft}
          aria-describedby="catalog-search-helper"
          onChange={(event) => {
            const value = event.target.value;
            if (composing) {
              setDraft(value);
              return;
            }
            const parts = value.split(",");
            if (parts.length === 1) {
              setDraft(value);
              return;
            }
            if (onSearch([...searchTerms, ...parts.slice(0, -1)])) {
              setDraft(parts.at(-1) ?? "");
            } else {
              setDraft(value);
            }
          }}
          onKeyDown={(event) => {
            if (composing || event.nativeEvent.isComposing || event.key !== "Enter") return;
            event.preventDefault();
            commit(draft);
          }}
          onCompositionStart={() => { setComposing(true); }}
          onCompositionEnd={() => { setComposing(false); }}
        />
        <button
          type="button"
          className="button button--secondary catalog-search-button"
          onClick={() => commit(draft)}
        >
          Search
        </button>
      </div>
      {searchError ? <p className="feedback-error" role="alert">{searchError}</p> : null}
      <ActiveFilterList
        activeFilters={activeFilters}
        onRemoveFilter={onRemoveFilter}
      />
      <div className="catalog-toolbar">
        <p className="catalog-count" aria-live="polite">
          {total} {total === 1 ? "material" : "materials"} found
        </p>
        <button type="button" className="button button--secondary" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </>
  );
}

function CatalogContent({
  materials,
  returnTo,
  error,
  onReset,
}: Readonly<{
  materials: CatalogMaterial[];
  returnTo?: string;
  error?: string;
  onReset: () => void;
}>) {
  if (error) {
    return <InlineError title="Training materials are unavailable." message={error} />;
  }
  if (materials.length === 0) {
    return (
      <div className="empty-state">
        <h2>No materials match those filters</h2>
        <p>Try removing a filter or searching for a broader topic.</p>
        <button type="button" className="button button--secondary" onClick={onReset}>
          Reset filters
        </button>
      </div>
    );
  }
  return <div className="catalog-results">{materials.map((material) => <MaterialCard key={material.id} material={material} returnTo={returnTo} />)}</div>;
}

export default function TrainingLibraryView({
  pending,
  materials,
  returnTo,
  total,
  error,
  activeFilters,
  onRemoveFilter,
  onReset,
  searchTerms,
  onSearch,
  searchError,
  resetVersion,
  filters,
  values,
  onChange,
  page,
  totalPages,
  onPageChange,
}: Readonly<TrainingLibraryViewProps>) {
  return (
    <>
      <CatalogHero />
      <section className="section">
        <div className="section-shell catalog-layout">
          <div className="catalog-filters" aria-label="Training filters">
            <TrainingLibraryFilters options={filters} values={values} onChange={onChange} onReset={onReset} />
          </div>
          <div aria-busy={pending} aria-live="polite">
            {pending ? <span className="sr-only">Updating training materials…</span> : null}
            <CatalogSearchControls
              total={total}
              activeFilters={activeFilters}
              onRemoveFilter={onRemoveFilter}
              onReset={onReset}
              searchTerms={searchTerms}
              onSearch={onSearch}
              searchError={searchError}
              resetVersion={resetVersion}
            />
            <CatalogContent materials={materials} returnTo={returnTo} error={error} onReset={onReset} />
            {!error && totalPages > 1 ? (
              <nav className="catalog-pagination" aria-label="Training material pages">
                <button type="button" className="button button--secondary" disabled={Boolean(pending) || page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
                <span aria-live="polite">Page {page} of {totalPages}</span>
                <button type="button" className="button button--secondary" disabled={Boolean(pending) || page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
