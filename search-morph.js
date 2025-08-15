/**
 * Morphing Search Pill/Bar Implementation (Patched)
 * - Badge count in pill
 * - Inline results text (no floating box)
 * - Chips row: Date range / Category (unchanged IDs)
 *
 * This file replaces your existing search-morph.js
 */

(function() {
    'use strict';
    
    // State
    var searchState = {
        isExpanded: false,
        searchTerms: [], // Array of search term pills
        activeFilters: [],
        selectedCategories: [],
        dateRange: { start: null, end: null },
        dateModeActive: false,
        filterModeActive: false,
        isDraggingHistogram: false // Track histogram dragging state
    };
    
    // DOM Elements
    var container;
    var searchBar;
    var searchInput;
    var dateToggle;
    var filterToggle;
    var collapseBtn;
    var expandableSections;
    var dateSection;
    var categoriesSection;
    var activeFiltersSection;
    var categoryGrid;

    // NEW: badge + inline result + empty hint
    var badgeEl;               // <span id="search-badge">
    var inlineResultEl;        // <div id="search-inline-result">
    var emptyHintEl;           // <div id="search-empty-hint">
    var currentResultCount = 0; // Track the number of matching results
    var isFirstLoad = true;    // Track first page load for micro-interaction

    /**
     * Initialize the morphing search
     */
    function initMorphingSearch() {
        // Feature detect glass support
        detectGlassSupport();
        
        // Get DOM elements
        container = document.getElementById('search-morph-container');
        searchBar = document.getElementById('search-morph-bar');
        searchInput = document.getElementById('search-input-field');
        dateToggle = document.getElementById('date-toggle');
        filterToggle = document.getElementById('filter-toggle');
        collapseBtn = document.getElementById('collapse-search');
        expandableSections = document.getElementById('search-expandable-sections');
        dateSection = document.getElementById('search-date-section');
        categoriesSection = document.getElementById('search-categories-section');
        activeFiltersSection = document.getElementById('search-active-filters');
        categoryGrid = document.getElementById('search-category-grid');

        // NEW: refs for mockup bits
        badgeEl = document.getElementById('search-badge');
        inlineResultEl = document.getElementById('search-inline-result');
        emptyHintEl = document.getElementById('search-empty-hint');
        
        if (!container || !searchBar) {
            console.error('Morphing search elements not found');
            return;
        }
        
        // Ensure initial state
        container.classList.add('pill-state');
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        
        // Hide old search button
        var oldSearchBtn = document.getElementById('search-toggle-button');
        if (oldSearchBtn) {
            oldSearchBtn.style.display = 'none';
        }
        
        // Initialize
        initEventListeners();
        initCategories();

        // NEW: initialize badge visibility and empty state
        updateBadge();
        updateEmptyState();
        
        // First load micro-interaction
        if (isFirstLoad && !sessionStorage.getItem('searchHintShown')) {
            container.classList.add('first-load');
            setTimeout(function() {
                container.classList.remove('first-load');
            }, 600);
            sessionStorage.setItem('searchHintShown', 'true');
            isFirstLoad = false;
        }
    }
    
    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Click pill to expand - make entire pill area clickable
        searchBar.addEventListener('click', function(e) {
            if (container.classList.contains('pill-state')) {
                // Expand on any click within the pill (except the badge which might have its own handler)
                expandSearch();
            }
        });
        
        // Also handle touch events for better mobile responsiveness
        searchBar.addEventListener('touchstart', function(e) {
            if (container.classList.contains('pill-state')) {
                e.preventDefault(); // Prevent double-tap zoom
                expandSearch();
            }
        }, { passive: false });
        
        // Collapse button
        collapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            collapseSearch();
        });
        
        // Search input - only on Enter, not while typing
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Only add term if input is not empty
                if (searchInput.value.trim()) {
                    addSearchTerm();
                }
            }
        });
        
        // Mode toggles
        dateToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDateMode();
        });
        
        filterToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFilterMode();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+F or / to open search
            if ((e.ctrlKey && e.key === 'f') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
                e.preventDefault();
                if (container.classList.contains('pill-state')) {
                    expandSearch();
                }
                searchInput.focus();
            }
            // ESC to collapse
            if (e.key === 'Escape' && container.classList.contains('expanded-state')) {
                collapseSearch();
            }
        });
        
        // Robust outside-click collapse
        document.addEventListener('click', handleOutsideClick, true);
        document.addEventListener('touchstart', handleOutsideClick, true);
        
        // Track histogram dragging to prevent accidental collapse
        document.addEventListener('mousedown', function(e) {
            if (e.target.closest('.selection-handle') || e.target.closest('.selection-range')) {
                searchState.isDraggingHistogram = true;
            }
        });
        
        document.addEventListener('mouseup', function() {
            searchState.isDraggingHistogram = false;
        });
        
        document.addEventListener('touchend', function() {
            searchState.isDraggingHistogram = false;
        });
        
        // Collapse on main page interaction
        var collapseOnInteraction = function() {
            if (container.classList.contains('expanded-state') && !hasActiveFilters() && !searchInput.matches(':focus')) {
                collapseSearch();
            }
        };
        
        // Timeline container interactions
        var mainContent = document.querySelector('.timeline-container');
        if (mainContent) {
            mainContent.addEventListener('scroll', collapseOnInteraction);
            mainContent.addEventListener('click', collapseOnInteraction);
            mainContent.addEventListener('touchstart', collapseOnInteraction);
        }
        
        // Window scroll
        window.addEventListener('scroll', collapseOnInteraction);
        
        // Any click on timeline items, buttons, or links
        document.addEventListener('click', function(e) {
            // Check if click is on any interactive element outside search
            if (!container.contains(e.target)) {
                var isInteractive = e.target.closest('.timeline-item, .control-button, .nav-button, a, button, [role="button"]');
                if (isInteractive) {
                    collapseOnInteraction();
                }
            }
        });
        
        // Mouse wheel events
        document.addEventListener('wheel', function(e) {
            if (!container.contains(e.target)) {
                collapseOnInteraction();
            }
        });
        
        // Touch events for mobile
        document.addEventListener('touchmove', function(e) {
            if (!container.contains(e.target)) {
                collapseOnInteraction();
            }
        });
    }
    
    /**
     * Initialize categories
     */
    function initCategories() {
        if (!window.timelineCategories || !categoryGrid) return;
        
        categoryGrid.innerHTML = '';
        
        for (var key in timelineCategories) {
            var category = timelineCategories[key];
            var categoryItem = document.createElement('button');
            categoryItem.className = 'search-category-item';
            categoryItem.setAttribute('data-category', key);
            categoryItem.textContent = category.name || key;
            
            // Set background color
            if (category.color) {
                categoryItem.style.backgroundColor = category.color;
                categoryItem.style.color = 'white';
                categoryItem.style.borderColor = category.color;
            }
            
            categoryItem.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleCategory(this.getAttribute('data-category'));
            });
            
            categoryGrid.appendChild(categoryItem);
        }
    }
    
    /**
     * Expand search to full bar with dialog semantics
     */
    function expandSearch() {
        container.classList.remove('pill-state');
        container.classList.add('expanded-state');
        searchState.isExpanded = true;
        
        // Set dialog attributes for expanded state
        searchBar.setAttribute('role', 'dialog');
        searchBar.setAttribute('aria-modal', 'true');
        
        // Check if there are any active filters
        var hasFilters = searchState.searchTerms.length > 0 ||
                        searchState.selectedCategories.length > 0 || 
                        (searchState.dateRange.start || searchState.dateRange.end);
        
        // Show active filters section if there are filters
        if (hasFilters && expandableSections && activeFiltersSection) {
            expandableSections.classList.add('show');
            activeFiltersSection.style.display = 'block';
        }
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus input after animation
        setTimeout(function() {
            searchInput.focus();
            setupFocusTrap();
        }, 200);
        
        updateEmptyState();
    }
    
    /**
     * Collapse search to pill and release locks
     */
    function collapseSearch() {
        // First hide the expandable sections to prevent them showing during transition
        searchState.dateModeActive = false;
        searchState.filterModeActive = false;
        if (dateToggle) {
            dateToggle.classList.remove('active');
            dateToggle.setAttribute('aria-expanded', 'false');
            dateToggle.setAttribute('aria-pressed', 'false');
        }
        if (filterToggle) {
            filterToggle.classList.remove('active');
            filterToggle.setAttribute('aria-expanded', 'false');
            filterToggle.setAttribute('aria-pressed', 'false');
        }
        if (expandableSections) expandableSections.classList.remove('show');
        if (dateSection) dateSection.style.display = 'none';
        if (categoriesSection) categoriesSection.style.display = 'none';
        
        // Small delay to ensure sections are hidden before collapsing
        setTimeout(function() {
            container.classList.remove('expanded-state');
            container.classList.add('pill-state');
            searchState.isExpanded = false;
            
            // Remove dialog attributes
            searchBar.removeAttribute('role');
            searchBar.removeAttribute('aria-modal');
            
            // Release body scroll lock
            document.body.style.overflow = '';
            
            // Release focus trap
            releaseFocusTrap();
            
            // Ensure container is visible
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            
            // NEW: keep badge fresh on collapse too
            updateBadge();
            updateEmptyState();
        }, 50); // Small delay to hide sections first
    }
    
    /**
     * Toggle date mode
     */
    function toggleDateMode() {
        searchState.dateModeActive = !searchState.dateModeActive;
        dateToggle.classList.toggle('active', searchState.dateModeActive);
        dateSection.style.display = searchState.dateModeActive ? 'block' : 'none';
        
        if (searchState.dateModeActive) {
            expandableSections.classList.add('show');
            // Delay histogram init to ensure section is visible
            setTimeout(function() {
                initHistogram();
            }, 50);
        } else if (!searchState.filterModeActive) {
            expandableSections.classList.remove('show');
        }

        // NEW
        updateBadge();
        updateEmptyState();
    }
    
    /**
     * Toggle filter mode
     */
    function toggleFilterMode() {
        searchState.filterModeActive = !searchState.filterModeActive;
        filterToggle.classList.toggle('active', searchState.filterModeActive);
        categoriesSection.style.display = searchState.filterModeActive ? 'block' : 'none';
        
        if (searchState.filterModeActive) {
            expandableSections.classList.add('show');
        } else if (!searchState.dateModeActive) {
            expandableSections.classList.remove('show');
        }

        // NEW
        updateBadge();
        updateEmptyState();
    }
    
    /**
     * Initialize histogram in date section
     */
    function initHistogram() {
        if (!dateSection.querySelector('.visual-timeline')) {
            // Create the structure without century periods
            dateSection.innerHTML = `
                <div class="visual-timeline-container">
                    <div class="visual-timeline">
                        <!-- Removed timeline-periods div that contained century labels -->
                        <div class="timeline-histogram">
                            <!-- Event density bars will be generated here -->
                        </div>
                        <div class="timeline-selection">
                            <div class="selection-handle left" data-handle="left">
                                <div class="handle-grip"></div>
                            </div>
                            <div class="selection-range">
                                <div class="range-label start"></div>
                                <div class="range-label end"></div>
                            </div>
                            <div class="selection-handle right" data-handle="right">
                                <div class="handle-grip"></div>
                            </div>
                        </div>
                        <div class="timeline-labels">
                            <!-- Year labels will be generated here -->
                        </div>
                    </div>
                </div>
            `;
            
            // Call the EXACT same function as the filter modal
            setTimeout(function() {
                // Make sure timeline data is available
                if (typeof timelineData === 'undefined' || !timelineData || timelineData.length === 0) {
                    console.error('Timeline data not available for histogram');
                    return;
                }
                
                // Call the main timeline initialization with our context
                var originalQuerySelector = document.querySelector;
                var originalQuerySelectorAll = document.querySelectorAll;
                
                document.querySelector = function(selector) {
                    // Route timeline-specific selectors to our date section
                    if (selector === '.timeline-periods' || 
                        selector === '.timeline-histogram' ||
                        selector === '.timeline-labels' ||
                        selector === '.timeline-selection' ||
                        selector === '.selection-handle.left' ||
                        selector === '.selection-handle.right' ||
                        selector === '.selection-range' ||
                        selector === '.range-label.start' ||
                        selector === '.range-label.end' ||
                        selector.includes('timeline-period') ||
                        selector.includes('histogram-bar') ||
                        selector.includes('timeline-label')) {
                        var result = dateSection.querySelector(selector);
                        if (result) {
                            return result;
                        }
                    }
                    // Return null for filter-specific elements
                    if (selector === '.filter-range-text' || 
                        selector === '.clear-time-filter' ||
                        selector === '#filter-status' ||
                        selector === '#clear-all-filters') {
                        return null;
                    }
                    return originalQuerySelector.call(document, selector);
                };
                
                document.querySelectorAll = function(selector) {
                    if (selector === '.timeline-item') {
                        return originalQuerySelectorAll.call(document, selector);
                    }
                    if (selector.includes('timeline-period') || 
                        selector.includes('histogram-bar') ||
                        selector.includes('timeline-label')) {
                        var results = dateSection.querySelectorAll(selector);
                        if (results.length > 0) return results;
                    }
                    return originalQuerySelectorAll.call(document, selector);
                };
                
                // Temporarily override filter-specific functions to prevent errors
                var originalFilterByYearRange = window.filterByYearRange;
                var originalUpdateFilterIndicator = window.updateFilterIndicator;
                var originalUpdateFilterStatus = window.updateFilterStatus;
                
                // Override with search-specific implementations
                window.filterByYearRange = function(start, end) {
                    console.log('Date range selected:', start, '-', end);
                    searchState.dateRange = { start: start, end: end };
                    updateActiveFilters();
                    performSearch();
                    updateBadge(); // NEW
                };
                window.updateFilterIndicator = function() { /* no-op for search */ };
                window.updateFilterStatus = function() { /* no-op for search */ };
                
                // Call the main timeline initialization
                console.log('Calling initializeVisualTimeline for search histogram...');
                try {
                    window.initializeVisualTimeline();
                } catch (e) {
                    console.error('Error initializing visual timeline:', e);
                }
                
                // Restore original functions
                window.filterByYearRange = originalFilterByYearRange;
                window.updateFilterIndicator = originalUpdateFilterIndicator;
                window.updateFilterStatus = originalUpdateFilterStatus;
                document.querySelector = originalQuerySelector;
                document.querySelectorAll = originalQuerySelectorAll;
                
                // Add more date labels for better granularity
                addAdditionalDateLabels();
                
                // Add search-specific handle listeners
                setupSearchHandleListeners();
            }, 100);
        }
    }
    
    /**
     * Add additional date labels for better granularity
     */
    function addAdditionalDateLabels() {
        var labelsContainer = dateSection.querySelector('.timeline-labels');
        if (!labelsContainer) return;
        
        // Clear existing labels first
        labelsContainer.innerHTML = '';
        
        // Get the histogram bars to understand actual data distribution
        var histogramBars = dateSection.querySelectorAll('.histogram-bar');
        if (!histogramBars || histogramBars.length === 0) {
            console.log('No histogram bars found, cannot add labels');
            return;
        }
        
        // Use the histogram segment map if available (created by the main timeline)
        // This contains the visual distribution logic
        if (!window.histogramSegmentMap || !window.histogramBins) {
            console.log('Histogram segment map not available, using simple distribution');
            return;
        }
        
        var segmentMap = window.histogramSegmentMap;
        var totalBins = window.histogramBins;
        
        console.log('Using histogram segment map with ' + segmentMap.length + ' segments');
        
        // Select 5 dates that represent key points in the visual timeline
        var labelsToShow = [];
        
        // Helper function to find which segment contains a year
        function findSegmentForYear(year) {
            for (var i = 0; i < segmentMap.length; i++) {
                var seg = segmentMap[i].segment;
                if (year >= seg.start && year <= seg.end) {
                    return segmentMap[i];
                }
            }
            return null;
        }
        
        // Helper function to calculate visual position for a year
        function getVisualPosition(year) {
            var mapping = findSegmentForYear(year);
            if (!mapping) {
                console.log('No segment found for year ' + year);
                return null;
            }
            
            var segment = mapping.segment;
            var positionInSegment = (segment.end === segment.start) ? 0.5 : 
                (year - segment.start) / (segment.end - segment.start);
            var binInSegment = positionInSegment * mapping.bins;
            var absoluteBin = mapping.startBin + binInSegment;
            
            // Convert bin position to percentage
            return (absoluteBin / totalBins) * 100;
        }
        
        // Helper function to find the year at a specific bin position
        function findYearAtBinPosition(targetBin) {
            for (var i = 0; i < segmentMap.length; i++) {
                var mapping = segmentMap[i];
                if (targetBin >= mapping.startBin && targetBin <= mapping.endBin) {
                    var segment = mapping.segment;
                    var binWithinSegment = targetBin - mapping.startBin;
                    var positionInSegment = binWithinSegment / mapping.bins;
                    
                    if (segment.years.length === 1) {
                        return segment.years[0];
                    } else if (positionInSegment <= 0) {
                        return segment.start;
                    } else if (positionInSegment >= 1) {
                        return segment.end;
                    } else {
                        var yearPosition = segment.start + (segment.end - segment.start) * positionInSegment;
                        var closest = segment.years[0];
                        var minDiff = Math.abs(yearPosition - segment.years[0]);
                        segment.years.forEach(function(year) {
                            var diff = Math.abs(yearPosition - year);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closest = year;
                            }
                        });
                        return closest;
                    }
                }
            }
            var lastSegment = segmentMap[segmentMap.length - 1].segment;
            return lastSegment.end;
        }
        
        var targetYears = [];
        var year0 = findYearAtBinPosition(0);
        targetYears.push(year0);
        var bin18 = Math.floor(totalBins * 0.18);
        var year1750 = findYearAtBinPosition(bin18);
        if (targetYears.indexOf(year1750) === -1) targetYears.push(year1750);
        var bin40 = Math.floor(totalBins * 0.4);
        var year1900 = findYearAtBinPosition(bin40);
        if (targetYears.indexOf(year1900) === -1) targetYears.push(year1900);
        var bin70 = Math.floor(totalBins * 0.7);
        var year1970 = findYearAtBinPosition(bin70);
        if (targetYears.indexOf(year1970) === -1) targetYears.push(year1970);
        var lastSegment = segmentMap[segmentMap.length - 1].segment;
        var actualLastYear = lastSegment.years[lastSegment.years.length - 1] || lastSegment.end;
        if (targetYears.indexOf(actualLastYear) === -1) targetYears.push(actualLastYear);
        
        var uniqueYears = [];
        var seen = {};
        targetYears.forEach(function(year) {
            if (year && !seen[year]) {
                seen[year] = true;
                uniqueYears.push(year);
            }
        });
        targetYears = uniqueYears;
        targetYears.sort(function(a, b) { return a - b; });
        
        var labelsToShow = [];
        targetYears.forEach(function(year) {
            var position = getVisualPosition(year);
            if (position !== null) {
                labelsToShow.push({ year: year, position: position });
            }
        });
        labelsToShow.sort(function(a, b) { return a.position - b.position; });
        
        labelsToShow.forEach(function(labelInfo) {
            var label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = labelInfo.year;
            label.style.position = 'absolute';
            label.style.left = labelInfo.position + '%';
            label.style.transform = 'translateX(-50%)';
            label.style.fontSize = '0.65rem';
            label.style.color = 'var(--text-secondary)';
            label.style.fontWeight = '500';
            label.style.whiteSpace = 'nowrap';
            labelsContainer.appendChild(label);
        });
        
        console.log('Added ' + labelsToShow.length + ' date labels matching histogram distribution');
    }
    
    function findClosestYear(years, target) {
        var closest = null;
        var minDiff = Infinity;
        for (var i = 0; i < years.length; i++) {
            var diff = Math.abs(years[i] - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = years[i];
            }
        }
        return closest;
    }
    
    function setupSearchHandleListeners() {
        var searchDateSection = dateSection;
        if (searchDateSection) {
            var observer = new MutationObserver(function() {
                var startLabel = searchDateSection.querySelector('.range-label.start');
                var endLabel = searchDateSection.querySelector('.range-label.end');
                if (startLabel && endLabel) {
                    var startText = startLabel.textContent;
                    var endText = endLabel.textContent;
                    var startYear = parseInt(startText);
                    var endYear = parseInt(endText);
                    if (!isNaN(startYear) && !isNaN(endYear)) {
                        searchState.dateRange = { start: startYear, end: endYear };
                        updateActiveFilters();
                        performSearch();
                        updateBadge(); // NEW
                    }
                }
            });
            var labelsToObserve = searchDateSection.querySelectorAll('.range-label');
            labelsToObserve.forEach(function(label) {
                observer.observe(label, { childList: true, characterData: true, subtree: true });
            });
        }
    }
    
    function toggleCategory(categoryKey) {
        var index = searchState.selectedCategories.indexOf(categoryKey);
        var categoryItem = categoryGrid.querySelector('[data-category="' + categoryKey + '"]');
        
        if (index > -1) {
            searchState.selectedCategories.splice(index, 1);
            categoryItem.classList.remove('selected');
        } else {
            searchState.selectedCategories.push(categoryKey);
            categoryItem.classList.add('selected');
        }
        
        updateActiveFilters();
        performSearch();
        updateBadge();
        updateEmptyState();
    }
    
    // Removed handleSearchInput - no longer doing live search as you type
    
    function addSearchTerm() {
        var term = searchInput.value.trim();
        if (!term) return;
        
        if (searchState.searchTerms.indexOf(term) === -1) {
            searchState.searchTerms.push(term);
            searchInput.value = '';
            
            // Ensure the active filters section is visible
            if (expandableSections && activeFiltersSection) {
                expandableSections.classList.add('show');
                activeFiltersSection.style.display = 'block';
            }
            
            updateActiveFilters();
            performSearch();
            updateBadge();
            updateEmptyState();
        } else {
            searchInput.value = '';
            updateBadge();
            updateEmptyState();
        }
    }
    
    // CHANGED: show inline, no floating counter element
    function updateResultsCounter(visible, total) {
        if (!inlineResultEl) return;
        
        // Check if any constraint is active (terms, categories, or date range)
        var hasConstraints = searchState.searchTerms.length > 0 ||
                           searchState.selectedCategories.length > 0 ||
                           searchState.dateRange.start ||
                           searchState.dateRange.end;
        
        if (hasConstraints) {
            if (visible === 0) {
                inlineResultEl.textContent = 'No results';
            } else if (visible === 1) {
                inlineResultEl.textContent = '1 result';
            } else {
                inlineResultEl.textContent = visible + ' results';
            }
        } else {
            inlineResultEl.textContent = '';
        }
    }
    
    function removeSearchTerm(term) {
        var index = searchState.searchTerms.indexOf(term);
        if (index > -1) {
            searchState.searchTerms.splice(index, 1);
            updateActiveFilters();
            performSearch();
            updateBadge();
            updateEmptyState();
        }
    }
    
    function hasActiveFilters() {
        return searchState.searchTerms.length > 0 ||
               searchState.selectedCategories.length > 0 || 
               searchState.dateRange.start || 
               searchState.dateRange.end ||
               searchState.activeFilters.length > 0;
    }
    
    function updateActiveFilters() {
        if (!activeFiltersSection) return;
        
        var hasFilters = searchState.searchTerms.length > 0 ||
                        searchState.selectedCategories.length > 0 || 
                        (searchState.dateRange.start || searchState.dateRange.end);
        
        if (hasFilters) {
            activeFiltersSection.innerHTML = '';
            activeFiltersSection.style.display = 'block';
            
            // Show expandable sections if we have filters but no mode is active
            if (expandableSections && !searchState.dateModeActive && !searchState.filterModeActive) {
                expandableSections.classList.add('show');
            }
            
            // Search term filters
            searchState.searchTerms.forEach(function(term) {
                var tag = createFilterTag('"' + term + '"', function() {
                    removeSearchTerm(term);
                });
                tag.style.backgroundColor = '#8b5cf6'; // Purple for search terms
                tag.style.borderColor = '#8b5cf6';
                activeFiltersSection.appendChild(tag);
            });
            
            // Category filters
            searchState.selectedCategories.forEach(function(categoryKey) {
                var category = timelineCategories[categoryKey];
                var tag = createFilterTag(category ? category.name : categoryKey, function() {
                    toggleCategory(categoryKey);
                });
                if (category && category.color) {
                    tag.style.backgroundColor = category.color;
                    tag.style.borderColor = category.color;
                }
                activeFiltersSection.appendChild(tag);
            });
            
            // Date filter
            if (searchState.dateRange.start || searchState.dateRange.end) {
                var dateLabel = 'Date: ';
                if (searchState.dateRange.start && searchState.dateRange.end) {
                    dateLabel += searchState.dateRange.start + ' - ' + searchState.dateRange.end;
                } else if (searchState.dateRange.start) {
                    dateLabel += 'From ' + searchState.dateRange.start;
                } else {
                    dateLabel += 'Until ' + searchState.dateRange.end;
                }
                
                var tag = createFilterTag(dateLabel, function() {
                    searchState.dateRange = { start: null, end: null };
                    // Use setTimeout to ensure UI updates properly
                    setTimeout(function() {
                        updateActiveFilters();
                        performSearch();
                        updateBadge(); // NEW
                    }, 0);
                });
                
                activeFiltersSection.appendChild(tag);
            }
        } else {
            activeFiltersSection.style.display = 'none';
            // Hide expandable sections if no filters and no mode is active
            if (expandableSections && !searchState.dateModeActive && !searchState.filterModeActive) {
                expandableSections.classList.remove('show');
            }
        }

        // NEW
        updateBadge();
    }
    
    function createFilterTag(text, onRemove) {
        var tag = document.createElement('div');
        tag.className = 'search-filter-tag';
        tag.style.cursor = 'pointer';
        
        var label = document.createElement('span');
        label.textContent = text;
        tag.appendChild(label);
        
        var removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            onRemove();
        });
        tag.appendChild(removeBtn);
        
        // Make entire pill clickable
        tag.addEventListener('click', function(e) {
            if (e.target !== removeBtn) {
                e.stopPropagation();
                onRemove();
            }
        });
        
        return tag;
    }
    
    function performSearch() {
        var timelineItems = document.querySelectorAll('.timeline-item');
        var visibleCount = 0;
        var totalCount = timelineItems.length;
        var itemsToShow = [];
        var itemsToHide = [];
        
        // Clear any existing filter classes from main timeline system
        timelineItems.forEach(function(item) {
            item.classList.remove('time-filtered');
            item.classList.remove('category-filtered');
        });
        
        timelineItems.forEach(function(item) {
            var shouldShow = true;
            var itemText = (item.textContent || '').toLowerCase();
            
            // Check search terms (all must match)
            if (searchState.searchTerms.length > 0) {
                shouldShow = searchState.searchTerms.every(function(term) {
                    return itemText.includes(term.toLowerCase());
                });
            }
            
            // Removed live typing check - only search with committed terms
            
            // Check categories
            if (shouldShow && searchState.selectedCategories.length > 0) {
                var itemCategory = item.dataset.category;
                shouldShow = itemCategory && searchState.selectedCategories.includes(itemCategory);
            }
            
            // Check date range
            if (shouldShow && (searchState.dateRange.start || searchState.dateRange.end)) {
                var dateText = item.dataset.year || 
                    (item.querySelector('.timeline-date') && item.querySelector('.timeline-date').textContent) || '';
                
                var itemStartYear = null;
                var itemEndYear = null;
                
                if (dateText.includes('AD')) {
                    var adMatch = dateText.match(/AD\s*(\d+)(?:-(\d+))?/);
                    if (adMatch) {
                        itemStartYear = parseInt(adMatch[1]);
                        itemEndYear = adMatch[2] ? parseInt(adMatch[2]) : itemStartYear;
                    }
                }
                else if (dateText.includes('th-') || dateText.includes('st-') || dateText.includes('nd-') || dateText.includes('rd-')) {
                    var centuryRangeMatch = dateText.match(/(\d{1,2})(?:st|nd|rd|th)-(\d{1,2})(?:st|nd|rd|th)/);
                    if (centuryRangeMatch) {
                        var startCentury = parseInt(centuryRangeMatch[1]);
                        var endCentury = parseInt(centuryRangeMatch[2]);
                        itemStartYear = (startCentury - 1) * 100 + 1;
                        itemEndYear = endCentury * 100;
                    }
                }
                else {
                    var fourDigitMatch = dateText.match(/\d{4}/);
                    if (fourDigitMatch) {
                        itemStartYear = itemEndYear = parseInt(fourDigitMatch[0]);
                    } else {
                        var parsed = parseInt(dateText);
                        if (!isNaN(parsed)) {
                            itemStartYear = itemEndYear = parsed;
                        }
                    }
                }
                
                if (itemStartYear !== null) {
                    var filterStart = searchState.dateRange.start || 0;
                    var filterEnd = searchState.dateRange.end || 9999;
                    if (itemEndYear < filterStart || itemStartYear > filterEnd) {
                        shouldShow = false;
                    }
                } else {
                    shouldShow = false;
                }
            }
            
            if (shouldShow) {
                itemsToShow.push(item);
                visibleCount++;
            } else {
                itemsToHide.push(item);
            }
        });
        
        // Batch DOM updates with requestAnimationFrame
        requestAnimationFrame(function() {
            itemsToShow.forEach(function(item) {
                item.classList.remove('search-hidden');
            });
            itemsToHide.forEach(function(item) {
                item.classList.add('search-hidden');
            });
        });
        
        // Update the global result count for badge
        currentResultCount = visibleCount;
        updateResultsCounter(visibleCount, totalCount);
        updateBadge(); // Update badge with result count
    }
    
    // Export function for date range updates
    window.updateSearchDateRange = function(start, end) {
        searchState.dateRange.start = start;
        searchState.dateRange.end = end;
        updateActiveFilters();
        performSearch();
        updateBadge();
        updateEmptyState();
    };

    // Badge should show number of matching entries/results with empty state rules
    function updateBadge() {
        if (!badgeEl) {
            badgeEl = document.getElementById('search-badge');
            if (!badgeEl) {
                console.error('Badge element not found');
                return;
            }
        }
        
        var count = hasActiveFilters() ? currentResultCount : 0;
        badgeEl.textContent = count;
        badgeEl.setAttribute('data-count', count);
        
        // Update pill size based on filter state
        if (hasActiveFilters()) {
            container.classList.add('has-filters');
        } else {
            container.classList.remove('has-filters');
        }
        
        // Apply visibility rules based on state
        if (container.classList.contains('pill-state')) {
            // In pill: hide when 0
            badgeEl.style.visibility = count > 0 ? 'visible' : 'hidden';
        } else {
            // In expanded: visible at 85% opacity when > 0
            badgeEl.style.visibility = count > 0 ? 'visible' : 'hidden';
        }
    }
    
    // Handle outside clicks - always collapse when clicking outside (unless dragging)
    function handleOutsideClick(e) {
        // Don't collapse if we're dragging the histogram
        if (searchState.isDraggingHistogram) {
            return;
        }
        
        if (!container.contains(e.target) && container.classList.contains('expanded-state')) {
            // Always collapse when clicking outside the search
            collapseSearch();
        }
    }
    
    // Update empty state helper hint
    function updateEmptyState() {
        if (!emptyHintEl) return;
        
        var isEmpty = !hasActiveFilters() && container.classList.contains('expanded-state');
        if (isEmpty) {
            emptyHintEl.classList.add('show');
        } else {
            emptyHintEl.classList.remove('show');
        }
    }
    
    // Detect glass effect support
    function detectGlassSupport() {
        var supportsBackdrop = CSS.supports('backdrop-filter', 'blur(10px)') || 
                               CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
        var prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
        
        if (!supportsBackdrop || prefersReducedTransparency) {
            document.documentElement.classList.add('no-glass');
        }
    }
    
    // Focus trap for dialog mode
    var focusTrapListener = null;
    function setupFocusTrap() {
        var focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        var firstFocusable = focusableElements[0];
        var lastFocusable = focusableElements[focusableElements.length - 1];
        
        focusTrapListener = function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        
        document.addEventListener('keydown', focusTrapListener);
    }
    
    function releaseFocusTrap() {
        if (focusTrapListener) {
            document.removeEventListener('keydown', focusTrapListener);
            focusTrapListener = null;
        }
    }
    
    // Load search bar HTML template first
    function loadSearchBarTemplate(callback) {
        var container = document.getElementById('search-bar-container');
        if (!container) {
            console.error('Search bar container not found');
            if (callback) callback();
            return;
        }
        
        // Check if already loaded
        if (document.getElementById('search-morph-container')) {
            if (callback) callback();
            return;
        }
        
        // Load the search bar HTML
        fetch('search-bar.html')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load search bar template');
                }
                return response.text();
            })
            .then(function(html) {
                container.innerHTML = html;
                if (callback) callback();
            })
            .catch(function(error) {
                console.error('Error loading search bar:', error);
                if (callback) callback();
            });
    }
    
    // Initialize when DOM is ready
    function init() {
        loadSearchBarTemplate(function() {
            initMorphingSearch();
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();