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

      // Send SMS via Muzztech
      const muzztechApiKey = Deno.env.get('MUZZTECH_API_KEY')
      const muzztechSenderId = Deno.env.get('MUZZTECH_SENDER_ID') || 'LUREVI'
      const muzztechTemplateId = Deno.env.get('MUZZTECH_TEMPLATE_ID') || '1707178091427118894'

      if (!muzztechApiKey) {
        console.error('MUZZTECH_API_KEY not configured')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SMS service API key not configured' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const phoneWithoutPlus = formattedPhone.replace('+', '')
      const messageText = `Your OTP ${otpCode} to authenticate your login. Never share your OTP with anyone - https://lurevi.in LUREVI`
      
      try {
        // Muzztech API GET request (highly compatible with Indian SMS gateway specifications)
        const muzztechUrl = `https://connect.muzztech.com/api/sms/send?api_key=${muzztechApiKey}&sender_name=${muzztechSenderId}&phone_number=${phoneWithoutPlus}&message=${encodeURIComponent(messageText)}&template_id=${muzztechTemplateId}`
        
        const muzztechResponse = await fetch(muzztechUrl, {
          method: 'GET'
        })

        const responseText = await muzztechResponse.text()
        console.log('Muzztech API response:', responseText)

        if (!muzztechResponse.ok) {
          throw new Error(`HTTP Error: ${muzztechResponse.status} - ${responseText}`)
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
        console.error('Muzztech request error:', error)
        
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
      const tenDigitPhone = formattedPhone.replace('+91', '')
      const { data: existingUser } = await supabaseClient.auth.admin.listUsers()

      // Find all users matching the phone number
      const matchingUsers = existingUser?.users.filter(u => 
        (u.phone && u.phone.includes(tenDigitPhone)) || 
        (u.user_metadata?.phone && u.user_metadata.phone.includes(tenDigitPhone))
      ) || []
      
      // Prioritize the user that has a real email (handles the case where there's a test phone-only account and a real email account)
      const userWithPhone = matchingUsers.find(u => u.email) || matchingUsers[0]

      let userId: string
      let loginEmail: string

      if (userWithPhone) {
        userId = userWithPhone.id
        loginEmail = userWithPhone.email
        
        // If the user doesn't have an email, assign a dummy one so we can generate a magic link for them
        if (!loginEmail) {
          loginEmail = `phone_${tenDigitPhone}@lurevi-internal.local`
          const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
            userId,
            { email: loginEmail, email_confirm: true }
          )
          
          if (updateError) {
            console.error('Error assigning dummy email to phone user:', updateError)
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to update user security credentials: ' + updateError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      } else {
        loginEmail = `phone_${tenDigitPhone}@lurevi-internal.local`
        // Create new user with phone number and dummy email
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          phone: formattedPhone,
          email: loginEmail,
          password: crypto.randomUUID() + 'A1!', // Give them a random valid password, they'll never use it
          phone_confirm: true,
          email_confirm: true
        })

        if (createError || !newUser.user) {
          console.error('Error creating user:', createError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        userId = newUser.user.id
      }
      
      // Generate a magic link for the user's email to securely log them in without touching their real password
      const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: loginEmail
      })
      
      if (linkError) {
        console.error('Error generating magic link:', linkError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to generate session token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Extract the token_hash from the generated link
      const actionUrl = new URL(linkData.properties.action_link)
      const tokenHash = actionUrl.searchParams.get('token')

      return new Response(
        JSON.stringify({ 
          success: true,
          userId: userId,
          phone: formattedPhone,
          loginEmail: loginEmail,
          tokenHash: tokenHash,
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
