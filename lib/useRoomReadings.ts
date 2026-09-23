'use client';

import { useEffect, useMemo, useState } from 'react';
import { collectionGroup, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlantStatus, RoomReading } from '@/types/domain';

const STALE_AFTER_MS = 10 * 60 * 1000;
const TEMP_RANGE = { min: 15, max: 35 };
const HUMIDITY_RANGE = { min: 30, max: 80 };

function deriveStatus(temp: number, humi: number, updatedAt: string, now: number): PlantStatus {
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs) || now - updatedMs > STALE_AFTER_MS) return 'offline';
  if (
    temp < TEMP_RANGE.min || temp > TEMP_RANGE.max ||
    humi < HUMIDITY_RANGE.min || humi > HUMIDITY_RANGE.max
  ) return 'warning';
  return 'normal';
}

// Accepts ISO string, epoch ms number, or Firestore Timestamp.
// Missing/invalid -> '' so the room shows as offline (never faked as "now").
function toIso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return '';
}

type RawRoom = Omit<RoomReading, 'status'>;

export function useRoomReadings() {
  const [raw, setRaw] = useState<RawRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Live listener on every "rooms" subcollection, under any plant.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collectionGroup(db, 'rooms'),
      (snap) => {
        const rooms: RawRoom[] = snap.docs.map((d) => {
          const data = d.data() as Record<string, unknown>;
          return {
            plantId: d.ref.parent.parent?.id ?? 'unknown',
            roomId: d.id,
            temp: Number(data.temp ?? data.temperature ?? 0),
            humi: Number(data.humi ?? data.humidity ?? 0),
            pm25: data.pm25 != null ? Number(data.pm25) : null,
            sensorId: (data.sensorId as string) ?? null,
            updatedAt: toIso(data.updatedAt ?? data.ts),
          };
        });
        setRaw(rooms);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Re-check "offline" every 30 s even when no new data arrives.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const rooms = useMemo<RoomReading[]>(
    () => raw.map((r) => ({ ...r, status: deriveStatus(r.temp, r.humi, r.updatedAt, now) })),
    [raw, now]
  );

  return { rooms, loading, error };
}