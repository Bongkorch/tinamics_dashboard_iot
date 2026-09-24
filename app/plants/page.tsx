'use client';

import { useMeterReadings } from '@/lib/useMeterReadings';
import { CURRENT_UNBALANCE_WARN_PCT, fmt, overallStatus } from '@/lib/formatMeter';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PhaseCard } from '@/components/meter/PhaseCard';
import { Metric } from '@/components/meter/Metric';
import { MetricGroup } from '@/components/meter/MetricGroup';
import { usePreferences } from '@/contexts/AppPreferences';

const sectionCard = 'rounded-card border border-line bg-surface p-5 shadow-card';
const sectionTitle = 'text-base font-semibold text-ink';
const METER_ROOM = 'IE-01';

export default function PlantsPage() {
  const { t } = usePreferences();
  const m = t.plants;
  const { data: reading, isLoading, isStale, error } = useMeterReadings(METER_ROOM);

  if (!reading) {
    return (
      <div className="space-y-6">
        <PageHeader title={METER_ROOM} />
        <div className={`${sectionCard} text-sm text-muted`}>{error ?? (isLoading ? m.loading : m.empty)}</div>
      </div>
    );
  }
  const { totals, voltageLL } = reading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={reading.meterId}
        description={`${reading.meterType} · ${reading.siteName}`}
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{m.updatedMinAgo.replace('{n}', String(reading.updatedMinutesAgo))}</span>
            <StatusBadge status={overallStatus(reading, isStale)} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {reading.phases.map((phase) => <PhaseCard key={phase.id} phase={phase} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={sectionCard}>
          <h2 className={sectionTitle}>{m.lineToLine}</h2>
          <MetricGroup className="mt-4 grid-cols-3">
            <Metric size="lg" label="V R-Y" value={fmt.voltage(voltageLL.RY)} unit="V" />
            <Metric size="lg" label="V Y-B" value={fmt.voltage(voltageLL.YB)} unit="V" />
            <Metric size="lg" label="V B-R" value={fmt.voltage(voltageLL.BR)} unit="V" />
          </MetricGroup>
        </section>

        <section className={sectionCard}>
          <h2 className={sectionTitle}>{m.totals}</h2>
          <MetricGroup className="mt-4 grid-cols-2 sm:grid-cols-4">
            <Metric label={m.totalActivePower} value={fmt.power(totals.activePower)} unit="W" />
            <Metric label={m.totalReactivePower} value={fmt.power(totals.reactivePower)} unit="var" />
            <Metric label={m.totalApparentPower} value={fmt.power(totals.apparentPower)} unit="VA" />
            <Metric label={m.totalPf} value={fmt.pf(totals.pf)} unit="PF" />
          </MetricGroup>
        </section>
      </div>

      <section className={sectionCard}>
        <h2 className={sectionTitle}>{m.environment}</h2>
        <MetricGroup className="mt-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
          <Metric label={m.cabinetTemp} value={fmt.decimal1(reading.cabinetTemp)} unit="°C" />
          <Metric label={m.cabinetHumidity} value={fmt.decimal1(reading.humidity)} unit="%RH" />
          <Metric label={m.neutralCurrent} value={fmt.current(reading.neutralCurrent)} unit="A" />
          <Metric label={m.frequency} value={fmt.frequency(reading.frequency)} unit="Hz" />
          <Metric label={m.voltageUnbalance} value={fmt.decimal2(reading.voltageUnbalance)} unit="%" />
          <Metric label={m.currentUnbalance} value={fmt.decimal2(reading.currentUnbalance)} unit="%" warn={reading.currentUnbalance > CURRENT_UNBALANCE_WARN_PCT} />
        </MetricGroup>
      </section>
    </div>
  );
}
