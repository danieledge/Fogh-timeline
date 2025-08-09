import re

with open('timeline-data.js', 'r') as f:
    content = f.read()

# Split into entries
entries = content.split('\n{')

for entry in entries:
    # Skip if not a complete entry
    if '"date"' not in entry:
        continue
    
    # Extract date
    date_match = re.search(r'"date":\s*"([^"]+)"', entry)
    if not date_match:
        continue
    date = date_match.group(1)
    
    # Skip Roman/Anglo-Saxon entries
    if 'AD' in date or '11th-19th' in date:
        continue
    
    # Skip entries after 2000
    year_match = re.search(r'(\d{4})', date)
    if year_match:
        year = int(year_match.group(1))
        if year > 2000:
            continue
    
    # Check if has image
    has_image = '"image"' in entry or '"images"' in entry
    
    if not has_image:
        # Extract title
        title_match = re.search(r'"title":\s*"([^"]+)"', entry)
        if title_match:
            title = title_match.group(1)
            print(f"{date} - {title}")

