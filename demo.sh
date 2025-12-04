#!/bin/bash

# Demo script for WispChat Referral System
# This script demonstrates the core functionality of the referral system

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "WispChat Referral System Demo"
echo "Easy Access Newtelecom"
echo "=========================================="
echo ""

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Error: Server is not running on port 3000"
    echo "Please start the server with: npm start"
    exit 1
fi
echo "✅ Server is running"
echo ""

# Scenario: Complete referral flow
echo "📋 Scenario: Complete Referral Flow"
echo "-----------------------------------"
echo ""

# Step 1: Create first user
echo "1️⃣  Creating User A (Ana Rodríguez)..."
USER_A=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Rodríguez",
    "email": "ana@newtelecom.com",
    "phone": "+502 5555-1111"
  }')

USER_A_ID=$(echo "$USER_A" | jq -r '.user.id')
USER_A_CODE=$(echo "$USER_A" | jq -r '.user.referralCode')

echo "   ✅ User created successfully"
echo "   📧 Email: ana@newtelecom.com"
echo "   🎫 Referral Code: $USER_A_CODE"
echo ""

# Step 2: Share referral code (simulated)
echo "2️⃣  Ana shares her referral code with friends..."
echo "   📤 Sharing code: $USER_A_CODE"
echo ""

# Step 3: Create second user with referral code
echo "3️⃣  Creating User B (Roberto Méndez) using Ana's referral code..."
USER_B=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Roberto Méndez\",
    \"email\": \"roberto@newtelecom.com\",
    \"phone\": \"+502 5555-2222\",
    \"referralCode\": \"$USER_A_CODE\"
  }")

echo "   ✅ User created successfully"
echo "   📧 Email: roberto@newtelecom.com"
echo "   🎉 Ana received 100 points as reward!"
echo ""

# Step 4: Create third user with referral code
echo "4️⃣  Creating User C (Carmen López) using Ana's referral code..."
USER_C=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Carmen López\",
    \"email\": \"carmen@newtelecom.com\",
    \"phone\": \"+502 5555-3333\",
    \"referralCode\": \"$USER_A_CODE\"
  }")

echo "   ✅ User created successfully"
echo "   📧 Email: carmen@newtelecom.com"
echo "   🎉 Ana received another 100 points!"
echo ""

# Step 5: Check Ana's statistics
echo "5️⃣  Checking Ana's referral statistics..."
USER_A_STATS=$(curl -s "$BASE_URL/api/users/$USER_A_ID")
REFERRALS=$(curl -s "$BASE_URL/api/referrals/user/$USER_A_ID")
REWARDS=$(curl -s "$BASE_URL/api/rewards/user/$USER_A_ID")

TOTAL_REWARDS=$(echo "$REWARDS" | jq -r '.totalAmount')
REFERRAL_COUNT=$(echo "$REFERRALS" | jq -r '.count')

echo "   📊 Ana's Statistics:"
echo "   • Total Referrals: $REFERRAL_COUNT"
echo "   • Total Rewards: $TOTAL_REWARDS points"
echo ""

# Step 6: Show all referrals
echo "6️⃣  Displaying all referrals..."
ALL_REFERRALS=$(curl -s "$BASE_URL/api/referrals")
echo "$ALL_REFERRALS" | jq -r '.referrals[] | "   • Referral: \(.id) | Status: \(.status) | Reward: \(.rewardAmount) points"'
echo ""

# Step 7: Show system statistics
echo "7️⃣  System Statistics:"
STATS=$(curl -s "$BASE_URL/api/referrals/stats")
echo "   • Total Users: $(echo $STATS | jq -r '.totalUsers')"
echo "   • Total Referrals: $(echo $STATS | jq -r '.totalReferrals')"
echo "   • Completed Referrals: $(echo $STATS | jq -r '.completedReferrals')"
echo "   • Total Rewards Distributed: $(echo $STATS | jq -r '.totalRewards') points"
echo ""

echo "=========================================="
echo "✅ Demo completed successfully!"
echo "=========================================="
echo ""
echo "💡 Tips:"
echo "   • Each user gets a unique referral code (EA-XXXXXX)"
echo "   • Referrers earn 100 points per successful referral"
echo "   • All rewards are automatically approved"
echo "   • View API docs: README.md and API_DOCS.md"
echo ""
