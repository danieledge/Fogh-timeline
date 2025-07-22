#!/usr/bin/env python3
import re

with open('timeline-data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed_lines = []
for line in lines:
    # Check if this is a description line
    if '"description": "' in line:
        # Extract the parts
        match = re.match(r'^(\s*"description": ")(.*)(",?\s*)$', line)
        if match:
            prefix = match.group(1)
            content = match.group(2)
            suffix = match.group(3)
            
            # Escape internal quotes
            content = content.replace('"', '\\"')
            
            fixed_lines.append(f'{prefix}{content}{suffix}')
        else:
            fixed_lines.append(line)
    else:
        fixed_lines.append(line)

with open('timeline-data.js', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("Fixed inner quotes in descriptions")