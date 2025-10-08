#!/bin/bash

# Razorpay Production Deployment Script
# This script deploys Supabase Edge Functions for Razorpay integration

set -e  # Exit on error

echo "=========================================="
echo "Razorpay Production Deployment"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Login with:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Prompt for project reference
echo "Enter your Supabase project reference:"
echo "(Find it in: https://app.supabase.com/project/[YOUR-PROJECT-REF])"
read -p "Project Ref: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

echo ""
echo "Linking to project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "=========================================="
echo "Setting Environment Variables"
echo "=========================================="
echo ""

# Prompt for Razorpay credentials
echo "Enter your Razorpay LIVE credentials:"
echo "(Get them from: https://dashboard.razorpay.com/app/keys)"
echo ""

read -p "Razorpay Key ID (rzp_live_XXXXX): " RAZORPAY_KEY_ID
read -sp "Razorpay Key Secret: " RAZORPAY_KEY_SECRET
echo ""

if [ -z "$RAZORPAY_KEY_ID" ] || [ -z "$RAZORPAY_KEY_SECRET" ]; then
    echo "❌ Razorpay credentials are required"
    exit 1
fi

# Verify key format
if [[ ! "$RAZORPAY_KEY_ID" =~ ^rzp_(live|test)_ ]]; then
    echo "⚠️  Warning: Key ID format looks unusual"
    echo "   Expected format: rzp_live_XXXXX or rzp_test_XXXXX"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "Setting Razorpay secrets..."
supabase secrets set RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID"
supabase secrets set RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET"

echo ""
echo "✅ Environment variables set"
echo ""

# Deploy functions
echo "=========================================="
echo "Deploying Edge Functions"
echo "=========================================="
echo ""

echo "Deploying create-razorpay-order function..."
supabase functions deploy create-razorpay-order

echo ""
echo "Deploying verify-razorpay-payment function..."
supabase functions deploy verify-razorpay-payment

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""

echo "Your Edge Functions are now live at:"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/create-razorpay-order"
echo "  - https://$PROJECT_REF.supabase.co/functions/v1/verify-razorpay-payment"
echo ""

echo "Next Steps:"
echo "1. Update your frontend .env file:"
echo "   VITE_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID"
echo ""
echo "2. Replace razorpayService.ts with razorpayService.production.ts:"
echo "   mv src/services/razorpayService.ts src/services/razorpayService.test.ts.bak"
echo "   mv src/services/razorpayService.production.ts src/services/razorpayService.ts"
echo ""
echo "3. Deploy your frontend"
echo ""
echo "4. Test with a small amount (₹1) first"
echo ""

echo "To view function logs:"
echo "  supabase functions logs create-razorpay-order"
echo "  supabase functions logs verify-razorpay-payment"
echo ""

echo "=========================================="
echo "Happy selling! 🚀"
echo "=========================================="

