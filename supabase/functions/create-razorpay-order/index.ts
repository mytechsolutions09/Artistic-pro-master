import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Get Razorpay credentials from environment variables
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured in environment variables')
    }

    // Parse request body
    const { amount, currency, receipt, notes } = await req.json()

    // Validate required fields
    if (!amount || !currency || !receipt) {
      throw new Error('Missing required fields: amount, currency, receipt')
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount: must be a positive number')
    }

    console.log('Creating Razorpay order:', { amount, currency, receipt })

    // Create Basic Authentication token
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    // Call Razorpay API to create order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise (smallest unit)
        currency: currency,
        receipt: receipt,
        notes: notes || {},
        payment_capture: 1 // Auto-capture payment
      }),
    })

    // Check if Razorpay API call was successful
    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json()
      console.error('Razorpay API error:', errorData)
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order')
    }

    const order = await razorpayResponse.json()
    console.log('Razorpay order created successfully:', order.id)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store order in database
    const { error: dbError } = await supabaseClient
      .from('razorpay_orders')
      .insert({
        order_id: receipt,
        razorpay_order_id: order.id,
        amount: order.amount,
        amount_paid: 0,
        amount_due: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status || 'created',
        attempts: 0,
        notes: order.notes || {},
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request if database insert fails
      // The order is still created in Razorpay
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          amount_due: order.amount_due,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at
        }
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
    console.error('Error creating Razorpay order:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to create Razorpay order'
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

