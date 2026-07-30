"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderTable } from '@/components/orders/OrderTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { OrderStatus } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ArchiveFilter = 'active' | 'archived' | 'all';

const STATUS_CHIPS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'entregado', label: 'Entregado' },
];

const ARCHIVE_LABEL: Record<ArchiveFilter, string> = {
  active: 'Activas',
  archived: 'Archivadas',
  all: 'Todas',
};

const History = () => {
  const { orders, refreshOrders, setFilters } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');
  const [initializedFromQuery, setInitializedFromQuery] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    refreshOrders({ includeArchived: archiveFilter !== 'active' });
  }, [refreshOrders, archiveFilter]);

  useEffect(() => {
    if (initializedFromQuery) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      setSearchTerm(orderId);
    }
    setInitializedFromQuery(true);
  }, [initializedFromQuery]);

  useEffect(() => {
    const filters: any = {};
    if (searchTerm) filters.searchTerm = searchTerm;
    if (statusFilter && statusFilter !== 'all') filters.status = statusFilter as OrderStatus;

    setFilters(filters);
  }, [searchTerm, statusFilter, setFilters]);

  const visibleOrders = useMemo(() => {
    if (archiveFilter === 'active') return orders.filter((o) => !o.archivedAt);
    if (archiveFilter === 'archived') return orders.filter((o) => Boolean(o.archivedAt));
    return orders;
  }, [orders, archiveFilter]);

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (archiveFilter !== 'active' ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter('all');
    setArchiveFilter('active');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Historial de Pedidos</h1>
        <span className="text-sm text-gray-500">{visibleOrders.length}</span>
      </div>

      {/* Mobile filter bar: search stays reachable while the list scrolls. */}
      <div className="md:hidden">
        <div className="sticky top-header-safe z-30 -mx-4 bg-gray-50/95 px-4 py-2 backdrop-blur">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                placeholder="Buscar paciente o ID"
                className="pl-9 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-400 active:bg-gray-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative h-12 w-12 shrink-0"
              onClick={() => setFiltersOpen(true)}
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setStatusFilter(chip.value)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  statusFilter === chip.value
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop filter card — unchanged layout. */}
      <Card className="hidden md:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por paciente o ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={archiveFilter} onValueChange={(val) => setArchiveFilter(val as ArchiveFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Archivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="archived">Archivadas</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderTable orders={visibleOrders} includeArchived={archiveFilter !== 'active'} />

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="md:hidden">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 px-5 pb-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Estado</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setStatusFilter(chip.value)}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                      statusFilter === chip.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Archivo</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ARCHIVE_LABEL) as ArchiveFilter[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setArchiveFilter(value)}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-sm font-medium transition-colors',
                      archiveFilter === value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700'
                    )}
                  >
                    {ARCHIVE_LABEL[value]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Ver {visibleOrders.length} pedidos
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default History;
