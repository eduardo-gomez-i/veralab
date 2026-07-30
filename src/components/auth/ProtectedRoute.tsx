"use client";

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    // Splash screen: matches the app shell so the boot does not flash white.
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-gray-50 px-6">
        <Image src="/logo.png" alt="VeraLAB" width={280} height={80} className="h-14 w-auto" priority />
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="sr-only">Cargando</span>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};
