import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        verified: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.role === 'dentist' && !user.verified) {
      return NextResponse.json(
        { error: 'Tu cuenta está pendiente de verificación. El administrador te avisará por correo cuando sea aprobada.' },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Crear respuesta con el usuario
    const response = NextResponse.json(userWithoutPassword);

    // Establecer cookie HttpOnly
    response.cookies.set('auth_token', JSON.stringify(userWithoutPassword), {
      httpOnly: false, // Permitir acceso JS para sincronización con contexto por ahora, idealmente true
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
