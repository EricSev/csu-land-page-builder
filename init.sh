#!/bin/bash

# CSU Landing Page Builder - Development Environment Setup Script
# This script initializes the development environment for the CSU Landing Page Builder

set -e

echo "=========================================="
echo "CSU Landing Page Builder - Setup Script"
echo "=========================================="
echo ""

# Check for Node.js (required: 18+)
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js version must be 18 or higher!"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js version: $(node -v) - OK"

# Check for npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi
echo "npm version: $(npm -v) - OK"

echo ""
echo "Installing dependencies..."
echo "=========================================="

# Install dependencies
npm install

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo ""
echo "    npm run dev"
echo ""
echo "The application will be available at:"
echo "    http://localhost:5173"
echo ""
echo "Other available commands:"
echo "    npm run build    - Build for production"
echo "    npm run preview  - Preview production build"
echo "    npm run lint     - Run ESLint"
echo ""
echo "=========================================="
