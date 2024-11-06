#!/bin/bash

# Exit on any error
set -e

# Configuration
APP_DIR="/home/fredp614/timesheet-app"
LOG_FILE="/var/log/timesheet-deploy.log"
APP_PORT=3001  # Changed port to avoid conflict

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_FILE"
}

# Start deployment
log_message "Starting deployment"

# Navigate to app directory
cd "$APP_DIR"
chmod 755 /home/fredp614/deploy.sh

# Pull latest changes
log_message "Pulling latest changes"
git pull origin main

# Install dependencies
log_message "Installing dependencies"
npm install --omit=dev

# Build React app
log_message "Building React application"
npm run build

# Update environment variables
log_message "Updating environment variables"
if [ -f .env.production ]; then
    cp .env.production .env
fi

# Restart the application using systemctl
log_message "Restarting application"
systemctl --user restart timesheet

log_message "Deployment completed successfully"