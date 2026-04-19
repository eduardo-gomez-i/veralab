"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { useAuth } from './AuthContext';

interface OrderFilters {
  status?: OrderStatus;
  searchTerm?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  filters: OrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilters>>;
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'dentistName' | 'dentistId'>, attachment?: File | null) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderAttachment: (orderId: string, attachment: File) => Promise<void>;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all fetched orders locally for filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({});

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Error fetching orders');
      
      let data: Order[] = await response.json();
      
      // Filtrar por rol si es necesario (el backend devuelve todo por ahora)
      // En una app real, el backend debería filtrar por usuario si no es admin
      if (user.role === 'dentist') {
        data = data.filter(o => o.dentistId === user.id);
      }
      
      setAllOrders(data);
      // La aplicación de filtros se hará en el useEffect dependiente de allOrders y filters
      setError(null);
    } catch (err) {
      setError('Error al cargar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Aplicar filtros en memoria
  useEffect(() => {
    let filteredData = [...allOrders];
      
    if (filters.status && filters.status !== ('all' as any)) {
      filteredData = filteredData.filter(o => o.status === filters.status);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filteredData = filteredData.filter(o => 
        o.patientName.toLowerCase().includes(term) || 
        o.id.toLowerCase().includes(term)
      );
    }
    setOrders(filteredData);
  }, [allOrders, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'dentistName' | 'dentistId'>, attachment?: File | null) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Usamos FormData para permitir adjuntos
      const form = new FormData();
      form.append('patientName', orderData.patientName);
      form.append('prosthesisType', orderData.prosthesisType as string);
      if (orderData.serviceName) form.append('serviceName', orderData.serviceName);
      form.append('material', orderData.material as string);
      if (orderData.dentalPieces) form.append('dentalPieces', orderData.dentalPieces);
      form.append('specifications', orderData.specifications || '');
      form.append('deliveryDate', orderData.deliveryDate);
      form.append('status', orderData.status);
      if (orderData.notes) form.append('notes', orderData.notes);
      form.append('priority', orderData.priority as string);
      form.append('dentistId', user.id);
      form.append('dentistName', user.name);
      if (attachment) {
        form.append('attachment', attachment);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        let message = 'Failed to create order';
        try {
          const data = await response.json();
          console.error('Order creation failed', {
            status: response.status,
            data,
          });
          if (data && typeof data === 'object' && 'error' in data && data.error) {
            message = String((data as any).error);
          }
        } catch {
          const text = await response.text();
          console.error('Order creation failed (raw body)', {
            status: response.status,
            body: text,
          });
        }
        throw new Error(message);
      }
      
      await fetchOrders();
    } catch (err) {
      setError('Error al crear pedido');
      console.error('addOrder error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderAttachment = async (orderId: string, attachment: File) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('attachment', attachment);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: form,
      });
      if (!response.ok) throw new Error('Failed to update attachment');
      await fetchOrders();
    } catch (err) {
      setError('Error al actualizar adjunto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchOrders();
    } catch (err) {
      setError('Error al actualizar estado');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        filters,
        setFilters,
        addOrder,
        updateOrderStatus,
        updateOrderAttachment,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
