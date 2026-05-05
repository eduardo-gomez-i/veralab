import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const moneyToCents = (raw: unknown) => {
  const value = String(raw ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [whole, frac = ''] = value.split('.');
  const cents = (frac + '00').slice(0, 2);
  const wholeCents = Number(whole) * 100;
  const fracCents = Number(cents);
  if (!Number.isFinite(wholeCents) || !Number.isFinite(fracCents)) return null;
  return wholeCents + fracCents;
};

const centsToMoney = (cents: number) => {
  const normalized = Math.max(0, Math.trunc(cents));
  return (normalized / 100).toFixed(2);
};

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const orderId = params.id;

    const contentType = request.headers.get('content-type') || '';

    const ensureUploadsDir = async () => {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      return uploadsDir;
    };

    let amount: string | null = null;
    let paidAt: string | null = null;
    let receiptUrl: string | undefined;
    let receiptFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      amount = form.get('amount') ? String(form.get('amount')) : null;
      paidAt = form.get('paidAt') ? String(form.get('paidAt')) : null;

      receiptFile = (form.get('receipt') as File | null) ?? null;
    } else {
      const data = await request.json();
      amount = data.amount ? String(data.amount) : null;
      paidAt = data.paidAt ? String(data.paidAt) : null;
      receiptUrl = data.receiptUrl || undefined;
    }

    if (!amount) {
      return NextResponse.json(
        { error: 'El monto del pago es obligatorio' },
        { status: 400 }
      );
    }

    const amountCents = moneyToCents(amount);
    if (amountCents === null || amountCents <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido. Usa un valor mayor a 0 con hasta 2 decimales.' },
        { status: 400 }
      );
    }

    if (receiptFile && typeof receiptFile === 'object' && receiptFile.size > 0) {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(receiptFile.type)) {
        return NextResponse.json(
          { error: 'Tipo de comprobante no permitido' },
          { status: 400 }
        );
      }
    }

    let savedFilePath: string | null = null;
    try {
      const payment = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT id FROM \`Order\` WHERE id = ${orderId} FOR UPDATE`;

        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: { totalPrice: true },
        });

        if (!order) {
          throw new Error('NOT_FOUND');
        }

        if (order.totalPrice === null) {
          throw new Error('TOTAL_REQUIRED');
        }

        const totals = await tx.payment.aggregate({
          where: { orderId },
          _sum: { amount: true },
        });

        const paidCents = moneyToCents(totals._sum.amount ?? '0') ?? 0;
        const totalCents = moneyToCents(order.totalPrice) ?? 0;

        if (paidCents + amountCents > totalCents) {
          const remainingCents = totalCents - paidCents;
          throw new Error(`OVERPAY:${centsToMoney(Math.max(0, remainingCents))}`);
        }

        if (receiptFile && typeof receiptFile === 'object' && receiptFile.size > 0) {
          const buffer = Buffer.from(await receiptFile.arrayBuffer());
          const ext =
            receiptFile.type === 'application/pdf'
              ? 'pdf'
              : receiptFile.type.startsWith('image/')
                ? receiptFile.type.split('/')[1]
                : 'bin';
          const uploadsDir = await ensureUploadsDir();
          const filename = `${crypto.randomUUID()}.${ext}`;
          const filePath = path.join(uploadsDir, filename);
          await fs.writeFile(filePath, buffer);
          savedFilePath = filePath;
          receiptUrl = `/uploads/${filename}`;
        }

        return tx.payment.create({
          data: {
            orderId,
            amount,
            paidAt: paidAt ? new Date(paidAt) : undefined,
            receiptUrl,
          },
        });
      });

      return NextResponse.json(payment, { status: 201 });
    } catch (err) {
      if (savedFilePath) {
        await fs.unlink(savedFilePath).catch(() => undefined);
      }
      throw err;
    }

  } catch (error) {
    console.error('Error creating payment:', error);
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
      }
      if (error.message === 'TOTAL_REQUIRED') {
        return NextResponse.json(
          { error: 'Debes asignar un costo total antes de registrar pagos.' },
          { status: 400 }
        );
      }
      if (error.message.startsWith('OVERPAY:')) {
        const remaining = error.message.slice('OVERPAY:'.length);
        return NextResponse.json(
          { error: `El pago supera el total. Saldo disponible: ${remaining}` },
          { status: 400 }
        );
      }
    }
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Error al registrar pago';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
