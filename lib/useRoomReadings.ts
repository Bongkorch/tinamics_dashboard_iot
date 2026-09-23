'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
    const loadRooms = async () => {
      try {
        console.log('📂 Fetching plants...');

        // Get all plants
        const plantsRef = collection(db, 'plants');
        const plantsSnap = await getDocs(plantsRef);

        console.log('Found', plantsSnap.docs.length, 'plants');

        const allRooms: RoomReading[] = [];

        // For each plant, get rooms
        for (const plantDoc of plantsSnap.docs) {
          const plantId = plantDoc.id;
          console.log('🌱 Plant:', plantId);

          const roomsRef = collection(db, 'plants', plantId, 'rooms');
          const roomsSnap = await getDocs(roomsRef);

          console.log('  Found', roomsSnap.docs.length, 'rooms');

          // Process each room
          for (const roomDoc of roomsSnap.docs) {
            const roomId = roomDoc.id;
            const data = roomDoc.data() as Record<string, unknown>;
            const temp = Number(data.temp ?? 0);
            const humi = Number(data.humi ?? 0);
            const updatedAt = (data.updatedAt as string) ?? (data.ts as string) ?? new Date().toISOString();

            console.log('  📊 Room:', { plantId, roomId, temp, humi });

            allRooms.push({
              plantId,
              roomId,
              temp,
              humi,
              pm25: data.pm25 != null ? Number(data.pm25) : null,
              sensorId: (data.sensorId as string) ?? null,
              updatedAt,
              status: deriveStatus(temp, humi, updatedAt),
            });
          }
        }

        console.log('✓ Total rooms:', allRooms.length);
        setRooms(allRooms);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return { rooms, loading, error };
}