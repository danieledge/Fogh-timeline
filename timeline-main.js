/**
 * FoGH Timeline - Main JavaScript File
 * 
 * This file handles all the core timeline functionality including:
 * - Timeline rendering and animation
 * - Theme switching
 * - Modal management (About, Export, Submission)
 * - Minor/major event filtering
 * - Debug mode functionality
 * - User interactions and navigation
 * 
 * Dependencies:
 * - timeline-data.js: Contains the historical event data
 * - staticman-integration.js: Handles form submissions to GitHub
 */

// =============================================================================
// DEBUG AND ERROR HANDLING
// =============================================================================

/**
 * Displays error messages in a fixed position on the page
 * Used for critical errors that prevent the timeline from loading
 * @param {string} message - The error message to display
 */
function showError(message) {
    var errorDiv = document.getElementById('error-display');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-display';
        errorDiv.style.cssText = 'position: fixed; top: 10px; left: 10px; right: 10px; background: #ff6b6b; color: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; z-index: 9999; max-height: 200px; overflow-y: auto;';
        document.body.appendChild(errorDiv);
    }
    errorDiv.innerHTML += '<div>' + new Date().toLocaleTimeString() + ': ' + message + '</div>';
}

/**
 * Displays debug messages when debug mode is enabled (?debug=true)
 * Visual debug panel is commented out, messages go to console only
 * @param {string} message - The debug message to display
 */
function showDebug(message) {
    // Only show debug console if debug=true is in URL
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') !== 'true') {
        return;
    }
    
    // Debug display commented out per user request
    // Uncomment the block below to show visual debug panel
    /*
    var debugDiv = document.getElementById('debug-display');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-display';
        debugDiv.style.cssText = 'position: fixed; bottom: 10px; left: 10px; right: 10px; background: #4ecdc4; color: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; z-index: 9998; max-height: 150px; overflow-y: auto;';
        document.body.appendChild(debugDiv);
    }
    debugDiv.innerHTML += '<div>' + message + '</div>';
    */
    
    // Still log to console for debugging
    console.log('[DEBUG]', message);
}

// =============================================================================
// TIMELINE INITIALIZATION
// =============================================================================

/**
 * Main initialization function for the timeline
 * Called when DOM is ready, sets up all interactive elements and loads data
 * Handles error states if required data files are missing
 */
function initializeTimeline() {
    showDebug('Initializing timeline');
    try {
        // Check if required variables exist
        showDebug('Loading icons from icons directory...');
        
        if (typeof timelineData === 'undefined') {
            var errorMsg = 'Timeline Error: timelineData variable not found. Make sure timeline-data.js is loaded.';
            console.error(errorMsg);
            showError(errorMsg);
            document.getElementById('loading').textContent = 'Error: Failed to load timeline data.';
            return;
        }
        showDebug('Timeline data loaded: ' + timelineData.length + ' entries');
        
        // Define UI icons inline
        var infoIcon = '<path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V11H13M13 9H11V7H13" fill="currentColor"/>';
        var menuIcon = '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>';
        var closeMenuIcon = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>';
        var closeIcon = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>';
        showDebug('UI icons defined');
        
        // Define FoGH logos inline
        var foghLogoHeader = '<g transform="translate(0.000000,96.000000) scale(0.050000,-0.050000)" fill="#1f6c49" stroke="none"><path d="M6990 1878 c-511 -38 -1488 -53 -2680 -42 -1661 15 -2379 12 -2580 -14 -88 -11 -272 -34 -410 -51 -1000 -122 -1226 -334 -1121 -1054 76 -517 381 -694 1181 -683 128 2 2411 3 4240 2 863 0 1302 7 1370 22 55 12 339 31 630 42 882 34 1078 100 1220 411 144 315 22 1030 -202 1180 -221 148 -988 235 -1648 187z m839 -118 c419 -31 751 -113 828 -206 137 -166 201 -772 102 -984 -180 -389 -465 -418 -4059 -422 -1292 -1 -2651 -4 -3020 -6 -1202 -7 -1363 78 -1395 742 -26 548 175 694 1085 785 176 18 334 39 350 46 17 7 1142 16 2500 18 1359 3 2556 13 2660 23 272 26 624 27 949 4z"></path> <path d="M6856 1729 c-20 -20 -1868 -50 -3516 -58 -907 -4 -1663 -12 -1680 -18 -16 -5 -132 -15 -257 -22 -833 -43 -1151 -330 -1043 -940 86 -484 273 -547 1550 -522 374 7 1533 12 2574 12 1440 -1 1998 6 2330 28 240 15 598 34 796 41 1071 37 1334 291 1086 1050 -76 235 -111 273 -304 331 -200 60 -1492 143 -1536 98z m478 -314 c16 -20 43 -270 72 -655 9 -121 -94 -62 -114 65 l-18 115 -80 0 -79 0 10 -140 c7 -105 3 -145 -19 -163 -56 -46 -81 23 -105 283 -12 138 -28 293 -34 345 -12 91 -10 95 38 95 61 0 67 -14 85 -187 l15 -133 80 0 81 0 -14 181 c-7 99 -8 189 -2 200 17 27 61 24 84 -6z m-2988 -22 c132 -55 151 -142 20 -94 -167 60 -219 -236 -56 -320 74 -38 80 -89 10 -89 -66 -1 -72 -49 -32 -248 39 -192 40 -182 -6 -182 -54 0 -73 34 -100 180 -14 72 -29 150 -34 175 -5 27 -23 45 -46 45 -45 0 -91 50 -73 79 8 12 32 21 55 21 39 0 40 8 28 135 -15 155 22 256 108 299 61 31 49 31 126 -1z m3579 2 c24 -18 38 -86 55 -255 12 -126 29 -285 37 -352 17 -136 12 -168 -26 -168 -56 0 -75 69 -111 412 -43 400 -40 428 45 363z m-2901 -48 c63 -31 116 -101 116 -151 0 -55 -52 -43 -98 22 -78 109 -178 92 -231 -41 -98 -242 25 -482 186 -363 60 45 92 196 37 175 -16 -6 -45 4 -64 23 -43 44 3 88 89 88 94 -1 107 -25 134 -253 37 -318 35 -367 -12 -367 -52 0 -81 58 -81 161 0 78 -3 83 -45 68 -227 -79 -411 88 -389 353 24 280 157 386 358 285z m-2107 7 c12 -14 40 -163 62 -331 22 -167 46 -326 53 -353 14 -57 -35 -89 -80 -52 -15 13 -42 17 -60 10 -89 -34 -192 61 -192 178 0 69 73 154 132 154 45 0 49 6 39 65 -19 115 -51 325 -51 340 0 25 74 17 97 -11z m2499 0 c29 -34 -2 -80 -48 -71 -53 10 -64 97 -12 97 22 0 49 -12 60 -26z m2351 -9 c44 -156 58 -705 19 -705 -59 1 -76 47 -89 234 -7 108 -20 266 -28 351 l-15 155 52 0 c32 0 55 -13 61 -35z m-6428 -14 c35 -42 10 -69 -80 -84 l-79 -12 0 -96 c0 -88 5 -97 60 -116 70 -24 64 -73 -11 -92 -48 -12 -49 -16 -49 -221 0 -208 0 -210 -48 -210 -68 0 -72 22 -72 441 0 421 -15 375 130 406 81 17 126 12 149 -16z m441 -82 c0 -48 -59 -58 -89 -17 -37 51 -3 96 51 67 21 -11 38 -34 38 -50z m5779 2 c27 -33 12 -71 -28 -71 -36 0 -77 53 -62 79 19 30 62 26 90 -8z m-1378 -43 c28 -32 0 -67 -54 -68 -50 0 -77 -63 -37 -85 54 -31 130 -109 130 -135 0 -88 -203 -159 -259 -91 -29 35 -8 78 31 63 55 -21 144 28 100 55 -158 97 -183 156 -99 240 59 60 148 70 188 21z m426 -48 c-1 -27 -52 -188 -114 -356 -61 -168 -117 -337 -125 -375 -14 -78 -30 -94 -75 -78 -57 22 -52 72 29 313 l82 241 -92 93 c-51 51 -92 109 -92 128 0 60 67 37 141 -49 l72 -84 46 115 c51 126 134 160 128 52z m-880 -10 c154 -64 147 -240 -12 -296 -39 -14 -42 -61 -18 -279 17 -149 7 -183 -49 -172 -45 9 -59 77 -79 397 -8 127 -23 252 -33 279 -34 91 60 126 191 71z m-270 -217 c28 -192 15 -243 -52 -201 -28 18 -77 237 -84 374 -1 9 24 14 54 10 53 -6 56 -12 82 -183z m-3302 102 c77 -60 -10 -315 -107 -315 -58 0 -16 -50 64 -75 140 -46 135 -42 108 -75 -40 -49 -149 -37 -221 24 -240 202 -88 631 156 441z m1156 35 c43 -32 15 -69 -54 -70 -65 0 -56 -56 14 -98 153 -90 103 -322 -69 -322 -66 0 -101 55 -47 74 122 43 142 151 35 186 -82 27 -116 79 -98 150 24 97 141 140 219 80z m4238 -1 c20 -21 31 -68 31 -135 0 -57 6 -138 13 -179 10 -60 5 -77 -23 -88 -57 -22 -83 38 -98 223 -17 210 2 254 77 179z m-5927 -29 c10 0 18 -18 18 -40 0 -26 -13 -40 -39 -40 -60 0 -87 -72 -99 -270 -13 -194 -58 -257 -102 -141 -37 97 -35 441 2 441 18 0 45 11 60 23 40 31 84 45 115 35 14 -4 35 -8 45 -8z m913 -11 c104 -73 185 -469 96 -469 -46 0 -68 48 -95 209 -39 237 -89 221 -114 -37 -26 -262 -124 -122 -146 208 -6 89 -5 90 57 90 35 0 70 7 79 15 24 24 76 17 123 -16z m1393 -20 c130 -130 42 -401 -118 -361 -187 47 -209 329 -29 372 102 24 113 23 147 -11z m-2164 -54 c33 -26 88 -379 65 -416 -23 -37 -88 -20 -97 26 -63 339 -53 458 32 390z"></path> <path d="M2835 838 c-35 -51 -30 -118 8 -118 27 0 41 48 33 113 l-6 57 -35 -52z"></path> <path d="M5660 1020 c0 -38 10 -60 28 -60 38 0 58 59 30 93 -37 44 -58 32 -58 -33z"></path> <path d="M2022 964 c-13 -25 -22 -75 -18 -110 l6 -64 37 54 c28 42 33 67 18 110 l-18 56 -25 -46z"></path> <path d="M3792 909 c-64 -64 -18 -191 59 -161 23 8 30 34 25 95 -7 93 -35 115 -84 66z"></path></g>';
        var foghIcon = '<g transform="translate(0.000000,247.000000) scale(0.100000,-0.100000)" fill="white" stroke="none">\n<path d="M2839 2326 c-2 -2 -116 -6 -254 -10 -137 -3 -306 -8 -375 -11 -69 -3 -199 -7 -290 -9 -91 -2 -194 -9 -230 -15 -118 -19 -283 -40 -405 -51 -66 -6 -131 -14 -145 -16 -14 -3 -54 -9 -90 -13 -134 -16 -291 -52 -360 -83 -25 -11 -79 -32 -120 -45 -75 -25 -159 -63 -235 -105 -100 -56 -232 -229 -276 -363 -26 -78 -46 -378 -31 -445 7 -28 12 -70 12 -92 0 -101 54 -364 92 -444 111 -239 317 -382 653 -455 65 -14 376 -32 560 -32 387 0 1424 13 1451 18 16 3 234 12 484 20 l455 14 90 31 c148 51 222 87 280 136 125 105 155 134 187 184 50 77 93 180 116 280 23 102 30 376 12 497 -32 211 -72 371 -135 543 -34 91 -70 146 -131 198 -46 39 -200 122 -228 122 -7 0 -30 7 -51 15 -20 9 -55 20 -78 25 -23 5 -105 22 -182 38 -77 16 -189 33 -250 37 -60 4 -119 11 -131 15 -22 9 -387 24 -395 16z m86 -137 c11 -5 92 -10 180 -13 238 -5 490 -43 730 -109 247 -69 287 -103 368 -318 23 -58 62 -195 81 -284 31 -139 42 -417 23 -562 -13 -95 -21 -124 -58 -198 -98 -196 -296 -329 -566 -380 -48 -9 -110 -20 -136 -26 -26 -5 -90 -9 -141 -9 -51 0 -118 -5 -147 -11 -30 -6 -114 -11 -188 -10 -74 1 -137 -3 -140 -8 -7 -11 -327 -15 -1051 -14 -758 1 -859 3 -900 13 -19 5 -69 14 -110 20 -229 34 -345 85 -510 223 -62 52 -150 189 -150 235 0 9 -7 39 -15 67 -37 122 -59 561 -35 701 20 114 86 230 172 301 53 43 201 123 229 123 8 0 19 4 25 9 5 4 51 25 102 45 134 53 490 118 747 137 61 4 151 13 200 19 188 22 255 30 420 44 94 9 188 17 210 19 86 6 641 -5 660 -14z"/>\n<path d="M2245 2123 c-155 -7 -636 -34 -685 -39 -30 -3 -95 -7 -145 -10 -49 -3 -112 -9 -138 -14 -26 -6 -63 -10 -81 -10 -66 0 -355 -77 -453 -121 -24 -10 -48 -19 -55 -20 -23 -1 -166 -83 -223 -127 -86 -68 -158 -181 -215 -342 -46 -127 -29 -463 33 -675 18 -63 95 -196 140 -243 48 -50 142 -120 204 -151 118 -59 322 -83 631 -73 128 4 301 5 385 2 84 -3 292 -5 462 -4 287 1 401 6 720 34 66 6 224 15 350 20 127 5 250 13 275 19 25 6 107 24 184 40 233 51 349 101 455 198 58 53 78 80 115 156 25 51 52 115 61 142 35 117 3 447 -57 595 -19 44 -25 64 -41 125 -16 60 -49 166 -69 217 -5 14 -39 49 -74 76 -107 82 -323 142 -584 163 -101 8 -150 16 -162 26 -14 13 -87 15 -495 17 -263 1 -505 0 -538 -1z m205 -378 c84 -23 149 -66 196 -128 25 -34 44 -70 44 -85 0 -28 -25 -62 -46 -62 -18 0 -84 59 -84 74 0 24 -66 75 -111 87 -111 30 -180 -61 -219 -288 -24 -133 15 -242 108 -303 55 -36 72 -37 139 -6 73 34 103 84 103 171 l0 65 -42 0 c-65 0 -120 64 -90 106 4 5 43 16 86 22 69 11 85 10 122 -4 24 -9 46 -26 52 -40 16 -35 38 -230 62 -553 8 -98 7 -137 -1 -147 -18 -21 -83 -18 -104 6 -22 24 -44 132 -45 216 0 33 -3 63 -6 67 -4 3 -28 -5 -54 -18 -71 -36 -117 -40 -202 -20 -69 17 -77 22 -149 94 -64 65 -79 87 -102 149 -29 78 -36 179 -18 251 5 20 15 61 22 91 26 116 66 179 154 240 60 41 85 43 185 15z m-989 -34 c33 -34 36 -52 12 -73 -20 -17 -105 -38 -156 -38 -52 0 -57 -12 -57 -136 0 -122 1 -124 60 -124 16 0 41 -10 55 -23 22 -18 25 -28 19 -50 -7 -30 -23 -39 -89 -53 l-40 -9 -1 -249 c-1 -230 -2 -250 -19 -262 -30 -22 -73 -17 -99 11 -20 22 -24 38 -28 137 -4 62 -4 277 -2 478 6 410 0 384 83 395 25 4 64 10 86 15 22 4 64 8 93 9 47 1 57 -3 83 -28z m1880 10 c25 -20 22 5 59 -496 15 -193 16 -208 31 -282 17 -85 5 -113 -49 -113 -24 0 -46 7 -60 20 -22 21 -24 30 -43 177 -7 51 -17 97 -23 102 -10 8 -171 -1 -180 -10 -3 -2 2 -75 9 -163 13 -142 13 -160 -2 -182 -21 -33 -71 -33 -103 1 -23 24 -26 41 -42 238 -21 244 -32 359 -49 509 -13 119 -8 138 38 138 32 0 79 -25 87 -47 10 -24 25 -146 33 -255 3 -50 11 -92 18 -98 13 -11 154 -3 175 10 8 5 8 58 -1 211 -7 113 -9 217 -5 232 6 24 11 27 45 27 23 0 48 -8 62 -19z m-1486 -427 c37 -17 60 -58 96 -168 22 -70 22 -65 -8 -179 -7 -26 -61 -86 -94 -103 -46 -23 -135 -18 -185 11 -74 44 -124 134 -124 224 0 127 59 201 179 221 73 12 101 11 136 -6z"/>\n<path d="M1714 1156 c-31 -31 -34 -40 -34 -90 0 -32 7 -70 16 -87 14 -27 19 -30 57 -27 37 3 44 7 59 38 9 19 17 48 18 64 0 33 -19 105 -33 124 -16 21 -48 13 -83 -22z"/>\n</g>';
        showDebug('FoGH logos defined');
        
        // Hide loading and show UI elements
        showDebug('Hiding loading message');
        document.getElementById('loading').style.display = 'none';
        
        showDebug('Showing header');
        document.querySelector('.header').style.display = 'block';
        document.getElementById('menu-toggle').style.display = 'flex';
        
        // Handle WIP notice
        var wipNotice = document.getElementById('wip-notice');
        var wipClose = document.getElementById('wip-close');
        var currentVersion = window.APP_VERSION || 'v2.09.1'; // Use global version or fallback
        
        if (wipNotice) {
            var dismissedVersion = localStorage.getItem('wip-dismissed-version');
            if (dismissedVersion === currentVersion) {
                wipNotice.classList.add('hidden');
                document.body.classList.add('wip-hidden');
            }
            
            if (wipClose) {
                wipClose.addEventListener('click', function() {
                    wipNotice.classList.add('hidden');
                    document.body.classList.add('wip-hidden');
                    localStorage.setItem('wip-dismissed-version', currentVersion);
                });
            }
        }
        
        // Handle reset preferences button
        var resetPrefsButton = document.getElementById('reset-preferences-button');
        if (resetPrefsButton) {
            // Add reset icon
            resetPrefsButton.querySelector('svg').innerHTML = '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>';
            
            resetPrefsButton.addEventListener('click', function() {
                if (confirm('Reset all preferences?')) {
                    // Get all localStorage keys and remove them
                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        // Only clear keys that seem to belong to this app
                        // This prevents clearing unrelated localStorage from other apps on the same domain
                        if (key && (
                            key.includes('theme') ||
                            key.includes('wip') ||
                            key.includes('confirmation') ||
                            key.includes('timeline') ||
                            key.includes('filter') ||
                            key.includes('preference')
                        )) {
                            keysToRemove.push(key);
                        }
                    }
                    
                    // Remove all identified keys
                    keysToRemove.forEach(function(key) {
                        localStorage.removeItem(key);
                    });
                    
                    // Also clear sessionStorage for good measure
                    try {
                        sessionStorage.clear();
                    } catch (e) {
                        // sessionStorage might not be available
                    }
                    
                    // Reset theme to default (dark)
                    document.documentElement.setAttribute('data-theme', 'dark');
                    
                    // Show WIP notice again
                    if (wipNotice) {
                        wipNotice.classList.remove('hidden');
                    }
                    
                    // Close menu panel
                    var menuPanel = document.getElementById('menu-panel');
                    if (menuPanel) {
                        menuPanel.classList.remove('active');
                    }
                    
                    // Update theme toggle text
                    updateThemeText();
                    
                    alert('Preferences reset.');
                }
            });
        }
        
        // Populate icons in UI
        showDebug('Populating UI icons');
        document.querySelector('#menu-toggle svg').innerHTML = menuIcon;
        
        // Load sun and moon icons from SVG files
        var fetchOptions = window.noCache ? { cache: 'no-store' } : {};
        
        fetch('icons/sun.svg' + window.cacheBust, fetchOptions)
            .then(response => response.text())
            .then(svgContent => {
                var parser = new DOMParser();
                var svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                var svgInner = svgDoc.querySelector('svg').innerHTML;
                document.querySelector('.theme-toggle-icon.sun').innerHTML = svgInner;
            });
            
        fetch('icons/moon.svg' + window.cacheBust, fetchOptions)
            .then(response => response.text())
            .then(svgContent => {
                var parser = new DOMParser();
                var svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                var svgInner = svgDoc.querySelector('svg').innerHTML;
                document.querySelector('.theme-toggle-icon.moon').innerHTML = svgInner;
            });
        
        document.querySelector('#about-button svg').innerHTML = infoIcon;
        document.querySelector('#modal-close svg').innerHTML = closeIcon;
        
        // Populate FoGH logos
        showDebug('Populating FoGH logos');
        // Commented out - now using image instead of SVG for header logo
        // document.querySelector('.fogh-logo-header svg').innerHTML = foghLogoHeader;
        document.querySelector('.about-logo svg').innerHTML = foghLogoHeader;
        
        // =============================================================================
        // MENU PANEL FUNCTIONALITY
        // =============================================================================
        
        /**
         * Menu toggle functionality
         * Handles the hamburger menu that contains theme toggle, filters, and actions
         */
        showDebug('Setting up menu toggle');
        var menuToggle = document.getElementById('menu-toggle');
        var menuPanel = document.getElementById('menu-panel');
        
        function toggleMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var isActive = menuPanel.classList.toggle('active');
            menuToggle.querySelector('svg').innerHTML = isActive ? closeMenuIcon : menuIcon;
            
            // On mobile, add a small delay before making menu interactive
            if (isActive && 'ontouchstart' in window) {
                menuPanel.style.pointerEvents = 'none';
                setTimeout(function() {
                    if (menuPanel.classList.contains('active')) {
                        menuPanel.style.pointerEvents = '';
                    }
                }, 100);
            }
        }
        
        // Close menu when clicking outside
        function closeMenu() {
            menuPanel.classList.remove('active');
            menuToggle.querySelector('svg').innerHTML = menuIcon;
        }
        
        document.addEventListener('click', function(e) {
            // Don't close menu if clicking on images
            if (e.target.tagName === 'IMG' && e.target.closest('.content-image')) {
                return;
            }
            if (!menuToggle.contains(e.target) && !menuPanel.contains(e.target)) {
                closeMenu();
            }
        });
        
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
            menuToggle.addEventListener('touchend', function(e) {
                e.preventDefault();
                toggleMenu(e);
            });
        }
        
        // =============================================================================
        // THEME TOGGLE FUNCTIONALITY
        // =============================================================================
        
        /**
         * Theme toggle setup
         * Allows switching between light and dark themes
         * Saves preference to localStorage
         */
        showDebug('Setting up theme toggle');
        var themeToggle = document.getElementById('theme-toggle');
        
        function updateThemeText() {
            var theme = document.documentElement.getAttribute('data-theme');
            var themeText = document.querySelector('.theme-text');
            if (themeText) {
                themeText.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
            }
        }
        
        function toggleTheme(e) {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Stop event bubbling
            
            var theme = document.documentElement.getAttribute('data-theme');
            var newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeText();
        }
        
        // Add both click and touch support for better iOS compatibility
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            themeToggle.addEventListener('touchend', toggleTheme);
        }
        
        // Set initial theme text
        updateThemeText();
        
        // Minor entries toggle removed - now in filter drawer only
        
        // Setup minor toggle in filter drawer
        var filterMinorToggle = document.getElementById('filter-minor-toggle');
        if (filterMinorToggle) {
            // Set initial state to match body class
            filterMinorToggle.checked = !document.body.classList.contains('hide-minor');
            
            filterMinorToggle.addEventListener('change', function(e) {
                if (e.target.checked) {
                    document.body.classList.remove('hide-minor');
                } else {
                    document.body.classList.add('hide-minor');
                }
                
                // Update the old toggle in menu if it still exists
                updateMinorToggleState();
                
                // Update filter status
                if (typeof updateFilterStatus !== 'undefined') {
                    updateFilterStatus();
                }
                
                // Dispatch event for persistent search bar
                window.dispatchEvent(new CustomEvent('filtersChanged', {
                    detail: { showMinor: e.target.checked }
                }))
            });
        }
        
        // About modal functionality
        showDebug('Setting up about modal');
        var aboutButton = document.getElementById('about-button');
        var aboutModal = document.getElementById('about-modal');
        var modalClose = document.getElementById('modal-close');
        
        function openModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (aboutModal) {
                aboutModal.classList.add('active');
            }
        }
        
        function closeModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (aboutModal) {
                aboutModal.classList.remove('active');
            }
        }
        
        // Add both click and touch support
        if (aboutButton) {
            aboutButton.addEventListener('click', openModal);
            aboutButton.addEventListener('touchend', openModal);
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
            modalClose.addEventListener('touchend', closeModal);
        }
        
        // Export functionality - only show if export=true in URL
        showDebug('Setting up export functionality');
        var exportModal = document.getElementById('export-modal');
        var exportModalClose = document.getElementById('export-modal-close');
        var exportForm = document.getElementById('export-form');
        var exportPassword = document.getElementById('export-password');
        var exportError = document.getElementById('export-error');
        
        // Check if export=true is in URL
        var urlParams = new URLSearchParams(window.location.search);
        var shouldShowExport = urlParams.get('export') === 'true';
        var exportButton = null;
        
        if (shouldShowExport) {
            // Create and insert export button dynamically
            showDebug('Creating export button - export=true');
            
            exportButton = document.createElement('button');
            exportButton.className = 'export-button';
            exportButton.id = 'export-button';
            exportButton.setAttribute('aria-label', 'Export Timeline');
            
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'white');
            
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z');
            svg.appendChild(path);
            
            var span = document.createElement('span');
            span.textContent = 'Export Timeline';
            
            exportButton.appendChild(svg);
            exportButton.appendChild(span);
            
            // Insert before the About button (which should be last)
            var aboutButton = document.getElementById('about-button');
            if (aboutButton && aboutButton.parentNode) {
                aboutButton.parentNode.insertBefore(exportButton, aboutButton);
            }
        } else {
            showDebug('Export button not created - export parameter not true');
        }
        
        // Password hash for export functionality
        // To generate a new hash, use: btoa(password) in browser console
        var EXPORT_PASSWORD_HASH = 'Z2lwc3loaWxsMjAyNQ==';
        
        function openExportModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            exportModal.style.display = 'flex';
            exportPassword.value = '';
            exportError.textContent = '';
            // Don't auto-focus on mobile as it can cause issues
            if (window.innerWidth > 768) {
                exportPassword.focus();
            }
        }
        
        function closeExportModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            exportModal.style.display = 'none';
        }
        
        // Add both click and touch support
        if (exportButton) {
            exportButton.addEventListener('click', openExportModal);
            exportButton.addEventListener('touchend', openExportModal);
        }
        
        if (exportModalClose) {
            exportModalClose.addEventListener('click', closeExportModal);
            exportModalClose.addEventListener('touchend', closeExportModal);
        }
        
        // Close modal when clicking outside
        if (exportModal) {
            exportModal.addEventListener('click', function(e) {
                if (e.target === exportModal) {
                    closeExportModal();
                }
            });
        }
        
        
        if (exportForm) {
            exportForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Compare the base64 encoded input with stored hash
                if (btoa(exportPassword.value) !== EXPORT_PASSWORD_HASH) {
                    exportError.textContent = 'Incorrect password';
                    exportPassword.value = '';
                    return;
                }
                
                // Generate text export
                var exportText;
                try {
                    exportText = generateTimelineExport();
                    if (!exportText || exportText.length === 0) {
                        throw new Error('Export text is empty');
                    }
                } catch (error) {
                    exportError.textContent = 'Error generating export: ' + error.message;
                    console.error('Export error:', error);
                    return;
                }
                
                // Check if we're on iOS
                var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                
                if (isIOS) {
                    // For iOS, open in a new window since download attribute doesn't work well
                    var blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                    var url = URL.createObjectURL(blob);
                    
                    // Open in new window
                    var newWindow = window.open(url, '_blank');
                    
                    // Show success message
                    exportError.style.color = '#28a745';
                    exportError.textContent = 'Export opened in new tab. Use Share button to save.';
                    
                    // Clean up after a delay
                    setTimeout(function() {
                        URL.revokeObjectURL(url);
                    }, 60000); // Keep URL valid for 1 minute
                    
                    // Don't close modal immediately on iOS so user can see the message
                    setTimeout(function() {
                        closeExportModal();
                        exportPassword.value = '';
                        exportError.style.color = '';
                        exportError.textContent = '';
                    }, 3000);
                } else {
                    // For other browsers, use normal download
                    var blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'gipsy-hill-timeline-' + new Date().toISOString().split('T')[0] + '.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    // Close modal
                    closeExportModal();
                    exportPassword.value = '';
                }
            });
        }
        
        if (aboutModal) {
            aboutModal.addEventListener('click', function(e) {
                if (e.target === aboutModal) {
                    closeModal(e);
                }
            });
        }
        
        // Header contribute link functionality (removed - element doesn't exist in HTML)
        
        // Get container
        showDebug('Looking for timeline container');
        var container = document.getElementById('timeline-items');
        if (!container) {
            showError('Timeline container not found!');
            return;
        }
        showDebug('Found timeline container');

        // Create timeline items using DOM methods
        // Check if page is already scrolled (user reloaded while viewing references)
        var skipAnimations = window.pageYOffset > 100 || window.location.hash.includes('ref-');
        if (skipAnimations) {
            document.body.classList.add('skip-animations');
            // Add style to immediately show timeline items
            var style = document.createElement('style');
            style.textContent = '.timeline-item { opacity: 1 !important; transform: none !important; animation: none !important; }';
            document.head.appendChild(style);
        }
        
        showDebug('Creating ' + timelineData.length + ' timeline items');
        for (var i = 0; i < timelineData.length; i++) {
        var item = timelineData[i];
        
        // Skip undefined or null items (can happen with data formatting issues)
        if (!item) {
            console.warn('Skipping undefined item at index ' + i);
            continue;
        }
        
        // Skip inactive entries (default to active if not specified)
        if (item.active === false) {
            continue;
        }
        
        // Create timeline item container
        var timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        // Add minor or major class based on importance
        if (item.importance === 'minor') {
            timelineItem.className += ' minor';
        } else {
            timelineItem.className += ' major';
        }
        // Add data-icon attribute for styling purposes
        if (item.icon) {
            timelineItem.setAttribute('data-icon', item.icon);
        }
        // Add category data attribute for filtering
        if (item.category) {
            timelineItem.dataset.category = item.category;
        }
        // Animation removed to prevent rendering issues

        // Create timeline dot
        var dot = document.createElement('div');
        dot.className = 'timeline-dot';
        timelineItem.appendChild(dot);

        // Create date element
        var dateEl = document.createElement('div');
        dateEl.className = 'timeline-date';
        dateEl.textContent = item.date;
        timelineItem.appendChild(dateEl);

        // Create content container
        var content = document.createElement('div');
        content.className = 'timeline-content';

        // Create content header
        var header = document.createElement('div');
        header.className = 'content-header';

        // Create icon
        var iconDiv = document.createElement('div');
        iconDiv.className = 'content-icon';
        if (item.icon === 'fogh') {
            iconDiv.className += ' fogh';
            var foghSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            foghSvg.setAttribute('version', '1.0');
            foghSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            foghSvg.setAttribute('viewBox', '0 0 450 247');
            foghSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            foghSvg.innerHTML = foghIcon;
            iconDiv.appendChild(foghSvg);
        } else {
            // Load icon from file
            var iconPath = 'icons/' + (item.icon || 'house') + '.svg';
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            
            // Create a placeholder while loading
            svg.innerHTML = '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/>';
            iconDiv.appendChild(svg);
            
            // Load the actual icon
            (function(svgElement, iconFile) {
                var fetchOptions = window.noCache ? { cache: 'no-store' } : {};
                fetch(iconFile + (window.cacheBust || ''), fetchOptions)
                    .then(function(response) {
                        if (response.ok) {
                            return response.text();
                        }
                        throw new Error('Icon not found');
                    })
                    .then(function(svgContent) {
                        // Extract the path or content from the SVG file
                        var parser = new DOMParser();
                        var svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                        var paths = svgDoc.querySelectorAll('path, g, circle, rect');
                        var content = '';
                        for (var i = 0; i < paths.length; i++) {
                            content += paths[i].outerHTML;
                        }
                        svgElement.innerHTML = content;
                    })
                    .catch(function(error) {
                        console.warn('Failed to load icon ' + iconFile + ':', error);
                        // Fallback to a default icon
                        svgElement.innerHTML = '<path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>';
                    });
            })(svg, iconPath);
        }
        header.appendChild(iconDiv);

        // Create title
        var title = document.createElement('div');
        title.className = 'content-title';
        
        // For minor entries, add "Read more" text
        if (item.importance === 'minor') {
            var titleText = document.createElement('span');
            titleText.className = 'title-text';
            titleText.textContent = item.title;
            title.appendChild(titleText);
            
            var readMoreText = document.createElement('span');
            readMoreText.className = 'read-more-text';
            readMoreText.innerHTML = '→ Read more';
            title.appendChild(readMoreText);
        } else {
            title.textContent = item.title;
        }
        
        header.appendChild(title);

        // Add category badge if category exists
        if (item.category && typeof timelineCategories !== 'undefined' && timelineCategories[item.category]) {
            var categoryBadge = document.createElement('div');
            categoryBadge.className = 'category-badge category-' + item.category;
            categoryBadge.textContent = timelineCategories[item.category].name;
            categoryBadge.title = timelineCategories[item.category].description;
            content.appendChild(categoryBadge);
        }

        content.appendChild(header);

        // Create description (with HTML support for citations)
        var desc = document.createElement('div');
        desc.className = 'content-description timeline-description';
        
        // Add description text
        var descriptionText = item.description;
        
        // Add citation pills if citations exist
        if (item.citations && item.citations.length > 0) {
            descriptionText += ' ';
            var citationPills = item.citations.map(function(num) {
                // Find the citation to get its quality
                var citation = null;
                if (typeof timelineCitations !== 'undefined') {
                    citation = timelineCitations.find(function(c) {
                        return c.number === num;
                    });
                }
                
                var qualityClass = 'medium'; // default
                if (citation) {
                    // Determine the worst indicator between status and quality
                    var statusLevel = 'medium';
                    var qualityLevel = citation.quality ? citation.quality.toLowerCase() : 'medium';
                    
                    // Map status to quality levels
                    if (citation.status) {
                        if (citation.status === 'Verified') {
                            statusLevel = 'high';
                        } else if (citation.status === 'Partial' || citation.status === 'Partially Verified') {
                            statusLevel = 'medium';
                        } else if (citation.status === 'Unverified') {
                            statusLevel = 'low';
                        }
                    }
                    
                    // Use the worst/lowest indicator
                    if (statusLevel === 'low' || qualityLevel === 'low') {
                        qualityClass = 'low';
                    } else if (statusLevel === 'medium' || qualityLevel === 'medium') {
                        qualityClass = 'medium';
                    } else {
                        qualityClass = 'high';
                    }
                }
                
                // Return citation link without icons
                return '<a href="#ref-' + num + '" class="citation-link citation-pill quality-' + qualityClass + '">' + num + '</a>';
            }).join(' ');
            descriptionText += citationPills;
        }
        
        desc.innerHTML = descriptionText;
        content.appendChild(desc);
        
        // Add read more/less indicators
        if (item.importance !== 'minor') {
            // Add read more button for major entries
            var readMore = document.createElement('span');
            readMore.className = 'read-more-indicator';
            readMore.innerHTML = 'Read more →';
            desc.appendChild(readMore);
            
            // Add read less button for major entries
            var readLess = document.createElement('span');
            readLess.className = 'read-less-indicator';
            readLess.innerHTML = '← Show less';
            content.appendChild(readLess);
        } else {
            // Add show less text for minor entries
            var readLessText = document.createElement('div');
            readLessText.className = 'read-less-text';
            readLessText.innerHTML = '← Show less';
            content.appendChild(readLessText);
        }

        // Add image(s) if present, or show contribution prompt
        if (item.image || item.image2 || item.image3) {
            // Collect all images
            var allImages = [];
            if (item.image) allImages.push({ src: item.image, caption: item.imageCaption, captionHTML: item.imageCaptionHTML });
            if (item.image2) allImages.push({ src: item.image2, caption: item.image2Caption, captionHTML: item.image2CaptionHTML });
            if (item.image3) allImages.push({ src: item.image3, caption: item.image3Caption, captionHTML: item.image3CaptionHTML });
            
            // Create container for images
            var imagesWrapper = document.createElement('div');
            imagesWrapper.className = 'content-images-wrapper';
            
            // If multiple images, create leftline carousel
            if (allImages.length > 1) {
                console.log('[TIMELINE] Creating carousel for', item.title, 'with', allImages.length, 'images');
                imagesWrapper.className += ' image-carousel';
                
                // Create leftline carousel container
                var carousel = document.createElement('div');
                carousel.className = 'leftline-carousel'; // Use 'leftline-carousel' class
                
                // Add all images directly to carousel with data-caption attributes
                allImages.forEach(function(imageData, index) {
                    var img = document.createElement('img');
                    
                    // Generate thumbnail path
                    var thumbSrc = imageData.src;
                    var lastDot = imageData.src.lastIndexOf('.');
                    if (lastDot > -1) {
                        var basePath = imageData.src.substring(0, lastDot);
                        var ext = imageData.src.substring(lastDot);
                        thumbSrc = basePath + '-thumb' + ext;
                    }
                    
                    img.src = thumbSrc;
                    img.setAttribute('data-full-src', imageData.src); // Store full-size image URL
                    img.loading = 'lazy';
                    
                    // Store caption data for modal
                    if (imageData.caption) {
                        img.setAttribute('data-modal-caption', imageData.caption);
                    }
                    if (imageData.captionHTML) {
                        img.setAttribute('data-modal-caption-html', imageData.captionHTML);
                    }
                    
                    // Add click handler directly to the image before carousel processes it
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', function(e) {
                        console.log('[TIMELINE] Direct image click handler fired!');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        var fullSrc = imageData.src;
                        var caption = imageData.caption || '';
                        var captionHTML = imageData.captionHTML || null;
                        
                        console.log('[TIMELINE] Opening modal from direct handler:', fullSrc);
                        
                        // Use setTimeout to ensure modal opens after any other handlers
                        setTimeout(function() {
                            if (window.openImageModal) {
                                window.openImageModal(fullSrc, caption, captionHTML);
                            } else {
                                // If openImageModal isn't ready yet, wait and try again
                                var attempts = 0;
                                var tryOpen = setInterval(function() {
                                    attempts++;
                                    if (window.openImageModal) {
                                        window.openImageModal(fullSrc, caption, captionHTML);
                                        clearInterval(tryOpen);
                                    } else if (attempts > 10) {
                                        console.error('[TIMELINE] Failed to find openImageModal after 10 attempts');
                                        clearInterval(tryOpen);
                                    }
                                }, 100);
                            }
                        }, 0);
                    });
                    
                    // Add error handler to fallback to original if thumbnail doesn't exist
                    img.addEventListener('error', function() {
                        if (img.src !== imageData.src) {
                            img.src = imageData.src;
                        }
                    });
                    
                    // Add alt text for accessibility
                    img.alt = imageData.caption ? imageData.caption.replace(/<[^>]*>/g, '') : item.title || 'Timeline image';
                    
                    // Add data-caption attribute for leftline carousel (strip HTML)
                    if (imageData.caption) {
                        // Strip HTML tags from caption for clean display
                        var cleanCaption = imageData.caption.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                        img.setAttribute('data-caption', cleanCaption);
                    }
                    
                    // Add image directly to carousel container
                    carousel.appendChild(img);
                });
                
                // Leftline carousel will auto-enhance this container
                imagesWrapper.appendChild(carousel);
                
                // Manually trigger carousel enhancement if Leftline is available
                if (window.Leftline && window.Leftline.mount) {
                    setTimeout(function() {
                        console.log('[TIMELINE] Mounting carousel for', item.title, 'with', carousel.querySelectorAll('img').length, 'images');
                        
                        // Check if openImageModal is available
                        if (!window.openImageModal) {
                            console.error('[TIMELINE] openImageModal not available when mounting carousel');
                        } else {
                            console.log('[TIMELINE] openImageModal is available for carousel');
                        }
                        
                        var result = window.Leftline.mount(carousel);
                        console.log('[TIMELINE] Mount result:', result ? 'success' : 'failed');
                        
                        // Add fallback click handlers to carousel images after mounting
                        // This ensures modal opens even if Leftline's handlers don't work
                        setTimeout(function() {
                            // Try multiple selectors to find carousel images
                            var selectors = [
                                '.leftline-media img',
                                '.leftline-carousel img',
                                '.leftline-item img',
                                '.leftline-figure img',
                                'img'
                            ];
                            
                            var carouselImages = null;
                            for (var i = 0; i < selectors.length; i++) {
                                carouselImages = carousel.querySelectorAll(selectors[i]);
                                if (carouselImages.length > 0) {
                                    console.log('[TIMELINE] Found', carouselImages.length, 'images with selector:', selectors[i]);
                                    break;
                                }
                            }
                            
                            if (!carouselImages || carouselImages.length === 0) {
                                console.error('[TIMELINE] No carousel images found!');
                                console.log('[TIMELINE] Carousel HTML:', carousel.innerHTML.substring(0, 500));
                                return;
                            }
                            
                            console.log('[TIMELINE] Adding click handlers to', carouselImages.length, 'carousel images');
                            carouselImages.forEach(function(img, index) {
                                console.log('[TIMELINE] Processing image', index, '- src:', img.src.substring(img.src.lastIndexOf('/') + 1));
                                
                                // Remove any existing click handlers to avoid conflicts
                                var newImg = img.cloneNode(true);
                                img.parentNode.replaceChild(newImg, img);
                                
                                // Add our click handler
                                newImg.style.cursor = 'pointer';
                                newImg.setAttribute('data-modal-handler', 'true');
                                
                                newImg.addEventListener('click', function(e) {
                                    console.log('[TIMELINE] Image clicked! Event:', e);
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    var fullSrc = newImg.getAttribute('data-full-src') || newImg.src;
                                    var caption = newImg.getAttribute('data-modal-caption') || newImg.getAttribute('data-caption') || newImg.alt || '';
                                    var captionHTML = newImg.getAttribute('data-modal-caption-html') || null;
                                    
                                    console.log('[TIMELINE] Opening modal with:', {
                                        fullSrc: fullSrc,
                                        caption: caption,
                                        captionHTML: captionHTML
                                    });
                                    
                                    if (window.openImageModal) {
                                        window.openImageModal(fullSrc, caption, captionHTML);
                                    } else {
                                        console.error('[TIMELINE] openImageModal not found!');
                                    }
                                }, true); // Use capture phase
                            });
                        }, 500); // Wait longer for Leftline to finish setup
                    }, 100);
                } else {
                    console.log('[TIMELINE] Leftline not available yet for', item.title);
                }
            } else {
                // Single image - use original layout
                imagesWrapper.appendChild(createImageWithCaption(
                    allImages[0].src,
                    allImages[0].caption,
                    allImages[0].captionHTML,
                    false
                ));
            }
            
            content.appendChild(imagesWrapper);
            
            // Helper function to create image element with caption
            function createImageWithCaption(imageSrc, captionText, captionHTML, index) {
                var imageContainer = document.createElement('div');
                imageContainer.className = 'content-image';
                
                var img = document.createElement('img');
                
                // Generate thumbnail path
                var thumbSrc = imageSrc;
                var lastDot = imageSrc.lastIndexOf('.');
                if (lastDot > -1) {
                    var basePath = imageSrc.substring(0, lastDot);
                    var ext = imageSrc.substring(lastDot);
                    thumbSrc = basePath + '-thumb' + ext;
                }
                
                // Use thumbnail for display, full image for modal
                img.src = thumbSrc;
                img.setAttribute('data-full-src', imageSrc); // Store full-size image URL
                img.alt = item.title;
                img.loading = 'lazy'; // Add lazy loading
                
                // Track if this is a swipe to prevent modal opening
                var touchMoved = false;
                var touchStartPos = null;
                
                img.addEventListener('touchstart', function(e) {
                    touchMoved = false;
                    touchStartPos = e.changedTouches[0].screenX;
                }, { passive: true });
                
                img.addEventListener('touchmove', function(e) {
                    if (touchStartPos !== null) {
                        var currentPos = e.changedTouches[0].screenX;
                        if (Math.abs(currentPos - touchStartPos) > 10) {
                            touchMoved = true;
                        }
                    }
                }, { passive: true });
                
                // Handle click for desktop
                img.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageModal(imageSrc, captionText, captionHTML);
                });
                
                // Handle touch for mobile - only open modal if not swiping
                img.addEventListener('touchend', function(e) {
                    if (!touchMoved) {
                        e.preventDefault();
                        e.stopPropagation();
                        openImageModal(imageSrc, captionText, captionHTML);
                    }
                    touchStartPos = null;
                });
                
                // Add error handler to fallback to original image if thumbnail doesn't exist
                img.addEventListener('error', function() {
                    if (img.src !== imageSrc) {
                        img.src = imageSrc;
                    }
                });
                
                // Add image directly to container
                imageContainer.appendChild(img);
                
                if (captionText) {
                    var caption = document.createElement('div');
                    caption.className = 'content-image-caption';
                    if (captionHTML) {
                        caption.innerHTML = captionText;
                    } else {
                        caption.textContent = captionText;
                    }
                    
                    // Set caption width to match image on load
                    function updateCaptionWidth() {
                        if (img.offsetWidth > 0) {
                            imageContainer.style.setProperty('--img-width', img.offsetWidth + 'px');
                            caption.style.maxWidth = img.offsetWidth + 'px';
                        }
                    }
                    
                    img.addEventListener('load', updateCaptionWidth);
                    
                    // Check if already loaded
                    if (img.complete) {
                        setTimeout(updateCaptionWidth, 10);
                    }
                    
                    imageContainer.appendChild(caption);
                }
                
                return imageContainer;
            }
        } else if (item.icon !== 'fogh') {
            // Contribution prompt removed - use suggest edit button instead
        }

        // Suggest edit buttons removed - use menu instead

        timelineItem.appendChild(content);
            container.appendChild(timelineItem);
        }
        showDebug('All ' + timelineData.length + ' timeline items created!');
        
        // Initialize persistent search bar (replaces modal search)
        initializePersistentSearch();
        
        // Initialize hint buttons
        initializeExpandButton();
        
        
        // Initialize timeline search functionality (for backward compatibility)
        showDebug('Initializing timeline search');
        var searchInput = document.querySelector('.timeline-search-input');
        
        showDebug('Search input element: ' + (searchInput ? 'found' : 'NOT FOUND'));
        
        if (searchInput) {
            showDebug('Setting up timeline search handlers');
            function performTimelineSearch() {
                try {
                    var searchTerm = searchInput.value.toLowerCase().trim();
                    var timelineItems = document.querySelectorAll('.timeline-item');
                    var visibleCount = 0;
                    var totalCount = timelineItems.length;
                    
                    showDebug('Performing search for: "' + searchTerm + '"');
                    showDebug('Total timeline items: ' + totalCount);
                
                timelineItems.forEach(function(item) {
                    // Skip minor items if they're hidden
                    var hideMinor = document.body.classList.contains('hide-minor');
                    if (hideMinor && item.classList.contains('minor')) {
                        item.classList.add('search-hidden');
                        return;
                    }
                    
                    // Skip items that are filtered by time - search only within time window
                    if (item.classList.contains('time-filtered')) {
                        // Keep it hidden if outside time range
                        item.classList.add('search-hidden');
                        return;
                    }
                    
                    // Get all searchable text from the timeline item
                    var searchableText = '';
                    
                    // Get date
                    var dateElement = item.querySelector('.timeline-date');
                    if (dateElement && dateElement.textContent) {
                        searchableText += dateElement.textContent + ' ';
                    }
                    
                    // Get title (handle both simple text and nested structure)
                    var titleElement = item.querySelector('.content-title');
                    if (titleElement) {
                        // For minor entries with nested spans, get the first span's text
                        var titleTextSpan = titleElement.querySelector('span');
                        if (titleTextSpan) {
                            searchableText += titleTextSpan.textContent + ' ';
                        } else if (titleElement.textContent) {
                            searchableText += titleElement.textContent + ' ';
                        }
                    }
                    
                    // Get description
                    var descElement = item.querySelector('.content-description');
                    if (descElement && descElement.textContent) {
                        searchableText += descElement.textContent + ' ';
                    }
                    
                    // Get image captions
                    var captionElements = item.querySelectorAll('.image-caption');
                    if (captionElements && captionElements.length > 0) {
                        captionElements.forEach(function(caption) {
                            if (caption && caption.textContent) {
                                searchableText += caption.textContent + ' ';
                            }
                        });
                    }
                    
                    // Get citation numbers
                    var citationElements = item.querySelectorAll('.citation-link');
                    if (citationElements && citationElements.length > 0) {
                        citationElements.forEach(function(citation) {
                            if (citation && citation.textContent) {
                                searchableText += 'citation ' + citation.textContent + ' ';
                            }
                        });
                    }
                    
                    // Check if item matches search (within time window)
                    if (searchTerm === '' || searchableText.toLowerCase().includes(searchTerm)) {
                        item.classList.remove('search-hidden');
                        visibleCount++;
                    } else {
                        item.classList.add('search-hidden');
                    }
                });
                
                // Update unified filter status
                if (window.updateFilterStatus) {
                    window.updateFilterStatus();
                }
                
                // Update filter indicator - this also handles the clear button
                if (window.updateFilterIndicator) {
                    window.updateFilterIndicator();
                }
                
                showDebug('Search complete. Visible: ' + visibleCount + ', Hidden: ' + (totalCount - visibleCount));
                
                // If searching and found results, ensure at least one is visible in viewport
                if (searchTerm && visibleCount > 0) {
                    var firstVisible = document.querySelector('.timeline-item:not(.search-hidden)');
                    if (firstVisible) {
                        var rect = firstVisible.getBoundingClientRect();
                        if (rect.top < 0 || rect.bottom > window.innerHeight) {
                            firstVisible.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
                } catch (error) {
                    console.error('Error in timeline search:', error);
                    showDebug('Search error: ' + error.message);
                }
            }
            
            // Add search event handlers
            searchInput.addEventListener('input', performTimelineSearch);
            searchInput.addEventListener('keyup', performTimelineSearch);
            showDebug('Timeline search event handlers attached');
            
            // Make search function globally accessible for time filter integration
            window.performTimelineSearch = performTimelineSearch;
            
            // Handle search on page load if there's a value
            if (searchInput.value) {
                showDebug('Search input has initial value: ' + searchInput.value);
                performTimelineSearch();
            }
        }
        
        // Add click handlers for minor entries
        showDebug('Adding expand/collapse handlers for minor entries');
        var minorHeaders = document.querySelectorAll('.timeline-item.minor .content-header');
        minorHeaders.forEach(function(header) {
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    timelineItem.classList.toggle('expanded');
                }
            });
            
            // Add touch support for mobile
            header.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    timelineItem.classList.toggle('expanded');
                }
            });
        });
        
        // Handle clicks on "Show less" text for minor entries
        var minorReadLess = document.querySelectorAll('.timeline-item.minor .read-less-text');
        minorReadLess.forEach(function(readLess) {
            readLess.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    timelineItem.classList.remove('expanded');
                    // Scroll the timeline item into view
                    timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
        
        showDebug('Expand/collapse handlers added');
        
        // Add click handlers for major entries' read more/less buttons and description text
        showDebug('Adding expand/collapse handlers for major entries');
        
        // Handle clicks on read more button
        var readMoreButtons = document.querySelectorAll('.timeline-item.major .read-more-indicator');
        readMoreButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    timelineItem.classList.add('expanded');
                }
            });
        });
        
        // Handle clicks on major entry descriptions and titles
        var majorDescriptions = document.querySelectorAll('.timeline-item.major .content-description');
        majorDescriptions.forEach(function(desc) {
            desc.addEventListener('click', function(e) {
                // Don't toggle if clicking on a link or citation
                if (e.target.tagName === 'A' || e.target.tagName === 'SUP' || e.target.closest('a')) {
                    return;
                }
                
                // Don't toggle if clicking on read more/less indicators
                if (e.target.classList.contains('read-more-indicator') || e.target.classList.contains('read-less-indicator')) {
                    return;
                }
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    if (timelineItem.classList.contains('expanded')) {
                        timelineItem.classList.remove('expanded');
                        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        timelineItem.classList.add('expanded');
                    }
                }
            });
        });
        
        // Handle clicks on major entry titles
        var majorTitles = document.querySelectorAll('.timeline-item.major .content-title');
        majorTitles.forEach(function(title) {
            title.addEventListener('click', function(e) {
                e.preventDefault();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    if (timelineItem.classList.contains('expanded')) {
                        timelineItem.classList.remove('expanded');
                        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        timelineItem.classList.add('expanded');
                    }
                }
            });
        });
        
        var readLessButtons = document.querySelectorAll('.timeline-item.major .read-less-indicator');
        readLessButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    timelineItem.classList.remove('expanded');
                    // Scroll the timeline item into view
                    timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
        showDebug('Major entries expand/collapse handlers added');
        
        // Handle clicks on minor entry content to toggle expansion
        var minorEntries = document.querySelectorAll('.timeline-item.minor .timeline-content');
        minorEntries.forEach(function(content) {
            content.addEventListener('click', function(e) {
                // Don't toggle if clicking on links or buttons
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                    return;
                }
                
                // Don't toggle if clicking on "Show less" text
                if (e.target.classList.contains('show-less-text') || e.target.closest('.show-less-text')) {
                    return;
                }
                
                var timelineItem = this.closest('.timeline-item');
                if (timelineItem) {
                    if (timelineItem.classList.contains('expanded')) {
                        timelineItem.classList.remove('expanded');
                        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        timelineItem.classList.add('expanded');
                    }
                }
            });
        });
        showDebug('Minor entries expand/collapse handlers added');
        
        // REMOVED: Citations section - now replaced by References modal accessed via hamburger menu
        // The collapsible citations section has been removed to avoid redundancy
        /*
        // Add citations section if citations exist
        if (typeof timelineCitations !== 'undefined' && timelineCitations.length > 0) {
            showDebug('Adding citations section...');
            var citationsContainer = document.createElement('div');
            citationsContainer.className = 'citation-list';
            
            // Create collapsible header
            var citationsHeader = document.createElement('div');
            citationsHeader.className = 'citations-header';
            citationsHeader.innerHTML = '<h2>References <svg class="collapse-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg></h2>';
            citationsContainer.appendChild(citationsHeader);
            
            // Create collapsible content wrapper
            var citationsContent = document.createElement('div');
            citationsContent.className = 'citations-content collapsed';
            
            // Add work in progress note (if not hidden by user preference)
            var citationsWipHidden = localStorage.getItem('citations-wip-hidden-' + APP_VERSION) === 'true';
            if (!citationsWipHidden) {
                var workInProgressNote = document.createElement('div');
                workInProgressNote.className = 'work-in-progress-note';
                workInProgressNote.id = 'citations-wip-note';
                workInProgressNote.innerHTML = '<button class="wip-close" aria-label="Close notice">×</button>' +
                    '🚧 <strong>We need your help!</strong> This timeline relies on community contributions, especially for citations marked as <span class="status-badge unverified">Unverified</span> or <span class="quality-badge low">Low</span> quality. If you have better sources, spot inaccuracies, or can verify information, please <a href="#" class="suggest-amendment-link">suggest an amendment</a>.';
                citationsContent.appendChild(workInProgressNote);
                
                // Add close button handler
                var closeBtn = workInProgressNote.querySelector('.wip-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        workInProgressNote.style.display = 'none';
                        localStorage.setItem('citations-wip-hidden-' + APP_VERSION, 'true');
                    });
                }
                
                // Add click handler for the suggest amendment link
                var amendmentLink = workInProgressNote.querySelector('.suggest-amendment-link');
                if (amendmentLink) {
                    amendmentLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        // Open submission modal instead of about modal
                        openSubmissionModal('new');
                    });
                }
            }
            
            // Add key/legend
            var keySection = document.createElement('div');
            keySection.className = 'references-key';
            keySection.innerHTML = '<div class="key-title">Reference Key</div>' +
                '<div class="key-grid">' +
                    '<div class="key-section-title">Event Status (Did it happen?)</div>' +
                    '<div class="key-item">' +
                        '<span class="status-badge verified">Verified</span>' +
                        '<span class="key-description">Event/fact confirmed to have occurred</span>' +
                    '</div>' +
                    '<div class="key-item">' +
                        '<span class="status-badge partial">Partial</span>' +
                        '<span class="key-description">Some aspects confirmed, others uncertain</span>' +
                    '</div>' +
                    '<div class="key-item">' +
                        '<span class="status-badge unverified">Unverified</span>' +
                        '<span class="key-description">Event/fact not yet confirmed</span>' +
                    '</div>' +
                    '<div class="key-section-title">Source Quality (How good is the evidence?)</div>' +
                    '<div class="key-item">' +
                        '<span class="quality-badge high">High</span>' +
                        '<span class="key-description">Academic papers, official records, archives</span>' +
                    '</div>' +
                    '<div class="key-item">' +
                        '<span class="quality-badge medium">Medium</span>' +
                        '<span class="key-description">News articles, reputable websites, books</span>' +
                    '</div>' +
                    '<div class="key-item">' +
                        '<span class="quality-badge low">Low</span>' +
                        '<span class="key-description">Blogs, social media, anecdotal sources</span>' +
                    '</div>' +
                '</div>';
            citationsContent.appendChild(keySection);
            
            // Add search box
            var searchSection = document.createElement('div');
            searchSection.className = 'references-search';
            searchSection.innerHTML = '<input type="text" ' +
                       'class="references-search-input" ' +
                       'placeholder="Search references by any text..." ' +
                       'aria-label="Search references">' +
                '<div class="search-results-count"></div>';
            citationsContent.appendChild(searchSection);
            
            var searchInput = searchSection.querySelector('.references-search-input');
            var searchResultsCount = searchSection.querySelector('.search-results-count');
            
            // Add click handler for collapsible header
            citationsHeader.addEventListener('click', function() {
                citationsContent.classList.toggle('collapsed');
                citationsHeader.classList.toggle('expanded');
            });
            
            // Create container for citation cards
            var citationsGrid = document.createElement('div');
            citationsGrid.className = 'citations-grid';
            
            timelineCitations.forEach(function(citation) {
                // Create citation card
                var citationCard = document.createElement('div');
                citationCard.className = 'citation-card';
                citationCard.id = 'ref-' + citation.number;
                citationCard.setAttribute('data-citation-number', citation.number);
                
                // Create card header (always visible)
                var cardHeader = document.createElement('div');
                cardHeader.className = 'citation-card-header';
                
                // Number and title in header
                var headerLeft = document.createElement('div');
                headerLeft.className = 'citation-header-left';
                
                var citationNumber = document.createElement('span');
                citationNumber.className = 'citation-number';
                citationNumber.textContent = citation.number;
                headerLeft.appendChild(citationNumber);
                
                var citationTitle = document.createElement('span');
                citationTitle.className = 'citation-title';
                citationTitle.textContent = citation.timeline_entry;
                headerLeft.appendChild(citationTitle);
                
                cardHeader.appendChild(headerLeft);
                
                // Status and quality badges in header
                var headerRight = document.createElement('div');
                headerRight.className = 'citation-header-right';
                
                var statusBadge = document.createElement('span');
                statusBadge.className = 'status-badge ' + (citation.status === 'Verified' ? 'verified' : 
                                                          (citation.status === 'Partial' || citation.status === 'Partially Verified') ? 'partial' : 'unverified');
                statusBadge.textContent = citation.status;
                headerRight.appendChild(statusBadge);
                
                var qualityBadge = document.createElement('span');
                qualityBadge.className = 'quality-badge ' + (citation.quality === 'High' ? 'high' : 
                                                           citation.quality === 'Medium' ? 'medium' : 'low');
                qualityBadge.textContent = citation.quality;
                headerRight.appendChild(qualityBadge);
                
                // Expand/collapse chevron
                var chevron = document.createElement('span');
                chevron.className = 'citation-chevron';
                chevron.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>';
                headerRight.appendChild(chevron);
                
                cardHeader.appendChild(headerRight);
                citationCard.appendChild(cardHeader);
                
                // Create card body (collapsible)
                var cardBody = document.createElement('div');
                cardBody.className = 'citation-card-body collapsed';
                
                // Summary
                var summaryDiv = document.createElement('div');
                summaryDiv.className = 'citation-detail';
                summaryDiv.innerHTML = '<strong>Summary:</strong> ' + citation.source;
                cardBody.appendChild(summaryDiv);
                
                // Sources
                if (citation.url || (citation.additional_urls && citation.additional_urls.length > 0)) {
                    var sourcesDiv = document.createElement('div');
                    sourcesDiv.className = 'citation-detail citation-sources';
                    sourcesDiv.innerHTML = '<strong>Sources:</strong> ';
                    
                    // Helper function to extract source name from URL
                    function getSourceName(url) {
                        try {
                            var urlObj = new URL(url);
                            var hostname = urlObj.hostname.replace('www.', '');
                            
                            // Special cases for common sources
                            var sourceNames = {
                                'en.wikipedia.org': 'Wikipedia',
                                'wikipedia.org': 'Wikipedia',
                                'pepysdiary.com': 'Pepys Diary',
                                'norwoodsociety.co.uk': 'Norwood Society',
                                'lambeth.gov.uk': 'Lambeth Council',
                                'croydon.gov.uk': 'Croydon Council',
                                'british-history.ac.uk': 'British History Online',
                                'norwoodstreethistories.org.uk': 'Norwood Street Histories',
                                'gipsyhillfriends.org': 'Friends of Gipsy Hill',
                                'leonardcheshire.org': 'Leonard Cheshire',
                                'dulwichsociety.com': 'Dulwich Society',
                                'historicengland.org.uk': 'Historic England',
                                'legislation.gov.uk': 'UK Legislation',
                                'boroughphotos.org': 'Borough Photos',
                                'commons.wikimedia.org': 'Wikimedia Commons',
                                'archive.org': 'Internet Archive',
                                'britishmuseum.org': 'British Museum',
                                'wellcomecollection.org': 'Wellcome Collection',
                                'nationalgallery.org.uk': 'National Gallery',
                                'rct.uk': 'Royal Collection Trust',
                                'crystalpalacefoundation.org.uk': 'Crystal Palace Foundation',
                                'newspaperarchive.com': 'Newspaper Archive',
                                'wikiwand.com': 'Wikiwand',
                                'hauntedpalaceblog.wordpress.com': 'Haunted Palace Blog',
                                'richlyevocative.net': 'Richly Evocative',
                                'dansteele.net': 'Dan Steele',
                                'bombsight.org': 'Bomb Sight',
                                'livinglondonhistory.com': 'Living London History',
                                'rewind.leonardcheshire.org': 'Leonard Cheshire Archive',
                                'subbrit.org.uk': 'Subterranea Britannica',
                                'independent.co.uk': 'The Independent',
                                'uktransport.fandom.com': 'UK Transport Wiki',
                                'love.lambeth.gov.uk': 'Love Lambeth',
                                'barclays.co.uk': 'Barclays',
                                'diamondgeezer.blogspot.com': 'Diamond Geezer',
                                'gipsyhill.org.uk': 'Christ Church Gipsy Hill',
                                'simonphipps.co.uk': 'Simon Phipps'
                            };
                            
                            // Check if we have a special name for this domain
                            if (sourceNames[hostname]) {
                                return sourceNames[hostname];
                            }
                            
                            // For PDFs, try to extract a meaningful name
                            if (url.toLowerCase().endsWith('.pdf')) {
                                var pathname = urlObj.pathname;
                                var filename = pathname.substring(pathname.lastIndexOf('/') + 1);
                                return filename.replace('.pdf', '').replace(/_/g, ' ').replace(/-/g, ' ')
                                    .split(' ').map(function(word) {
                                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                                    }).join(' ');
                            }
                            
                            // Default: capitalize first letter of domain
                            return hostname.charAt(0).toUpperCase() + hostname.slice(1);
                        } catch (e) {
                            return 'Source';
                        }
                    }
                    
                    if (citation.url) {
                        var primaryLink = document.createElement('a');
                        primaryLink.href = citation.url;
                        primaryLink.textContent = getSourceName(citation.url);
                        primaryLink.target = '_blank';
                        primaryLink.rel = 'noopener';
                        sourcesDiv.appendChild(primaryLink);
                    }
                    
                    if (citation.additional_urls && citation.additional_urls.length > 0) {
                        citation.additional_urls.forEach(function(url, i) {
                            if (citation.url || i > 0) {
                                var separator = document.createElement('span');
                                separator.textContent = ' • ';
                                separator.className = 'source-separator';
                                sourcesDiv.appendChild(separator);
                            }
                            
                            var additionalLink = document.createElement('a');
                            additionalLink.href = url;
                            additionalLink.textContent = getSourceName(url);
                            additionalLink.target = '_blank';
                            additionalLink.rel = 'noopener';
                            sourcesDiv.appendChild(additionalLink);
                        });
                    }
                    
                    cardBody.appendChild(sourcesDiv);
                }
                
                // Notes
                if (citation.notes) {
                    var notesDiv = document.createElement('div');
                    notesDiv.className = 'citation-detail citation-notes';
                    notesDiv.innerHTML = '<strong>Notes:</strong> <em>' + citation.notes + '</em>';
                    cardBody.appendChild(notesDiv);
                }
                
                // Add linked timeline entries
                var linkedEntries = [];
                if (citation.citations) {
                    // For backward compatibility if citations array exists
                    linkedEntries = citation.citations;
                } else {
                    // Find which timeline entries reference this citation
                    timelineData.forEach(function(entry) {
                        if (entry.citations && entry.citations.includes(citation.number)) {
                            linkedEntries.push({
                                date: entry.date,
                                title: entry.title
                            });
                        }
                    });
                }
                
                if (linkedEntries.length > 0) {
                    var linkedDiv = document.createElement('div');
                    linkedDiv.className = 'citation-detail citation-linked-entries';
                    linkedDiv.innerHTML = '<strong>Timeline Entries:</strong> ';
                    
                    var linksList = document.createElement('div');
                    linksList.className = 'linked-entries-list';
                    
                    linkedEntries.forEach(function(entry, index) {
                        if (index > 0) {
                            linksList.appendChild(document.createTextNode(' • '));
                        }
                        var entrySpan = document.createElement('span');
                        entrySpan.className = 'linked-entry';
                        entrySpan.textContent = entry.date + ' - ' + entry.title;
                        linksList.appendChild(entrySpan);
                    });
                    
                    linkedDiv.appendChild(linksList);
                    cardBody.appendChild(linkedDiv);
                }
                
                citationCard.appendChild(cardBody);
                
                // Add click handler for expansion
                cardHeader.addEventListener('click', function() {
                    cardBody.classList.toggle('collapsed');
                    citationCard.classList.toggle('expanded');
                });
                
                citationsGrid.appendChild(citationCard);
            });
            
            citationsContent.appendChild(citationsGrid);
            
            // Add search functionality
            function performSearch() {
                var searchTerm = searchInput.value.toLowerCase().trim();
                var visibleCount = 0;
                var totalCount = timelineCitations.length;
                
                var allCards = citationsGrid.querySelectorAll('.citation-card');
                
                allCards.forEach(function(card, index) {
                    var citationNumber = card.getAttribute('data-citation-number');
                    var citation = timelineCitations.find(function(c) {
                        return c.number === citationNumber;
                    });
                    if (!citation) return;
                    
                    var searchText = [
                        citation.number,
                        citation.timeline_entry,
                        citation.status,
                        citation.quality,
                        citation.source,
                        citation.notes || '',
                        citation.url || ''
                    ].concat(citation.additional_urls || []);
                    
                    // Also search in linked entries
                    var cardLinkedEntries = card.querySelector('.linked-entries-list');
                    if (cardLinkedEntries) {
                        searchText.push(cardLinkedEntries.textContent);
                    }
                    
                    var fullText = searchText.join(' ').toLowerCase();
                    
                    if (searchTerm === '' || fullText.includes(searchTerm)) {
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Update results count
                if (searchTerm === '') {
                    searchResultsCount.textContent = '';
                } else {
                    searchResultsCount.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' references';
                }
            }
            
            // Add search event handlers
            searchInput.addEventListener('input', performSearch);
            searchInput.addEventListener('keyup', performSearch);
            
            // Clear search when citations section is collapsed
            citationsHeader.addEventListener('click', function() {
                if (!citationsContent.classList.contains('collapsed')) {
                    searchInput.value = '';
                    performSearch();
                }
            });
            
            citationsContent.appendChild(citationsGrid);
            
            // Append the content wrapper to the container
            citationsContainer.appendChild(citationsContent);
            
            // Append citations after the timeline container (not inside it)
            var timelineContainer = document.querySelector('.timeline-container');
            timelineContainer.parentNode.insertBefore(citationsContainer, timelineContainer.nextSibling);
            showDebug('Citations section added');
        }
        */
        
        // Removed global contribute-link handler to prevent accidental modal opening
        
        // Enhanced Image Modal with Smart Zoom & Navigation
        showDebug('Setting up enhanced image modal with smart zoom');
        var imageModal = document.getElementById('image-modal');
        var imageModalClose = document.getElementById('image-modal-close');
        var modalImage = document.getElementById('modal-image');
        var modalImageCaption = document.getElementById('modal-image-caption');
        var modalWrapper = document.getElementById('image-modal-wrapper');
        var navigationHint = document.getElementById('zoom-navigation-hint');
        var minimap = document.getElementById('image-minimap');
        var minimapImage = document.getElementById('minimap-image');
        var minimapViewport = document.getElementById('minimap-viewport');
        
        // Zoom state
        var zoomState = {
            level: 1,
            minZoom: 0.5,
            maxZoom: 5,
            x: 0,
            y: 0,
            isPanning: false,
            startX: 0,
            startY: 0,
            imageRect: null,
            wrapperRect: null,
            smoothZoom: true,
            panSpeed: 50,
            zoomSpeed: 0.1
        };
        
        // Zoom controls
        var zoomInBtn = document.getElementById('zoom-in');
        var zoomOutBtn = document.getElementById('zoom-out');
        var zoomResetBtn = document.getElementById('zoom-reset');
        var zoomFitBtn = document.getElementById('zoom-fit');
        var zoomLevelDisplay = document.getElementById('zoom-level');
        var controlsToggle = document.getElementById('controls-toggle');
        var zoomControls = document.getElementById('image-zoom-controls');
        
        // Update zoom with smooth animation and boundaries
        function updateZoom(smooth) {
            if (!modalImage || !modalWrapper) return;
            
            // Get actual dimensions
            var imgWidth = modalImage.naturalWidth || modalImage.width;
            var imgHeight = modalImage.naturalHeight || modalImage.height;
            var wrapperWidth = modalWrapper.clientWidth;
            var wrapperHeight = modalWrapper.clientHeight;
            
            // Calculate max pan distances to keep image in view
            var scaledWidth = imgWidth * zoomState.level;
            var scaledHeight = imgHeight * zoomState.level;
            
            var maxX = Math.max(0, (scaledWidth - wrapperWidth) / 2);
            var maxY = Math.max(0, (scaledHeight - wrapperHeight) / 2);
            
            // Constrain pan
            zoomState.x = Math.max(-maxX, Math.min(maxX, zoomState.x));
            zoomState.y = Math.max(-maxY, Math.min(maxY, zoomState.y));
            
            // Apply transform with proper transition
            var transform = 'scale(' + zoomState.level + ') translate(' + (zoomState.x / zoomState.level) + 'px, ' + (zoomState.y / zoomState.level) + 'px)';
            
            // Use transition only for smooth updates
            if (smooth) {
                modalImage.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                modalImage.style.transition = 'none';
            }
            
            modalImage.style.transform = transform;
            
            // Update UI
            if (zoomLevelDisplay) {
                zoomLevelDisplay.textContent = Math.round(zoomState.level * 100) + '%';
            }
            
            // Update wrapper cursor
            if (modalWrapper) {
                modalWrapper.classList.toggle('can-pan', zoomState.level > 1);
            }
            
            // Show/hide minimap for high zoom levels
            if (minimap) {
                minimap.classList.toggle('active', zoomState.level > 2);
                updateMinimap();
            }
            
            // Show hint when zoomed
            if (navigationHint && zoomState.level > 1) {
                navigationHint.classList.add('visible');
                setTimeout(function() {
                    navigationHint.classList.remove('visible');
                }, 3000);
            }
        }
        
        // Zoom to specific point (for mouse wheel and double-click)
        function zoomToPoint(newLevel, clientX, clientY) {
            if (!modalImage || !modalWrapper) return;
            
            var rect = modalWrapper.getBoundingClientRect();
            var x = clientX - rect.left - rect.width / 2;
            var y = clientY - rect.top - rect.height / 2;
            
            // Calculate new position to keep point under cursor
            var scaleDiff = newLevel / zoomState.level;
            zoomState.x = x - (x - zoomState.x) * scaleDiff;
            zoomState.y = y - (y - zoomState.y) * scaleDiff;
            zoomState.level = newLevel;
            
            updateZoom(true);
        }
        
        // Reset zoom and center image
        function resetZoom() {
            zoomState.level = 1;
            zoomState.x = 0;
            zoomState.y = 0;
            updateZoom(true);
        }
        
        // Fit image to screen
        function fitToScreen() {
            if (!modalImage || !modalWrapper) return;
            
            var wrapperWidth = modalWrapper.clientWidth - 40;
            var wrapperHeight = modalWrapper.clientHeight - 40;
            var imageWidth = modalImage.naturalWidth;
            var imageHeight = modalImage.naturalHeight;
            
            var scaleX = wrapperWidth / imageWidth;
            var scaleY = wrapperHeight / imageHeight;
            
            zoomState.level = Math.min(scaleX, scaleY, 1);
            zoomState.x = 0;
            zoomState.y = 0;
            updateZoom(true);
        }
        
        // Pan by amount
        function pan(dx, dy) {
            zoomState.x += dx;
            zoomState.y += dy;
            updateZoom(false);
        }
        
        // Update minimap
        function updateMinimap() {
            if (!minimap || !minimapViewport || !modalImage || zoomState.level <= 2) return;
            
            // Get minimap dimensions
            var minimapWidth = 200;
            var minimapHeight = 150;
            
            // Calculate scale to fit image in minimap
            var imgAspect = modalImage.naturalWidth / modalImage.naturalHeight;
            var minimapAspect = minimapWidth / minimapHeight;
            
            var scale;
            if (imgAspect > minimapAspect) {
                scale = minimapWidth / modalImage.naturalWidth;
            } else {
                scale = minimapHeight / modalImage.naturalHeight;
            }
            
            // Calculate viewport size in minimap
            var viewportWidth = (modalWrapper.clientWidth / zoomState.level) * scale;
            var viewportHeight = (modalWrapper.clientHeight / zoomState.level) * scale;
            
            // Calculate viewport position (centered)
            var centerX = minimapWidth / 2;
            var centerY = minimapHeight / 2;
            var viewportX = centerX - (zoomState.x * scale / zoomState.level) - viewportWidth / 2;
            var viewportY = centerY - (zoomState.y * scale / zoomState.level) - viewportHeight / 2;
            
            minimapViewport.style.width = viewportWidth + 'px';
            minimapViewport.style.height = viewportHeight + 'px';
            minimapViewport.style.left = viewportX + 'px';
            minimapViewport.style.top = viewportY + 'px';
        }
        
        // Make minimap interactive
        if (minimap) {
            minimap.addEventListener('click', function(e) {
                if (zoomState.level <= 2 || !modalImage) return;
                
                var rect = minimap.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                
                // Calculate scale
                var imgAspect = modalImage.naturalWidth / modalImage.naturalHeight;
                var minimapAspect = 200 / 150;
                
                var scale;
                if (imgAspect > minimapAspect) {
                    scale = 200 / modalImage.naturalWidth;
                } else {
                    scale = 150 / modalImage.naturalHeight;
                }
                
                // Convert click position to pan offset
                var centerX = 100;
                var centerY = 75;
                
                zoomState.x = (centerX - x) * zoomState.level / scale;
                zoomState.y = (centerY - y) * zoomState.level / scale;
                
                updateZoom(true);
            });
        }
        
        // Button handlers
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                zoomState.level = Math.min(zoomState.level * 1.5, zoomState.maxZoom);
                updateZoom(true);
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                zoomState.level = Math.max(zoomState.level / 1.5, zoomState.minZoom);
                updateZoom(true);
            });
        }
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', function() {
                resetZoom();
            });
        }
        if (zoomFitBtn) {
            zoomFitBtn.addEventListener('click', function() {
                fitToScreen();
            });
        }
        
        // Controls toggle
        if (controlsToggle && zoomControls) {
            var toggleIcon = document.getElementById('controls-toggle-icon');
            
            controlsToggle.addEventListener('click', function() {
                var isHidden = zoomControls.classList.toggle('hidden');
                controlsToggle.classList.toggle('active', !isHidden);
                
                // Toggle icon between controls.svg and controls-off.svg
                if (toggleIcon) {
                    toggleIcon.src = isHidden ? 'icons/controls-off.svg' : 'icons/controls.svg';
                }
                
                // Store preference
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('hideZoomControls', isHidden ? 'true' : 'false');
                }
            });
            
            // Hide controls by default, restore preference if exists
            if (typeof localStorage !== 'undefined') {
                var hideControls = localStorage.getItem('hideZoomControls');
                // Default to hidden if no preference set
                if (hideControls === null || hideControls === 'true') {
                    zoomControls.classList.add('hidden');
                    controlsToggle.classList.remove('active');
                    if (toggleIcon) {
                        toggleIcon.src = 'icons/controls-off.svg';
                    }
                } else {
                    controlsToggle.classList.add('active');
                    if (toggleIcon) {
                        toggleIcon.src = 'icons/controls.svg';
                    }
                }
            } else {
                // Default to hidden if no localStorage
                zoomControls.classList.add('hidden');
                controlsToggle.classList.remove('active');
                if (toggleIcon) {
                    toggleIcon.src = 'icons/controls-off.svg';
                }
            }
        }
        
        // Mouse wheel zoom (no modifier key needed)
        if (modalWrapper) {
            modalWrapper.addEventListener('wheel', function(e) {
                e.preventDefault();
                var delta = e.deltaY > 0 ? 0.9 : 1.1;
                var newLevel = Math.max(zoomState.minZoom, Math.min(zoomState.maxZoom, zoomState.level * delta));
                zoomToPoint(newLevel, e.clientX, e.clientY);
            }, { passive: false });
            
            // Double-click to zoom
            modalWrapper.addEventListener('dblclick', function(e) {
                e.preventDefault();
                var newLevel = zoomState.level > 1.5 ? 1 : 2.5;
                zoomToPoint(newLevel, e.clientX, e.clientY);
            });
            
            // Pan with mouse
            modalWrapper.addEventListener('mousedown', function(e) {
                if (zoomState.level > 1 && e.button === 0) {
                    zoomState.isPanning = true;
                    zoomState.startX = e.clientX - zoomState.x;
                    zoomState.startY = e.clientY - zoomState.y;
                    modalWrapper.classList.add('panning');
                    e.preventDefault();
                }
            });
            
            // Touch support for panning
            modalWrapper.addEventListener('touchstart', function(e) {
                if (zoomState.level > 1 && e.touches.length === 1) {
                    zoomState.isPanning = true;
                    zoomState.startX = e.touches[0].clientX - zoomState.x;
                    zoomState.startY = e.touches[0].clientY - zoomState.y;
                    modalWrapper.classList.add('panning');
                    e.preventDefault(); // Prevent scrolling the background
                    e.stopPropagation();
                }
            }, { passive: false });
            
            modalWrapper.addEventListener('touchmove', function(e) {
                if (zoomState.isPanning && e.touches.length === 1) {
                    zoomState.x = e.touches[0].clientX - zoomState.startX;
                    zoomState.y = e.touches[0].clientY - zoomState.startY;
                    updateZoom(false);
                    e.preventDefault(); // Prevent scrolling the background
                    e.stopPropagation();
                }
            }, { passive: false });
            
            modalWrapper.addEventListener('touchend', function(e) {
                if (zoomState.isPanning) {
                    zoomState.isPanning = false;
                    modalWrapper.classList.remove('panning');
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Pinch to zoom support
            var initialPinchDistance = 0;
            var initialZoom = 1;
            
            modalWrapper.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    // Calculate initial pinch distance
                    var touch1 = e.touches[0];
                    var touch2 = e.touches[1];
                    initialPinchDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    initialZoom = zoomState.level;
                    e.preventDefault();
                }
            }, { passive: false });
            
            modalWrapper.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2 && initialPinchDistance > 0) {
                    var touch1 = e.touches[0];
                    var touch2 = e.touches[1];
                    var currentDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );
                    
                    var scale = currentDistance / initialPinchDistance;
                    var newZoom = Math.max(zoomState.minZoom, Math.min(zoomState.maxZoom, initialZoom * scale));
                    
                    // Calculate center point between fingers
                    var centerX = (touch1.clientX + touch2.clientX) / 2;
                    var centerY = (touch1.clientY + touch2.clientY) / 2;
                    
                    zoomToPoint(newZoom, centerX, centerY);
                    e.preventDefault();
                }
            }, { passive: false });
            
            modalWrapper.addEventListener('touchend', function(e) {
                if (e.touches.length < 2) {
                    initialPinchDistance = 0;
                }
            }, { passive: false });
            
            document.addEventListener('mousemove', function(e) {
                if (zoomState.isPanning) {
                    zoomState.x = e.clientX - zoomState.startX;
                    zoomState.y = e.clientY - zoomState.startY;
                    updateZoom(false);
                }
            });
            
            document.addEventListener('mouseup', function() {
                if (zoomState.isPanning) {
                    zoomState.isPanning = false;
                    modalWrapper.classList.remove('panning');
                }
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!imageModal || !imageModal.classList.contains('active')) return;
            
            var handled = true;
            switch(e.key) {
                case 'ArrowUp':
                    pan(0, zoomState.panSpeed);
                    break;
                case 'ArrowDown':
                    pan(0, -zoomState.panSpeed);
                    break;
                case 'ArrowLeft':
                    pan(zoomState.panSpeed, 0);
                    break;
                case 'ArrowRight':
                    pan(-zoomState.panSpeed, 0);
                    break;
                case '+':
                case '=':
                    zoomState.level = Math.min(zoomState.level * 1.2, zoomState.maxZoom);
                    updateZoom(true);
                    break;
                case '-':
                case '_':
                    zoomState.level = Math.max(zoomState.level / 1.2, zoomState.minZoom);
                    updateZoom(true);
                    break;
                case ' ':
                case 'r':
                case 'R':
                    e.preventDefault();
                    resetZoom();
                    break;
                case 'c':
                case 'C':
                    if (controlsToggle) {
                        controlsToggle.click();
                    }
                    break;
                case 'f':
                case 'F':
                    fitToScreen();
                    break;
                default:
                    handled = false;
            }
            
            if (handled) {
                e.preventDefault();
            }
        });
        
        function openImageModal(imageSrc, captionText, captionHTML) {
            // Don't reset zoom yet - wait for image to load
            
            if (modalImage) {
                // Clear any previous image
                modalImage.src = '';
                
                // Set new image
                modalImage.src = imageSrc;
                
                // Set minimap image
                if (minimapImage) {
                    minimapImage.src = imageSrc;
                }
                
                // When image loads, set to 100% (actual size)
                modalImage.onload = function() {
                    // Set to 100% zoom (actual pixel size)
                    zoomState.level = 1;
                    zoomState.x = 0;
                    zoomState.y = 0;
                    updateZoom(false);
                    // Now that image is loaded and zoom is set, update minimap
                    updateMinimap();
                };
            }
            if (modalImageCaption) {
                if (captionHTML && captionText) {
                    modalImageCaption.innerHTML = captionText;
                } else if (captionText) {
                    modalImageCaption.textContent = captionText;
                } else {
                    modalImageCaption.innerHTML = '';
                }
            }
            if (imageModal) {
                imageModal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        }
        
        function closeImageModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (imageModal) {
                imageModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
            if (modalImage) {
                modalImage.src = '';
            }
            // Reset zoom when closing
            resetZoom();
        }
        
        // Add close button handler
        if (imageModalClose) {
            imageModalClose.addEventListener('click', closeImageModal);
            imageModalClose.addEventListener('touchend', closeImageModal);
        }
        
        // Removed close on overlay click - only X button should close modal
        // Removed close on Escape key - only X button should close modal
        
        // Make openImageModal accessible globally for the onclick handlers
        window.openImageModal = openImageModal;
        
        // Add click handler for citation links to show in modal
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('citation-link')) {
                e.preventDefault();
                
                var citationNumber = e.target.getAttribute('href').replace('#ref-', '');
                
                // Find the timeline item this citation belongs to
                var timelineItem = e.target.closest('.timeline-item');
                var relatedCitations = null;
                
                if (timelineItem) {
                    // Get all citation links from this timeline item
                    var allCitationLinks = timelineItem.querySelectorAll('.citation-link');
                    if (allCitationLinks.length > 1) {
                        relatedCitations = Array.from(allCitationLinks).map(function(link) {
                            return link.getAttribute('href').replace('#ref-', '');
                        });
                    }
                }
                
                showCitationModal(citationNumber, relatedCitations);
            }
        });
        
        // Helper functions for citation quality and status
        function getQualityClass(citation) {
            if (!citation) return 'low';
            
            // High quality: has source and either details or URL
            if (citation.source && (citation.details || citation.url)) {
                return 'high';
            }
            // Medium quality: has source
            if (citation.source) {
                return 'medium';
            }
            // Low quality: minimal information
            return 'low';
        }
        
        function getStatusClass(citation) {
            if (!citation) return 'unverified';
            
            // Verified: has URL or accessed date
            if (citation.url && citation.accessed) {
                return 'verified';
            }
            // Partial: has some verification
            if (citation.url || citation.details) {
                return 'partial';
            }
            // Unverified: minimal verification
            return 'unverified';
        }
        
        // Function to show citation in modal - matching main page styling exactly
        function showCitationModal(citationNumber, relatedCitations) {
            // Find citation by number property, not array index
            var citation = timelineCitations.find(function(c) {
                return c.number === citationNumber.toString();
            });
            if (!citation) return;
            
            var modal = document.getElementById('citation-modal');
            var modalBody = document.getElementById('citation-modal-body');
            
            if (!modal || !modalBody) return;
            
            // Store related citations for navigation
            modal.currentCitations = relatedCitations || [citationNumber];
            modal.currentIndex = modal.currentCitations.indexOf(citationNumber.toString());
            
            // Build citation card HTML matching the main page structure exactly
            var html = '<div class="citation-card" id="modal-ref-' + citation.number + '">';
            
            // Card header
            html += '<div class="citation-card-header">';
            
            // Left side - number and title
            html += '<div class="citation-header-left">';
            html += '<span class="citation-number">' + citation.number + '</span>';
            html += '<span class="citation-title">' + (citation.timeline_entry || '') + '</span>';
            html += '</div>';
            
            // Right side - status and quality badges
            html += '<div class="citation-header-right">';
            
            // Status badge - make clickable
            var statusClass = citation.status === 'Verified' ? 'verified' : 
                            (citation.status === 'Partial' || citation.status === 'Partially Verified') ? 'partial' : 'unverified';
            html += '<span class="status-badge clickable-badge ' + statusClass + '" onclick="showKeyModal()">' + citation.status + '</span>';
            
            // Quality badge - make clickable
            var qualityClass = citation.quality === 'High' ? 'high' : 
                              citation.quality === 'Medium' ? 'medium' : 'low';
            html += '<span class="quality-badge clickable-badge ' + qualityClass + '" onclick="showKeyModal()">' + citation.quality + '</span>';
            
            html += '</div></div>';
            
            // Card body - expanded by default in modal
            html += '<div class="citation-card-body expanded">';
            
            // Summary (source field)
            if (citation.source) {
                html += '<div class="citation-detail">';
                html += '<strong>Summary:</strong> ' + citation.source;
                html += '</div>';
            }
            
            // Sources section with formatted URLs
            if (citation.url || (citation.additional_urls && citation.additional_urls.length > 0)) {
                html += '<div class="citation-detail citation-sources">';
                html += '<strong>Sources:</strong> ';
                
                // Helper function to extract source name from URL
                function getSourceName(url) {
                    try {
                        var urlObj = new URL(url);
                        var hostname = urlObj.hostname.replace('www.', '');
                        
                        var sourceNames = {
                            'en.wikipedia.org': 'Wikipedia',
                            'wikipedia.org': 'Wikipedia',
                            'pepysdiary.com': 'Pepys Diary',
                            'norwoodsociety.co.uk': 'Norwood Society',
                            'lambeth.gov.uk': 'Lambeth Council',
                            'british-history.ac.uk': 'British History Online',
                            'gipsyhillfriends.org': 'Friends of Gipsy Hill',
                            'historicengland.org.uk': 'Historic England',
                            'boroughphotos.org': 'Borough Photos',
                            'commons.wikimedia.org': 'Wikimedia Commons',
                            'archive.org': 'Internet Archive'
                        };
                        
                        return sourceNames[hostname] || hostname;
                    } catch (e) {
                        return 'Link';
                    }
                }
                
                var sourceLinks = [];
                if (citation.url) {
                    sourceLinks.push('<a href="' + citation.url + '" target="_blank">' + 
                                    getSourceName(citation.url) + '</a>');
                }
                
                if (citation.additional_urls && citation.additional_urls.length > 0) {
                    citation.additional_urls.forEach(function(url) {
                        sourceLinks.push('<a href="' + url + '" target="_blank">' + 
                                       getSourceName(url) + '</a>');
                    });
                }
                
                html += sourceLinks.join(', ');
                html += '</div>';
            }
            
            // Additional notes
            if (citation.details || citation.notes) {
                var notesText = citation.details || citation.notes;
                html += '<div class="citation-detail citation-notes">';
                html += '<strong>Notes:</strong> ' + notesText;
                html += '</div>';
            }
            
            // Accessed date
            if (citation.accessed) {
                html += '<div class="citation-detail citation-accessed">';
                html += '<strong>Accessed:</strong> ' + citation.accessed;
                html += '</div>';
            }
            
            // Find linked timeline entries
            var linkedEntries = [];
            timelineData.forEach(function(item) {
                if (item.citations && item.citations.includes(citation.number)) {
                    linkedEntries.push({
                        date: item.date,
                        title: item.title
                    });
                }
            });
            
            if (linkedEntries.length > 0) {
                html += '<div class="citation-detail citation-linked-entries">';
                html += '<strong>Timeline Entries:</strong> ';
                html += '<div class="linked-entries-list">';
                
                linkedEntries.forEach(function(entry, index) {
                    if (index > 0) html += ' • ';
                    html += '<span class="linked-entry-date">' + entry.date + '</span>: ';
                    html += '<span class="linked-entry-title">' + entry.title + '</span>';
                });
                
                html += '</div></div>';
            }
            
            html += '</div></div>';
            
            modalBody.innerHTML = html;
            
            // Add navigation controls to header if there are multiple citations
            var navControls = document.getElementById('citation-nav-controls');
            if (navControls) {
                if (modal.currentCitations && modal.currentCitations.length > 1) {
                    var navHtml = '';
                    navHtml += '<button class="citation-nav-btn citation-nav-prev" ' + 
                            (modal.currentIndex <= 0 ? 'disabled' : '') + ' title="Previous reference">';
                    navHtml += '←</button>';
                    navHtml += '<span class="citation-nav-info">' + 
                            (modal.currentIndex + 1) + ' / ' + modal.currentCitations.length + '</span>';
                    navHtml += '<button class="citation-nav-btn citation-nav-next" ' + 
                            (modal.currentIndex >= modal.currentCitations.length - 1 ? 'disabled' : '') + ' title="Next reference">';
                    navHtml += '→</button>';
                    
                    navControls.innerHTML = navHtml;
                    navControls.style.display = 'flex';
                    
                    // Add navigation event listeners
                    var prevBtn = navControls.querySelector('.citation-nav-prev');
                    var nextBtn = navControls.querySelector('.citation-nav-next');
                    
                    if (prevBtn && !prevBtn.disabled) {
                        prevBtn.addEventListener('click', function() {
                            if (modal.currentIndex > 0) {
                                var prevCitation = modal.currentCitations[modal.currentIndex - 1];
                                showCitationModal(prevCitation, modal.currentCitations);
                            }
                        });
                    }
                    
                    if (nextBtn && !nextBtn.disabled) {
                        nextBtn.addEventListener('click', function() {
                            if (modal.currentIndex < modal.currentCitations.length - 1) {
                                var nextCitation = modal.currentCitations[modal.currentIndex + 1];
                                showCitationModal(nextCitation, modal.currentCitations);
                            }
                        });
                    }
                } else {
                    navControls.innerHTML = '';
                    navControls.style.display = 'none';
                }
            }
            
            modal.classList.add('active');
            
            // Ensure close button is visible
            var closeBtn = document.getElementById('citation-modal-close');
            if (closeBtn) {
                closeBtn.style.display = 'flex';
                closeBtn.style.visibility = 'visible';
                closeBtn.style.zIndex = '1000';
            }
        }
        
        // Function to show key modal
        function showKeyModal() {
            var modal = document.getElementById('key-modal');
            if (modal) {
                modal.classList.add('active');
            }
        }
        
        // Make modal functions globally accessible immediately after definition
        window.showCitationModal = showCitationModal;
        window.showReferencesModal = showReferencesModal;
        window.showKeyModal = showKeyModal;
        
        // Close citation modal
        var citationModalClose = document.getElementById('citation-modal-close');
        if (citationModalClose) {
            citationModalClose.addEventListener('click', function(e) {
                e.stopPropagation();
                var modal = document.getElementById('citation-modal');
                if (modal) modal.classList.remove('active');
            });
            
            // Prevent close button from being hidden accidentally
            citationModalClose.style.display = 'flex';
            citationModalClose.style.visibility = 'visible';
        }
        
        // Close key modal
        var keyModalClose = document.getElementById('key-modal-close');
        if (keyModalClose) {
            keyModalClose.addEventListener('click', function(e) {
                e.stopPropagation();
                var modal = document.getElementById('key-modal');
                if (modal) modal.classList.remove('active');
            });
        }
        
        // References button handler
        var referencesButton = document.getElementById('references-button');
        if (referencesButton) {
            referencesButton.addEventListener('click', function() {
                // Close menu panel
                var menuPanel = document.getElementById('menu-panel');
                if (menuPanel) {
                    menuPanel.classList.remove('active');
                }
                var menuToggle = document.getElementById('menu-toggle');
                if (menuToggle) {
                    menuToggle.querySelector('svg').innerHTML = '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>';
                }
                
                // Show references modal
                if (window.showReferencesModal) {
                    window.showReferencesModal();
                } else {
                    console.error('showReferencesModal function not found');
                }
            });
        }
        
        // Function to show references modal
        function showReferencesModal() {
            var modal = document.getElementById('references-modal');
            var modalBody = document.getElementById('references-modal-body');
            
            if (!modal || !modalBody) return;
            
            // Initialize references with pagination
            initializeReferencesModal();
            modal.classList.add('active');
        }
        
        // Initialize references modal with pagination and filters
        function initializeReferencesModal() {
            var modalBody = document.getElementById('references-modal-body');
            var searchInput = document.querySelector('#references-modal .references-search-input');
            var statusFilter = document.getElementById('status-filter');
            var qualityFilter = document.getElementById('quality-filter');
            var perPageSelect = document.getElementById('per-page');
            var paginationContainer = document.querySelector('.references-pagination');
            var statusDiv = document.querySelector('#references-modal .references-status');
            
            // Ensure key section starts collapsed
            var keySection = document.getElementById('references-key-modal');
            if (keySection) {
                keySection.classList.add('collapsed');
                // Update button text to match collapsed state
                var keyToggleBtn = document.getElementById('toggle-references-key');
                if (keyToggleBtn) {
                    var btnText = keyToggleBtn.querySelector('span');
                    if (btnText) {
                        btnText.textContent = 'Key';
                    }
                }
            }
            
            var currentPage = 1;
            var perPage = 10; // Default to 10 for better readability
            var filteredCitations = [];
            
            // Helper function to extract source name from URL
            function getSourceName(url) {
                try {
                    var urlObj = new URL(url);
                    var hostname = urlObj.hostname.replace('www.', '');
                    
                    var sourceNames = {
                        'en.wikipedia.org': 'Wikipedia',
                        'wikipedia.org': 'Wikipedia',
                        'pepysdiary.com': 'Pepys Diary',
                        'norwoodsociety.co.uk': 'Norwood Society',
                        'lambeth.gov.uk': 'Lambeth Council',
                        'british-history.ac.uk': 'British History Online',
                        'gipsyhillfriends.org': 'Friends of Gipsy Hill',
                        'historicengland.org.uk': 'Historic England',
                        'boroughphotos.org': 'Borough Photos',
                        'commons.wikimedia.org': 'Wikimedia Commons',
                        'archive.org': 'Internet Archive'
                    };
                    
                    return sourceNames[hostname] || hostname;
                } catch (e) {
                    return 'Link';
                }
            }
            
            function updateReferences() {
                // Get filter values
                var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                var statusValue = statusFilter ? statusFilter.value.toLowerCase() : '';
                var qualityValue = qualityFilter ? qualityFilter.value.toLowerCase() : '';
                perPage = perPageSelect ? (perPageSelect.value === 'all' ? 999999 : parseInt(perPageSelect.value)) : 20;
                
                // Filter citations array (0-indexed)
                filteredCitations = [];
                timelineCitations.forEach(function(citation, index) {
                    // Apply status filter
                    if (statusValue) {
                        var citStatus = (citation.status || 'Unverified').toLowerCase();
                        if (citStatus === 'partially verified') citStatus = 'partial';
                        if (statusValue === 'partial' && citStatus !== 'partial' && citStatus !== 'partially verified') return;
                        if (statusValue === 'verified' && citStatus !== 'verified') return;
                        if (statusValue === 'unverified' && citStatus !== 'unverified') return;
                    }
                    
                    // Apply quality filter
                    if (qualityValue) {
                        var citQuality = (citation.quality || 'Low').toLowerCase();
                        if (qualityValue !== citQuality) return;
                    }
                    
                    // Search filter
                    if (searchTerm) {
                        var searchText = (
                            citation.number + ' ' + 
                            (citation.source || '') + ' ' + 
                            (citation.timeline_entry || '') + ' ' +
                            (citation.details || '') + ' ' + 
                            (citation.notes || '')
                        ).toLowerCase();
                        if (!searchText.includes(searchTerm)) return;
                    }
                    
                    filteredCitations.push(citation);
                });
                
                // Calculate pagination
                var totalPages = Math.ceil(filteredCitations.length / perPage);
                if (currentPage > totalPages) currentPage = 1;
                
                var startIndex = (currentPage - 1) * perPage;
                var endIndex = Math.min(startIndex + perPage, filteredCitations.length);
                var pageCitations = filteredCitations.slice(startIndex, endIndex);
                
                // Build HTML for current page - matching main page structure exactly
                var html = '<div class="citations-grid">';
                
                if (pageCitations.length === 0) {
                    html += '<div class="no-results">No references found matching your filters.</div>';
                } else {
                    pageCitations.forEach(function(citation) {
                        html += '<div class="citation-card" id="modal-ref-' + citation.number + '">';
                        
                        // Card header
                        html += '<div class="citation-card-header">';
                        
                        // Left side - number and title
                        html += '<div class="citation-header-left">';
                        html += '<span class="citation-number">' + citation.number + '</span>';
                        html += '<span class="citation-title">' + (citation.timeline_entry || '') + '</span>';
                        html += '</div>';
                        
                        // Right side - status and quality badges
                        html += '<div class="citation-header-right">';
                        
                        // Status badge
                        var statusClass = citation.status === 'Verified' ? 'verified' : 
                                        (citation.status === 'Partial' || citation.status === 'Partially Verified') ? 'partial' : 'unverified';
                        html += '<span class="status-badge ' + statusClass + '">' + citation.status + '</span>';
                        
                        // Quality badge
                        var qualityClass = citation.quality === 'High' ? 'high' : 
                                          citation.quality === 'Medium' ? 'medium' : 'low';
                        html += '<span class="quality-badge ' + qualityClass + '">' + citation.quality + '</span>';
                        
                        // Chevron for expand/collapse
                        html += '<span class="citation-chevron">';
                        html += '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>';
                        html += '</span>';
                        
                        html += '</div></div>';
                        
                        // Card body - collapsed by default, expandable on click
                        html += '<div class="citation-card-body collapsed">';
                        
                        // Summary
                        if (citation.source) {
                            html += '<div class="citation-detail">';
                            html += '<strong>Summary:</strong> ' + citation.source;
                            html += '</div>';
                        }
                        
                        // Sources with formatted links
                        if (citation.url || (citation.additional_urls && citation.additional_urls.length > 0)) {
                            html += '<div class="citation-detail citation-sources">';
                            html += '<strong>Sources:</strong> ';
                            
                            var sourceLinks = [];
                            if (citation.url) {
                                sourceLinks.push('<a href="' + citation.url + '" target="_blank">' + 
                                                getSourceName(citation.url) + '</a>');
                            }
                            
                            if (citation.additional_urls && citation.additional_urls.length > 0) {
                                citation.additional_urls.forEach(function(url) {
                                    sourceLinks.push('<a href="' + url + '" target="_blank">' + 
                                                   getSourceName(url) + '</a>');
                                });
                            }
                            
                            html += sourceLinks.join(', ');
                            html += '</div>';
                        }
                        
                        // Notes
                        if (citation.details || citation.notes) {
                            var notesText = citation.details || citation.notes;
                            html += '<div class="citation-detail citation-notes">';
                            html += '<strong>Notes:</strong> ' + notesText;
                            html += '</div>';
                        }
                        
                        // Accessed date
                        if (citation.accessed) {
                            html += '<div class="citation-detail citation-accessed">';
                            html += '<strong>Accessed:</strong> ' + citation.accessed;
                            html += '</div>';
                        }
                        
                        html += '</div></div>';
                    });
                }
                
                html += '</div>';
                modalBody.innerHTML = html;
                
                // Add click handlers for expand/collapse
                modalBody.querySelectorAll('.citation-card-header').forEach(function(header) {
                    header.addEventListener('click', function() {
                        var card = this.parentElement;
                        var body = card.querySelector('.citation-card-body');
                        var chevron = this.querySelector('.citation-chevron svg');
                        
                        if (body.classList.contains('collapsed')) {
                            body.classList.remove('collapsed');
                            body.classList.add('expanded');
                            if (chevron) {
                                chevron.style.transform = 'rotate(180deg)';
                            }
                        } else {
                            body.classList.add('collapsed');
                            body.classList.remove('expanded');
                            if (chevron) {
                                chevron.style.transform = 'rotate(0deg)';
                            }
                        }
                    });
                });
                
                // Update status
                if (statusDiv) {
                    if (filteredCitations.length === 0) {
                        statusDiv.textContent = 'No references found';
                    } else if (perPageSelect && perPageSelect.value === 'all') {
                        statusDiv.textContent = 'Showing all ' + filteredCitations.length + ' references';
                    } else {
                        statusDiv.textContent = 'Showing ' + startIndex + 1 + '-' + endIndex + ' of ' + filteredCitations.length + ' references';
                    }
                }
                
                // Update pagination
                updatePagination(totalPages);
            }
            
            function updatePagination(totalPages) {
                if (!paginationContainer) return;
                
                var html = '';
                
                if (perPageSelect && perPageSelect.value !== 'all' && totalPages > 1) {
                    // Previous button
                    html += '<button class="pagination-button" ' + (currentPage === 1 ? 'disabled' : '') + ' data-page="prev">Previous</button>';
                    
                    // Calculate page range - always show max 5 numbered buttons
                    var maxButtons = 5;
                    var halfRange = Math.floor(maxButtons / 2);
                    
                    var startPage, endPage;
                    
                    if (totalPages <= maxButtons) {
                        // Show all pages if total is 5 or less
                        startPage = 1;
                        endPage = totalPages;
                    } else {
                        // Center around current page
                        startPage = Math.max(1, currentPage - halfRange);
                        endPage = Math.min(totalPages, startPage + maxButtons - 1);
                        
                        // Adjust if we're near the end
                        if (endPage === totalPages) {
                            startPage = Math.max(1, endPage - maxButtons + 1);
                        }
                    }
                    
                    // Show first page and ellipsis if needed
                    if (startPage > 2) {
                        html += '<button class="pagination-button" data-page="1">1</button>';
                        html += '<span class="pagination-ellipsis">...</span>';
                    } else if (startPage === 2) {
                        html += '<button class="pagination-button" data-page="1">1</button>';
                    }
                    
                    // Show page numbers (max 5 or 3 if we're showing first/last)
                    for (var i = startPage; i <= endPage; i++) {
                        html += '<button class="pagination-button ' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
                    }
                    
                    // Show last page and ellipsis if needed
                    if (endPage < totalPages - 1) {
                        html += '<span class="pagination-ellipsis">...</span>';
                        html += '<button class="pagination-button" data-page="' + totalPages + '">' + totalPages + '</button>';
                    } else if (endPage === totalPages - 1) {
                        html += '<button class="pagination-button" data-page="' + totalPages + '">' + totalPages + '</button>';
                    }
                    
                    // Next button
                    html += '<button class="pagination-button" ' + (currentPage === totalPages ? 'disabled' : '') + ' data-page="next">Next</button>';
                }
                
                paginationContainer.innerHTML = html;
                
                // Add click handlers
                paginationContainer.querySelectorAll('.pagination-button').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var page = this.dataset.page;
                        if (page === 'prev') {
                            currentPage = Math.max(1, currentPage - 1);
                        } else if (page === 'next') {
                            currentPage = Math.min(totalPages, currentPage + 1);
                        } else {
                            currentPage = parseInt(page);
                        }
                        updateReferences();
                    });
                });
            }
            
            // Search clear button (X in search box)
            var searchClearBtn = document.getElementById('clear-search');
            
            // Clear all filters button
            var clearAllBtn = document.getElementById('clear-all-filters');
            
            // Clear references filters button (in header)
            var clearReferencesBtn = document.getElementById('clear-references-filters');
            
            // Function to check if any filters are active and update clear buttons
            function updateClearButtons() {
                var hasSearch = searchInput && searchInput.value;
                var hasStatusFilter = statusFilter && statusFilter.value;
                var hasQualityFilter = qualityFilter && qualityFilter.value;
                var hasAnyFilter = hasSearch || hasStatusFilter || hasQualityFilter;
                
                // Update search clear button
                if (searchClearBtn) {
                    searchClearBtn.style.display = hasSearch ? 'block' : 'none';
                }
                
                // Update clear all button
                if (clearAllBtn) {
                    clearAllBtn.style.display = hasAnyFilter ? 'inline-block' : 'none';
                }
                
                // Update header clear button
                if (clearReferencesBtn) {
                    clearReferencesBtn.style.display = hasAnyFilter ? 'inline-flex' : 'none';
                }
            }
            
            // Set up event listeners
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    currentPage = 1;
                    updateClearButtons();
                    updateReferences();
                });
            }
            
            if (statusFilter) {
                statusFilter.addEventListener('change', function() {
                    currentPage = 1;
                    updateClearButtons();
                    updateReferences();
                });
            }
            
            if (qualityFilter) {
                qualityFilter.addEventListener('change', function() {
                    currentPage = 1;
                    updateClearButtons();
                    updateReferences();
                });
            }
            
            if (perPageSelect) {
                perPageSelect.addEventListener('change', function() {
                    currentPage = 1;
                    updateReferences();
                });
            }
            
            // Search clear button click handler
            if (searchClearBtn) {
                searchClearBtn.addEventListener('click', function() {
                    if (searchInput) {
                        searchInput.value = '';
                        currentPage = 1;
                        updateClearButtons();
                        updateReferences();
                    }
                });
            }
            
            // Clear all button click handler
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    if (statusFilter) statusFilter.value = '';
                    if (qualityFilter) qualityFilter.value = '';
                    currentPage = 1;
                    updateClearButtons();
                    updateReferences();
                });
            }
            
            // Clear references filters button click handler (in header)
            if (clearReferencesBtn) {
                clearReferencesBtn.addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    if (statusFilter) statusFilter.value = '';
                    if (qualityFilter) qualityFilter.value = '';
                    currentPage = 1;
                    updateClearButtons();
                    updateReferences();
                });
            }
            
            // Initial state
            updateClearButtons();
            
            // Key toggle button - set up once
            var keyToggleBtn = document.getElementById('toggle-references-key');
            var keySection = document.getElementById('references-key-modal');
            if (keyToggleBtn && keySection) {
                // Remove any existing listeners to prevent duplicates
                var newKeyToggleBtn = keyToggleBtn.cloneNode(true);
                keyToggleBtn.parentNode.replaceChild(newKeyToggleBtn, keyToggleBtn);
                keyToggleBtn = newKeyToggleBtn;
                
                // Add fresh click listener
                keyToggleBtn.addEventListener('click', function() {
                    var keySectionElement = document.getElementById('references-key-modal');
                    if (keySectionElement) {
                        keySectionElement.classList.toggle('collapsed');
                        // Update button text
                        var btnText = this.querySelector('span');
                        if (btnText) {
                            btnText.textContent = keySectionElement.classList.contains('collapsed') ? 'Key' : 'Hide Key';
                        }
                    }
                });
            }
            
            // Initial load
            updateReferences();
        }
        
        // Close references modal
        var referencesModalClose = document.getElementById('references-modal-close');
        if (referencesModalClose) {
            referencesModalClose.addEventListener('click', function() {
                var modal = document.getElementById('references-modal');
                if (modal) modal.classList.remove('active');
            });
        }
        
        // Citation link handler has been replaced by modal approach
        
        showDebug('Timeline initialization complete!');
        
        // Initialize visual timeline and search features
        showDebug('Initializing timeline features...');
        setTimeout(function() {
            try {
                initializeTimelineSearch();
                initializeVisualTimeline();
            } catch (e) {
                console.error('Error initializing timeline features:', e);
                showError('Failed to initialize timeline features: ' + e.message);
            }
        }, 100);
        
    } catch (error) {
        console.error('Timeline Error:', error);
        showError('Timeline Error: ' + error.message + ' at line ' + error.lineNumber);
        showError('Stack trace: ' + error.stack);
        document.getElementById('loading').textContent = 'Error loading timeline. Check error display.';
    }
}

// Immediately check if we need to skip animations (before DOM loads)
(function() {
    if (window.pageYOffset > 100 || window.location.hash.includes('ref-')) {
        // Add style immediately to prevent flash of hidden content
        var style = document.createElement('style');
        style.textContent = '.timeline-item { opacity: 1 !important; transform: none !important; animation: none !important; }' +
                          '.timeline-dot { opacity: 1 !important; }' +
                          '.timeline-date { opacity: 1 !important; }' +
                          '.timeline-content { opacity: 1 !important; }';
        document.head.appendChild(style);
        if (document.body) {
            document.body.classList.add('skip-animations');
        }
        
        // Also add to html element for higher specificity
        document.documentElement.classList.add('skip-animations');
    }
})();

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM not yet loaded, wait for it
    showDebug('Waiting for DOM to load...');
    document.addEventListener('DOMContentLoaded', initializeTimeline);
} else {
    // DOM is already loaded, run immediately
    showDebug('DOM already loaded, initializing now...');
    initializeTimeline();
}


function generateTimelineExport() {
    var text = 'GIPSY HILL HISTORICAL TIMELINE\n';
    text += '================================\n';
    text += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    text += '2,000 years of Gipsy Hill history – from ancient woodlands to modern community life\n\n';
    
    // Get all timeline entries in their original order
    var entries = [];
    if (typeof timelineData !== 'undefined' && timelineData) {
        entries = timelineData.slice(); // Just copy the array without sorting
    }
    
    if (entries.length === 0) {
        text += 'No timeline entries found.\n';
        return text;
    }
    
    entries.forEach(function(entry, index) {
        // Add simple separator between entries
        text += '\n' + '─'.repeat(50) + '\n\n';
        
        // Mark deactivated entries clearly
        if (entry.active === false) {
            text += '⚠️ DEACTIVATED ENTRY ⚠️\n';
            text += '*** THIS ENTRY IS CURRENTLY HIDDEN FROM THE TIMELINE ***\n\n';
        }
        
        // Add date and title on same line for compactness
        var dateText = entry.date || 'Unknown Date';
        var titlePrefix = (entry.active === false) ? '[DEACTIVATED] ' : '';
        text += dateText + ': ' + titlePrefix + (entry.title || 'Untitled') + '\n\n';
        
        // Add importance
        if (entry.importance) {
            text += 'IMPORTANCE: ' + entry.importance.toUpperCase() + '\n\n';
        }
        
        // Add description
        text += 'DESCRIPTION:\n';
        // Remove HTML tags and decode entities
        var description = (entry.description || 'No description available')
            .replace(/<sup>.*?<\/sup>/g, '') // Remove superscript citations
            .replace(/<[^>]*>/g, '') // Remove other HTML tags
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        text += description + '\n';
        
        // Add image information if available
        if (entry.image) {
            text += '\nIMAGE: ' + entry.image + '\n';
            if (entry.imageCaption) {
                var caption = entry.imageCaption
                    .replace(/<br>/g, ' ')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&');
                text += 'CAPTION: ' + caption + '\n';
            }
        }
        
        // Add second image information if available
        if (entry.image2) {
            text += '\nIMAGE 2: ' + entry.image2 + '\n';
            if (entry.image2Caption) {
                var caption2 = entry.image2Caption
                    .replace(/<br>/g, ' ')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&');
                text += 'CAPTION 2: ' + caption2 + '\n';
            }
        }
        
        // Add third image information if available
        if (entry.image3) {
            text += '\nIMAGE 3: ' + entry.image3 + '\n';
            if (entry.image3Caption) {
                var caption3 = entry.image3Caption
                    .replace(/<br>/g, ' ')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, '&');
                text += 'CAPTION 3: ' + caption3 + '\n';
            }
        }
        
        // Add citations if available
        if (entry.citations && entry.citations.length > 0) {
            text += '\nCITATION REFERENCES: ' + entry.citations.join(', ') + '\n';
        }
    });
    
    text += '\n' + '─'.repeat(50) + '\n';
    text += '\nThis timeline is a community resource built by local residents.\n';
    text += 'Visit https://gipsyhillfriends.org for more information.\n';
    text += '\nNote: Full citation details are available on the website.\n';
    
    return text;
}

// Staticman submission handling
function initializeSubmissionForm() {
    var submissionModal = document.getElementById('submission-modal');
    var submissionForm = document.getElementById('submission-form');
    var submitButton = document.getElementById('submit-button');
    var submissionTabs = document.querySelectorAll('.submission-tab');
    var submissionType = document.getElementById('submissionType');
    
    // Populate the amendment dropdown with existing entries
    function populateAmendmentDropdown() {
        // Get the element fresh each time
        var originalEntrySelect = document.getElementById('originalEntryDate');
        
        console.log('Populating amendment dropdown...');
        console.log('originalEntrySelect:', originalEntrySelect);
        console.log('timelineData available:', typeof timelineData !== 'undefined', timelineData ? timelineData.length : 0);
        
        if (!originalEntrySelect) {
            console.error('originalEntrySelect element not found!');
            return;
        }
        
        originalEntrySelect.innerHTML = '<option value="">Select an entry...</option>';
        if (typeof timelineData !== 'undefined' && timelineData) {
            timelineData.forEach(function(entry) {
                if (entry.active !== false) {
                    var option = document.createElement('option');
                    option.value = entry.date;
                    option.textContent = entry.date + ': ' + entry.title;
                    originalEntrySelect.appendChild(option);
                }
            });
            console.log('Added', originalEntrySelect.options.length - 1, 'entries to dropdown');
        } else {
            console.warn('timelineData not available');
        }
    }
    
    // Handle tab switching
    submissionTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Update active tab
            submissionTabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            
            // Update form based on type
            var type = tab.getAttribute('data-type');
            submissionType.value = type;
            
            // Show/hide relevant fields
            var amendmentOnly = document.querySelectorAll('.amendment-only');
            var newOnly = document.querySelectorAll('.new-only');
            
            if (type === 'amendment') {
                amendmentOnly.forEach(function(el) { 
                    el.style.display = el.tagName === 'SMALL' || el.tagName === 'LABEL' ? 'inline' : 'block'; 
                });
                newOnly.forEach(function(el) { el.style.display = 'none'; });
                document.getElementById('submission-title').textContent = 'Suggest Amendment';
                document.getElementById('date').removeAttribute('required');
                document.getElementById('title').removeAttribute('required');
                document.getElementById('description').removeAttribute('required');
                document.getElementById('amendments').setAttribute('required', 'required');
                document.getElementById('originalEntryDate').setAttribute('required', 'required');
                populateAmendmentDropdown();
                // Clear amendment fields when switching to amendment tab
                var amendmentDropdown = document.getElementById('originalEntryDate');
                if (amendmentDropdown && !amendmentDropdown.value) {
                    document.getElementById('date').value = '';
                    document.getElementById('title').value = '';
                    document.getElementById('description').value = '';
                    document.getElementById('citations').value = '';
                }
            } else {
                amendmentOnly.forEach(function(el) { el.style.display = 'none'; });
                newOnly.forEach(function(el) { 
                    el.style.display = el.tagName === 'SMALL' || el.tagName === 'LABEL' ? 'inline' : 'block'; 
                });
                document.getElementById('submission-title').textContent = 'Suggest New Timeline Entry';
                document.getElementById('date').setAttribute('required', 'required');
                document.getElementById('title').setAttribute('required', 'required');
                document.getElementById('description').setAttribute('required', 'required');
                document.getElementById('amendments').removeAttribute('required');
                document.getElementById('originalEntryDate').removeAttribute('required');
                // Clear form values for new entry
                submissionForm.reset();
                // Explicitly clear fields that may have been populated programmatically
                document.getElementById('date').value = '';
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('citations').value = '';
                document.getElementById('amendments').value = '';
            }
            
            // If in debug mode, repopulate form after tab switch
            if (window.location.search.includes('debug=true')) {
                setTimeout(function() {
                    if (typeof prepopulateDebugData === 'function') {
                        prepopulateDebugData();
                    }
                }, 100);
            }
        });
    });
    
    // Handle form submission - DISABLED: Now handled by staticman-integration.js
    // The Staticman integration script will handle all form submissions
    // submissionForm.addEventListener('submit', function(e) {
    //     [Old email-based submission code removed]
    // });
    
    // Open submission modal handlers
    function openSubmissionModal(type) {
        submissionModal.classList.add('active');
        // Populate the amendment dropdown when modal opens
        populateAmendmentDropdown();
        // Trigger the appropriate tab
        var tabToClick = document.querySelector('.submission-tab[data-type="' + (type || 'new') + '"]');
        if (tabToClick) {
            tabToClick.click();
        }
        
        // If in debug mode, prepopulate form after a short delay
        if (window.location.search.includes('debug=true')) {
            setTimeout(function() {
                if (typeof prepopulateDebugData === 'function') {
                    prepopulateDebugData();
                }
            }, 100);
        }
    }
    
    // Handle header contribute link (removed - element doesn't exist in HTML)
    var urlParams = new URLSearchParams(window.location.search);
    
    // Add New Entry button handler - always available
    var addEntryButton = document.getElementById('add-entry-button');
    if (addEntryButton) {
        showDebug('Found add-entry-button - always available');
        addEntryButton.addEventListener('click', function() {
            openSubmissionModal('new');
        });
    } else {
        showDebug('add-entry-button not found');
    }
    
    // Add "Suggest Edit" buttons to timeline items
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggest-edit')) {
            e.preventDefault();
            var entryDate = e.target.getAttribute('data-date');
            var entryTitle = e.target.getAttribute('data-title');
            var entryDescription = e.target.getAttribute('data-description');
            var entryIcon = e.target.getAttribute('data-icon');
            var entryImportance = e.target.getAttribute('data-importance');
            
            openSubmissionModal('amendment');
            
            // Pre-populate the form with existing values
            setTimeout(function() {
                var originalEntrySelect = document.getElementById('originalEntryDate');
                if (originalEntrySelect) {
                    originalEntrySelect.value = entryDate;
                }
                
                // Populate other fields with current values
                document.getElementById('title').value = entryTitle || '';
                document.getElementById('description').value = entryDescription.replace(/&quot;/g, '"').replace(/<sup>.*?<\/sup>/g, '') || '';
                
                // Only set icon value if the field exists
                var iconField = document.getElementById('icon');
                if (iconField) {
                    iconField.value = entryIcon || '';
                }
                
                // Only set importance value if the field exists
                var importanceField = document.getElementById('importance');
                if (importanceField) {
                    importanceField.value = entryImportance || 'major';
                }
                
                // Show current values section
                var currentValuesDiv = document.getElementById('current-values-display');
                if (currentValuesDiv) {
                    currentValuesDiv.style.display = 'block';
                    document.getElementById('current-title').textContent = entryTitle || 'No title';
                    document.getElementById('current-description').textContent = entryDescription.replace(/&quot;/g, '"').replace(/<[^>]*>/g, '') || 'No description';
                }
            }, 100);
        }
    });
    
    // Close modal handlers
    var submissionModalClose = document.getElementById('submission-modal-close');
    if (submissionModalClose) {
        submissionModalClose.addEventListener('click', function() {
            submissionModal.classList.remove('active');
        });
    }
    
    if (submissionModal) {
        submissionModal.addEventListener('click', function(e) {
            if (e.target === submissionModal) {
                submissionModal.classList.remove('active');
            }
        });
    }
    
    // Amendment dropdown handler is now in staticman-integration.js
    // It gets re-added after form updates to maintain functionality
}

// Initialize submission form when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSubmissionForm);
} else {
    initializeSubmissionForm();
}

// Timeline search initialization function
function initializeTimelineSearch() {
    console.log('Initializing timeline search...');
    var searchInput = document.querySelector('.timeline-search-input');
    
    if (!searchInput) {
        console.log('Timeline search input not found');
        return;
    }
    
    console.log('Timeline search elements found, setting up handlers');
    
    function performTimelineSearch() {
        try {
            var searchTerm = searchInput.value.toLowerCase().trim();
            var timelineItems = document.querySelectorAll('.timeline-item');
            var visibleCount = 0;
            var totalCount = timelineItems.length;
            
            console.log('Searching for:', searchTerm, 'in', totalCount, 'items');
            
            timelineItems.forEach(function(item, index) {
                if (!item) return;
                
                // Skip minor items if they're hidden
                var hideMinor = document.body.classList.contains('hide-minor');
                if (hideMinor && item.classList.contains('minor')) {
                    item.classList.add('search-hidden');
                    return;
                }
                
                // Skip items that are filtered by time - search only within time window
                if (item.classList.contains('time-filtered')) {
                    item.classList.add('search-hidden');
                    return;
                }
                
                var searchableText = '';
                var debugInfo = {};
                
                // Get date
                var dateElem = item.querySelector('.timeline-date');
                if (dateElem && dateElem.textContent) {
                    debugInfo.date = dateElem.textContent;
                    searchableText += dateElem.textContent + ' ';
                }
                
                // Get title
                var titleElem = item.querySelector('.content-title');
                if (titleElem && titleElem.textContent) {
                    debugInfo.title = titleElem.textContent;
                    searchableText += titleElem.textContent + ' ';
                }
                
                // Get description
                var descElem = item.querySelector('.content-description');
                if (descElem && descElem.textContent) {
                    debugInfo.description = descElem.textContent.substring(0, 50) + '...';
                    searchableText += descElem.textContent + ' ';
                }
                
                // Get image captions
                var captions = item.querySelectorAll('.image-caption');
                captions.forEach(function(caption) {
                    if (caption && caption.textContent) {
                        searchableText += caption.textContent + ' ';
                    }
                });
                
                // Get citation numbers
                var citations = item.querySelectorAll('.citation-link');
                citations.forEach(function(citation) {
                    if (citation && citation.textContent) {
                        searchableText += 'citation ' + citation.textContent + ' ';
                    }
                });
                
                // Debug first few items
                if (index < 3 && searchTerm) {
                    console.log('Item', index, debugInfo, 'Searchable text length:', searchableText.length);
                }
                
                // Perform search
                if (searchTerm === '' || searchableText.toLowerCase().includes(searchTerm)) {
                    item.classList.remove('search-hidden');
                    visibleCount++;
                } else {
                    item.classList.add('search-hidden');
                }
            });
            
            // Update unified filter status
            if (window.updateFilterStatus) {
                window.updateFilterStatus();
            }
            
            // Update filter indicator - this also handles the clear button
            if (window.updateFilterIndicator) {
                window.updateFilterIndicator();
            }
            
            // Hide/show timeline line based on results
            var timelineLine = document.querySelector('.timeline-line');
            var timelineContainer = document.querySelector('.timeline-container');
            
            if (searchTerm && visibleCount === 0) {
                // No results found
                if (timelineLine) timelineLine.style.display = 'none';
                
                // Show "no results" message in timeline area
                var noResultsMsg = document.getElementById('no-search-results');
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.id = 'no-search-results';
                    noResultsMsg.style.cssText = 'text-align: center; padding: 60px 20px; color: #666; font-size: 1.2em;';
                    noResultsMsg.innerHTML = '<p>No timeline entries found matching "<strong>' + searchTerm + '</strong>"</p><p style="font-size: 0.9em; margin-top: 10px;">Try searching for different keywords</p>';
                    timelineContainer.appendChild(noResultsMsg);
                } else {
                    noResultsMsg.style.display = 'block';
                    noResultsMsg.querySelector('strong').textContent = searchTerm;
                }
            } else {
                // Results found or search cleared
                if (timelineLine) timelineLine.style.display = '';
                
                // Hide no results message
                var noResultsMsg = document.getElementById('no-search-results');
                if (noResultsMsg) noResultsMsg.style.display = 'none';
            }
            
            console.log('Search complete. Visible:', visibleCount, 'Hidden:', totalCount - visibleCount);
        } catch (error) {
            console.error('Error in timeline search:', error);
        }
    }
    
    // Add event handlers
    searchInput.addEventListener('input', performTimelineSearch);
    searchInput.addEventListener('keyup', performTimelineSearch);
    
    // Make search function globally accessible for time filter integration
    window.performTimelineSearch = performTimelineSearch;
    
    console.log('Timeline search initialized successfully');
}

// Timeline features are now initialized in the main initializeTimeline function

// Make function globally accessible for debugging
window.initializeVisualTimeline = initializeVisualTimeline;

// Test function to manually create histogram bars
window.testVisualTimeline = function() {
    console.log('=== Testing Visual Timeline ===');
    
    var histogram = document.querySelector('.timeline-histogram');
    if (!histogram) {
        console.error('Histogram container not found!');
        return;
    }
    
    console.log('Clearing existing bars...');
    histogram.innerHTML = '';
    
    console.log('Adding 10 test bars...');
    for (var i = 0; i < 10; i++) {
        var bar = document.createElement('div');
        bar.className = 'histogram-bar';
        bar.style.height = (Math.random() * 80 + 20) + '%';
        bar.style.backgroundColor = '#257b46';
        bar.title = 'Test bar ' + i;
        histogram.appendChild(bar);
    }
    
    console.log('Test complete. Bars added: ' + histogram.children.length);
};

// Visual Timeline Navigator
function initializeVisualTimeline() {
    console.log('=== VISUAL TIMELINE START ===');
    console.log('Function called at:', new Date().toISOString());
    
    // Unified filter indicator update function
    function updateFilterIndicator() {
        var filterButton = document.getElementById('filter-toggle-button');
        // Get the filter indicator that's in the filter button specifically
        var filterIndicator = filterButton ? filterButton.querySelector('.filter-indicator') : null;
        
        if (!filterIndicator) {
            // Fallback to global selector if needed
            filterIndicator = document.querySelector('#filter-toggle-button .filter-indicator');
        }
        
        var searchInput = document.querySelector('.timeline-search-input');
        var clearAllButton = document.getElementById('clear-all-filters');
        
        // Check active filters
        var hasSearch = searchInput && searchInput.value.trim() !== '';
        var hasTimeFilter = document.querySelectorAll('.timeline-item.time-filtered').length > 0;
        var hasCategoryFilter = document.querySelectorAll('.timeline-item.category-filtered').length > 0;
        
        // Update clear all button visibility without flickering
        if (clearAllButton) {
            var shouldShow = hasSearch || hasTimeFilter || hasCategoryFilter;
            var isCurrentlyShown = clearAllButton.style.display !== 'none';
            if (shouldShow !== isCurrentlyShown) {
                clearAllButton.style.display = shouldShow ? 'inline-block' : 'none';
            }
        }
        
        // Check if all categories are active (none filtered out)
        var allCategoriesActive = true;
        var categoryPills = document.querySelectorAll('#category-filter-container .category-pill');
        categoryPills.forEach(function(pill) {
            if (pill.classList.contains('inactive')) {
                allCategoriesActive = false;
            }
        });
        var hasActualCategoryFilter = hasCategoryFilter || !allCategoriesActive;
        
        // Check if minor entries are hidden
        var hideMinor = document.body.classList.contains('hide-minor');
        
        // Use the EXACT same selector as updateFilterStatus for consistency
        var visibleItemsSelector = hideMinor 
            ? '.timeline-item:not(.minor):not(.time-filtered):not(.search-hidden):not(.category-filtered)' 
            : '.timeline-item:not(.time-filtered):not(.search-hidden):not(.category-filtered)';
        
        // Force re-query the DOM to get fresh count
        var allVisibleItems = document.querySelectorAll(visibleItemsSelector);
        var visibleItems = allVisibleItems.length;
        
        // Check if we have any active filters
        var hasAnyFilter = hasSearch || hasTimeFilter || hasActualCategoryFilter;
        
        // Update filter button and indicator
        if (hasAnyFilter) {
            if (filterButton) {
                filterButton.classList.add('has-active-filter');
            }
            if (filterIndicator) {
                // Force update the text content
                filterIndicator.textContent = '';  // Clear first
                filterIndicator.textContent = String(visibleItems);  // Set as string
                filterIndicator.style.display = 'inline-flex';
            }
            // Clear all button visibility already handled above
        } else {
            if (filterButton) {
                filterButton.classList.remove('has-active-filter');
            }
            if (filterIndicator) {
                filterIndicator.style.display = 'none';
            }
            // Hide clear all button
            if (clearAllButton) {
                clearAllButton.style.display = 'none';
            }
        }
    }
    
    // Make it globally accessible
    window.updateFilterIndicator = updateFilterIndicator;
    
    // Unified filter status update function
    function updateFilterStatus() {
        var filterStatus = document.getElementById('filter-status');
        if (!filterStatus) return;
        
        // Check if minor entries are hidden
        var hideMinor = document.body.classList.contains('hide-minor');
        
        // Count items based on minor entries visibility
        var totalItemsSelector = hideMinor ? '.timeline-item:not(.minor)' : '.timeline-item';
        var visibleItemsSelector = hideMinor 
            ? '.timeline-item:not(.minor):not(.time-filtered):not(.search-hidden):not(.category-filtered)' 
            : '.timeline-item:not(.time-filtered):not(.search-hidden):not(.category-filtered)';
        
        var totalItems = document.querySelectorAll(totalItemsSelector).length;
        var visibleItems = document.querySelectorAll(visibleItemsSelector).length;
        
        // Get active filters info
        var searchInput = document.querySelector('.timeline-search-input');
        var hasSearch = searchInput && searchInput.value.trim() !== '';
        var hasTimeFilter = document.querySelectorAll('.timeline-item.time-filtered').length > 0;
        var hasCategoryFilter = activeCategoryFilters.size < Object.keys(timelineCategories || {}).length;
        
        if (hasSearch || hasTimeFilter || hideMinor || hasCategoryFilter) {
            filterStatus.textContent = 'Showing ' + visibleItems + ' of ' + totalItems + ' entries';
            filterStatus.style.display = 'block';
        } else {
            filterStatus.textContent = 'Showing all ' + totalItems + ' entries';
            filterStatus.style.display = 'block';
        }
    }
    
    // Make it globally accessible
    window.updateFilterStatus = updateFilterStatus;
    
    // Initialize category filter
    var activeCategoryFilters = new Set(); // Start with all categories active
    
    function initializeCategoryFilter() {
        var container = document.getElementById('category-filter-container');
        if (!container || typeof timelineCategories === 'undefined') return;
        
        // Clear existing pills
        container.innerHTML = '';
        
        // Count entries per category
        var categoryCounts = {};
        var allEntries = document.querySelectorAll('.timeline-item');
        
        // Initialize all categories as active
        for (var catKey in timelineCategories) {
            activeCategoryFilters.add(catKey);
            categoryCounts[catKey] = 0;
        }
        
        // Count entries
        allEntries.forEach(function(entry) {
            // Find the corresponding data item
            var title = entry.querySelector('.content-title');
            if (title) {
                // For minor entries, get the actual title text (not including "→ Read more")
                var titleText;
                var titleTextSpan = title.querySelector('.title-text');
                if (titleTextSpan) {
                    // Minor entry with nested span
                    titleText = titleTextSpan.textContent;
                } else {
                    // Major entry with direct text
                    titleText = title.textContent;
                }
                
                var dataItem = timelineData.find(function(item) {
                    return item.title === titleText;
                });
                if (dataItem && dataItem.category) {
                    categoryCounts[dataItem.category] = (categoryCounts[dataItem.category] || 0) + 1;
                    // Store category on element for filtering
                    entry.dataset.category = dataItem.category;
                }
            }
        });
        
        // Create pills for each category
        for (var categoryKey in timelineCategories) {
            var category = timelineCategories[categoryKey];
            var count = categoryCounts[categoryKey] || 0;
            
            var pill = document.createElement('div');
            pill.className = 'category-pill category-' + categoryKey + ' active';
            pill.dataset.category = categoryKey;
            
            // Apply color from category definition
            var isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
            var bgColor = isDarkTheme ? (category.lightColor || category.color) : category.color;
            if (bgColor) {
                pill.style.backgroundColor = bgColor;
                pill.style.color = 'white';
            }
            
            var nameSpan = document.createElement('span');
            nameSpan.textContent = category.name;
            pill.appendChild(nameSpan);
            
            var countSpan = document.createElement('span');
            countSpan.className = 'category-pill-count';
            countSpan.textContent = '(' + count + ')';
            pill.appendChild(countSpan);
            
            pill.title = category.description + ' - Click to toggle';
            
            // Add click handler
            pill.addEventListener('click', function() {
                var catKey = this.dataset.category;
                var category = timelineCategories[catKey];
                var isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                
                if (activeCategoryFilters.has(catKey)) {
                    activeCategoryFilters.delete(catKey);
                    this.classList.remove('active');
                    this.classList.add('inactive');
                    // Gray out inactive pills
                    this.style.backgroundColor = '';
                    this.style.color = '';
                } else {
                    activeCategoryFilters.add(catKey);
                    this.classList.add('active');
                    this.classList.remove('inactive');
                    // Restore color for active pills
                    var bgColor = isDarkTheme ? (category.lightColor || category.color) : category.color;
                    if (bgColor) {
                        this.style.backgroundColor = bgColor;
                        this.style.color = 'white';
                    }
                }
                
                applyCategoryFilter();
                updateFilterStatus();
                updateFilterIndicator();
                
                // Dispatch event for persistent search bar
                var activeCategories = Array.from(activeCategoryFilters).map(function(key) {
                    return timelineCategories[key].label || key;
                });
                window.dispatchEvent(new CustomEvent('filtersChanged', {
                    detail: { categories: activeCategories }
                }));
            });
            
            container.appendChild(pill);
        }
    }
    
    function applyCategoryFilter() {
        var allEntries = document.querySelectorAll('.timeline-item');
        
        allEntries.forEach(function(entry) {
            var category = entry.dataset.category;
            
            // Apply category filter to both major and minor entries
            // Only show entries whose category is active
            if (!category || activeCategoryFilters.has(category)) {
                entry.classList.remove('category-filtered');
            } else {
                entry.classList.add('category-filtered');
            }
        });
    }
    
    // Initialize categories
    initializeCategoryFilter();
    
    // Initialize filter drawer
    var filterButton = document.getElementById('filter-toggle-button');
    var filterDrawer = document.getElementById('filter-drawer');
    var filterBackdrop = document.getElementById('filter-backdrop');
    var filterDrawerClose = document.getElementById('filter-drawer-close');
    var filterIndicator = document.querySelector('.filter-indicator');
    
    if (filterButton && filterDrawer) {
        // Initialize collapsible sections in filter drawer
        function initializeCollapsibleSections() {
            var collapsibleSections = filterDrawer.querySelectorAll('.collapsible-section');
            collapsibleSections.forEach(function(section) {
                // Start with More Options collapsed
                if (section.classList.contains('more-options-section')) {
                    section.classList.add('collapsed');
                }
                
                var header = section.querySelector('.collapsible-header');
                if (header) {
                    header.addEventListener('click', function() {
                        section.classList.toggle('collapsed');
                        // Update filter drawer size when expanding/collapsing
                        setTimeout(function() {
                            if (window.updateFilterStatus) {
                                window.updateFilterStatus();
                            }
                        }, 300);
                    });
                }
            });
        }
        
        // Initialize on page load
        initializeCollapsibleSections();
        
        // Open filter drawer
        filterButton.addEventListener('click', function() {
            filterDrawer.classList.add('active');
            if (filterBackdrop) filterBackdrop.classList.add('active');
            filterButton.classList.add('drawer-open');
            
            // Update filter status when drawer opens
            updateFilterStatus();
            
            // Update filter indicator to ensure clear all button shows correctly
            if (window.updateFilterIndicator) {
                window.updateFilterIndicator();
            }
            
            // Focus on search input when drawer opens
            setTimeout(function() {
                var searchInput = filterDrawer.querySelector('.timeline-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 300);
            
            // Initialize visual timeline on first open
            if (!window.visualTimelineInitialized) {
                window.visualTimelineInitialized = true;
                // Continue with timeline initialization below
            }
        });
        
        // Close filter drawer function
        function closeFilterDrawer() {
            filterDrawer.classList.remove('active');
            if (filterBackdrop) filterBackdrop.classList.remove('active');
            filterButton.classList.remove('drawer-open');
        }
        
        // Close filter drawer via close button
        if (filterDrawerClose) {
            filterDrawerClose.addEventListener('click', closeFilterDrawer);
        }
        
        // Close filter drawer by clicking backdrop
        if (filterBackdrop) {
            filterBackdrop.addEventListener('click', closeFilterDrawer);
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && filterDrawer.classList.contains('active')) {
                closeFilterDrawer();
            }
        });
    }
    
    try {
        // Get timeline data and parse years
        if (typeof timelineData === 'undefined') {
            console.log('Timeline data not defined - visual timeline cannot be initialized');
            return;
        }
    
    console.log('Timeline data check:', timelineData.length + ' items');
    
    if (!timelineData || timelineData.length === 0) {
        console.log('No timeline data available for visual timeline');
        return;
    }
    
    // Parse years from timeline entries
    var years = [];
    var eventsByYear = {};
    
    timelineData.forEach(function(item) {
        if (item.active === false) return;
        
        // Extract year from date string - handle various formats
        var dateStr = item.date.toLowerCase();
        var year = null;
        
        // Skip BC years
        if (dateStr.includes('bc')) {
            return;
        }
        
        // Handle date ranges like "43-410 AD"
        if (dateStr.match(/(\d{1,4})-(\d{1,4})/)) {
            var rangeMatch = dateStr.match(/(\d{1,4})-(\d{1,4})/);
            year = parseInt(rangeMatch[1]); // Use start year
        }
        // Handle century ranges like "11th-19th c."
        else if (dateStr.match(/(\d{1,2})(st|nd|rd|th)?[\s-]+(\d{1,2})(st|nd|rd|th)?\s*c/)) {
            var centuryRangeMatch = dateStr.match(/(\d{1,2})(st|nd|rd|th)?[\s-]+(\d{1,2})(st|nd|rd|th)?\s*c/);
            var startCentury = parseInt(centuryRangeMatch[1]);
            var endCentury = parseInt(centuryRangeMatch[3]);
            // For ranges, use the midpoint
            var midCentury = Math.floor((startCentury + endCentury) / 2);
            year = (midCentury - 1) * 100 + 50;
        }
        // Handle single centuries like "19th century"
        else if (dateStr.match(/(\d{1,2})(st|nd|rd|th)\s+century/)) {
            var centuryMatch = dateStr.match(/(\d{1,2})(st|nd|rd|th)\s+century/);
            var century = parseInt(centuryMatch[1]);
            year = (century - 1) * 100 + 50; // Use middle of century
        }
        // Handle decades like "1960s"
        else if (dateStr.match(/(\d{4})s/)) {
            var decadeMatch = dateStr.match(/(\d{4})s/);
            year = parseInt(decadeMatch[1]) + 5; // Use middle of decade
        }
        // Handle "early", "mid", "late" century
        else if (dateStr.match(/(early|mid|late)\s+(\d{1,2})(st|nd|rd|th)\s+century/)) {
            var periodMatch = dateStr.match(/(early|mid|late)\s+(\d{1,2})(st|nd|rd|th)\s+century/);
            var period = periodMatch[1];
            var century = parseInt(periodMatch[2]);
            var baseYear = (century - 1) * 100;
            
            if (period === 'early') year = baseYear + 20;
            else if (period === 'mid') year = baseYear + 50;
            else if (period === 'late') year = baseYear + 80;
        }
        // Handle year with parenthetical date like "1856 (October 1)"
        else if (dateStr.match(/(\d{4})\s*\(/)) {
            var parenMatch = dateStr.match(/(\d{4})\s*\(/);
            year = parseInt(parenMatch[1]);
        }
        // Handle simple year or "c. 1066"
        else if (dateStr.match(/(\d{3,4})/)) {
            var simpleMatch = dateStr.match(/(\d{3,4})/);
            year = parseInt(simpleMatch[1]);
        }
        
        // Only include years from Roman era onwards
        if (year && year >= 43) {
            years.push(year);
            if (!eventsByYear[year]) {
                eventsByYear[year] = 0;
            }
            eventsByYear[year]++;
        }
    });
    
    if (years.length === 0) {
        console.log('No valid years found in timeline data');
        return;
    }
    
    // Sort years and find range
    years.sort(function(a, b) { return a - b; });
    var minYear = years[0];
    var maxYear = years[years.length - 1];
    var yearRange = maxYear - minYear;
    
    console.log('Year range:', minYear, 'to', maxYear);
    
    // Group events by century to handle large gaps better
    var eventsByCentury = {};
    years.forEach(function(year) {
        var century = Math.floor(year / 100) * 100;
        if (!eventsByCentury[century]) {
            eventsByCentury[century] = [];
        }
        eventsByCentury[century].push(year);
    });
    
    // Get list of centuries with events
    var activeCenturies = Object.keys(eventsByCentury).map(Number).sort(function(a, b) { return a - b; });
    console.log('Active centuries:', activeCenturies);
    
    // Create periods only for centuries with data
    var periods = [];
    if (yearRange > 1000) {
        // Only include centuries that have events
        activeCenturies.forEach(function(century) {
            var centuryNum;
            var label;
            
            // Calculate century number correctly
            if (century === 0) {
                centuryNum = 1; // Years 1-100 are 1st century
            } else {
                centuryNum = Math.floor(century / 100) + 1;
            }
            
            // Format label with proper ordinals
            if (centuryNum === 1) {
                label = '1st C';
            } else if (centuryNum === 2) {
                label = '2nd C';
            } else if (centuryNum === 3) {
                label = '3rd C';
            } else if (centuryNum === 21) {
                label = '21st C';
            } else if (centuryNum === 22) {
                label = '22nd C';
            } else if (centuryNum === 23) {
                label = '23rd C';
            } else if (centuryNum % 10 === 1 && centuryNum !== 11) {
                label = centuryNum + 'st C';
            } else if (centuryNum % 10 === 2 && centuryNum !== 12) {
                label = centuryNum + 'nd C';
            } else if (centuryNum % 10 === 3 && centuryNum !== 13) {
                label = centuryNum + 'rd C';
            } else {
                label = centuryNum + 'th C';
            }
            
            periods.push({
                start: century,
                end: century + 99,
                label: label,
                hasData: true
            });
        });
    } else {
        // Use decades for smaller ranges
        var startDecade = Math.floor(minYear / 10) * 10;
        var endDecade = Math.ceil(maxYear / 10) * 10;
        
        for (var d = startDecade; d < endDecade; d += 10) {
            periods.push({
                start: d,
                end: d + 9,
                label: d + 's'
            });
        }
    }
    
    // Create histogram data with gap collapsing
    var histogramBins = 50; // Number of bars in the histogram
    var histogram = new Array(histogramBins).fill(0);
    
    // Sort years and create smart segments
    var sortedYears = years.slice().sort(function(a, b) { return a - b; });
    var segments = [];
    var currentSegment = { start: sortedYears[0], end: sortedYears[0], years: [sortedYears[0]] };
    
    // Dynamic gap threshold based on year range
    for (var i = 1; i < sortedYears.length; i++) {
        var gap = sortedYears[i] - sortedYears[i - 1];
        var year = sortedYears[i];
        
        // Use different thresholds for different periods
        var threshold;
        if (year < 1000) {
            threshold = 100;  // Large threshold for ancient times
        } else if (year < 1500) {
            threshold = 50;   // Medium threshold for medieval
        } else if (year < 1800) {
            threshold = 30;   // Smaller for early modern
        } else {
            threshold = 15;   // Small threshold for modern times
        }
        
        if (gap > threshold) {
            // End current segment and start a new one
            segments.push(currentSegment);
            currentSegment = { start: sortedYears[i], end: sortedYears[i], years: [sortedYears[i]] };
        } else {
            // Continue current segment
            currentSegment.end = sortedYears[i];
            currentSegment.years.push(sortedYears[i]);
        }
    }
    segments.push(currentSegment);
    
    console.log('Timeline segments (with dynamic gap thresholds):', segments.length);
    segments.forEach(function(seg, idx) {
        console.log('Segment', idx + 1, ':', seg.start, '-', seg.end, '(', seg.years.length, 'events)');
    });
    
    // Calculate total effective duration with logarithmic scaling
    var totalDuration = segments.reduce(function(sum, seg) {
        var duration = seg.end - seg.start + 1;
        if (duration > 200) {
            return sum + 20 + Math.log10(duration) * 10;
        } else if (duration > 100) {
            return sum + 20 + Math.sqrt(duration - 100);
        } else {
            return sum + Math.min(duration, 20);
        }
    }, 0);
    
    var currentBin = 0;
    var segmentBinMap = [];
    
    segments.forEach(function(segment, idx) {
        // Use logarithmic scaling for early periods with large ranges
        var segmentDuration = segment.end - segment.start + 1;
        var effectiveDuration;
        
        // Apply logarithmic compression for very large durations
        if (segmentDuration > 200) {
            effectiveDuration = 20 + Math.log10(segmentDuration) * 10;
        } else if (segmentDuration > 100) {
            effectiveDuration = 20 + Math.sqrt(segmentDuration - 100);
        } else {
            effectiveDuration = Math.min(segmentDuration, 20);
        }
        
        // Weight heavily towards event density (80%) vs duration (20%) for sparse periods
        var densityWeight = segment.years.length / years.length;
        var durationWeight = effectiveDuration / totalDuration;
        
        // For segments with very few events, reduce their space further
        if (segment.years.length <= 2) {
            densityWeight *= 0.5;  // Halve the weight for sparse segments
        }
        
        var segmentWeight = durationWeight * 0.2 + densityWeight * 0.8;
        
        // Calculate bins with min and max limits
        var segmentBins = Math.round(histogramBins * segmentWeight);
        segmentBins = Math.max(1, segmentBins);  // Minimum 1 bin
        segmentBins = Math.min(segmentBins, Math.floor(histogramBins * 0.3));  // Max 30% of total bins
        
        // Adjust last segment to use remaining bins
        if (idx === segments.length - 1) {
            segmentBins = Math.max(1, histogramBins - currentBin);
        }
        
        segmentBinMap.push({
            segment: segment,
            startBin: currentBin,
            endBin: currentBin + segmentBins - 1,
            bins: segmentBins
        });
        
        // Distribute segment's events across its bins
        segment.years.forEach(function(year) {
            var positionInSegment = (segment.end === segment.start) ? 0.5 : 
                (year - segment.start) / (segment.end - segment.start);
            var binInSegment = Math.floor(positionInSegment * segmentBins);
            var absoluteBin = currentBin + Math.min(binInSegment, segmentBins - 1);
            
            if (absoluteBin >= 0 && absoluteBin < histogramBins) {
                histogram[absoluteBin]++;
            }
        });
        
        currentBin += segmentBins;
    });
    
    // Rebalance if we didn't use all bins
    if (currentBin < histogramBins) {
        var unusedBins = histogramBins - currentBin;
        // Distribute unused bins to segments with most events
        var sortedByEvents = segmentBinMap.slice().sort(function(a, b) {
            return b.segment.years.length - a.segment.years.length;
        });
        
        // Give extra bins to the top event-dense segments
        var binsPerSegment = Math.floor(unusedBins / Math.min(3, sortedByEvents.length));
        for (var i = 0; i < Math.min(3, sortedByEvents.length) && unusedBins > 0; i++) {
            var extraBins = Math.min(binsPerSegment, unusedBins);
            sortedByEvents[i].bins += extraBins;
            sortedByEvents[i].endBin += extraBins;
            unusedBins -= extraBins;
        }
        
        // Recalculate bin positions
        currentBin = 0;
        segmentBinMap.forEach(function(mapping) {
            mapping.startBin = currentBin;
            mapping.endBin = currentBin + mapping.bins - 1;
            currentBin += mapping.bins;
        });
        
        // Redistribute events in updated bins
        histogram = new Array(histogramBins).fill(0);
        segmentBinMap.forEach(function(mapping) {
            var segment = mapping.segment;
            segment.years.forEach(function(year) {
                var positionInSegment = (segment.end === segment.start) ? 0.5 : 
                    (year - segment.start) / (segment.end - segment.start);
                var binInSegment = Math.floor(positionInSegment * mapping.bins);
                var absoluteBin = mapping.startBin + Math.min(binInSegment, mapping.bins - 1);
                
                if (absoluteBin >= 0 && absoluteBin < histogramBins) {
                    histogram[absoluteBin]++;
                }
            });
        });
    }
    
    // Store segment map and bins globally for debugging and access
    window.histogramSegmentMap = segmentBinMap;
    window.histogramBins = histogramBins;
    
    var maxCount = Math.max.apply(null, histogram);
    
    // Build the visual timeline
    var periodsContainer = document.querySelector('.timeline-periods');
    var histogramContainer = document.querySelector('.timeline-histogram');
    var labelsContainer = document.querySelector('.timeline-labels');
    var filterRangeText = document.querySelector('.filter-range-text');
    var clearButton = document.querySelector('.clear-time-filter');
    
    if (!periodsContainer || !histogramContainer) {
        console.log('Visual timeline containers not found');
        console.log('periodsContainer:', periodsContainer);
        console.log('histogramContainer:', histogramContainer);
        return;
    }
    
    // Clear existing content
    periodsContainer.innerHTML = '';
    histogramContainer.innerHTML = '';
    labelsContainer.innerHTML = '';
    
    // Add period labels
    console.log('Adding period labels. Periods:', periods.length);
    periods.forEach(function(period) {
        var periodDiv = document.createElement('div');
        periodDiv.className = 'timeline-period';
        periodDiv.textContent = period.label;
        periodDiv.dataset.start = period.start;
        periodDiv.dataset.end = period.end;
        periodDiv.addEventListener('click', function() {
            filterByPeriod(period.start, period.end);
        });
        periodsContainer.appendChild(periodDiv);
    });
    
    // Add histogram bars with proper year ranges
    var barYearRanges = [];
    
    // Debug logging
    console.log('Creating histogram bars based on segments');
    console.log('Histogram data:', histogram);
    console.log('Max count:', maxCount);
    
    // Create bar-to-year mappings based on segments
    segmentBinMap.forEach(function(mapping) {
        var segment = mapping.segment;
        var bins = mapping.bins;
        
        for (var b = 0; b < bins; b++) {
            var positionInSegment = bins === 1 ? 0.5 : b / (bins - 1);
            var startYear = segment.start + Math.floor(positionInSegment * (segment.end - segment.start));
            var endYear = bins === 1 ? segment.end : 
                segment.start + Math.floor((b + 1) / bins * (segment.end - segment.start));
            
            barYearRanges[mapping.startBin + b] = {
                start: Math.floor(startYear),
                end: Math.floor(endYear)
            };
        }
    });
    
    // Create bars for each histogram entry
    console.log('Creating bars for histogram. Bins:', histogramBins);
    for (var i = 0; i < histogramBins; i++) {
        var count = histogram[i] || 0;
        var bar = document.createElement('div');
        bar.className = 'histogram-bar';
        
        // Always show at least a minimal bar
        if (maxCount > 0) {
            bar.style.height = count > 0 ? ((count / maxCount) * 100) + '%' : '3px';
        } else {
            bar.style.height = '3px';
        }
        
        bar.title = count + ' events';
        
        var yearRange = barYearRanges[i] || { start: minYear, end: maxYear };
        bar.dataset.startYear = yearRange.start;
        bar.dataset.endYear = yearRange.end;
        
        bar.addEventListener('click', function() {
            var start = parseInt(this.dataset.startYear);
            var end = parseInt(this.dataset.endYear);
            filterByYearRange(start, end);
        });
        
        histogramContainer.appendChild(bar);
    }
    
    // Add year labels - limit to prevent overcrowding
    var maxLabels = 6;  // Maximum number of year labels to show
    
    if (segments.length > 1) {
        // For multiple segments, show key points only
        var labelsToShow = [];
        
        // Always add first year
        labelsToShow.push({
            year: segments[0].start,
            position: 0
        });
        
        // Add intermediate labels based on segments
        if (segments.length <= maxLabels - 2) {
            // If few segments, show each segment start
            segmentBinMap.forEach(function(mapping, idx) {
                if (idx > 0 && idx < segments.length) {
                    labelsToShow.push({
                        year: mapping.segment.start,
                        position: (mapping.startBin / histogramBins) * 100
                    });
                }
            });
        } else {
            // If many segments, show evenly spaced labels
            var step = segments.length / (maxLabels - 2);
            for (var i = 1; i < maxLabels - 1; i++) {
                var segmentIdx = Math.round(i * step);
                if (segmentIdx < segments.length && segmentIdx > 0) {
                    var mapping = segmentBinMap[segmentIdx];
                    if (mapping) {
                        labelsToShow.push({
                            year: mapping.segment.start,
                            position: (mapping.startBin / histogramBins) * 100
                        });
                    }
                }
            }
        }
        
        // Always add last year
        var lastSegment = segments[segments.length - 1];
        labelsToShow.push({
            year: lastSegment.end,
            position: 100
        });
        
        // Remove duplicates and sort by position
        var uniqueLabels = [];
        var seenYears = {};
        labelsToShow.forEach(function(labelInfo) {
            if (!seenYears[labelInfo.year]) {
                seenYears[labelInfo.year] = true;
                uniqueLabels.push(labelInfo);
            }
        });
        uniqueLabels.sort(function(a, b) { return a.position - b.position; });
        
        // Remove labels that are too close together (less than 10% apart)
        var filteredLabels = [];
        var lastPosition = -100;
        uniqueLabels.forEach(function(labelInfo, index) {
            if (index === 0 || index === uniqueLabels.length - 1 || labelInfo.position - lastPosition >= 10) {
                filteredLabels.push(labelInfo);
                lastPosition = labelInfo.position;
            }
        });
        uniqueLabels = filteredLabels;
        
        // Add labels to DOM
        uniqueLabels.forEach(function(labelInfo) {
            var label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = labelInfo.year;
            label.style.left = labelInfo.position + '%';
            labelsContainer.appendChild(label);
        });
        
        // Add gap indicators for large gaps (but don't count as labels)
        segmentBinMap.forEach(function(mapping, idx) {
            if (idx < segments.length - 1) {
                var nextSegment = segmentBinMap[idx + 1];
                var gap = nextSegment.segment.start - mapping.segment.end;
                if (gap > 50) {  // Only show ... for very large gaps
                    var gapLabel = document.createElement('div');
                    gapLabel.className = 'timeline-label gap-label';
                    gapLabel.textContent = '...';
                    var gapPosition = ((mapping.endBin + nextSegment.startBin) / 2 / histogramBins) * 100;
                    gapLabel.style.left = gapPosition + '%';
                    gapLabel.style.opacity = '0.5';
                    gapLabel.style.fontSize = '0.6rem';
                    labelsContainer.appendChild(gapLabel);
                }
            }
        });
    } else {
        // Single segment - show evenly spaced labels
        var labelCount = Math.min(5, Math.floor(yearRange / 10) + 1);
        for (var i = 0; i <= labelCount; i++) {
            var year = minYear + (yearRange * i / labelCount);
            var label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = Math.round(year);
            label.style.left = (i * 100 / labelCount) + '%';
            labelsContainer.appendChild(label);
        }
    }
    
    // Filter functions
    function filterByPeriod(startYear, endYear) {
        filterByYearRange(startYear, endYear);
    }
    
    function filterByYearRange(startYear, endYear) {
        console.log('Filtering timeline:', startYear, 'to', endYear);
        
        // Check if this is the full range (no filter)
        var isFullRange = (startYear <= minYear && endYear >= maxYear);
        
        // Dispatch event for persistent search bar
        var timeRangeText = isFullRange ? null : startYear + ' AD - ' + endYear;
        window.dispatchEvent(new CustomEvent('filtersChanged', {
            detail: { timeRange: timeRangeText }
        }));
        
        // Update visual feedback
        updateHistogramHighlight(startYear, endYear);
        
        // Filter timeline items
        var timelineItems = document.querySelectorAll('.timeline-item');
        var visibleCount = 0;
        
        timelineItems.forEach(function(item) {
            var dateText = item.querySelector('.timeline-date');
            if (!dateText) return;
            
            var dateStr = dateText.textContent.toLowerCase();
            var year = null;
            
            // Skip BC years
            if (dateStr.includes('bc')) {
                item.classList.add('time-filtered');
                return;
            }
            
            // Use same parsing logic as above
            if (dateStr.match(/(\d{1,4})-(\d{1,4})/)) {
                var rangeMatch = dateStr.match(/(\d{1,4})-(\d{1,4})/);
                year = parseInt(rangeMatch[1]);
            }
            else if (dateStr.match(/(\d{1,2})(st|nd|rd|th)?[\s-]+(\d{1,2})(st|nd|rd|th)?\s*c/)) {
                var centuryRangeMatch = dateStr.match(/(\d{1,2})(st|nd|rd|th)?[\s-]+(\d{1,2})(st|nd|rd|th)?\s*c/);
                var startCentury = parseInt(centuryRangeMatch[1]);
                var endCentury = parseInt(centuryRangeMatch[3]);
                var midCentury = Math.floor((startCentury + endCentury) / 2);
                year = (midCentury - 1) * 100 + 50;
            }
            else if (dateStr.match(/(\d{1,2})(st|nd|rd|th)\s+century/)) {
                var centuryMatch = dateStr.match(/(\d{1,2})(st|nd|rd|th)\s+century/);
                var century = parseInt(centuryMatch[1]);
                year = (century - 1) * 100 + 50;
            }
            else if (dateStr.match(/(\d{4})s/)) {
                var decadeMatch = dateStr.match(/(\d{4})s/);
                year = parseInt(decadeMatch[1]) + 5;
            }
            else if (dateStr.match(/(early|mid|late)\s+(\d{1,2})(st|nd|rd|th)\s+century/)) {
                var periodMatch = dateStr.match(/(early|mid|late)\s+(\d{1,2})(st|nd|rd|th)\s+century/);
                var period = periodMatch[1];
                var century = parseInt(periodMatch[2]);
                var baseYear = (century - 1) * 100;
                
                if (period === 'early') year = baseYear + 20;
                else if (period === 'mid') year = baseYear + 50;
                else if (period === 'late') year = baseYear + 80;
            }
            else if (dateStr.match(/(\d{4})\s*\(/)) {
                var parenMatch = dateStr.match(/(\d{4})\s*\(/);
                year = parseInt(parenMatch[1]);
            }
            else if (dateStr.match(/(\d{3,4})/)) {
                var simpleMatch = dateStr.match(/(\d{3,4})/);
                year = parseInt(simpleMatch[1]);
            }
            
            if (year && year >= startYear && year <= endYear) {
                item.classList.remove('time-filtered');
                // Only count as visible if not hidden by search either
                if (!item.classList.contains('search-hidden')) {
                    visibleCount++;
                }
            } else {
                item.classList.add('time-filtered');
            }
        });
        
        // Re-run search to respect the new time filter
        var searchInput = document.querySelector('.timeline-search-input');
        if (searchInput && searchInput.value) {
            // Trigger search to reapply within new time range
            if (typeof performTimelineSearch === 'function') {
                performTimelineSearch();
            } else if (window.performTimelineSearch) {
                window.performTimelineSearch();
            }
        }
        
        // Update unified filter status
        if (window.updateFilterStatus) {
            window.updateFilterStatus();
        }
        
        // Show/hide clear all button based on whether we have an active filter
        var clearAllButton = document.getElementById('clear-all-filters');
        if (clearAllButton) {
            if (isFullRange) {
                clearAllButton.style.display = 'none';
            } else {
                clearAllButton.style.display = 'inline-block';
            }
        }
        
        // Add active filter indicator to button
        var filterButton = document.getElementById('filter-toggle-button');
        var filterIndicator = document.querySelector('.filter-indicator');
        var searchInput = document.querySelector('.timeline-search-input');
        var hasSearch = searchInput && searchInput.value.trim() !== '';
        
        if (!isFullRange || hasSearch) {
            // Show indicator if we have a time filter OR search
            if (filterButton) {
                filterButton.classList.add('has-active-filter');
            }
            // Let the unified updateFilterIndicator handle this
            if (window.updateFilterIndicator) {
                window.updateFilterIndicator();
            }
        } else {
            // No filters active - let unified function handle it
            if (window.updateFilterIndicator) {
                window.updateFilterIndicator();
            }
        }
        
        // Removed auto-scroll to prevent page jumping
    }
    
    function updateHistogramHighlight(startYear, endYear) {
        var bars = histogramContainer.querySelectorAll('.histogram-bar');
        bars.forEach(function(bar) {
            var barStart = parseInt(bar.dataset.startYear);
            var barEnd = parseInt(bar.dataset.endYear);
            
            // Highlight bars that overlap with the selection range
            // A bar overlaps if it starts before the range ends AND ends after the range starts
            if (barStart <= endYear && barEnd >= startYear) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }
    
    // Get the new clear all button in header
    var clearAllButton = document.getElementById('clear-all-filters');
    
    // Clear filter button handler
    function handleClearAll() {
        // Clear search input first
        var searchInput = document.querySelector('.timeline-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset category filters - activate all
        activeCategoryFilters.clear();
        for (var catKey in timelineCategories) {
            activeCategoryFilters.add(catKey);
        }
        // Update category pills UI
        document.querySelectorAll('.category-pill').forEach(function(pill) {
            pill.classList.add('active');
            pill.classList.remove('inactive');
        });
        
        // Reset histogram bars to show all active
        histogramContainer.querySelectorAll('.histogram-bar').forEach(function(bar) {
            bar.classList.add('active');
        });
        
        // Get range selector elements
        var selectionRange = document.querySelector('.selection-range');
        var leftHandle = document.querySelector('.selection-handle.left');
        var rightHandle = document.querySelector('.selection-handle.right');
        var startLabel = document.querySelector('.range-label.start');
        var endLabel = document.querySelector('.range-label.end');
        
        // Reset range selector overlay to full width
        if (selectionRange) {
            selectionRange.style.left = '0%';
            selectionRange.style.width = '100%';
        }
        
        // Reset handle positions to full range using correct positioning
        if (leftHandle) {
            leftHandle.style.left = 'calc(0% - 30px)';
            leftHandle.style.right = 'auto';
            leftHandle.dataset.position = '0';
        }
        if (rightHandle) {
            rightHandle.style.right = 'calc(0% - 30px)';
            rightHandle.style.left = 'auto';
            rightHandle.dataset.position = '100';
        }
        
        // Reset labels to full range
        if (startLabel) {
            startLabel.textContent = minYear + ' AD';
        }
        if (endLabel) {
            endLabel.textContent = maxYear;
        }
        
        // Clear filter text
        if (filterRangeText) {
            filterRangeText.textContent = '';
        }
        
        // Apply full range filter (this will also clear time-filtered and search-hidden classes)
        filterByYearRange(minYear, maxYear);
        
        // Reset timeline items (both time and search filters) - backup in case filterByYearRange didn't run
        var timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(function(item) {
            item.classList.remove('time-filtered');
            item.classList.remove('search-hidden');
            item.classList.remove('category-filtered');
        });
        
        // Apply category filter
        applyCategoryFilter();
        
        // Hide clear all button
        if (clearAllButton) {
            clearAllButton.style.display = 'none';
        }
        
        // Remove active filter indicator
        var filterButton = document.getElementById('filter-toggle-button');
        var filterIndicator = document.querySelector('.filter-indicator');
        if (filterButton) {
            filterButton.classList.remove('has-active-filter');
        }
        if (filterIndicator) {
            filterIndicator.style.display = 'none';
        }
        
        // Update unified filter status
        if (window.updateFilterStatus) {
            window.updateFilterStatus();
        }
    }
    
    // Add event listeners for both old and new clear buttons
    if (clearButton) {
        clearButton.addEventListener('click', handleClearAll);
    }
    if (clearAllButton) {
        clearAllButton.addEventListener('click', handleClearAll);
    }
    
    // Make filterByYearRange globally accessible
    window.filterByYearRange = filterByYearRange;
    
    console.log('Visual timeline initialized');
    // Initialize range selector overlay
    initializeRangeSelector();
    
    // Zoom controls removed
    
    } catch (e) {
        console.error('Error in initializeVisualTimeline:', e);
        console.error('Stack trace:', e.stack);
    }
}

// Range selector functionality
function initializeRangeSelector() {
    var selectionRange = document.querySelector('.selection-range');
    var leftHandle = document.querySelector('.selection-handle.left');
    var rightHandle = document.querySelector('.selection-handle.right');
    var startLabel = document.querySelector('.range-label.start');
    var endLabel = document.querySelector('.range-label.end');
    var histogram = document.querySelector('.timeline-histogram');
    
    if (!selectionRange || !leftHandle || !rightHandle || !histogram) {
        console.log('Range selector elements not found');
        return;
    }
    
    var isDragging = false;
    var currentHandle = null;
    var histogramRect = histogram.getBoundingClientRect();
    var minYear = parseInt(document.querySelector('.timeline-label')?.textContent) || 43;
    var maxYear = 2024;
    
    // Helper functions for preventing scroll and selection
    function preventScroll(e) {
        // Only prevent scroll on touch move during drag
        if (isDragging || rangeDragging) {
            e.preventDefault();
            return false;
        }
    }
    
    function preventSelect(e) {
        e.preventDefault();
        return false;
    }
    
    // Initialize position and display
    selectionRange.style.display = 'block';
    selectionRange.style.left = '0%';
    selectionRange.style.width = '100%';
    
    // Helper function to position handles
    function positionHandle(handle, percent, isLeft) {
        if (isLeft) {
            handle.style.left = 'calc(' + percent + '% - 30px)';
            handle.style.right = 'auto';
        } else {
            handle.style.right = 'calc(' + (100 - percent) + '% - 30px)';
            handle.style.left = 'auto';
        }
        handle.dataset.position = percent;
    }
    
    // Initialize handles
    leftHandle.style.display = 'flex';
    positionHandle(leftHandle, 0, true);
    
    rightHandle.style.display = 'flex';
    positionHandle(rightHandle, 100, false);
    
    // Add debugging
    console.log('Range selector elements:', {
        range: selectionRange,
        left: leftHandle,
        right: rightHandle,
        histogram: histogram
    });
    
    // Update labels
    function updateLabels(leftPercent, rightPercent) {
        // Map percentage to actual years based on segments
        var startYear, endYear;
        
        if (window.histogramSegmentMap && window.histogramSegmentMap.length > 0 && window.histogramBins) {
            // Find which segment contains the left position
            var leftBin = Math.floor((leftPercent / 100) * window.histogramBins);
            var rightBin = Math.floor((rightPercent / 100) * window.histogramBins);
            
            startYear = minYear;
            endYear = maxYear;
            
            // Find the year range for left position
            window.histogramSegmentMap.forEach(function(mapping) {
                if (leftBin >= mapping.startBin && leftBin <= mapping.endBin) {
                    var binPosition = (leftBin - mapping.startBin) / mapping.bins;
                    startYear = Math.round(mapping.segment.start + binPosition * (mapping.segment.end - mapping.segment.start));
                }
                if (rightBin >= mapping.startBin && rightBin <= mapping.endBin) {
                    var binPosition = (rightBin - mapping.startBin) / mapping.bins;
                    endYear = Math.round(mapping.segment.start + binPosition * (mapping.segment.end - mapping.segment.start));
                }
            });
        } else {
            // Fallback to linear mapping
            startYear = Math.round(minYear + (maxYear - minYear) * leftPercent / 100);
            endYear = Math.round(minYear + (maxYear - minYear) * rightPercent / 100);
        }
        
        if (startLabel) startLabel.textContent = startYear + ' AD';
        if (endLabel) endLabel.textContent = endYear;
        
        // Filter timeline
        window.filterByYearRange?.(startYear, endYear);
    }
    
    // Handle dragging
    function startDrag(e, handle) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        currentHandle = handle;
        histogramRect = histogram.getBoundingClientRect();
        
        // Add dragging class for visual feedback
        if (handle === 'left') {
            leftHandle.classList.add('dragging');
        } else {
            rightHandle.classList.add('dragging');
        }
        
        // Prevent scrolling on touch during drag
        if (e.type === 'touchstart') {
            e.preventDefault();
            document.addEventListener('touchmove', preventScroll, { passive: false });
        }
    }
    
    function drag(e) {
        if (!isDragging || !currentHandle) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        var x = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        if (!x) return;
        
        var percent = ((x - histogramRect.left) / histogramRect.width) * 100;
        percent = Math.max(0, Math.min(100, percent));
        
        // Get current positions from data attributes
        var leftPos = parseFloat(leftHandle.dataset.position) || 0;
        var rightPos = parseFloat(rightHandle.dataset.position) || 100;
        
        if (currentHandle === 'left') {
            leftPos = Math.min(percent, rightPos - 5);
            positionHandle(leftHandle, leftPos, true);
        } else {
            rightPos = Math.max(percent, leftPos + 5);
            positionHandle(rightHandle, rightPos, false);
        }
        
        // Always update selection range to match handle positions
        selectionRange.style.left = leftPos + '%';
        selectionRange.style.width = (rightPos - leftPos) + '%';
        
        updateLabels(leftPos, rightPos);
    }
    
    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            currentHandle = null;
            
            // Remove dragging class
            leftHandle.classList.remove('dragging');
            rightHandle.classList.remove('dragging');
            
            // Re-enable scrolling
            document.removeEventListener('touchmove', preventScroll);
        }
    }
    
    // Add event listeners with passive: false to allow preventDefault
    leftHandle.addEventListener('mousedown', function(e) { startDrag(e, 'left'); }, { passive: false });
    rightHandle.addEventListener('mousedown', function(e) { startDrag(e, 'right'); }, { passive: false });
    leftHandle.addEventListener('touchstart', function(e) { startDrag(e, 'left'); }, { passive: false });
    rightHandle.addEventListener('touchstart', function(e) { startDrag(e, 'right'); }, { passive: false });
    
    document.addEventListener('mousemove', drag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    // Global listeners for ending drag
    document.addEventListener('mouseup', function() {
        stopDrag();
        // Also check range dragging
        if (rangeDragging) {
            rangeDragging = false;
            selectionRange.classList.remove('dragging');
            document.removeEventListener('selectstart', preventSelect);
            document.removeEventListener('touchmove', preventScroll);
        }
    });
    
    document.addEventListener('touchend', function() {
        stopDrag();
        // Also check range dragging
        if (rangeDragging) {
            rangeDragging = false;
            selectionRange.classList.remove('dragging');
            document.removeEventListener('touchmove', preventScroll);
        }
    });
    
    // Draggable range
    var rangeDragging = false;
    var rangeStartX = 0;
    var rangeStartLeft = 0;
    var rangeWidth = 0;
    
    selectionRange.addEventListener('mousedown', function(e) {
        if (e.target === selectionRange || e.target.classList.contains('range-label')) {
            e.preventDefault();
            e.stopPropagation();
            rangeDragging = true;
            rangeStartX = e.clientX;
            rangeStartLeft = parseFloat(selectionRange.style.left) || 0;
            rangeWidth = parseFloat(selectionRange.style.width) || 100;
            histogramRect = histogram.getBoundingClientRect();
            
            // Add visual feedback
            selectionRange.classList.add('dragging');
            
            // Prevent text selection during drag
            e.preventDefault();
            document.addEventListener('selectstart', preventSelect);
        }
    }, { passive: false });
    
    // Add touch support for range dragging
    selectionRange.addEventListener('touchstart', function(e) {
        if (e.target === selectionRange || e.target.classList.contains('range-label')) {
            e.preventDefault();
            e.stopPropagation();
            rangeDragging = true;
            rangeStartX = e.touches[0].clientX;
            rangeStartLeft = parseFloat(selectionRange.style.left) || 0;
            rangeWidth = parseFloat(selectionRange.style.width) || 100;
            histogramRect = histogram.getBoundingClientRect();
            
            // Prevent scrolling on touch
            e.preventDefault();
            document.addEventListener('touchmove', preventScroll, { passive: false });
        }
    }, { passive: false });
    
    document.addEventListener('mousemove', function(e) {
        if (rangeDragging) {
            e.preventDefault();
            var deltaX = e.clientX - rangeStartX;
            var deltaPercent = (deltaX / histogramRect.width) * 100;
            var newLeft = Math.max(0, Math.min(100 - rangeWidth, rangeStartLeft + deltaPercent));
            var newRight = newLeft + rangeWidth;
            
            // Update selection range and handles together
            selectionRange.style.left = newLeft + '%';
            selectionRange.style.width = rangeWidth + '%';
            
            // Update handle positions using the helper function
            positionHandle(leftHandle, newLeft, true);
            positionHandle(rightHandle, newRight, false);
            
            updateLabels(newLeft, newRight);
        }
    }, { passive: false });
    
    // Add touch move support
    document.addEventListener('touchmove', function(e) {
        if (rangeDragging && e.touches[0]) {
            e.preventDefault();
            var deltaX = e.touches[0].clientX - rangeStartX;
            var deltaPercent = (deltaX / histogramRect.width) * 100;
            var newLeft = Math.max(0, Math.min(100 - rangeWidth, rangeStartLeft + deltaPercent));
            var newRight = newLeft + rangeWidth;
            
            // Update selection range and handles together
            selectionRange.style.left = newLeft + '%';
            selectionRange.style.width = rangeWidth + '%';
            
            // Update handle positions using the helper function
            positionHandle(leftHandle, newLeft, true);
            positionHandle(rightHandle, newRight, false);
            
            updateLabels(newLeft, newRight);
        }
    }, { passive: false });
    
    // Mouseup and touchend are handled above in the global listeners
    
    console.log('Range selector initialized');
}

// Zoom controls removed

// Add CSS class for time-filtered items
var style = document.createElement('style');
style.textContent = '.timeline-item.time-filtered { display: none; }';
document.head.appendChild(style);

// Auto-enhance any remaining carousel elements not handled by timeline
(function() {
    function enhanceOrphanCarousels() {
        // Find all .carousel elements that haven't been enhanced
        var orphanCarousels = document.querySelectorAll('.carousel:not([data-carousel-enhanced="true"])');
        
        orphanCarousels.forEach(function(carousel) {
            // Skip if this carousel was created by timeline code
            if (carousel.closest('.timeline-carousel')) return;
            
            // Mark as enhanced to prevent double-processing
            carousel.dataset.carouselEnhanced = 'true';
            
            // Find images in this carousel
            var images = carousel.querySelectorAll('img');
            if (images.length <= 1) return; // No need for carousel with single image
            
            // Apply lazy loading attributes
            images.forEach(function(img) {
                img.decoding = img.decoding || 'async';
                img.loading = img.loading || 'lazy';
            });
            
            console.log('Enhanced orphan carousel with', images.length, 'images');
        });
    }
    
    // Run enhancement when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceOrphanCarousels);
    } else {
        // Also run after a short delay to catch dynamically added content
        setTimeout(enhanceOrphanCarousels, 100);
    }
})();

// =============================================================================
// PERSISTENT SEARCH BAR IMPLEMENTATION
// =============================================================================

/**
 * Initialize hint buttons for search
 */
function initializeExpandButton() {
    var expandBtn = document.getElementById('search-expand-btn');
    var expandedPanel = document.getElementById('search-expanded-panel');
    var visualTimelineWrapper = document.getElementById('visual-timeline-wrapper');
    var dropdownTrigger = document.getElementById('category-dropdown-trigger');
    var dropdownMenu = document.getElementById('category-dropdown-menu');
    var dateSelectionPill = document.getElementById('date-selection-pill');
    
    if (!expandBtn || !expandedPanel) return;
    
    // Initialize category filter button
    function initializeCategoryButton() {
        var categoryFilterBtn = document.getElementById('category-filter-btn');
        if (!categoryFilterBtn) return;
        
        categoryFilterBtn.addEventListener('click', function() {
            var persistentInput = document.getElementById('persistent-search-input');
            if (persistentInput) {
                persistentInput.value = '#';
                persistentInput.focus();
                // Trigger input event to show category autocomplete
                persistentInput.dispatchEvent(new Event('input'));
            }
        });
    }
    
    // Store reference to update categories later (simplified)
    window.updateCategoryPills = function() {
        // No longer needed - categories handled through autocomplete
    };
    
    // Initialize date selection pill
    function initializeDatePill() {
        if (!dateSelectionPill) return;
        
        dateSelectionPill.addEventListener('click', function() {
            var isActive = this.classList.contains('active');
            
            if (isActive) {
                // Hide timeline
                if (visualTimelineWrapper) {
                    visualTimelineWrapper.style.display = 'none';
                }
                this.classList.remove('active');
            } else {
                // Show timeline
                if (visualTimelineWrapper) {
                    visualTimelineWrapper.style.display = 'block';
                    if (window.initializeVisualTimelineForSearch) {
                        window.initializeVisualTimelineForSearch();
                    }
                }
                this.classList.add('active');
            }
        });
        
        // Update date pill label when date range changes
        window.updateDatePillLabel = function() {
            if (!dateSelectionPill || !window.searchState) return;
            var label = dateSelectionPill.querySelector('.date-label');
            
            if (searchState.dateRange.start || searchState.dateRange.end) {
                var text = '';
                if (searchState.dateRange.start && searchState.dateRange.end) {
                    text = searchState.dateRange.start + ' - ' + searchState.dateRange.end;
                } else if (searchState.dateRange.start) {
                    text = 'From ' + searchState.dateRange.start;
                } else if (searchState.dateRange.end) {
                    text = 'Until ' + searchState.dateRange.end;
                }
                label.textContent = text;
                dateSelectionPill.classList.add('has-selection');
            } else {
                label.textContent = 'Select dates...';
                dateSelectionPill.classList.remove('has-selection');
            }
        };
    }
    
    // Initial setup
    initializeCategoryButton();
    initializeDatePill();
    
    expandBtn.addEventListener('click', function() {
        var isExpanded = this.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            this.classList.remove('expanded');
            expandedPanel.style.display = 'none';
            if (visualTimelineWrapper) {
                visualTimelineWrapper.style.display = 'none';
            }
            // Reset date pill active state
            if (dateSelectionPill) {
                dateSelectionPill.classList.remove('active');
            }
        } else {
            // Expand
            this.classList.add('expanded');
            expandedPanel.style.display = 'block';
            // Don't auto-show visual timeline, let user click date pill
        }
    });
}

/**
 * Initialize the persistent search bar functionality
 * Extracts search from modal and makes it always visible
 */
function initializePersistentSearch() {
    // State management
    // Make searchState global for access from other functions
    window.searchState = {
        searchTerms: [], // Array of search terms/phrases
        categories: [],
        timeRange: null,
        dateRange: { start: null, end: null },
        showMinor: true,
        debounceTimer: null
    };
    var searchState = window.searchState;
    
    var persistentInput = document.getElementById('persistent-search-input');
    var resultsCount = document.getElementById('search-results-count');
    var visibleCountSpan = document.getElementById('visible-count');
    var totalCountSpan = document.getElementById('total-count');
    var filterChipsContainer = document.getElementById('filter-chips');
    var filterChipsWrapper = filterChipsContainer ? filterChipsContainer.querySelector('.filter-chips-wrapper') : null;
    var autocompleteContainer = document.getElementById('search-autocomplete');
    var autocompleteList = document.getElementById('autocomplete-list');
    
    // New elements for toggle functionality
    var searchToggleBtn = document.getElementById('search-toggle-button');
    var searchContainer = document.getElementById('persistent-search');
    var searchMinimizeBtn = document.getElementById('search-minimize-btn');
    var searchInlineClose = document.getElementById('search-inline-close');
    
    // Visual timeline elements
    var visualTimelineWrapper = document.getElementById('visual-timeline-wrapper');
    
    // Initialize search toggle
    if (searchToggleBtn && searchContainer) {
        searchToggleBtn.addEventListener('click', function() {
            if (searchContainer.style.display === 'none' || searchContainer.style.display === '') {
                searchContainer.style.display = 'block';
                searchToggleBtn.style.display = 'none'; // Hide search button
                // Hide minimize button initially if no active filters
                if (searchMinimizeBtn) {
                    var hasActiveFilters = (searchState && searchState.searchTerms && searchState.searchTerms.length > 0) || 
                                         (searchState && searchState.categories && searchState.categories.length > 0);
                    searchMinimizeBtn.style.display = hasActiveFilters ? 'flex' : 'none';
                }
                // Show help text if no search terms
                var helpText = document.getElementById('search-help-text');
                if (helpText && searchState.searchTerms.length === 0) {
                    helpText.style.display = 'block';
                }
                setTimeout(function() {
                    if (persistentInput) {
                        persistentInput.focus();
                        // Don't show hints - we have permanent buttons now
                    }
                }, 100);
            }
        });
    }
    
    // Inline close button
    if (searchInlineClose && searchContainer && searchToggleBtn) {
        searchInlineClose.addEventListener('click', function() {
            searchContainer.style.display = 'none';
            searchToggleBtn.style.display = 'flex'; // Show search button again
        });
    }
    
    // Minimize button
    if (searchMinimizeBtn && searchContainer) {
        searchMinimizeBtn.addEventListener('click', function() {
            searchContainer.classList.toggle('minimized');
            this.classList.toggle('rotated');
        });
    }
    
    
    if (!persistentInput) {
        return;
    }
    
    // Autocomplete state
    var autocompleteState = {
        isOpen: false,
        selectedIndex: -1,
        suggestions: []
    };
    
    // Show autocomplete suggestions
    function showAutocomplete(suggestions) {
        if (!autocompleteContainer || !autocompleteList) return;
        
        if (suggestions.length === 0) {
            hideAutocomplete();
            return;
        }
        
        autocompleteList.innerHTML = '';
        autocompleteState.suggestions = suggestions;
        autocompleteState.selectedIndex = -1;
        
        suggestions.forEach(function(suggestion, index) {
            var item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.dataset.index = index;
            
            if (suggestion.type === 'category') {
                var category = timelineCategories[suggestion.key];
                if (category) {
                    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    var bgColor = isDark ? (category.lightColor || category.color) : category.color;
                    
                    item.innerHTML = '<span class="autocomplete-badge" style="background-color: ' + bgColor + '"></span>' +
                                   '<span class="autocomplete-text">' + (category.name || suggestion.key) + '</span>';
                }
            } else if (suggestion.type === 'hint') {
                item.className += ' autocomplete-hint-item';
                item.innerHTML = '<span class="autocomplete-text">' + suggestion.text + '</span>';
            }
            
            item.addEventListener('click', function() {
                selectAutocompleteSuggestion(index);
            });
            
            autocompleteList.appendChild(item);
        });
        
        autocompleteContainer.style.display = 'block';
        autocompleteState.isOpen = true;
    }
    
    // Hide autocomplete
    function hideAutocomplete() {
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'none';
        }
        autocompleteState.isOpen = false;
        autocompleteState.selectedIndex = -1;
    }
    
    // Select autocomplete suggestion
    function selectAutocompleteSuggestion(index) {
        var suggestion = autocompleteState.suggestions[index];
        if (!suggestion) return;
        
        if (suggestion.type === 'category') {
            toggleCategory(suggestion.key);
            persistentInput.value = '';
        } else if (suggestion.type === 'hint') {
            if (suggestion.value === 'date:') {
                // Show visual timeline selector
                if (visualTimelineWrapper) {
                    visualTimelineWrapper.style.display = 'block';
                    persistentInput.value = ''; // Clear input
                    initializeVisualTimelineForSearch(); // Initialize if not already done
                }
            } else {
                persistentInput.value = suggestion.value;
                persistentInput.focus();
                // Move cursor to end
                persistentInput.setSelectionRange(persistentInput.value.length, persistentInput.value.length);
            }
        }
        
        hideAutocomplete();
    }
    
    // Update results count
    function updateResultsCount() {
        var allItems = document.querySelectorAll('.timeline-item');
        var visibleItems = document.querySelectorAll('.timeline-item:not(.hidden):not(.time-filtered):not(.search-hidden):not(.category-filtered)');
        
        if (visibleCountSpan && totalCountSpan) {
            visibleCountSpan.textContent = visibleItems.length;
            totalCountSpan.textContent = allItems.length;
        }
        
        // Show/hide results count
        if (resultsCount) {
            var hasActiveFilters = searchState.searchTerms.length > 0 || 
                                  (searchState.categories.length > 0 && searchState.categories.length < Object.keys(timelineCategories || {}).length) || 
                                  searchState.timeRange || 
                                  !searchState.showMinor;
            resultsCount.style.display = hasActiveFilters ? 'flex' : 'none';
        }
    }
    
    // Highlight search terms in text
    function highlightSearchTerms(element, searchTerm) {
        if (!searchTerm || !element) return;
        
        var text = element.textContent || '';
        var searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        if (searchWords.length === 0) return;
        
        // Create regex pattern for all search words
        var pattern = new RegExp('(' + searchWords.map(word => 
            word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('|') + ')', 'gi');
        
        // Replace matching text with highlighted version
        var highlightedHTML = text.replace(pattern, '<span class="search-highlight">$1</span>');
        
        if (highlightedHTML !== text) {
            element.innerHTML = highlightedHTML;
        }
    }
    
    // Remove all highlights
    function removeAllHighlights() {
        document.querySelectorAll('.search-highlight').forEach(function(highlight) {
            var parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }
    
    // Add a search term to the list
    function addSearchTerm(term) {
        term = term.trim();
        if (!term) return;
        
        // Check for category shortcuts (# or category:)
        var isCategorySearch = false;
        var categoryKey = null;
        
        if (term.startsWith('#')) {
            // Handle #category format
            var catName = term.slice(1).toLowerCase();
            categoryKey = findCategoryByName(catName);
            if (categoryKey) {
                toggleCategory(categoryKey);
                persistentInput.value = '';
                return;
            }
        } else if (term.toLowerCase().startsWith('category:')) {
            // Handle category:name format
            var catName = term.slice(9).toLowerCase();
            categoryKey = findCategoryByName(catName);
            if (categoryKey) {
                toggleCategory(categoryKey);
                persistentInput.value = '';
                return;
            }
        }
        
        // Check for quoted phrases
        var isPhrase = false;
        if ((term.startsWith('"') && term.endsWith('"')) || 
            (term.startsWith("'") && term.endsWith("'"))) {
            term = term.slice(1, -1); // Remove quotes
            isPhrase = true;
        }
        
        // Don't add duplicates
        var exists = searchState.searchTerms.some(function(t) {
            return t.term.toLowerCase() === term.toLowerCase();
        });
        
        if (!exists && term.length > 0) {
            searchState.searchTerms.push({
                term: term,
                isPhrase: isPhrase
            });
            persistentInput.value = ''; // Clear input
            performSearch();
        }
    }
    
    // Find category by partial name match
    function findCategoryByName(name) {
        if (!timelineCategories) return null;
        name = name.toLowerCase();
        
        for (var key in timelineCategories) {
            var cat = timelineCategories[key];
            if (key.toLowerCase().includes(name) || 
                (cat.name && cat.name.toLowerCase().includes(name)) ||
                (cat.label && cat.label.toLowerCase().includes(name))) {
                return key;
            }
        }
        return null;
    }
    
    // Toggle category filter - make it global for expand button
    window.toggleCategory = function(categoryKey) {
        var index = searchState.categories.indexOf(categoryKey);
        if (index > -1) {
            searchState.categories.splice(index, 1);
        } else {
            searchState.categories.push(categoryKey);
        }
        hideAutocomplete(); // Close the category selector
        performSearch();
        updateFilterChips();
        // Update category pills display if function exists
        if (window.updateCategoryPills) {
            window.updateCategoryPills();
        }
    };
    var toggleCategory = window.toggleCategory;
    
    // Remove a search term
    function removeSearchTerm(index) {
        searchState.searchTerms.splice(index, 1);
        performSearch();
    }
    
    // Perform search with multiple terms
    function performSearch() {
        // Remove previous highlights
        removeAllHighlights();
        
        var timelineItems = document.querySelectorAll('.timeline-item');
        var hasResults = false;
        
        timelineItems.forEach(function(item) {
            // Check date range filter first
            var dateMatch = true;
            if (searchState.dateRange.start || searchState.dateRange.end) {
                var itemYear = parseInt(item.dataset.year || item.querySelector('.timeline-date')?.textContent?.match(/\d{4}/)?.[0]);
                if (itemYear) {
                    if (searchState.dateRange.start && itemYear < searchState.dateRange.start) {
                        dateMatch = false;
                    }
                    if (searchState.dateRange.end && itemYear > searchState.dateRange.end) {
                        dateMatch = false;
                    }
                } else {
                    dateMatch = false; // No year found, exclude from date filtering
                }
            }
            
            // Check category filter
            var categoryMatch = true;
            if (searchState.categories.length > 0) {
                var itemCategory = item.dataset.category;
                categoryMatch = itemCategory && searchState.categories.includes(itemCategory);
            }
            
            // Check search terms
            var searchMatch = true;
            if (searchState.searchTerms.length > 0) {
                // Get searchable content
                var dateElement = item.querySelector('.timeline-date');
                var title = item.querySelector('.content-title');
                var description = item.querySelector('.description');
                var categories = item.querySelectorAll('.category-badge');
                
                var searchableText = '';
                if (dateElement) searchableText += dateElement.textContent + ' ';
                if (title) searchableText += title.textContent + ' ';
                if (description) searchableText += description.textContent + ' ';
                categories.forEach(function(cat) {
                    searchableText += cat.textContent + ' ';
                });
                
                searchableText = searchableText.toLowerCase();
                
                // Check if ALL search terms match (AND logic)
                searchMatch = searchState.searchTerms.every(function(searchObj) {
                    var term = searchObj.term.toLowerCase();
                    
                    if (searchObj.isPhrase) {
                        // Exact phrase match
                        return searchableText.includes(term);
                    } else {
                        // All words must be present (but not necessarily together)
                        var words = term.split(/\s+/).filter(word => word.length > 0);
                        return words.every(word => searchableText.includes(word));
                    }
                });
            }
            
            if (dateMatch && categoryMatch && searchMatch) {
                item.classList.remove('search-hidden');
                hasResults = true;
                
                // Highlight search terms if any
                if (searchState.searchTerms.length > 0) {
                    var dateElement = item.querySelector('.timeline-date');
                    var title = item.querySelector('.content-title');
                    var description = item.querySelector('.description');
                    
                    searchState.searchTerms.forEach(function(searchObj) {
                        if (title) highlightSearchTerms(title, searchObj.term);
                        if (description) highlightSearchTerms(description, searchObj.term);
                        if (dateElement) highlightSearchTerms(dateElement, searchObj.term);
                    });
                }
            } else {
                item.classList.add('search-hidden');
            }
        });
        
        // Update filter chips
        updateFilterChips();
        
        // Update results count
        updateResultsCount();
        
        // Update filter chips display
        updateFilterChips();
    }
    
    // Update filter chips display
    function updateFilterChips() {
        if (!filterChipsWrapper) return;
        
        // Clear existing chips
        filterChipsWrapper.innerHTML = '';
        
        var hasChips = false;
        
        // Toggle help text visibility and minimize button
        var helpText = document.getElementById('search-help-text');
        var hasActiveFilters = searchState.searchTerms.length > 0 || searchState.categories.length > 0;
        
        if (searchState.searchTerms.length > 0) {
            if (searchContainer) searchContainer.classList.add('has-active-search');
            if (helpText) helpText.style.display = 'none';
        } else {
            if (searchContainer) searchContainer.classList.remove('has-active-search');
            if (helpText) helpText.style.display = 'block';
        }
        
        // Minimize button is always visible - removed conditional display
        
        // Add "Clear All" button if there are search terms
        if (searchState.searchTerms.length > 1) {
            var clearAllBtn = document.createElement('button');
            clearAllBtn.className = 'filter-chip clear-all-chip';
            clearAllBtn.innerHTML = '<span>Clear All Searches</span>';
            clearAllBtn.onclick = function() {
                searchState.searchTerms = [];
                performSearch();
            };
            filterChipsWrapper.appendChild(clearAllBtn);
            hasChips = true;
        }
        
        // Search term chips - one for each term
        searchState.searchTerms.forEach(function(searchObj, index) {
            hasChips = true;
            var displayTerm = searchObj.isPhrase ? '"' + searchObj.term + '"' : searchObj.term;
            var searchChip = createFilterChip('Search', displayTerm, 'search-chip', function() {
                removeSearchTerm(index);
            });
            filterChipsWrapper.appendChild(searchChip);
        });
        
        // Date range chip
        if (searchState.dateRange.start || searchState.dateRange.end) {
            hasChips = true;
            var dateLabel = '';
            if (searchState.dateRange.start && searchState.dateRange.end) {
                dateLabel = searchState.dateRange.start + ' - ' + searchState.dateRange.end;
            } else if (searchState.dateRange.start) {
                dateLabel = 'After ' + searchState.dateRange.start;
            } else {
                dateLabel = 'Before ' + searchState.dateRange.end;
            }
            
            var dateChip = createFilterChip('Date', dateLabel, 'date-chip', function() {
                searchState.dateRange.start = null;
                searchState.dateRange.end = null;
                if (dateStartInput) dateStartInput.value = '';
                if (dateEndInput) dateEndInput.value = '';
                if (window.updateDatePillLabel) window.updateDatePillLabel();
                performSearch();
            });
            filterChipsWrapper.appendChild(dateChip);
        }
        
        // Category chips - show selected categories
        searchState.categories.forEach(function(categoryKey) {
            hasChips = true;
            var category = timelineCategories[categoryKey];
            var label = category ? (category.name || category.label || categoryKey) : categoryKey;
            
            var categoryChip = createFilterChip('', label, 'category-chip category-chip-' + categoryKey, function() {
                toggleCategory(categoryKey);
            });
            
            // Add category color to chip - match filter modal implementation
            if (category) {
                var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                var bgColor = isDark ? (category.lightColor || category.color) : category.color;
                if (bgColor) {
                    categoryChip.style.background = bgColor; // Use background not backgroundColor
                    categoryChip.style.borderColor = bgColor;
                    categoryChip.style.color = 'white';
                    // Remove gradient that might override color
                    categoryChip.style.backgroundImage = 'none';
                }
            }
            
            filterChipsWrapper.appendChild(categoryChip);
        });
        
        // Time range chip
        if (searchState.timeRange) {
            hasChips = true;
            var timeChip = createFilterChip('Time', searchState.timeRange, 'time-chip', function() {
                clearTimeRange();
            });
            filterChipsWrapper.appendChild(timeChip);
        }
        
        // Minor entries chip
        if (!searchState.showMinor) {
            hasChips = true;
            var minorChip = createFilterChip('Showing', 'Major events only', 'minor-chip', function() {
                toggleMinorEntries(true);
            });
            filterChipsWrapper.appendChild(minorChip);
        }
        
        // Show/hide chips container
        if (filterChipsContainer) {
            if (hasChips) {
                filterChipsContainer.style.display = 'block';
                // Auto-show search container if it has active filters
                if (searchContainer && (searchContainer.style.display === 'none' || searchContainer.classList.contains('minimized'))) {
                    searchContainer.style.display = 'block';
                    searchContainer.classList.remove('minimized');
                    if (searchToggleBtn) searchToggleBtn.classList.add('active');
                    if (searchMinimizeBtn) searchMinimizeBtn.classList.remove('rotated');
                }
            } else {
                filterChipsContainer.style.display = 'none';
            }
        }
    }
    
    // Create a filter chip element
    function createFilterChip(label, value, className, onRemove) {
        var chip = document.createElement('div');
        chip.className = 'filter-chip ' + className;
        
        // Only add label if it exists
        if (label) {
            var chipLabel = document.createElement('span');
            chipLabel.className = 'filter-chip-label';
            chipLabel.textContent = label + ':';
            chip.appendChild(chipLabel);
        }
        
        var chipValue = document.createElement('span');
        chipValue.className = 'filter-chip-value';
        chipValue.textContent = value;
        
        var removeBtn = document.createElement('button');
        removeBtn.className = 'filter-chip-remove';
        removeBtn.setAttribute('aria-label', 'Remove ' + (label || value) + ' filter');
        removeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>';
        removeBtn.onclick = onRemove;
        
        chip.appendChild(chipValue);
        chip.appendChild(removeBtn);
        
        return chip;
    }
    
    // Category management
    function removeCategory(category) {
        var index = searchState.categories.indexOf(category);
        if (index > -1) {
            searchState.categories.splice(index, 1);
            applyAllFilters();
        }
    }
    
    // Time range management  
    function clearTimeRange() {
        searchState.timeRange = null;
        document.querySelectorAll('.timeline-item.time-filtered').forEach(function(item) {
            item.classList.remove('time-filtered');
        });
        applyAllFilters();
    }
    
    // Minor entries management
    function toggleMinorEntries(show) {
        searchState.showMinor = show;
        applyAllFilters();
    }
    
    // Apply all active filters
    function applyAllFilters() {
        performSearch();
        
        // Category filtering is now handled in performSearch() - just clean up
        document.querySelectorAll('.timeline-item.category-filtered').forEach(function(item) {
            item.classList.remove('category-filtered');
        });
        
        // Apply minor entries filter
        if (!searchState.showMinor) {
            document.body.classList.add('hide-minor');
        } else {
            document.body.classList.remove('hide-minor');
        }
        
        updateFilterChips();
        updateResultsCount();
    }
    
    
    // Event listeners
    persistentInput.addEventListener('focus', function() {
        var value = this.value.trim();
        
        // Show help text when focused on empty input
        if (value.length === 0 && searchState.searchTerms.length === 0 && searchState.categories.length === 0) {
            if (helpText) {
                helpText.style.display = 'block';
                // Don't show hints - we have permanent buttons now
            }
        }
    });
    
    persistentInput.addEventListener('keydown', function(e) {
        // Handle autocomplete navigation
        if (autocompleteState.isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                autocompleteState.selectedIndex = Math.min(autocompleteState.selectedIndex + 1, autocompleteState.suggestions.length - 1);
                updateAutocompleteSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                autocompleteState.selectedIndex = Math.max(autocompleteState.selectedIndex - 1, -1);
                updateAutocompleteSelection();
            } else if (e.key === 'Enter' && autocompleteState.selectedIndex >= 0) {
                e.preventDefault();
                selectAutocompleteSuggestion(autocompleteState.selectedIndex);
                return;
            } else if (e.key === 'Escape') {
                hideAutocomplete();
                return;
            }
        }
        
        if (e.key === 'Enter') {
            e.preventDefault();
            var term = this.value.trim();
            if (term) {
                addSearchTerm(term);
            }
        } else if (e.key === 'Escape') {
            this.value = '';
            hideAutocomplete();
        } else if (e.key === 'Backspace' && this.value === '' && searchState.searchTerms.length > 0) {
            // Remove last search term if backspace on empty input
            removeSearchTerm(searchState.searchTerms.length - 1);
        }
    });
    
    // Update autocomplete selection visual
    function updateAutocompleteSelection() {
        var items = autocompleteList.querySelectorAll('.autocomplete-item');
        items.forEach(function(item, index) {
            if (index === autocompleteState.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    // Visual timeline functionality - exact copy of original
    function initializeVisualTimeline() {
        if (!visualTimelineWrapper) return;
        
        // Use the existing global visual timeline initialization
        // which has all the complex logic for periods, segments, etc.
        
        // Temporarily override the selectors to point to our wrapper
        var originalQuerySelector = document.querySelector;
        document.querySelector = function(selector) {
            if (selector === '.timeline-periods' || 
                selector === '.timeline-histogram' || 
                selector === '.timeline-labels' ||
                selector === '.filter-range-text' ||
                selector === '.clear-time-filter') {
                return visualTimelineWrapper.querySelector(selector);
            }
            return originalQuerySelector.call(document, selector);
        };
        
        // Call the original visual timeline initialization from line 3641
        if (typeof window.initializeVisualTimeline === 'function') {
            // Save the original function
            var originalInitVisualTimeline = window.initializeVisualTimeline;
            
            // Call just the histogram building part
            // Extract and run the histogram building logic
            var timelineItems = document.querySelectorAll('.timeline-item');
            if (!timelineItems || timelineItems.length === 0) {
                document.querySelector = originalQuerySelector;
                return;
            }
            
            // Run the full initialization that builds the histogram
            originalInitVisualTimeline();
        }
        
        // Restore original querySelector
        document.querySelector = originalQuerySelector;
        
        // Add click handlers for our search context
        var histogramBars = visualTimelineWrapper.querySelectorAll('.histogram-bar');
        histogramBars.forEach(function(bar) {
            // Remove existing click handlers
            var newBar = bar.cloneNode(true);
            bar.parentNode.replaceChild(newBar, bar);
            
            // Add our click handler
            newBar.addEventListener('click', function() {
                var startYear = parseInt(this.dataset.startYear);
                var endYear = parseInt(this.dataset.endYear);
                
                searchState.dateRange.start = startYear;
                searchState.dateRange.end = endYear;
                if (window.updateDatePillLabel) window.updateDatePillLabel();
                performSearch();
                updateFilterChips();
                
                // Update display
                var rangeDisplay = visualTimelineWrapper.querySelector('.range-display');
                if (rangeDisplay) {
                    rangeDisplay.textContent = startYear + ' - ' + endYear;
                    visualTimelineWrapper.querySelector('.filter-range-text').style.display = 'block';
                }
                
                // Highlight active bar
                visualTimelineWrapper.querySelectorAll('.histogram-bar').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
        
        // Clear functionality can be handled via filter chips
        // Removed dedicated clear button as per modal design
    }
    
    // Parse smart date queries
    function parseSmartDateQuery(input) {
        var lowerInput = input.toLowerCase();
        
        // Check for year patterns: "1850", "1850-1900", "1850 to 1900"
        var yearRangeMatch = lowerInput.match(/(\d{4})\s*(?:-|to)\s*(\d{4})/);
        if (yearRangeMatch) {
            return {
                type: 'dateRange',
                start: parseInt(yearRangeMatch[1]),
                end: parseInt(yearRangeMatch[2])
            };
        }
        
        // Single year
        var singleYearMatch = lowerInput.match(/^(\d{4})$/);
        if (singleYearMatch) {
            var year = parseInt(singleYearMatch[1]);
            return {
                type: 'dateRange',
                start: year,
                end: year
            };
        }
        
        // Century patterns: "19th century", "20th century"
        var centuryMatch = lowerInput.match(/(\d{1,2})(?:st|nd|rd|th)\s+century/);
        if (centuryMatch) {
            var century = parseInt(centuryMatch[1]);
            return {
                type: 'dateRange',
                start: (century - 1) * 100,
                end: century * 100 - 1
            };
        }
        
        // Decade patterns: "1960s", "60s"
        var decadeMatch = lowerInput.match(/(\d{2,4})s/);
        if (decadeMatch) {
            var decade = decadeMatch[1];
            if (decade.length === 2) {
                decade = '19' + decade; // Assume 1900s for 2-digit
            }
            var decadeStart = parseInt(decade);
            return {
                type: 'dateRange',
                start: decadeStart,
                end: decadeStart + 9
            };
        }
        
        // Keywords for date range
        if (lowerInput.includes('date:') || lowerInput.includes('year:')) {
            // Show date range selector
            return { type: 'showDateSelector' };
        }
        
        return null;
    }
    
    // Initialize visual timeline functionality for search wrapper
    window.initializeVisualTimelineForSearch = function initializeVisualTimelineForSearch() {
        var wrapper = document.getElementById('visual-timeline-wrapper');
        if (!wrapper) return;
        
        // Temporarily override document.querySelector to use the wrapper context
        var originalQuerySelector = document.querySelector;
        var originalQuerySelectorAll = document.querySelectorAll;
        
        document.querySelector = function(selector) {
            // First try within the wrapper
            var result = wrapper.querySelector(selector);
            if (result) return result;
            // Fallback to original for things like timeline items
            return originalQuerySelector.call(document, selector);
        };
        
        document.querySelectorAll = function(selector) {
            // For timeline items, use the original
            if (selector === '.timeline-item') {
                return originalQuerySelectorAll.call(document, selector);
            }
            // Otherwise try wrapper first
            var results = wrapper.querySelectorAll(selector);
            if (results.length > 0) return results;
            return originalQuerySelectorAll.call(document, selector);
        };
        
        // Now initialize the visual timeline
        initializeVisualTimeline();
        
        // Restore original functions
        document.querySelector = originalQuerySelector;
        document.querySelectorAll = originalQuerySelectorAll;
    }
    
    initializeVisualTimelineForSearch();
    
    // Handle input for autocomplete
    persistentInput.addEventListener('input', function() {
        var value = this.value.toLowerCase();
        var hasText = this.value.trim().length > 0;
        
        // Check for smart date queries
        var dateQuery = parseSmartDateQuery(value);
        if (dateQuery) {
            if (dateQuery.type === 'dateRange') {
                // Apply date range directly
                searchState.dateRange.start = dateQuery.start;
                searchState.dateRange.end = dateQuery.end;
                
                // Update date pill label
                if (window.updateDatePillLabel) window.updateDatePillLabel();
                
                // Update visual timeline if available
                if (window.setVisualTimelineRange) {
                    window.setVisualTimelineRange(dateQuery.start, dateQuery.end);
                }
                
                persistentInput.value = ''; // Clear input
                performSearch();
                updateFilterChips();
                hideAutocomplete();
                return;
            } else if (dateQuery.type === 'showDateSelector') {
                // Show visual timeline selector
                if (visualTimelineWrapper) {
                    visualTimelineWrapper.style.display = 'block';
                    persistentInput.value = ''; // Clear input
                    initializeVisualTimelineForSearch(); // Initialize if not already done
                }
                hideAutocomplete();
                return;
            }
        }
        
        // Don't show hints - we have permanent buttons now
        
        // Check for category triggers
        if (value.endsWith('category:') || value === '#') {
            // Show all categories
            var suggestions = [];
            
            if (timelineCategories) {
                for (var key in timelineCategories) {
                    suggestions.push({
                        type: 'category',
                        key: key,
                        label: timelineCategories[key].name || key
                    });
                }
            }
            
            showAutocomplete(suggestions);
        } else if (value.startsWith('category:')) {
            // Filter categories based on input
            var searchTerm = value.substring(9).trim();
            var suggestions = [];
            
            if (timelineCategories) {
                for (var key in timelineCategories) {
                    var category = timelineCategories[key];
                    var name = (category.name || key).toLowerCase();
                    if (name.includes(searchTerm) || key.toLowerCase().includes(searchTerm)) {
                        suggestions.push({
                            type: 'category',
                            key: key,
                            label: category.name || key
                        });
                    }
                }
            }
            
            showAutocomplete(suggestions);
        } else if (value.startsWith('#')) {
            // Show all categories when # is typed, filter if more text follows
            var searchTerm = value.substring(1).trim().toLowerCase();
            var suggestions = [];
            
            if (timelineCategories) {
                for (var key in timelineCategories) {
                    var category = timelineCategories[key];
                    var name = (category.name || key).toLowerCase();
                    // Show all if just '#', or filter if search term exists
                    if (!searchTerm || name.includes(searchTerm) || key.toLowerCase().includes(searchTerm)) {
                        suggestions.push({
                            type: 'category',
                            key: key,
                            label: category.name || key
                        });
                    }
                }
            }
            
            showAutocomplete(suggestions);
        } else if (value === '') {
            // Show hints when empty
            showAutocomplete([
                { type: 'hint', text: 'Type "category:" to filter by category', value: 'category:' },
                { type: 'hint', text: 'Type # for quick category access', value: '#' },
                { type: 'hint', text: 'Use "quotes" for exact phrases', value: '""' }
            ]);
        } else {
            hideAutocomplete();
        }
        
    });
    
    // Click outside to close autocomplete
    document.addEventListener('click', function(e) {
        if (!persistentInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
            hideAutocomplete();
        }
    });
    
    // Listen for filter changes from the modal
    window.addEventListener('filtersChanged', function(e) {
        if (e.detail) {
            if (e.detail.categories !== undefined) searchState.categories = e.detail.categories;
            if (e.detail.timeRange !== undefined) searchState.timeRange = e.detail.timeRange;
            if (e.detail.showMinor !== undefined) searchState.showMinor = e.detail.showMinor;
            applyAllFilters();
        }
    });
    
    // Make search function globally accessible
    window.persistentSearch = {
        search: performSearch,
        updateFilters: applyAllFilters,
        getState: function() { return searchState; }
    };
    
    // Initial setup
    updateResultsCount();
    updateFilterChips();
    
    console.log('Persistent search bar initialized successfully');
}