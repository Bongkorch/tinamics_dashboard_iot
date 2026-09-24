import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function MetricGroup({ children, className, divided = true }: { children: ReactNode; className?: string; divided?: boolean }) {
  return <div className={cn('grid gap-4', divided && 'border-t border-line pt-4', className)}>{children}</div>;
}
