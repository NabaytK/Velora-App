#!/usr/bin/env python3
import os
import sys

print("Current working directory:", os.getcwd())
print("\nChecking app.py files:")

# Check main app.py
if os.path.exists("app.py"):
    size = os.path.getsize("app.py")
    print(f"app.py exists (size: {size} bytes)")
else:
    print("app.py not found")

# Check backend/app.py
if os.path.exists("backend/app.py"):
    size = os.path.getsize("backend/app.py")
    print(f"backend/app.py exists (size: {size} bytes)")
else:
    print("backend/app.py not found")

# Check which one is being imported
print("\nChecking which app.py is imported:")
os.system("ps aux | grep 'python.*app.py'")
