import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);
    const body = await request.json();
    const { date, title, notes, dentistIds } = body as {
      date?: string;
      title?: string;
      notes?: string;
      dentistIds?: string[];
    };

    const data: any = {};
    if (date) data.date = new Date(date);
    if (title !== undefined) data.title = title;
    if (notes !== undefined) data.notes = notes;

    if (dentistIds) {
      data.dentists = {
        set: dentistIds.map((dentistId) => ({ id: dentistId })),
      };
    }

    const visit = await prisma.visit.update({
      where: { id },
      data,
      include: {
        dentists: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json(
      { error: 'Error al actualizar visita' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = Number(params.id);

    await prisma.visit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json(
      { error: 'Error al eliminar visita' },
      { status: 500 }
    );
  }
}

