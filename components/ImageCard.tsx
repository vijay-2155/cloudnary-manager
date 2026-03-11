'use client';

import { CloudinaryResource } from '@/lib/types';
import { Trash2, ExternalLink, Copy, Check, Expand } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import DeleteConfirmModal from './DeleteConfirmModal';
import { cloudinaryThumb } from '@/lib/cloudinaryUtils';

interface ImageCardProps {
  image: CloudinaryResource;
  onDelete: (publicId: string) => void;
  onOpenLightbox: () => void;
  listView?: boolean;
  isSelected?: boolean;
  isSelecting?: boolean;
  onToggleSelect?: (publicId: string) => void;
}

export default function ImageCard({
  image, onDelete, onOpenLightbox, listView = false,
  isSelected = false, isSelecting = false, onToggleSelect,
}: ImageCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image.secure_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(image.secure_url, '_blank');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  };

  const fileName = image.public_id.split('/').pop() || 'image';

  const handleCardClick = () => {
    if (isSelecting && onToggleSelect) {
      onToggleSelect(image.public_id);
    } else {
      onOpenLightbox();
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete(image.public_id);
  };

  // ─── List View ────────────────────────────────────────────────────────────
  if (listView) {
    return (
      <>
        <div
          onClick={handleCardClick}
          className={`group flex cursor-pointer items-center gap-4 rounded-xl border p-3 shadow-sm transition-all ${
            isSelected
              ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/30 bg-indigo-50/30 dark:bg-indigo-900/10'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-600 hover:shadow-md'
          }`}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(image.public_id); }}
            className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 opacity-0 group-hover:opacity-100'
            } ${isSelecting ? 'opacity-100' : ''}`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700 ring-1 ring-slate-900/5 dark:ring-white/5">
            <Image src={cloudinaryThumb(image.secure_url, 'w_128,h_128,c_fill,f_auto,q_auto')} alt={fileName} fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100" title={fileName}>{fileName}</p>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{image.width} × {image.height}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{formatBytes(image.bytes)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="uppercase">{image.format}</span>
            </div>
          </div>
          {!isSelecting && (
            <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button onClick={(e) => { e.stopPropagation(); onOpenLightbox(); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400" title="Preview">
                <Expand className="h-4 w-4" />
              </button>
              <button onClick={copyUrl} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white" title="Copy URL">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button onClick={openImage} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400" title="Open">
                <ExternalLink className="h-4 w-4" />
              </button>
              <div className="mx-1 h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
              <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <DeleteConfirmModal isOpen={showDeleteModal} fileName={fileName} onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)} />
      </>
    );
  }

  // ─── Grid View ────────────────────────────────────────────────────────────
  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group relative flex flex-col cursor-pointer overflow-hidden rounded-xl border bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 ${
          isSelected
            ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/30 dark:ring-indigo-500/30 -translate-y-0.5 shadow-md'
            : 'border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-indigo-500/50 dark:hover:ring-indigo-500/30'
        }`}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect?.(image.public_id); }}
          className={`absolute top-2 left-2 z-20 flex h-6 w-6 items-center justify-center rounded-md border-2 shadow-sm transition-all ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600 text-white opacity-100'
              : 'border-slate-300 dark:border-slate-500 bg-white/90 dark:bg-slate-800/90 opacity-0 group-hover:opacity-100'
          } ${isSelecting ? 'opacity-100' : ''}`}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          <Image
            src={cloudinaryThumb(image.secure_url)}
            alt={fileName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!isSelecting && (
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex justify-end p-2">
                <div className="flex items-center gap-1 rounded-lg bg-white/95 dark:bg-slate-900/95 p-1 shadow-sm backdrop-blur-sm">
                  <button onClick={(e) => { e.stopPropagation(); onOpenLightbox(); }} className="flex h-8 w-8 items-center justify-center rounded-md text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/40" title="Preview">
                    <Expand className="h-4 w-4" />
                  </button>
                  <button onClick={copyUrl} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700" title="Copy URL">
                    {copied ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={openImage} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400" title="Open">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }} className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/40" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 text-white">
                <p className="truncate text-sm font-medium drop-shadow-md">{fileName}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                  <span className="uppercase tracking-wider">{image.format}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{formatBytes(image.bytes)}</span>
                </div>
              </div>
            </div>
          )}
          {isSelected && <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-500/15 pointer-events-none" />}
        </div>
      </div>
      <DeleteConfirmModal isOpen={showDeleteModal} fileName={fileName} onConfirm={handleConfirmDelete} onCancel={() => setShowDeleteModal(false)} />
    </>
  );
}
