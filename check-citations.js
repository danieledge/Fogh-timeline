const fs = require('fs');
const content = fs.readFileSync('timeline-data.js', 'utf8');

// Mock window object for browser compatibility  
global.window = {};

// Extract timeline data and citations
eval(content);

// Get the data - it's both in window and as var
const timelineData = window.timelineData || global.timelineData;
const timelineCitations = window.timelineCitations || global.timelineCitations;

// Find used citations
const usedCitations = new Set();
timelineData.forEach(entry => {
    if (entry.citations) {
        entry.citations.forEach(cit => usedCitations.add(cit));
    }
});

// Find orphaned citations
const orphaned = timelineCitations.filter(cit => 
    !usedCitations.has(cit.number)
);

console.log('ORPHANED CITATIONS REPORT');
console.log('='.repeat(50));
console.log('');

if (orphaned.length === 0) {
    console.log('✓ No orphaned citations found! All citations are referenced.');
} else {
    console.log('Found ' + orphaned.length + ' orphaned citations:\n');
    orphaned.forEach(cit => {
        console.log('[' + cit.number + '] ' + cit.timeline_entry);
        console.log('Status: ' + cit.status);
        console.log('Source: ' + cit.source);
        console.log('');
    });
}

// Also check for missing citations (referenced but not defined)
const definedCitations = new Set(timelineCitations.map(c => c.number));
const missingCitations = [];

timelineData.forEach(entry => {
    if (entry.citations) {
        entry.citations.forEach(cit => {
            if (!definedCitations.has(cit)) {
                missingCitations.push({
                    citation: cit,
                    entry: entry.date + ': ' + entry.title
                });
            }
        });
    }
});

if (missingCitations.length > 0) {
    console.log('\nMISSING CITATIONS (referenced but not defined):');
    console.log('-'.repeat(50));
    missingCitations.forEach(m => {
        console.log('Citation [' + m.citation + '] referenced in: ' + m.entry);
    });
}

// Summary
console.log('\nSUMMARY:');
console.log('-'.repeat(50));
console.log('Total citations defined: ' + timelineCitations.length);
console.log('Citations in use: ' + usedCitations.size);
console.log('Orphaned citations: ' + orphaned.length);
console.log('Missing citations: ' + missingCitations.length);