"use client";

import { useMemo } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface TrainingLibraryFiltersProps {
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
}

interface SelectControlProps {
  id: string;
  label: string;
  emptyLabel: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

function SelectControl({ id, label, emptyLabel, value, options, onChange }: Readonly<SelectControlProps>) {
  const controlClassName = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      <select id={id} className={controlClassName} value={value} onChange={(event) => { onChange(event.target.value); }}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function TrainingLibraryFilters({
  options,
  values,
  onChange,
  onReset,
}: Readonly<TrainingLibraryFiltersProps>) {
  const resourceOptions = useMemo(() => [{ label: "All resource types", value: ""}, ...options.resourceTypes], [options.resourceTypes]);

  return (
    <aside className="w-full max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="space-y-4">
        <SelectControl id="catalog-topic" label="Topic" emptyLabel="All topics" value={values.topic} options={options.topics} onChange={(value) => { onChange("topic", value); }} />
        <SelectControl id="catalog-tool" label="Tool" emptyLabel="All tools" value={values.tool} options={options.tools} onChange={(value) => { onChange("tool", value); }} />
        <SelectControl id="catalog-system" label="SDSC system" emptyLabel="All systems" value={values.system} options={options.systems} onChange={(value) => { onChange("system", value); }} />
        <SelectControl id="catalog-program" label="Program or series" emptyLabel="All programs" value={values.program} options={options.programs} onChange={(value) => { onChange("program", value); }} />
        <SelectControl id="catalog-resource" label="Available resource" emptyLabel="All resource types" value={values.resource} options={resourceOptions.slice(1)} onChange={(value) => { onChange("resource", value); }} />

        <div>
          <label htmlFor="catalog-date" className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
          <input
            id="catalog-date"
            type="date"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={values.date}
            onChange={(event) => { onChange("date", event.target.value); }}
          />
        </div>

        <button type="button" className="w-full rounded-md border border-sky-700 bg-white px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </aside>
  );
}
