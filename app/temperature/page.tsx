'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ExportPreviewDialog } from '@/components/temperature/ExportPreviewDialog';
import { usePreferences } from '@/contexts/AppPreferences';
import { useRoomReadings } from '@/lib/useRoomReadings';
import { csvBlob, downloadBlob, toCsv, type CsvColumn } from '@/lib/csv';
import {
  PREVIEW_ROW_LIMIT, buildColumns, buildHistoryUrl, csvFilename, isRangeValid, toDateInputValue,
  type Dictionary, type ExportRow, type ExportScope,
} from '@/lib/temperatureExport';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Suspense, useRef, useState } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 7;

const controlClass =
  'rounded-card border border-line bg-surface px-2.5 py-2 text-sm text-ink shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

type Preview = {
  columns: CsvColumn<ExportRow>[];
  rows: ExportRow[];
  note: string | null;
  blob: Blob | null;
  loading: boolean;
  error: string | null;
  filename: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDisplayTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const ampm = d.getHours() < 12 ? 'AM' : 'PM';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
}

function isTouchDevice(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function exportRoomsCsv(rooms: ExportRow[], t: Dictionary) {
  downloadBlob(csvFilename(), csvBlob(toCsv(rooms, buildColumns(t))));
}

async function fetchOk(url: string): Promise<Response> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

export default function TemperaturePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemperatureContent />
    </Suspense>
  );
}

function TemperatureContent() {
  const { t, language } = usePreferences();
  const { rooms, loading, error } = useRoomReadings();

  console.log('Rooms data:', rooms);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const [scope, setScope] = useState<ExportScope>('current');
  const [from, setFrom] = useState(() => toDateInputValue(new Date(Date.now() - DEFAULT_RANGE_DAYS * DAY_MS)));
  const [to, setTo] = useState(() => toDateInputValue(new Date()));
  const [busy, setBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const requestId = useRef(0);

  const x = t.temperature.export;
  const rangeOk = scope === 'current' || isRangeValid(from, to);

  const closePreview = () => {
    requestId.current += 1;
    setPreview(null);
  };

  const openHistoryPreview = async () => {
    const id = ++requestId.current;
    const columns = buildColumns(t, { includeRecordedAt: true });
    const filename = csvFilename(new Date(), 'history');
    setPreview({ columns, rows: [], note: null, blob: null, loading: true, error: null, filename });

    const range = { from, to, lang: language };
    const fullFile = fetchOk(buildHistoryUrl(range)).then((r) => r.blob());
    try {
      const res = await fetchOk(buildHistoryUrl({ ...range, format: 'json', limit: PREVIEW_ROW_LIMIT }));
      const data = (await res.json()) as { rows: ExportRow[]; total: number };
      if (id !== requestId.current) return;
      const note = data.total > data.rows.length
        ? x.rowsNote.replace('{shown}', String(data.rows.length)).replace('{total}', String(data.total))
        : null;
      setPreview((p) => (p ? { ...p, rows: data.rows, note, loading: false } : p));
    } catch {
      if (id !== requestId.current) return;
      setPreview((p) => (p ? { ...p, loading: false, error: x.failed } : p));
      return;
    }
    try {
      const blob = await fullFile;
      if (id === requestId.current) setPreview((p) => (p ? { ...p, blob } : p));
    } catch {
      if (id === requestId.current) setPreview((p) => (p ? { ...p, error: x.failed } : p));
    }
  };

  const handleExport = async () => {
    setExportError(null);
    const touch = isTouchDevice();

    if (scope === 'current') {
      if (!touch) {
        exportRoomsCsv(rooms, t);
        return;
      }
      const columns = buildColumns(t);
      setPreview({
        columns, rows: rooms, note: null, loading: false, error: null,
        blob: csvBlob(toCsv(rooms, columns)), filename: csvFilename(),
      });
      return;
    }

    if (!rangeOk) return;
    if (touch) {
      await openHistoryPreview();
      return;
    }

    setBusy(true);
    try {
      const res = await fetchOk(buildHistoryUrl({ from, to, lang: language }));
      downloadBlob(csvFilename(new Date(), 'history'), await res.blob());
    } catch {
      setExportError(x.failed);
    } finally {
      setBusy(false);
    }
  };

  const exportControls = (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <select
        aria-label={x.scope}
        value={scope}
        onChange={(e) => setScope(e.target.value as ExportScope)}
        className={controlClass}
      >
        <option value="current">{x.current}</option>
        <option value="history">{x.history}</option>
      </select>
      {scope === 'history' ? (
        <>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            {x.from}
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={controlClass} />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            {x.to}
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={controlClass} />
          </label>
        </>
      ) : null}
      <button
        type="button"
        onClick={handleExport}
        disabled={rooms.length === 0 || busy || !rangeOk}
        className="inline-flex items-center gap-2 rounded-card border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-card transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
        {t.common.exportCsv}
      </button>
      {!rangeOk ? <p role="alert" className="w-full text-xs text-danger sm:text-right">{x.rangeInvalid}</p> : null}
      {exportError ? <p role="alert" className="w-full text-xs text-danger sm:text-right">{exportError}</p> : null}
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.temperature.title} description={t.temperature.desc} />
        <div className="text-center text-muted">Loading sensor data...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.temperature.title} description={t.temperature.desc} />
        <div className="rounded-card border border-line bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  // Show empty state
  if (rooms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={t.temperature.title} description={t.temperature.desc} />
        <div className="rounded-card border border-line bg-surface p-8 text-center text-sm text-muted">
          {t.temperature.empty}
        </div>
      </div>
    );
  }

  // Show data
  return (
    <div className="space-y-6">
      <PageHeader title={t.temperature.title} description={t.temperature.desc} action={exportControls} />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rooms.map((room) => (
          <article key={`${room.plantId}-${room.roomId}`} className="rounded-card border border-line bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">{room.plantId}</h2>
                <p className="mt-1 text-xs text-muted">{t.temperature.room} {room.roomId}</p>
              </div>
              <StatusBadge status={room.status} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
              <div>
                <p className="text-xs text-muted">{t.temperature.temperature}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{room.temp.toFixed(1)} <span className="text-xs font-medium text-muted">°C</span></p>
              </div>
              <div>
                <p className="text-xs text-muted">{t.temperature.humidity}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{room.humi.toFixed(1)} <span className="text-xs font-medium text-muted">%</span></p>
              </div>
              <div>
                <p className="text-xs text-muted">{t.temperature.pm25}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{room.pm25 != null ? `${room.pm25.toFixed(1)} µg/m³` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t.temperature.sensorId}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{room.sensorId ?? '—'}</p>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-muted">{t.common.updated} {formatDisplayTime(room.updatedAt)}</p>
          </article>
        ))}
      </div>

      <ExportPreviewDialog
        open={preview !== null}
        onClose={closePreview}
        columns={preview?.columns ?? []}
        rows={preview?.rows ?? []}
        loading={preview?.loading ?? false}
        error={preview?.error ?? null}
        note={preview?.note ?? null}
        filename={preview?.filename ?? ''}
        blob={preview?.blob ?? null}
      />
    </div>
  );
}
