'use client';

import { useState } from 'react';
import { FolderInput, X, Search } from 'lucide-react';
import { CloudinaryFolder } from '@/lib/types';
import { createPortal } from 'react-dom';

interface MoveToFolderModalProps {
  isOpen: boolean;
  selectedCount: number;
  folders: CloudinaryFolder[];
  onMove: (targetFolder: string) => void;
  onClose: () => void;
}

export default function MoveToFolderModal({
  isOpen,
  selectedCount,
  folders,
  onMove,
  onClose,
}: MoveToFolderModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FolderInput className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Move to Folder</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCount} {selectedCount === 1 ? 'image' : 'images'} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Folder list */}
        <div className="max-h-56 overflow-y-auto px-4 pb-4 space-y-1">
          {/* Root option */}
          <button
            onClick={() => onMove('')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 group"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-base">
              /
            </span>
            <span className="font-medium">Root (no folder)</span>
          </button>

          {filtered.length === 0 && search ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">No folders match &ldquo;{search}&rdquo;</p>
          ) : (
            filtered.map((folder) => (
              <button
                key={folder.path}
                onClick={() => onMove(folder.path)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 group"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  📁
                </span>
                <span className="truncate font-medium">{folder.name}</span>
                <span className="ml-auto shrink-0 text-xs text-slate-400 dark:text-slate-500">{folder.path}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
