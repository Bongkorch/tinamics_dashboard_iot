import { NextRequest } from 'next/server';
import { Timestamp, type DocumentData, type Query, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { CSV_BOM, csvHeaderLine, csvRowLine } from '@/lib/csv';
import { HISTORY_COLLECTION, getAdminDb } from '@/lib/firebaseAdmin';
import { deriveStatus } from '@/lib/roomStatus';
import {
  MAX_RANGE_DAYS, buildColumns, isValidTimeZone,
  type Dictionary, type ExportRow,
} from '@/lib/temperatureExport';
import { en } from '@/locales/en';
import { th } from '@/locales/th';
import type { PlantStatus } from '@/types/domain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_LIMIT = 10_000;
const PAGE_SIZE = 500;
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 7;
const ID_PATTERN = /^[\w.\- ]{1,128}$/;

function bad(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseInstant(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : '';
}

function docToRow(data: DocumentData): ExportRow {
  return {
    plantId: String(data.plantId ?? ''),
    roomId: String(data.roomId ?? ''),
    status: data.status as PlantStatus,
    temp: Number(data.temp),
    humi: Number(data.humi),
    pm25: data.pm25 != null ? Number(data.pm25) : null,
    sensorId: (data.sensorId as string | null) ?? null,
    updatedAt: toIso(data.updatedAt),
    recordedAt: toIso(data.recordedAt),
  };
}

function csvFilename(scope: string, now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}-${p(now.getUTCHours())}${p(now.getUTCMinutes())}`;
  return `temperature${scope === 'history' ? '-history' : ''}-${stamp}.csv`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const scope = sp.get('scope') ?? 'current';
  if (scope !== 'current' && scope !== 'history') return bad('scope must be "current" or "history"');

  const format = sp.get('format') ?? 'csv';
  if (format !== 'csv' && format !== 'json') return bad('format must be "csv" or "json"');

  const lang = sp.get('lang') ?? 'en';
  if (lang !== 'en' && lang !== 'th') return bad('lang must be "en" or "th"');
  const t: Dictionary = lang === 'th' ? th : en;

  const tz = sp.get('tz') ?? 'UTC';
  if (!isValidTimeZone(tz)) return bad('tz must be a valid IANA time zone');

  const plantId = sp.get('plantId');
  if (plantId !== null && !ID_PATTERN.test(plantId)) return bad('plantId is invalid');

  const limitParam = sp.get('limit');
  let limit: number | null = null;
  if (limitParam !== null) {
    limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) return bad(`limit must be an integer between 1 and ${MAX_LIMIT}`);
  }

  const db = getAdminDb();
  const now = new Date();
  const columns = buildColumns(t, { includeRecordedAt: scope === 'history', timeZone: tz });

  if (scope === 'current') return currentResponse({ db, plantId, format, columns, now, limit });

  const to = sp.has('to') ? parseInstant(sp.get('to')) : now;
  const from = sp.has('from') ? parseInstant(sp.get('from')) : to && new Date(to.getTime() - DEFAULT_RANGE_DAYS * DAY_MS);
  if (!from || !to) return bad('from and to must be valid ISO 8601 dates');
  if (from > to) return bad('from must not be after to');
  if (to.getTime() - from.getTime() > MAX_RANGE_DAYS * DAY_MS) return bad(`Range must not exceed ${MAX_RANGE_DAYS} days`);

  let query: Query = db.collection(HISTORY_COLLECTION);
  if (plantId) query = query.where('plantId', '==', plantId);
  query = query
    .where('updatedAt', '>=', Timestamp.fromDate(from))
    .where('updatedAt', '<=', Timestamp.fromDate(to))
    .orderBy('updatedAt', 'asc')
    .orderBy('plantId', 'asc')
    .orderBy('roomId', 'asc');

  if (format === 'json') {
    const capped = query.limit(limit ?? MAX_LIMIT);
    const [snap, count] = await Promise.all([capped.get(), query.count().get()]);
    return Response.json({ rows: snap.docs.map((d) => docToRow(d.data())), total: count.data().count });
  }

  // One page is fetched per pull, so memory stays bounded by PAGE_SIZE and the
  // client applies backpressure. Cursor pagination (startAfter) keeps reads stable.
  const encoder = new TextEncoder();
  let headerSent = false;
  let done = false;
  let remaining = limit ?? Infinity;
  let cursor: QueryDocumentSnapshot | undefined;

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (!headerSent) {
          headerSent = true;
          controller.enqueue(encoder.encode(CSV_BOM + csvHeaderLine(columns)));
          return;
        }
        if (done || remaining <= 0) {
          controller.enqueue(encoder.encode('\r\n'));
          controller.close();
          return;
        }
        const pageSize = Math.min(PAGE_SIZE, remaining);
        const snap = await (cursor ? query.startAfter(cursor) : query).limit(pageSize).get();
        if (snap.size > 0) {
          cursor = snap.docs[snap.docs.length - 1];
          remaining -= snap.size;
          controller.enqueue(encoder.encode(snap.docs.map((d) => '\r\n' + csvRowLine(docToRow(d.data()), columns)).join('')));
        }
        if (snap.size < pageSize) done = true;
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename(scope, now)}"`,
      'Cache-Control': 'no-store',
    },
  });
}

async function currentResponse(args: {
  db: ReturnType<typeof getAdminDb>;
  plantId: string | null;
  format: string;
  columns: ReturnType<typeof buildColumns>;
  now: Date;
  limit: number | null;
}) {
  const { db, plantId, format, columns, now, limit } = args;
  const snap = await db.collectionGroup('rooms').get();
  const rows: ExportRow[] = [];
  for (const d of snap.docs) {
    const parent = d.ref.parent.parent?.id ?? 'unknown';
    if (plantId && parent !== plantId) continue;
    const data = d.data();
    const temp = Number(data.temp ?? data.temperature ?? 0);
    const humi = Number(data.humi ?? data.humidity ?? 0);
    const raw = data.updatedAt ?? data.ts;
    const updatedAt =
      typeof raw === 'string' ? raw
      : typeof raw === 'number' ? new Date(raw).toISOString()
      : raw instanceof Timestamp ? raw.toDate().toISOString()
      : '';
    rows.push({
      plantId: parent,
      roomId: d.id,
      temp,
      humi,
      pm25: data.pm25 != null ? Number(data.pm25) : null,
      sensorId: (data.sensorId as string | null) ?? null,
      updatedAt,
      status: deriveStatus(temp, humi, updatedAt, now.getTime()),
    });
  }
  rows.sort((a, b) => a.plantId.localeCompare(b.plantId) || a.roomId.localeCompare(b.roomId));
  const shown = limit ? rows.slice(0, limit) : rows;

  if (format === 'json') return Response.json({ rows: shown, total: rows.length });

  const csv = [CSV_BOM + csvHeaderLine(columns), ...shown.map((r) => csvRowLine(r, columns))].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename('current', now)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
