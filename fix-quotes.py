#!/usr/bin/env python3
import re

with open('timeline-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace curly quotes with straight quotes
content = content.replace('"', '"')
content = content.replace('"', '"')
content = content.replace(''', "'")
content = content.replace(''', "'")
content = content.replace('…', '...')

with open('timeline-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed curly quotes in timeline-data.js")