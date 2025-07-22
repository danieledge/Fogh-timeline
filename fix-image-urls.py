#!/usr/bin/env python3
import re

# Read the current timeline data
with open('timeline-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the image URLs - remove the /thumb/ and size prefix for direct image access
replacements = [
    # Annie Besant - use direct URL
    ('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Annie_Besant_plaque.JPG/400px-Annie_Besant_plaque.JPG',
     'https://upload.wikimedia.org/wikipedia/commons/c/ca/Annie_Besant_plaque.JPG'),
    
    # Margaret Lockwood - already correct format
    
    # Former police station - already correct format
    
    # Railway station - already correct format
    
    # Central Hill Estate - already correct format
]

for old_url, new_url in replacements:
    content = content.replace(old_url, new_url)

# Write back
with open('timeline-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed image URLs")