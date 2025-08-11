# Timeline Data Changes

## Overview
This document tracks significant changes made to the Gipsy Hill Timeline data, including new entries, image additions, citation updates, and other modifications.

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