import Login from '@/pages/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Sistema de Pedidos',
};

export default function LoginPage() {
  return <Login />;
}
