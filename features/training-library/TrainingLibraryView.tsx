import TrainingLibraryFilters from "./TrainingLibraryFilters";
import MaterialCard from "./MaterialCard";
import type { CatalogMaterial } from "@/lib/gateway/types";

export interface TrainingLibraryViewProps {
  materials: CatalogMaterial[];
  total: number;
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
}

function CatalogHero() {
  return (
    <section className="page-hero" aria-labelledby="catalog-heading">
      <div className="page-hero__shell">
        <span className="eyebrow">Training Library</span>
        <h1 id="catalog-heading">Search by what you want to learn or use.</h1>
        <p>
          This curated prototype demonstrates 28 real Snapshot v2 materials. Filters combine topics,
          tools, systems, programs, and available resource types.
        </p>
      </div>
    </section>
  );
}

interface CatalogResultsProps {
  materials: CatalogMaterial[];
  total: number;
  activeFilters: { key: string; value: string }[];
  onRemoveFilter: (key: string) => void;
  onReset: () => void;
  searchValue: string;
  onSearch: (value: string) => void;
}

function CatalogResults({ materials, total, activeFilters, onRemoveFilter, onReset, searchValue, onSearch }: Readonly<CatalogResultsProps>) {
  return (
    <div>
      <label htmlFor="catalog-search" className="sr-only">Search the library by keyword or metadata</label>
      <div className="catalog-search-wrap">
        <input
          id="catalog-search"
          className="catalog-search"
          type="search"
          placeholder="Try Expanse, Slurm, GPU, Jupyter, instructor, recording…"
          value={searchValue}
          onChange={(event) => { onSearch(event.target.value); }}
        />
      </div>

      <div className="catalog-toolbar">
        <p className="catalog-count" aria-live="polite">
          {total} {total === 1 ? "material" : "materials"} shown
        </p>
        <button type="button" className="button button--secondary" onClick={() => { onReset(); }}>Reset filters</button>
      </div>

      <div className="active-filters" aria-label={activeFilters.length ? "Active filters" : "No active filters"}>
        {activeFilters.length > 0 ? (
          activeFilters.map(({ key, value }) => (
            <button key={`${key}-${value}`} className="filter-chip" type="button" onClick={() => { onRemoveFilter(key); }}>
              {value} <span aria-hidden="true">×</span>
            </button>
          ))
        ) : null}
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <h2>No materials match those filters</h2>
          <p>Try removing a filter or searching for a broader topic.</p>
          <button type="button" className="button button--secondary" onClick={() => { onReset(); }}>Reset filters</button>
        </div>
      ) : (
        <div className="catalog-results">
          {materials.map((material) => <MaterialCard key={material.id} material={material} />)}
        </div>
      )}
    </div>
  );
}

export default function TrainingLibraryView({
  materials,
  total,
  activeFilters,
  onRemoveFilter,
  onReset,
  searchValue,
  onSearch,
  filters,
  values,
  onChange,
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
            materials={materials}
            total={total}
            activeFilters={activeFilters}
            onRemoveFilter={onRemoveFilter}
            onReset={onReset}
            searchValue={searchValue}
            onSearch={onSearch}
          />
        </div>
      </section>
    </>
  );
}
