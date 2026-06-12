# =====================================================
# SEO SCORES DATABASE SETUP SCRIPT
# =====================================================
# This script helps set up the seo_scores table
# in your Supabase database.
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     SEO SCORES - DATABASE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL file exists
$sqlFile = "supabase/seo_scores_schema.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ ERROR: $sqlFile not found!" -ForegroundColor Red
    Write-Host "   Please make sure you're in the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found $sqlFile" -ForegroundColor Green
Write-Host ""

# Read SQL file
Write-Host "📖 Reading SQL file..." -ForegroundColor Cyan
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "✅ SQL file loaded successfully" -ForegroundColor Green
Write-Host ""

# Display instructions
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   SETUP INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Open your Supabase Dashboard" -ForegroundColor White
Write-Host "   👉 https://app.supabase.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Select your project" -ForegroundColor White
Write-Host ""
Write-Host "3. Go to SQL Editor (left sidebar)" -ForegroundColor White
Write-Host "   Icon: <> symbol" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click 'New Query'" -ForegroundColor White
Write-Host ""
Write-Host "5. Paste the SQL query and run it" -ForegroundColor White
Write-Host ""

# Ask if user wants to copy to clipboard
$copy = Read-Host "Would you like to copy the SQL to clipboard? (Y/N)"

if ($copy -eq "Y" -or $copy -eq "y") {
    try {
        Set-Clipboard -Value $sqlContent
        Write-Host ""
        Write-Host "✅ SQL copied to clipboard!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Now:" -ForegroundColor Yellow
        Write-Host "  1. Go to Supabase SQL Editor" -ForegroundColor White
        Write-Host "  2. Press Ctrl+V to paste" -ForegroundColor White
        Write-Host "  3. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host ""
        Write-Host "⚠️  Could not copy to clipboard automatically" -ForegroundColor Yellow
        Write-Host "   Please copy the contents manually from: $sqlFile" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "📋 Manual copy:" -ForegroundColor Yellow
    Write-Host "   1. Open: $sqlFile" -ForegroundColor White
    Write-Host "   2. Select all (Ctrl+A)" -ForegroundColor White
    Write-Host "   3. Copy (Ctrl+C)" -ForegroundColor White
    Write-Host "   4. Paste in Supabase SQL Editor (Ctrl+V)" -ForegroundColor White
    Write-Host "   5. Run (Ctrl+Enter)" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WHAT THIS SCRIPT CREATES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Table: seo_scores" -ForegroundColor Green
Write-Host "   - Stores page paths, integer scores, and checklist data" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ RLS Policies:" -ForegroundColor Green
92: Write-Host "   - Public read access" -ForegroundColor Gray
93: Write-Host "   - Access for admin users to manage scores" -ForegroundColor Gray
Write-Host ""

# Verification steps
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   VERIFICATION STEPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "After running the SQL script, verify:" -ForegroundColor White
Write-Host ""
Write-Host "1. Check if table exists:" -ForegroundColor White
Write-Host "   SELECT * FROM seo_scores;" -ForegroundColor Cyan
Write-Host ""

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ SETUP HELPER READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
