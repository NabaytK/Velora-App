#!/bin/bash
echo "Starting Velora Stock Trading Platform..."

# Create needed directories if they don't exist
mkdir -p data models predictions charts static

# Check if data exists and create test data if needed
if [ ! -f data/stock_data.csv ]; then
    echo "Generating sample data..."
    python create_test_data.py
    echo "Merging data..."
    python merge.py
fi

# Copy static files if they don't exist in static directory
if [ ! -f static/styles.css ]; then
    echo "Setting up static files..."
    cp styles.css static/styles.css
    cp main.js static/main.js
fi

# Start the FastAPI backend
echo "Starting backend server..."
python app.py

echo "Velora app is running at http://localhost:8000"
