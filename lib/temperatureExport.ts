import type { CsvColumn } from '@/lib/csv';
import type { en } from '@/locales/en';
import type { th } from '@/locales/th';
import type { RoomReading } from '@/types/domain';

export type Dictionary = typeof en | typeof th;
export type ExportScope = 'current' | 'history';
export type ExportRow = RoomReading & { recordedAt?: string | null };

export const MAX_RANGE_DAYS = 90;
export const PREVIEW_ROW_LIMIT = 200;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    getFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** YYYY-MM-DD HH:mm:ss in the given IANA zone, or the runtime's local zone when omitted. */
export function formatDateTime(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (!timeZone) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  const p: Record<string, string> = {};
  for (const part of getFormatter(timeZone).formatToParts(d)) p[part.type] = part.value;
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export function statusLabel(t: Dictionary, status: RoomReading['status']): string {
  return status === 'normal' ? t.common.normal : status === 'warning' ? t.common.warning : t.common.offline;
}

export function buildColumns(
  t: Dictionary,
  opts: { includeRecordedAt?: boolean; timeZone?: string } = {}
): CsvColumn<ExportRow>[] {
  const c = t.temperature.csv;
  const columns: CsvColumn<ExportRow>[] = [
    { key: 'plantId', header: c.plantId, value: (r) => r.plantId },
    { key: 'roomId', header: c.room, value: (r) => r.roomId },
    { key: 'status', header: c.status, value: (r) => statusLabel(t, r.status) },
    { key: 'temp', header: c.temperature, numeric: true, value: (r) => r.temp.toFixed(1) },
    { key: 'humi', header: c.humidity, numeric: true, value: (r) => r.humi.toFixed(1) },
    { key: 'pm25', header: c.pm25, numeric: true, value: (r) => (r.pm25 != null ? r.pm25.toFixed(1) : '') },
    { key: 'sensorId', header: c.sensorId, value: (r) => r.sensorId ?? '' },
    { key: 'updatedAt', header: c.updatedAt, value: (r) => formatDateTime(r.updatedAt, opts.timeZone) },
  ];
  if (opts.includeRecordedAt) {
    columns.push({ key: 'recordedAt', header: c.recordedAt, value: (r) => formatDateTime(r.recordedAt, opts.timeZone) });
  }
  return columns;
}

export function csvFilename(now: Date = new Date(), scope: ExportScope = 'current'): string {
  return `temperature${scope === 'history' ? '-history' : ''}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.csv`;
}

export function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Converts local-day inputs (YYYY-MM-DD) to an inclusive ISO instant range. */
export function localRangeToIso(from: string, to: string): { from: string; to: string } | null {
  const f = new Date(`${from}T00:00:00`);
  const e = new Date(`${to}T23:59:59.999`);
  if (Number.isNaN(f.getTime()) || Number.isNaN(e.getTime())) return null;
  return { from: f.toISOString(), to: e.toISOString() };
}

export function isRangeValid(from: string, to: string): boolean {
  const r = localRangeToIso(from, to);
  if (!r) return false;
  const ms = new Date(r.to).getTime() - new Date(r.from).getTime();
  return ms >= 0 && ms <= MAX_RANGE_DAYS * 24 * 60 * 60 * 1000;
}

export function buildHistoryUrl(params: {
  from: string;
  to: string;
  lang: 'en' | 'th';
  format?: 'json';
  limit?: number;
}): string {
  const range = localRangeToIso(params.from, params.to);
  if (!range) throw new Error('Invalid date range');
  const q = new URLSearchParams({
    scope: 'history',
    from: range.from,
    to: range.to,
    lang: params.lang,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  if (params.format) q.set('format', params.format);
  if (params.limit) q.set('limit', String(params.limit));
  return `/api/temperature/export?${q.toString()}`;
}
