# FoGH Timeline (Friends of Gipsy Hill Timeline)

An interactive, community-driven timeline application documenting the rich history of Gipsy Hill and surrounding areas in South London. This open-source project enables communities to create, maintain, and share their local history through an engaging visual timeline interface.

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
  - Every event includes verifiable sources
  - Quality indicators (High/Medium/Low)
  - Verification status tracking
  - Multiple source support per event

- **🖼️ Rich Media Support**:
  - Historical images with captions
  - Lazy loading for performance
  - Attribution management
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
- **Modern Era**: Contemporary community initiatives and cultural evolution

### Notable Features in the Gipsy Hill Data

- Over 100 documented historical events
- Verified citations from archives, museums, and historical societies
- Rare historical photographs and images
- Personal memories from long-time residents
- Connections to broader London and UK history

### Data Sources Include

- Local authority archives
- British Library collections
- Museum archives
- Historical society records
- Community contributions
- Academic research papers

---

## 🚀 Getting Started

### Viewing the Timeline

Visit the live Gipsy Hill timeline at: [https://gipsyhillfriends.org/timeline.html](https://gipsyhillfriends.org/timeline.html)

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

### Privacy Notice

- Your name appears publicly on GitHub
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
- No user data storage

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
- **Community Contributors**: Residents sharing memories and research
- **Special Thanks**: Local historians, long-time residents, and memory keepers

---

## 📊 Version Information

**Current Version**: v2.07 (See timeline footer for latest)

**Recent Updates**:
- Enhanced citation display system
- Improved mobile touch interactions
- Advanced image handling with thumbnails
- Community submission improvements

---

## 📞 Contact

**Project Maintainer**: Friends of Gipsy Hill  
**Technical Contact**: fogh@dan-edge.com  
**Website**: [https://gipsyhillfriends.org](https://gipsyhillfriends.org)  
**Repository**: [https://github.com/danieledge/Fogh-timeline](https://github.com/danieledge/Fogh-timeline)

---

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue)