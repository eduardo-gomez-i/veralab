export type UserRole = 'dentista' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export type ProsthesisType = string;
export type Material = string;
export type OrderStatus = 'pendiente' | 'en_proceso' | 'completado' | 'entregado';
export type Priority = string;

export interface Payment {
  id: string;
  orderId: string;
  amount: string;
  paidAt: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Visit {
  id: number;
  date: string;
  title: string;
  notes?: string;
  dentists: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  patientName: string;
  prosthesisType: ProsthesisType;
  serviceName?: string;
  material: Material;
  dentalPieces?: string;
  specifications: string;
  deliveryDate: string; // ISO Date string
  status: OrderStatus;
  dentistId: string;
  dentistName: string;
  createdAt: string; // ISO Date string
  notes?: string;
  priority: Priority;
   attachmentUrl?: string;
   totalPrice?: string;
   estimatedDeliveryDate?: string;
   payments?: Payment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
