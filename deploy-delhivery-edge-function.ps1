# Deploy Delhivery Edge Function to Supabase
# This script deploys the delhivery-api edge function to handle API calls and avoid CORS issues

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Deploying Delhivery Edge Function" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✓ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "  npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host ""
Write-Host "Checking Supabase authentication..." -ForegroundColor Yellow
$authStatus = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Not logged in to Supabase. Please login first:" -ForegroundColor Red
    Write-Host "  supabase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Authenticated with Supabase" -ForegroundColor Green

# Deploy the function
Write-Host ""
Write-Host "Deploying delhivery-api function..." -ForegroundColor Yellow
Write-Host ""

supabase functions deploy delhivery-api --no-verify-jwt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✓ Delhivery Edge Function deployed successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The function will now handle:" -ForegroundColor Cyan
    Write-Host "  • Warehouse creation and updates" -ForegroundColor White
    Write-Host "  • Shipment editing and cancellation" -ForegroundColor White
    Write-Host "  • All Delhivery API calls without CORS issues" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Important: Make sure DELHIVERY_API_TOKEN is set" -ForegroundColor Yellow
    Write-Host "   in your Supabase Edge Function secrets" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set the secret, run:" -ForegroundColor Cyan
    Write-Host "  supabase secrets set DELHIVERY_API_TOKEN=your_token_here" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed. Please check the error above." -ForegroundColor Red
    exit 1
}

