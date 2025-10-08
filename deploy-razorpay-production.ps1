# Razorpay Production Deployment Script (PowerShell)
# This script deploys Supabase Edge Functions for Razorpay integration

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Razorpay Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCommand = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCommand) {
    Write-Host "X Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it with:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
try {
    $null = supabase projects list 2>&1
    Write-Host "✓ Logged in to Supabase" -ForegroundColor Green
} catch {
    Write-Host "X Not logged in to Supabase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Login with:" -ForegroundColor Yellow
    Write-Host "  supabase login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# Prompt for project reference
Write-Host "Enter your Supabase project reference:" -ForegroundColor Yellow
Write-Host "(Find it in: https://app.supabase.com/project/[YOUR-PROJECT-REF])" -ForegroundColor Gray
$PROJECT_REF = Read-Host "Project Ref"

if ([string]::IsNullOrWhiteSpace($PROJECT_REF)) {
    Write-Host "X Project reference is required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Linking to project: $PROJECT_REF" -ForegroundColor Yellow
supabase link --project-ref $PROJECT_REF

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setting Environment Variables" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for Razorpay credentials
Write-Host "Enter your Razorpay credentials:" -ForegroundColor Yellow
Write-Host "(Get them from: https://dashboard.razorpay.com/app/keys)" -ForegroundColor Gray
Write-Host ""

$RAZORPAY_KEY_ID = Read-Host "Razorpay Key ID (rzp_live_XXXXX or rzp_test_XXXXX)"
$RAZORPAY_KEY_SECRET = Read-Host "Razorpay Key Secret" -AsSecureString
$RAZORPAY_KEY_SECRET_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($RAZORPAY_KEY_SECRET))

if ([string]::IsNullOrWhiteSpace($RAZORPAY_KEY_ID) -or [string]::IsNullOrWhiteSpace($RAZORPAY_KEY_SECRET_PLAIN)) {
    Write-Host "X Razorpay credentials are required" -ForegroundColor Red
    exit 1
}

# Verify key format
if ($RAZORPAY_KEY_ID -notmatch "^rzp_(live|test)_") {
    Write-Host "⚠ Warning: Key ID format looks unusual" -ForegroundColor Yellow
    Write-Host "  Expected format: rzp_live_XXXXX or rzp_test_XXXXX" -ForegroundColor Gray
    $CONTINUE = Read-Host "Continue anyway? (y/n)"
    if ($CONTINUE -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "Setting Razorpay secrets..." -ForegroundColor Yellow
supabase secrets set RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID"
supabase secrets set RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET_PLAIN"

Write-Host ""
Write-Host "✓ Environment variables set" -ForegroundColor Green
Write-Host ""

# Deploy functions
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deploying Edge Functions" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deploying create-razorpay-order function..." -ForegroundColor Yellow
supabase functions deploy create-razorpay-order

Write-Host ""
Write-Host "Deploying verify-razorpay-payment function..." -ForegroundColor Yellow
supabase functions deploy verify-razorpay-payment

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Your Edge Functions are now live at:" -ForegroundColor Green
Write-Host "  - https://$PROJECT_REF.supabase.co/functions/v1/create-razorpay-order" -ForegroundColor White
Write-Host "  - https://$PROJECT_REF.supabase.co/functions/v1/verify-razorpay-payment" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend .env file:" -ForegroundColor White
Write-Host "   VITE_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Replace razorpayService.ts with razorpayService.production.ts:" -ForegroundColor White
Write-Host "   Move-Item src\services\razorpayService.ts src\services\razorpayService.test.ts.bak" -ForegroundColor Gray
Write-Host "   Move-Item src\services\razorpayService.production.ts src\services\razorpayService.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy your frontend" -ForegroundColor White
Write-Host ""
Write-Host "4. Test with a small amount (₹1) first" -ForegroundColor White
Write-Host ""

Write-Host "To view function logs:" -ForegroundColor Yellow
Write-Host "  supabase functions logs create-razorpay-order" -ForegroundColor Gray
Write-Host "  supabase functions logs verify-razorpay-payment" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Happy selling! 🚀" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

