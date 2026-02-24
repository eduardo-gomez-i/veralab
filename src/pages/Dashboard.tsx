"use client";

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();
  const router = useRouter();

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const activeOrders = orders.filter(
    order => order.status === 'pendiente' || order.status === 'en_proceso'
  );

  const getPaidAmount = (totalOrders: typeof orders[number][]) => {
    return totalOrders.reduce((sum, order) => {
      if (!order.payments || order.payments.length === 0) return sum;
      const paid = order.payments.reduce(
        (acc, p) => acc + Number(p.amount),
        0
      );
      return sum + paid;
    }, 0);
  };

  const pendingDebt = useMemo(() => {
    if (!user || user.role !== 'dentista') return 0;
    return orders.reduce((sum, order) => {
      if (!order.totalPrice) return sum;
      const total = Number(order.totalPrice);
      const paid =
        order.payments && order.payments.length > 0
          ? order.payments.reduce(
              (acc, p) => acc + Number(p.amount),
              0
            )
          : 0;
      const remaining = total - paid;
      return remaining > 0 ? sum + remaining : sum;
    }, 0);
  }, [orders, user]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.name}</h1>
          <p className="text-gray-500">Bienvenido a tu panel de control</p>
        </div>
        {user?.role === 'dentista' && (
          <Button onClick={() => router.push('/orders/new')} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500 font-medium">Pedidos Activos</p>
          <p className="text-3xl font-bold text-blue-600">{activeOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500 font-medium">Pedidos Totales</p>
          <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500 font-medium">Completados</p>
          <p className="text-3xl font-bold text-green-600">
            {orders.filter(o => o.status === 'completado' || o.status === 'entregado').length}
          </p>
        </div>
        {user?.role === 'dentista' && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500 font-medium">Saldo pendiente</p>
            <p className="text-3xl font-bold text-red-600">
              $ {pendingDebt.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos en Curso</h2>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map(order => (
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
