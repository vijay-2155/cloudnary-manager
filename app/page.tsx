'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import ImageUpload from '@/components/ImageUpload';
import FolderTree from '@/components/FolderTree';
import ImageGrid from '@/components/ImageGrid';
import ImageLightbox from '@/components/ImageLightbox';
import CreateFolderModal from '@/components/CreateFolderModal';
import BulkActionBar from '@/components/BulkActionBar';
import MoveToFolderModal from '@/components/MoveToFolderModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import SearchFilterBar, { SortField, SortDir } from '@/components/SearchFilterBar';
import ClipboardHistory from '@/components/ClipboardHistory';
import { useToast } from '@/components/Toast';
import { useDarkMode } from '@/hooks/useDarkMode';
import { CloudinaryResource, CloudinaryFolder } from '@/lib/types';
import { FolderPlus, LayoutGrid, List, Sun, Moon, Clock } from 'lucide-react';

const PAGE_SIZE = 30;

export default function Home() {
  const { success, error: toastError, info } = useToast();
  const { theme, toggle: toggleDark } = useDarkMode();

  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isRecentView, setIsRecentView] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [formatFilter, setFormatFilter] = useState('');

  // Fetch folders
  const { data: folders = [], refetch: refetchFolders } = useQuery<CloudinaryFolder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.folders || [];
    },
  });

  // Paginated image fetch via useInfiniteQuery
  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch: refetchImages,
  } = useInfiniteQuery({
    queryKey: ['images', selectedFolder],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ max_results: String(PAGE_SIZE) });
      if (selectedFolder) params.set('folder', selectedFolder);
      if (pageParam) params.set('next_cursor', pageParam);
      const res = await fetch(`/api/resources?${params}`);
      if (!res.ok) throw new Error();
      return res.json() as Promise<{ resources: CloudinaryResource[]; next_cursor: string | null }>;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });

  const images: CloudinaryResource[] = useMemo(
    () => paginatedData?.pages.flatMap((p) => p.resources) ?? [],
    [paginatedData]
  );

  // Recently Uploaded view — last 7 days
  const recentImages = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return images.filter((img) => new Date(img.created_at).getTime() > cutoff);
  }, [images]);

  // Filtered + sorted
  const availableFormats = useMemo(() => [...new Set(images.map((img) => img.format))].sort(), [images]);

  const sourceImages = isRecentView ? recentImages : images;

  const displayedImages = useMemo(() => {
    let result = sourceImages;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((img) => img.public_id.toLowerCase().includes(q));
    }
    if (formatFilter) result = result.filter((img) => img.format === formatFilter);
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.public_id.localeCompare(b.public_id);
      else if (sortField === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortField === 'size') cmp = a.bytes - b.bytes;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [sourceImages, search, formatFilter, sortField, sortDir]);

  // Keyboard shortcuts
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') {
      if (lightboxIndex !== null) { setLightboxIndex(null); return; }
      if (isCreateFolderOpen) { setIsCreateFolderOpen(false); return; }
      if (isMoveModalOpen) { setIsMoveModalOpen(false); return; }
      if (isBulkDeleteOpen) { setIsBulkDeleteOpen(false); return; }
      if (selectedIds.size > 0) { setSelectedIds(new Set()); return; }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      if (displayedImages.length > 0) { e.preventDefault(); setSelectedIds(new Set(displayedImages.map((img) => img.public_id))); }
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) setIsBulkDeleteOpen(true);
  }, [lightboxIndex, isCreateFolderOpen, isMoveModalOpen, isBulkDeleteOpen, selectedIds, displayedImages]);

  useEffect(() => { window.addEventListener('keydown', handleKeyboard); return () => window.removeEventListener('keydown', handleKeyboard); }, [handleKeyboard]);

  // Handlers
  const handleUploadComplete = () => { refetchImages(); success('Images uploaded successfully!'); };
  const handleFolderCreated = () => { refetchFolders(); setIsCreateFolderOpen(false); success('Folder created!'); };

  const clearSelection = () => setSelectedIds(new Set());
  const selectAll = () => setSelectedIds(new Set(displayedImages.map((img) => img.public_id)));
  const toggleSelect = (publicId: string) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(publicId) ? n.delete(publicId) : n.add(publicId); return n; });
  };

  const handleDeleteFolder = async (path: string) => {
    try {
      const res = await fetch('/api/folders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
      if (!res.ok) throw new Error();
      if (selectedFolder === path || selectedFolder.startsWith(path + '/')) setSelectedFolder('');
      refetchFolders(); refetchImages(); success('Folder deleted!');
    } catch { toastError('Failed to delete folder.'); }
  };

  const handleRenameFolder = async (oldPath: string, newName: string) => {
    const prefix = oldPath.includes('/') ? oldPath.slice(0, oldPath.lastIndexOf('/') + 1) : '';
    const newPath = prefix + newName;
    try {
      const res = await fetch('/api/folders/rename', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ old_path: oldPath, new_path: newPath }) });
      if (!res.ok) throw new Error();
      if (selectedFolder === oldPath) setSelectedFolder(newPath);
      refetchFolders(); refetchImages(); success(`Folder renamed to "${newName}"!`);
    } catch { toastError('Failed to rename folder.'); }
  };

  const handleDeleteImage = async (publicId: string) => {
    try {
      const res = await fetch('/api/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: publicId }) });
      if (!res.ok) throw new Error();
      if (lightboxIndex !== null) {
        const idx = displayedImages.findIndex((img) => img.public_id === publicId);
        if (idx !== -1 && displayedImages.length <= 1) setLightboxIndex(null);
        else if (idx !== -1 && idx <= (lightboxIndex ?? 0) && (lightboxIndex ?? 0) > 0) setLightboxIndex((lightboxIndex ?? 0) - 1);
      }
      refetchImages(); success('Image deleted!');
    } catch { toastError('Failed to delete image.'); }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleteOpen(false);
    const count = selectedIds.size;
    await Promise.all([...selectedIds].map((id) => fetch('/api/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_id: id }) })));
    clearSelection(); refetchImages(); success(`${count} ${count === 1 ? 'image' : 'images'} deleted!`);
  };

  const handleBulkMove = async (targetFolder: string) => {
    setIsMoveModalOpen(false);
    const selected = images.filter((img) => selectedIds.has(img.public_id));
    await Promise.all(selected.map((img) => {
      const base = img.public_id.split('/').pop();
      const newId = targetFolder ? `${targetFolder}/${base}` : base!;
      return fetch('/api/folders/move', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_public_id: img.public_id, to_public_id: newId }) });
    }));
    clearSelection(); refetchImages(); success(`${selected.length} ${selected.length === 1 ? 'image' : 'images'} moved!`);
  };

  const handleBulkCopy = () => {
    const selected = images.filter((img) => selectedIds.has(img.public_id));
    navigator.clipboard.writeText(selected.map((img) => img.secure_url).join('\n'));
    info(`${selected.length} URL${selected.length > 1 ? 's' : ''} copied!`);
  };

  const switchFolder = (folder: string) => { setSelectedFolder(folder); setIsRecentView(false); clearSelection(); setSearch(''); setFormatFilter(''); };
  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cloudinary Manager</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage your images and folders</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Clipboard history */}
              <ClipboardHistory />
              {/* Dark mode */}
              <button onClick={toggleDark} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors" title="Toggle dark mode">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={() => setIsCreateFolderOpen(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700">
                <FolderPlus className="h-4 w-4" /> New Folder
              </button>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-2">
              {/* Recently Uploaded quick-access */}
              <button
                onClick={() => { setIsRecentView(true); setSelectedFolder(''); clearSelection(); setSearch(''); }}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${isRecentView ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Clock className={`h-4 w-4 shrink-0 ${isRecentView ? 'text-amber-500' : 'text-slate-400'}`} />
                Recently Uploaded
                {recentImages.length > 0 && (
                  <span className="ml-auto text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-full">{recentImages.length}</span>
                )}
              </button>
              <FolderTree
                folders={folders}
                selectedFolder={selectedFolder}
                onSelectFolder={switchFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
              />
            </div>
          </aside>

          {/* Main Area */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <ImageUpload folder={selectedFolder} onUploadComplete={handleUploadComplete} />
            </div>

            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="mb-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {isRecentView ? '⏱ Recently Uploaded' : selectedFolder ? `"${selectedFolder}"` : 'All Images'}
                  </h2>
                  {selectedCount > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-indigo-600 font-medium">{selectedCount} selected</span>
                      <button onClick={clearSelection} className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">Deselect all</button>
                    </div>
                  )}
                </div>
                <SearchFilterBar
                  search={search} onSearchChange={setSearch}
                  sortField={sortField} sortDir={sortDir}
                  onSortChange={(f, d) => { setSortField(f); setSortDir(d); }}
                  formatFilter={formatFilter} onFormatChange={setFormatFilter}
                  availableFormats={availableFormats}
                  totalCount={sourceImages.length}
                  filteredCount={displayedImages.length}
                />
              </div>

              <ImageGrid
                images={displayedImages}
                viewMode={viewMode}
                onDeleteImage={handleDeleteImage}
                onOpenLightbox={setLightboxIndex}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                loading={isLoading}
              />

              {/* Load More */}
              {hasNextPage && !isRecentView && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md disabled:opacity-60"
                  >
                    {isFetchingNextPage ? (
                      <><div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />Loading…</>
                    ) : 'Load more images'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {lightboxIndex !== null && (
        <ImageLightbox images={displayedImages} currentIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} onIndexChange={setLightboxIndex} />
      )}

      <BulkActionBar
        selectedCount={selectedCount} totalCount={displayedImages.length}
        onDelete={() => setIsBulkDeleteOpen(true)} onMove={() => setIsMoveModalOpen(true)}
        onCopy={handleBulkCopy} onClear={clearSelection} onSelectAll={selectAll}
      />

      <CreateFolderModal isOpen={isCreateFolderOpen} onClose={() => setIsCreateFolderOpen(false)} onFolderCreated={handleFolderCreated} currentFolder={selectedFolder} />
      <MoveToFolderModal isOpen={isMoveModalOpen} selectedCount={selectedCount} folders={folders} onMove={handleBulkMove} onClose={() => setIsMoveModalOpen(false)} />
      <DeleteConfirmModal isOpen={isBulkDeleteOpen} fileName={`${selectedCount} ${selectedCount === 1 ? 'image' : 'images'}`} onConfirm={handleBulkDelete} onCancel={() => setIsBulkDeleteOpen(false)} />
    </div>
  );
}
