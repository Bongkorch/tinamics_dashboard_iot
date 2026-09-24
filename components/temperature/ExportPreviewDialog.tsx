'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownTrayIcon, CheckIcon, ClipboardDocumentIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';
import { downloadBlob, toTsv, type CsvColumn } from '@/lib/csv';
import type { ExportRow } from '@/lib/temperatureExport';

type Props = {
  open: boolean;
  onClose: () => void;
  columns: CsvColumn<ExportRow>[];
  rows: ExportRow[];
  loading: boolean;
  error: string | null;
  note: string | null;
  filename: string;
  /** Full CSV file; null while it is still being prepared. */
  blob: Blob | null;
};

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const CLOSE_DRAG_PX = 100;

const actionButton =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-card border border-line bg-surface px-3 py-2.5 text-sm font-medium text-ink shadow-card transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function ExportPreviewDialog({ open, onClose, columns, rows, loading, error, note, filename, blob }: Props) {
  const { t } = usePreferences();
  const x = t.temperature.export;
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setDragY(0);
    const probe = new File([''], filename, { type: 'text/csv' });
    setCanShare(typeof navigator.canShare === 'function' && navigator.canShare({ files: [probe] }));
  }, [open, filename]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !sheetRef.current) return;
    const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose]);

  const onHandleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onHandleUp = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragY > CLOSE_DRAG_PX) onClose();
    else setDragY(0);
  };

  const handleShare = async () => {
    if (!blob) return;
    try {
      await navigator.share({ files: [new File([blob], filename, { type: 'text/csv' })], title: x.shareTitle });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) console.error('Share failed:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(toTsv(rows, columns));
      setCopied(true);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={x.preview}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-line bg-surface shadow-card"
        style={{ transform: `translateY(${dragY}px)`, transition: dragStart.current === null ? 'transform 150ms ease-out' : 'none' }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none justify-center pt-2 pb-1"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          aria-label={x.dragHandle}
        >
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2">
          <h2 className="text-base font-semibold text-ink">{x.preview}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={x.close}
            className="rounded-card p-1.5 text-muted hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {note ? <p className="shrink-0 px-4 pb-2 text-xs text-muted">{note}</p> : null}

        <div className="min-h-0 flex-1 overflow-auto border-t border-line">
          {loading ? (
            <p className="p-6 text-center text-sm text-muted">{x.loading}</p>
          ) : error ? (
            <p className="p-6 text-center text-sm text-danger">{error}</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">{x.noRows}</p>
          ) : (
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  {columns.map((col, i) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={`sticky top-0 whitespace-nowrap border-b border-line bg-surface-soft px-3 py-2 font-semibold text-muted ${col.numeric ? 'text-right' : 'text-left'} ${i === 0 ? 'left-0 z-30' : 'z-20'}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  <tr key={`${row.plantId}-${row.roomId}-${row.updatedAt}-${r}`}>
                    {columns.map((col, i) => {
                      const raw = col.value(row);
                      const empty = raw == null || raw === '';
                      return (
                        <td
                          key={col.key}
                          className={`whitespace-nowrap border-b border-line px-3 py-2 text-ink ${col.numeric ? 'text-right tabular-nums' : 'text-left'} ${i === 0 ? 'sticky left-0 z-10 bg-surface font-medium' : ''}`}
                        >
                          {col.key === 'status' ? <StatusBadge status={row.status} /> : empty ? '—' : raw}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-line bg-surface px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {canShare ? (
            <button type="button" className={actionButton} onClick={handleShare} disabled={!blob}>
              <ShareIcon className="h-4 w-4" aria-hidden="true" />
              {x.share}
            </button>
          ) : null}
          <button type="button" className={actionButton} onClick={() => blob && downloadBlob(filename, blob)} disabled={!blob}>
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
            {x.download}
          </button>
          <button type="button" className={actionButton} onClick={handleCopy} disabled={rows.length === 0}>
            {copied ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />}
            <span aria-live="polite">{copied ? x.copied : x.copy}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
