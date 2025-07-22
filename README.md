# Fogh Timeline

An interactive timeline documenting the history of Gipsy Hill and surrounding areas in South London.

## Overview

This project presents historical events from the Gipsy Hill area in an engaging, visual timeline format. It features:

- **Interactive Timeline**: Click on events to explore detailed historical information
- **Theme Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Minor Events**: Toggle visibility of minor historical events for a cleaner view
- **Rich Citations**: Each event includes citations and references for historical accuracy

## Features

- 📅 Chronological display of historical events from 1800s to present
- 🎨 Beautiful gradient-based design with theme switching
- 📍 Custom icons for different types of events (buildings, transport, disasters, etc.)
- 📚 Comprehensive citations and source references
- 🔍 Filter between major and minor historical events
- 📱 Mobile-friendly responsive design

## Deployment

The project includes automated deployment scripts that:
- Update version numbers automatically
- Deploy to FTP server
- Commit changes to Git
- Push to GitHub repository

**Note**: Deployment scripts contain sensitive information and are not included in the repository.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/danieledge/Fogh-timeline.git
   cd Fogh-timeline
   ```

2. Serve the files locally:
   ```bash
   python -m http.server 8000
   ```

3. Open http://localhost:8000/timeline.html in your browser

## Project Structure

```
├── timeline.html          # Main application file
├── timeline.css          # Styles and theme definitions
├── timeline-main.js      # Core JavaScript functionality
├── timeline-data.js      # Historical event data
├── icons/               # SVG icons for timeline events
└── index.html           # Redirect to main timeline
```

## Contributing

This is a work in progress documenting local history. Contributions, corrections, and additional historical information are welcome! Please ensure any additions include proper citations and references.

## Credits

- Icons from various sources (see Iconography Credits in the application)
- Historical data compiled from multiple sources with citations included for each event

## License

This project documents public historical information. Please check individual source citations for any specific usage requirements.

---

**Version**: See version number in the application's About section