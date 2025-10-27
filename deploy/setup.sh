#!/bin/bash

# SandboxVTT Server Setup Script for Ubuntu
# This script sets up a fresh Ubuntu server for running SandboxVTT

set -e  # Exit on error

echo "=========================================="
echo "SandboxVTT Server Setup"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install git if not present
echo "Installing git..."
sudo apt install -y git

# Install nginx (optional, for reverse proxy)
echo "Installing nginx..."
sudo apt install -y nginx

# Create application directory
APP_DIR="/var/www/sandboxvtt"
echo "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Create logs directory
echo "Creating logs directory..."
mkdir -p $APP_DIR/logs

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p $APP_DIR/server/uploads

# Set up PM2 to start on system boot
echo "Configuring PM2 startup..."
pm2 startup | tail -n 1 | sudo bash

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP (nginx)
sudo ufw allow 8080/tcp  # Application port (adjust if needed)
sudo ufw --force enable

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repository to $APP_DIR"
echo "   cd $APP_DIR"
echo "   git clone <your-repo-url> ."
echo ""
echo "2. Copy and configure your .env.production file"
echo "   cp .env.production .env"
echo "   nano .env  # Edit with your server IP and settings"
echo ""
echo "3. Run the deployment script:"
echo "   bash deploy/deploy.sh"
echo ""