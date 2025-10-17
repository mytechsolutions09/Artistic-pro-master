# Manual Supabase Edge Function Setup

Since the Supabase CLI installation is having issues, let's set up the Edge Function manually through the Supabase Dashboard.

## 🎯 **Step-by-Step Manual Setup**

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov
2. Login with your Supabase account

### Step 2: Navigate to Edge Functions
1. In the left sidebar, click on **"Edge Functions"**
2. Click **"Create a new function"**

### Step 3: Create the Function
1. **Function Name**: `delhivery-api`
2. **Description**: `Delhivery API proxy to handle CORS issues`
3. Click **"Create function"**

### Step 4: Add the Code
Replace the default code with this:

```typescript
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
    const { action, data, endpoint } = await req.json()

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

    let response: Response

    // Make the appropriate request based on method
    if (req.method === 'GET') {
      response = await fetch(url, {
        method: 'GET',
        headers,
      })
    } else if (req.method === 'POST') {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })
    } else if (req.method === 'PUT') {
      response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
    } else if (req.method === 'DELETE') {
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
```

### Step 5: Set Environment Variables
1. In the Edge Function editor, click on **"Settings"** tab
2. Click **"Add new secret"**
3. **Name**: `DELHIVERY_API_TOKEN`
4. **Value**: `e465b127092f7f13810c8c1b5adc5ee868a2d475`
5. Click **"Save"**

### Step 6: Deploy the Function
1. Click **"Deploy"** button
2. Wait for deployment to complete
3. You should see a success message

### Step 7: Test the Function
1. Go to the **"Logs"** tab
2. Try creating a shipment in your app
3. Check if the function is being called

## 🧪 **Testing the Setup**

### Test 1: Check Function Status
1. Go to Edge Functions in Supabase Dashboard
2. Your `delhivery-api` function should show as "Active"

### Test 2: Test Shipment Creation
1. Go to your app: Admin → Shipping → Create Shipment
2. Fill in shipment details
3. Click "Create Shipment"
4. Check browser console for any errors

### Test 3: Check Function Logs
1. In Supabase Dashboard → Edge Functions → delhivery-api
2. Click "Logs" tab
3. You should see API calls being made

## ✅ **Expected Results**

**Before Edge Function:**
- Shipment creation shows mock data
- Console shows "Edge Function not available" warning

**After Edge Function:**
- Shipment creation uses real Delhivery API
- Console shows successful API calls
- Real waybill numbers and tracking URLs

## 🆘 **Troubleshooting**

### If Function Deployment Fails
- Check the code syntax
- Ensure all brackets are properly closed
- Verify the environment variable is set

### If API Calls Fail
- Check the function logs in Supabase Dashboard
- Verify the Delhivery API token is correct
- Ensure the function is deployed and active

### If Still Getting Mock Data
- Check browser console for errors
- Verify the function is being called
- Check Supabase Edge Function logs

## 🎯 **Current Status**

- ✅ **Code Ready**: Edge Function code is prepared
- ✅ **Service Updated**: DelhiveryService uses Edge Function
- ✅ **Fallback Working**: Mock data prevents errors
- ⏳ **Manual Setup**: Follow steps above to deploy

---

**Next**: Follow the manual setup steps above to enable real Delhivery API calls!
