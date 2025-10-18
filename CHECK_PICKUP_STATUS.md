# Quick Pickup Status Check

Run these commands to diagnose the pickup issue:

## 1. Check Edge Function Status
```powershell
supabase functions list
```
✅ You should see `delhivery-api` in the list

## 2. View Recent Logs
```powershell
supabase functions logs delhivery-api --limit 50
```
Look for errors or 401/403 status codes

## 3. Check Secrets
```powershell
supabase secrets list
```
✅ You should see `DELHIVERY_API_TOKEN`

## 4. Test Pickup Request
Open browser console (F12) and try creating a pickup. Look for:
- 🚀 "handleRequestPickup called"
- 📤 "Sending pickup request to Delhivery..."
- ✅ "Pickup requested successfully" OR
- ❌ Error message with troubleshooting steps

## Most Likely Issue

**Warehouse Name Mismatch** (70% of cases)
- The warehouse name in your database must EXACTLY match the name registered in Delhivery
- Check: Admin Panel → Shipping → Warehouse tab
- Compare with your Delhivery dashboard warehouse names

## Quick Fix

1. Deploy Edge Function:
   ```powershell
   supabase functions deploy delhivery-api
   ```

2. Verify warehouse name matches Delhivery exactly

3. Try pickup again and check browser console for detailed errors

## Need More Help?

See **PICKUP_TROUBLESHOOTING_GUIDE.md** for comprehensive troubleshooting.

