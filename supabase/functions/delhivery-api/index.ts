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
    let delhiveryToken = Deno.env.get('DELHIVERY_API_TOKEN')
    if (!delhiveryToken) {
      console.error('❌ DELHIVERY_API_TOKEN not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Delhivery API token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Trim whitespace and newlines from token
    delhiveryToken = delhiveryToken.trim()
    
    // Validate token is not empty after trimming
    if (!delhiveryToken || delhiveryToken.length === 0) {
      console.error('❌ DELHIVERY_API_TOKEN is empty after trimming')
      return new Response(
        JSON.stringify({ error: 'Delhivery API token is empty' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Log token info (first and last 4 chars for security)
    const tokenPreview = delhiveryToken.length > 8 
      ? `${delhiveryToken.substring(0, 4)}...${delhiveryToken.substring(delhiveryToken.length - 4)}`
      : '***'
    console.log(`🔑 Token preview: ${tokenPreview} (length: ${delhiveryToken.length})`)
    
    // Check if token looks like a JWT (has 3 segments separated by dots)
    const tokenSegments = delhiveryToken.split('.')
    if (tokenSegments.length === 3) {
      console.log('⚠️ Token appears to be a JWT (3 segments)')
    } else if (tokenSegments.length === 1) {
      console.log('ℹ️ Token appears to be a simple API key (1 segment)')
    } else {
      console.warn(`⚠️ Token has unexpected format: ${tokenSegments.length} segments`)
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
      // Try Token format first (same as Express API)
      baseURL = 'https://ltl-clients-api-dev.delhivery.com'
      authHeader = `Token ${delhiveryToken}`
    } else if (endpoint === 'ltl-prod') {
      // Production LTL API
      baseURL = 'https://ltl-clients-api.delhivery.com'
      authHeader = `Token ${delhiveryToken}`
    } else if (endpoint === 'main') {
      baseURL = 'https://staging-express.delhivery.com'
    }

    // Prepare the request
    // Replace placeholder token in query string with actual token
    let finalAction = action
    if (finalAction.includes('token=edge-function-token')) {
      finalAction = finalAction.replace('token=edge-function-token', `token=${delhiveryToken}`)
    }
    
    const url = `${baseURL}${finalAction}`
    let headers: any = {
      'Authorization': authHeader,
    }
    
    // Only set Content-Type for JSON requests (FormData sets its own)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    console.log(`📦 Delhivery API Request: ${method} ${url}`)
    console.log(`🔑 Auth Header format: ${authHeader.split(' ')[0]} (token length: ${delhiveryToken.length})`)
    console.log(`🔑 Full Auth Header: ${authHeader.substring(0, 30)}...`) // Log first 30 chars of auth header
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
      // CMU API requires URL-encoded format: format=json&data={...}
      if (action === '/api/cmu/create.json' && data && typeof data === 'object' && 'format' in data && 'data' in data) {
        // Convert to URL-encoded format
        body = `format=${encodeURIComponent(data.format)}&data=${encodeURIComponent(data.data)}`
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      } else {
        body = JSON.stringify(data)
      }
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
    console.log('📄 Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries())))
    console.log('📄 Response Data:', JSON.stringify(jsonData))
    
    // Log detailed error info for 401 errors
    if (response.status === 401) {
      console.error('❌ Authentication Failed (401)')
      console.error('📦 Request URL:', url)
      console.error('📝 Request Method:', method)
      console.error('📋 Request Data:', JSON.stringify(data))
      console.error('🔑 Auth Header Format:', authHeader.split(' ')[0])
      console.error('🔑 Token Length:', delhiveryToken.length)
      console.error('🔑 Token Preview:', tokenPreview)
      console.error('🔍 Full Response:', JSON.stringify(jsonData))
      console.error('📄 Response Headers:', JSON.stringify(Object.fromEntries(response.headers.entries())))
      console.error('💡 Possible causes:')
      console.error('   1. API token does not have pickup permissions (MOST LIKELY)')
      console.error('   2. Token is invalid or expired')
      console.error('   3. Warehouse name does not match exactly (case-sensitive)')
      console.error('   4. Wrong authentication format')
      console.error('   5. Warehouse not registered in Delhivery')
      if (data && typeof data === 'object' && 'warehouse_name' in data) {
        console.error(`⚠️ Warehouse name being sent: "${data.warehouse_name}"`)
        console.error(`📏 Warehouse name length: ${data.warehouse_name.length} characters`)
        console.error('   → Verify this EXACT name exists in Delhivery dashboard')
        console.error('   → Check: case, spaces, hyphens, special characters')
      }
      
      // Extract specific error message from Delhivery
      const delhiveryErrorMsg = jsonData?.raw || jsonData?.error?.message || jsonData?.message || jsonData?.error || 'No specific error message';
      console.error('📄 Delhivery Error Message:', delhiveryErrorMsg)
      
      // Provide specific guidance based on error message
      if (typeof delhiveryErrorMsg === 'string') {
        if (delhiveryErrorMsg.toLowerCase().includes('warehouse') || delhiveryErrorMsg.toLowerCase().includes('client_warehouse')) {
          console.error('💡 ERROR TYPE: Warehouse-related')
          console.error('   → Warehouse name might not exist in Delhivery')
          console.error('   → Or warehouse is not registered/active')
        } else if (delhiveryErrorMsg.toLowerCase().includes('token') || delhiveryErrorMsg.toLowerCase().includes('auth')) {
          console.error('💡 ERROR TYPE: Token-related')
          console.error('   → Token might not have pickup permissions')
          console.error('   → Token might be expired or invalid')
          console.error('   → Contact Delhivery support to verify token permissions')
        } else {
          console.error('💡 ERROR TYPE: Unknown')
          console.error('   → Check Delhivery dashboard for warehouse status')
          console.error('   → Verify token permissions with Delhivery support')
        }
      }
    }

    // Always return 200 status to avoid Supabase treating it as an error
    // Include the actual status and error info in the response body
    return new Response(
      JSON.stringify({
        success: response.ok,
        data: jsonData,
        status: response.status,
        statusText: response.statusText,
        // Include error details if status is not ok
        error: !response.ok ? (jsonData.error || jsonData.message || response.statusText || `HTTP ${response.status}`) : undefined
      }),
      { 
        status: 200, // Always return 200, check response.success instead
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
