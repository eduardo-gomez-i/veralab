import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      amount = form.get('amount') ? String(form.get('amount')) : null;
      paidAt = form.get('paidAt') ? String(form.get('paidAt')) : null;

      const file = form.get('receipt') as File | null;
      if (file && typeof file === 'object' && file.size > 0) {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: 'Tipo de comprobante no permitido' },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.type === 'application/pdf'
          ? 'pdf'
          : file.type.startsWith('image/')
            ? file.type.split('/')[1]
            : 'bin';
        const uploadsDir = await ensureUploadsDir();
        const filename = `${crypto.randomUUID()}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
        receiptUrl = `/uploads/${filename}`;
      }
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

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        paidAt: paidAt ? new Date(paidAt) : undefined,
        receiptUrl,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Error al registrar pago';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

