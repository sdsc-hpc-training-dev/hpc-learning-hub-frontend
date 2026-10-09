import TrainingLibraryFilters from "./TrainingLibraryFilters";
import MaterialCard from "./MaterialCard";
import InlineError from "@/components/ui/InlineError";
import type { CatalogMaterial } from "@/lib/gateway/types";

export interface TrainingLibraryViewProps {
  pending?: boolean;
  materials: CatalogMaterial[];
  total: number;
  error?: string;
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string) => void;
  onReset: () => void;
  searchValue: string;
  onSearch: (value: string) => void;
  filters: {
    topics: { label: string; value: string }[];
    tools: { label: string; value: string }[];
    systems: { label: string; value: string }[];
    programs: { label: string; value: string }[];
    resourceTypes: { label: string; value: string }[];
  };
  values: {
    query: string;
    topic: string;
    tool: string;
    system: string;
    program: string;
    resource: string;
    date: string;
  };
  onChange: (key: string, value: string) => void;
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

interface CatalogResultsProps {
  pending?: boolean;
  materials: CatalogMaterial[];
  total: number;
  error?: string;
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string) => void;
  onReset: () => void;
  searchValue: string;
  onSearch: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface CatalogSearchControlsProps {
  total: number;
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string) => void;
  onReset: () => void;
  searchValue: string;
  onSearch: (value: string) => void;
}

function ActiveFilterList({
  activeFilters,
  onRemoveFilter,
}: Readonly<{
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string) => void;
}>) {
  return (
    <div
      className="active-filters"
      aria-label={activeFilters.length ? "Active filters" : "No active filters"}
    >
      {activeFilters.map(({ key, value }) => (
        <button
          key={key + "-" + value}
          className="filter-chip"
          type="button"
          onClick={() => {
            onRemoveFilter(key);
          }}
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
  searchValue,
  onSearch,
}: Readonly<CatalogSearchControlsProps>) {
  return (
    <>
      <label htmlFor="catalog-search" className="sr-only">
        Search material titles and descriptions
      </label>
      <div className="catalog-search-wrap">
        <input
          id="catalog-search"
          className="catalog-search"
          type="search"
          placeholder="Search material titles and descriptions…"
          value={searchValue}
          onChange={(event) => {
            onSearch(event.target.value);
          }}
        />
      </div>
      <div className="catalog-toolbar">
        <p className="catalog-count" aria-live="polite">
          {total} {total === 1 ? "material" : "materials"} found
        </p>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            onReset();
          }}
        >
          Reset filters
        </button>
      </div>
      <ActiveFilterList
        activeFilters={activeFilters}
        onRemoveFilter={onRemoveFilter}
      />
    </>
  );
}

function CatalogContent({
  materials,
  error,
  onReset,
}: Readonly<{
  materials: CatalogMaterial[];
  error?: string;
  onReset: () => void;
}>) {
  if (error) {
    return (
      <InlineError
        title="Training materials are unavailable."
        message={error}
      />
    );
  }
  if (materials.length === 0) {
    return (
      <div className="empty-state">
        <h2>No materials match those filters</h2>
        <p>Try removing a filter or searching for a broader topic.</p>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            onReset();
          }}
        >
          Reset filters
        </button>
      </div>
    );
  }
  return (
    <div className="catalog-results">
      {materials.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  );
}

function CatalogResults({
  pending,
  materials,
  total,
  activeFilters,
  onRemoveFilter,
  onReset,
  searchValue,
  onSearch,
  page,
  totalPages,
  onPageChange,
  error,
}: Readonly<CatalogResultsProps>) {
  return (
    <div aria-busy={pending}>
      <CatalogSearchControls
        total={total}
        activeFilters={activeFilters}
        onRemoveFilter={onRemoveFilter}
        onReset={onReset}
        searchValue={searchValue}
        onSearch={onSearch}
      />
      <CatalogContent materials={materials} error={error} onReset={onReset} />
      {!error && totalPages > 1 ? (
        <nav
          className="catalog-pagination"
          aria-label="Training material pages"
        >
          <button
            type="button"
            className="button button--secondary"
            disabled={Boolean(pending) || page <= 1}
            onClick={() => {
              onPageChange(page - 1);
            }}
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="button button--secondary"
            disabled={Boolean(pending) || page >= totalPages}
            onClick={() => {
              onPageChange(page + 1);
            }}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default function TrainingLibraryView({
  pending,
  materials,
  total,
  error,
  activeFilters,
  onRemoveFilter,
  onReset,
  searchValue,
  onSearch,
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
            <TrainingLibraryFilters
              options={filters}
              values={values}
              onChange={onChange}
              onReset={onReset}
            />
          </div>

          <CatalogResults
            pending={pending}
            materials={materials}
            total={total}
            error={error}
            activeFilters={activeFilters}
            onRemoveFilter={onRemoveFilter}
            onReset={onReset}
            searchValue={searchValue}
            onSearch={onSearch}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </section>
    </>
  );
}
