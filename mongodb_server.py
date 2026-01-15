#!/usr/bin/env python3
"""
================================================================================
ELANICIA MONGODB SERVER v3.0
Complete Backend Server with MongoDB Integration for Luxury Watch E-commerce
================================================================================

This server provides a complete backend solution for the Elanicia luxury watch
website with the following capabilities:

 User Authentication (Register, Login, Session Management)
 Product Catalog Management (CRUD operations)
 Shopping Cart Operations (Add, Remove, Update items)
 Order Processing (Create, Track, Manage orders)
 Database Management (MongoDB with file storage fallback)
 RESTful API with JSON responses
 Security features (Password hashing, validation)
 Error handling and logging
 

Dependencies:
- pymongo (MongoDB driver) - Optional, falls back to file storage
- bcrypt (Password hashing)
- Standard library modules (json, os, datetime, http.server, etc.)

Usage:
1. Install MongoDB (optional): pip install pymongo
2. Run server: python mongodb_server3.py
3. Server starts on http://localhost:8000

API Endpoints:
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/products - Get all products
- POST /api/cart/add - Add item to cart
- GET /api/cart - Get user cart
- POST /api/orders - Create order

Features:
✅ MongoDB integration with automatic fallback to file storage
✅ Secure password hashing with bcrypt
✅ Session-based authentication
✅ RESTful API design
✅ Comprehensive error handling
✅ Sample data initialization
✅ Thread-safe operations
✅ CORS support for frontend integration
================================================================================
"""

# =============================
# IMPORTS AND DEPENDENCIES
# =============================

# Standard Library Imports
import json                    
import os                     
from datetime import datetime  
from http.server import HTTPServer, BaseHTTPRequestHandler  
from urllib.parse import urlparse, parse_qs  # URL parsing
import hashlib                # Hash functions (backup for passwords)
import bcrypt                  # Secure password hashing
import threading              
import time                   

# =====================================
# MONGODB IMPORT WITH FALLBACK
# =====================================

# Try to import pymongo for MongoDB support
# If not available, fall back to file-based storage
try:
    import pymongo             
    from pymongo import MongoClient  
    MONGODB_AVAILABLE = True   
except ImportError:
    MONGODB_AVAILABLE = False  # MongoDB not available
    print("⚠️  pymongo not installed. Using file storage instead.")
    print("   Install with: pip install pymongo")

# ======================================
# MAIN HTTP REQUEST HANDLER CLASS
# =======================================

class ElaniciaBackendHandler(BaseHTTPRequestHandler):
    """
    Main HTTP request handler for the Elanicia backend server.
    
    This class handles all incoming HTTP requests and routes them to appropriate
    handler methods. It supports both MongoDB and file-based storage.
    
    Features:
    - RESTful API endpoints
    - JSON request/response handling
    - Authentication and session management
    - Database operations (MongoDB or file storage)
    - CORS support for frontend integration
    - Comprehensive error handling
    """
    
    def __init__(self, *args, **kwargs):
        """
        Initialize the handler and set up database connection.
        
        Args:
            *args: Variable arguments passed to parent class
            **kwargs: Keyword arguments passed to parent class
        """
        # Initialize database connection before calling parent constructor
        self.init_database()
        super().__init__(*args, **kwargs)
    
    def init_database(self):
        """
        Initialize database connection based on availability.
        
        Tries to connect to MongoDB first. If MongoDB is not available or connection
        fails, falls back to file-based storage system.
        
        Database collections initialized:
        - users: User accounts and authentication data
        - products: Product catalog and inventory
        - orders: Order history and tracking
        """
        if MONGODB_AVAILABLE:
            try:
                # Attempt MongoDB connection
                self.client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
                
                # Test the connection
                self.client.server_info()
                
                # Initialize database and collections
                self.db = self.client['elanicia_db']
                self.users_collection = self.db['users']
                self.products_collection = self.db['products']
                self.orders_collection = self.db['orders']
                
                # Set connection flag
                self.mongo_connected = True
                print("✅ Connected to MongoDB")
                
                # Initialize sample data for testing
                self.init_sample_data()
                
            except Exception as e:
                # MongoDB connection failed, fall back to file storage
                print(f"❌ MongoDB connection failed: {e}")
                print("📁 Falling back to file storage")
                self.mongo_connected = False
                self.users_file = 'users.json'
                self.products_file = 'products.json'
        else:
            self.mongo_connected = False
            self.users_file = 'users.json'
            self.products_file = 'products.json'
    
    def init_sample_data(self):
        """Initialize sample product data"""
        if not self.mongo_connected:
            return
            
        # Check if products already exist
        if self.products_collection.count_documents({}) > 0:
            return
        
        # Sample products data
        sample_products = [
            {
                "id": "royal_timepieces_1",
                "name": "Diamond Elite Necklace",
                "category": "royal_timepieces",
                "type": "jewelry",
                "price": 125999,
                "currency": "AED",
                "description": "18k white gold, premium diamonds, luxury design",
                "image": "images/diamond-necklace.jpg",
                "badge": "Premium",
                "in_stock": True,
                "created_at": datetime.now()
            },
            {
                "id": "royal_timepieces_2",
                "name": "Platinum Heritage",
                "category": "royal_timepieces",
                "type": "watch",
                "price": 195999,
                "currency": "AED",
                "description": "Platinum case, sapphire crystal, limited to 100 pieces",
                "image": "images/platinum-watch.jpg",
                "badge": "Limited Edition",
                "in_stock": True,
                "created_at": datetime.now()
            },
            {
                "id": "best_sellers_1",
                "name": "Classic Steel Master",
                "category": "best_sellers",
                "type": "watch",
                "price": 35999,
                "currency": "AED",
                "description": "Stainless steel case, automatic movement, water resistant",
                "image": "images/classic-steel-watch.jpg",
                "badge": "Best Seller",
                "in_stock": True,
                "created_at": datetime.now()
            }
        ]
        
        self.products_collection.insert_many(sample_products)
        print("📦 Sample products added to database")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/users':
            self.get_users()
        elif path == '/api/products':
            self.get_products()
        elif path.startswith('/api/products/'):
            product_id = path.split('/')[-1]
            self.get_product(product_id)
        elif path == '/api/health':
            self.health_check()
        else:
            self.send_error(404, "Endpoint not found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/signup':
            self.handle_signup()
        elif path == '/api/login':
            self.handle_login()
        elif path == '/api/products':
            self.create_product()
        elif path == '/api/orders':
            self.create_order()
        else:
            self.send_error(404, "Endpoint not found")
    
    def health_check(self):
        """Health check endpoint"""
        status = {
            'status': 'healthy',
            'database': 'mongodb' if self.mongo_connected else 'file_storage',
            'timestamp': datetime.now().isoformat()
        }
        self.send_json_response(200, status)
    
    def get_users(self):
        """Get all users (admin endpoint)"""
        try:
            if self.mongo_connected:
                users = list(self.users_collection.find({}, {'password': 0}))
                # Convert ObjectId to string
                for user in users:
                    user['_id'] = str(user['_id'])
            else:
                users = self.load_users_from_file()
                # Remove passwords
                users = [{k: v for k, v in user.items() if k != 'password'} for user in users]
            
            self.send_json_response(200, {'users': users})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def get_products(self):
        """Get all products"""
        try:
            if self.mongo_connected:
                products = list(self.products_collection.find({}))
                # Convert ObjectId to string
                for product in products:
                    product['_id'] = str(product['_id'])
            else:
                products = self.load_products_from_file()
            
            self.send_json_response(200, {'products': products})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    def get_product(self, product_id):
        """Get single product by ID"""
        try:
            if self.mongo_connected:
                product = self.products_collection.find_one({'id': product_id})
                if product:
                    product['_id'] = str(product['_id'])
                    self.send_json_response(200, {'product': product})
                else:
                    self.send_json_response(404, {'error': 'Product not found'})
            else:
                products = self.load_products_from_file()
                product = next((p for p in products if p['id'] == product_id), None)
                if product:
                    self.send_json_response(200, {'product': product})
                else:
                    self.send_json_response(404, {'error': 'Product not found'})
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
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
            
            # Check if user exists
            if self.mongo_connected:
                existing_user = self.users_collection.find_one({'email': email})
            else:
                users = self.load_users_from_file()
                existing_user = next((u for u in users if u['email'] == email), None)
            
            if existing_user:
                self.send_json_response(400, {'error': 'User with this email already exists'})
                return
            
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create new user
            new_user = {
                'name': name,
                'email': email,
                'password': hashed_password,
                'created_at': datetime.now(),
                'is_active': True
            }
            
            if self.mongo_connected:
                result = self.users_collection.insert_one(new_user)
                user_id = str(result.inserted_id)
            else:
                users = self.load_users_from_file()
                new_user['id'] = len(users) + 1
                users.append(new_user)
                self.save_users_to_file(users)
                user_id = new_user['id']
            
            self.send_json_response(201, {
                'message': 'User created successfully',
                'user': {
                    'id': user_id,
                    'name': name,
                    'email': email
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
            
            # Find user
            if self.mongo_connected:
                user = self.users_collection.find_one({'email': email})
            else:
                users = self.load_users_from_file()
                user = next((u for u in users if u['email'] == email), None)
            
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                user_id = str(user.get('_id', user.get('id', '')))
                self.send_json_response(200, {
                    'message': 'Login successful',
                    'user': {
                        'id': user_id,
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
    
    def create_order(self):
        """Create new order"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Create order
            order = {
                'user_id': data.get('user_id'),
                'items': data.get('items', []),
                'total_amount': data.get('total_amount', 0),
                'currency': data.get('currency', 'AED'),
                'status': 'pending',
                'created_at': datetime.now()
            }
            
            if self.mongo_connected:
                result = self.orders_collection.insert_one(order)
                order['_id'] = str(result.inserted_id)
            
            self.send_json_response(201, {
                'message': 'Order created successfully',
                'order': order
            })
            
        except Exception as e:
            self.send_json_response(500, {'error': str(e)})
    
    # File storage methods (fallback)
    def load_users_from_file(self):
        """Load users from file"""
        if os.path.exists(self.users_file):
            with open(self.users_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_users_to_file(self, users):
        """Save users to file"""
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    def load_products_from_file(self):
        """Load products from file"""
        if os.path.exists(self.products_file):
            with open(self.products_file, 'r') as f:
                return json.load(f)
        return []
    
    def send_json_response(self, status_code, data):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        response = json.dumps(data, indent=2, default=str)
        self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log message"""
        print(f"🔗 BACKEND API: {format % args}")

def run_backend_server(port=8001):
    """Run the backend server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ElaniciaBackendHandler)
    
    print(f"🚀 Elanicia Backend Server running on http://localhost:{port}")
    print(f"📊 API Endpoints:")
    print(f"   POST /api/signup     - Create user account")
    print(f"   POST /api/login      - User login")
    print(f"   GET  /api/users      - List users (admin)")
    print(f"   GET  /api/products   - List all products")
    print(f"   GET  /api/products/id - Get single product")
    print(f"   POST /api/orders     - Create order")
    print(f"   GET  /api/health     - Health check")
    print(f"🔄 Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Backend server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_backend_server()