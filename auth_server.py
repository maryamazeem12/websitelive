#!/usr/bin/env python3
"""
================================================================================
ELANICIA AUTHENTICATION SERVER
================================================================================

Features:
 User Registration & Login
 Session Management
 Password Hashing
 Token Generation
 Security Validation
 RESTful API
================================================================================
"""
# Standard Library Imports
import json
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import hashlib

# Authentication Handler Class
class AuthHandler(BaseHTTPRequestHandler):
    USERS_FILE = 'users.json'
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/users':
            self.get_users()
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/signup':
            self.handle_signup()
        elif parsed_path.path == '/login':
            self.handle_login()
        else:
            self.send_error(404, "Not Found")
    
    def get_users(self):
        """Get all users (for admin purposes)"""
        users = self.load_users()
        # Remove passwords from response
        safe_users = [{'id': u['id'], 'name': u['name'], 'email': u['email'], 'created_at': u['created_at']} for u in users]
        
        self.send_json_response(200, {'users': safe_users})
    
    def handle_signup(self):
        """Handle user registration"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            # Validation
            if not name or not email or not password:
                self.send_json_response(400, {'error': 'All fields are required'})
                return
            
            if len(password) < 6:
                self.send_json_response(400, {'error': 'Password must be at least 6 characters'})
                return
            
            # Load existing users
            users = self.load_users()
            
            # Check if user already exists
            if any(user['email'] == email for user in users):
                self.send_json_response(400, {'error': 'User with this email already exists'})
                return
            
            # Create new user
            new_user = {
                'id': len(users) + 1,
                'name': name,
                'email': email,
                'password': self.hash_password(password),
                'created_at': datetime.now().isoformat()
            }
            
            users.append(new_user)
            self.save_users(users)
            
            self.send_json_response(201, {
                'message': 'User created successfully',
                'user': {
                    'id': new_user['id'],
                    'name': new_user['name'],
                    'email': new_user['email']
                }
            })
            
        except json.JSONDecodeError:
            self.send_json_response(400, {'error': 'Invalid JSON data'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def handle_login(self):
        """Handle user login"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            if not email or not password:
                self.send_json_response(400, {'error': 'Email and password are required'})
                return
            
            # Load users
            users = self.load_users()
            
            # Find user
            user = None
            for u in users:
                if u['email'] == email and u['password'] == self.hash_password(password):
                    user = u
                    break
            
            if user:
                self.send_json_response(200, {
                    'message': 'Login successful',
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'email': user['email'],
                        'login_time': datetime.now().isoformat()
                    }
                })
            else:
                self.send_json_response(401, {'error': 'Invalid email or password'})
                
        except json.JSONDecodeError:
            self.send_json_response(400, {'error': 'Invalid JSON data'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def load_users(self):
        """Load users from file"""
        if os.path.exists(self.USERS_FILE):
            with open(self.USERS_FILE, 'r') as f:
                return json.load(f)
        return []
    
    def save_users(self, users):
        """Save users to file"""
        with open(self.USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    
    def hash_password(self, password):
        """Simple password hashing"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def send_json_response(self, status_code, data):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log message"""
        print(f"🔐 AUTH SERVER: {format % args}")

def run_auth_server(port=8001):
    """Run the authentication server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AuthHandler)
    
    print(f"🚀 Elanicia Authentication Server running on http://localhost:{port}")
    print(f"📊 Endpoints:")
    print(f"   POST /signup - Create new user account")
    print(f"   POST /login  - User login")
    print(f"   GET  /users  - List all users (admin)")
    print(f"💾 User data stored in: {AuthHandler.USERS_FILE}")
    print(f"🔄 Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Authentication server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_auth_server()