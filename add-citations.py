#!/usr/bin/env python3
import json
import re

# Read the current timeline data
with open('timeline-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the array part
start = content.find('[')
end = content.rfind(']') + 1
array_str = content[start:end]

# Parse the JSON
data = json.loads(array_str)

# Citation mappings for various entries
citations = {
    "17th Century": ["Gipsy Hill Conservation Area Character Appraisal", "Lambeth Archives"],
    "c. 1640": ["Wellcome Collection", "British Museum Archives"],
    "1668 (August 11)": ["The Diary of Samuel Pepys, August 11, 1668"],
    "1740 (October 24)": ["Gentleman's Magazine, 1740", "Parish Records, St. George's Church, Beckenham"],
    "1768": ["Old Dulwich Cemetery Records"],
    "1777": ["Theatre Royal Covent Garden Archives"],
    "1810": ["Enclosure Act Records", "Surrey History Centre"],
    "1832": ["Public Ledger and Daily Advertiser, April 12, 1832"],
    "1847-1848": ["Surrey and East Kent Sewer Commission Records"],
    "1853 (August 4)": ["Parliamentary Acts, 1853"],
    "1854": ["Crystal Palace Company Records", "Illustrated London News, 1854"],
    "1856 (December 1)": ["West End of London and Crystal Palace Railway Company Records"],
    "1858": ["Metropolitan Board of Works Records", "River Effra: South London's Secret Spine by Jon Newman"],
    "1862": ["Parish Records, St Luke's Lower Norwood"],
    "1867": ["Church of England Records", "Lambeth Archives"],
    "1870": ["Crystal Palace Gas Company Records"],
    "1870s-1890s": ["Kelly's Directory", "Ordnance Survey Maps"],
    "1874": ["Annie Besant: An Autobiography", "National Secular Society Archives"],
    "1875": ["London School Board Records"],
    "1880 (April 12)": ["London School Board Records"],
    "1881-1882": ["Baptist Union Archives"],
    "1887 (January 10)": ["London School Board Records"],
    "1890": ["Lambeth Archives", "Local newspaper reports"],
    "1911 (May 12)": ["Railway Magazine", "LBSCR Company Records"],
    "1911 (June 14)": ["Lambeth Council Minutes"],
    "1920-1938": ["Census Records", "Electoral Registers"],
    "1929 (September 22)": ["Southern Railway Magazine"],
    "1939": ["Metropolitan Police Archives"],
    "1940-1941": ["London County Council Bomb Damage Maps"],
    "1948": ["Metropolitan Police Archives"],
    "1960s-1970s": ["Lambeth Planning Department Records"],
    "1963-1966": ["Civil Defence Records"],
    "1974": ["Lambeth Council Planning Committee Minutes"],
    "1978": ["Local Government Boundary Commission"],
    "1981 (October 17)": ["The Times, October 18, 1981", "Metropolitan Police Records"],
    "1982": ["Lambeth Archives", "Local newspaper reports"],
    "1990 (February 14)": ["Rail Accident Investigation Branch"],
    "2002": ["Local Government Boundary Commission"],
    "2009 (January 1)": ["Local Government Boundary Commission", "Network Rail"],
    "2011": ["Friends of Gipsy Hill Archives"],
    "2018": ["Friends of Gipsy Hill website", "Mayor of London's Office"],
    "2019": ["Friends of Gipsy Hill Archives"],
    "2020": ["Friends of Gipsy Hill Archives"],
    "2021": ["Friends of Gipsy Hill Archives"],
    "2022": ["Friends of Gipsy Hill Archives", "Electoral Commission"],
    "2023": ["Department for Transport", "Friends of Gipsy Hill Archives"],
    "2024-Present": ["Friends of Gipsy Hill website"]
}

# Update each entry with citations
citation_number = 1
all_citations = []

for entry in data:
    date = entry.get("date", "")
    if date in citations:
        # Add superscript citation numbers to description
        citation_nums = []
        for i, source in enumerate(citations[date]):
            citation_nums.append(str(citation_number))
            all_citations.append({"number": citation_number, "source": source})
            citation_number += 1
        
        # Add citation numbers to the end of description
        if citation_nums:
            sup_text = "<sup>" + ",".join(citation_nums) + "</sup>"
            entry["description"] = entry["description"].rstrip() + sup_text
            entry["citations"] = citation_nums

# Create the updated JavaScript file
output = """// Timeline data with full content - Updated with research findings and citations
var timelineData = """
output += json.dumps(data, indent=2, ensure_ascii=False)
output += ";\n\n"

# Add the citations list
output += "// Citation sources\n"
output += "var timelineCitations = " + json.dumps(all_citations, indent=2, ensure_ascii=False) + ";\n"

# Write the updated file
with open('timeline-data-with-citations.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"Added {citation_number - 1} citations to timeline data")
print("Created timeline-data-with-citations.js")