"use client";

import Link from 'next/link';
import { Order } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, ChevronRight, User } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const paidAmount = order.payments && order.payments.length > 0
    ? order.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
  const total = order.totalPrice ? Number(order.totalPrice) : null;
  const remaining = total !== null ? Number((total - paidAmount).toFixed(2)) : null;

  return (
    // The whole card is the tap target — no small "Ver detalles" link to aim at.
    <Link
      href={`/orders/history?orderId=${encodeURIComponent(order.id)}`}
      className="tap-scale block rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">#{order.id}</p>
          <h3 className="truncate text-base font-semibold text-gray-900">{order.patientName}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="mt-2 truncate text-sm capitalize text-gray-700">{order.prosthesisType}</p>
      <p className="truncate text-xs text-gray-500">
        {order.serviceName || order.material || 'Sin detalle de servicio'}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={14} className="shrink-0 text-blue-500" />
          <dt className="sr-only">Entrega</dt>
          <dd className="truncate">{formatDate(order.deliveryDate)}</dd>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <User size={14} className="shrink-0 text-blue-500" />
          <dt className="sr-only">Odontólogo</dt>
          <dd className="truncate">{order.dentistName}</dd>
        </div>
        {order.dentalPieces && (
          <div className="col-span-2 flex items-baseline gap-1.5 text-gray-600">
            <dt className="shrink-0 uppercase tracking-wide text-gray-500">Piezas</dt>
            <dd className="truncate">{order.dentalPieces}</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500">Saldo</span>
          {total === null ? (
            <span className="text-sm text-gray-400">Sin asignar</span>
          ) : remaining !== null && remaining <= 0 ? (
            <span className="text-sm font-semibold text-green-600">{formatCurrency(0)}</span>
          ) : (
            <span className="text-sm font-semibold text-red-600">{formatCurrency(remaining || 0)}</span>
          )}
        </div>
        <span className="flex items-center text-sm font-medium text-blue-600">
          Detalles
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
};
