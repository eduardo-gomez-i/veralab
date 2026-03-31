"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/contexts/OrderContext';
import { ProsthesisType, Material, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewOrder = () => {
  const router = useRouter();
  const { addOrder } = useOrders();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    patientName: '',
    prosthesisType: 'corona' as ProsthesisType,
    material: 'ceramica' as Material,
    specifications: '',
    deliveryDate: '',
    notes: '',
    priority: 'normal' as Priority,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addOrder(
        {
          ...formData,
          status: 'pendiente',
          deliveryDate: new Date(formData.deliveryDate).toISOString(),
        },
        attachment
      );

      toast({
        title: 'Pedido creado',
        description: 'El pedido ha sido registrado exitosamente.',
      });

      router.push('/dashboard');
    } catch (error) {
      const description =
        error instanceof Error && error.message
          ? error.message
          : 'No se pudo crear el pedido. Intente nuevamente.';
      toast({
        title: 'Error',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600">Nuevo Pedido de Prótesis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Datos del Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nombre Completo del Paciente</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleChange('patientName', e.target.value)}
                    placeholder="Ej. Ana García"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha de Entrega Requerida</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    required
                    min={(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      return d.toISOString().split('T')[0];
                    })()}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Detalles de la Prótesis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prosthesisType">Tipo de Prótesis</Label>
                  <Select value={formData.prosthesisType} onValueChange={(value) => handleChange('prosthesisType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corona">Corona</SelectItem>
                      <SelectItem value="puente">Puente</SelectItem>
                      <SelectItem value="implante">Implante</SelectItem>
                      <SelectItem value="protesis_removible">Prótesis Removible</SelectItem>
                      <SelectItem value="carilla">Carilla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select value={formData.material} onValueChange={(value) => handleChange('material', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceramica">Cerámica</SelectItem>
                      <SelectItem value="zirconio">Zirconio</SelectItem>
                      <SelectItem value="metal_ceramica">Metal-Cerámica</SelectItem>
                      <SelectItem value="acrilico">Acrílico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Especificaciones Técnicas / Color</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => handleChange('specifications', e.target.value)}
                  placeholder="Ej. Color A2, antagonista en oclusión..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Cualquier otra información relevante..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Adjuntar archivo (opcional)</Label>
                <Input
                  id="attachment"
                  type="file"
                  accept="image/*,.pdf,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAttachment(file);
                  }}
                />
                <p className="text-xs text-gray-500">Formatos permitidos: Imágenes, PDF, DOCX</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Pedido...
                  </>
                ) : (
                  'Crear Pedido'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewOrder;

