#!/bin/bash

echo ""
echo "========================================"
echo "   MANTAEVERT APP - QUICK START"
echo "========================================"
echo ""

echo "[1/4] Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "[2/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "[3/4] Seeding database with sample data..."
npm run seed
if [ $? -ne 0 ]; then
    echo "WARNING: Database seeding failed (this is OK if already seeded)"
fi

echo ""
echo "[4/4] Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo ""
echo "Backend server started (PID: $BACKEND_PID)..."
echo "Waiting 5 seconds for server to initialize..."
sleep 5

cd ..
echo ""
echo "Starting frontend app..."
echo ""
echo "========================================"
echo "   LOGIN CREDENTIALS:"
echo "========================================"
echo "   Admin: admin@mantaevert.com / admin123"
echo "   Worker: john.doe@mantaevert.com / worker123"
echo "========================================"
echo ""

npm start