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
  smtpConfig?: {
    host?: string
    port?: number
    secure?: boolean
    user?: string
    pass?: string
    fromName?: string
    fromEmail?: string
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const DEFAULT_SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com'
    const DEFAULT_SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
    const DEFAULT_SMTP_USER = Deno.env.get('SMTP_USER')
    const DEFAULT_SMTP_PASS = Deno.env.get('SMTP_PASS')
    const DEFAULT_FROM_NAME = Deno.env.get('EMAIL_FROM_NAME') || 'Lurevi'
    const DEFAULT_FROM_EMAIL = Deno.env.get('EMAIL_FROM_EMAIL') || DEFAULT_SMTP_USER

    if (!DEFAULT_SMTP_USER || !DEFAULT_SMTP_PASS) {
      throw new Error('SMTP credentials not configured')
    }

    const { to, toName, subject, html, text, replyTo, smtpConfig }: EmailRequest = await req.json()

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html or text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = new SmtpClient()

    const SMTP_HOST = smtpConfig?.host || DEFAULT_SMTP_HOST
    const SMTP_PORT = smtpConfig?.port || DEFAULT_SMTP_PORT
    const SMTP_SECURE = typeof smtpConfig?.secure === 'boolean' ? smtpConfig.secure : true
    const SMTP_USER = smtpConfig?.user || DEFAULT_SMTP_USER
    const SMTP_PASS = smtpConfig?.pass || DEFAULT_SMTP_PASS
    const FROM_NAME = smtpConfig?.fromName || DEFAULT_FROM_NAME
    const FROM_EMAIL = smtpConfig?.fromEmail || DEFAULT_FROM_EMAIL

    const connectOptions = {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER!,
      password: SMTP_PASS!,
    }

    if (SMTP_SECURE) {
      await client.connectTLS(connectOptions)
    } else {
      await client.connect(connectOptions)
    }

    await client.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: toName ? `${toName} <${to}>` : to,
      subject,
      content: text || '',
      html: html || undefined,
      replyTo: replyTo || undefined,
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
