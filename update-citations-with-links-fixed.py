#!/usr/bin/env python3
import json
import re

# Read the current timeline data
with open('timeline-data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where timelineData array ends
timeline_end = -1
for i, line in enumerate(lines):
    if line.strip() == '];':
        timeline_end = i
        break

# Extract just the timeline data
timeline_lines = []
in_array = False
for i, line in enumerate(lines):
    if 'var timelineData = [' in line:
        in_array = True
        timeline_lines.append('[')
    elif in_array and i < timeline_end:
        timeline_lines.append(line)
    elif i == timeline_end:
        timeline_lines.append(']')
        break

array_str = ''.join(timeline_lines)
data = json.loads(array_str)

# Citation mappings with URLs (same as before)
citations = {
    "17th Century": [
        {"source": "Gipsy Hill Conservation Area Character Appraisal", "url": "https://www.lambeth.gov.uk/sites/default/files/pl-gipsy-hill-conservation-area-statement.pdf"},
        {"source": "Lambeth Archives", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"}
    ],
    "c. 1640": [
        {"source": "Wellcome Collection", "url": "https://wellcomecollection.org/"},
        {"source": "British Museum Archives", "url": "https://www.britishmuseum.org/collection"}
    ],
    "1668 (August 11)": [
        {"source": "The Diary of Samuel Pepys, August 11, 1668", "url": "https://www.pepysdiary.com/diary/1668/08/11/"}
    ],
    "1740 (October 24)": [
        {"source": "Gentleman's Magazine, 1740", "url": "https://www.british-history.ac.uk/"},
        {"source": "Parish Records, St. George's Church, Beckenham", "url": "https://www.stgeorgebeckenham.co.uk/"}
    ],
    "1768": [
        {"source": "Old Dulwich Cemetery Records", "url": "https://www.southwark.gov.uk/cemeteries/find-a-cemetery/dulwich-old-cemetery"}
    ],
    "1777": [
        {"source": "Theatre Royal Covent Garden Archives", "url": "https://www.roh.org.uk/about/history"}
    ],
    "1810": [
        {"source": "Enclosure Act Records", "url": "https://www.nationalarchives.gov.uk/"},
        {"source": "Surrey History Centre", "url": "https://www.surreycc.gov.uk/culture-and-leisure/history-centre"}
    ],
    "1832": [
        {"source": "Public Ledger and Daily Advertiser, April 12, 1832", "url": "https://www.britishnewspaperarchive.co.uk/"}
    ],
    "1847-1848": [
        {"source": "Surrey and East Kent Sewer Commission Records", "url": "https://www.nationalarchives.gov.uk/"}
    ],
    "1853 (August 4)": [
        {"source": "Parliamentary Acts, 1853", "url": "https://www.legislation.gov.uk/"}
    ],
    "1854": [
        {"source": "Crystal Palace Company Records", "url": "https://www.crystalpalacefoundation.org.uk/"},
        {"source": "Illustrated London News, 1854", "url": "https://www.britishnewspaperarchive.co.uk/"}
    ],
    "1856 (December 1)": [
        {"source": "West End of London and Crystal Palace Railway Company Records", "url": "https://www.railwayarchive.org.uk/"}
    ],
    "1858": [
        {"source": "Metropolitan Board of Works Records", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives"},
        {"source": "River Effra: South London's Secret Spine by Jon Newman", "url": "https://www.hive.co.uk/Product/Jon-Newman/River-Effra--South-Londons-Secret-Spine/21429934"}
    ],
    "1862": [
        {"source": "Parish Records, St Luke's Lower Norwood", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"}
    ],
    "1867": [
        {"source": "Church of England Records", "url": "https://www.churchofengland.org/more/libraries-and-archives"},
        {"source": "Lambeth Archives", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"}
    ],
    "1870": [
        {"source": "Crystal Palace Gas Company Records", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives"}
    ],
    "1870s-1890s": [
        {"source": "Kelly's Directory", "url": "https://leicester.contentdm.oclc.org/digital/collection/p16445coll4"},
        {"source": "Ordnance Survey Maps", "url": "https://maps.nls.uk/os/"}
    ],
    "1874": [
        {"source": "Annie Besant: An Autobiography", "url": "https://www.gutenberg.org/ebooks/12085"},
        {"source": "National Secular Society Archives", "url": "https://www.secularism.org.uk/"}
    ],
    "1875": [
        {"source": "London School Board Records", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives"}
    ],
    "1880 (April 12)": [
        {"source": "London School Board Records", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives"}
    ],
    "1881-1882": [
        {"source": "Baptist Union Archives", "url": "https://www.baptist.org.uk/"}
    ],
    "1887 (January 10)": [
        {"source": "London School Board Records", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives"}
    ],
    "1890": [
        {"source": "Lambeth Archives", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"},
        {"source": "Local newspaper reports", "url": "https://www.britishnewspaperarchive.co.uk/"}
    ],
    "1911 (May 12)": [
        {"source": "Railway Magazine", "url": "https://www.railwaymagazine.co.uk/"},
        {"source": "LBSCR Company Records", "url": "https://www.railwayarchive.org.uk/"}
    ],
    "1911 (June 14)": [
        {"source": "Lambeth Council Minutes", "url": "https://www.lambeth.gov.uk/"}
    ],
    "1920-1938": [
        {"source": "Census Records", "url": "https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/census-records/"},
        {"source": "Electoral Registers", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"}
    ],
    "1929 (September 22)": [
        {"source": "Southern Railway Magazine", "url": "https://www.railwayarchive.org.uk/"}
    ],
    "1939": [
        {"source": "Metropolitan Police Archives", "url": "https://www.met.police.uk/foi-ai/metropolitan-police/about-the-met/about-us/history-of-the-met/"}
    ],
    "1940-1941": [
        {"source": "London County Council Bomb Damage Maps", "url": "https://www.london.gov.uk/about-us/london-metropolitan-archives/collections/london-county-council-bomb-damage-maps"}
    ],
    "1948": [
        {"source": "Metropolitan Police Archives", "url": "https://www.met.police.uk/foi-ai/metropolitan-police/about-the-met/about-us/history-of-the-met/"}
    ],
    "1960s-1970s": [
        {"source": "Lambeth Planning Department Records", "url": "https://www.lambeth.gov.uk/"}
    ],
    "1963-1966": [
        {"source": "Civil Defence Records", "url": "https://www.nationalarchives.gov.uk/"}
    ],
    "1974": [
        {"source": "Lambeth Council Planning Committee Minutes", "url": "https://www.lambeth.gov.uk/"}
    ],
    "1978": [
        {"source": "Local Government Boundary Commission", "url": "https://www.lgbce.org.uk/"}
    ],
    "1981 (October 17)": [
        {"source": "The Times, October 18, 1981", "url": "https://www.thetimes.co.uk/archive/"},
        {"source": "Metropolitan Police Records", "url": "https://www.met.police.uk/"}
    ],
    "1982": [
        {"source": "Lambeth Archives", "url": "https://www.lambeth.gov.uk/arts-libraries-and-archives/lambeth-archives"},
        {"source": "Local newspaper reports", "url": "https://www.britishnewspaperarchive.co.uk/"}
    ],
    "1990 (February 14)": [
        {"source": "Rail Accident Investigation Branch", "url": "https://www.gov.uk/government/organisations/rail-accident-investigation-branch"}
    ],
    "2002": [
        {"source": "Local Government Boundary Commission", "url": "https://www.lgbce.org.uk/"}
    ],
    "2009 (January 1)": [
        {"source": "Local Government Boundary Commission", "url": "https://www.lgbce.org.uk/"},
        {"source": "Network Rail", "url": "https://www.networkrail.co.uk/"}
    ],
    "2011": [
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"}
    ],
    "2018": [
        {"source": "Friends of Gipsy Hill website", "url": "https://friendsofgipsyhill.org"},
        {"source": "Mayor of London's Office", "url": "https://www.london.gov.uk/"}
    ],
    "2019": [
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"}
    ],
    "2020": [
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"}
    ],
    "2021": [
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"}
    ],
    "2022": [
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"},
        {"source": "Electoral Commission", "url": "https://www.electoralcommission.org.uk/"}
    ],
    "2023": [
        {"source": "Department for Transport", "url": "https://www.gov.uk/government/organisations/department-for-transport"},
        {"source": "Friends of Gipsy Hill Research (Numerous Sources)", "url": "https://friendsofgipsyhill.org"}
    ],
    "2024-Present": [
        {"source": "Friends of Gipsy Hill website", "url": "https://friendsofgipsyhill.org"}
    ]
}

# Update each entry with citations
citation_number = 1
all_citations = []

for entry in data:
    date = entry.get("date", "")
    if date in citations:
        # Add superscript citation numbers to description
        citation_nums = []
        for i, citation_info in enumerate(citations[date]):
            citation_nums.append(str(citation_number))
            all_citations.append({
                "number": citation_number, 
                "source": citation_info["source"],
                "url": citation_info.get("url", "")
            })
            citation_number += 1
        
        # Add citation numbers to the end of description
        if citation_nums:
            sup_text = "<sup>" + ",".join(citation_nums) + "</sup>"
            entry["description"] = entry["description"].rstrip()
            if entry["description"].endswith("</sup>"):
                # Remove existing citation numbers
                entry["description"] = re.sub(r'<sup>[\d,]+</sup>$', '', entry["description"])
            entry["description"] = entry["description"] + sup_text
            entry["citations"] = citation_nums

# Create the updated JavaScript file
output = """// Timeline data with full content - Updated with research findings and citations
var timelineData = """
output += json.dumps(data, indent=2, ensure_ascii=False)
output += ";\n\n"

# Add the citations list
output += "// Citation sources with URLs\n"
output += "var timelineCitations = " + json.dumps(all_citations, indent=2, ensure_ascii=False) + ";\n"

# Write the updated file
with open('timeline-data.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Updated {citation_number - 1} citations with URLs")
print("Replaced 'Friends of Gipsy Hill Archives' with 'Friends of Gipsy Hill Research (Numerous Sources)'")