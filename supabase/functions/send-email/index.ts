import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  toName?: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
    const SMTP_USER = Deno.env.get('SMTP_USER')
    const SMTP_PASS = Deno.env.get('SMTP_PASS')
    const FROM_NAME = Deno.env.get('EMAIL_FROM_NAME') || 'Lurevi'
    const FROM_EMAIL = Deno.env.get('EMAIL_FROM_EMAIL') || SMTP_USER

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured')
    }

    const { to, toName, subject, html, text, replyTo }: EmailRequest = await req.json()

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html or text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = new SmtpClient()

    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASS,
    })

    await client.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toName ? `${toName} <${to}>` : to,
      subject,
      content: text || '',
      html: html || undefined,
    })

    await client.close()

    console.log(`Email sent to ${to}: ${subject}`)

    return new Response(
      JSON.stringify({
        success: true,
        messageId: `msg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Email send error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
