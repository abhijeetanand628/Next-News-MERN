#!/bin/bash

# ==============================================================================
# AWS EC2 (Ubuntu t2.micro) Deployment Script for Next News Backend
# ==============================================================================
# Run this script on your EC2 instance after SSH-ing into it.
# E.g. chmod +x deploy.sh && ./deploy.sh
# ==============================================================================

echo "Starting EC2 Setup for Next News Backend..."

# 1. Update system packages
echo "Updating packages..."
sudo apt update -y
sudo apt upgrade -y

# 2. Install Node.js (Version 20.x)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Git
echo "Installing Git..."
sudo apt install git -y

# 4. Install PM2 globally (Process Manager to keep the app running forever)
echo "Installing PM2..."
sudo npm install -g pm2

echo "==========================================================="
echo "✅ EC2 Environment Setup Complete!"
echo "==========================================================="
echo ""
echo "Next Steps to launch your backend:"
echo "1. Git clone your repository:"
echo "   git clone https://github.com/your-username/Next-News-MERN.git"
echo "2. Navigate to the backend folder:"
echo "   cd Next-News-MERN/backend"
echo "3. Install dependencies:"
echo "   npm install"
echo "4. Create your .env file with your AWS and MongoDB credentials:"
echo "   nano .env"
echo "5. Start the server using PM2:"
echo "   pm2 start server.js --name nextnews-backend"
echo "6. Ensure it restarts on system reboot:"
echo "   pm2 startup ubuntu"
echo "   pm2 save"
echo "==========================================================="
