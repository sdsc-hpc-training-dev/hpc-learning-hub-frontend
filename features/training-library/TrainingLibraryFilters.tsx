"use client";

import { useMemo } from "react";

export type FilterOption = {
  label: string;
  value: string;
};

export type TrainingLibraryFiltersProps = {
  options: {
    topics: FilterOption[];
    tools: FilterOption[];
    systems: FilterOption[];
    programs: FilterOption[];
    resourceTypes: FilterOption[];
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
  onReset: () => void;
};

export default function TrainingLibraryFilters({
  options,
  values,
  onChange,
  onReset,
}: TrainingLibraryFiltersProps) {
  const resourceOptions = useMemo(() => [{ label: "All resource types", value: ""}, ...options.resourceTypes], [options.resourceTypes]);

  const controlClassName = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200";

  return (
    <aside className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <label htmlFor="catalog-topic" className="mb-1 block text-sm font-semibold text-slate-700">Topic</label>
          <select id="catalog-topic" className={controlClassName} value={values.topic} onChange={(event) => onChange("topic", event.target.value)}>
            <option value="">All topics</option>
            {options.topics.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-tool" className="mb-1 block text-sm font-semibold text-slate-700">Tool</label>
          <select id="catalog-tool" className={controlClassName} value={values.tool} onChange={(event) => onChange("tool", event.target.value)}>
            <option value="">All tools</option>
            {options.tools.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-system" className="mb-1 block text-sm font-semibold text-slate-700">SDSC system</label>
          <select id="catalog-system" className={controlClassName} value={values.system} onChange={(event) => onChange("system", event.target.value)}>
            <option value="">All systems</option>
            {options.systems.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-program" className="mb-1 block text-sm font-semibold text-slate-700">Program or series</label>
          <select id="catalog-program" className={controlClassName} value={values.program} onChange={(event) => onChange("program", event.target.value)}>
            <option value="">All programs</option>
            {options.programs.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-resource" className="mb-1 block text-sm font-semibold text-slate-700">Available resource</label>
          <select id="catalog-resource" className={controlClassName} value={values.resource} onChange={(event) => onChange("resource", event.target.value)}>
            {resourceOptions.map((option) => (
              <option key={option.value || "all-resource"} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catalog-date" className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
          <input
            id="catalog-date"
            type="date"
            className={controlClassName}
            value={values.date}
            onChange={(event) => onChange("date", event.target.value)}
          />
        </div>

        <button type="button" className="w-full rounded-md border border-sky-700 bg-white px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </aside>
  );
}
