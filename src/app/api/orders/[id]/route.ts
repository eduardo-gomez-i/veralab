import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const contentType = request.headers.get('content-type') || '';

    const updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const keys = [
        'patientName',
        'prosthesisType',
        'serviceName',
        'material',
        'dentalPieces',
        'specifications',
        'deliveryDate',
        'status',
        'notes',
        'priority',
        'totalPrice',
        'estimatedDeliveryDate',
      ];
      keys.forEach((k) => {
        if (form.has(k)) {
          updateData[k] = String(form.get(k));
        }
      });

      // Guardar adjunto si viene
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
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const filename = `${crypto.randomUUID()}.${ext}`;
        await fs.writeFile(path.join(uploadsDir, filename), buffer);
        updateData.attachmentUrl = `/uploads/${filename}`;
      }
    } else {
      const data = await request.json();
      Object.assign(updateData, data);
    }
    
    if (updateData.deliveryDate) {
      updateData.deliveryDate = new Date(updateData.deliveryDate);
    }
    if (updateData.estimatedDeliveryDate) {
      updateData.estimatedDeliveryDate = new Date(updateData.estimatedDeliveryDate);
    }
    
    // Limpieza de campos que no deben actualizarse directamente o causan conflicto
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.dentist; // No actualizamos relación así por ahora

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Error al actualizar pedido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    await prisma.order.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 });
  }
}
