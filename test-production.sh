#!/bin/bash

BACKEND="https://campus-event-api-izni.onrender.com"
FRONTEND="https://campus-event-api.vercel.app"

echo "🔍 Testing Production Deployment"
echo "================================"

# Test Backend
echo -n "Backend Health: "
curl -s $BACKEND/health | grep -q "OK" && echo "✅" || echo "❌"

echo -n "Backend API Docs: "
curl -s $BACKEND/ | grep -q "CampusEvent" && echo "✅" || echo "❌"

echo -n "Events Endpoint: "
curl -s $BACKEND/api/events | grep -q "success" && echo "✅" || echo "❌"

# Test Frontend
echo -n "Frontend Homepage: "
curl -s $FRONTEND | grep -q "CampusEvents" && echo "✅" || echo "❌"

echo "================================"
echo "🎉 Production tests complete!"
