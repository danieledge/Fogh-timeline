// Timeline functionality
// Debug panel for mobile
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

function showDebug(message) {
    // Only show debug console if debug=true is in URL
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') !== 'true') {
        return;
    }
    
    var debugDiv = document.getElementById('debug-display');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-display';
        debugDiv.style.cssText = 'position: fixed; bottom: 10px; left: 10px; right: 10px; background: #4ecdc4; color: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; z-index: 9998; max-height: 150px; overflow-y: auto;';
        document.body.appendChild(debugDiv);
    }
    debugDiv.innerHTML += '<div>' + message + '</div>';
}

// Function to initialize timeline
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
        var sunIcon = '<path d="M12 17c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM12 3v2M12 19v2M21 12h-2M5 12H3M18.36 5.64l-1.41 1.41M7.05 16.95l-1.41 1.41M18.36 18.36l-1.41-1.41M7.05 7.05L5.64 5.64" fill="white" stroke="white" stroke-width="1.5"/>';
        var moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="white"/>';
        var infoIcon = '<path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V11H13M13 9H11V7H13" fill="white"/>';
        var closeIcon = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>';
        showDebug('UI icons defined');
        
        // Define FoGH logos inline
        var foghLogoHeader = '<g transform="translate(0.000000,96.000000) scale(0.050000,-0.050000)" fill="#1f6c49" stroke="none"><path d="M6990 1878 c-511 -38 -1488 -53 -2680 -42 -1661 15 -2379 12 -2580 -14 -88 -11 -272 -34 -410 -51 -1000 -122 -1226 -334 -1121 -1054 76 -517 381 -694 1181 -683 128 2 2411 3 4240 2 863 0 1302 7 1370 22 55 12 339 31 630 42 882 34 1078 100 1220 411 144 315 22 1030 -202 1180 -221 148 -988 235 -1648 187z m839 -118 c419 -31 751 -113 828 -206 137 -166 201 -772 102 -984 -180 -389 -465 -418 -4059 -422 -1292 -1 -2651 -4 -3020 -6 -1202 -7 -1363 78 -1395 742 -26 548 175 694 1085 785 176 18 334 39 350 46 17 7 1142 16 2500 18 1359 3 2556 13 2660 23 272 26 624 27 949 4z"></path> <path d="M6856 1729 c-20 -20 -1868 -50 -3516 -58 -907 -4 -1663 -12 -1680 -18 -16 -5 -132 -15 -257 -22 -833 -43 -1151 -330 -1043 -940 86 -484 273 -547 1550 -522 374 7 1533 12 2574 12 1440 -1 1998 6 2330 28 240 15 598 34 796 41 1071 37 1334 291 1086 1050 -76 235 -111 273 -304 331 -200 60 -1492 143 -1536 98z m478 -314 c16 -20 43 -270 72 -655 9 -121 -94 -62 -114 65 l-18 115 -80 0 -79 0 10 -140 c7 -105 3 -145 -19 -163 -56 -46 -81 23 -105 283 -12 138 -28 293 -34 345 -12 91 -10 95 38 95 61 0 67 -14 85 -187 l15 -133 80 0 81 0 -14 181 c-7 99 -8 189 -2 200 17 27 61 24 84 -6z m-2988 -22 c132 -55 151 -142 20 -94 -167 60 -219 -236 -56 -320 74 -38 80 -89 10 -89 -66 -1 -72 -49 -32 -248 39 -192 40 -182 -6 -182 -54 0 -73 34 -100 180 -14 72 -29 150 -34 175 -5 27 -23 45 -46 45 -45 0 -91 50 -73 79 8 12 32 21 55 21 39 0 40 8 28 135 -15 155 22 256 108 299 61 31 49 31 126 -1z m3579 2 c24 -18 38 -86 55 -255 12 -126 29 -285 37 -352 17 -136 12 -168 -26 -168 -56 0 -75 69 -111 412 -43 400 -40 428 45 363z m-2901 -48 c63 -31 116 -101 116 -151 0 -55 -52 -43 -98 22 -78 109 -178 92 -231 -41 -98 -242 25 -482 186 -363 60 45 92 196 37 175 -16 -6 -45 4 -64 23 -43 44 3 88 89 88 94 -1 107 -25 134 -253 37 -318 35 -367 -12 -367 -52 0 -81 58 -81 161 0 78 -3 83 -45 68 -227 -79 -411 88 -389 353 24 280 157 386 358 285z m-2107 7 c12 -14 40 -163 62 -331 22 -167 46 -326 53 -353 14 -57 -35 -89 -80 -52 -15 13 -42 17 -60 10 -89 -34 -192 61 -192 178 0 69 73 154 132 154 45 0 49 6 39 65 -19 115 -51 325 -51 340 0 25 74 17 97 -11z m2499 0 c29 -34 -2 -80 -48 -71 -53 10 -64 97 -12 97 22 0 49 -12 60 -26z m2351 -9 c44 -156 58 -705 19 -705 -59 1 -76 47 -89 234 -7 108 -20 266 -28 351 l-15 155 52 0 c32 0 55 -13 61 -35z m-6428 -14 c35 -42 10 -69 -80 -84 l-79 -12 0 -96 c0 -88 5 -97 60 -116 70 -24 64 -73 -11 -92 -48 -12 -49 -16 -49 -221 0 -208 0 -210 -48 -210 -68 0 -72 22 -72 441 0 421 -15 375 130 406 81 17 126 12 149 -16z m441 -82 c0 -48 -59 -58 -89 -17 -37 51 -3 96 51 67 21 -11 38 -34 38 -50z m5779 2 c27 -33 12 -71 -28 -71 -36 0 -77 53 -62 79 19 30 62 26 90 -8z m-1378 -43 c28 -32 0 -67 -54 -68 -50 0 -77 -63 -37 -85 54 -31 130 -109 130 -135 0 -88 -203 -159 -259 -91 -29 35 -8 78 31 63 55 -21 144 28 100 55 -158 97 -183 156 -99 240 59 60 148 70 188 21z m426 -48 c-1 -27 -52 -188 -114 -356 -61 -168 -117 -337 -125 -375 -14 -78 -30 -94 -75 -78 -57 22 -52 72 29 313 l82 241 -92 93 c-51 51 -92 109 -92 128 0 60 67 37 141 -49 l72 -84 46 115 c51 126 134 160 128 52z m-880 -10 c154 -64 147 -240 -12 -296 -39 -14 -42 -61 -18 -279 17 -149 7 -183 -49 -172 -45 9 -59 77 -79 397 -8 127 -23 252 -33 279 -34 91 60 126 191 71z m-270 -217 c28 -192 15 -243 -52 -201 -28 18 -77 237 -84 374 -1 9 24 14 54 10 53 -6 56 -12 82 -183z m-3302 102 c77 -60 -10 -315 -107 -315 -58 0 -16 -50 64 -75 140 -46 135 -42 108 -75 -40 -49 -149 -37 -221 24 -240 202 -88 631 156 441z m1156 35 c43 -32 15 -69 -54 -70 -65 0 -56 -56 14 -98 153 -90 103 -322 -69 -322 -66 0 -101 55 -47 74 122 43 142 151 35 186 -82 27 -116 79 -98 150 24 97 141 140 219 80z m4238 -1 c20 -21 31 -68 31 -135 0 -57 6 -138 13 -179 10 -60 5 -77 -23 -88 -57 -22 -83 38 -98 223 -17 210 2 254 77 179z m-5927 -29 c10 0 18 -18 18 -40 0 -26 -13 -40 -39 -40 -60 0 -87 -72 -99 -270 -13 -194 -58 -257 -102 -141 -37 97 -35 441 2 441 18 0 45 11 60 23 40 31 84 45 115 35 14 -4 35 -8 45 -8z m913 -11 c104 -73 185 -469 96 -469 -46 0 -68 48 -95 209 -39 237 -89 221 -114 -37 -26 -262 -124 -122 -146 208 -6 89 -5 90 57 90 35 0 70 7 79 15 24 24 76 17 123 -16z m1393 -20 c130 -130 42 -401 -118 -361 -187 47 -209 329 -29 372 102 24 113 23 147 -11z m-2164 -54 c33 -26 88 -379 65 -416 -23 -37 -88 -20 -97 26 -63 339 -53 458 32 390z"></path> <path d="M2835 838 c-35 -51 -30 -118 8 -118 27 0 41 48 33 113 l-6 57 -35 -52z"></path> <path d="M5660 1020 c0 -38 10 -60 28 -60 38 0 58 59 30 93 -37 44 -58 32 -58 -33z"></path> <path d="M2022 964 c-13 -25 -22 -75 -18 -110 l6 -64 37 54 c28 42 33 67 18 110 l-18 56 -25 -46z"></path> <path d="M3792 909 c-64 -64 -18 -191 59 -161 23 8 30 34 25 95 -7 93 -35 115 -84 66z"></path></g>';
        var foghIcon = '<g transform="translate(0.000000,247.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">\n<path d="M2839 2326 c-2 -2 -116 -6 -254 -10 -137 -3 -306 -8 -375 -11 -69 -3 -199 -7 -290 -9 -91 -2 -194 -9 -230 -15 -118 -19 -283 -40 -405 -51 -66 -6 -131 -14 -145 -16 -14 -3 -54 -9 -90 -13 -134 -16 -291 -52 -360 -83 -25 -11 -79 -32 -120 -45 -75 -25 -159 -63 -235 -105 -100 -56 -232 -229 -276 -363 -26 -78 -46 -378 -31 -445 7 -28 12 -70 12 -92 0 -101 54 -364 92 -444 111 -239 317 -382 653 -455 65 -14 376 -32 560 -32 387 0 1424 13 1451 18 16 3 234 12 484 20 l455 14 90 31 c148 51 222 87 280 136 125 105 155 134 187 184 50 77 93 180 116 280 23 102 30 376 12 497 -32 211 -72 371 -135 543 -34 91 -70 146 -131 198 -46 39 -200 122 -228 122 -7 0 -30 7 -51 15 -20 9 -55 20 -78 25 -23 5 -105 22 -182 38 -77 16 -189 33 -250 37 -60 4 -119 11 -131 15 -22 9 -387 24 -395 16z m86 -137 c11 -5 92 -10 180 -13 238 -5 490 -43 730 -109 247 -69 287 -103 368 -318 23 -58 62 -195 81 -284 31 -139 42 -417 23 -562 -13 -95 -21 -124 -58 -198 -98 -196 -296 -329 -566 -380 -48 -9 -110 -20 -136 -26 -26 -5 -90 -9 -141 -9 -51 0 -118 -5 -147 -11 -30 -6 -114 -11 -188 -10 -74 1 -137 -3 -140 -8 -7 -11 -327 -15 -1051 -14 -758 1 -859 3 -900 13 -19 5 -69 14 -110 20 -229 34 -345 85 -510 223 -62 52 -150 189 -150 235 0 9 -7 39 -15 67 -37 122 -59 561 -35 701 20 114 86 230 172 301 53 43 201 123 229 123 8 0 19 4 25 9 5 4 51 25 102 45 134 53 490 118 747 137 61 4 151 13 200 19 188 22 255 30 420 44 94 9 188 17 210 19 86 6 641 -5 660 -14z"/>\n<path d="M2245 2123 c-155 -7 -636 -34 -685 -39 -30 -3 -95 -7 -145 -10 -49 -3 -112 -9 -138 -14 -26 -6 -63 -10 -81 -10 -66 0 -355 -77 -453 -121 -24 -10 -48 -19 -55 -20 -23 -1 -166 -83 -223 -127 -86 -68 -158 -181 -215 -342 -46 -127 -29 -463 33 -675 18 -63 95 -196 140 -243 48 -50 142 -120 204 -151 118 -59 322 -83 631 -73 128 4 301 5 385 2 84 -3 292 -5 462 -4 287 1 401 6 720 34 66 6 224 15 350 20 127 5 250 13 275 19 25 6 107 24 184 40 233 51 349 101 455 198 58 53 78 80 115 156 25 51 52 115 61 142 35 117 3 447 -57 595 -19 44 -25 64 -41 125 -16 60 -49 166 -69 217 -5 14 -39 49 -74 76 -107 82 -323 142 -584 163 -101 8 -150 16 -162 26 -14 13 -87 15 -495 17 -263 1 -505 0 -538 -1z m205 -378 c84 -23 149 -66 196 -128 25 -34 44 -70 44 -85 0 -28 -25 -62 -46 -62 -18 0 -84 59 -84 74 0 24 -66 75 -111 87 -111 30 -180 -61 -219 -288 -24 -133 15 -242 108 -303 55 -36 72 -37 139 -6 73 34 103 84 103 171 l0 65 -42 0 c-65 0 -120 64 -90 106 4 5 43 16 86 22 69 11 85 10 122 -4 24 -9 46 -26 52 -40 16 -35 38 -230 62 -553 8 -98 7 -137 -1 -147 -18 -21 -83 -18 -104 6 -22 24 -44 132 -45 216 0 33 -3 63 -6 67 -4 3 -28 -5 -54 -18 -71 -36 -117 -40 -202 -20 -69 17 -77 22 -149 94 -64 65 -79 87 -102 149 -29 78 -36 179 -18 251 5 20 15 61 22 91 26 116 66 179 154 240 60 41 85 43 185 15z m-989 -34 c33 -34 36 -52 12 -73 -20 -17 -105 -38 -156 -38 -52 0 -57 -12 -57 -136 0 -122 1 -124 60 -124 16 0 41 -10 55 -23 22 -18 25 -28 19 -50 -7 -30 -23 -39 -89 -53 l-40 -9 -1 -249 c-1 -230 -2 -250 -19 -262 -30 -22 -73 -17 -99 11 -20 22 -24 38 -28 137 -4 62 -4 277 -2 478 6 410 0 384 83 395 25 4 64 10 86 15 22 4 64 8 93 9 47 1 57 -3 83 -28z m1880 10 c25 -20 22 5 59 -496 15 -193 16 -208 31 -282 17 -85 5 -113 -49 -113 -24 0 -46 7 -60 20 -22 21 -24 30 -43 177 -7 51 -17 97 -23 102 -10 8 -171 -1 -180 -10 -3 -2 2 -75 9 -163 13 -142 13 -160 -2 -182 -21 -33 -71 -33 -103 1 -23 24 -26 41 -42 238 -21 244 -32 359 -49 509 -13 119 -8 138 38 138 32 0 79 -25 87 -47 10 -24 25 -146 33 -255 3 -50 11 -92 18 -98 13 -11 154 -3 175 10 8 5 8 58 -1 211 -7 113 -9 217 -5 232 6 24 11 27 45 27 23 0 48 -8 62 -19z m-1486 -427 c37 -17 60 -58 96 -168 22 -70 22 -65 -8 -179 -7 -26 -61 -86 -94 -103 -46 -23 -135 -18 -185 11 -74 44 -124 134 -124 224 0 127 59 201 179 221 73 12 101 11 136 -6z"/>\n<path d="M1714 1156 c-31 -31 -34 -40 -34 -90 0 -32 7 -70 16 -87 14 -27 19 -30 57 -27 37 3 44 7 59 38 9 19 17 48 18 64 0 33 -19 105 -33 124 -16 21 -48 13 -83 -22z"/>\n</g>';
        showDebug('FoGH logos defined');
        
        // Hide loading and show UI elements
        showDebug('Hiding loading message');
        document.getElementById('loading').style.display = 'none';
        
        showDebug('Showing header');
        document.querySelector('.header').style.display = 'block';
        document.getElementById('theme-toggle').style.display = 'flex';
        document.getElementById('about-button').style.display = 'flex';
        
        // Populate icons in UI
        showDebug('Populating UI icons');
        document.querySelector('.theme-toggle-icon.sun').innerHTML = sunIcon;
        document.querySelector('.theme-toggle-icon.moon').innerHTML = moonIcon;
        document.querySelector('#about-button svg').innerHTML = infoIcon;
        document.querySelector('#modal-close svg').innerHTML = closeIcon;
        
        // Populate FoGH logos
        showDebug('Populating FoGH logos');
        document.querySelector('.fogh-logo-header svg').innerHTML = foghLogoHeader;
        document.querySelector('.about-logo svg').innerHTML = foghLogoHeader;
        
        // Theme toggle functionality
        showDebug('Setting up theme toggle');
        var themeToggle = document.getElementById('theme-toggle');
        
        function toggleTheme(e) {
            e.preventDefault(); // Prevent any default behavior
            e.stopPropagation(); // Stop event bubbling
            
            var theme = document.documentElement.getAttribute('data-theme');
            var newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
        
        // Add both click and touch support for better iOS compatibility
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('touchend', toggleTheme);
        
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
            aboutModal.classList.add('active');
        }
        
        function closeModal(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            aboutModal.classList.remove('active');
        }
        
        // Add both click and touch support
        aboutButton.addEventListener('click', openModal);
        aboutButton.addEventListener('touchend', openModal);
        
        modalClose.addEventListener('click', closeModal);
        modalClose.addEventListener('touchend', closeModal);
        
        aboutModal.addEventListener('click', function(e) {
            if (e.target === aboutModal) {
                closeModal(e);
            }
        });
        
        // Get container
        showDebug('Looking for timeline container');
        var container = document.getElementById('timeline-items');
        if (!container) {
            showError('Timeline container not found!');
            return;
        }
        showDebug('Found timeline container');

        // Create timeline items using DOM methods
        showDebug('Creating ' + timelineData.length + ' timeline items');
        for (var i = 0; i < timelineData.length; i++) {
        var item = timelineData[i];
        
        // Create timeline item container
        var timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.style.animationDelay = ((i + 1) * 0.1) + 's';

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
                fetch(iconFile)
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
        desc.innerHTML = item.description; // Use innerHTML to support <sup> tags
        content.appendChild(desc);

        // Add image if present
        if (item.image) {
            var imageContainer = document.createElement('div');
            imageContainer.className = 'content-image';
            
            var img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;
            imageContainer.appendChild(img);
            
            content.appendChild(imageContainer);
            
            if (item.imageCaption) {
                var caption = document.createElement('div');
                caption.className = 'content-image-caption';
                if (item.imageCaptionHTML) {
                    caption.innerHTML = item.imageCaption;
                } else {
                    caption.textContent = item.imageCaption;
                }
                content.appendChild(caption);
            }
        }

        timelineItem.appendChild(content);
            container.appendChild(timelineItem);
        }
        showDebug('All ' + timelineData.length + ' timeline items created!');
        
        // Add citations section if citations exist
        if (typeof timelineCitations !== 'undefined' && timelineCitations.length > 0) {
            showDebug('Adding citations section...');
            var citationsContainer = document.createElement('div');
            citationsContainer.className = 'citation-list';
            
            var citationsTitle = document.createElement('h2');
            citationsTitle.textContent = 'References';
            citationsContainer.appendChild(citationsTitle);
            
            timelineCitations.forEach(function(citation) {
                var citationItem = document.createElement('div');
                citationItem.className = 'citation-item';
                
                var citationNumber = document.createElement('span');
                citationNumber.className = 'citation-number';
                citationNumber.textContent = citation.number + '.';
                
                var citationText = document.createElement('span');
                
                // Create link if URL exists
                if (citation.url) {
                    var citationLink = document.createElement('a');
                    citationLink.href = citation.url;
                    citationLink.textContent = citation.source;
                    citationLink.target = '_blank';
                    citationLink.rel = 'noopener';
                    citationLink.style.color = 'inherit';
                    citationLink.style.textDecoration = 'underline';
                    citationText.appendChild(citationLink);
                } else {
                    citationText.textContent = citation.source;
                }
                
                citationItem.appendChild(citationNumber);
                citationItem.appendChild(citationText);
                citationsContainer.appendChild(citationItem);
            });
            
            // Append citations after the timeline container (not inside it)
            var timelineContainer = document.querySelector('.timeline-container');
            timelineContainer.parentNode.insertBefore(citationsContainer, timelineContainer.nextSibling);
            showDebug('Citations section added');
        }
        
        showDebug('Timeline initialization complete!');
        
    } catch (error) {
        console.error('Timeline Error:', error);
        showError('Timeline Error: ' + error.message + ' at line ' + error.lineNumber);
        showError('Stack trace: ' + error.stack);
        document.getElementById('loading').textContent = 'Error loading timeline. Check error display.';
    }
}

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