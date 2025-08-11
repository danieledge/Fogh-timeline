# FoGH Timeline (Friends of Gipsy Hill Timeline)

> ⚠️ **BETA SOFTWARE**: This application is currently in beta. While functional, it may contain bugs or incomplete features. The code is provided as-is without warranty of any kind.

An interactive, community-driven timeline application documenting the rich history of Gipsy Hill and surrounding areas in South London. This open-source project enables communities to create, maintain, and share their local history through an engaging visual timeline interface.

---

## 🚀 Latest Updates

**Version 2.81** (August 2025) - Minor update with important fixes
- **Fixed Category Filtering** - Minor entries now properly respect category filters
- **Data Correction** - "Death of the Gypsy Queen" correctly categorized under "Gypsies" instead of "Churches"
- **Banner Display Fix** - WIP and informational banners now properly reappear when version changes
- **Version Reset** - Dismissed notices reset on version update to ensure important messages are seen

---

**Version 2.08** - Major improvements to user experience and interface refinements.

### Key Highlights
- ✅ **Fixed critical timeline loading issue** - Timeline now renders correctly
- 🏷️ **Category System** - Filter timeline by categories (Heritage, Transport, Churches, etc.)
- 🔍 **Advanced Filtering** - Search, date range slider, and category filters for exploration
- 📚 **References System** - Citations with verification status and quality ratings
- 🖼️ **Image Carousel** - Browse multiple images per entry with smooth navigation
- 📱 **Mobile Optimized** - Enhanced touch controls and responsive design
- 💡 **Smart Disclaimers** - Hide informational messages permanently (resets on updates)

### Major UI Enhancements
- **Improved Text Wrapping** - Titles use more horizontal space before breaking, no hyphenation
- **Space Optimization** - More compact view with consistent spacing throughout
- **Enhanced Modals** - Reduced heights, simplified pagination, gradient title effects
- **Minor Entry Improvements** - "Read more" text indicators, click anywhere to collapse
- **Filter Improvements** - 3-column category grid, visual pill feedback, clear all button fixes
- **Accessibility** - Larger touch targets for citations (24x24px minimum)
- **Visual Polish** - Cleaner citation display, consistent category colors, better badge positioning

[📄 View detailed release notes →](RELEASE_NOTES_v2.08.md) | [📋 All releases →](https://github.com/danieledge/Fogh-timeline/releases) | [📜 Timeline data changes →](TIMELINE_DATA_CHANGES.md)

---

## 📝 TODO / Roadmap

### 🚨 CRITICAL
- **Make Fanny the Gipsy Hill cat look less menacing in logo** 😺 - Add some friendly emojis to soften Fanny's intimidating gaze 🐾✨

### Data Management
- **Migrate submissions to dedicated repository** - Move user submissions and amendments to a separate GitHub project to improve maintainability, allowing clear separation between application issues and data contributions (currently both stored as issues in this repository)

### User Experience
- **Cleanup submissions UI** - Improve the overall user experience for the submission and amendment feature, including form design, validation feedback, and success messaging

---

## 🌟 Application Overview

The FoGH Timeline is a powerful, flexible timeline application built with vanilla JavaScript for maximum compatibility and performance. While originally created for Gipsy Hill's history, the application can be adapted for any community or historical documentation project.

### Core Application Features

- **📅 Interactive Visual Timeline**: 
  - Smooth scrolling through historical events
  - Visual importance indicators (major/minor events)
  - Chronological organization with date markers
  - Responsive design for all devices

- **🎨 Advanced UI/UX**:
  - Dark/light theme toggle with system preference detection
  - Smooth animations and transitions
  - Touch-friendly mobile interface
  - Keyboard navigation support

- **🔍 Smart Filtering & Navigation**:
  - Toggle between major and minor historical events
  - Quick navigation to specific time periods
  - Visual density indicators for event-rich periods

- **📚 Comprehensive Citation System**:
  - Every event can include links to related sources/citations
  - Quality indicators (High/Medium/Low)
  - Multiple source support per event

- **🖼️ Rich Media Support**:
  - Historical images with captions
  - Lazy loading for performance
  - Thumbnail generation support

- **👥 Community Contribution System**:
  - Submit new historical events
  - Suggest amendments to existing entries
  - GitHub-based moderation workflow
  - Privacy-preserving submission process

### Technical Capabilities

- **No Database Required**: Fully static site architecture
- **Version Control Integration**: Git-based content management
- **Staticman Integration**: Automated pull request generation
- **SEO Optimized**: Semantic HTML and metadata
- **Performance Focused**: Minimal dependencies, optimized assets
- **Extensible**: Modular JavaScript architecture

---

## 📖 About the Gipsy Hill Timeline

This instance of the timeline application documents the fascinating history of Gipsy Hill in South London, from Roman times to the present day. It serves as a digital archive for the community, preserving local memories and historical records.

### Historical Coverage

- **Ancient Period**: Roman settlements and Saxon boundaries
- **Medieval Era**: Norman conquest impacts and early land use
- **Victorian Development**: Railway arrival and suburban growth
- **20th Century**: Wars, social changes, and community development
- **Modern Era**: Contemporary community initiatives and cultural 

### Data Sources Include
see citations
- Local authority archives
- British Library collections
- Museum archives
- Historical society records
- Community contributions
- Academic research papers

---

## 🚀 Getting Started

### Viewing the Timeline

Visit the live Gipsy Hill timeline at: [https://gipsyhillhistory.com/timeline.html](https://gipsyhillhistory.com/timeline.html)

### Setting Up Your Own Timeline

1. **Clone the repository**:
   ```bash
   git clone https://github.com/danieledge/Fogh-timeline.git
   cd Fogh-timeline
   ```

2. **Customize the data**:
   - Edit `timeline-data.js` with your historical events
   - Update branding in `timeline.html`
   - Modify styles in `timeline.css`

3. **Serve locally**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Deploy**:
   - Works with any static hosting (GitHub Pages, Netlify, etc.)
   - No server-side requirements

---

## 📁 Project Structure

```
├── timeline.html              # Main application file
├── timeline.css              # Styles and theme definitions
├── timeline-main.js          # Core timeline functionality
├── timeline-data.js          # Historical event data
├── staticman-integration.js  # Form submission handler
├── icons/                    # SVG icons for event types
├── images/                   # Historical images
├── _data/                    # Submission data storage
└── staticman.yml            # Submission configuration
```

---

## 🤝 Contributing to Gipsy Hill Timeline

### Submit New Events

1. Click "Suggest Entry/Amendment" on the timeline
2. Provide:
   - Date (year or year-month)
   - Descriptive title
   - Detailed description
   - Verified sources
   - Historical images (optional)

### Suggest Amendments

1. Click "Suggest Edit" on any entry
2. Explain needed changes
3. Provide supporting sources

### Documentation

- **Functional changes**: Document in release notes or README
- **Timeline data changes**: Document in [TIMELINE_DATA_CHANGES.md](TIMELINE_DATA_CHANGES.md)
- Keep application features separate from historical content updates

### Privacy Notice

- Your name appears publicly on GitHub (use firstname or nickname if prefered) 
- Email addresses are MD5 hashed
- All content becomes public once approved

---

## 🛠️ Technical Documentation

### Customization Guide

To adapt this timeline for your community:

1. **Data Structure** (`timeline-data.js`):
   ```javascript
   {
     "date": "YYYY-MM-DD",
     "title": "Event Title",
     "description": "Detailed description",
     "icon": "icon-name",
     "importance": "major|minor",
     "citations": ["1", "2"],
     "image": "path/to/image.jpg",
     "imageCaption": "Caption text"
   }
   ```

2. **Citation Format**:
   ```javascript
   {
     "number": "1",
     "timeline_entry": "Event reference",
     "status": "Verified|Unverified",
     "source": "Source description",
     "quality": "High|Medium|Low",
     "url": "https://source.url"
   }
   ```

3. **Theme Customization** (`timeline.css`):
   - CSS custom properties for colors
   - Responsive breakpoints
   - Animation timings

### API Integration

The timeline uses Staticman for submissions:
- Configure in `staticman.yml`
- Update endpoint in `staticman-integration.js`
- Requires GitHub App setup

---

## 📸 Image Guidelines

- Ensure proper rights/permissions
- Provide attribution
- Prefer historical over modern photos
- Optimize for web (max 1200px wide)
- Use descriptive filenames

---

## 🔒 Security & Privacy

- No cookies or tracking
- Email hashing for privacy
- HTTPS enforced
- Moderated submissions

---

## 📜 License

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** (CC BY-NC-SA 4.0)

✅ **You can**: Share, adapt, and build upon the work  
❌ **You cannot**: Use commercially or remove attribution

See [LICENSE](LICENSE) for full details.

---

## 🙏 Acknowledgments

### For the Application
- Built with vanilla JavaScript for universal compatibility
- Staticman for enabling static site contributions
- Icon contributors via Noun Project

### For Gipsy Hill Timeline Content
- **Friends of Gipsy Hill**: Community organization and historical preservation
- **Local Archives**: Lambeth Archives, British Library, Museum of London
- **Community Contributors**: Residents sharing memories and research and related websites
- **Special Thanks**: 
---

## 📊 Version Information

**Current Version**: v2.08 (See 'about' for latest version information)

**Recent Updates**:
- Enhanced citation display system
- Improved mobile touch interactions
- Advanced image handling with thumbnails
- Community submission improvements

---

## 📞 Contact

**Project Maintainer**: Daniel Edge  
**Technical Contact**: Daniel Edge  
**Website**: [https://gipsyhillfriends.org](https://gipsyhillfriends.org)  
**Repository**: [https://github.com/danieledge/Fogh-timeline](https://github.com/danieledge/Fogh-timeline)

---

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue)
