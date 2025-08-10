#!/usr/bin/env python3
import re
import json

# Read the timeline data
with open('timeline-data.js', 'r') as f:
    content = f.read()

# Category mapping - each entry with its new category
category_mappings = [
    # Culture
    ("Crystal Palace Opens", "1854", "Culture"),
    ("The Norwood Gypsies Pantomime", "1777", "Culture"),
    
    # Civic  
    ("Norwood Common Enclosed", "1810", "Civic"),
    ("Gipsy Hill Conservation Area Designated", "1974", "Civic"),
    ("Gipsy Hill Ward Created", "1978", "Civic"),
    ("Ward Boundary Revision", "2000", "Civic"),
    ("Current Ward Boundaries", "2009", "Civic"),
    ("Ward Boundary Revision", "2022", "Civic"),
    
    # Community
    ("Friends of Gipsy Hill Forms", "2018", "Community"),
    ("First Gipsy Hill Village Fete", "2019", "Community"),
    ("First Community Gipsy Hill Christmas Tree", "2020", "Community"),
    ("COVID-19 Mutual Aid", "2020", "Community"),
    ("Station Gardens Transform", "2022", "Community"),
    ("First Gipsy Hill Oktoberfest", "2022", "Community"),
    ("FoGH Mission Continues", "2024", "Community"),
    ("Fanny the Gipsy Hill Cat", "2011", "Community"),
    ("Brown & Green Café Opens", "2010", "Community"),
    
    # Development
    ("Kingswood Lodge Built", "1811", "Development"),
    ("The Paxton Hotel", "1855", "Development"),
    ("Long Meadow and Norwood Central Dairy", "1870", "Development"),
    ("Athol House Built", "1870", "Development"),
    ("United Land Co. Begins Development", "1871", "Development"),
    ("The 'Bovril Castle' Era", "1891", "Development"),
    ("The Vestey Family Era", "1919", "Development"),
    ("Kingswood Estate Built", "1946", "Development"),
    ("Central Hill Estate", "1967", "Development"),
    ("Athol House Heritage Refurbishment", "2023", "Development"),
    
    # Education
    ("Gipsy Hill Primary School", "1875", "Education"),
    ("Kingswood Primary School", "1880", "Education"),
    ("Paxton Primary School Opens", "1887", "Education"),
    ("Gipsy Hill Montessori College Opens", "1917", "Education"),
    
    # Gypsies
    ("Norwood Gypsies Settle", "1600", "Gypsies"),
    ("Margaret Finch Born", "1640", "Gypsies"),
    ("Pepys and Byron Visit the Gypsies", "1668", "Gypsies"),
    ("Death of the Gypsy Queen", "1740", "Gypsies"),
    ("Mother Bridget Succeeds as Queen of the Gypsies", "1740", "Gypsies"),
    ("Death of Mother Bridget", "1768", "Gypsies"),
    ("The Norwood Gypsies Pantomime", "1777", "Gypsies"),
    ("The Gypsy House Inn", "1778", "Gypsies"),
    
    # Heritage
    ("Annie Besant Residence", "1874", "Heritage"),
    ("Margaret Lockwood's Childhood Home", "1920", "Heritage"),
    ("World Cup Trophy Found by Pickles the Dog", "1966", "Heritage"),
    ("Kingswood House Nationally Listed", "1972", "Heritage"),
    ("Kingswood Arts Transformation", "2022", "Heritage"),
    ("Athol House Becomes First London Cheshire Home", "1953", "Heritage"),
    
    # Historical
    ("Roman Era - Forest Trackways", "43", "Historical"),
    ("Anglo-Saxon Boundaries", "410", "Historical"),
    ("Vicar's Oak and Beating the Bounds", "1583", "Historical"),
    
    # Services
    ("Trotting Hill Created", "1832", "Services"),
    ("River Effra Culverted & The Great Stink", "1847", "Services"),
    ("Gipsy Hill Police Station Built", "1854", "Services"),
    ("The Great Stink & River Effra", "1858", "Services"),
    ("Crystal Palace Gas Works", "1870", "Services"),
    ("Norwood Triangle Converted to Roundabout", "1960", "Services"),
    ("Wooden Bus Shelter at South Croxted Road", "1961", "Services"),
    ("Barclay's Bank Opens", "1867", "Services"),
    ("Police Station Operations Move", "1939", "Services"),
    ("Police Station Converted", "1948", "Services"),
    
    # Nature
    ("The Great North Wood", "11", "Nature"),
    ("Great Flood", "1890", "Nature"),
    ("Norwood Park Opens", "1911", "Nature"),
    
    # Railway
    ("Railway Construction Authorized", "1853", "Railway"),
    ("Railway Revolution", "1856", "Railway"),
    ("Railway Electrification", "1911", "Railway"),
    ("Railway Conversion Complete", "1929", "Railway"),
    ("Gipsy Hill Station Refurbishment", "2009", "Railway"),
    ("Railway Accident", "1990", "Railway"),
    ("British Railways Sign Returns Home", "2020", "Railway"),
    
    # Religious
    ("Gipsy Hill Iron Church Erected", "1862", "Religious"),
    ("Christ Church Built", "1867", "Religious"),
    ("Gipsy Road Baptist Church", "1881", "Religious"),
    ("Christ Church Fire", "1982", "Religious"),
    
    # Wartime
    ("WWI Canadian Military Hospital", "1915", "Wartime"),
    ("WWII Blitz", "1940", "Wartime"),
    ("Cold War Bunker at Pear Tree House", "1963", "Wartime"),
    ("IRA Bomb Incident", "1981", "Wartime")
]

# Track updates
updates_made = 0
not_found = []

# Process each mapping
for title, year, new_category in category_mappings:
    # Find entries with this title
    title_escaped = re.escape(title)
    
    # Pattern to match the entry and replace its category
    pattern = rf'("title":\s*"{title_escaped}"[^}}]*?"category":\s*)"[^"]*"'
    
    if re.search(pattern, content):
        content = re.sub(pattern, rf'\1"{new_category}"', content)
        updates_made += 1
        print(f"✓ Updated: {title} -> {new_category}")
    else:
        # Try alternative patterns
        pattern2 = rf'("date":\s*"[^"]*{year}[^"]*"[^}}]*?"title":\s*"{title_escaped}"[^}}]*?"category":\s*)"[^"]*"'
        if re.search(pattern2, content):
            content = re.sub(pattern2, rf'\1"{new_category}"', content)
            updates_made += 1
            print(f"✓ Updated: {title} -> {new_category}")
        else:
            not_found.append((title, year, new_category))

# Write updated content
with open('timeline-data.js', 'w') as f:
    f.write(content)

print(f"\n{'='*50}")
print(f"Updates applied: {updates_made}")
print(f"Not found: {len(not_found)}")

if not_found:
    print("\nEntries not found:")
    for title, year, category in not_found:
        print(f"  - {title} ({year}) -> {category}")

# Update category definitions
new_categories = '''var timelineCategories = {
    "Culture": {
        "name": "Culture",
        "color": "#9B59B6",
        "lightColor": "#BB7FCF",
        "description": "Cultural events and entertainment"
    },
    "Civic": {
        "name": "Civic",
        "color": "#3498DB",
        "lightColor": "#5DADE2",
        "description": "Government and administrative changes"
    },
    "Community": {
        "name": "Community",
        "color": "#E67E22",
        "lightColor": "#F39C12",
        "description": "Community groups and events"
    },
    "Development": {
        "name": "Development",
        "color": "#95A5A6",
        "lightColor": "#BDC3C7",
        "description": "Buildings and development"
    },
    "Education": {
        "name": "Education",
        "color": "#F39C12",
        "lightColor": "#F7DC6F",
        "description": "Schools and educational institutions"
    },
    "Gypsies": {
        "name": "Gypsies",
        "color": "#8E44AD",
        "lightColor": "#AF7AC5",
        "description": "Romani community history"
    },
    "Heritage": {
        "name": "Heritage",
        "color": "#D35400",
        "lightColor": "#E67E22",
        "description": "Historic figures and preservation"
    },
    "Historical": {
        "name": "Historical",
        "color": "#7F8C8D",
        "lightColor": "#95A5A6",
        "description": "Ancient and medieval history"
    },
    "Services": {
        "name": "Services",
        "color": "#34495E",
        "lightColor": "#5D6D7E",
        "description": "Public works and utilities"
    },
    "Nature": {
        "name": "Nature",
        "color": "#27AE60",
        "lightColor": "#52BE80",
        "description": "Natural environment and parks"
    },
    "Railway": {
        "name": "Railway",
        "color": "#E74C3C",
        "lightColor": "#EC7063",
        "description": "Railway development and transport"
    },
    "Religious": {
        "name": "Religious",
        "color": "#16A085",
        "lightColor": "#48C9B0",
        "description": "Churches and religious institutions"
    },
    "Wartime": {
        "name": "Wartime",
        "color": "#C0392B",
        "lightColor": "#E74C3C",
        "description": "Wars and military events"
    }
};
'''

# Replace the category definitions in the file
content = re.sub(r'var timelineCategories = \{[^}]+\}[^}]+\}[^}]+\};', new_categories, content, flags=re.DOTALL)

# Write final content
with open('timeline-data.js', 'w') as f:
    f.write(content)

print("\n✓ Category definitions updated")
print("✓ All changes complete!")