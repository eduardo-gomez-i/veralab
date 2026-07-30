"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileTabBar } from './MobileTabBar';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-[100dvh] bg-gray-50 md:flex md:h-screen md:overflow-hidden">
      {/* Mobile: fixed app chrome, only the content region scrolls. */}
      <MobileHeader />

      {/* Desktop: the original persistent sidebar. */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 md:flex md:flex-col md:overflow-hidden">
        <div className="md:flex-1 md:overflow-auto">
          <div
            /* Remount on navigation so each screen animates in like a pushed view. */
            key={pathname}
            className="mx-auto w-full max-w-7xl animate-screen-in px-4 pb-content-bottom pt-content-top md:animate-none md:p-6"
          >
            {children}
          </div>
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
};
