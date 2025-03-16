#!/bin/bash

echo "===== Velora App Rollback Script ====="

if [ -f "app.py.original" ]; then
    echo "Rolling back to original app.py..."
    
    # Kill the current server
    pkill -f "python app.py" || true
    
    # Restore original app
    cp app.py.original app.py
    
    # Restart the server
    nohup python app.py > server.log 2>&1 &
    
    echo "✅ Rollback complete and server restarted!"
else
    echo "❌ Original app backup not found. Cannot roll back."
fi
