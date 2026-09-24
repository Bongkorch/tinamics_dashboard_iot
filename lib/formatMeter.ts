import type { MeterReading } from '@/lib/useMeterReadings';

export const CURRENT_UNBALANCE_WARN_PCT = 20;

const fixed = (digits: number) => (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmt = {
  voltage: fixed(1),
  current: fixed(2),
  frequency: fixed(2),
  pf: fixed(3),
  decimal1: fixed(1),
  decimal2: fixed(2),
  power: fixed(0),
};

export function overallStatus(reading: MeterReading, isStale: boolean): 'normal' | 'warning' | 'offline' {
  if (isStale) return 'offline';
  if (reading.status !== 'normal' || reading.phases.some((phase) => !phase.inRange)) return 'warning';
  return 'normal';
}
