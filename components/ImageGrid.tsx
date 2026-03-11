'use client';

import { CloudinaryResource } from '@/lib/types';
import ImageCard from './ImageCard';
import { ImageIcon } from 'lucide-react';

interface ImageGridProps {
  images: CloudinaryResource[];
  viewMode: 'grid' | 'list';
  onDeleteImage: (publicId: string) => void;
  onOpenLightbox: (index: number) => void;
  selectedIds: Set<string>;
  onToggleSelect: (publicId: string) => void;
  loading?: boolean;
}

export default function ImageGrid({
  images, viewMode, onDeleteImage, onOpenLightbox, selectedIds, onToggleSelect, loading,
}: ImageGridProps) {
  const isSelecting = selectedIds.size > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50">
          <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No images found</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload some images to get started.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <ImageCard
              key={image.asset_id}
              image={image}
              onDelete={onDeleteImage}
              onOpenLightbox={() => onOpenLightbox(index)}
              isSelected={selectedIds.has(image.public_id)}
              isSelecting={isSelecting}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {images.map((image, index) => (
            <ImageCard
              key={image.asset_id}
              image={image}
              onDelete={onDeleteImage}
              onOpenLightbox={() => onOpenLightbox(index)}
              listView
              isSelected={selectedIds.has(image.public_id)}
              isSelecting={isSelecting}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
