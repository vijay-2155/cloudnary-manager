'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, X, ExternalLink, Trash2, Copy, Check } from 'lucide-react';

const HISTORY_KEY = 'cloudinary_url_history';
const MAX_HISTORY = 20;

export function saveUrlToHistory(url: string, name: string) {
  try {
    const existing: HistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const filtered = existing.filter((i) => i.url !== url);
    const updated = [{ url, name, copiedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch { /* silent */ }
}

interface HistoryItem { url: string; name: string; copiedAt: string; }

export default function ClipboardHistory() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      try { setItems(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch { setItems([]); }
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyItem = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 1500);
  };

  const removeItem = (url: string) => {
    const next = items.filter((i) => i.url !== url);
    setItems(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const clearAll = () => { setItems([]); localStorage.removeItem(HISTORY_KEY); };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
          open ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
        }`}
        title="URL History"
      >
        <ClipboardList className="h-4 w-4" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed right-4 top-20 z-[9998] w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl"
          style={{ maxHeight: '60vh' }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">Copied URL History</h3>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button onClick={clearAll} className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 48px)' }}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <ClipboardList className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No URLs copied yet</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.url} className="group flex items-start gap-2 border-b border-slate-50 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">{item.name}</p>
                    <p className="truncate text-[10px] text-slate-400 font-mono">{item.url}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.copiedAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyItem(item.url)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                      {copiedUrl === item.url ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={() => window.open(item.url, '_blank')} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-indigo-600">
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeItem(item.url)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
