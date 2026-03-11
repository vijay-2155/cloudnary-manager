'use client';

import { useState } from 'react';
import { Sliders, Copy, Check, ExternalLink, X } from 'lucide-react';

interface TransformPickerProps {
  baseUrl: string;
  publicId: string;
}

type CropMode = 'fill' | 'fit' | 'crop' | 'thumb' | 'scale';
type Format = 'auto' | 'webp' | 'jpg' | 'png' | 'avif';

const CROPS: CropMode[] = ['fill', 'fit', 'scale', 'crop', 'thumb'];
const FORMATS: Format[] = ['auto', 'webp', 'avif', 'jpg', 'png'];

function buildTransformUrl(publicId: string, opts: {
  width: number; height: number; quality: number; crop: CropMode; format: Format;
}): string {
  const { width, height, quality, crop, format } = opts;
  const parts = [`w_${width}`, `h_${height}`, `c_${crop}`, `q_${quality}`, `f_${format}`];
  const transform = parts.join(',');
  return `https://res.cloudinary.com/${publicId.includes('/') ? publicId.split('/')[0] : 'YOUR_CLOUD'}/image/upload/${transform}/${publicId}`;
}

function buildUrlFromBase(baseUrl: string, opts: {
  width: number; height: number; quality: number; crop: CropMode; format: Format;
}): string {
  const { width, height, quality, crop, format } = opts;
  // Insert transform params after /upload/ in the existing URL
  const parts = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  return baseUrl.replace('/upload/', `/upload/${parts}/`);
}

export default function TransformPicker({ baseUrl }: TransformPickerProps) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [quality, setQuality] = useState(80);
  const [crop, setCrop] = useState<CropMode>('fill');
  const [format, setFormat] = useState<Format>('auto');
  const [copied, setCopied] = useState(false);

  const transformedUrl = buildUrlFromBase(baseUrl, { width, height, quality, crop, format });

  const copy = () => {
    navigator.clipboard.writeText(transformedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4" />
          Transform & Export
        </div>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Width', value: width, set: setWidth }, { label: 'Height', value: height, set: setHeight }].map(({ label, value, set }) => (
              <div key={label}>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-400 [appearance:textfield]"
                  min={1} max={5000}
                />
              </div>
            ))}
          </div>

          {/* Quality slider */}
          <div>
            <div className="flex justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Quality</label>
              <span className="text-[10px] text-white/60">{quality}%</span>
            </div>
            <input
              type="range" min={1} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-500"
            />
          </div>

          {/* Crop mode */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Crop</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {CROPS.map((c) => (
                <button key={c} onClick={() => setCrop(c)} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${crop === c ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Format</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={`rounded-lg px-2.5 py-1 text-xs font-medium uppercase transition-all ${format === f ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{f}</button>
              ))}
            </div>
          </div>

          {/* Result URL */}
          <div className="rounded-lg bg-white/10 px-3 py-2">
            <p className="break-all font-mono text-[10px] text-white/60">{transformedUrl}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={copy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors">
              {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy URL</>}
            </button>
            <button onClick={() => window.open(transformedUrl, '_blank')} className="flex items-center gap-1.5 rounded-xl bg-indigo-600/80 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-600 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
