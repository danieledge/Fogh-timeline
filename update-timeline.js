const fs = require('fs');
const path = require('path');

// Read the admin update JSON
const jsonFile = process.argv[2];
console.log('Reading JSON file:', jsonFile);
const updateData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Read timeline-data.js
console.log('Reading timeline-data.js...');
let timelineContent = fs.readFileSync('timeline-data.js', 'utf8');

// Parse the entryData field which contains the actual entry
let entry;
if (updateData.entryData) {
  console.log('Found entryData field');
  // New format with entryData field
  entry = typeof updateData.entryData === 'string' 
    ? JSON.parse(updateData.entryData) 
    : updateData.entryData;
} else {
  console.log('Using legacy format');
  // Fallback to old format
  entry = {
    date: updateData.date,
    title: updateData.title,
    description: updateData.description,
    category: updateData.category,
    importance: updateData.importance,
    icon: updateData.icon
  };
  
  // Add citations if provided
  if (updateData.citations) {
    const citationArray = updateData.citations.split(',').map(c => c.trim()).filter(c => c);
    if (citationArray.length > 0) {
      entry.citations = citationArray;
    }
  }
  
  // Add image if provided
  if (updateData.imageUrls) {
    entry.image = updateData.imageUrls;
    if (updateData.imageCaptions) {
      entry.imageCaption = updateData.imageCaptions;
    }
  }
}

console.log('Entry to process:', JSON.stringify(entry, null, 2));

// Determine if this is a new entry or update
const isUpdate = updateData.updateType === 'update' || updateData.updateType === 'Update Entry';

if (isUpdate && (updateData.originalDate || updateData.originalEntryDate)) {
  const originalDate = updateData.originalDate || updateData.originalEntryDate;
  console.log(`Updating entry with date: ${originalDate}`);
  
  // Find the entry in timeline data
  const datePattern = `"date"\\s*:\\s*"${originalDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`;
  const entryRegex = new RegExp(
    `\\{[^\\{\\}]*${datePattern}[^\\{\\}]*\\}`,
    'g'
  );
  
  const matches = timelineContent.match(entryRegex);
  if (matches && matches.length > 0) {
    console.log(`Found ${matches.length} matching entries`);
    
    // Format the new entry with proper indentation
    const newEntryStr = JSON.stringify(entry, null, 2)
      .split('\n')
      .map((line, i) => i === 0 ? line : '    ' + line)
      .join('\n');
    
    // Replace the first match
    timelineContent = timelineContent.replace(matches[0], newEntryStr);
    console.log('Entry updated successfully');
  } else {
    console.error(`No entry found with date: ${originalDate}`);
    // Fall back to adding as new entry
    console.log('Adding as new entry instead...');
    
    const arrayEndIndex = timelineContent.lastIndexOf('];');
    const lastEntryIndex = timelineContent.lastIndexOf('}', arrayEndIndex);
    
    const newEntryStr = JSON.stringify(entry, null, 2)
      .split('\n')
      .map((line, i) => i === 0 ? line : '    ' + line)
      .join('\n');
    
    const insertion = ',\n    ' + newEntryStr;
    timelineContent = timelineContent.slice(0, lastEntryIndex + 1) + insertion + timelineContent.slice(lastEntryIndex + 1);
  }
} else {
  console.log('Adding new entry');
  
  // Find the timelineData array and add the new entry
  const arrayEndIndex = timelineContent.lastIndexOf('];');
  const lastEntryIndex = timelineContent.lastIndexOf('}', arrayEndIndex);
  
  const newEntryStr = JSON.stringify(entry, null, 2)
    .split('\n')
    .map((line, i) => i === 0 ? line : '    ' + line)
    .join('\n');
  
  const insertion = ',\n    ' + newEntryStr;
  timelineContent = timelineContent.slice(0, lastEntryIndex + 1) + insertion + timelineContent.slice(lastEntryIndex + 1);
  console.log('New entry added successfully');
}

// Write updated timeline-data.js
fs.writeFileSync('timeline-data.js', timelineContent);
console.log('timeline-data.js updated successfully');

// Move the processed JSON file to mark it as processed
const processedDir = path.dirname(jsonFile);
const processedFile = path.join(processedDir, 'processed-' + path.basename(jsonFile));
fs.renameSync(jsonFile, processedFile);
console.log(`Renamed ${jsonFile} to ${processedFile}`);
