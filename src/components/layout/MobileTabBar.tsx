"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, MoreHorizontal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryNavItems, getSecondaryNavItems, isActiveNav } from './nav-items';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const MobileTabBar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!user) return null;

  const secondary = getSecondaryNavItems(user);
  // Reserve the last slot for "Más" whenever there are overflow destinations.
  const primary = getPrimaryNavItems(user, secondary.length > 0 ? 3 : 4);
  const moreIsActive = secondary.some((item) => isActiveNav(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 pb-safe-bottom backdrop-blur-md md:hidden"
      >
        <ul className="flex h-tabbar items-stretch">
          {primary.map((item) => {
            const active = isActiveNav(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-full flex-col items-center justify-center gap-1 px-1 transition-colors',
                    active ? 'text-blue-600' : 'text-gray-500 active:text-gray-900'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-14 place-items-center rounded-full transition-colors',
                      active && 'bg-blue-50'
                    )}
                  >
                    <item.icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                  </span>
                  <span className={cn('text-[11px] leading-none', active && 'font-semibold')}>
                    {item.shortLabel}
                  </span>
                </Link>
              </li>
            );
          })}

          {secondary.length > 0 && (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1 px-1 transition-colors',
                  moreIsActive ? 'text-blue-600' : 'text-gray-500 active:text-gray-900'
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-14 place-items-center rounded-full transition-colors',
                    moreIsActive && 'bg-blue-50'
                  )}
                >
                  <MoreHorizontal size={22} strokeWidth={moreIsActive ? 2.4 : 1.9} />
                </span>
                <span className={cn('text-[11px] leading-none', moreIsActive && 'font-semibold')}>
                  Más
                </span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="px-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="pt-5">
            <SheetTitle>Más opciones</SheetTitle>
          </SheetHeader>

          <nav className="divide-y border-y">
            {secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-5 py-4 active:bg-gray-50"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.tint}`}>
                  <item.icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                  <span className="block truncate text-xs text-gray-500">{item.description}</span>
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </Link>
            ))}
          </nav>

          <div className="px-5 pt-4">
            <Button
              variant="outline"
              size="xl"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={logout}
            >
              <LogOut size={18} />
              Cerrar sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
