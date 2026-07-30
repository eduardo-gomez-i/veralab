"use client";

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionTileProps {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  /** Tailwind classes for the tinted icon chip, e.g. "bg-blue-50 text-blue-600". */
  tint: string;
  /** Small counter shown as a pill on the icon chip. */
  badge?: number;
  /** Renders the tile in brand colours — use for the single main action. */
  featured?: boolean;
  className?: string;
}

export const ActionTile = ({
  href,
  label,
  description,
  icon: Icon,
  tint,
  badge,
  featured,
  className,
}: ActionTileProps) => (
  <Link
    href={href}
    className={cn(
      'tap-scale relative flex min-h-[7rem] flex-col justify-between rounded-2xl border p-4 shadow-sm',
      featured ? 'border-blue-600 bg-blue-600 text-white shadow-blue-600/20' : 'border-gray-200 bg-white',
      className
    )}
  >
    <div className="flex items-start justify-between">
      <span
        className={cn(
          'grid h-11 w-11 place-items-center rounded-xl',
          featured ? 'bg-white/20 text-white' : tint
        )}
      >
        <Icon size={22} />
      </span>
      {typeof badge === 'number' && badge > 0 ? (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            featured ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          )}
        >
          {badge}
        </span>
      ) : (
        <ChevronRight size={18} className={featured ? 'text-white/70' : 'text-gray-300'} />
      )}
    </div>

    <div className="mt-3">
      <p className={cn('text-sm font-semibold', featured ? 'text-white' : 'text-gray-900')}>
        {label}
      </p>
      {description && (
        <p className={cn('mt-0.5 text-xs leading-snug', featured ? 'text-blue-100' : 'text-gray-500')}>
          {description}
        </p>
      )}
    </div>
  </Link>
);
