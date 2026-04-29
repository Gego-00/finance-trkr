#!/bin/bash

echo "========================================"
echo "Finance Tracker - Starting Application"
echo "========================================"
echo ""

# Clean up old containers if they exist
echo "Cleaning up old containers..."
docker-compose down -v

echo ""
echo "Building and starting containers..."
docker-compose up --build -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "========================================"
echo "Application is ready!"
echo "========================================"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
