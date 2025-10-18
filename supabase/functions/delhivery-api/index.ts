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
    console.log('🔑 ApiKey header present:', req.headers.has('apikey'))
    
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

    // Check content type to determine how to parse request
    const contentType = req.headers.get('content-type') || ''
    console.log('📄 Content-Type:', contentType)
    
    let action: string
    let data: any
    let endpoint: string
    let method: string
    let isFormData = false
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData requests (for file uploads like manifest creation)
      const formData = await req.formData()
      action = formData.get('action') as string || '/manifest'
      endpoint = formData.get('endpoint') as string || 'ltl'
      method = formData.get('method') as string || 'POST'
      isFormData = true
      data = formData
      console.log('📎 FormData request detected')
    } else {
      // Handle JSON requests (default)
      const body = await req.json()
      console.log('📦 Request body:', JSON.stringify(body))
      action = body.action
      data = body.data
      endpoint = body.endpoint
      method = body.method || 'POST'
    }
    
    // Validate required fields
    if (!action) {
      console.error('❌ Missing action in request')
      return new Response(
        JSON.stringify({ error: 'Missing required field: action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!endpoint) {
      console.error('❌ Missing endpoint in request')
      return new Response(
        JSON.stringify({ error: 'Missing required field: endpoint' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('✅ Parsed request - Action:', action, 'Endpoint:', endpoint, 'Method:', method)

    // Determine the base URL based on the endpoint
    let baseURL = 'https://staging-express.delhivery.com'
    let authHeader = `Token ${delhiveryToken}`
    
    if (endpoint === 'express') {
      baseURL = 'https://express-dev-test.delhivery.com'
    } else if (endpoint === 'track') {
      baseURL = 'https://track.delhivery.com'
    } else if (endpoint === 'ltl') {
      // New LTL API for warehouse management
      baseURL = 'https://ltl-clients-api-dev.delhivery.com'
      authHeader = `Bearer ${delhiveryToken}`
    } else if (endpoint === 'ltl-prod') {
      // Production LTL API
      baseURL = 'https://ltl-clients-api.delhivery.com'
      authHeader = `Bearer ${delhiveryToken}`
    } else if (endpoint === 'main') {
      baseURL = 'https://staging-express.delhivery.com'
    }

    // Prepare the request
    const url = `${baseURL}${action}`
    let headers: any = {
      'Authorization': authHeader,
    }
    
    // Only set Content-Type for JSON requests (FormData sets its own)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    console.log(`📦 Delhivery API Request: ${method} ${url}`)
    if (!isFormData) {
      console.log('📝 Request Data:', JSON.stringify(data))
    } else {
      console.log('📎 FormData with', Array.from((data as FormData).keys()).length, 'fields')
    }

    let response: Response
    let body: any

    // Prepare body based on data type
    if (isFormData) {
      body = data  // FormData is used as-is
    } else if (method !== 'GET' && method !== 'DELETE') {
      body = JSON.stringify(data)
    }

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
        body,
      })
    } else if (method === 'PUT') {
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body,
      })
    } else if (method === 'PATCH') {
      response = await fetch(url, {
        method: 'PATCH',
        headers,
        body,
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
