import { Order, OrderStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useRef, useState } from 'react';
import { Loader2, Paperclip, ChevronRight, User, Calendar, DollarSign, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface OrderTableProps {
  orders: Order[];
}

export const OrderTable = ({ orders }: OrderTableProps) => {
  const { user } = useAuth();
  const { updateOrderStatus, updateOrderAttachment, refreshOrders } = useOrders();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [selected, setSelected] = useState<Order | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<string>('');
  const [estimatedDateInput, setEstimatedDateInput] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();

  const openDetails = (order: Order) => {
    setSelected(order);
    setIsOpen(true);
    setPriceInput(order.totalPrice || '');
    setEstimatedDateInput(
      order.estimatedDeliveryDate
        ? order.estimatedDeliveryDate.slice(0, 10)
        : ''
    );
  };

  const getPaidAmount = (order: Order) => {
    if (!order.payments || order.payments.length === 0) return 0;
    return order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setUpdatingId(null);
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const handlePrintOrder = (order: Order) => {
    if (typeof window === 'undefined') return;

    const paidAmount = getPaidAmount(order);
    const totalPrice = order.totalPrice ? Number(order.totalPrice) : null;
    const balance = totalPrice !== null ? Math.max(0, totalPrice - paidAmount) : null;

    const printableFields = [
      ['Pedido', order.id],
      ['Paciente', order.patientName],
      ['Dentista', order.dentistName],
      ['Estado', order.status.replaceAll('_', ' ')],
      ['Área', order.prosthesisType],
      ['Servicio', order.serviceName || 'Sin especificar'],
      ['Material', order.material || 'Sin especificar'],
      ['Piezas', order.dentalPieces || 'Sin especificar'],
      ['Entrega solicitada', formatDate(order.deliveryDate)],
      ['Entrega estimada', order.estimatedDeliveryDate ? formatDate(order.estimatedDeliveryDate) : 'Sin estimar'],
      ['Costo total', totalPrice !== null ? formatCurrency(totalPrice) : 'Sin asignar'],
      ['Abonado', formatCurrency(paidAmount)],
      ['Saldo', balance !== null ? formatCurrency(balance) : 'Sin asignar'],
      ['Prioridad', order.priority],
    ];

    const detailsHtml = printableFields
      .map(
        ([label, value]) => `
          <div class="row">
            <span class="label">${escapeHtml(label)}</span>
            <span class="value">${escapeHtml(value)}</span>
          </div>
        `
      )
      .join('');

    const specs = order.specifications?.trim() || 'Sin especificaciones';
    const notes = order.notes?.trim() || 'Sin notas';
    const issuedAt = new Date().toLocaleString('es-MX');

    const printWindow = window.open('', '_blank', 'width=420,height=720');

    if (!printWindow) {
      toast({
        variant: 'destructive',
        title: 'No se pudo abrir la impresión',
        description: 'Verifica que tu navegador no esté bloqueando ventanas emergentes.',
      });
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Nota de pedido ${escapeHtml(order.id)}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #000;
              background: #fff;
            }
            .ticket {
              width: 80mm;
              max-width: 80mm;
              padding: 8px 10px 14px;
              margin: 0 auto;
            }
            .center { text-align: center; }
            .title {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .subtitle {
              font-size: 11px;
              margin-bottom: 8px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              font-size: 11px;
              margin-bottom: 4px;
              align-items: flex-start;
            }
            .label {
              font-weight: 700;
              min-width: 74px;
            }
            .value {
              text-align: right;
              white-space: pre-wrap;
              word-break: break-word;
              flex: 1;
            }
            .block-title {
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .block-text {
              font-size: 11px;
              white-space: pre-wrap;
              word-break: break-word;
              line-height: 1.35;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 10px;
            }
            @page {
              size: 80mm auto;
              margin: 4mm;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="center">
              <div class="title">VeraLAB</div>
              <div class="subtitle">Nota de pedido</div>
            </div>
            <div class="divider"></div>
            ${detailsHtml}
            <div class="divider"></div>
            <div class="block-title">Especificaciones</div>
            <div class="block-text">${escapeHtml(specs)}</div>
            <div class="divider"></div>
            <div class="block-title">Notas</div>
            <div class="block-text">${escapeHtml(notes)}</div>
            <div class="divider"></div>
            <div class="footer">Impreso: ${escapeHtml(issuedAt)}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
            No se encontraron pedidos.
          </div>
        ) : (
          orders.map((order) => {
            const paid = getPaidAmount(order);
            const total = order.totalPrice ? Number(order.totalPrice) : null;
            const remaining = total !== null ? Number((total - paid).toFixed(2)) : null;
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-500">#{order.id}</span>
                      <h3 className="font-semibold text-gray-900">{order.patientName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" /> {order.dentistName}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Área</p>
                      <p className="font-medium capitalize">{order.prosthesisType}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500">Entrega</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="text-xs text-gray-500">Servicio</p>
                    <p className="font-medium">{order.serviceName || 'Sin especificar'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Material: {order.material || 'Sin especificar'}
                    </p>
                    {order.dentalPieces && (
                      <p className="text-xs text-gray-500">Piezas: {order.dentalPieces}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                       {total === null ? (
                        <span className="text-gray-400 text-xs">Sin asignar</span>
                      ) : remaining !== null && remaining <= 0 ? (
                        <span className="text-green-600 text-xs font-semibold flex items-center">
                          <DollarSign className="h-3 w-3" /> {formatCurrency(0)}
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold flex items-center">
                          <DollarSign className="h-3 w-3" /> {formatCurrency(remaining || 0)}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openDetails(order)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto">
                      Ver detalles <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="pt-2 border-t mt-2">
                      <div className="space-y-2">
                        <Select
                          defaultValue={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order.id, val as OrderStatus)
                          }
                          disabled={updatingId === order.id}
                        >
                          <SelectTrigger className="w-full h-9">
                            {updatingId === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_proceso">En Proceso</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="entregado">Entregado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handlePrintOrder(order)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Imprimir nota
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Piezas</TableHead>
              <TableHead>Fecha Entrega</TableHead>
              <TableHead>Entrega Estimada</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Adjunto</TableHead>
              {user?.role === 'admin' && (
                <TableHead className="w-[220px] text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center">
                  No se encontraron pedidos.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const paid = getPaidAmount(order);
                const total = order.totalPrice ? Number(order.totalPrice) : null;
                const remaining =
                  total !== null ? Number((total - paid).toFixed(2)) : null;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.patientName}</TableCell>
                    <TableCell className="capitalize">{order.prosthesisType}</TableCell>
                    <TableCell>{order.serviceName || 'Sin especificar'}</TableCell>
                    <TableCell className="capitalize">{order.material || 'Sin especificar'}</TableCell>
                    <TableCell>{order.dentalPieces || '—'}</TableCell>
                    <TableCell>{formatDate(order.deliveryDate)}</TableCell>
                    <TableCell>
                      {order.estimatedDeliveryDate
                        ? formatDate(order.estimatedDeliveryDate)
                        : 'Sin estimar'}
                    </TableCell>
                    <TableCell>{order.dentistName}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      {total === null ? (
                        <span className="text-gray-400 text-xs">Sin asignar</span>
                      ) : remaining !== null && remaining <= 0 ? (
                        <span className="text-green-600 text-xs font-semibold">
                          {formatCurrency(0)}
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">
                          {formatCurrency(remaining || 0)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.attachmentUrl ? (
                        <a
                          href={order.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <Paperclip className="h-4 w-4" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin adjunto</span>
                      )}
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
                          <Select
                            defaultValue={order.status}
                            onValueChange={(val) =>
                              handleStatusChange(order.id, val as OrderStatus)
                            }
                            disabled={updatingId === order.id}
                          >
                            <SelectTrigger className="w-full sm:w-[140px] h-8">
                              {updatingId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_proceso">En Proceso</SelectItem>
                              <SelectItem value="completado">Completado</SelectItem>
                              <SelectItem value="entregado">Entregado</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetails(order)}
                            >
                              Detalles
                            </Button>
                            <input
                              type="file"
                              accept="image/*,.pdf,.docx"
                              className="hidden"
                              ref={(el) => {
                                fileInputsRef.current[order.id] = el;
                              }}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUpdatingId(order.id);
                                try {
                                  await updateOrderAttachment(order.id, file);
                                } finally {
                                  setUpdatingId(null);
                                  if (fileInputsRef.current[order.id]) {
                                    fileInputsRef.current[order.id]!.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintOrder(order)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                fileInputsRef.current[order.id]?.click()
                              }
                              disabled={updatingId === order.id}
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {selected && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Pedido #{selected.id}</DialogTitle>
              <DialogDescription>Detalles del pedido y adjunto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {user?.role === 'admin' && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => handlePrintOrder(selected)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir nota térmica
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Paciente</p>
                  <p className="font-medium">{selected.patientName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dentista</p>
                  <p className="font-medium">{selected.dentistName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área</p>
                  <p className="font-medium capitalize">{selected.prosthesisType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Servicio</p>
                  <p className="font-medium">{selected.serviceName || 'Sin especificar'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Material</p>
                  <p className="font-medium capitalize">{selected.material || 'Sin especificar'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Piezas dentales</p>
                  <p className="font-medium">{selected.dentalPieces || 'Sin especificar'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Fecha solicitada por el dentista</p>
                  <p className="font-medium">
                    {formatDate(selected.deliveryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fecha estimada de entrega (admin)</p>
                  <p className="font-medium">
                    {selected.estimatedDeliveryDate
                      ? formatDate(selected.estimatedDeliveryDate)
                      : 'Sin estimar'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Costo total del trabajo</p>
                  <p className="font-medium">
                    {selected.totalPrice
                      ? formatCurrency(selected.totalPrice)
                      : 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Saldo pendiente</p>
                  <p className="font-medium">
                    {selected.totalPrice
                      ? formatCurrency(Number(selected.totalPrice) - getPaidAmount(selected))
                      : '—'}
                  </p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="space-y-3 border rounded-md p-3">
                  <p className="text-sm font-semibold">Editar datos económicos</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500">Costo total</p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Fecha estimada de entrega</p>
                      <input
                        type="date"
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={estimatedDateInput}
                        onChange={(e) => setEstimatedDateInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={async () => {
                      if (!selected) return;
                      setUpdatingId(selected.id);
                      try {
                        await fetch(`/api/orders/${selected.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            totalPrice: priceInput || null,
                            estimatedDeliveryDate: estimatedDateInput
                              ? new Date(estimatedDateInput).toISOString()
                              : null,
                          }),
                        });
                        await refreshOrders();
                      } finally {
                        setUpdatingId(null);
                      }
                    }}
                    disabled={updatingId === selected.id}
                  >
                    {updatingId === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Guardar cambios'
                    )}
                  </Button>
                </div>
              )}
              {user?.role === 'admin' && (
                <div className="space-y-3 border rounded-md p-3">
                  <p className="text-sm font-semibold">Pagos parciales</p>
                  <div className="space-y-2 text-sm">
                    {selected.payments && selected.payments.length > 0 ? (
                      <div className="max-h-48 overflow-auto border rounded">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 py-1 text-left">Fecha</th>
                              <th className="px-2 py-1 text-left">Monto</th>
                              <th className="px-2 py-1 text-left">Comprobante</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selected.payments.map((p) => (
                              <tr key={p.id} className="border-t">
                                <td className="px-2 py-1">
                                  {p.paidAt ? formatDate(p.paidAt) : '—'}
                                </td>
                                <td className="px-2 py-1">
                                  {formatCurrency(p.amount)}
                                </td>
                                <td className="px-2 py-1">
                                  {p.receiptUrl ? (
                                    <a
                                      href={p.receiptUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600"
                                    >
                                      Ver
                                    </a>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs">Sin pagos registrados</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs items-end">
                    <div className="space-y-1">
                      <p className="text-gray-500">Monto</p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border rounded px-2 py-1"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Fecha de pago</p>
                      <input
                        type="date"
                        className="w-full border rounded px-2 py-1"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500">Comprobante</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="w-full text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setPaymentReceipt(file);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!selected) return;
                      if (!paymentAmount) {
                        toast({
                          variant: 'destructive',
                          title: 'Monto requerido',
                          description: 'Debes ingresar un monto para el pago.',
                        });
                        return;
                      }
                      setPaymentLoading(true);
                      try {
                        const form = new FormData();
                        form.append('amount', paymentAmount);
                        if (paymentDate) {
                          form.append(
                            'paidAt',
                            new Date(paymentDate).toISOString()
                          );
                        }
                        if (paymentReceipt) {
                          form.append('receipt', paymentReceipt);
                        }
                        const res = await fetch(
                          `/api/orders/${selected.id}/payments`,
                          {
                            method: 'POST',
                            body: form,
                          }
                        );
                        if (!res.ok) {
                          const err = await res.json().catch(() => null);
                          toast({
                            variant: 'destructive',
                            title: 'Error al registrar pago',
                            description:
                              err?.error ||
                              'No se pudo registrar el pago. Intenta nuevamente.',
                          });
                          return;
                        }
                        toast({
                          title: 'Pago registrado',
                          description: 'El pago parcial se registró correctamente.',
                        });
                        setPaymentAmount('');
                        setPaymentDate('');
                        setPaymentReceipt(null);
                        await refreshOrders();
                      } finally {
                        setPaymentLoading(false);
                      }
                    }}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Registrar pago'
                    )}
                  </Button>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-sm mb-2">Especificaciones</p>
                <p className="whitespace-pre-wrap">{selected.specifications || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Adjunto</p>
                {selected.attachmentUrl ? (
                  <>
                    {/\.(png|jpe?g|webp)$/i.test(selected.attachmentUrl) ? (
                      <img
                        src={selected.attachmentUrl}
                        alt="Adjunto"
                        className="max-h-96 rounded border"
                      />
                    ) : /\.pdf$/i.test(selected.attachmentUrl) ? (
                      <object
                        data={selected.attachmentUrl}
                        type="application/pdf"
                        className="w-full h-[500px] border rounded"
                      >
                        <a href={selected.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          Ver PDF
                        </a>
                      </object>
                    ) : /\.docx$/i.test(selected.attachmentUrl) ? (
                      <a
                        href={selected.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        Descargar DOCX
                      </a>
                    ) : (
                      <a
                        href={selected.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                      >
                        Descargar adjunto
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Sin adjunto</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
