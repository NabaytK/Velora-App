#!/bin/bash
# Script to train models and then start the Velora app

echo "==== Velora Stock Trading Platform ====="

# Create needed directories if they don't exist
mkdir -p data models predictions charts

# Install missing dependencies
echo "Installing necessary dependencies..."
pip install tensorflow uvicorn fastapi

# Create test data if needed
if [ ! -f data/stock_data.csv ]; then
    echo "Generating sample data..."
    python create_test_data.py
fi

# Now try to run merge.py if merged_data.csv doesn't exist
if [ ! -f data/merged_data.csv ]; then
    echo "Merging data..."
    python merge.py
fi

# Train the models
echo "==== Training LSTM Models ====="
python train_set.py

echo "==== Training Complete ====="
echo "Starting the application..."

# Start the FastAPI backend
echo "Starting backend server..."
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
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
