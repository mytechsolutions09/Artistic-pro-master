import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Polyfill for Deno.writeAll and Deno.readAll (removed in Deno 2.0)
// used by the legacy smtp library
if (!(Deno as any).writeAll) {
  (Deno as any).writeAll = async function (
    writer: { write(p: Uint8Array): Promise<number> },
    data: Uint8Array,
  ): Promise<void> {
    let nWritten = 0;
    while (nWritten < data.length) {
      const n = await writer.write(data.subarray(nWritten));
      if (n === 0) {
        throw new Error("write returned 0");
      }
      nWritten += n;
    }
  };
}

if (!(Deno as any).readAll) {
  (Deno as any).readAll = async function (
    reader: { read(p: Uint8Array): Promise<number | null> },
  ): Promise<Uint8Array> {
    const buf = new Uint8Array(1024);
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    while (true) {
      const n = await reader.read(buf);
      if (n === null || n === 0) {
        break;
      }
      chunks.push(buf.slice(0, n));
      totalLength += n;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  };
}

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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const DEFAULT_FROM_NAME = Deno.env.get('EMAIL_FROM_NAME') || 'Lurevi'
    const DEFAULT_FROM_EMAIL = Deno.env.get('EMAIL_FROM_EMAIL') || Deno.env.get('SMTP_USER') || 'onboarding@resend.dev'

    const { to, toName, subject, html, text, replyTo, smtpConfig }: EmailRequest = await req.json()

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, subject, html or text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (RESEND_API_KEY) {
      console.log(`Sending email to ${to} using Resend API...`)
      
      let fromEmail = DEFAULT_FROM_EMAIL
      if (fromEmail.includes('yourdomain.com') || fromEmail.includes('example.com')) {
        fromEmail = 'onboarding@resend.dev'
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${DEFAULT_FROM_NAME} <${fromEmail}>`,
          to: toName ? [`${toName} <${to}>`] : [to],
          subject,
          html: html || text || '',
          text: text || undefined,
          reply_to: replyTo || undefined,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Resend API response error:', errorText)
        throw new Error(`Resend API error: ${res.status} - ${errorText}`)
      }

      const responseData = await res.json()
      console.log(`Email sent successfully via Resend. Message ID: ${responseData.id}`)

      return new Response(
        JSON.stringify({
          success: true,
          messageId: responseData.id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SMTP Fallback
    const DEFAULT_SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.hostinger.com'
    const DEFAULT_SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
    const DEFAULT_SMTP_USER = Deno.env.get('SMTP_USER')
    const DEFAULT_SMTP_PASS = Deno.env.get('SMTP_PASS')

    if (!DEFAULT_SMTP_USER || !DEFAULT_SMTP_PASS) {
      throw new Error('SMTP credentials not configured and RESEND_API_KEY is not set')
    }

    const client = new SmtpClient()

    // Monkeypatch SmtpClient.prototype.send to fix HTML email issues (missing MIME-Version, missing trailing boundary)
    client.send = async function (config: any) {
      const [from, fromData] = (this as any).parseAddress(config.from);
      const [to, toData] = (this as any).parseAddress(config.to);

      await (this as any).writeCmd("MAIL", "FROM:", from);
      (this as any).assertCode(await (this as any).readCmd(), 250);
      await (this as any).writeCmd("RCPT", "TO:", to);
      (this as any).assertCode(await (this as any).readCmd(), 250);
      await (this as any).writeCmd("DATA");
      (this as any).assertCode(await (this as any).readCmd(), 354);

      await (this as any).writeCmd("MIME-Version: 1.0");
      await (this as any).writeCmd("Subject: ", config.subject);
      await (this as any).writeCmd("From: ", fromData);
      await (this as any).writeCmd("To: ", toData);
      if (config.replyTo) {
        await (this as any).writeCmd("Reply-To: ", config.replyTo);
      }
      await (this as any).writeCmd("Date: ", new Date().toString());

      if (config.html) {
        await (this as any).writeCmd("Content-Type: multipart/alternative; boundary=AlternativeBoundary", "\r\n");
        await (this as any).writeCmd("--AlternativeBoundary");
        await (this as any).writeCmd('Content-Type: text/plain; charset="utf-8"', "\r\n");
        await (this as any).writeCmd(config.content || '', "\r\n");
        await (this as any).writeCmd("--AlternativeBoundary");
        await (this as any).writeCmd('Content-Type: text/html; charset="utf-8"', "\r\n");
        await (this as any).writeCmd(config.html, "\r\n");
        await (this as any).writeCmd("--AlternativeBoundary--", "\r\n.\r\n");
      } else {
        await (this as any).writeCmd("Content-Type: text/plain; charset=\"utf-8\"");
        await (this as any).writeCmd(`Content-Transfer-Encoding: ${(this as any)._content_encoding}` + "\r\n");
        await (this as any).writeCmd(config.content || '', "\r\n.\r\n");
      }

      (this as any).assertCode(await (this as any).readCmd(), 250);
    };

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
