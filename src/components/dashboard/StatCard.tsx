"use client";

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  /** Tailwind classes for the tinted icon chip, e.g. "bg-blue-50 text-blue-600". */
  tint: string;
  /** Optional emphasis colour for the value, e.g. "text-red-600". */
  valueClassName?: string;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tint,
  valueClassName,
  className,
}: StatCardProps) => (
  <div
    className={cn(
      'flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm md:rounded-xl md:p-6',
      className
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <p className="text-xs font-medium text-gray-500 md:text-sm">{label}</p>
      <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg md:h-9 md:w-9', tint)}>
        <Icon size={18} />
      </span>
    </div>
    <p className={cn('mt-2 text-xl font-bold text-gray-900 md:text-2xl', valueClassName)}>{value}</p>
    {hint && <p className="mt-1 text-[11px] text-gray-500 md:text-xs">{hint}</p>}
  </div>
);
