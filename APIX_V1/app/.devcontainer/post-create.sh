#!/bin/bash

# Install Python dependencies
python3 -m pip install --upgrade pip
pip install -r requirements.txt || echo "No requirements.txt found, skipping Python dependencies"

# Install npm dependencies
npm install

# Setup any environment variables
echo "Setting up environment variables..."
echo "PORT=3000" >> .env

# Start the application in development mode
echo "Environment setup complete. You can start the application with 'npm run dev'"