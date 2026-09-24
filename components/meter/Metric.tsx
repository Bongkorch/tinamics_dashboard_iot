import { cn } from '@/lib/cn';

export type MetricProps = {
  label: string;
  value: string;
  unit?: string;
  size?: 'lg' | 'sm';
  warn?: boolean;
};

export function Metric({ label, value, unit, size = 'sm', warn = false }: MetricProps) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={cn('mt-1 font-semibold tabular-nums', size === 'lg' ? 'text-xl' : 'text-sm', warn ? 'text-warning' : 'text-ink')}>
        {value}
        {unit ? <> <span className="text-xs font-medium text-muted">{unit}</span></> : null}
      </p>
    </div>
  );
}
