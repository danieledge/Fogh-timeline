# Timeline Data Changes

## Overview
This document tracks significant changes made to the Gipsy Hill Timeline data, including new entries, image additions, citation updates, and other modifications.

---

## Changes by Timeline Entry (Last 2 Weeks)

### New Entries Added

#### 1917 - Gipsy Hill Montessori College Opens (Added: 2025-08-05)
- Britain's first Montessori training college at 10 Dulwich Wood Avenue
- Added historical context about Belle Rennie
- Image: Queen and Lady's Newspaper announcement from Aug 4 1917

#### 1966 - World Cup Trophy Found (Added: 2025-08-05)
- Pickles the Dog finds Jules Rimet trophy on Beulah Hill
- Complete story of trophy recovery
- Images: Pickles himself and his collar with medals

### Images Added to Existing Entries

#### Roman Era - Forest Trackways (AD 43-410)
- **Category changed**: Updated to "General" category (2025-08-06)
- **Title updated**: Changed from "Roman Era" to "Roman Era - Forest Trackways" (2025-08-06)

#### Anglo-Saxon Settlement (AD 410-1066)
- **Category changed**: Updated to "General" category (2025-08-06)

#### Great North Wood (11th-19th c.)
- **Image added**: Modern Dulwich Wood view with Battersea Power Station (2025-08-02)

#### Margaret Finch Born (c. 1650)
- **Image added**: 1851 John McCallum painting (2025-08-03)
- Converted from WEBP to JPG format

#### Samuel Pepys Visits (1667)
- **Category changed**: From "Education" to "Gypsies" (2025-08-06)

#### Death of the Gypsy Queen (1740)
- **Category fixed**: From "Churches" to "Gypsies" (2025-08-07)
- **Images updated**: Combined London Annual Register 1796 pages (2025-08-04)

#### Norwood Gypsies Pantomime (1777)
- **Images updated**: Combined pantomime pages with matching heights (2025-08-04)

#### Norwood Common Enclosed (1810)
- **Image added**: 1806 enclosure plan map from Lambeth Archives (2025-08-11)

#### Railway Construction Authorized (1853)
- **Image added**: 1850s railway route map from farnborough-kent-railways.org.uk (2025-08-11)

#### Gipsy Road Baptist Church (1881)
- **Details added**: Foundation stone date, construction cost (£4,700), 1887 organ addition (2025-08-04)

#### River Effra Flood (1890)
- **Image added**: Flood damage photograph from Lambeth Archives (2025-08-01)

#### Christ Church Consecrated (1894)
- **Image updated**: Historic 1890 photograph from Lambeth Archives (2025-07-31)

#### Bovril Castle Era (1897-1919)
- **Image added**: John Lawson Johnston portrait (2025-08-03)

#### Norwood Park Opens (1911)
- **Image added**: Historic fundraising brochure c.1905 (2025-07-31)

#### Railway Electrification (1911)
- **Image added**: Overhead AC electric Crystal Palace stock from Historic England Archives (2025-08-11)

#### Long Meadow and Norwood Central Dairy (1912)
- **Title updated**: Previously just "Norwood Central Dairy" (2025-08-03)
- **Caption updated**: Fixed image2Caption display issue (2025-08-03)

#### WWII Blitz (1940-1944)
- **Second image added**: 1942 air raid shelter photo from Lambeth Archives (2025-08-01)

#### Kingswood Estate (1959)
- **Image added**: Shopping parade photograph from London Metropolitan Archives (2025-08-01)

#### Athol House Becomes Cheshire Home (1960)
- **Images added**: Cheshire Smile magazine images from 1960 (2025-08-03)

#### Conservation Area Designated (1974)
- **Image added**: 1973 Victorian cottages from Borough Photos (2025-08-11)

#### Railway Accident (1990)
- **Citation updated**: Quality changed to "High" with National South East Railway Society source (2025-08-05)

#### Friends of Gipsy Hill Formed (2018)
- **Image updated**: Community photo replaced logo (2025-07-31)

#### British Railways Sign Return (2020)
- **Image added**: Downloaded and added missing sign image (2025-08-03)

#### Station Gardens Transform (2022)
- **Image added**: Station garden photo from FoGH website (2025-07-31)

### Citation Updates

#### Citation 33 (Fanny the Station Cat)
- **Quality updated**: From "Low" to "High" (2025-08-04)

#### Citation 55
- **Updated**: Removed outdated 2025 reference, added descriptive URL names (2025-08-05)

### Category System Implementation (2025-08-06)
- Implemented comprehensive category system
- Categories renamed to single words: Heritage, Gypsies, Transport, Churches, Education, Buildings (was Housing), War, Nature, Community, General
- Added category badges to all entries
- Fixed multiple category assignments

### Technical Improvements
- **Image caption formatting**: Standardized all captions to "Source:" format (2025-08-03)
- **Date formatting**: Updated to "AD 43-410", "AD 410-1066", "11th-19th c." format (2025-08-03)
- **Image naming**: Renamed 19 image files to descriptive names (2025-08-03)
- **Caption properties**: Fixed image2Caption and image2CaptionHTML properties (2025-08-03)

---

## 2024-08-11 - Historical Images Added

### Images Added to Existing Timeline Entries

#### 1. Norwood Common Enclosed (1810)
- **Image**: `1806-norwood-common-enclosure-plan.jpg`
- **Source**: [Ideal Homes](https://ideal-homes.gre.ac.uk/__data/assets/image/0003/304437/01293-2000.jpg)
- **Caption**: Plan of Norwood Common, 1806. Map showing the area between Knights Hill in the west and Gypsy Hill in the east, depicting land ownership following the Enclosure Act of 1806
- **Credit**: Lambeth Archives (public domain)
- **Commit**: a0ec31e

#### 2. Railway Construction Authorized (1853)
- **Image**: `1853-crystal-palace-railway-route-map.jpg`
- **Source**: [Farnborough Kent Railways](https://www.farnborough-kent-railways.org.uk/images/1850s_west_end_crystal_palace/IMG_4680.JPG)
- **Caption**: 1850s map showing the proposed railway route from Crystal Palace via Beckenham, with connection to the Brighton main line from London Bridge
- **Credit**: farnborough-kent-railways.org.uk (public domain)
- **Commit**: 975b683

#### 3. Railway Electrification (1911)
- **Image**: `1911-crystal-palace-electric-stock.jpg`
- **Source**: [Blood and Custard](https://www.bloodandcustard.com/BR-Tunnels-CrystalPalaceTunnel_files/image007.jpg)
- **Caption**: Overhead AC electric Crystal Palace stock, 1911
- **Credit**: Historic England Archives (public domain)
- **Commit**: 1798b5d

#### 4. Gipsy Hill Conservation Area Designated (1974)
- **Image**: `1973-gipsy-hill-victorian-cottages.jpg`
- **Source**: [Borough Photos](https://boroughphotos.org/lambeth/76-86-gipsy-hill-norwood/)
- **Caption**: Terraced Victorian cottages 76-78 Gipsy Hill within Conservation area, c. 1973
- **Credit**: Borough Photos collection
- **Commit**: bc0b9c4

### Technical Updates
- Fixed image caption formatting (changed from `image_caption` to `imageCaption`)
- Added HTML formatting to captions with proper `<br>` tags
- Added `imageCaptionHTML: true` flag for all new images
- **Commit**: 4fdc465

---

## Admin Panel Enhancements

### Quality Control Improvements
- **Cross-Reference Check**: Updated to require 3+ word matches, excluding common place names (Gipsy Hill, Norwood, Crystal Palace)
- **Tool Reorganization**: Moved analysis tools to Quality Control and Research tabs
- **Data Validation**: Enhanced orphaned citations detection and duplicate checking

### User Interface Updates
- Added tooltips to all buttons explaining their functionality
- Reorganized headline statistics with warnings section
- Renamed "Complete Summary" to "Summarise Entries"
- Consolidated export options into dropdown menu

### Entry Management
- Reorganized Entry Editor with clear new/edit modes
- Implemented multi-select dropdown for citations
- Added modal form for creating new citations via pull request
- Added proper form clearing when switching modes

### Security & Access
- Implemented password protection with session storage
- Added logout button with session clearing
- Password: GipsyHill2025 (for authorized users only)

---

## Data Quality Standards

### Image Requirements
- All images must have thumbnails (300x200px recommended)
- Captions must include source attribution
- Public domain or properly licensed images only
- Use camelCase for image properties (`imageCaption`, not `image_caption`)
- HTML captions require `imageCaptionHTML: true` flag

### Citation Standards
- Each citation must have:
  - Unique number
  - Timeline entry reference
  - Source description
  - Quality rating (High/Medium/Low)
  - Status (Verified/Unverified/Needs Review)
  - URL (when available)

### Entry Categories
Current categories in use:
- Culture
- Civic
- Community
- Development
- Education
- Gypsies
- Heritage
- Historical
- Services (formerly Infrastructure)
- Nature
- Railway
- Religious
- Wartime

---

## Maintenance Notes

### Regular Tasks
- Check for orphaned citations (citations not referenced by any entry)
- Verify all image links are working
- Ensure thumbnails exist for all images
- Validate date formats across entries
- Check for duplicate entries or citations

### GitHub Actions
- Automated workflows process admin panel submissions
- Pull requests are created for timeline updates
- Workflow uses PAT_TIMELINE_BOT for authentication

---

## Contributing

When adding new data to the timeline:
1. Ensure all required fields are populated
2. Add appropriate citations with sources
3. Include images where available (with proper attribution)
4. Test changes locally before committing
5. Use descriptive commit messages
6. Update this document with significant changes

---

## Recent Commit History

For the most recent changes, run:
```bash
git log --oneline -- timeline-data.js | head -20
```

Last updated: 2024-08-11