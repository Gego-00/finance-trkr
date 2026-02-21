#!/bin/bash

echo "========================================"
echo "Running Backend Tests"
echo "========================================"
echo ""

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Run tests
echo "Running Jest tests..."
npm test

EXIT_CODE=$?

echo ""
echo "========================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ Backend tests PASSED"
else
  echo "✗ Backend tests FAILED"
fi
echo "========================================"

exit $EXIT_CODE
