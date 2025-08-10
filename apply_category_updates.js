const fs = require('fs');

// Read the timeline data file
const content = fs.readFileSync('timeline-data.js', 'utf8');

// Category reassignments from uodate.txt
const categoryUpdates = {
    // Culture
    "1854": { title: "Crystal Palace Opens", category: "Culture" },
    "1777": { title: "The Norwood Gypsies Pantomime", category: "Culture" },
    
    // Civic
    "1810": { title: "Norwood Common Enclosed", category: "Civic" },
    "1974": { title: "Gipsy Hill Conservation Area Designated", category: "Civic" },
    "1978": { title: "Gipsy Hill Ward Created", category: "Civic" },
    "2000": { title: "Ward Boundary Revision", category: "Civic" },
    "2009": { title: "Current Ward Boundaries", category: "Civic" },
    "2022": { title: "Ward Boundary Revision", category: "Civic" },
    
    // Community
    "2018": { title: "Friends of Gipsy Hill Forms", category: "Community" },
    "2019": { title: "First Gipsy Hill Village Fete", category: "Community" },
    "2020": { title: "First Community Gipsy Hill Christmas Tree", category: "Community" },
    "2020": { title: "COVID-19 Mutual Aid", category: "Community" },
    "2022": { title: "Station Gardens Transform", category: "Community" },
    "2022": { title: "First Gipsy Hill Oktoberfest", category: "Community" },
    "2024-Present": { title: "FoGH Mission Continues", category: "Community" },
    "2011": { title: "Fanny the Gipsy Hill Cat", category: "Community" },
    "2010": { title: "Brown & Green Café Opens", category: "Community" },
    
    // Development
    "1811-1814": { title: "Kingswood Lodge Built", category: "Development" },
    "1855": { title: "The Paxton Hotel", category: "Development" },
    "1870s-1890s": { title: "Long Meadow and Norwood Central Dairy", category: "Development" },
    "1870s": { title: "Athol House Built", category: "Development" },
    "1871": { title: "United Land Co. Begins Development", category: "Development" },
    "1891-1900": { title: "The 'Bovril Castle' Era", category: "Development" },
    "1919-1940": { title: "The Vestey Family Era", category: "Development" },
    "1946-1956": { title: "Kingswood Estate Built", category: "Development" },
    "1967": { title: "Central Hill Estate", category: "Development" },
    "2023-2024": { title: "Athol House Heritage Refurbishment", category: "Development" },
    
    // Education
    "1875": { title: "Gipsy Hill Primary School", category: "Education" },
    "1880": { title: "Kingswood Primary School", category: "Education" },
    "1887": { title: "Paxton Primary School Opens", category: "Education" },
    "1917": { title: "Gipsy Hill Montessori College Opens", category: "Education" },
    
    // Gypsies
    "1600s": { title: "Norwood Gypsies Settle", category: "Gypsies" },
    "c. 1640": { title: "Margaret Finch Born", category: "Gypsies" },
    "1668": { title: "Pepys and Byron Visit the Gypsies", category: "Gypsies" },
    "1740": { title: "Death of the Gypsy Queen", category: "Gypsies" },
    "1740": { title: "Mother Bridget Succeeds as Queen of the Gypsies", category: "Gypsies" },
    "1768": { title: "Death of Mother Bridget", category: "Gypsies" },
    "1778": { title: "The Gypsy House Inn", category: "Gypsies" },
    
    // Heritage
    "1874": { title: "Annie Besant Residence", category: "Heritage" },
    "1920-1938": { title: "Margaret Lockwood's Childhood Home", category: "Heritage" },
    "1966": { title: "World Cup Trophy Found by Pickles the Dog", category: "Heritage" },
    "1972": { title: "Kingswood House Nationally Listed", category: "Heritage" },
    "2022": { title: "Kingswood Arts Transformation", category: "Heritage" },
    "1953-1955": { title: "Athol House Becomes First London Cheshire Home", category: "Heritage" },
    
    // Historical
    "AD 43-410": { title: "Roman Era - Forest Trackways", category: "Historical" },
    "AD 410-1066": { title: "Anglo-Saxon Boundaries", category: "Historical" },
    "1583": { title: "Vicar's Oak and Beating the Bounds", category: "Historical" },
    
    // Infrastructure
    "1832": { title: "Trotting Hill Created", category: "Infrastructure" },
    "1847-1858": { title: "River Effra Culverted & The Great Stink", category: "Infrastructure" },
    "1854": { title: "Gipsy Hill Police Station Built", category: "Infrastructure" },
    "1858": { title: "The Great Stink & River Effra", category: "Infrastructure" },
    "1870": { title: "Crystal Palace Gas Works", category: "Infrastructure" },
    "1960s": { title: "Norwood Triangle Converted to Roundabout", category: "Infrastructure" },
    "1961": { title: "Wooden Bus Shelter at South Croxted Road", category: "Infrastructure" },
    "1867": { title: "Barclay's Bank Opens", category: "Infrastructure" },
    "1939": { title: "Police Station Operations Move", category: "Infrastructure" },
    "1948": { title: "Police Station Converted", category: "Infrastructure" },
    
    // Nature
    "11th-19th c.": { title: "The Great North Wood", category: "Nature" },
    "1890": { title: "Great Flood", category: "Nature" },
    "1911": { title: "Norwood Park Opens", category: "Nature" },
    
    // Railway
    "1853": { title: "Railway Construction Authorized", category: "Railway" },
    "1856": { title: "Railway Revolution", category: "Railway" },
    "1911": { title: "Railway Electrification", category: "Railway" },
    "1929": { title: "Railway Conversion Complete", category: "Railway" },
    "2009": { title: "Gipsy Hill Station Refurbishment", category: "Railway" },
    "1990": { title: "Railway Accident", category: "Railway" },
    "2020": { title: "British Railways Sign Returns Home", category: "Railway" },
    
    // Religious
    "1862": { title: "Gipsy Hill Iron Church Erected", category: "Religious" },
    "1867": { title: "Christ Church Built", category: "Religious" },
    "1881-1882": { title: "Gipsy Road Baptist Church", category: "Religious" },
    "1982": { title: "Christ Church Fire", category: "Religious" },
    
    // Wartime
    "1915-1919": { title: "WWI Canadian Military Hospital", category: "Wartime" },
    "1940-1941": { title: "WWII Blitz", category: "Wartime" },
    "1963-1966": { title: "Cold War Bunker at Pear Tree House", category: "Wartime" },
    "1981": { title: "IRA Bomb Incident", category: "Wartime" }
};

// Track updates
let updatesApplied = 0;
let notFound = [];

// Apply updates
let updatedContent = content;

for (const [date, update] of Object.entries(categoryUpdates)) {
    // Create a regex to find the entry
    const titleEscaped = update.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Try to find and update the category for this entry
    const entryRegex = new RegExp(
        `("date":\\s*"[^"]*${date}[^"]*"[^}]*"title":\\s*"${titleEscaped}"[^}]*)"category":\\s*"[^"]*"`,
        'g'
    );
    
    if (updatedContent.match(entryRegex)) {
        updatedContent = updatedContent.replace(entryRegex, `$1"category": "${update.category}"`);
        updatesApplied++;
        console.log(`✓ Updated: ${update.title} -> ${update.category}`);
    } else {
        notFound.push({ date, title: update.title, category: update.category });
    }
}

// Write the updated content back
fs.writeFileSync('timeline-data.js', updatedContent);

console.log('\n===========================================');
console.log(`Total updates applied: ${updatesApplied}`);
console.log(`Entries not found: ${notFound.length}`);

if (notFound.length > 0) {
    console.log('\nEntries that could not be found:');
    notFound.forEach(entry => {
        console.log(`  - ${entry.date}: ${entry.title} -> ${entry.category}`);
    });
}