"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, User as UserIcon, Calendar, Shield, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'admin' | 'dentist';
  verified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'dentist',
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Usuario creado", description: "El usuario se ha creado exitosamente" });
        setIsDialogOpen(false);
        setFormData({ name: '', username: '', password: '', role: 'dentist' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({ variant: "destructive", title: "Error", description: error.error || "Error al crear usuario" });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error inesperado" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Usuario eliminado", description: "El usuario ha sido eliminado correctamente" });
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el usuario" });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });
      if (response.ok) {
        toast({ title: "Usuario verificado", description: "El dentista fue aprobado y notificado por correo." });
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se pudo verificar el usuario" });
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const pendingUsers = users.filter(u => u.role === 'dentist' && !u.verified);

  if (loading) return <div className="p-8">Cargando usuarios...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios del sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dentist">Dentista</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Crear Usuario</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Solicitudes pendientes */}
      {pendingUsers.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-yellow-800 font-semibold text-sm">
            <Clock className="h-4 w-4" />
            {pendingUsers.length} solicitud{pendingUsers.length > 1 ? 'es' : ''} pendiente{pendingUsers.length > 1 ? 's' : ''} de verificación
          </div>
          <div className="space-y-2">
            {pendingUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-white rounded-md px-4 py-3 border border-yellow-100">
                <div>
                  <p className="font-medium text-sm text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">@{u.username}{u.email ? ` · ${u.email}` : ''}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleVerify(u.id)}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> @{user.username}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role === 'admin' ? 'Admin' : 'Dentista'}
                  </span>
                  {user.role === 'dentist' && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.verified ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {user.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {user.role === 'dentist' && !user.verified && (
                    <Button size="sm" onClick={() => handleVerify(user.id)} className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" /> Aprobar
                    </Button>
                  )}
                  {user.id !== currentUser?.id && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2">
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div>{user.name}</div>
                  {user.email && <div className="text-xs text-gray-400">{user.email}</div>}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Dentista'}
                  </span>
                </TableCell>
                <TableCell>
                  {user.role === 'dentist' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.verified ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {user.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.role === 'dentist' && !user.verified && (
                      <Button size="sm" onClick={() => handleVerify(user.id)} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Aprobar
                      </Button>
                    )}
                    {user.id !== currentUser?.id && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
