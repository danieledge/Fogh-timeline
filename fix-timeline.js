// Fix timeline-data.js syntax issues
const fs = require('fs');

// Read the file
let content = fs.readFileSync('timeline-data.js', 'utf8');

// Replace curly quotes with straight quotes
content = content.replace(/"/g, '"');
content = content.replace(/"/g, '"');
content = content.replace(/'/g, "'");
content = content.replace(/'/g, "'");

// Fix object property names - add quotes
content = content.replace(/(\n\s*)date:/g, '$1"date":');
content = content.replace(/(\n\s*)title:/g, '$1"title":');
content = content.replace(/(\n\s*)description:/g, '$1"description":');
content = content.replace(/(\n\s*)icon:/g, '$1"icon":');
content = content.replace(/(\n\s*)image:/g, '$1"image":');
content = content.replace(/(\n\s*)imageCaption:/g, '$1"imageCaption":');
content = content.replace(/(\n\s*)imageCaptionHTML:/g, '$1"imageCaptionHTML":');

// Write the fixed content back
fs.writeFileSync('timeline-data.js', content);

console.log('Timeline data fixed!');