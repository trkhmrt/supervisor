"use client";

import { Search } from "lucide-react";

type SelectOption = { value: string; label: string };

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  selectLabel?: string;
  selectValue?: string;
  selectOptions?: SelectOption[];
  onSelectChange?: (v: string) => void;
  secondSelectLabel?: string;
  secondSelectValue?: string;
  secondSelectOptions?: SelectOption[];
  onSecondSelectChange?: (v: string) => void;
};

export function AdminFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Ara…",
  selectLabel,
  selectValue = "",
  selectOptions,
  onSelectChange,
  secondSelectLabel,
  secondSelectValue = "",
  secondSelectOptions,
  onSecondSelectChange,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex-1 min-w-[200px]">
        <span className="sr-only">Ara</span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinical-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-premium border border-clinical-border py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
      </label>
      {selectOptions && onSelectChange && (
        <label className="min-w-[160px]">
          {selectLabel && (
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
              {selectLabel}
            </span>
          )}
          <select
            value={selectValue}
            onChange={(e) => onSelectChange(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-3 py-2.5 text-sm"
          >
            {selectOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {secondSelectOptions && onSecondSelectChange && (
        <label className="min-w-[160px]">
          {secondSelectLabel && (
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
              {secondSelectLabel}
            </span>
          )}
          <select
            value={secondSelectValue}
            onChange={(e) => onSecondSelectChange(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-3 py-2.5 text-sm"
          >
            {secondSelectOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
