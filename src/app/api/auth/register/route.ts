import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendMailgunMessage } from '@/lib/mailgun';
import { adminNewRegistrationEmail } from '@/lib/email-templates';

export async function POST(request: Request) {
  try {
    const { name, username, password, email } = await request.json();

    if (!name || !username || !password || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        email,
        role: 'dentist',
        verified: false,
      },
      select: { id: true, name: true, username: true },
    });

    // Notificar al admin
    try {
      const notifyTo = process.env.MAILGUN_NOTIFY_TO || '';
      if (notifyTo) {
        const { html, text } = adminNewRegistrationEmail({ name: user.name, username: user.username, email });
        await sendMailgunMessage({
          to: notifyTo,
          subject: `Nueva solicitud de acceso - ${user.name}`,
          text,
          html,
        });
      }
    } catch (err) {
      console.error('Mailgun notification failed', err);
    }

    return NextResponse.json(
      { message: 'Solicitud enviada. Un administrador revisará tu cuenta pronto.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
