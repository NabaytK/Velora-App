#!/bin/bash

echo "===== Velora App Enhancement Script ====="
echo "This script will enhance the app with real-time data"
echo "while maintaining compatibility with the existing website."

# Check if the final enhanced app exists
if [ -f "enhanced_final_app.py" ]; then
    # Create a backup of the original app
    if [ ! -f "app.py.original" ]; then
        echo "Creating backup of original app.py..."
        cp app.py app.py.original
        echo "Backup saved as app.py.original"
    fi
    
    echo "Applying all enhancements..."
    cp enhanced_final_app.py app.py
    echo "✅ Enhancements applied successfully!"
    
    echo -e "\nRestarting server..."
    # Kill the current server (if any)
    pkill -f "python app.py" || true
    # Start the server
    nohup python app.py > server.log 2>&1 &
    echo "✅ Server restarted with enhanced app!"
    
    echo -e "\nThe website should now show real-time data."
    echo "If you experience any issues, you can roll back using:"
    echo "  cp app.py.original app.py"
    echo "  pkill -f 'python app.py'"
    echo "  python app.py"
else
    echo "❌ Enhanced app file not found. Run the enhancement scripts first."
fi
