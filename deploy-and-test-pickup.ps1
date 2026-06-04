# Deploy and Test Pickup Integration Script
# This script deploys the Delhivery Edge Function and helps troubleshoot pickup issues

Write-Host @"
╔════════════════════════════════════════════════════════╗
║   Delhivery Pickup Integration - Deploy & Test        ║
╚════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Step 1: Check if Supabase CLI is installed
Write-Host "`n[1/5] Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host "💡 Install it with: choco install supabase" -ForegroundColor Yellow
    Write-Host "   Or visit: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Supabase CLI is installed" -ForegroundColor Green

# Step 2: Check if logged in
Write-Host "`n[2/5] Checking Supabase login status..." -ForegroundColor Yellow
try {
    $null = supabase projects list 2>&1
    Write-Host "✅ Logged into Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged into Supabase!" -ForegroundColor Red
    Write-Host "💡 Run: supabase login" -ForegroundColor Yellow
    exit 1
}

# Step 3: Deploy Edge Function
Write-Host "`n[3/5] Deploying delhivery-api Edge Function..." -ForegroundColor Yellow
Write-Host "   This may take a minute..." -ForegroundColor Gray
try {
    supabase functions deploy delhivery-api
    Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Check secrets
Write-Host "`n[4/5] Checking DELHIVERY_API_TOKEN secret..." -ForegroundColor Yellow
Write-Host "   Please verify the secret is set in Supabase Dashboard:" -ForegroundColor Gray
Write-Host "   → Project Settings → Edge Functions → Secrets" -ForegroundColor Gray
Write-Host "   → Look for: DELHIVERY_API_TOKEN" -ForegroundColor Gray
Write-Host ""
$secretSet = Read-Host "   Is DELHIVERY_API_TOKEN secret set? (y/n)"
if ($secretSet -ne 'y') {
    Write-Host ""
    Write-Host "💡 Set the secret with:" -ForegroundColor Yellow
    Write-Host "   supabase secrets set DELHIVERY_API_TOKEN=your_token_here" -ForegroundColor Cyan
    Write-Host ""
    $setNow = Read-Host "   Do you want to set it now? (y/n)"
    if ($setNow -eq 'y') {
        $token = Read-Host "   Enter your Delhivery API token"
        supabase secrets set DELHIVERY_API_TOKEN=$token
        Write-Host "✅ Secret set!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Remember to set the secret before testing!" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Secret is configured" -ForegroundColor Green
}

# Step 5: View recent logs
Write-Host "`n[5/5] Viewing recent Edge Function logs..." -ForegroundColor Yellow
Write-Host "   (Last 20 entries)" -ForegroundColor Gray
Write-Host ""
try {
    supabase functions logs delhivery-api --limit 20
} catch {
    Write-Host "⚠️ Could not fetch logs (this is OK if function hasn't been called yet)" -ForegroundColor Yellow
}

# Summary
Write-Host @"

╔════════════════════════════════════════════════════════╗
║                  ✅ DEPLOYMENT COMPLETE                ║
╚════════════════════════════════════════════════════════╝

📋 Next Steps:
   1. Go to your Admin Panel → Shipping → Pickup
   2. Select a warehouse from the dropdown
   3. Select shipments to pickup
   4. Fill in pickup date and time
   5. Click "Request Pickup"

💡 Monitor logs in real-time:
   supabase functions logs delhivery-api --follow

📖 Troubleshooting:
   See PICKUP_TROUBLESHOOTING_GUIDE.md for detailed help

🔍 Common Issues:
   • Warehouse name mismatch → Ensure exact match with Delhivery
   • 401 Error → Check DELHIVERY_API_TOKEN secret
   • Edge Function error → Check deployment status

"@ -ForegroundColor Green

Write-Host "Press Enter to exit..."
Read-Host

