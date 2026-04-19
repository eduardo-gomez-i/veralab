import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMailgunMessage } from '@/lib/mailgun';
import { dentistVerifiedEmail } from '@/lib/email-templates';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;
    const { verified } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: { verified },
      select: { id: true, name: true, email: true, verified: true },
    });

    // Notificar al dentista si fue verificado
    if (verified && user.email) {
      try {
        const { html, text } = dentistVerifiedEmail({ name: user.name });
        await sendMailgunMessage({
          to: user.email,
          subject: '¡Tu cuenta en VeraLAB fue aprobada!',
          text,
          html,
        });
      } catch (err) {
        console.error('Mailgun notification failed', err);
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
