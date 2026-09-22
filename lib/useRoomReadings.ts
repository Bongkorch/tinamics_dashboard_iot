'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PlantStatus, RoomReading } from '@/types/domain';

const STALE_AFTER_MS = 10 * 60 * 1000;
const TEMP_RANGE = { min: 15, max: 35 };
const HUMIDITY_RANGE = { min: 30, max: 80 };

function deriveStatus(temp: number, humi: number, updatedAt: string): PlantStatus {
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs) || Date.now() - updatedMs > STALE_AFTER_MS) return 'offline';
  if (temp < TEMP_RANGE.min || temp > TEMP_RANGE.max || humi < HUMIDITY_RANGE.min || humi > HUMIDITY_RANGE.max) return 'warning';
  return 'normal';
}

export function useRoomReadings() {
  const [rooms, setRooms] = useState<RoomReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting collectionGroup query for rooms...');

    const unsubscribe = onSnapshot(
      collectionGroup(db, 'rooms'),
      (snapshot) => {
        console.log('✓ Received snapshot with', snapshot.docs.length, 'documents');

        const next: RoomReading[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const plantId = docSnap.ref.parent.parent?.id ?? 'unknown';
          const temp = Number(data.temp ?? 0);
          const humi = Number(data.humi ?? 0);
          const updatedAt = (data.updatedAt as string) ?? (data.ts as string) ?? new Date().toISOString();

          console.log('📊 Room:', { plantId, roomId: docSnap.id, temp, humi });

          return {
            plantId,
            roomId: docSnap.id,
            temp,
            humi,
            pm25: data.pm25 != null ? Number(data.pm25) : null,
            sensorId: (data.sensorId as string) ?? null,
            updatedAt,
            status: deriveStatus(temp, humi, updatedAt),
          };
        });

        console.log('✓ Processed', next.length, 'rooms');
        setRooms(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Firestore error:', err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
}