import {
  CalendarDays,
  CreditCard,
  History,
  LayoutDashboard,
  PlusCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { User } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  /** Shorter caption used under the bottom tab bar icons. */
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the tinted icon chip on cards / tiles. */
  tint: string;
  /** Show in the bottom tab bar (the rest live in the "Más" sheet). */
  primary: boolean;
  isVisible: (user: User) => boolean;
}

const isDentist = (user: User) => user.role === 'dentist';
const isAdmin = (user: User) => user.role === 'admin';

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Inicio',
    description: 'Resumen de tu actividad',
    icon: LayoutDashboard,
    tint: 'bg-blue-50 text-blue-600',
    primary: true,
    isVisible: () => true,
  },
  {
    href: '/orders/new',
    label: 'Nuevo Pedido',
    shortLabel: 'Nuevo',
    description: 'Registrar un trabajo de laboratorio',
    icon: PlusCircle,
    tint: 'bg-indigo-50 text-indigo-600',
    primary: true,
    // Dentists must be approved before they can send work to the lab.
    isVisible: (user) => isDentist(user) && user.verified,
  },
  {
    href: '/orders/history',
    label: 'Historial',
    shortLabel: 'Pedidos',
    description: 'Consultar y dar seguimiento',
    icon: History,
    tint: 'bg-violet-50 text-violet-600',
    primary: true,
    isVisible: () => true,
  },
  {
    href: '/payments',
    label: 'Pagos',
    shortLabel: 'Pagos',
    description: 'Saldos y cobros registrados',
    icon: CreditCard,
    tint: 'bg-emerald-50 text-emerald-600',
    primary: true,
    isVisible: () => true,
  },
  {
    href: '/users',
    label: 'Usuarios',
    shortLabel: 'Usuarios',
    description: 'Altas y verificación de cuentas',
    icon: Users,
    tint: 'bg-amber-50 text-amber-600',
    primary: false,
    isVisible: isAdmin,
  },
  {
    href: '/visits',
    label: 'Visitas',
    shortLabel: 'Visitas',
    description: 'Agenda de visitas a consultorios',
    icon: CalendarDays,
    tint: 'bg-rose-50 text-rose-600',
    primary: false,
    isVisible: isAdmin,
  },
];

export const getNavItems = (user: User) => NAV_ITEMS.filter((item) => item.isVisible(user));

/** Items shown directly in the bottom tab bar, capped so the row stays tappable. */
export const getPrimaryNavItems = (user: User, limit = 4) =>
  getNavItems(user)
    .filter((item) => item.primary)
    .slice(0, limit);

/** Everything that did not fit in the tab bar, surfaced through the "Más" sheet. */
export const getSecondaryNavItems = (user: User, limit = 4) => {
  const primary = getPrimaryNavItems(user, limit);
  return getNavItems(user).filter((item) => !primary.includes(item));
};

/** Longest matching route wins so /orders/new does not light up /orders/history. */
export const isActiveNav = (pathname: string | null, href: string) =>
  pathname === href || Boolean(pathname?.startsWith(`${href}/`));

export const getActiveNavItem = (pathname: string | null, user: User) =>
  getNavItems(user)
    .filter((item) => isActiveNav(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
