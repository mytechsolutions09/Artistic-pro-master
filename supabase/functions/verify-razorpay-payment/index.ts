import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Razorpay secret from environment
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured')
    }

    // Parse request body
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id 
    } = await req.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment verification fields')
    }

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id })

    // Generate signature for verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    // Verify signature
    const isValid = generatedSignature === razorpay_signature

    console.log('Signature verification:', isValid ? 'SUCCESS' : 'FAILED')

    if (!isValid) {
      throw new Error('Payment signature verification failed')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update payment status in database
    if (order_id) {
      const { error: dbError } = await supabaseClient
        .from('razorpay_orders')
        .update({
          razorpay_payment_id: razorpay_payment_id,
          status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', order_id)

      if (dbError) {
        console.error('Database update error:', dbError)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false,
        verified: false,
        error: error.message || 'Payment verification failed'
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

