        // Create namespace for admin tools
        window.adminTools = {
            // Check if data is loaded
            dataLoaded: false,
            
            // Initialize
            init: function() {
                // Check if timeline data is available
                if (typeof window.timelineData === 'undefined' || typeof window.timelineCitations === 'undefined') {
                    this.showError('Timeline data not loaded. Please ensure timeline-data.js is properly loaded.');
                    return false;
                }
                
                // Check if categories are defined
                if (typeof window.timelineCategories === 'undefined') {
                    // Define a fallback
                    window.timelineCategories = {
                        "heritage": { "name": "Heritage" },
                        "gypsies": { "name": "Gypsies" },
                        "transport": { "name": "Transport" },
                        "churches": { "name": "Churches" },
                        "education": { "name": "Education" },
                        "buildings": { "name": "Buildings" },
                        "war": { "name": "War" },
                        "nature": { "name": "Nature" },
                        "community": { "name": "Community" },
                        "general": { "name": "General" }
                    };
                }
                
                this.dataLoaded = true;
                this.updateStats();
                return true;
            },

            switchTab: function(tabName, event) {
                console.log('switchTab called with:', tabName);
                try {
                    // Hide all tabs
                    document.querySelectorAll('.tab-content').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Remove active from all buttons
                    document.querySelectorAll('.tab-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Show selected tab
                    const selectedTab = document.getElementById(tabName + '-tab');
                    if (selectedTab) {
                        selectedTab.classList.add('active');
                        console.log('Tab activated:', tabName);
                    } else {
                        console.error('Tab not found:', tabName + '-tab');
                    }
                    
                    // Mark button as active
                    if (event && event.target) {
                        event.target.classList.add('active');
                    }
                } catch (error) {
                    console.error('Error in switchTab:', error);
                }
            },

            showError: function(message) {
                const errorEl = document.getElementById('error-message');
                if (errorEl) {
                    errorEl.textContent = '⚠️ ' + message;
                    errorEl.classList.add('active');
                    setTimeout(() => {
                        errorEl.classList.remove('active');
                    }, 5000);
                }
            },

            updateStats: function() {
                if (!this.dataLoaded) return;
                
                // Calculate main statistics
                const totalEntries = window.timelineData.length;
                const majorEvents = window.timelineData.filter(e => e.importance === 'major').length;
                const minorEvents = window.timelineData.filter(e => e.importance === 'minor').length;
                
                // Calculate warnings
                const orphanedCitations = this.findOrphanedCitationNumbers().length;
                const entriesWithoutCitations = window.timelineData.filter(e => !e.citations || e.citations.length === 0).length;
                const unverifiedCitations = window.timelineCitations.filter(c => c.status !== 'Verified').length;
                
                const statsGrid = document.getElementById('stats-grid');
                statsGrid.innerHTML = '';
                
                // Main statistics
                const mainStats = [
                    {
                        label: 'Total Entries',
                        value: totalEntries,
                        detail: `${majorEvents} major, ${minorEvents} minor`,
                        type: 'primary'
                    },
                    {
                        label: 'Total Citations',
                        value: window.timelineCitations.length,
                        type: 'primary'
                    },
                    {
                        label: 'Total Categories',
                        value: Object.keys(window.timelineCategories).length,
                        type: 'primary'
                    }
                ];
                
                // Warning statistics
                const warnings = [];
                if (orphanedCitations > 0) {
                    warnings.push({
                        label: 'Orphaned Citations',
                        value: orphanedCitations,
                        type: 'warning'
                    });
                }
                if (entriesWithoutCitations > 0) {
                    warnings.push({
                        label: 'Entries Without Citations',
                        value: entriesWithoutCitations,
                        type: 'warning'
                    });
                }
                if (unverifiedCitations > 0) {
                    warnings.push({
                        label: 'Unverified Citations',
                        value: unverifiedCitations,
                        type: 'warning'
                    });
                }
                
                // Render main stats
                mainStats.forEach(stat => {
                    const card = document.createElement('div');
                    card.className = 'stat-card stat-primary';
                    card.innerHTML = `
                        <div class="stat-number">${stat.value}</div>
                        <div class="stat-label">${stat.label}</div>
                        ${stat.detail ? `<div class="stat-detail">${stat.detail}</div>` : ''}
                    `;
                    statsGrid.appendChild(card);
                });
                
                // Render warnings if any
                if (warnings.length > 0) {
                    // Add a separator
                    const separator = document.createElement('div');
                    separator.className = 'stats-separator';
                    separator.style.gridColumn = '1 / -1';
                    separator.innerHTML = '<div style="color: #f39c12; font-weight: bold; margin: 10px 0;">⚠️ Data Quality Warnings</div>';
                    statsGrid.appendChild(separator);
                    
                    warnings.forEach(warning => {
                        const card = document.createElement('div');
                        card.className = 'stat-card stat-warning';
                        card.innerHTML = `
                            <div class="stat-number" style="color: #f39c12;">${warning.value}</div>
                            <div class="stat-label">${warning.label}</div>
                        `;
                        statsGrid.appendChild(card);
                    });
                }
            },
            
            findOrphanedCitationNumbers: function() {
                const usedCitations = new Set();
                window.timelineData.forEach(entry => {
                    if (entry.citations) {
                        entry.citations.forEach(cit => usedCitations.add(cit));
                    }
                });
                
                const orphaned = [];
                window.timelineCitations.forEach(cit => {
                    if (!usedCitations.has(cit.number.toString())) {
                        orphaned.push(cit.number);
                    }
                });
                
                return orphaned;
            },

            showOutput: function(title, content) {
                document.getElementById('output-title').textContent = title;
                document.getElementById('output-content').textContent = content;
                document.getElementById('output').classList.add('active');
                document.getElementById('loading').classList.remove('active');
                
                // Scroll to output
                document.getElementById('output').scrollIntoView({ behavior: 'smooth', block: 'start' });
            },

            showLoading: function() {
                document.getElementById('loading').classList.add('active');
            },

            // iOS-friendly select all
            selectAll: function() {
                const content = document.getElementById('output-content');
                if (window.getSelection) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(content);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            },

            // Improved clipboard functionality for iOS
            copyToClipboard: function() {
                const content = document.getElementById('output-content').textContent;
                
                // Try multiple methods for better iOS compatibility
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    // Modern API
                    navigator.clipboard.writeText(content).then(() => {
                        this.showCopyFeedback();
                    }).catch(() => {
                        this.fallbackCopy(content);
                    });
                } else {
                    this.fallbackCopy(content);
                }
            },

            fallbackCopy: function(text) {
                // Create temporary textarea
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.top = '0';
                textarea.style.left = '0';
                textarea.style.width = '2em';
                textarea.style.height = '2em';
                textarea.style.padding = '0';
                textarea.style.border = 'none';
                textarea.style.outline = 'none';
                textarea.style.boxShadow = 'none';
                textarea.style.background = 'transparent';
                
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                
                // For iOS
                textarea.setSelectionRange(0, textarea.value.length);
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        this.showCopyFeedback();
                    } else {
                        this.showError('Copy failed. Please select and copy manually.');
                    }
                } catch (err) {
                    this.showError('Copy failed. Please select and copy manually.');
                }
                
                document.body.removeChild(textarea);
            },

            showCopyFeedback: function() {
                const feedback = document.getElementById('copy-feedback');
                feedback.classList.add('active');
                
                // Button feedback
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                btn.classList.add('copied');
                
                setTimeout(() => {
                    feedback.classList.remove('active');
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            },

            extractTimeline: function(format) {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = '';
                    
                    switch(format) {
                        case 'json':
                            output = JSON.stringify(window.timelineData, null, 2);
                            this.showOutput('Timeline Data (JSON)', output);
                            break;
                        
                        case 'csv':
                            output = 'Date,Title,Description,Category,Importance,Citations,Image\n';
                            window.timelineData.forEach(entry => {
                                const citations = entry.citations ? entry.citations.join(';') : '';
                                const row = [
                                    `"${entry.date}"`,
                                    `"${entry.title}"`,
                                    `"${(entry.description || '').replace(/"/g, '""')}"`,
                                    entry.category || '',
                                    entry.importance || '',
                                    citations,
                                    entry.image || ''
                                ].join(',');
                                output += row + '\n';
                            });
                            this.showOutput('Timeline Data (CSV)', output);
                            break;
                        
                        case 'markdown':
                            output = '# Gipsy Hill Timeline\n\n';
                            window.timelineData.forEach(entry => {
                                output += `## ${entry.date} - ${entry.title}\n\n`;
                                output += `**Category:** ${entry.category || 'N/A'} | **Importance:** ${entry.importance || 'N/A'}\n\n`;
                                output += `${entry.description || 'No description'}\n\n`;
                                if (entry.citations && entry.citations.length > 0) {
                                    output += `**Citations:** ${entry.citations.join(', ')}\n\n`;
                                }
                                if (entry.image) {
                                    output += `**Image:** ${entry.image}\n\n`;
                                }
                                output += '---\n\n';
                            });
                            this.showOutput('Timeline Data (Markdown)', output);
                            break;
                        
                        case 'text':
                            output = 'GIPSY HILL TIMELINE\n';
                            output += '=' .repeat(50) + '\n\n';
                            window.timelineData.forEach(entry => {
                                output += `${entry.date} - ${entry.title}\n`;
                                output += '-'.repeat(40) + '\n';
                                output += `Category: ${entry.category || 'N/A'} | Importance: ${entry.importance || 'N/A'}\n\n`;
                                output += `${entry.description || 'No description'}\n\n`;
                                if (entry.citations && entry.citations.length > 0) {
                                    output += `Citations: ${entry.citations.join(', ')}\n`;
                                }
                                output += '\n' + '='.repeat(50) + '\n\n';
                            });
                            this.showOutput('Timeline Data (Plain Text)', output);
                            break;
                    }
                }, 100);
            },

            extractCitations: function(type) {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = '';
                    
                    switch(type) {
                        case 'full':
                            output = 'FULL CITATIONS REPORT\n';
                            output += '=' .repeat(50) + '\n\n';
                            window.timelineCitations.forEach(cit => {
                                output += `[${cit.number}] ${cit.timeline_entry}\n`;
                                output += `Status: ${cit.status} | Quality: ${cit.quality || 'N/A'}\n`;
                                output += `Source: ${cit.source}\n`;
                                if (cit.url) {
                                    output += `URL: ${cit.url}\n`;
                                }
                                if (cit.additional_urls && cit.additional_urls.length > 0) {
                                    output += `Additional URLs:\n`;
                                    cit.additional_urls.forEach(url => {
                                        output += `  - ${url}\n`;
                                    });
                                }
                                // Find which entries use this citation
                                const usedIn = window.timelineData.filter(e => 
                                    e.citations && e.citations.includes(cit.number)
                                );
                                if (usedIn.length > 0) {
                                    output += `Used in entries:\n`;
                                    usedIn.forEach(entry => {
                                        output += `  - ${entry.date}: ${entry.title}\n`;
                                    });
                                }
                                output += '\n' + '-'.repeat(50) + '\n\n';
                            });
                            this.showOutput('Full Citations Report', output);
                            break;
                        
                        case 'unverified':
                            const unverified = window.timelineCitations.filter(c => 
                                c.status === 'Unverified' || c.status === 'Partially verified'
                            );
                            output = `UNVERIFIED CITATIONS (${unverified.length} total)\n`;
                            output += '=' .repeat(50) + '\n\n';
                            unverified.forEach(cit => {
                                output += `[${cit.number}] ${cit.timeline_entry}\n`;
                                output += `Status: ${cit.status}\n`;
                                output += `Source: ${cit.source}\n`;
                                output += `Needs: Additional verification and primary sources\n\n`;
                            });
                            this.showOutput('Unverified Citations', output);
                            break;
                        
                        case 'bibliography':
                            output = 'BIBLIOGRAPHY\n';
                            output += '=' .repeat(50) + '\n\n';
                            const sorted = [...window.timelineCitations].sort((a, b) => 
                                (a.timeline_entry || '').localeCompare(b.timeline_entry || '')
                            );
                            sorted.forEach(cit => {
                                output += `${cit.timeline_entry}. ${cit.source}`;
                                if (cit.url) {
                                    output += ` Available at: ${cit.url}`;
                                }
                                output += `\n\n`;
                            });
                            this.showOutput('Bibliography', output);
                            break;
                        
                        case 'urls':
                            output = 'ALL CITATION URLS\n';
                            output += '=' .repeat(50) + '\n\n';
                            window.timelineCitations.forEach(cit => {
                                if (cit.url) {
                                    output += `[${cit.number}] ${cit.url}\n`;
                                }
                                if (cit.additional_urls && cit.additional_urls.length > 0) {
                                    cit.additional_urls.forEach(url => {
                                        output += `[${cit.number}] ${url}\n`;
                                    });
                                }
                            });
                            this.showOutput('Citation URLs', output);
                            break;
                    }
                }, 100);
            },

            generateVerificationPrompt: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    const category = document.getElementById('category-filter').value;
                    const dateRange = document.getElementById('date-range').value;
                    
                    let entries = window.timelineData;
                    if (category !== 'all') {
                        entries = entries.filter(e => e.category === category);
                    }
                    if (dateRange) {
                        // Simple date range filter
                        const rangeParts = dateRange.split('-');
                        if (rangeParts.length > 0) {
                            entries = entries.filter(e => {
                                const year = e.date.match(/\d{4}/);
                                if (year) {
                                    const yearNum = parseInt(year[0]);
                                    const startYear = parseInt(rangeParts[0]);
                                    const endYear = rangeParts[1] ? parseInt(rangeParts[1]) : startYear;
                                    return yearNum >= startYear && yearNum <= endYear;
                                }
                                return false;
                            });
                        }
                    }
                    
                    let prompt = `Please verify the historical accuracy of the following timeline entries for Gipsy Hill in South London. For each entry, confirm or correct the dates, check the factual accuracy, and suggest any additional relevant details or context that might be missing.\n\n`;
                    prompt += `Focus Area: ${category === 'all' ? 'All categories' : category}\n`;
                    if (dateRange) prompt += `Date Range: ${dateRange}\n`;
                    prompt += `\nTIMELINE ENTRIES TO VERIFY:\n\n`;
                    
                    entries.forEach(entry => {
                        prompt += `${entry.date} - ${entry.title}\n`;
                        prompt += `Description: ${entry.description}\n`;
                        prompt += `Current Citations: ${entry.citations ? entry.citations.join(', ') : 'None'}\n`;
                        prompt += `Verification needed for:\n`;
                        prompt += `- Date accuracy\n`;
                        prompt += `- Factual correctness\n`;
                        prompt += `- Missing context or details\n`;
                        prompt += `- Additional primary sources\n\n`;
                    });
                    
                    prompt += `\nPlease provide:\n`;
                    prompt += `1. Confirmation or correction of dates\n`;
                    prompt += `2. Any factual errors found\n`;
                    prompt += `3. Additional historical context\n`;
                    prompt += `4. Suggested primary sources or references\n`;
                    prompt += `5. Related events that might be missing from this timeline`;
                    
                    this.showOutput('LLM Verification Prompt', prompt);
                }, 100);
            },

            generateDiscoveryPrompt: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    const category = document.getElementById('category-filter').value;
                    const dateRange = document.getElementById('date-range').value;
                    
                    let prompt = `I'm researching the history of Gipsy Hill in South London. Below is our current timeline of events. Please identify significant historical events, developments, or people that are MISSING from this timeline.\n\n`;
                    
                    if (category !== 'all') {
                        prompt += `Focus particularly on events related to: ${category}\n`;
                    }
                    if (dateRange) {
                        prompt += `Time period of interest: ${dateRange}\n`;
                    }
                    
                    prompt += `\nCURRENT TIMELINE COVERAGE:\n\n`;
                    
                    // Group by decade for summary
                    const decades = {};
                    window.timelineData.forEach(entry => {
                        const year = entry.date.match(/\d{4}/);
                        if (year) {
                            const decade = Math.floor(year[0] / 10) * 10;
                            if (!decades[decade]) decades[decade] = [];
                            decades[decade].push(entry.title);
                        }
                    });
                    
                    Object.keys(decades).sort().forEach(decade => {
                        prompt += `${decade}s: ${decades[decade].length} events\n`;
                        decades[decade].slice(0, 3).forEach(title => {
                            prompt += `  - ${title}\n`;
                        });
                        if (decades[decade].length > 3) {
                            prompt += `  ... and ${decades[decade].length - 3} more\n`;
                        }
                    });
                    
                    prompt += `\nPlease suggest:\n`;
                    prompt += `1. Major historical events we've missed\n`;
                    prompt += `2. Important local figures not mentioned\n`;
                    prompt += `3. Significant buildings or landmarks not covered\n`;
                    prompt += `4. Social/cultural developments overlooked\n`;
                    prompt += `5. Economic or industrial changes not documented\n`;
                    prompt += `6. Transportation developments beyond what's listed\n`;
                    prompt += `7. Wartime events or impacts not included\n`;
                    prompt += `8. Environmental or urban planning changes\n\n`;
                    prompt += `For each suggestion, please provide:\n`;
                    prompt += `- Specific date or date range\n`;
                    prompt += `- Brief description\n`;
                    prompt += `- Why it's historically significant\n`;
                    prompt += `- Potential sources for verification`;
                    
                    this.showOutput('Discovery Prompt for Missing Events', prompt);
                }, 100);
            },

            generateSourcePrompt: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    const unverified = window.timelineCitations.filter(c => 
                        c.status === 'Unverified' || c.status === 'Partially verified'
                    );
                    
                    let prompt = `Please help find primary sources and verification for the following historical claims about Gipsy Hill in South London. These entries currently lack strong verification:\n\n`;
                    
                    unverified.forEach(cit => {
                        const entries = window.timelineData.filter(e => 
                            e.citations && e.citations.includes(cit.number)
                        );
                        
                        entries.forEach(entry => {
                            prompt += `CLAIM: ${entry.date} - ${entry.title}\n`;
                            prompt += `Details: ${entry.description}\n`;
                            prompt += `Current source: ${cit.source}\n`;
                            prompt += `Status: ${cit.status}\n\n`;
                            prompt += `Please find:\n`;
                            prompt += `- Primary sources (newspapers, archives, official records)\n`;
                            prompt += `- Contemporary accounts or documents\n`;
                            prompt += `- Academic papers or books that reference this\n`;
                            prompt += `- Museum or library collections with evidence\n`;
                            prompt += `- Maps, photographs, or other visual evidence\n\n`;
                        });
                    });
                    
                    prompt += `For each claim, please provide:\n`;
                    prompt += `1. Specific archive references (with catalog numbers if possible)\n`;
                    prompt += `2. Newspaper citations (publication, date, page)\n`;
                    prompt += `3. Book references (author, title, year, page numbers)\n`;
                    prompt += `4. Online database entries\n`;
                    prompt += `5. Confidence level in the claim's accuracy`;
                    
                    this.showOutput('Source Verification Prompt', prompt);
                }, 100);
            },

            // New enhanced image search prompt generator
            generateImageSearchPrompt: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    const withoutImages = window.timelineData.filter(e => !e.image);
                    const majorWithoutImages = withoutImages.filter(e => e.importance === 'major');
                    
                    let prompt = `I need help finding historical images for timeline entries about Gipsy Hill in South London. Please search for photographs, illustrations, maps, or other visual materials for the following events.\n\n`;
                    
                    prompt += `PRIORITY ENTRIES (Major events without images):\n`;
                    prompt += `${'='.repeat(50)}\n\n`;
                    
                    majorWithoutImages.forEach(entry => {
                        prompt += `DATE: ${entry.date}\n`;
                        prompt += `EVENT: ${entry.title}\n`;
                        prompt += `DETAILS: ${entry.description}\n`;
                        prompt += `CATEGORY: ${entry.category}\n\n`;
                        prompt += `Search suggestions:\n`;
                        prompt += `- Archive photographs from this period\n`;
                        prompt += `- Contemporary illustrations or engravings\n`;
                        prompt += `- Maps showing the location\n`;
                        prompt += `- Similar buildings or events from the same era\n`;
                        prompt += `- Local history collections\n\n`;
                        prompt += `-`.repeat(40) + `\n\n`;
                    });
                    
                    prompt += `\nOTHER ENTRIES NEEDING IMAGES:\n`;
                    prompt += `${'='.repeat(50)}\n\n`;
                    
                    withoutImages.filter(e => e.importance !== 'major').slice(0, 10).forEach(entry => {
                        prompt += `- ${entry.date}: ${entry.title}\n`;
                    });
                    
                    prompt += `\n\nRECOMMENDED SOURCES TO SEARCH:\n`;
                    prompt += `1. Lambeth Archives - photographic collection\n`;
                    prompt += `2. London Metropolitan Archives\n`;
                    prompt += `3. Historic England Archive\n`;
                    prompt += `4. British Library image collections\n`;
                    prompt += `5. National Archives photographic holdings\n`;
                    prompt += `6. Local history society collections\n`;
                    prompt += `7. Ordnance Survey historical maps\n`;
                    prompt += `8. Borough Photos website\n`;
                    prompt += `9. London Picture Archive\n`;
                    prompt += `10. Wikimedia Commons historical images\n\n`;
                    
                    prompt += `For each image found, please provide:\n`;
                    prompt += `- Direct URL or archive reference\n`;
                    prompt += `- Date of image\n`;
                    prompt += `- Copyright status\n`;
                    prompt += `- Brief description\n`;
                    prompt += `- Attribution requirements`;
                    
                    this.showOutput('Image Search LLM Prompt', prompt);
                }, 100);
            },

            analyzeTimeline: function(type) {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = '';
                    
                    switch(type) {
                        case 'gaps':
                            output = 'TIMELINE GAP ANALYSIS\n';
                            output += '=' .repeat(50) + '\n\n';
                            
                            // Extract years and sort
                            const years = window.timelineData
                                .map(e => {
                                    const match = e.date.match(/\d{4}/);
                                    return match ? parseInt(match[0]) : null;
                                })
                                .filter(y => y !== null)
                                .sort((a, b) => a - b);
                            
                            let gaps = [];
                            for (let i = 1; i < years.length; i++) {
                                const gap = years[i] - years[i-1];
                                if (gap > 10) {
                                    gaps.push({
                                        start: years[i-1],
                                        end: years[i],
                                        gap: gap
                                    });
                                }
                            }
                            
                            output += `Found ${gaps.length} significant gaps (>10 years):\n\n`;
                            gaps.forEach(g => {
                                output += `${g.start} to ${g.end}: ${g.gap} year gap\n`;
                                output += `  Consider researching events from this period\n\n`;
                            });
                            
                            // Analyze by century
                            output += '\nENTRIES BY CENTURY:\n';
                            const centuries = {};
                            years.forEach(y => {
                                const century = Math.floor(y / 100) * 100;
                                centuries[century] = (centuries[century] || 0) + 1;
                            });
                            Object.keys(centuries).sort().forEach(c => {
                                output += `${c}s: ${centuries[c]} entries\n`;
                            });
                            
                            this.showOutput('Timeline Gap Analysis', output);
                            break;
                        
                        case 'categories':
                            output = 'CATEGORY ANALYSIS\n';
                            output += '=' .repeat(50) + '\n\n';
                            
                            const catCount = {};
                            window.timelineData.forEach(e => {
                                const cat = e.category || 'uncategorized';
                                catCount[cat] = (catCount[cat] || 0) + 1;
                            });
                            
                            Object.entries(catCount)
                                .sort((a, b) => b[1] - a[1])
                                .forEach(([cat, count]) => {
                                    const pct = ((count / window.timelineData.length) * 100).toFixed(1);
                                    output += `${cat}: ${count} entries (${pct}%)\n`;
                                    
                                    // List first few entries
                                    const examples = window.timelineData
                                        .filter(e => (e.category || 'uncategorized') === cat)
                                        .slice(0, 3);
                                    examples.forEach(e => {
                                        output += `  - ${e.date}: ${e.title}\n`;
                                    });
                                    output += '\n';
                                });
                            
                            this.showOutput('Category Analysis', output);
                            break;
                        
                        case 'quality':
                            output = 'QUALITY REPORT\n';
                            output += '=' .repeat(50) + '\n\n';
                            
                            // Citation quality
                            const qualityCount = {};
                            window.timelineCitations.forEach(c => {
                                const q = c.quality || 'Not rated';
                                qualityCount[q] = (qualityCount[q] || 0) + 1;
                            });
                            
                            output += 'CITATION QUALITY:\n';
                            Object.entries(qualityCount).forEach(([quality, count]) => {
                                output += `${quality}: ${count} citations\n`;
                            });
                            
                            // Verification status
                            output += '\n\nVERIFICATION STATUS:\n';
                            const statusCount = {};
                            window.timelineCitations.forEach(c => {
                                statusCount[c.status] = (statusCount[c.status] || 0) + 1;
                            });
                            Object.entries(statusCount).forEach(([status, count]) => {
                                output += `${status}: ${count} citations\n`;
                            });
                            
                            // Entries without citations
                            output += '\n\nENTRIES WITHOUT CITATIONS:\n';
                            const noCitations = window.timelineData.filter(e => !e.citations || e.citations.length === 0);
                            output += `${noCitations.length} entries lack citations:\n`;
                            noCitations.slice(0, 10).forEach(e => {
                                output += `  - ${e.date}: ${e.title}\n`;
                            });
                            if (noCitations.length > 10) {
                                output += `  ... and ${noCitations.length - 10} more\n`;
                            }
                            
                            this.showOutput('Quality Report', output);
                            break;
                        
                        case 'images':
                            output = 'IMAGE ANALYSIS\n';
                            output += '=' .repeat(50) + '\n\n';
                            
                            const withImages = window.timelineData.filter(e => e.image);
                            const withoutImages = window.timelineData.filter(e => !e.image);
                            
                            output += `Total entries: ${window.timelineData.length}\n`;
                            output += `With images: ${withImages.length} (${((withImages.length/window.timelineData.length)*100).toFixed(1)}%)\n`;
                            output += `Without images: ${withoutImages.length} (${((withoutImages.length/window.timelineData.length)*100).toFixed(1)}%)\n\n`;
                            
                            output += 'ENTRIES MISSING IMAGES:\n';
                            output += '(Priority: Major events without images)\n\n';
                            
                            const majorWithoutImages = withoutImages.filter(e => e.importance === 'major');
                            majorWithoutImages.forEach(e => {
                                output += `[MAJOR] ${e.date}: ${e.title}\n`;
                            });
                            
                            output += '\nOther entries without images:\n';
                            withoutImages
                                .filter(e => e.importance !== 'major')
                                .slice(0, 20)
                                .forEach(e => {
                                    output += `  - ${e.date}: ${e.title}\n`;
                                });
                            
                            this.showOutput('Image Analysis', output);
                            break;
                    }
                }, 100);
            },

            findDuplicates: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'DUPLICATE DETECTION REPORT\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    // Check for duplicate dates and titles
                    const dateGroups = {};
                    window.timelineData.forEach((entry, index) => {
                        if (!dateGroups[entry.date]) {
                            dateGroups[entry.date] = [];
                        }
                        dateGroups[entry.date].push({...entry, index});
                    });
                    
                    let duplicatesFound = false;
                    Object.entries(dateGroups).forEach(([date, entries]) => {
                        if (entries.length > 1) {
                            duplicatesFound = true;
                            output += `Multiple entries for ${date}:\n`;
                            entries.forEach(e => {
                                output += `  - ${e.title}\n`;
                            });
                            output += '\n';
                        }
                    });
                    
                    // Check for similar titles
                    output += 'SIMILAR TITLES (potential duplicates):\n';
                    for (let i = 0; i < window.timelineData.length; i++) {
                        for (let j = i + 1; j < window.timelineData.length; j++) {
                            const similarity = this.calculateSimilarity(
                                window.timelineData[i].title.toLowerCase(),
                                window.timelineData[j].title.toLowerCase()
                            );
                            if (similarity > 0.8) {
                                output += `Similarity ${(similarity*100).toFixed(0)}%:\n`;
                                output += `  - ${window.timelineData[i].date}: ${window.timelineData[i].title}\n`;
                                output += `  - ${window.timelineData[j].date}: ${window.timelineData[j].title}\n\n`;
                                duplicatesFound = true;
                            }
                        }
                    }
                    
                    if (!duplicatesFound) {
                        output += 'No duplicates detected!';
                    }
                    
                    this.showOutput('Duplicate Detection', output);
                }, 100);
            },

            // New function to check duplicate URLs
            checkDuplicateURLs: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'DUPLICATE URL ANALYSIS\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    const urlMap = {};
                    
                    // Collect all URLs
                    window.timelineCitations.forEach(cit => {
                        if (cit.url) {
                            if (!urlMap[cit.url]) urlMap[cit.url] = [];
                            urlMap[cit.url].push(cit.number);
                        }
                        if (cit.additional_urls) {
                            cit.additional_urls.forEach(url => {
                                if (!urlMap[url]) urlMap[url] = [];
                                urlMap[url].push(cit.number);
                            });
                        }
                    });
                    
                    // Find duplicates
                    const duplicates = Object.entries(urlMap).filter(([url, citations]) => citations.length > 1);
                    
                    if (duplicates.length === 0) {
                        output += 'No duplicate URLs found!\n';
                    } else {
                        output += `Found ${duplicates.length} URLs used in multiple citations:\n\n`;
                        
                        duplicates.forEach(([url, citations]) => {
                            output += `URL: ${url}\n`;
                            output += `Used in citations: ${citations.join(', ')}\n`;
                            
                            // Show what each citation is about
                            citations.forEach(num => {
                                const cit = window.timelineCitations.find(c => c.number === num);
                                if (cit) {
                                    output += `  [${num}] ${cit.timeline_entry}\n`;
                                }
                            });
                            output += '\n';
                        });
                        
                        output += '\nRECOMMENDATION:\n';
                        output += 'Consider consolidating citations that reference the same URL.\n';
                        output += 'This could reduce redundancy and make citation management easier.\n';
                    }
                    
                    this.showOutput('Duplicate URL Report', output);
                }, 100);
            },

            // Enhanced orphaned citations with suggestions
            orphanedCitationsEnhanced: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'SMART ORPHANED CITATIONS ANALYSIS\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    const usedCitations = new Set();
                    window.timelineData.forEach(entry => {
                        if (entry.citations) {
                            entry.citations.forEach(cit => usedCitations.add(cit));
                        }
                    });
                    
                    const orphaned = window.timelineCitations.filter(cit => 
                        !usedCitations.has(cit.number)
                    );
                    
                    if (orphaned.length === 0) {
                        output += 'No orphaned citations found! All citations are referenced.\n';
                    } else {
                        output += `Found ${orphaned.length} orphaned citations:\n\n`;
                        
                        orphaned.forEach(cit => {
                            output += `[${cit.number}] ${cit.timeline_entry}\n`;
                            output += `Status: ${cit.status}\n`;
                            output += `Source: ${cit.source}\n`;
                            
                            // Find potentially relevant entries
                            const keywords = this.extractKeywords((cit.timeline_entry + ' ' + cit.source).toLowerCase());
                            const relevantEntries = [];
                            
                            window.timelineData.forEach(entry => {
                                const entryText = (entry.title + ' ' + entry.description).toLowerCase();
                                const entryKeywords = this.extractKeywords(entryText);
                                
                                const matches = keywords.filter(k => entryKeywords.includes(k));
                                if (matches.length >= 2) {
                                    relevantEntries.push({
                                        entry: entry,
                                        matches: matches.length
                                    });
                                }
                            });
                            
                            if (relevantEntries.length > 0) {
                                output += '\nPotentially relevant entries:\n';
                                relevantEntries
                                    .sort((a, b) => b.matches - a.matches)
                                    .slice(0, 3)
                                    .forEach(r => {
                                        output += `  - ${r.entry.date}: ${r.entry.title} (${r.matches} keyword matches)\n`;
                                    });
                            }
                            
                            output += '\n' + '-'.repeat(40) + '\n\n';
                        });
                        
                        output += 'RECOMMENDATION:\n';
                        output += 'Review the suggested relevant entries above.\n';
                        output += 'Either add these citations to appropriate entries or remove if no longer needed.\n';
                    }
                    
                    this.showOutput('Smart Orphaned Citations Analysis', output);
                }, 100);
            },

            orphanedCitations: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'ORPHANED CITATIONS REPORT\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    const usedCitations = new Set();
                    window.timelineData.forEach(entry => {
                        if (entry.citations) {
                            entry.citations.forEach(cit => usedCitations.add(cit));
                        }
                    });
                    
                    const orphaned = window.timelineCitations.filter(cit => 
                        !usedCitations.has(cit.number)
                    );
                    
                    if (orphaned.length === 0) {
                        output += 'No orphaned citations found! All citations are referenced.\n';
                    } else {
                        output += `Found ${orphaned.length} orphaned citations:\n\n`;
                        orphaned.forEach(cit => {
                            output += `[${cit.number}] ${cit.timeline_entry}\n`;
                            output += `Source: ${cit.source}\n\n`;
                        });
                        output += 'These citations are defined but not referenced by any timeline entry.\n';
                        output += 'Consider either:\n';
                        output += '1. Adding them to relevant timeline entries\n';
                        output += '2. Removing them if no longer needed\n';
                    }
                    
                    this.showOutput('Orphaned Citations', output);
                }, 100);
            },

            // Suggest citation merges
            suggestCitationMerges: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'CITATION MERGE SUGGESTIONS\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    const suggestions = [];
                    
                    // Check for similar sources
                    for (let i = 0; i < window.timelineCitations.length; i++) {
                        for (let j = i + 1; j < window.timelineCitations.length; j++) {
                            const cit1 = window.timelineCitations[i];
                            const cit2 = window.timelineCitations[j];
                            
                            // Check if sources are very similar
                            const similarity = this.calculateSimilarity(
                                cit1.source.toLowerCase(),
                                cit2.source.toLowerCase()
                            );
                            
                            if (similarity > 0.7) {
                                suggestions.push({
                                    cit1: cit1,
                                    cit2: cit2,
                                    similarity: similarity
                                });
                            }
                        }
                    }
                    
                    if (suggestions.length === 0) {
                        output += 'No merge suggestions found.\n';
                    } else {
                        output += `Found ${suggestions.length} potential merges:\n\n`;
                        
                        suggestions
                            .sort((a, b) => b.similarity - a.similarity)
                            .slice(0, 20)
                            .forEach(s => {
                                output += `Similarity: ${(s.similarity * 100).toFixed(0)}%\n`;
                                output += `[${s.cit1.number}] ${s.cit1.timeline_entry}\n`;
                                output += `[${s.cit2.number}] ${s.cit2.timeline_entry}\n`;
                                output += `Source 1: ${s.cit1.source}\n`;
                                output += `Source 2: ${s.cit2.source}\n`;
                                output += '\n' + '-'.repeat(40) + '\n\n';
                            });
                    }
                    
                    this.showOutput('Citation Merge Suggestions', output);
                }, 100);
            },

            calculateSimilarity: function(str1, str2) {
                const longer = str1.length > str2.length ? str1 : str2;
                const shorter = str1.length > str2.length ? str2 : str1;
                
                if (longer.length === 0) return 1.0;
                
                const editDistance = (s1, s2) => {
                    const costs = [];
                    for (let i = 0; i <= s1.length; i++) {
                        let lastValue = i;
                        for (let j = 0; j <= s2.length; j++) {
                            if (i === 0) {
                                costs[j] = j;
                            } else if (j > 0) {
                                let newValue = costs[j - 1];
                                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                                }
                                costs[j - 1] = lastValue;
                                lastValue = newValue;
                            }
                        }
                        if (i > 0) costs[s2.length] = lastValue;
                    }
                    return costs[s2.length];
                };
                
                return (longer.length - editDistance(longer, shorter)) / longer.length;
            },

            checkLinks: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'LINK CHECK REPORT\n';
                    output += '=' .repeat(50) + '\n\n';
                    output += 'Note: Actual link checking would require server-side validation.\n';
                    output += 'This report lists all URLs for manual checking.\n\n';
                    
                    const urls = new Set();
                    
                    // Collect URLs from citations
                    window.timelineCitations.forEach(cit => {
                        if (cit.url) urls.add(cit.url);
                        if (cit.additional_urls) {
                            cit.additional_urls.forEach(url => urls.add(url));
                        }
                    });
                    
                    output += `Total unique URLs: ${urls.size}\n\n`;
                    output += 'ALL URLS:\n';
                    [...urls].sort().forEach(url => {
                        output += `${url}\n`;
                    });
                    
                    output += '\n\nTo check these URLs:\n';
                    output += '1. Copy this list\n';
                    output += '2. Use a link checker tool\n';
                    output += '3. Update any broken links in timeline-data.js\n';
                    
                    this.showOutput('Link Check Report', output);
                }, 100);
            },

            validateDates: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'DATE VALIDATION REPORT\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    const issues = [];
                    
                    window.timelineData.forEach((entry, index) => {
                        // Check for various date formats and potential issues
                        const date = entry.date;
                        
                        // Check for missing dates
                        if (!date) {
                            issues.push(`Entry ${index}: Missing date - ${entry.title}`);
                        }
                        
                        // Check for unusual formats
                        if (date && !date.match(/\d{4}/) && !date.match(/^\d{1,2}(st|nd|rd|th) c\./)) {
                            issues.push(`Entry ${index}: Unusual date format "${date}" - ${entry.title}`);
                        }
                        
                        // Check for future dates
                        const year = date ? date.match(/\d{4}/) : null;
                        if (year && parseInt(year[0]) > new Date().getFullYear()) {
                            issues.push(`Entry ${index}: Future date "${date}" - ${entry.title}`);
                        }
                    });
                    
                    if (issues.length === 0) {
                        output += 'All dates validated successfully!\n';
                    } else {
                        output += `Found ${issues.length} potential issues:\n\n`;
                        issues.forEach(issue => {
                            output += `${issue}\n`;
                        });
                    }
                    
                    // Date format summary
                    output += '\n\nDATE FORMAT SUMMARY:\n';
                    const formats = {};
                    window.timelineData.forEach(entry => {
                        const format = this.detectDateFormat(entry.date);
                        formats[format] = (formats[format] || 0) + 1;
                    });
                    
                    Object.entries(formats).forEach(([format, count]) => {
                        output += `${format}: ${count} entries\n`;
                    });
                    
                    this.showOutput('Date Validation', output);
                }, 100);
            },

            detectDateFormat: function(date) {
                if (!date) return 'Missing';
                if (date.match(/^\d{4}$/)) return 'Year only (YYYY)';
                if (date.match(/^\d{4} \(/)) return 'Year with specific date';
                if (date.match(/^\d{4}-\d{4}$/)) return 'Year range';
                if (date.match(/^\d{1,2}(st|nd|rd|th) c\./)) return 'Century';
                if (date.match(/^AD \d+/)) return 'AD date';
                return 'Other format';
            },

            generateResearchPrompt: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                const topic = document.getElementById('research-topic').value || document.getElementById('research-topic-2').value || 'general history';
                this.showLoading();
                
                setTimeout(() => {
                    let prompt = `Research Query for: ${topic.toUpperCase()}\n`;
                    prompt += 'Location: Gipsy Hill, South London\n';
                    prompt += '=' .repeat(50) + '\n\n';
                    
                    prompt += `I need detailed historical information about ${topic} in the Gipsy Hill area of South London.\n\n`;
                    
                    prompt += 'Please provide:\n\n';
                    prompt += '1. CHRONOLOGICAL OVERVIEW\n';
                    prompt += `   - Key dates and events related to ${topic}\n`;
                    prompt += '   - How this topic evolved over time in the area\n';
                    prompt += '   - Important turning points or changes\n\n';
                    
                    prompt += '2. KEY FIGURES\n';
                    prompt += `   - Important people associated with ${topic} in this area\n`;
                    prompt += '   - Their contributions and significance\n';
                    prompt += '   - Connections to broader historical context\n\n';
                    
                    prompt += '3. LOCATIONS & LANDMARKS\n';
                    prompt += `   - Specific places related to ${topic}\n`;
                    prompt += '   - Buildings, streets, or sites of importance\n';
                    prompt += '   - What remains today vs what has been lost\n\n';
                    
                    prompt += '4. PRIMARY SOURCES\n';
                    prompt += '   - Archives that might hold relevant documents\n';
                    prompt += '   - Newspaper archives to search\n';
                    prompt += '   - Maps, photographs, or illustrations\n';
                    prompt += '   - Oral history collections\n\n';
                    
                    prompt += '5. CONNECTIONS\n';
                    prompt += `   - How ${topic} relates to other aspects of local history\n`;
                    prompt += '   - Links to wider London or national history\n';
                    prompt += '   - Social, economic, or cultural impacts\n\n';
                    
                    prompt += '6. GAPS IN KNOWLEDGE\n';
                    prompt += '   - What aspects need more research\n';
                    prompt += '   - Conflicting accounts to resolve\n';
                    prompt += '   - Myths vs documented facts\n\n';
                    
                    prompt += 'Please cite all sources and indicate confidence levels for any uncertain information.';
                    
                    this.showOutput('Research Query', prompt);
                }, 100);
            },

            generateArchiveSearch: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                const topic = document.getElementById('research-topic').value || document.getElementById('research-topic-2').value || 'Gipsy Hill history';
                this.showLoading();
                
                setTimeout(() => {
                    let output = 'ARCHIVE SEARCH STRATEGY\n';
                    output += `Topic: ${topic}\n`;
                    output += '=' .repeat(50) + '\n\n';
                    
                    output += 'RECOMMENDED ARCHIVES:\n\n';
                    
                    output += '1. Lambeth Archives\n';
                    output += '   Search terms:\n';
                    output += `   - "${topic}"\n`;
                    output += '   - "Gipsy Hill" AND ' + topic.split(' ').map(t => `"${t}"`).join(' OR ') + '\n';
                    output += '   - "Gipsy Hill" AND ' + topic.split(' ').map(t => `"${t}"`).join(' OR ') + '\n';
                    output += '   - "West Norwood" AND ' + topic.split(' ').map(t => `"${t}"`).join(' OR ') + '\n\n';
                    
                    output += '2. London Metropolitan Archives\n';
                    output += '   Collections to check:\n';
                    output += '   - Parish records (St Luke\'s West Norwood)\n';
                    output += '   - Metropolitan Board of Works\n';
                    output += '   - London County Council records\n';
                    output += '   - Maps and plans collection\n\n';
                    
                    output += '3. The National Archives (Kew)\n';
                    output += '   Relevant record series:\n';
                    output += '   - Census returns (HO 107, RG series)\n';
                    output += '   - Ordnance Survey maps (OS series)\n';
                    output += '   - Railway records (RAIL series)\n';
                    output += '   - War damage maps (HO 193)\n\n';
                    
                    output += '4. British Library Newspapers\n';
                    output += '   Search strategy:\n';
                    output += `   - Date range: 1800-1950\n`;
                    output += `   - Publications: South London Press, Norwood News\n`;
                    output += `   - Keywords: "Gipsy Hill" "${topic}"\n\n`;
                    
                    output += '5. Historic England Archive\n';
                    output += '   Search for:\n';
                    output += '   - Historic photographs\n';
                    output += '   - Building surveys\n';
                    output += '   - Archaeological reports\n\n';
                    
                    output += 'SEARCH TIPS:\n';
                    output += '- Try variant spellings: Gipsy/Gypsy Hill\n';
                    output += '- Include nearby areas: Norwood, Dulwich, Crystal Palace\n';
                    output += '- Check date ranges around known events\n';
                    output += '- Look for personal names mentioned in timeline\n';
                    output += '- Cross-reference with trade directories\n';
                    
                    this.showOutput('Archive Search Strategy', output);
                }, 100);
            },

            // New functions for Research tab
            generateNewspaperSearch: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                const topic = document.getElementById('research-topic-2').value || 'Gipsy Hill';
                this.showLoading();
                
                setTimeout(() => {
                    let output = 'NEWSPAPER SEARCH STRATEGY\n';
                    output += `Topic: ${topic}\n`;
                    output += '=' .repeat(50) + '\n\n';
                    
                    output += 'RECOMMENDED NEWSPAPER ARCHIVES:\n\n';
                    
                    output += '1. British Newspaper Archive\n';
                    output += '   Key publications:\n';
                    output += '   - South London Press (1865-present)\n';
                    output += '   - Norwood News (1881-1914)\n';
                    output += '   - South London Observer (1868-1936)\n';
                    output += '   - Camberwell & Peckham Times\n\n';
                    
                    output += '2. Search Terms:\n';
                    output += `   Primary: "${topic}" AND "Gipsy Hill"\n`;
                    output += `   Secondary: "${topic}" AND ("Gipsy Hill" OR "West Norwood")\n`;
                    output += `   Broader: "${topic}" AND ("Crystal Palace" OR "Dulwich")\n\n`;
                    
                    output += '3. Date Ranges to Focus:\n';
                    output += '   - 1850s-1860s: Railway development\n';
                    output += '   - 1870s-1890s: Victorian expansion\n';
                    output += '   - 1900s-1910s: Edwardian period\n';
                    output += '   - 1914-1918: WWI impact\n';
                    output += '   - 1920s-1930s: Interwar development\n';
                    output += '   - 1939-1945: WWII period\n';
                    output += '   - 1950s-1960s: Post-war reconstruction\n\n';
                    
                    output += '4. Types of Articles to Look For:\n';
                    output += '   - Local news and announcements\n';
                    output += '   - Planning applications and developments\n';
                    output += '   - Crime reports and court proceedings\n';
                    output += '   - Social events and community activities\n';
                    output += '   - Advertisements and business notices\n';
                    output += '   - Letters to the editor\n';
                    output += '   - Obituaries and personal notices\n';
                    
                    this.showOutput('Newspaper Search Strategy', output);
                }, 100);
            },

            generateMapSearch: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'MAP & VISUAL RESOURCES SEARCH\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    output += 'HISTORICAL MAP SOURCES:\n\n';
                    
                    output += '1. Ordnance Survey Maps\n';
                    output += '   - 1860s First Edition (1:2500)\n';
                    output += '   - 1890s Second Edition\n';
                    output += '   - 1910s Third Edition\n';
                    output += '   - 1930s Fourth Edition\n';
                    output += '   - 1950s National Grid series\n\n';
                    
                    output += '2. Online Map Collections:\n';
                    output += '   - National Library of Scotland (historic OS maps)\n';
                    output += '   - Old Maps Online\n';
                    output += '   - British Library map collection\n';
                    output += '   - London Metropolitan Archives\n';
                    output += '   - Lambeth Archives map collection\n\n';
                    
                    output += '3. Specialized Maps to Find:\n';
                    output += '   - Tithe maps (1830s-1840s)\n';
                    output += '   - Railway planning maps\n';
                    output += '   - Bomb damage maps (WWII)\n';
                    output += '   - Estate maps\n';
                    output += '   - Insurance maps (Goad plans)\n';
                    output += '   - Enclosure maps\n\n';
                    
                    output += '4. Visual Resources:\n';
                    output += '   - Historic England Archive (photographs)\n';
                    output += '   - London Picture Archive\n';
                    output += '   - Borough Photos collection\n';
                    output += '   - Lambeth Landmarks photo archive\n';
                    output += '   - Britain from Above (aerial photos)\n';
                    output += '   - Francis Frith Collection\n\n';
                    
                    output += '5. What to Look For:\n';
                    output += '   - Street layout changes\n';
                    output += '   - Lost buildings and landmarks\n';
                    output += '   - Field boundaries and land use\n';
                    output += '   - Railway and transport services\n';
                    output += '   - Public buildings and institutions\n';
                    output += '   - Parks and open spaces\n';
                    output += '   - Industrial sites\n';
                    
                    this.showOutput('Map & Visual Resources', output);
                }, 100);
            },

            generateCrossReference: function() {
                if (!this.dataLoaded) {
                    this.showError('Data not loaded');
                    return;
                }
                
                this.showLoading();
                setTimeout(() => {
                    let output = 'CROSS-REFERENCE CHECK\n';
                    output += '=' .repeat(50) + '\n\n';
                    
                    output += 'This report identifies timeline entries that should be cross-referenced with each other.\n';
                    output += 'Requirements: At least 3 matching words (excluding common place names).\n\n';
                    
                    // Find related entries by analyzing descriptions
                    const connections = [];
                    
                    for (let i = 0; i < window.timelineData.length; i++) {
                        for (let j = i + 1; j < window.timelineData.length; j++) {
                            const entry1 = window.timelineData[i];
                            const entry2 = window.timelineData[j];
                            
                            // Check for shared keywords
                            const keywords1 = this.extractKeywords(entry1.description + ' ' + entry1.title);
                            const keywords2 = this.extractKeywords(entry2.description + ' ' + entry2.title);
                            
                            const shared = keywords1.filter(k => keywords2.includes(k));
                            
                            // Require at least 3 matching words
                            if (shared.length >= 3) {
                                connections.push({
                                    entry1: `${entry1.date}: ${entry1.title}`,
                                    entry2: `${entry2.date}: ${entry2.title}`,
                                    sharedKeywords: shared,
                                    matchCount: shared.length
                                });
                            }
                        }
                    }
                    
                    // Sort by number of matches (most matches first)
                    connections.sort((a, b) => b.matchCount - a.matchCount);
                    
                    output += `Found ${connections.length} potential cross-references (3+ word matches):\n\n`;
                    
                    connections.slice(0, 50).forEach(conn => {
                        output += `CONNECTION (${conn.matchCount} matches):\n`;
                        output += `  Entry 1: ${conn.entry1}\n`;
                        output += `  Entry 2: ${conn.entry2}\n`;
                        output += `  Shared concepts: ${conn.sharedKeywords.join(', ')}\n\n`;
                    });
                    
                    if (connections.length > 50) {
                        output += `... and ${connections.length - 50} more connections\n`;
                    } else if (connections.length === 0) {
                        output += 'No connections found with 3+ matching keywords.\n';
                    }
                    
                    this.showOutput('Cross-Reference Check', output);
                }, 100);
            },

            extractKeywords: function(text) {
                // Simple keyword extraction with excluded place names
                const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'was', 'were', 'is', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'ought', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its'];
                
                // Common place names to exclude from matching
                const excludedPlaceNames = ['gipsy', 'gypsy', 'hill', 'norwood', 'crystal', 'palace', 'london', 'south', 'upper', 'lower', 'west'];
                
                return text.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(word => word.length > 3 && !stopWords.includes(word) && !excludedPlaceNames.includes(word))
                    .filter((word, index, array) => array.indexOf(word) === index);
            }
        };

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing admin tools...');
            console.log('timelineData:', typeof window.timelineData);
            console.log('timelineCitations:', typeof window.timelineCitations);
            console.log('timelineCategories:', typeof window.timelineCategories);
            adminTools.init();
            console.log('Admin tools initialized');
        });
