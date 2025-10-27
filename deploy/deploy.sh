#!/bin/bash

# SandboxVTT Deployment Script
# This script builds and deploys the application

set -e  # Exit on error

echo "=========================================="
echo "SandboxVTT Deployment"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy .env.production to .env and configure it with your settings."
    exit 1
fi

# Install server dependencies
echo "Installing server dependencies..."
npm install --omit=dev

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

# Build client
echo "Building client application..."
npm run build

# Check if build was successful
if [ ! -d "client/dist" ]; then
    echo "ERROR: Client build failed - dist directory not found!"
    exit 1
fi

echo "Build successful!"

# Stop existing PM2 process if running
echo "Stopping existing application..."
pm2 stop sandboxvtt || true
pm2 delete sandboxvtt || true

# Start application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo "Saving PM2 process list..."
pm2 save

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="

# Display application info
echo ""
echo "Application Status:"
pm2 status

echo ""
echo "To view logs:"
echo "  pm2 logs sandboxvtt"
echo ""
echo "To monitor the app:"
echo "  pm2 monit"
echo ""
echo "To restart the app:"
echo "  pm2 restart sandboxvtt"
echo ""

# Get server info from .env
SERVER_IP=$(grep SERVER_IP .env | cut -d '=' -f2)
PUBLIC_PORT=$(grep PUBLIC_CLIENT_PORT .env | cut -d '=' -f2)

if [ -n "$SERVER_IP" ] && [ -n "$PUBLIC_PORT" ]; then
    echo "Application should be accessible at:"
    echo "  http://$SERVER_IP:$PUBLIC_PORT"
fi

echo ""