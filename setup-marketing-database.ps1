# =====================================================
# MARKETING SETTINGS DATABASE SETUP SCRIPT
# =====================================================
# This script helps set up the marketing_settings table
# in your Supabase database
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MARKETING SETTINGS - DATABASE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL file exists
$sqlFile = "create_marketing_settings_table.sql"
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
Write-Host "5. The SQL content is ready to copy!" -ForegroundColor White
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
Write-Host "✅ Table: marketing_settings" -ForegroundColor Green
Write-Host "   - Stores Meta Pixel ID" -ForegroundColor Gray
Write-Host "   - Stores Google Analytics ID" -ForegroundColor Gray
Write-Host "   - Stores other marketing tool IDs" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ RLS Policies:" -ForegroundColor Green
Write-Host "   - Public read access (for frontend)" -ForegroundColor Gray
Write-Host "   - Admin write access (for settings)" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Default Settings:" -ForegroundColor Green
Write-Host "   - Meta Pixel ID: 1165585550249911" -ForegroundColor Gray
Write-Host "   - Meta Pixel Enabled: true" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Triggers:" -ForegroundColor Green
Write-Host "   - Auto-update updated_at timestamp" -ForegroundColor Gray
Write-Host ""

# Verification steps
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   VERIFICATION STEPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "After running the SQL script, verify:" -ForegroundColor White
Write-Host ""
Write-Host "1. Check if table exists:" -ForegroundColor White
Write-Host "   SELECT * FROM marketing_settings;" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Verify default settings:" -ForegroundColor White
Write-Host "   Should show Meta Pixel ID and enabled=true" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check RLS policies:" -ForegroundColor White
Write-Host "   Should show 2 policies (public read, admin write)" -ForegroundColor Gray
Write-Host ""

# Next steps
Write-Host "========================================" -ForegroundColor Green
Write-Host "   NEXT STEPS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "After database setup is complete:" -ForegroundColor White
Write-Host ""
Write-Host "1. 🎯 Access Admin Panel" -ForegroundColor Yellow
Write-Host "   👉 Go to: Admin → Settings → Marketing" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. ⚙️  Configure Meta Pixel" -ForegroundColor Yellow
Write-Host "   - Enter your Meta Pixel ID" -ForegroundColor White
Write-Host "   - Toggle 'Enable Meta Pixel' to ON" -ForegroundColor White
Write-Host "   - Click 'Save Marketing Settings'" -ForegroundColor White
Write-Host ""
Write-Host "3. 🧪 Test Setup" -ForegroundColor Yellow
Write-Host "   - Click 'Test Pixel' button" -ForegroundColor White
Write-Host "   - Check Meta Events Manager" -ForegroundColor White
Write-Host "   - Verify status shows 'Active'" -ForegroundColor White
Write-Host ""
Write-Host "4. 📊 Monitor Events" -ForegroundColor Yellow
Write-Host "   👉 https://business.facebook.com/events_manager" -ForegroundColor Cyan
Write-Host ""

# Documentation links
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DOCUMENTATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Full Setup Guide:" -ForegroundColor White
Write-Host "   📄 MARKETING_ADMIN_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ Quick Reference:" -ForegroundColor White
Write-Host "   📄 MARKETING_QUICK_REFERENCE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Meta Pixel Setup:" -ForegroundColor White
Write-Host "   📄 META_PIXEL_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ SCRIPT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your Marketing Admin Tab is ready to use!" -ForegroundColor Green
Write-Host ""

# Wait for user input
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

