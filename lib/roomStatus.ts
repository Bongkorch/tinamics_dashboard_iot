import type { PlantStatus } from '@/types/domain';

export const STALE_AFTER_MS = 10 * 60 * 1000;
export const TEMP_RANGE = { min: 15, max: 35 };
export const HUMIDITY_RANGE = { min: 30, max: 80 };

export function deriveStatus(temp: number, humi: number, updatedAt: string, now: number): PlantStatus {
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs) || now - updatedMs > STALE_AFTER_MS) return 'offline';
  if (
    temp < TEMP_RANGE.min || temp > TEMP_RANGE.max ||
    humi < HUMIDITY_RANGE.min || humi > HUMIDITY_RANGE.max
  ) return 'warning';
  return 'normal';
}
