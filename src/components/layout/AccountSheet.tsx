"use client";

import Link from 'next/link';
import { LogOut, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNavItems } from './nav-items';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  dentist: 'Odontólogo',
};

export const AccountSheet = ({ open, onOpenChange }: AccountSheetProps) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const items = getNavItems(user);
  const pendingApproval = user.role === 'dentist' && !user.verified;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pt-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-600 text-base font-semibold text-white">
              {initials || '?'}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg">{user.name}</SheetTitle>
              <SheetDescription className="truncate">
                {ROLE_LABEL[user.role] ?? user.role} · @{user.username}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="px-5">
          <div
            className={
              pendingApproval
                ? 'flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800'
                : 'flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800'
            }
          >
            {pendingApproval ? (
              <Clock size={16} className="mt-0.5 shrink-0" />
            ) : (
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            )}
            <span>
              {pendingApproval
                ? 'Cuenta pendiente de verificación. Aún no puedes crear pedidos.'
                : 'Cuenta verificada y activa.'}
            </span>
          </div>
        </div>

        <nav className="mt-4 divide-y border-y">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-5 py-3.5 active:bg-gray-50"
            >
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${item.tint}`}>
                <item.icon size={18} />
              </span>
              <span className="flex-1 text-sm font-medium text-gray-900">{item.label}</span>
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
  );
};
