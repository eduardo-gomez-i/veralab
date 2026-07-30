"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveNavItem, getPrimaryNavItems, isActiveNav } from './nav-items';
import { AccountSheet } from './AccountSheet';

export const MobileHeader = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);

  if (!user) return null;

  const activeItem = getActiveNavItem(pathname, user);
  // Screens reachable from the tab bar are "roots" — everything else gets a back arrow.
  const isRootScreen = getPrimaryNavItems(user).some((item) => isActiveNav(pathname, item.href));

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-100 bg-white/90 pt-safe-top backdrop-blur-md md:hidden">
        <div className="flex h-header items-center gap-2 px-2">
          {isRootScreen ? (
            <div className="flex items-center pl-2">
              <Image
                src="/logo-mark.png"
                alt="VeraLAB"
                width={330}
                height={143}
                className="h-7 w-auto"
                priority
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Volver"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-gray-700 active:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900">
            {isRootScreen ? '' : activeItem?.label ?? ''}
          </h1>

          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            aria-label="Abrir menú de cuenta"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white active:scale-95"
          >
            {initials || '?'}
          </button>
        </div>
      </header>

      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
};
