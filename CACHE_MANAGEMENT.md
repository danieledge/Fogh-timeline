# Cache Management Best Practices

## Version Update Checklist

When releasing a new version, follow these steps to ensure all users get the latest code:

### 1. Update Version Numbers
Update the version in these locations:
- `timeline.html` - Line 12: `var APP_VERSION = '2.09.1';`
- `sw.js` - Line 4: `const CACHE_VERSION = 'v2.09.1';`
- `version.json` - Update version and releaseDate
- `timeline.html` - Line 506: `<span class="version">v2.09.1 (HH:MM DD/MM/YY)</span>`

### 2. Cache Busting Strategies Implemented

#### A. Version-Based Cache Busting
- All CSS and JS files are loaded with `?v=VERSION` query parameter
- When version changes, browsers treat these as new URLs and fetch fresh copies

#### B. Service Worker Cache Management
- Service worker caches resources for offline access
- Automatically cleans up old caches when version changes
- Network-first strategy: always tries to fetch latest from network

#### C. Meta Tags
- Cache-Control headers prevent aggressive caching
- Forces revalidation of resources

#### D. LocalStorage Version Tracking
- Stores current version in localStorage
- Detects version changes and clears caches

### 3. Force Refresh Options

Users can force a fresh load using these methods:

1. **Add `?cache=false` to URL**
   - Example: `https://yoursite.com/timeline.html?cache=false`
   - Forces timestamp-based cache busting

2. **Hard Refresh**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **Reset Preferences**
   - Use the "Reset Preferences" option in hamburger menu
   - Clears all localStorage and forces fresh load

### 4. Server Configuration (Optional but Recommended)

Add these headers to your server configuration:

#### Apache (.htaccess)
```apache
<FilesMatch "\.(html|js|css)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</FilesMatch>

# Version-based caching for assets
<FilesMatch "\.(jpg|jpeg|png|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

#### Nginx
```nginx
location ~* \.(html|js|css)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires 0;
}

location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 5. Testing Version Updates

1. **Before Release:**
   - Test with `?cache=false` parameter
   - Check browser DevTools Network tab for 200 status codes (not 304)

2. **After Release:**
   - Open site in incognito/private window
   - Check version number in About modal
   - Verify WIP notice appears if version changed

### 6. Troubleshooting

If users report seeing old content:

1. **Check Version:**
   - Open DevTools Console
   - Type: `APP_VERSION`
   - Should show current version

2. **Clear Everything:**
   ```javascript
   // Run in DevTools Console
   localStorage.clear();
   sessionStorage.clear();
   if ('caches' in window) {
       caches.keys().then(names => names.forEach(name => caches.delete(name)));
   }
   location.reload(true);
   ```

3. **Unregister Service Worker:**
   - DevTools > Application > Service Workers > Unregister
   - Reload page

### 7. Monitoring

Monitor these metrics:
- Service Worker registration success/failure in console
- Cache hit/miss ratio in Network tab
- Version mismatches reported by users

## Summary

The implementation uses multiple layers of cache management:
1. Version-based query parameters
2. Service worker with cache versioning
3. LocalStorage version tracking
4. Meta tags for cache control
5. User-triggered cache clearing

This ensures users always get the latest version while maintaining good performance through intelligent caching.