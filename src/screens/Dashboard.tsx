"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCard } from '@/components/orders/OrderCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActionTile } from '@/components/dashboard/ActionTile';
import { getNavItems } from '@/components/layout/nav-items';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  TrendingUp,
  CreditCard,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === 'pendiente' || order.status === 'en_proceso'),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (!dateRange || !dateRange.from) return orders;

    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to || dateRange.from);

    return orders.filter((order) => {
      const date = new Date(order.createdAt);
      return isWithinInterval(date, { start, end });
    });
  }, [orders, dateRange]);

  const kpis = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const activeOrdersCount = activeOrders.length;

    const totalSales = filteredOrders.reduce((sum, order) => {
      return sum + (order.totalPrice ? Number(order.totalPrice) : 0);
    }, 0);

    const cashFlow = orders.reduce((sum, order) => {
      if (!order.payments) return sum;

      const paymentsInPeriod = order.payments.filter((payment) => {
        if (!dateRange || !dateRange.from) return true;
        const paymentDate = new Date(payment.paidAt);
        const start = startOfDay(dateRange.from);
        const end = endOfDay(dateRange.to || dateRange.from);
        return isWithinInterval(paymentDate, { start, end });
      });

      return sum + paymentsInPeriod.reduce((acc, p) => acc + Number(p.amount), 0);
    }, 0);

    const completedOrders = filteredOrders.filter((o) => o.status === 'completado' || o.status === 'entregado').length;

    const periodOutstanding = filteredOrders.reduce((sum, order) => {
      const total = order.totalPrice ? Number(order.totalPrice) : 0;
      const paid = order.payments ? order.payments.reduce((acc, p) => acc + Number(p.amount), 0) : 0;
      return sum + Math.max(0, total - paid);
    }, 0);

    return {
      totalOrders,
      activeOrdersCount,
      totalSales,
      cashFlow,
      completedOrders,
      periodOutstanding,
    };
  }, [filteredOrders, orders, dateRange, activeOrders]);

  const pendingDebtTotal = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (!order.totalPrice) return sum;
      const total = Number(order.totalPrice);
      const paid = order.payments ? order.payments.reduce((acc, p) => acc + Number(p.amount), 0) : 0;
      const remaining = total - paid;
      return remaining > 0 ? sum + remaining : sum;
    }, 0);
  }, [orders]);

  // Quick-access tiles mirror the nav, minus the screen we are already on.
  const tiles = useMemo(
    () => (user ? getNavItems(user).filter((item) => item.href !== '/dashboard') : []),
    [user]
  );

  const isAdmin = user?.role === 'admin';
  const periodHint = dateRange ? 'En el periodo seleccionado' : 'Histórico total';

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Hola,</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
        </div>

        {/* Phones get a toggle so the date picker does not eat the first screen. */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={16} />
              {dateRange?.from ? 'Periodo filtrado' : 'Filtrar por periodo'}
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform ${showFilter ? 'rotate-90' : ''}`}
            />
          </Button>
          {showFilter && (
            <div className="mt-3 space-y-2">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              {dateRange?.from && (
                <Button variant="ghost" className="w-full" onClick={() => setDateRange(undefined)}>
                  Limpiar filtro
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </header>

      {user?.role === 'dentist' && !user.verified && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <Clock size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Cuenta pendiente de verificación</p>
            <p className="mt-0.5 text-amber-800">
              Un administrador debe aprobar tu cuenta antes de que puedas crear pedidos.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        <StatCard
          label="Pedidos Generados"
          value={kpis.totalOrders}
          hint={periodHint}
          icon={Package}
          tint="bg-blue-50 text-blue-600"
        />

        {isAdmin ? (
          <StatCard
            label="Ventas Totales"
            value={formatCurrency(kpis.totalSales)}
            hint="Valor de pedidos creados"
            icon={TrendingUp}
            tint="bg-green-50 text-green-600"
          />
        ) : (
          <StatCard
            label="Pedidos Activos"
            value={kpis.activeOrdersCount}
            hint="En proceso actualmente"
            icon={Clock}
            tint="bg-indigo-50 text-indigo-600"
            valueClassName="text-blue-600"
          />
        )}

        {isAdmin ? (
          <StatCard
            label="Cobrado (Flujo)"
            value={formatCurrency(kpis.cashFlow)}
            hint="Pagos registrados en el periodo"
            icon={DollarSign}
            tint="bg-emerald-50 text-emerald-600"
          />
        ) : (
          <StatCard
            label="Completados"
            value={kpis.completedOrders}
            hint={periodHint}
            icon={CheckCircle2}
            tint="bg-green-50 text-green-600"
            valueClassName="text-green-600"
          />
        )}

        <StatCard
          label="Deuda Global Actual"
          value={formatCurrency(pendingDebtTotal)}
          hint="Saldo pendiente total acumulado"
          icon={CreditCard}
          tint="bg-red-50 text-red-600"
          valueClassName="text-red-600"
        />
      </section>

      {tiles.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900 md:text-lg">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((tile) => (
              <ActionTile
                key={tile.href}
                href={tile.href}
                label={tile.label}
                description={tile.description}
                icon={tile.icon}
                tint={tile.tint}
                badge={tile.href === '/orders/history' ? activeOrders.length : undefined}
                featured={tile.href === '/orders/new'}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 md:text-lg">Pedidos en Curso</h2>
          {activeOrders.length > 0 && (
            <Link
              href="/orders/history"
              className="flex items-center gap-0.5 text-sm font-medium text-blue-600"
            >
              Ver todos
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No hay pedidos activos en este momento.</p>
            {user?.role === 'dentist' && user?.verified && (
              <Link href="/orders/new" className="mt-3 inline-block text-sm font-semibold text-blue-600">
                Crear un nuevo pedido
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
