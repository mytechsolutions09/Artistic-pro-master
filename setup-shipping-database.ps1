# Shipping Database Setup Script for Windows
# This script helps you set up the shipping database tables

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SHIPPING MODULE DATABASE SETUP" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if shipping_database_setup.sql exists
if (-Not (Test-Path "shipping_database_setup.sql")) {
    Write-Host "❌ ERROR: shipping_database_setup.sql not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found shipping_database_setup.sql" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SETUP OPTIONS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose how to set up your shipping database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Automatic Setup (Supabase CLI - Recommended)" -ForegroundColor White
Write-Host "   - Requires Supabase CLI installed" -ForegroundColor Gray
Write-Host "   - Runs SQL script automatically" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Manual Setup (Copy SQL)" -ForegroundColor White
Write-Host "   - Opens SQL file and Supabase dashboard" -ForegroundColor Gray
Write-Host "   - You copy and paste manually" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Show Instructions Only" -ForegroundColor White
Write-Host "   - Displays step-by-step instructions" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "   AUTOMATIC SETUP" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        
        # Check if Supabase CLI is installed
        $supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
        
        if ($supabaseInstalled) {
            Write-Host "✅ Supabase CLI found!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Running SQL script..." -ForegroundColor Yellow
            
            # Run the SQL script
            supabase db push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ SUCCESS! Database tables created!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Tables created:" -ForegroundColor Cyan
                Write-Host "  • shipments" -ForegroundColor White
                Write-Host "  • warehouses" -ForegroundColor White
                Write-Host "  • pin_code_checks" -ForegroundColor White
                Write-Host "  • shipping_rates" -ForegroundColor White
                Write-Host "  • pickup_requests" -ForegroundColor White
                Write-Host "  • expected_tat" -ForegroundColor White
                Write-Host "  • waybill_generation_log" -ForegroundColor White
                Write-Host "  • shipment_tracking_events" -ForegroundColor White
                Write-Host ""
                Write-Host "✅ Sample data inserted (2 warehouses, 2 shipments)" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ ERROR: Failed to run SQL script" -ForegroundColor Red
                Write-Host "   Try Manual Setup (Option 2) instead" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Would you like to:" -ForegroundColor Yellow
            Write-Host "  A. Install Supabase CLI now" -ForegroundColor White
            Write-Host "  B. Use Manual Setup instead" -ForegroundColor White
            Write-Host ""
            $subChoice = Read-Host "Enter your choice (A or B)"
            
            if ($subChoice -eq "A" -or $subChoice -eq "a") {
                Write-Host ""
                Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
                Write-Host ""
                
                # Install using Scoop (if available) or show instructions
                $scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue
                
                if ($scoopInstalled) {
                    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
                    scoop install supabase
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Supabase CLI installed!" -ForegroundColor Green
                        Write-Host "   Please restart this script to continue." -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "Please install Supabase CLI manually:" -ForegroundColor Yellow
                    Write-Host ""
                    Write-Host "Option 1: Using Scoop (Recommended)" -ForegroundColor Cyan
                    Write-Host "  1. Install Scoop: https://scoop.sh/" -ForegroundColor White
                    Write-Host "  2. Run: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor White
                    Write-Host "  3. Run: scoop install supabase" -ForegroundColor White
                    Write-Host ""
                    Write-Host "Option 2: Using npm" -ForegroundColor Cyan
                    Write-Host "  Run: npm install -g supabase" -ForegroundColor White
                    Write-Host ""
                    Write-Host "See INSTALL_SUPABASE_CLI_WINDOWS.md for detailed instructions" -ForegroundColor Gray
                }
            } else {
                # Proceed to manual setup
                & $PSCommandPath "2"
            }
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "   MANUAL SETUP" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Follow these steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Opening shipping_database_setup.sql..." -ForegroundColor White
        
        # Open the SQL file in default editor
        Start-Process "shipping_database_setup.sql"
        Start-Sleep -Seconds 1
        
        Write-Host "2. Opening Supabase Dashboard..." -ForegroundColor White
        Start-Process "https://supabase.com/dashboard"
        Start-Sleep -Seconds 1
        
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. In Supabase Dashboard:" -ForegroundColor Cyan
        Write-Host "     • Select your project" -ForegroundColor White
        Write-Host "     • Click 'SQL Editor' in left sidebar" -ForegroundColor White
        Write-Host "     • Click 'New Query'" -ForegroundColor White
        Write-Host ""
        Write-Host "  2. In the SQL file that opened:" -ForegroundColor Cyan
        Write-Host "     • Press Ctrl+A to select all" -ForegroundColor White
        Write-Host "     • Press Ctrl+C to copy" -ForegroundColor White
        Write-Host ""
        Write-Host "  3. Back in Supabase SQL Editor:" -ForegroundColor Cyan
        Write-Host "     • Press Ctrl+V to paste" -ForegroundColor White
        Write-Host "     • Click 'Run' button (bottom right)" -ForegroundColor White
        Write-Host "     • Wait for 'Success' message" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ That's it! Database setup complete!" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "   SETUP INSTRUCTIONS" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "METHOD 1: Supabase Dashboard (Easiest)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
        Write-Host "2. Select your project" -ForegroundColor White
        Write-Host "3. Click 'SQL Editor' in left sidebar" -ForegroundColor White
        Write-Host "4. Click 'New Query'" -ForegroundColor White
        Write-Host "5. Copy contents of shipping_database_setup.sql" -ForegroundColor White
        Write-Host "6. Paste into SQL Editor" -ForegroundColor White
        Write-Host "7. Click 'Run' button" -ForegroundColor White
        Write-Host "8. Wait for 'Success' message" -ForegroundColor White
        Write-Host ""
        Write-Host "METHOD 2: Supabase CLI" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Install Supabase CLI (see INSTALL_SUPABASE_CLI_WINDOWS.md)" -ForegroundColor White
        Write-Host "2. Run: supabase db push" -ForegroundColor White
        Write-Host ""
        Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
        Write-Host "  • QUICK_SHIPPING_SETUP.md" -ForegroundColor White
        Write-Host "  • SHIPPING_ACTIVATION_GUIDE.md" -ForegroundColor White
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   NEXT STEPS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After database setup is complete:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start your dev server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Login as admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Navigate to:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/admin/shipping" -ForegroundColor White
Write-Host ""
Write-Host "4. Start using the shipping module! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "For API configuration, see QUICK_SHIPPING_SETUP.md" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

# Pause at the end
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

