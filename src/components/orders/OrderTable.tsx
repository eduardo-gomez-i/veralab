import { Order, OrderStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useRef, useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Fecha Entrega</TableHead>
              <TableHead>Entrega Estimada</TableHead>
              <TableHead>Dentista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Adjunto</TableHead>
              {user?.role === 'admin' && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
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
                    <TableCell className="capitalize">{order.material}</TableCell>
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
                          $ 0.00
                        </span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">
                          $ {remaining?.toFixed(2)}
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
                        <Select
                          defaultValue={order.status}
                          onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                          disabled={updatingId === order.id}
                        >
                          <SelectTrigger className="w-[130px] h-8">
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
                          variant="ghost"
                          size="sm"
                          className="ml-2"
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
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => fileInputsRef.current[order.id]?.click()}
                          disabled={updatingId === order.id}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Adjuntar
                        </Button>
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
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium capitalize">{selected.prosthesisType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Material</p>
                  <p className="font-medium capitalize">{selected.material}</p>
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
                      ? `$ ${Number(selected.totalPrice).toFixed(2)}`
                      : 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Saldo pendiente</p>
                  <p className="font-medium">
                    {selected.totalPrice
                      ? `$ ${(Number(selected.totalPrice) - getPaidAmount(selected)).toFixed(2)}`
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
                                  $ {Number(p.amount).toFixed(2)}
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
                      if (!paymentAmount) return;
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
                        await fetch(`/api/orders/${selected.id}/payments`, {
                          method: 'POST',
                          body: form,
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
