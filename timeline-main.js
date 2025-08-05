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
        var menuIcon = '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="white"/>';
        var closeMenuIcon = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>';
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
        
        // Minor entries toggle functionality
        showDebug('Setting up minor entries toggle');
        var minorToggle = document.getElementById('minor-toggle');
        
        // Create eye icons for the toggle
        var eyeIcon = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>';
        var eyeOffIcon = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>';
        
        minorToggle.querySelector('svg').innerHTML = eyeIcon;
        
        function updateMinorToggleState() {
            var isHidden = document.body.classList.contains('hide-minor');
            var minorText = document.querySelector('.minor-text');
            
            if (isHidden) {
                // When hidden, show eye icon (clicking will show entries)
                minorToggle.querySelector('svg').innerHTML = eyeIcon;
                if (minorText) {
                    minorText.textContent = 'Show Minor Entries';
                }
            } else {
                // When shown, show eye-off icon (clicking will hide entries)
                minorToggle.querySelector('svg').innerHTML = eyeOffIcon;
                if (minorText) {
                    minorText.textContent = 'Hide Minor Entries';
                }
            }
        }
        
        function toggleMinorEntries(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var body = document.body;
            body.classList.toggle('hide-minor');
            
            // Update button state
            updateMinorToggleState();
            
            // Don't save minor entries preference - always show by default
        }
        
        // Always show minor entries by default - no saved preference
        // Set initial state (showing minor entries)
        updateMinorToggleState();
        
        if (minorToggle) {
            minorToggle.addEventListener('click', toggleMinorEntries);
            minorToggle.addEventListener('touchend', toggleMinorEntries);
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
        title.textContent = item.title;
        header.appendChild(title);

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
                
                // Add icon based on quality class
                var iconText = '';
                if (qualityClass === 'high') {
                    // No icon for high quality
                    return '<a href="#ref-' + num + '" class="citation-link citation-pill quality-' + qualityClass + '">' + num + '</a>';
                } else if (qualityClass === 'medium') {
                    iconText = '?';
                } else {
                    iconText = '!';
                }
                
                return '<a href="#ref-' + num + '" class="citation-link citation-pill quality-' + qualityClass + '"><span class="citation-icon">' + iconText + '</span>' + num + '</a>';
            }).join(' ');
            descriptionText += citationPills;
        }
        
        desc.innerHTML = descriptionText;
        content.appendChild(desc);
        
        // Add read more/less indicators for major entries
        if (item.importance !== 'minor') {
            // Add read more button
            var readMore = document.createElement('span');
            readMore.className = 'read-more-indicator';
            readMore.innerHTML = 'Read more →';
            desc.appendChild(readMore);
            
            // Add read less button
            var readLess = document.createElement('span');
            readLess.className = 'read-less-indicator';
            readLess.innerHTML = '← Show less';
            content.appendChild(readLess);
        }

        // Add image(s) if present, or show contribution prompt
        if (item.image || item.image2 || item.image3) {
            // Create container for images
            var imagesWrapper = document.createElement('div');
            imagesWrapper.className = 'content-images-wrapper';
            
            // Helper function to create image element with caption
            function createImageWithCaption(imageSrc, captionText, captionHTML, isSecond) {
                var imageContainer = document.createElement('div');
                imageContainer.className = 'content-image';
                if (isSecond) imageContainer.className += ' second-image';
                
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
                img.alt = item.title;
                img.loading = 'lazy'; // Add lazy loading
                
                // Handle both click and touch events properly
                function handleImageClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openImageModal(imageSrc, captionText, captionHTML);
                }
                
                img.addEventListener('click', handleImageClick);
                img.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(e);
                });
                
                // Add error handler to fallback to original image if thumbnail doesn't exist
                img.addEventListener('error', function() {
                    if (img.src !== imageSrc) {
                        img.src = imageSrc;
                    }
                });
                
                imageContainer.appendChild(img);
                
                if (captionText) {
                    var caption = document.createElement('div');
                    caption.className = 'content-image-caption';
                    if (captionHTML) {
                        caption.innerHTML = captionText;
                    } else {
                        caption.textContent = captionText;
                    }
                    imageContainer.appendChild(caption);
                }
                
                return imageContainer;
            }
            
            // Add first image
            if (item.image) {
                imagesWrapper.appendChild(createImageWithCaption(
                    item.image, 
                    item.imageCaption, 
                    item.imageCaptionHTML,
                    false
                ));
            }
            
            // Add second image if present
            if (item.image2) {
                imagesWrapper.appendChild(createImageWithCaption(
                    item.image2, 
                    item.image2Caption, 
                    item.image2CaptionHTML,
                    true
                ));
            }
            
            // Add third image if present
            if (item.image3) {
                imagesWrapper.appendChild(createImageWithCaption(
                    item.image3, 
                    item.image3Caption, 
                    item.image3CaptionHTML,
                    true
                ));
            }
            
            // Add class for multiple images layout
            var imageCount = 0;
            if (item.image) imageCount++;
            if (item.image2) imageCount++;
            if (item.image3) imageCount++;
            
            if (imageCount === 2) {
                imagesWrapper.className += ' dual-images';
            } else if (imageCount === 3) {
                imagesWrapper.className += ' triple-images';
            }
            
            content.appendChild(imagesWrapper);
        } else if (item.icon !== 'fogh') {
            // Contribution prompt removed - use suggest edit button instead
        }

        // Suggest edit buttons removed - use menu instead

        timelineItem.appendChild(content);
            container.appendChild(timelineItem);
        }
        showDebug('All ' + timelineData.length + ' timeline items created!');
        
        // Initialize timeline search functionality
        showDebug('Initializing timeline search');
        var searchInput = document.querySelector('.timeline-search-input');
        var searchResultsCount = document.querySelector('.timeline-search .search-results-count');
        
        showDebug('Search input element: ' + (searchInput ? 'found' : 'NOT FOUND'));
        showDebug('Search results count element: ' + (searchResultsCount ? 'found' : 'NOT FOUND'));
        
        if (searchInput && searchResultsCount) {
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
                    // Get all searchable text from the timeline item
                    var searchableText = '';
                    
                    // Get date
                    var dateElement = item.querySelector('.timeline-date');
                    if (dateElement && dateElement.textContent) {
                        searchableText += dateElement.textContent + ' ';
                    }
                    
                    // Get title
                    var titleElement = item.querySelector('.content-title');
                    if (titleElement && titleElement.textContent) {
                        searchableText += titleElement.textContent + ' ';
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
                    
                    // Check if item matches search
                    if (searchTerm === '' || searchableText.toLowerCase().includes(searchTerm)) {
                        item.classList.remove('search-hidden');
                        // Only count as visible if not filtered by time either
                        if (!item.classList.contains('time-filtered')) {
                            visibleCount++;
                        }
                    } else {
                        item.classList.add('search-hidden');
                    }
                });
                
                // Update results count
                if (searchTerm === '') {
                    searchResultsCount.textContent = '';
                } else {
                    searchResultsCount.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' entries';
                }
                
                // Update filter indicator
                var filterIndicator = document.querySelector('.filter-indicator');
                var filterButton = document.getElementById('filter-toggle-button');
                var timeFiltered = document.querySelectorAll('.timeline-item.time-filtered').length > 0;
                
                if (searchTerm !== '' || timeFiltered) {
                    // Show indicator if either search or time filter is active
                    if (filterButton) {
                        filterButton.classList.add('has-active-filter');
                    }
                    if (filterIndicator) {
                        // If search is active, show search count; if only time filter, recalculate
                        if (searchTerm !== '') {
                            filterIndicator.textContent = visibleCount;
                        } else if (timeFiltered) {
                            // Count items not filtered by time
                            var timeVisibleCount = document.querySelectorAll('.timeline-item:not(.time-filtered)').length;
                            filterIndicator.textContent = timeVisibleCount;
                        }
                        filterIndicator.style.display = 'inline-flex';
                    }
                } else {
                    // No filters active
                    if (filterButton) {
                        filterButton.classList.remove('has-active-filter');
                    }
                    if (filterIndicator) {
                        filterIndicator.style.display = 'none';
                    }
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
            
            // Add work in progress note
            var workInProgressNote = document.createElement('p');
            workInProgressNote.className = 'work-in-progress-note';
            workInProgressNote.innerHTML = '🚧 <strong>We need your help!</strong> This timeline relies on community contributions, especially for citations marked as <span class="status-badge unverified">Unverified</span> or <span class="quality-badge low">Low</span> quality. If you have better sources, spot inaccuracies, or can verify information, please <a href="#" class="suggest-amendment-link">suggest an amendment</a>.';
            citationsContent.appendChild(workInProgressNote);
            
            // Add click handler for the suggest amendment link
            var amendmentLink = workInProgressNote.querySelector('.suggest-amendment-link');
            if (amendmentLink) {
                amendmentLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Open submission modal instead of about modal
                    openSubmissionModal('new');
                });
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
                    var citation = timelineCitations[index];
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
        
        // Removed global contribute-link handler to prevent accidental modal opening
        
        // Image Modal functionality
        showDebug('Setting up image modal');
        var imageModal = document.getElementById('image-modal');
        var imageModalClose = document.getElementById('image-modal-close');
        var modalImage = document.getElementById('modal-image');
        var modalImageCaption = document.getElementById('modal-image-caption');
        
        function openImageModal(imageSrc, captionText, captionHTML) {
            if (modalImage) {
                modalImage.src = imageSrc;
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
            }
        }
        
        function closeImageModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (imageModal) {
                imageModal.classList.remove('active');
            }
            if (modalImage) {
                modalImage.src = '';
            }
        }
        
        // Add close button handler
        if (imageModalClose) {
            imageModalClose.addEventListener('click', closeImageModal);
            imageModalClose.addEventListener('touchend', closeImageModal);
        }
        
        // Close on overlay click
        if (imageModal) {
            imageModal.addEventListener('click', function(e) {
                if (e.target === imageModal || e.target === modalImage) {
                    closeImageModal(e);
                }
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && imageModal && imageModal.classList.contains('active')) {
                closeImageModal();
            }
        });
        
        // Make openImageModal accessible globally for the onclick handlers
        window.openImageModal = openImageModal;
        
        // Add click handler for citation links
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('citation-link')) {
                e.preventDefault();
                
                var citationNumber = e.target.getAttribute('href').replace('#ref-', '');
                var citationCard = document.getElementById('ref-' + citationNumber);
                
                if (citationCard) {
                    // First, ensure the references section is visible
                    var referencesSection = document.querySelector('.citation-list');
                    if (referencesSection) {
                        // Expand the main references section if it's collapsed
                        var citationsContent = referencesSection.querySelector('.citations-content');
                        var citationsHeader = referencesSection.querySelector('.citations-header');
                        
                        if (citationsContent && citationsContent.classList.contains('collapsed')) {
                            citationsContent.classList.remove('collapsed');
                            if (citationsHeader) {
                                citationsHeader.classList.add('expanded');
                            }
                        }
                        
                        // Clear any search filter
                        var searchInput = referencesSection.querySelector('.references-search-input');
                        if (searchInput && searchInput.value) {
                            searchInput.value = '';
                            // Trigger search to show all cards
                            var event = new Event('input', { bubbles: true });
                            searchInput.dispatchEvent(event);
                        }
                        
                        // Ensure all citation cards are visible
                        var allCitationCards = referencesSection.querySelectorAll('.citation-card');
                        allCitationCards.forEach(function(card) {
                            card.style.display = 'block';
                        });
                        
                        // Hide any no results message
                        var noResultsMsg = referencesSection.querySelector('.no-results');
                        if (noResultsMsg) {
                            noResultsMsg.style.display = 'none';
                        }
                    }
                    
                    // Expand the specific citation card
                    var cardBody = citationCard.querySelector('.citation-card-body');
                    if (cardBody && cardBody.classList.contains('collapsed')) {
                        cardBody.classList.remove('collapsed');
                        cardBody.classList.add('expanded');
                        
                        // Update chevron
                        var chevron = citationCard.querySelector('.expand-icon');
                        if (chevron) {
                            chevron.textContent = '▼';
                        }
                    }
                    
                    // Add highlight effect
                    citationCard.classList.add('highlight');
                    setTimeout(function() {
                        citationCard.classList.remove('highlight');
                    }, 2000);
                    
                    // Scroll to the citation with some offset for the fixed header
                    setTimeout(function() {
                        var headerHeight = 70; // Adjust based on your header height
                        var elementPosition = citationCard.getBoundingClientRect().top;
                        var offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            }
        });
        
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
    var searchResultsCount = document.querySelector('.timeline-search .search-results-count');
    
    if (!searchInput || !searchResultsCount) {
        console.log('Timeline search elements not found');
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
            
            // Hide/show timeline line based on results
            var timelineLine = document.querySelector('.timeline-line');
            var timelineContainer = document.querySelector('.timeline-container');
            
            if (searchTerm && visibleCount === 0) {
                // No results found
                searchResultsCount.textContent = 'No results found for "' + searchTerm + '"';
                searchResultsCount.style.color = '#e74c3c';
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
                if (searchTerm === '') {
                    searchResultsCount.textContent = '';
                } else {
                    searchResultsCount.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' entries';
                    searchResultsCount.style.color = '';
                }
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
    
    // Initialize filter drawer
    var filterButton = document.getElementById('filter-toggle-button');
    var filterDrawer = document.getElementById('filter-drawer');
    var filterDrawerClose = document.getElementById('filter-drawer-close');
    var filterIndicator = document.querySelector('.filter-indicator');
    
    if (filterButton && filterDrawer) {
        // Open filter drawer
        filterButton.addEventListener('click', function() {
            filterDrawer.classList.add('active');
            filterButton.classList.add('drawer-open');
            
            // Initialize visual timeline on first open
            if (!window.visualTimelineInitialized) {
                window.visualTimelineInitialized = true;
                // Continue with timeline initialization below
            }
        });
        
        // Close filter drawer
        if (filterDrawerClose) {
            filterDrawerClose.addEventListener('click', function() {
                filterDrawer.classList.remove('active');
                filterButton.classList.remove('drawer-open');
            });
        }
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && filterDrawer.classList.contains('active')) {
                filterDrawer.classList.remove('active');
                filterButton.classList.remove('drawer-open');
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
        
        // Update filter info
        if (filterRangeText) {
            filterRangeText.textContent = 'Showing ' + visibleCount + ' events from ' + startYear + ' to ' + endYear;
        }
        if (clearButton) {
            clearButton.style.display = 'inline-block';
        }
        
        // Add active filter indicator to button
        var filterButton = document.getElementById('filter-toggle-button');
        var filterIndicator = document.querySelector('.filter-indicator');
        if (filterButton) {
            filterButton.classList.add('has-active-filter');
        }
        // Update indicator with count of filtered items
        if (filterIndicator) {
            filterIndicator.textContent = visibleCount;
            filterIndicator.style.display = 'inline-flex';
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
    
    // Clear filter button
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            // Reset timeline items (both time and search filters)
            var timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach(function(item) {
                item.classList.remove('time-filtered');
                item.classList.remove('search-hidden');
            });
            
            // Reset histogram bars to default state
            histogramContainer.querySelectorAll('.histogram-bar').forEach(function(bar) {
                bar.classList.remove('active');
            });
            
            // Reset range selector to full width
            if (selectionRange) {
                selectionRange.style.left = '0%';
                selectionRange.style.width = '100%';
            }
            
            // Reset handle positions to full range
            if (leftHandle) {
                positionHandle(leftHandle, 0, true);
            }
            if (rightHandle) {
                positionHandle(rightHandle, 100, false);
            }
            
            // Reset labels to full range
            if (startLabel) {
                startLabel.textContent = minYear + ' AD';
            }
            if (endLabel) {
                endLabel.textContent = maxYear;
            }
            
            // Clear search input
            var searchInput = document.querySelector('.timeline-search-input');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Clear search results count
            var searchResultsCount = document.querySelector('.search-results-count');
            if (searchResultsCount) {
                searchResultsCount.textContent = '';
            }
            
            // Clear filter text and hide button
            if (filterRangeText) {
                filterRangeText.textContent = '';
            }
            if (clearButton) {
                clearButton.style.display = 'none';
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
        });
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