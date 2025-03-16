#!/bin/bash
# Start script for Velora app

echo "Starting Velora Stock Trading Platform..."

# Create needed directories if they don't exist
mkdir -p data models predictions charts

# Check if we need to create sample data
if [ ! -f data/merged_data.csv ]; then
    echo "Generating sample data..."
    python merge.py
fi

# Check if Python dependencies are installed
if ! command -v uvicorn &> /dev/null; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI backend
echo "Starting backend server..."
uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for the backend to start
echo "Waiting for backend to start..."
sleep 3

echo "Velora app is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: Open index.html in your browser"
echo
echo "Press Ctrl+C to stop servers"

# Function to kill processes on exit
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    echo "Servers stopped"
    exit
}

# Set trap to cleanup on exit
trap cleanup SIGINT

# Keep script running
while true; do
    sleep 1
done
