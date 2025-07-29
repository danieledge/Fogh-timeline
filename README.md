# FoGH Timeline (Friends of Gipsy Hill Timeline)

An interactive, community-driven timeline documenting the rich history of Gipsy Hill and surrounding areas in South London. This project enables local residents to contribute historical events, memories, and amendments to create a comprehensive historical record.

## 🌟 Overview

The FoGH Timeline is an open-source web application that presents historical events in an engaging, visual format while allowing community contributions. Built with vanilla JavaScript for maximum compatibility and performance, it features a modern, responsive design that works seamlessly across all devices.

### Key Features

- **📅 Interactive Timeline**: Explore historical events from the 1800s to present day
- **👥 Community Contributions**: Submit new events or suggest amendments via GitHub
- **🎨 Theme Support**: Toggle between light and dark themes for comfortable viewing
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔍 Smart Filtering**: Toggle between major and minor events
- **📚 Rich Citations**: Every event includes proper sources and references
- **🖼️ Image Support**: Events can include historical images with proper attribution
- **✏️ Amendment System**: Suggest corrections or additions to existing entries

## 🚀 Getting Started

### Viewing the Timeline

Visit the live timeline at: [https://gipsyhillfriends.org/timeline.html](https://gipsyhillfriends.org/timeline.html)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/danieledge/Fogh-timeline.git
   cd Fogh-timeline
   ```

2. **Serve the files locally**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000/timeline.html`

### Debug Mode

For testing submissions without creating actual GitHub pull requests:
- Add `?debug=true` to the URL
- Forms will be pre-populated with test data
- Submissions will be marked with [TEST] prefix

## 📁 Project Structure

```
├── timeline.html          # Main application file
├── timeline.css          # Styles and theme definitions
├── timeline-main.js      # Core JavaScript functionality
├── timeline-data.js      # Historical event data
├── staticman-integration.js # Handles form submissions
├── icons/               # SVG icons for timeline events
│   ├── building.svg    # Buildings and structures
│   ├── transport.svg   # Transport related events
│   ├── disaster.svg    # Natural disasters
│   └── ...            # Various other event type icons
├── images/             # Historical images and photos
├── _data/              # Submission data (when using GitHub)
└── staticman.yml       # Staticman configuration

## Additional Files (Not in Repository)
├── .env               # Environment variables (create locally)
└── deploy.sh         # Deployment script (maintainers only)
```

## 🤝 Contributing

We welcome contributions from the community! There are several ways to contribute:

### 1. Submit New Events

To add a new historical event:
1. Visit the timeline
2. Click "Suggest Entry/Amendment" or the "+" button
3. Fill in the event details:
   - **Date**: Year or year-month when the event occurred
   - **Title**: Brief, descriptive title
   - **Description**: Detailed information about the event
   - **Sources**: Citations and references (required)
   - **Images**: Optional historical images with proper attribution

### 2. Suggest Amendments

To correct or expand existing entries:
1. Click "Suggest Edit" on any timeline entry
2. Select what needs to be amended
3. Provide detailed explanation of changes needed
4. Include sources to support your amendments

### 3. Privacy and Public Information

**Important**: When submitting:
- Your name will be publicly visible on GitHub
- You can use just your first name or a nickname
- Your email is converted to an irreversible hash (MD5) for privacy
- All submitted content except email addresses becomes public on GitHub

### 4. Submission Process

1. All submissions create a pull request on GitHub
2. Moderators review submissions for accuracy and appropriateness
3. Approved entries are merged and appear on the timeline
4. You'll be notified via GitHub if there are questions about your submission

## 📤 How Submissions Work - Staticman Integration

This project uses **[Staticman](https://staticman.net/)** to handle form submissions. Staticman is an open-source application that acts as a bridge between static sites and user-generated content.

### What is Staticman?

Staticman is a Node.js application that:
- Receives form submissions from static websites
- Validates the data according to configured rules
- Creates pull requests on GitHub with the submitted content
- Allows moderation before content goes live
- Maintains a fully static site (no database required)

### How the Submission Flow Works

1. **User fills out form** → Timeline submission form (new entry or amendment)
2. **Form validation** → Client-side checks for required fields
3. **Confirmation modal** → Shows what will be public on GitHub
4. **API request** → Sent to Staticman endpoint (Netlify-hosted)
5. **Staticman processing**:
   - Validates according to `staticman.yml` rules
   - Transforms email to MD5 hash for privacy
   - Creates formatted JSON file
6. **GitHub pull request** → Created automatically with submission data
7. **Moderation** → Maintainers review and merge if appropriate
8. **Live on timeline** → Once merged, data appears on the timeline

### Technical Implementation

- **Configuration**: `staticman.yml` defines validation rules and file structure
- **API Endpoint**: Hosted on Netlify (see `netlify.toml.example`)
- **Form Handler**: `staticman-integration.js` manages submissions
- **Data Storage**: JSON files in `_data/timeline/` directory
- **Privacy**: Email addresses are MD5 hashed before storage

### Setting Up Your Own Instance

1. Fork this repository
2. Deploy your own Staticman instance (Heroku/Netlify/self-hosted)
3. Update `STATICMAN_CONFIG` in `staticman-integration.js`
4. Configure GitHub App permissions
5. Update `staticman.yml` with your details

See [STATICMAN_SETUP.md](STATICMAN_SETUP.md) for detailed instructions.

## 🛠️ Technical Details

### Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Submission Handler**: Staticman v3
- **Version Control**: Git & GitHub
- **Hosting**: Static file hosting (GitHub Pages compatible)

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

### Performance Features

- Lazy loading of images
- CSS animations using GPU acceleration
- Minimal JavaScript for fast initial load
- No external dependencies (except Staticman for submissions)

## 📸 Image Guidelines

When submitting images:
- Ensure you have rights to share the image
- Provide proper attribution (photographer, archive, etc.)
- Use descriptive captions
- Historical photos are preferred over modern ones
- Maximum 5 images per event

## 🔒 Security & Privacy

- Email addresses are hashed using MD5 before storage
- No personal data is stored in cookies
- All submissions are moderated before publication
- HTTPS enforced for all connections

## 🐛 Reporting Issues

Found a bug or have a suggestion?
- Open an issue on [GitHub Issues](https://github.com/danieledge/Fogh-timeline/issues)
- Include browser version and device type
- Provide steps to reproduce the issue

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License** (CC BY-NC-SA 4.0).

### What this means:

**You are free to:**
- ✅ Share — copy and redistribute the material in any medium or format
- ✅ Adapt — remix, transform, and build upon the material

**Under the following terms:**
- 📝 **Attribution** — You must give appropriate credit to FoGH Timeline
- 🚫 **NonCommercial** — You may not use the material for commercial purposes
- 🔄 **ShareAlike** — If you remix or adapt, you must distribute under the same license

**You cannot:**
- ❌ Sell this software or use it in commercial products
- ❌ Remove attribution to the original project
- ❌ Apply more restrictive terms to derivative works

### Content & Image Licensing

⚠️ **Important:** Historical content and images may have their own licenses and copyright restrictions:
- Images from archives, museums, or libraries may require permission for re-use
- Always check the sources and citations provided with each timeline entry
- User-submitted historical facts remain in the public domain
- When in doubt, contact the original source for permission

For questions about commercial use or licensing, contact: fogh@dan-edge.com

Full license text: [LICENSE](LICENSE)

## 🙏 Acknowledgments

- **Gipsy Hill Community**: For preserving and sharing local history
- **Contributors**: All community members who have submitted events and amendments
- **Icon Credits**: See Iconography Credits in the application's About section
- **Archives**: Various local and national archives cited throughout

## 📊 Version History

- **v1.39**: Added confirmation modal for submissions, improved privacy notices
- **v1.38**: Enhanced amendment system with better form validation
- **v1.37**: Added image upload support for events
- **v1.36**: Implemented Staticman integration for GitHub submissions
- See timeline About section for current version

## 🚦 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue)

---

**Maintained by**: Friends of Gipsy Hill Library  
**Contact**: fogh@dan-edge.com  
**Website**: [https://gipsyhillfriends.org](https://gipsyhillfriends.org)