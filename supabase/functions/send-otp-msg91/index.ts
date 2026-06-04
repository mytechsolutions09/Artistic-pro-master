import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPRequest {
  phone: string;
  action: 'send' | 'verify';
  otp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { phone, action, otp }: OTPRequest = await req.json()

    // Validate phone number
    if (!phone || !/^(\+91)?[6-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Indian phone number' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format phone number
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`

    if (action === 'send') {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store OTP in database with expiration (5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
      
      const { error: dbError } = await supabaseClient
        .from('phone_otp')
        .insert({
          phone: formattedPhone,
          otp: otpCode,
          expires_at: expiresAt,
          attempts: 0,
          verified: false
        })

      if (dbError) {
        console.error('Database error:', dbError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to generate OTP. Please try again.' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Send SMS via MSG91
      const msg91AuthKey = Deno.env.get('MSG91_AUTH_KEY')
      const msg91SenderId = Deno.env.get('MSG91_SENDER_ID') || 'MSGIND'
      const msg91TemplateId = Deno.env.get('MSG91_TEMPLATE_ID')

      if (!msg91AuthKey) {
        console.error('MSG91_AUTH_KEY not configured')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SMS service not configured' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const phoneWithoutPlus = formattedPhone.replace('+', '')
      
      try {
        // MSG91 API call
        const msg91Response = await fetch(
          `https://control.msg91.com/api/v5/otp?otp=${otpCode}&mobile=${phoneWithoutPlus}&authkey=${msg91AuthKey}&template_id=${msg91TemplateId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )

        const msg91Data = await msg91Response.json()

        if (!msg91Response.ok || msg91Data.type === 'error') {
          console.error('MSG91 error:', msg91Data)
          
          // Clean up OTP record
          await supabaseClient
            .from('phone_otp')
            .delete()
            .eq('phone', formattedPhone)
            .eq('otp', otpCode)

          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to send SMS. Please try again.' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // SMS sent successfully

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'OTP sent successfully'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } catch (error: any) {
        console.error('MSG91 request error:', error)
        
        // Clean up OTP record
        await supabaseClient
          .from('phone_otp')
          .delete()
          .eq('phone', formattedPhone)
          .eq('otp', otpCode)

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to send SMS. Please check your network connection.' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

    } else if (action === 'verify') {
      if (!otp || otp.length !== 6) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid OTP format' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get latest OTP for this phone number
      const { data: otpRecord, error: fetchError } = await supabaseClient
        .from('phone_otp')
        .select('*')
        .eq('phone', formattedPhone)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError || !otpRecord) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No OTP found. Please request a new one.' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if OTP is expired
      if (new Date(otpRecord.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'OTP has expired. Please request a new one.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check attempts limit
      if (otpRecord.attempts >= 5) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Too many attempts. Please request a new OTP.' 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        // Increment attempts
        await supabaseClient
          .from('phone_otp')
          .update({ attempts: otpRecord.attempts + 1 })
          .eq('id', otpRecord.id)

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid OTP. Please check and try again.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Mark OTP as verified
      await supabaseClient
        .from('phone_otp')
        .update({ verified: true })
        .eq('id', otpRecord.id)

      // Check if user exists with this phone number
      const { data: existingUser } = await supabaseClient.auth.admin.listUsers()
      const userWithPhone = existingUser?.users.find(
        (u) => u.phone === formattedPhone
      )

      let userId: string

      if (userWithPhone) {
        userId = userWithPhone.id
      } else {
        // Create new user with phone number
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          phone: formattedPhone,
          phone_confirm: true,
          email_confirm: true
        })

        if (createError || !newUser.user) {
          console.error('Error creating user:', createError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to create user account' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        userId = newUser.user.id
      }

      // Generate session token for the user
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: `phone_${formattedPhone.replace('+', '')}@temp.com`,
        options: {
          redirectTo: ''
        }
      })

      if (sessionError) {
        console.error('Error generating session:', sessionError)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          userId: userId,
          phone: formattedPhone,
          message: 'OTP verified successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

