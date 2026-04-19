import Register from '@/screens/Register';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta - Sistema de Pedidos',
};

export default function RegisterPage() {
  return <Register />;
}
