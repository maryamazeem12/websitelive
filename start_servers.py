#!/usr/bin/env python3
"""
Start both the web server and MongoDB backend server for Elanicia
"""

import subprocess
import sys
import time
import threading
import os
import signal

def run_web_server():
    """Run the main web server on port 8000"""
    print("🌐 Starting Web Server on port 8000...")
    try:
        subprocess.run([sys.executable, "server.py"], check=True)
    except KeyboardInterrupt:
        print("🌐 Web server stopped")

def run_backend_server():
    """Run the MongoDB backend server on port 8001"""
    print("🔗 Starting Backend Server on port 8001...")
    try:
        subprocess.run([sys.executable, "mongodb_server.py"], check=True)
    except KeyboardInterrupt:
        print("🔗 Backend server stopped")

def install_requirements():
    """Install required Python packages"""
    print("📦 Checking required packages...")
    
    try:
        import pymongo
        import bcrypt
        print("✅ All packages already installed")
        return True
    except ImportError:
        print("📦 Installing required packages...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "pymongo", "bcrypt"], check=True)
            print("✅ Packages installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages")
            print("💡 Please install manually: pip install pymongo bcrypt")
            return False

def main():
    print("🚀 Starting Elanicia Full-Stack Application")
    print("=" * 60)
    
    # Install requirements
    if not install_requirements():
        print("⚠️  Continuing without MongoDB support...")
        time.sleep(2)
    
    print("\n🔧 Starting servers...")
    print("📍 Web Server: http://localhost:8000")
    print("📍 Backend API: http://localhost:8001")
    print("📍 Auth Page: http://localhost:8000/auth_backend.html")
    print("=" * 60)
    
    # Start web server in a separate thread
    web_thread = threading.Thread(target=run_web_server, daemon=True)
    web_thread.start()
    
    # Give web server time to start
    time.sleep(2)
    
    # Start backend server in main thread
    try:
        run_backend_server()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()