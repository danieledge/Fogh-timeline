# File Organization Report

## Files Moved to admin-ui/
- `admin.html` → `admin-ui/admin.html` ✅
- `admin-js.js` → `admin-ui/admin-js.js` ✅
- Updated path reference in admin.html to `../timeline-data.js` ✅

## Files That Can Be Deleted

### Temporary/Development Files
- `promotsearch2.txt` - Search feature prompt/notes (can be deleted if no longer needed)

### Unused Scripts
- `apply_categories.py` - Python script for category updates (check if still needed)
- `find_no_images.py` - Utility script (check if still needed)
- `check-citations.js` - Citation checking utility (check if still needed)
- `update-timeline.js` - Timeline update utility (check if still needed)

### Documentation That May Be Outdated
- `SETUP_GITHUB_ACTIONS.md` - Check if current
- `GITHUB_SETUP.md` - Check if current
- `manage-submissions.md` - Check if current
- `image-instructions.md` - Check if current

## Files to Keep

### Core Application Files
- `timeline.html` - Main application
- `timeline-data.js` - Data file
- `timeline-main.js` - Main JavaScript
- `timeline.css` - Styles
- `search-morph.js` - Search functionality
- `search-morph.css` - Search styles
- `search-bar.html` - Search template
- `image-carousel.js` - Image carousel (renamed from New_leftline.bundle.js)

### Configuration Files
- `staticman.yml` - Comment system config
- `sw.js` - Service worker
- `.gitignore`
- `LICENSE`
- `VERSION`
- `version.json`

### Documentation (Current)
- `README.md` - Main documentation
- `TIMELINE_DATA_CHANGES.md` - Data changelog
- `CACHE_MANAGEMENT.md` - Cache documentation
- `RELEASE_NOTES_*.md` - Release notes

### Utilities
- `generate-thumbnails.sh` - Thumbnail generation
- `server.py` / `serve.sh` - Local server
- `clear-cache.html` - Cache clearing utility

## Recommendations

1. **Create additional folders for organization:**
   - `docs/` - Move documentation files
   - `utils/` - Move utility scripts
   - `config/` - Move configuration files

2. **Files safe to delete:**
   - `promotsearch2.txt` (after backing up any important notes)

3. **Files to review before deletion:**
   - Python and JS utility scripts - check if they're referenced in workflows
   - Old documentation files - verify they're not linked from README

4. **Keep in root:**
   - Main app files (HTML, CSS, JS)
   - README.md
   - LICENSE
   - VERSION files
   - .git* files