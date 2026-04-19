"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Visit, User } from '@/types';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Calendar, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VisitsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [dentists, setDentists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formDate, setFormDate] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [selectedDentists, setSelectedDentists] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchDentists();
    fetchVisits();
  }, [user, router]);

  const fetchDentists = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return;
      const data: any[] = await res.json();
      const onlyDentists = data.filter((u) => u.role === 'dentist');
      setDentists(
        onlyDentists.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          role: 'dentist' as const,
          verified: u.verified ?? true,
        }))
      );
    } catch (error) {
      console.error('Error fetching dentists', error);
    }
  };

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (!res.ok) return;
      const data: Visit[] = await res.json();
      setVisits(data);
    } catch (error) {
      console.error('Error fetching visits', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las visitas',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormDate('');
    setFormTitle('');
    setFormNotes('');
    setSelectedDentists([]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formTitle || selectedDentists.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description:
          'Debes indicar fecha, título y al menos un dentista para la visita.',
      });
      return;
    }
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date(formDate).toISOString(),
          title: formTitle,
          notes: formNotes || undefined,
          dentistIds: selectedDentists,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err?.error || 'No se pudo crear la visita',
        });
        return;
      }
      toast({
        title: 'Visita creada',
        description: 'La visita ha sido programada correctamente.',
      });
      setDialogOpen(false);
      resetForm();
      fetchVisits();
    } catch (error) {
      console.error('Error creating visit', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error inesperado',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta visita?')) return;
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo eliminar la visita',
        });
        return;
      }
      toast({
        title: 'Visita eliminada',
        description: 'La visita ha sido eliminada correctamente.',
      });
      setVisits((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Error deleting visit', error);
    }
  };

  const toggleDentist = (id: string) => {
    setSelectedDentists((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-6">Cargando visitas...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Programación de Visitas
          </h1>
          <p className="text-muted-foreground">
            Agenda las visitas presenciales a los dentistas.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button
            className="gap-2"
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva visita</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar nueva visita</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="date">
                  Fecha de visita
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Título / Motivo
                </label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="notes">
                  Notas
                </label>
                <Textarea
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Información adicional sobre la visita..."
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Dentistas a visitar</p>
                  {dentists.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedDentists(dentists.map((d) => d.id))
                        }
                      >
                        Seleccionar todos
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDentists([])}
                      >
                        Limpiar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="max-h-60 overflow-auto border rounded-md p-2 space-y-1">
                  {dentists.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No hay dentistas registrados.
                    </p>
                  ) : (
                    dentists.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedDentists.includes(d.id)}
                          onChange={() => toggleDentist(d.id)}
                        />
                        <span>{d.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar visita</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {visits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
            No hay visitas programadas.
          </div>
        ) : (
          visits.map((visit) => (
            <Card key={visit.id} className="overflow-hidden">
               <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-semibold text-gray-900">
                         {visit.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" /> {formatDate(visit.date)}
                      </p>
                   </div>
                   <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(visit.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
                 
                 <div className="bg-gray-50 p-2 rounded text-sm">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> Dentistas
                    </p>
                    <p>{visit.dentists.map((d) => d.name).join(', ') || '—'}</p>
                 </div>

                 {visit.notes && (
                   <div className="text-sm text-gray-600 border-t pt-2">
                      <p className="text-xs text-gray-500 mb-1">Notas:</p>
                      {visit.notes}
                   </div>
                 )}
               </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Dentistas</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="w-[80px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No hay visitas programadas.
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{formatDate(visit.date)}</TableCell>
                  <TableCell>{visit.title}</TableCell>
                  <TableCell>
                    {visit.dentists.map((d) => d.name).join(', ') || '—'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {visit.notes || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(visit.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
