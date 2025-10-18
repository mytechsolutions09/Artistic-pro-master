# Check Edge Function Logs for 400 Error

## 🔍 View Logs in Dashboard

**Go to:** https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions

**Steps:**
1. Click on `delhivery-api` function
2. Click on **"Logs"** tab
3. Look for the most recent request
4. You'll see one of these messages:

### Possible Errors:

**❌ Missing action:**
```
❌ Missing action in request
```

**❌ Missing endpoint:**
```
❌ Missing endpoint in request  
```

**📦 Request body will show:**
```
📄 Content-Type: application/json
📦 Request body: {"action":"/pickup_requests","method":"POST","data":{...},"endpoint":"ltl"}
✅ Parsed request - Action: /pickup_requests, Endpoint: ltl, Method: POST
```

## 🐛 Most Likely Issue

The error "Edge Function error: Edge Function returned a non-2xx status code" means the Edge Function itself is sending back a 400.

Looking at the new validation I added, it's likely:
- Missing `action` field
- Missing `endpoint` field
- Or JSON parsing error

## 📊 What to Look For in Logs

You should see something like:
```
📄 Content-Type: application/json
📦 Request body: {....the full JSON...}
```

**If you see:**
- `❌ Missing action in request` → The action field is not being sent
- `❌ Missing endpoint in request` → The endpoint field is not being sent
- Any other error → Share the exact error message

