# Quick Test Script for Delhivery API Token
# This tests if your Delhivery token is valid

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Delhivery API Token Test" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for token
$token = Read-Host "Enter your Delhivery API token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ No token provided" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing token against Delhivery API..." -ForegroundColor Yellow
Write-Host ""

# Test pincode API
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type" = "application/json"
}

$body = @{
    filter_codes = "110001"
} | ConvertTo-Json

try {
    Write-Host "🔍 Testing with pincode 110001..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "https://staging-express.delhivery.com/c/api/pin-codes/json/" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Token is valid!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor White
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    Write-Host ""
    Write-Host "Now set this token in Supabase:" -ForegroundColor Cyan
    Write-Host "  supabase secrets set DELHIVERY_API_TOKEN=$token" -ForegroundColor White
    Write-Host ""
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "❌ FAILED! Token is invalid or expired" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($statusCode -eq 401) {
        Write-Host "This is a 401 Unauthorized error." -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Token is incorrect or expired" -ForegroundColor White
        Write-Host "  2. Token doesn't have API access enabled" -ForegroundColor White
        Write-Host "  3. Using staging token on production URL (or vice versa)" -ForegroundColor White
        Write-Host ""
        Write-Host "Solutions:" -ForegroundColor Cyan
        Write-Host "  1. Generate a new token from Delhivery dashboard" -ForegroundColor White
        Write-Host "  2. Make sure API access is enabled for your account" -ForegroundColor White
        Write-Host "  3. Contact Delhivery support if the issue persists" -ForegroundColor White
    }
    
    Write-Host ""
    exit 1
}

