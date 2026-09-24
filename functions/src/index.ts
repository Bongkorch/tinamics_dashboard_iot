import { initializeApp } from 'firebase-admin/app';
import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

initializeApp();
const db = getFirestore();

const HISTORY_COLLECTION = 'roomReadingHistory';
const ALREADY_EXISTS = 6;

// Keep in sync with lib/roomStatus.ts in the Next app.
const STALE_AFTER_MS = 10 * 60 * 1000;
const TEMP_RANGE = { min: 15, max: 35 };
const HUMIDITY_RANGE = { min: 30, max: 80 };

type Status = 'normal' | 'warning' | 'offline';

function deriveStatus(temp: number, humi: number, updatedMs: number, now: number): Status {
  if (!Number.isFinite(updatedMs) || now - updatedMs > STALE_AFTER_MS) return 'offline';
  if (temp < TEMP_RANGE.min || temp > TEMP_RANGE.max || humi < HUMIDITY_RANGE.min || humi > HUMIDITY_RANGE.max) return 'warning';
  return 'normal';
}

// Same accepted shapes as lib/useRoomReadings.ts: ISO string, epoch ms, or Firestore Timestamp.
function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

/**
 * Appends one immutable history row per distinct reading. The document id is derived from
 * (plantId, roomId, updatedAt), and create() fails if it exists, so a repeated write of the
 * same reading, or a retried invocation, is silently ignored (ON CONFLICT DO NOTHING).
 * Nothing in this codebase updates or deletes history documents.
 */
export const recordRoomReading = onDocumentWritten('plants/{plantId}/rooms/{roomId}', async (event) => {
  const after = event.data?.after;
  if (!after?.exists) return;

  const { plantId, roomId } = event.params;
  const data = after.data() ?? {};

  const updatedMs = toMillis(data.updatedAt ?? data.ts);
  if (updatedMs === null) return;

  const temp = Number(data.temp ?? data.temperature ?? 0);
  const humi = Number(data.humi ?? data.humidity ?? 0);

  try {
    const updatedIso = new Date(updatedMs).toISOString();
    await db.collection(HISTORY_COLLECTION).doc(`${plantId}_${roomId}_${updatedIso}`).create({
      plantId,
      roomId,
      status: deriveStatus(temp, humi, updatedMs, Date.now()),
      temp,
      humi,
      pm25: data.pm25 != null ? Number(data.pm25) : null,
      sensorId: (data.sensorId as string | undefined) ?? null,
      updatedAt: Timestamp.fromMillis(updatedMs),
      recordedAt: Timestamp.now(),
    });
  } catch (err) {
    if ((err as { code?: number }).code !== ALREADY_EXISTS) throw err;
  }
});
