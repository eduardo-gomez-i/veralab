"use client";

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Clock, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getNavItems, isActiveNav } from './nav-items';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = getNavItems(user);
  const pendingApproval = user.role === 'dentist' && !user.verified;

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <Image src="/logo-mark.png" alt="VeraLAB" width={330} height={143} className="h-10 w-auto" priority />
          <p className="mt-1 text-xs text-gray-500">Sistema de Pedidos</p>
        </div>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {pendingApproval && (
            <div className="flex items-start gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
              <Clock size={14} className="mt-0.5 shrink-0" />
              <span>Cuenta pendiente de verificación. No puedes crear pedidos hasta ser aprobado.</span>
            </div>
          )}

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActiveNav(pathname, item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t bg-gray-50 p-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs capitalize text-gray-500">{user.role}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
