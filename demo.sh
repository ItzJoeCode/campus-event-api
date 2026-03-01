#!/bin/bash

# CampusEvent API - Demo Script
# This script helps you test the full application locally

echo "🎓 CampusEvent API - Demo Setup"
echo "================================="

# Check if MongoDB is running locally
echo "📊 Checking MongoDB connection..."
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB is running locally"
    MONGODB_URI="mongodb://localhost:27017/campus_events"
else
    echo "⚠️  MongoDB not running locally. Using MongoDB Atlas..."
    # You'll need to set this environment variable
    MONGODB_URI="${MONGODB_URI:-mongodb+srv://demo:demo@cluster.mongodb.net/campus_events}"
fi

# Set environment variables
export MONGODB_URI
export JWT_SECRET="demo_jwt_secret_change_in_production"
export JWT_EXPIRE="7d"
export NODE_ENV="development"
export PORT="5000"

echo "🔧 Environment configured:"
echo "   MONGODB_URI: $MONGODB_URI"
echo "   JWT_SECRET: [HIDDEN]"
echo "   PORT: $PORT"

# Seed the database
echo ""
echo "🌱 Seeding database with demo data..."
cd scripts
npx ts-node seedDatabase.ts
cd ..

# Start the backend server
echo ""
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start the frontend
echo ""
echo "💻 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 Demo is running!"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "📋 Test the following:"
echo "   1. Open http://localhost:5173 in your browser"
echo "   2. Register a new account"
echo "   3. Login with your credentials"
echo "   4. Browse available events"
echo "   5. Purchase tickets for an event"
echo "   6. Check your dashboard"
echo ""
echo "🛑 Press Ctrl+C to stop the demo"

# Wait for user to stop
trap "echo '🛑 Stopping demo...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait