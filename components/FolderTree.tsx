'use client';

import { useState, useCallback } from 'react';
import { Folder, ImageIcon, Trash2, Pencil, Check, X, ChevronRight, FolderOpen, Loader2 } from 'lucide-react';
import { CloudinaryFolder } from '@/lib/types';
import DeleteConfirmModal from './DeleteConfirmModal';

interface FolderNodeProps {
  folder: CloudinaryFolder;
  depth: number;
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onDeleteFolder?: (path: string) => void;
  onRenameFolder?: (oldPath: string, newName: string) => void;
}

function FolderNode({ folder, depth, selectedFolder, onSelectFolder, onDeleteFolder, onRenameFolder }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subfolders, setSubfolders] = useState<CloudinaryFolder[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(folder.name);
  const [pendingDelete, setPendingDelete] = useState(false);

  const loadSubfolders = useCallback(async () => {
    if (isExpanded) { setIsExpanded(false); return; }
    setLoadingChildren(true);
    try {
      const res = await fetch(`/api/folders?parent=${encodeURIComponent(folder.path)}`);
      const data = await res.json();
      setSubfolders(data.folders || []);
      setIsExpanded(true);
    } catch { setSubfolders([]); setIsExpanded(true); }
    finally { setLoadingChildren(false); }
  }, [isExpanded, folder.path]);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== folder.name) onRenameFolder?.(folder.path, trimmed);
    setIsEditing(false);
  };

  const isActive = selectedFolder === folder.path;
  const indent = depth * 12;

  return (
    <>
      <div className="group flex items-center gap-0.5" style={{ paddingLeft: `${indent}px` }}>
        {/* Expand toggle */}
        <button
          onClick={loadSubfolders}
          className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 ${loadingChildren ? 'animate-spin' : ''}`}
        >
          {loadingChildren ? (
            <Loader2 className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </button>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 ring-2 ring-indigo-400/30">
            <Folder className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
            <input
              className="flex-1 min-w-0 bg-transparent text-sm font-medium text-indigo-800 dark:text-indigo-200 outline-none"
              value={editValue}
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setIsEditing(false); }}
            />
            <button onClick={commitEdit} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setIsEditing(false)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onSelectFolder(folder.path)}
              className={`flex flex-1 min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isExpanded
                ? <FolderOpen className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-500'}`} />
                : <Folder className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
              }
              <span className="text-sm truncate">{folder.name}</span>
            </button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onRenameFolder && (
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditValue(folder.name); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-500 dark:hover:text-indigo-400" title="Rename">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDeleteFolder && (
                <button onClick={(e) => { e.stopPropagation(); setPendingDelete(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Subfolders */}
      {isExpanded && subfolders.map((sub) => (
        <FolderNode
          key={sub.path}
          folder={sub}
          depth={depth + 1}
          selectedFolder={selectedFolder}
          onSelectFolder={onSelectFolder}
          onDeleteFolder={onDeleteFolder}
          onRenameFolder={onRenameFolder}
        />
      ))}
      {isExpanded && subfolders.length === 0 && (
        <p className="py-1 text-xs text-slate-400 dark:text-slate-600 italic" style={{ paddingLeft: `${indent + 36}px` }}>
          No subfolders
        </p>
      )}

      <DeleteConfirmModal
        isOpen={pendingDelete}
        fileName={`folder "${folder.name}"`}
        onConfirm={() => { onDeleteFolder?.(folder.path); setPendingDelete(false); }}
        onCancel={() => setPendingDelete(false)}
      />
    </>
  );
}

// ─── Root FolderTree ─────────────────────────────────────────────────────────
interface FolderTreeProps {
  folders: CloudinaryFolder[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onDeleteFolder?: (path: string) => void;
  onRenameFolder?: (oldPath: string, newName: string) => void;
}

export default function FolderTree({ folders, selectedFolder, onSelectFolder, onDeleteFolder, onRenameFolder }: FolderTreeProps) {
  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-4 shadow-sm">
      <h2 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Library</h2>
      <div className="space-y-0.5">
        <button
          onClick={() => onSelectFolder('')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
            selectedFolder === ''
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className={`h-4 w-4 shrink-0 ${selectedFolder === '' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className="text-sm">All Images</span>
        </button>
        {folders?.map((folder) => (
          <FolderNode
            key={folder.path}
            folder={folder}
            depth={0}
            selectedFolder={selectedFolder}
            onSelectFolder={onSelectFolder}
            onDeleteFolder={onDeleteFolder}
            onRenameFolder={onRenameFolder}
          />
        ))}
      </div>
    </div>
  );
}
