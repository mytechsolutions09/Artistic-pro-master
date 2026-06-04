#!/bin/bash
# Deploy Delhivery Edge Function to Supabase
# This script deploys the delhivery-api edge function to handle API calls and avoid CORS issues

echo "================================================"
echo "Deploying Delhivery Edge Function"
echo "================================================"
echo ""

# Check if Supabase CLI is installed
echo "Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "✗ Supabase CLI not found. Please install it first:"
    echo "  npm install -g supabase"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version)
echo "✓ Supabase CLI found: $SUPABASE_VERSION"

# Check if logged in
echo ""
echo "Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "✗ Not logged in to Supabase. Please login first:"
    echo "  supabase login"
    exit 1
fi
echo "✓ Authenticated with Supabase"

# Deploy the function
echo ""
echo "Deploying delhivery-api function..."
echo ""

supabase functions deploy delhivery-api --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✓ Delhivery Edge Function deployed successfully!"
    echo "================================================"
    echo ""
    echo "The function will now handle:"
    echo "  • Warehouse creation and updates"
    echo "  • Shipment editing and cancellation"
    echo "  • All Delhivery API calls without CORS issues"
    echo ""
    echo "⚠️  Important: Make sure DELHIVERY_API_TOKEN is set"
    echo "   in your Supabase Edge Function secrets"
    echo ""
    echo "To set the secret, run:"
    echo "  supabase secrets set DELHIVERY_API_TOKEN=your_token_here"
    echo ""
else
    echo ""
    echo "✗ Deployment failed. Please check the error above."
    exit 1
fi

