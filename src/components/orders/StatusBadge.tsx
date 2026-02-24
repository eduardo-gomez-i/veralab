import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  en_proceso: { label: 'En Proceso', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  completado: { label: 'Completado', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
  entregado: { label: 'Entregado', className: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pendiente;
  
  return (
    <Badge variant="outline" className={`font-normal border-0 ${config.className}`}>
      {config.label}
    </Badge>
  );
};
