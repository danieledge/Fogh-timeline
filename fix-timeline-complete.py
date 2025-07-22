#!/usr/bin/env python3
import re
import json

with open('timeline-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract just the array part
start = content.find('[')
end = content.rfind(']') + 1
array_content = content[start:end]

# Replace all types of quotes with straight quotes
array_content = re.sub(r'[""″]', '"', array_content)
array_content = re.sub(r'[''′]', "'", array_content)
array_content = array_content.replace('…', '...')

# Try to parse and fix
try:
    # First attempt - try to parse as-is
    data = json.loads(array_content)
except:
    # If that fails, manually fix the JSON structure
    # Replace unquoted property names
    array_content = re.sub(r'\b(date|title|description|icon|image|imageCaption|imageCaptionHTML)\s*:', r'"\1":', array_content)
    
    # Escape quotes inside strings properly
    lines = array_content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Skip lines that don't contain string values
        if '": "' not in line:
            fixed_lines.append(line)
            continue
            
        # Find the string value part
        match = re.match(r'^(\s*"[^"]+"\s*:\s*)"(.*)(",?\s*)$', line)
        if match:
            prefix = match.group(1)
            value = match.group(2)
            suffix = match.group(3)
            
            # Escape internal quotes
            value = value.replace('"', '\\"')
            
            fixed_lines.append(f'{prefix}"{value}"{suffix}')
        else:
            fixed_lines.append(line)
    
    array_content = '\n'.join(fixed_lines)

# Write back the fixed content
with open('timeline-data.js', 'w', encoding='utf-8') as f:
    f.write('// Timeline data with full content - Updated with research findings\n')
    f.write('var timelineData = ')
    f.write(array_content)
    f.write(';\n')

print("Timeline data completely fixed!")