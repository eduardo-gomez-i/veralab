const baseStyle = `
  margin: 0; padding: 0; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`

function wrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="${baseStyle} background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center;">
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Vera<span style="color: #bfdbfe;">LAB</span>
              </div>
              <div style="font-size: 12px; color: #bfdbfe; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase;">
                Sistema de Pedidos
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Este correo fue enviado automáticamente por VeraLAB. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function adminNewRegistrationEmail(data: {
  name: string
  username: string
  email: string
}) {
  const html = wrapper(`
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; background-color: #fef3c7; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 30px;">
        🔔
      </div>
    </div>

    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">
      Nueva solicitud de acceso
    </h1>
    <p style="margin: 0 0 28px; font-size: 15px; color: #6b7280; text-align: center;">
      Un dentista solicitó registrarse en la plataforma y está esperando aprobación.
    </p>

    <!-- User card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; margin-bottom: 28px;">
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Nombre</span><br/>
                <span style="font-size: 16px; font-weight: 600; color: #111827;">${data.name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Usuario</span><br/>
                <span style="font-size: 15px; color: #374151; font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">@${data.username}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style="font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Correo</span><br/>
                <span style="font-size: 15px; color: #374151;">${data.email}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 8px;">
      <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
        Ingresa al panel de administración para aprobar o rechazar esta solicitud.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/users"
         style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none;
                font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">
        Revisar solicitud →
      </a>
    </div>
  `)

  const text = [
    `Nueva solicitud de acceso - ${data.name}`,
    ``,
    `Nombre: ${data.name}`,
    `Usuario: @${data.username}`,
    `Correo: ${data.email}`,
    ``,
    `Ingresa al panel de administración para aprobar o rechazar.`,
  ].join('\n')

  return { html, text }
}

export function dentistVerifiedEmail(data: { name: string }) {
  const html = wrapper(`
    <!-- Icon -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 30px;">
        ✅
      </div>
    </div>

    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">
      ¡Tu cuenta fue aprobada!
    </h1>
    <p style="margin: 0 0 28px; font-size: 15px; color: #6b7280; text-align: center;">
      Hola <strong style="color: #111827;">${data.name}</strong>, tu acceso a VeraLAB ha sido verificado por el administrador.
    </p>

    <!-- Divider -->
    <div style="border-top: 1px solid #e5e7eb; margin-bottom: 28px;"></div>

    <!-- What you can do -->
    <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #374151;">
      Ya puedes:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 8px 0; vertical-align: top; width: 28px; font-size: 16px;">📋</td>
        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">Crear y hacer seguimiento de tus pedidos al laboratorio</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; vertical-align: top; width: 28px; font-size: 16px;">💳</td>
        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">Consultar el historial de pagos de tus trabajos</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; vertical-align: top; width: 28px; font-size: 16px;">📅</td>
        <td style="padding: 8px 0; font-size: 14px; color: #4b5563;">Ver el calendario de visitas del laboratorio</td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/login"
         style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none;
                font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">
        Iniciar sesión →
      </a>
    </div>
  `)

  const text = [
    `¡Hola ${data.name}! Tu cuenta en VeraLAB fue aprobada.`,
    ``,
    `Ya puedes iniciar sesión y realizar pedidos.`,
    ``,
    `Si tienes alguna consulta, comunícate con el laboratorio.`,
  ].join('\n')

  return { html, text }
}
