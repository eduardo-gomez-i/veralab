import Dashboard from '@/pages/Dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Sistema de Pedidos',
};

export default function DashboardPage() {
  return <Dashboard />;
}
