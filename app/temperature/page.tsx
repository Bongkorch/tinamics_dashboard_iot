'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';
import { useRoomReadings } from '@/lib/useRoomReadings';
import { downloadCsv, toCsv } from '@/lib/csv';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import type { RoomReading } from '@/types/domain';

type Dictionary = ReturnType<typeof usePreferences>['t'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatLocalDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDisplayTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const ampm = d.getHours() < 12 ? 'AM' : 'PM';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${ampm}`;
}

function exportRoomsCsv(rooms: RoomReading[], t: Dictionary) {
  const statusLabel = (status: RoomReading['status']) =>
    status === 'normal' ? t.common.normal : status === 'warning' ? t.common.warning : t.common.offline;

  const csv = toCsv(rooms, [
    { header: t.temperature.csv.plantId, value: (r) => r.plantId },
    { header: t.temperature.csv.room, value: (r) => r.roomId },
    { header: t.temperature.csv.status, value: (r) => statusLabel(r.status) },
    { header: t.temperature.csv.temperature, value: (r) => r.temp.toFixed(1) },
    { header: t.temperature.csv.humidity, value: (r) => r.humi.toFixed(1) },
    { header: t.temperature.csv.pm25, value: (r) => (r.pm25 != null ? r.pm25.toFixed(1) : '') },
    { header: t.temperature.csv.sensorId, value: (r) => r.sensorId ?? '' },
    { header: t.temperature.csv.updatedAt, value: (r) => formatLocalDateTime(r.updatedAt) },
  ]);

  const now = new Date();
  const filename = `temperature-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.csv`;
  downloadCsv(filename, csv);
}

export default function TemperaturePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemperatureContent />
    </Suspense>
  );
}

function TemperatureContent() {
  const { t } = usePreferences();
  const { rooms, loading, error } = useRoomReadings();

  console.log('Rooms data:', rooms);
  console.log('Loading:', loading);
  console.log('Error:', error);

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
      <PageHeader
        title={t.temperature.title}
        description={t.temperature.desc}
        action={
          <button
            type="button"
            onClick={() => exportRoomsCsv(rooms, t)}
            disabled={rooms.length === 0}
            className="inline-flex items-center gap-2 rounded-card border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-card transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
            {t.common.exportCsv}
          </button>
        }
      />

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
    </div>
  );
}