'use client';

import { CheckCircleIcon, ExclamationTriangleIcon, SignalSlashIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/contexts/AppPreferences';

type Status = 'normal' | 'warning' | 'offline';

const styles = {
  normal: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  offline: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-400/20',
};
const icons = { normal: CheckCircleIcon, warning: ExclamationTriangleIcon, offline: SignalSlashIcon };

export function StatusBadge({ status }: { status: Status }) {
  const { t } = usePreferences();
  const Icon = icons[status];
  const label = status === 'normal' ? t.common.normal : status === 'warning' ? t.common.warning : t.common.offline;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', styles[status])}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</span>;
}
