#!/bin/bash

echo "=========================================="
echo "Running Finance Tracker Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_PASSED=0
FRONTEND_PASSED=0

# Run backend tests
echo "=========================================="
echo "Backend Tests (Jest)"
echo "=========================================="
cd backend

if [ ! -d "node_modules" ]; then
  echo "${YELLOW}Installing backend dependencies...${NC}"
  npm install
fi

npm test
BACKEND_EXIT=$?

if [ $BACKEND_EXIT -eq 0 ]; then
  echo "${GREEN}✓ Backend tests passed${NC}"
  BACKEND_PASSED=1
else
  echo "${RED}✗ Backend tests failed${NC}"
fi

echo ""
cd ..

# Run frontend tests
echo "=========================================="
echo "Frontend Tests (Vitest)"
echo "=========================================="
cd frontend

if [ ! -d "node_modules" ]; then
  echo "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
fi

npm test
FRONTEND_EXIT=$?

if [ $FRONTEND_EXIT -eq 0 ]; then
  echo "${GREEN}✓ Frontend tests passed${NC}"
  FRONTEND_PASSED=1
else
  echo "${RED}✗ Frontend tests failed${NC}"
fi

echo ""
cd ..

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ $BACKEND_PASSED -eq 1 ]; then
  echo "${GREEN}✓ Backend: PASSED${NC}"
else
  echo "${RED}✗ Backend: FAILED${NC}"
fi

if [ $FRONTEND_PASSED -eq 1 ]; then
  echo "${GREEN}✓ Frontend: PASSED${NC}"
else
  echo "${RED}✗ Frontend: FAILED${NC}"
fi

echo ""

# Exit with appropriate code
if [ $BACKEND_PASSED -eq 1 ] && [ $FRONTEND_PASSED -eq 1 ]; then
  echo "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo "${RED}Some tests failed${NC}"
  exit 1
fi
