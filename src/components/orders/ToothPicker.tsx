"use client";

import { DENTAL_PIECES } from '@/lib/order-catalog';
import { cn } from '@/lib/utils';

interface ToothPickerProps {
  /** Comma separated FDI codes, e.g. "11, 12, 21". */
  value: string;
  onChange: (value: string) => void;
}

const parsePieces = (value: string) =>
  value
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

const ARCH_LABELS = ['Superior derecha', 'Superior izquierda', 'Inferior derecha', 'Inferior izquierda'];

export const ToothPicker = ({ value, onChange }: ToothPickerProps) => {
  const selected = parsePieces(value);

  const toggle = (piece: string) => {
    const next = selected.includes(piece)
      ? selected.filter((item) => item !== piece)
      : [...selected, piece].sort((a, b) => Number(a) - Number(b));

    onChange(next.join(', '));
  };

  return (
    <div className="space-y-3 rounded-xl border p-3">
      {DENTAL_PIECES.map((row, rowIndex) => (
        <div key={rowIndex} className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">{ARCH_LABELS[rowIndex]}</p>
          <div className="grid grid-cols-8 gap-1 md:gap-2">
            {row.map((piece) => {
              const isSelected = selected.includes(piece);
              return (
                <button
                  key={piece}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(piece)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg border text-sm font-medium transition-colors active:scale-95 md:aspect-auto md:py-2',
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  )}
                >
                  {piece}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-xs text-gray-500">
            {selected.length} pieza{selected.length === 1 ? '' : 's'} seleccionada
            {selected.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs font-semibold text-blue-600"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};
