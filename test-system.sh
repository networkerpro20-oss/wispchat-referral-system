#!/bin/bash

echo "=================================="
echo "🧪 TESTING SISTEMA DE REFERIDOS"
echo "=================================="
echo ""

API_URL="https://wispchat-referral-backend.onrender.com/api"

# Test 1: Backend Health
echo "1️⃣  Backend Health Check"
echo "-----------------------------------"
HEALTH=$(curl -s https://wispchat-referral-backend.onrender.com/health)
echo "$HEALTH" | jq .
if echo "$HEALTH" | jq -e '.success == true' > /dev/null; then
    echo "✅ Backend is UP"
else
    echo "❌ Backend is DOWN"
fi
echo ""

# Test 2: Validate Referral Code
echo "2️⃣  Validate Referral Code (EASY-00001)"
echo "-----------------------------------"
VALIDATE=$(curl -s "$API_URL/referral-codes/EASY-00001/validate")
echo "$VALIDATE" | jq .
if echo "$VALIDATE" | jq -e '.success == true' > /dev/null; then
    echo "✅ Code validation working"
else
    echo "⚠️  Code not found (expected if no data)"
fi
echo ""

# Test 3: Client Summary
echo "3️⃣  Client Summary (WISPHUB_01)"
echo "-----------------------------------"
SUMMARY=$(curl -s "$API_URL/clients/WISPHUB_01/summary")
echo "$SUMMARY" | jq .
if echo "$SUMMARY" | jq -e '.success' > /dev/null; then
    echo "✅ Client summary endpoint working"
else
    echo "⚠️  No client data (expected if no data)"
fi
echo ""

# Test 4: Client Referrals
echo "4️⃣  Client Referrals (WISPHUB_01)"
echo "-----------------------------------"
REFERRALS=$(curl -s "$API_URL/clients/WISPHUB_01/referrals")
echo "$REFERRALS" | jq .
echo ""

# Test 5: Client Commissions
echo "5️⃣  Client Commissions (WISPHUB_01)"
echo "-----------------------------------"
COMMISSIONS=$(curl -s "$API_URL/clients/WISPHUB_01/commissions")
echo "$COMMISSIONS" | jq .
echo ""

# Test 6: Uploads List
echo "6️⃣  Uploads List"
echo "-----------------------------------"
UPLOADS=$(curl -s "$API_URL/uploads")
echo "$UPLOADS" | jq '.data | length' 2>/dev/null || echo "No uploads yet"
echo ""

echo "=================================="
echo "✅ Backend Tests Complete"
echo "=================================="
echo ""
echo "🌐 Frontend URLs to test manually:"
echo "   Admin Panel:    http://localhost:3001/admin"
echo "   Upload CSV:     http://localhost:3001/admin/invoices"
echo "   History:        http://localhost:3001/admin/uploads"
echo "   Dashboard:      http://localhost:3001/dashboard?id=WISPHUB_01"
echo "   Landing:        http://localhost:3001/easyaccess/EASY-00001"
echo ""
