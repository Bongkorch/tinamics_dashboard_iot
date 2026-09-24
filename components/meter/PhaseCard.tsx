'use client';

import type { PhaseReading } from '@/lib/useMeterReadings';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { usePreferences } from '@/contexts/AppPreferences';
import { fmt } from '@/lib/formatMeter';
import { Metric } from './Metric';
import { MetricGroup } from './MetricGroup';

export function PhaseCard({ phase }: { phase: PhaseReading }) {
  const { t } = usePreferences();
  const m = t.plants;
  return (
    <article className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{m.phase} {phase.id}</h2>
        </div>
        <StatusBadge status={phase.inRange ? 'normal' : 'warning'} label={phase.inRange ? m.inRange : m.outOfRange} />
      </div>
      <MetricGroup className="mt-6 grid-cols-2">
        <Metric size="lg" label={m.voltage} value={fmt.voltage(phase.voltageLN)} unit="V L-N" />
        <Metric size="lg" label={m.current} value={fmt.current(phase.current)} unit="A" />
      </MetricGroup>
      <MetricGroup className="mt-4 grid-cols-2">
        <Metric label={m.activePower} value={fmt.power(phase.activePower)} unit="W" />
        <Metric label={m.reactivePower} value={fmt.power(phase.reactivePower)} unit="var" />
        <Metric label={m.apparentPower} value={fmt.power(phase.apparentPower)} unit="VA" />
        <Metric label={m.powerFactor} value={fmt.pf(phase.pf)} unit="PF" />
      </MetricGroup>
    </article>
  );
}
