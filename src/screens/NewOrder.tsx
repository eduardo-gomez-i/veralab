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
import { DENTAL_PIECES, getServiceCategory, LAB_SERVICE_CATALOG } from '@/lib/order-catalog';

interface NewOrderFormData {
  patientName: string;
  prosthesisType: ProsthesisType;
  serviceName: string;
  material: Material;
  dentalPieces: string;
  specifications: string;
  deliveryDate: string;
  notes: string;
  priority: Priority;
}

const NewOrder = () => {
  const router = useRouter();
  const { addOrder } = useOrders();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const defaultCategory = LAB_SERVICE_CATALOG[0];

  const [formData, setFormData] = useState<NewOrderFormData>({
    patientName: '',
    prosthesisType: defaultCategory.value as ProsthesisType,
    serviceName: String(defaultCategory.services[0] || ''),
    material: defaultCategory.materials[0] as Material,
    dentalPieces: '',
    specifications: '',
    deliveryDate: '',
    notes: '',
    priority: 'normal' as Priority,
  });

  const selectedCategory = getServiceCategory(formData.prosthesisType);

  const handleChange = (field: keyof NewOrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    const category = getServiceCategory(value);
    setFormData((prev) => ({
      ...prev,
      prosthesisType: value as ProsthesisType,
      serviceName: String(category.services[0] || ''),
      material: String(category.materials[0] || '') as Material,
    }));
  };

  const handlePieceToggle = (piece: string) => {
    const currentPieces = formData.dentalPieces
      ? formData.dentalPieces.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    const nextPieces = currentPieces.includes(piece)
      ? currentPieces.filter((item) => item !== piece)
      : [...currentPieces, piece].sort((a, b) => Number(a) - Number(b));

    setFormData((prev) => ({
      ...prev,
      dentalPieces: nextPieces.join(', '),
    }));
  };

  const selectedPieces = formData.dentalPieces
    ? formData.dentalPieces.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

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
          <CardTitle className="text-2xl text-blue-600">Nuevo Pedido de Laboratorio</CardTitle>
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
              <h3 className="font-semibold text-lg border-b pb-2">Servicio solicitado</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prosthesisType">Área del laboratorio</Label>
                  <Select value={formData.prosthesisType} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione área" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_SERVICE_CATALOG.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceName">Servicio</Label>
                  <Select value={formData.serviceName} onValueChange={(value) => handleChange('serviceName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Material / variante</Label>
                  <Select value={formData.material} onValueChange={(value) => handleChange('material', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione material" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.materials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="dentalPieces">Piezas dentales</Label>
                  <Input
                    id="dentalPieces"
                    value={formData.dentalPieces}
                    onChange={(e) => handleChange('dentalPieces', e.target.value)}
                    placeholder="Ej. 11, 12, 21"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Selector rápido de piezas</Label>
                <div className="space-y-2 rounded-md border p-3">
                  {DENTAL_PIECES.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-8 gap-2">
                      {row.map((piece) => (
                        <button
                          key={piece}
                          type="button"
                          className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                            selectedPieces.includes(piece)
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-700'
                          }`}
                          onClick={() => handlePieceToggle(piece)}
                        >
                          {piece}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Especificaciones técnicas</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => handleChange('specifications', e.target.value)}
                  placeholder="Ej. color, tipo de terminado, indicaciones clínicas, antagonista, diseño o requerimientos del laboratorio..."
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
