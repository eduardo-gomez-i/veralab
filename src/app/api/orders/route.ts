import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { sendMailgunMessage } from '@/lib/mailgun';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { payments: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    const ensureUploadsDir = async () => {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      return uploadsDir;
    };

    let payload: any = {};
    let attachmentUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      // Campos de texto
      payload.patientName = String(form.get('patientName') || '');
      payload.prosthesisType = String(form.get('prosthesisType') || '');
      payload.serviceName = String(form.get('serviceName') || '');
      payload.material = String(form.get('material') || '');
      payload.dentalPieces = String(form.get('dentalPieces') || '');
      payload.specifications = String(form.get('specifications') || '');
      payload.deliveryDate = String(form.get('deliveryDate') || '');
      payload.status = String(form.get('status') || 'pendiente');
      payload.notes = String(form.get('notes') || '');
      payload.priority = String(form.get('priority') || 'normal');
      payload.dentistId = String(form.get('dentistId') || '');
      payload.dentistName = String(form.get('dentistName') || '');

      // Archivo adjunto
      const file = form.get('attachment') as File | null;
      if (file && typeof file === 'object' && file.size > 0) {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.type === 'application/pdf'
          ? 'pdf'
          : file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ? 'docx'
            : file.type.startsWith('image/')
              ? file.type.split('/')[1]
              : 'bin';
        const filename = `${crypto.randomUUID()}.${ext}`;
        const uploadsDir = await ensureUploadsDir();
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
        attachmentUrl = `/uploads/${filename}`;
      }
    } else {
      const data = await request.json();
      payload = data;
    }
    
    // Aseguramos que dentistId esté presente
    if (!payload.dentistId) {
      return NextResponse.json({ error: 'ID del dentista es requerido' }, { status: 400 });
    }

    // Verificar que el dentista esté aprobado
    const dentist = await prisma.user.findUnique({
      where: { id: payload.dentistId },
      select: { verified: true, role: true },
    });

    if (!dentist) {
      return NextResponse.json({ error: 'Dentista no encontrado' }, { status: 404 });
    }

    if (dentist.role === 'dentist' && !dentist.verified) {
      return NextResponse.json(
        { error: 'Tu cuenta aún no ha sido verificada. Espera la aprobación del administrador.' },
        { status: 403 }
      );
    }

    const order = await prisma.order.create({
      data: {
        patientName: payload.patientName,
        prosthesisType: payload.prosthesisType,
        serviceName: payload.serviceName || undefined,
        material: payload.material,
        dentalPieces: payload.dentalPieces || undefined,
        specifications: payload.specifications || '',
        deliveryDate: new Date(payload.deliveryDate),
        status: payload.status || 'pendiente',
        notes: payload.notes || '',
        priority: payload.priority || 'normal',
        attachmentUrl: attachmentUrl,
        totalPrice: payload.totalPrice ? payload.totalPrice : undefined,
        estimatedDeliveryDate: payload.estimatedDeliveryDate
          ? new Date(payload.estimatedDeliveryDate)
          : undefined,
        dentistName: payload.dentistName || 'Desconocido', // Idealmente obtener del usuario
        dentist: {
            connect: { id: payload.dentistId }
        }
      },
    });

    try {
      const notifyTo =
        process.env.MAILGUN_NOTIFY_TO || 'gomez.i.eduardomanuel@gmail.com';
      const subject = `Nuevo pedido #${order.id} - ${order.patientName}`;
      const text = [
        `Se creó un nuevo pedido.`,
        ``,
        `ID: ${order.id}`,
        `Paciente: ${order.patientName}`,
        `Dentista: ${order.dentistName}`,
        `Categoría: ${order.prosthesisType}`,
        `Servicio: ${order.serviceName || 'Sin especificar'}`,
        `Material: ${order.material || 'Sin especificar'}`,
        `Piezas: ${order.dentalPieces || 'Sin especificar'}`,
        `Fecha de entrega: ${order.deliveryDate.toISOString()}`,
        `Prioridad: ${order.priority}`,
        order.attachmentUrl ? `Adjunto: ${order.attachmentUrl}` : `Adjunto: —`,
      ].join('\n');

      await sendMailgunMessage({
        to: notifyTo,
        subject,
        text,
      });
    } catch (err) {
      console.error('Mailgun notification failed', err);
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Error al crear pedido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
