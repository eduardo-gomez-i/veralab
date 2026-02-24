"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Payment, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, User, DollarSign, ExternalLink } from 'lucide-react';

interface PaymentWithOrder extends Payment {
  order: Pick<Order, 'id' | 'patientName' | 'dentistName' | 'dentistId'>;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'withDebt' | 'fullyPaid'>('all');

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      try {
        const params = new URLSearchParams();
        params.set('role', user.role);
        if (user.role === 'dentista') {
          params.set('dentistId', user.id);
        }
        const res = await fetch(`/api/payments?${params.toString()}`);
        if (!res.ok) return;
        const data: any[] = await res.json();
        setPayments(
          data.map((p) => ({
            ...p,
            amount: String(p.amount),
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  const filtered = useMemo(() => {
    let result = [...payments];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.order.id.toLowerCase().includes(term) ||
          p.order.patientName.toLowerCase().includes(term) ||
          p.order.dentistName.toLowerCase().includes(term)
      );
    }
    // orderFilter is placeholder for future enhancements when we include order totals
    return result;
  }, [payments, search, orderFilter]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Registro de Pagos' : 'Mis Pagos'}
          </h1>
          <p className="text-sm text-gray-500">
            Consulta todos los pagos {user.role === 'admin' ? 'registrados en el sistema.' : 'que se han aplicado a tus pedidos.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por paciente, ID de pedido o dentista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="w-full md:w-[220px]">
              <Select
                value={orderFilter}
                onValueChange={(v) => setOrderFilter(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtro por pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="withDebt" disabled>
                    Pedidos con saldo (próximamente)
                  </SelectItem>
                  <SelectItem value="fullyPaid" disabled>
                    Pedidos liquidados (próximamente)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
            Cargando pagos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
            No se encontraron pagos.
          </div>
        ) : (
          filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-gray-500">#{p.order.id}</span>
                    <h3 className="font-semibold text-gray-900">{p.order.patientName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User className="h-3 w-3" /> {p.order.dentistName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 flex items-center justify-end">
                      <DollarSign className="h-3 w-3" /> {formatCurrency(p.amount)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {formatDate(p.paidAt)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  {p.receiptUrl ? (
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Ver comprobante
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Sin comprobante</span>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() =>
                      router.push(
                        `/orders/history?orderId=${encodeURIComponent(
                          p.order.id
                        )}`
                      )
                    }
                  >
                    Ver pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Cargando pagos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No se encontraron pagos.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.paidAt)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.order.id}
                  </TableCell>
                  <TableCell>{p.order.patientName}</TableCell>
                  <TableCell>{p.order.dentistName}</TableCell>
                  <TableCell>
                    {formatCurrency(p.amount)}
                  </TableCell>
                  <TableCell>
                    {p.receiptUrl ? (
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-xs"
                      >
                        Ver comprobante
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Sin comprobante</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        router.push(
                          `/orders/history?orderId=${encodeURIComponent(
                            p.order.id
                          )}`
                        )
                      }
                    >
                      Ver pedido
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
