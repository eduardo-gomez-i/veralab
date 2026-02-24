import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { date: 'asc' },
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
    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Error al obtener visitas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, title, notes, dentistIds } = body as {
      date: string;
      title: string;
      notes?: string;
      dentistIds: string[];
    };

    if (!date || !title || !Array.isArray(dentistIds)) {
      return NextResponse.json(
        { error: 'Fecha, título y dentistas son obligatorios' },
        { status: 400 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        date: new Date(date),
        title,
        notes: notes || null,
        dentists: {
          connect: dentistIds.map((id) => ({ id })),
        },
      },
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

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: 'Error al crear visita' },
      { status: 500 }
    );
  }
}

