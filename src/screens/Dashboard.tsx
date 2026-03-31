"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, TrendingUp, CreditCard, DollarSign, Package, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.name}</h1>
          <p className="text-gray-500">Bienvenido a tu panel de control</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full md:w-auto" />
          {user?.role === 'dentista' && (
            <Button onClick={() => router.push('/orders/new')} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos Generados</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalOrders}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Package size={20} />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">{dateRange ? 'En el periodo seleccionado' : 'Histórico total'}</div>
        </div>

        {user?.role === 'admin' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis.totalSales)}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Valor de pedidos creados</div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Pedidos Activos</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">{kpis.activeOrdersCount}</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Clock size={20} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">En proceso actualmente</div>
          </div>
        )}

        {user?.role === 'admin' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Cobrado (Flujo)</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis.cashFlow)}</h3>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">Pagos registrados en el periodo</div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Completados</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{kpis.completedOrders}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{dateRange ? 'En el periodo seleccionado' : 'Histórico total'}</div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Deuda Global Actual</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(pendingDebtTotal)}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Saldo pendiente total acumulado</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos en Curso</h2>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <p className="text-gray-500">No hay pedidos activos en este momento.</p>
            {user?.role === 'dentista' && (
              <Button variant="link" onClick={() => router.push('/orders/new')} className="mt-2 text-blue-600">
                Crear un nuevo pedido
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

