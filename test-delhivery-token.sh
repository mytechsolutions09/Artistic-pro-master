#!/bin/bash
# Quick Test Script for Delhivery API Token
# This tests if your Delhivery token is valid

echo "================================================"
echo "Delhivery API Token Test"
echo "================================================"
echo ""

# Prompt for token
read -p "Enter your Delhivery API token: " token

if [ -z "$token" ]; then
    echo "❌ No token provided"
    exit 1
fi

echo ""
echo "Testing token against Delhivery API..."
echo ""

# Test pincode API
echo "🔍 Testing with pincode 110001..."
response=$(curl -s -w "\n%{http_code}" -X POST \
    "https://staging-express.delhivery.com/c/api/pin-codes/json/" \
    -H "Authorization: Token $token" \
    -H "Content-Type: application/json" \
    -d '{"filter_codes": "110001"}')

# Extract status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo "================================================"
    echo "✅ SUCCESS! Token is valid!"
    echo "================================================"
    echo ""
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""
    echo "Now set this token in Supabase:"
    echo "  supabase secrets set DELHIVERY_API_TOKEN=$token"
    echo ""
    exit 0
else
    echo "================================================"
    echo "❌ FAILED! Token is invalid or expired"
    echo "================================================"
    echo ""
    echo "Status Code: $http_code"
    echo "Response: $body"
    echo ""
    
    if [ "$http_code" -eq 401 ]; then
        echo "This is a 401 Unauthorized error."
        echo ""
        echo "Possible causes:"
        echo "  1. Token is incorrect or expired"
        echo "  2. Token doesn't have API access enabled"
        echo "  3. Using staging token on production URL (or vice versa)"
        echo ""
        echo "Solutions:"
        echo "  1. Generate a new token from Delhivery dashboard"
        echo "  2. Make sure API access is enabled for your account"
        echo "  3. Contact Delhivery support if the issue persists"
        echo ""
    fi
    
    exit 1
fi

