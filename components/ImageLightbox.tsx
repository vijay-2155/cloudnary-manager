'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import { CloudinaryResource } from '@/lib/types';
import TransformPicker from './TransformPicker';
import { saveUrlToHistory } from './ClipboardHistory';

interface ImageLightboxProps {
  images: CloudinaryResource[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

export default function ImageLightbox({ images, currentIndex, onClose, onIndexChange }: ImageLightboxProps) {
  const [copied, setCopied] = useState(false);
  const image = images[currentIndex];

  const prev = useCallback(() => onIndexChange((currentIndex - 1 + images.length) % images.length), [currentIndex, images.length, onIndexChange]);
  const next = useCallback(() => onIndexChange((currentIndex + 1) % images.length), [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const copyUrl = () => {
    const fileName = image.public_id.split('/').pop() || 'image';
    navigator.clipboard.writeText(image.secure_url);
    saveUrlToHistory(image.secure_url, fileName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!image) return null;
  const fileName = image.public_id.split('/').pop() || 'image';
  const uploadDate = new Date(image.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return createPortal(
    <div className="fixed inset-0 z-[99998] flex animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close */}
      <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-80 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Main layout */}
      <div className="relative z-10 flex w-full pointer-events-none">
        {/* Image area */}
        <div className="flex flex-1 items-center justify-center p-12 lg:p-16 pointer-events-auto">
          <Image
            src={image.secure_url}
            alt={fileName}
            width={image.width}
            height={image.height}
            className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
            priority
          />
        </div>

        {/* Info + Transform sidebar */}
        <div className="pointer-events-auto flex w-72 shrink-0 flex-col border-l border-white/10 bg-white/5 backdrop-blur-md overflow-y-auto">
          <div className="flex-1 p-6 space-y-5">
            {/* Filename */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">File name</p>
              <p className="mt-1 break-all text-sm font-medium text-white">{fileName}</p>
            </div>
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Dimensions', value: `${image.width} × ${image.height}` },
                { label: 'Format', value: image.format.toUpperCase() },
                { label: 'Size', value: formatBytes(image.bytes) },
                { label: 'Uploaded', value: uploadDate },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-white/10 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">{label}</p>
                  <p className="mt-0.5 text-xs font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
            {/* Public ID */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Public ID</p>
              <p className="mt-1 break-all rounded-lg bg-white/10 px-3 py-2 text-xs font-mono text-white/70">{image.public_id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 p-4 space-y-2">
            <button onClick={copyUrl} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button onClick={() => window.open(image.secure_url, '_blank')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/80 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">
              <ExternalLink className="h-4 w-4" /> Open Original
            </button>
          </div>

          {/* Transform picker */}
          <TransformPicker baseUrl={image.secure_url} publicId={image.public_id} />
        </div>
      </div>
    </div>,
    document.body
  );
}
