"use client";

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PlusCircle, History, LogOut, Users, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-blue-600">DentalPro</h2>
          <p className="text-xs text-gray-500 mt-1">Sistema de Pedidos</p>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          
          {user.role === 'dentista' && (
            <Link
              href="/orders/new"
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/orders/new"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <PlusCircle size={20} />
              Nuevo Pedido
            </Link>
          )}
          
          <Link
            href="/orders/history"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/orders/history"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <History size={20} />
            Historial
          </Link>

          <Link
            href="/payments"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/payments"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <History size={20} />
            Pagos
          </Link>

          {user.role === 'admin' && (
            <>
              <Link
                href="/users"
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/users"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Users size={20} />
                Usuarios
              </Link>
              <Link
                href="/visits"
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/visits"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <CalendarDays size={20} />
                Visitas
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};
