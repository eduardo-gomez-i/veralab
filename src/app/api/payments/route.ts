import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const dentistId = searchParams.get('dentistId');

    const where: any = {};

    if (role === 'dentist' && dentistId) {
      where.order = {
        dentistId,
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            patientName: true,
            dentistName: true,
            dentistId: true,
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error al obtener pagos' },
      { status: 500 }
    );
  }
}

