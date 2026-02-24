"use client";

import { Order } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';
import { Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const router = useRouter();

  const paidAmount = order.payments && order.payments.length > 0
    ? order.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
  const total = order.totalPrice ? Number(order.totalPrice) : null;
  const remaining = total !== null ? Number((total - paidAmount).toFixed(2)) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-1">#{order.id}</p>
            <h3 className="font-semibold text-lg text-gray-900">{order.patientName}</h3>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <FileText size={16} className="mr-2 text-blue-500" />
          <span className="capitalize">{order.prosthesisType} - {order.material}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar size={16} className="mr-2 text-blue-500" />
          <span>Entrega: {formatDate(order.deliveryDate)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <User size={16} className="mr-2 text-blue-500" />
          <span>Dr: {order.dentistName}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="mr-2 text-xs uppercase tracking-wide text-gray-500">
            Saldo
          </span>
          {total === null ? (
            <span className="text-xs text-gray-400">Sin asignar</span>
          ) : remaining !== null && remaining <= 0 ? (
            <span className="text-xs font-semibold text-green-600">
              $ 0.00
            </span>
          ) : (
            <span className="text-xs font-semibold text-red-600">
              $ {remaining?.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => router.push('/orders/history')}>
          Ver Detalles
        </Button>
      </CardFooter>
    </Card>
  );
};
