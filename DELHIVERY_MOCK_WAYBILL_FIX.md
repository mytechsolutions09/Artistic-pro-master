# Fixing Mock Waybill Issue

## Problem
Shipments are being created with mock waybills like `MOCK17684632268171` instead of real Delhivery waybills.

## Root Cause
The Delhivery API is not properly configured. This happens when:
1. **Edge Function is not deployed** - The `delhivery-api` Edge Function needs to be deployed
2. **DELHIVERY_API_TOKEN secret is not set** - The API token must be configured in Supabase secrets
3. **Edge Function errors** - The Edge Function is deployed but encountering errors

## Solution

### Step 1: Deploy Edge Function
```bash
supabase functions deploy delhivery-api
```

### Step 2: Set API Token Secret
```bash
supabase secrets set DELHIVERY_API_TOKEN=your-actual-delhivery-token
```

Replace `your-actual-delhivery-token` with your actual Delhivery API token.

### Step 3: Verify Edge Function is Working
Check the Edge Function logs:
```bash
supabase functions logs delhivery-api
```

Look for any errors related to:
- Missing DELHIVERY_API_TOKEN
- Network errors
- API authentication failures

### Step 4: Test Waybill Generation
1. Go to Admin → Shipping
2. Try to create a new shipment
3. Check the browser console for error messages
4. If you see "Edge Function error" messages, check the deployment

## Error Messages

### "Edge Function error: function not found"
- **Solution**: Deploy the Edge Function: `supabase functions deploy delhivery-api`

### "Delhivery API token not configured"
- **Solution**: Set the secret: `supabase secrets set DELHIVERY_API_TOKEN=your-token`

### "Received mock waybills from API"
- **Solution**: The Edge Function is returning mock data. Check Edge Function logs and verify the token is correct.

## Verification

After fixing the configuration:
1. Create a new shipment
2. The waybill should start with `DL` (not `MOCK`)
3. Check browser console - should see "✅ Shipment created in Delhivery with waybill: DL..."
4. No warning messages about mock data

## Current Status

The code has been updated to:
- ✅ Show clear error messages when Edge Function is not deployed
- ✅ Detect when mock waybills are returned and throw errors
- ✅ Provide troubleshooting steps in error messages
- ✅ Only use mock data for actual network errors (not configuration errors)

## Next Steps

1. Deploy the Edge Function
2. Set the DELHIVERY_API_TOKEN secret
3. Test shipment creation
4. Verify real waybills are generated
