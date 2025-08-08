#!/usr/bin/env python3
"""
HTTP Server with cache control headers for development
"""

import http.server
import socketserver
import os
from datetime import datetime

PORT = 8080
HOST = "0.0.0.0"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add cache control headers for JS/CSS files
        if self.path.endswith(('.js', '.css')):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        # Allow normal caching for images
        elif self.path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        # No cache for HTML
        elif self.path.endswith('.html') or self.path == '/':
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        # CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Add timestamp to log messages
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

# Change to script directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"Starting Gipsy Hill Timeline server on {HOST}:{PORT}")
print(f"Server will be accessible at http://<your-ip>:{PORT}")
print("Cache control enabled: JS/CSS files won't be cached")
print("Press Ctrl+C to stop\n")

with socketserver.TCPServer((HOST, PORT), NoCacheHTTPRequestHandler) as httpd:
    httpd.serve_forever()