#!/bin/bash

# TypeRacer Backend Startup Script

echo "🏁 Starting TypeRacer Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env created. Please edit it with your actual values."
        echo ""
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🚀 Starting development server..."
npm run dev

