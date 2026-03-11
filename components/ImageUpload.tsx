'use client';

import { useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, FolderOpen, Files } from 'lucide-react';

interface FileProgress {
  file: File;
  progress: number; // 0–100
  done: boolean;
  error: boolean;
}

interface ImageUploadProps {
  folder: string;
  onUploadComplete: () => void;
}

/** Derive a URL-safe, lowercase slug from the original filename */
function toCleanName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')            // strip extension
    .replace(/[^a-zA-Z0-9_-]/g, '-')    // replace special chars with dash
    .replace(/-+/g, '-')                 // collapse consecutive dashes
    .replace(/^-+|-+$/g, '')            // trim leading/trailing dashes
    .toLowerCase();
}

async function uploadWithProgress(
  file: File,
  folder: string,
  onProgress: (pct: number) => void
): Promise<void> {
  // Resolve target folder (handles webkitRelativePath for folder uploads)
  const relativePath = (file as any).webkitRelativePath as string | undefined;
  let targetFolder = folder;
  if (relativePath) {
    const parts = relativePath.split('/');
    const subDirs = parts.slice(0, -1).join('/');
    targetFolder = folder ? `${folder}/${subDirs}` : subDirs;
  }

  const cleanName = toCleanName(file.name);
  const timestamp = Math.floor(Date.now() / 1000);

  // 1. Get a signed upload token from our server (tiny request — no file involved)
  const sigRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: targetFolder || undefined, public_id: cleanName || undefined, timestamp }),
  });
  if (!sigRes.ok) throw new Error('Failed to get upload signature');
  const { signature, api_key, cloud_name } = await sigRes.json();

  // 2. Upload the file directly to Cloudinary — bypasses Vercel's 4.5 MB body limit
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', api_key);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('unique_filename', 'true');
    formData.append('overwrite', 'false');
    if (cleanName) formData.append('public_id', cleanName);
    if (targetFolder) formData.append('folder', targetFolder);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`))));
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`);
    xhr.send(formData);
  });
}

export default function ImageUpload({ folder, onUploadComplete }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [uploadMode, setUploadMode] = useState<'files' | 'folder'>('files');

  const setProgress = (index: number, progress: number, done = false, error = false) => {
    setFileProgress((prev) =>
      prev.map((fp, i) => (i === index ? { ...fp, progress, done, error } : fp))
    );
  };

  const addFiles = (incoming: File[]) => {
    const images = incoming.filter((f) => f.type.startsWith('image/'));
    setFileProgress((prev) => {
      const existingNames = new Set(prev.map((fp) => fp.file.name));
      const newEntries = images
        .filter((f) => !existingNames.has(f.name))
        .map((file) => ({ file, progress: 0, done: false, error: false }));
      return [...prev, ...newEntries];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (index: number) =>
    setFileProgress((prev) => prev.filter((_, i) => i !== index));

  const uploadFiles = async () => {
    if (fileProgress.length === 0 || uploading) return;
    setUploading(true);

    await Promise.all(
      fileProgress.map((fp, index) =>
        uploadWithProgress(fp.file, folder, (pct) => setProgress(index, pct))
          .then(() => setProgress(index, 100, true))
          .catch(() => setProgress(index, 0, false, true))
      )
    );

    setUploading(false);
    // Short delay so the user can see 100% completed state
    setTimeout(() => {
      setFileProgress([]);
      onUploadComplete();
    }, 800);
  };

  const totalProgress =
    fileProgress.length === 0
      ? 0
      : Math.round(fileProgress.reduce((sum, fp) => sum + fp.progress, 0) / fileProgress.length);

  const doneCount = fileProgress.filter((fp) => fp.done).length;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Upload mode</span>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
          {(['files', 'folder'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setUploadMode(mode); setFileProgress([]); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                uploadMode === mode
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {mode === 'files' ? <Files className="h-3.5 w-3.5" /> : <FolderOpen className="h-3.5 w-3.5" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`relative w-full rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600/50">
          {uploadMode === 'folder'
            ? <FolderOpen className={`h-7 w-7 ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
            : <UploadCloud className={`h-7 w-7 ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
          }
        </div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
          {uploadMode === 'folder' ? 'Click to select a folder' : 'Click to upload'}{' '}
          <span className="font-normal text-slate-500 dark:text-slate-400">or drag and drop</span>
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {uploadMode === 'folder' ? 'All images (including subfolders) will be uploaded' : 'PNG, JPG, GIF, SVG, WebP'}
        </p>
        {folder && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-700 px-3 py-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300">
            <ImageIcon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            Uploading to: {folder}
          </div>
        )}
        <input
          key={uploadMode}
          type="file"
          accept="image/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleFileSelect}
          disabled={uploading}
          {...(uploadMode === 'folder' ? { webkitdirectory: '', mozdirectory: '' } : { multiple: true })}
        />
      </div>

      {/* File list with per-file progress */}
      {fileProgress.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {uploading ? `Uploading ${doneCount}/${fileProgress.length}…` : `${fileProgress.length} image${fileProgress.length > 1 ? 's' : ''} ready`}
            </h3>
            {!uploading && (
              <button
                onClick={uploadFiles}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
              >
                Upload All
              </button>
            )}
          </div>

          {/* Overall progress bar */}
          {uploading && (
            <div className="overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {fileProgress.map(({ file, progress, done, error }, index) => {
              const relativePath = (file as any).webkitRelativePath as string | undefined;
              const displayName = relativePath || file.name;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                    done
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10'
                      : error
                      ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                    done
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : error
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {done ? '✓' : error ? '✕' : <ImageIcon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300" title={displayName}>{displayName}</p>
                    {uploading && !done && !error && (
                      <div className="mt-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className="h-1 rounded-full bg-indigo-500 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {done && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Uploaded</p>}
                    {error && <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">Failed</p>}
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="shrink-0 rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
