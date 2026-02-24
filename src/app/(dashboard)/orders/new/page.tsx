import NewOrder from '@/pages/NewOrder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nuevo Pedido - Sistema de Pedidos',
};

export default function NewOrderPage() {
  return <NewOrder />;
}
