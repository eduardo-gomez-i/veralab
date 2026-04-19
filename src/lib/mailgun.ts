export type MailgunSendMessageInput = {
  to: string
  subject: string
  text: string
  html?: string
}

function getMailgunConfig() {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const baseUrl = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
  const from =
    process.env.MAILGUN_FROM ||
    (domain ? `VeraLAB <postmaster@${domain}>` : undefined)

  return { apiKey, domain, baseUrl, from }
}

export async function sendMailgunMessage(input: MailgunSendMessageInput) {
  const { apiKey, domain, baseUrl, from } = getMailgunConfig()

  if (!apiKey || !domain || !from) {
    return
  }

  const url = `${baseUrl.replace(/\/$/, '')}/v3/${domain}/messages`
  const auth = Buffer.from(`api:${apiKey}`).toString('base64')

  const body = new URLSearchParams()
  body.set('from', from)
  body.set('to', input.to)
  body.set('subject', input.subject)
  body.set('text', input.text)
  if (input.html) {
    body.set('html', input.html)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Mailgun error (${res.status}): ${text}`)
  }
}
