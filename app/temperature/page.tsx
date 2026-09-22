'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';
import { useRoomReadings } from '@/lib/useRoomReadings';
import { Suspense } from 'react';

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
      <PageHeader title={t.temperature.title} description={t.temperature.desc} />

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
            <p className="mt-4 text-[11px] text-muted">{t.common.updated} {new Date(room.updatedAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </div>
  );
}