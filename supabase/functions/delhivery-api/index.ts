import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // Log the request for debugging
    console.log('🔔 Incoming request to delhivery-api Edge Function')
    console.log('📍 Request URL:', req.url)
    console.log('🔑 Auth header present:', req.headers.has('authorization'))
    // Get the API token from environment variables
    const delhiveryToken = Deno.env.get('DELHIVERY_API_TOKEN')
    if (!delhiveryToken) {
      return new Response(
        JSON.stringify({ error: 'Delhivery API token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the request body
    const { action, data, endpoint, method = 'POST' } = await req.json()

    // Determine the base URL based on the endpoint
    let baseURL = 'https://staging-express.delhivery.com'
    if (endpoint === 'express') {
      baseURL = 'https://express-dev-test.delhivery.com'
    } else if (endpoint === 'track') {
      baseURL = 'https://track.delhivery.com'
    }

    // Prepare the request
    const url = `${baseURL}${action}`
    const headers = {
      'Authorization': `Token ${delhiveryToken}`,
      'Content-Type': 'application/json',
    }

    console.log(`📦 Delhivery API Request: ${method} ${url}`)
    console.log('📝 Request Data:', JSON.stringify(data))

    let response: Response

    // Make the appropriate request based on method from body
    if (method === 'GET') {
      response = await fetch(url, {
        method: 'GET',
        headers,
      })
    } else if (method === 'POST') {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
    } else if (method === 'PUT') {
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
    } else if (method === 'DELETE') {
      response = await fetch(url, {
        method: 'DELETE',
        headers,
      })
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the response
    const responseData = await response.text()
    let jsonData
    try {
      jsonData = JSON.parse(responseData)
    } catch {
      jsonData = { raw: responseData }
    }

    console.log(`✅ Delhivery API Response Status: ${response.status}`)
    console.log('📄 Response Data:', JSON.stringify(jsonData).substring(0, 500))

    // Return the response
    return new Response(
      JSON.stringify({
        success: response.ok,
        data: jsonData,
        status: response.status,
        statusText: response.statusText
      }),
      { 
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Delhivery API Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
