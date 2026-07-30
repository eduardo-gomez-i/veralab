"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/contexts/OrderContext';
import { ProsthesisType, Material, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToothPicker } from '@/components/orders/ToothPicker';
import { ArrowLeft, ArrowRight, Check, Loader2, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsDesktop } from '@/hooks/use-media-query';
import { getServiceCategory, LAB_SERVICE_CATALOG } from '@/lib/order-catalog';
import { cn } from '@/lib/utils';

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

const STEPS = [
  { title: 'Paciente', caption: 'Datos y fecha de entrega' },
  { title: 'Servicio', caption: 'Área, servicio y material' },
  { title: 'Piezas', caption: 'Selecciona las piezas dentales' },
  { title: 'Detalles', caption: 'Especificaciones y adjuntos' },
];

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const NewOrder = () => {
  const router = useRouter();
  const { addOrder } = useOrders();
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [step, setStep] = useState(0);
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

  // Only the first step has required fields; the rest are optional details.
  const stepIsValid = useMemo(() => {
    if (step !== 0) return true;
    return Boolean(formData.patientName.trim() && formData.deliveryDate);
  }, [step, formData.patientName, formData.deliveryDate]);

  const canSubmit = Boolean(formData.patientName.trim() && formData.deliveryDate);
  const isLastStep = step === STEPS.length - 1;

  const submit = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // On mobile the form spans several steps — advance instead of submitting.
    if (!isDesktop && !isLastStep) {
      if (stepIsValid) setStep((prev) => prev + 1);
      return;
    }

    if (!canSubmit) {
      setStep(0);
      return;
    }

    await submit();
  };

  // Desktop keeps the single long form; mobile shows one step at a time.
  const showStep = (index: number) => isDesktop || step === index;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="hidden md:block">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="md:rounded-xl md:border md:bg-white md:p-6 md:shadow">
        <div className="md:mb-6">
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl md:text-blue-600">
            Nuevo Pedido de Laboratorio
          </h1>
          <p className="mt-1 text-sm text-gray-500 md:hidden">
            Paso {step + 1} de {STEPS.length} · {STEPS[step].caption}
          </p>
        </div>

        {/* Step indicator (mobile only). */}
        <div className="mt-4 flex gap-1.5 md:hidden" aria-hidden="true">
          {STEPS.map((s, index) => (
            <span
              key={s.title}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index <= step ? 'bg-blue-600' : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6 pb-28 md:pb-0">
          {showStep(0) && (
            <section className="space-y-4">
              <h2 className="hidden border-b pb-2 text-lg font-semibold md:block">
                Datos del Paciente
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="patientName">Nombre completo del paciente</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleChange('patientName', e.target.value)}
                    placeholder="Ej. Ana García"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryDate">Fecha de entrega requerida</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    required
                    min={tomorrow()}
                  />
                </div>
              </div>
            </section>
          )}

          {showStep(1) && (
            <section className="space-y-4">
              <h2 className="hidden border-b pb-2 text-lg font-semibold md:block">
                Servicio solicitado
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prosthesisType">Área del laboratorio</Label>
                  <Select value={formData.prosthesisType} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="prosthesisType">
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

                <div className="space-y-1.5">
                  <Label htmlFor="serviceName">Servicio</Label>
                  <Select
                    value={formData.serviceName}
                    onValueChange={(value) => handleChange('serviceName', value)}
                  >
                    <SelectTrigger id="serviceName">
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

                <div className="space-y-1.5">
                  <Label htmlFor="material">Material / variante</Label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => handleChange('material', value)}
                  >
                    <SelectTrigger id="material">
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

              <div className="space-y-1.5">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority" className="md:w-1/2">
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
            </section>
          )}

          {showStep(2) && (
            <section className="space-y-4">
              <h2 className="hidden border-b pb-2 text-lg font-semibold md:block">
                Piezas dentales
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="dentalPieces">Piezas seleccionadas</Label>
                <Input
                  id="dentalPieces"
                  value={formData.dentalPieces}
                  onChange={(e) => handleChange('dentalPieces', e.target.value)}
                  placeholder="Ej. 11, 12, 21"
                  inputMode="numeric"
                />
              </div>
              <ToothPicker
                value={formData.dentalPieces}
                onChange={(value) => handleChange('dentalPieces', value)}
              />
            </section>
          )}

          {showStep(3) && (
            <section className="space-y-4">
              <h2 className="hidden border-b pb-2 text-lg font-semibold md:block">
                Detalles adicionales
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="specifications">Especificaciones técnicas</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) => handleChange('specifications', e.target.value)}
                  placeholder="Ej. color, tipo de terminado, indicaciones clínicas, antagonista, diseño o requerimientos del laboratorio..."
                  className="min-h-[110px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Cualquier otra información relevante..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attachment">Adjuntar archivo (opcional)</Label>
                <label
                  htmlFor="attachment"
                  className="flex min-h-touch cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-gray-600 active:bg-gray-50"
                >
                  <Paperclip size={18} className="shrink-0 text-blue-600" />
                  <span className="min-w-0 flex-1 truncate">
                    {attachment ? attachment.name : 'Toca para elegir una imagen, PDF o DOCX'}
                  </span>
                </label>
                <input
                  id="attachment"
                  type="file"
                  className="sr-only"
                  accept="image/*,.pdf,.docx"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
                {attachment && (
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="text-xs font-semibold text-red-600"
                  >
                    Quitar archivo
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Desktop actions */}
          <div className="hidden justify-end gap-4 pt-4 md:flex">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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

          {/* Mobile action bar, docked just above the tab bar. */}
          <div className="fixed inset-x-0 bottom-tabbar-safe z-30 border-t bg-white/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1"
                onClick={() => (step === 0 ? router.back() : setStep((prev) => prev - 1))}
                disabled={isSubmitting}
              >
                <ArrowLeft size={18} />
                {step === 0 ? 'Cancelar' : 'Atrás'}
              </Button>

              <Button type="submit" className="h-12 flex-1" disabled={isSubmitting || !stepIsValid}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creando...
                  </>
                ) : isLastStep ? (
                  <>
                    <Check size={18} />
                    Crear pedido
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
