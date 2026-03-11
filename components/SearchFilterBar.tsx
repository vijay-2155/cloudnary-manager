'use client';

import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export type SortField = 'name' | 'date' | 'size';
export type SortDir = 'asc' | 'desc';

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField, dir: SortDir) => void;
  formatFilter: string;
  onFormatChange: (fmt: string) => void;
  availableFormats: string[];
  totalCount: number;
  filteredCount: number;
}

export default function SearchFilterBar({
  search, onSearchChange,
  sortField, sortDir, onSortChange,
  formatFilter, onFormatChange,
  availableFormats, totalCount, filteredCount,
}: SearchFilterBarProps) {
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, field === 'date' ? 'desc' : 'asc');
    }
  };

  const sortOptions: { label: string; field: SortField }[] = [
    { label: 'Name', field: 'name' },
    { label: 'Date', field: 'date' },
    { label: 'Size', field: 'size' },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search images…"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort buttons */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
          <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          {sortOptions.map(({ label, field }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                sortField === field
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {label}
              {sortField === field && (
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>

        {/* Format filter */}
        {availableFormats.length > 0 && (
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
            <SlidersHorizontal className="ml-1 h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <button
              onClick={() => onFormatChange('')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                !formatFilter
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            {availableFormats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => onFormatChange(fmt)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium uppercase transition-all ${
                  formatFilter === fmt
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        )}

        {/* Count */}
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {filteredCount}{filteredCount !== totalCount && `/${totalCount}`} images
        </span>
      </div>
    </div>
  );
}
