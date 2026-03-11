'use client';

import { Trash2, FolderInput, Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onMove: () => void;
  onCopy: () => void;
  onClear: () => void;
  onSelectAll: () => void;
  totalCount: number;
}

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onMove,
  onCopy,
  onClear,
  onSelectAll,
  totalCount,
}: BulkActionBarProps) {
  const [copyDone, setCopyDone] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
        {/* Count badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            {selectedCount}
          </span>
          <span className="text-sm font-medium text-slate-300">
            selected
          </span>
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
            >
              Select all {totalCount}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            title="Copy URLs"
          >
            {copyDone ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copyDone ? 'Copied!' : 'Copy URLs'}</span>
          </button>

          <button
            onClick={onMove}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
            title="Move to folder"
          >
            <FolderInput className="h-4 w-4" />
            <span>Move to</span>
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
            title="Delete selected"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onClear}
          className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
