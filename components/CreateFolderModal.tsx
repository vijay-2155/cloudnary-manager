'use client';

import { useState } from 'react';
import { X, Loader2, FolderPlus } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: () => void;
  currentFolder?: string;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  currentFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    setCreating(true);
    try {
      const path = currentFolder
        ? `${currentFolder}/${folderName.trim()}`
        : folderName.trim();

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      setFolderName('');
      onFolderCreated();
      onClose();
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 pt-[10vh] sm:p-0 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 animate-in zoom-in-95 duration-200 sm:mx-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FolderPlus className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">New Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {currentFolder && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-700/50">
                <span>Creating inside:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{currentFolder}</span>
              </div>
            )}

            <div>
              <label htmlFor="folderName" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Folder Name
              </label>
              <input
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g., Marketing Assets"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md disabled:pointer-events-none disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Folder'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
