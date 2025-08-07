# Release Notes - v2.08
**Date:** 07/08/2025

## 🎨 UI/UX Improvements

### Timeline Entries
- **Fixed title wrapping**: Titles now wrap less frequently and use more horizontal space before breaking
- **Removed hyphenation**: Words no longer split with hyphens, improving readability
- **Consistent spacing**: Uniform gap between dates and entries for both major and minor items
- **Vertical alignment**: Collapsed minor entry titles now properly centered with icons

### References Modal
- **Enhanced title**: Added gradient text effect for better visual prominence
- **Reduced height**: Modal height decreased from 90vh to 80vh for better screen fit
- **Compact spacing**: Reduced padding throughout for more efficient space usage
- **Simplified pagination**: Maximum 5 page numbers shown at once with improved navigation
- **Key section fix**: References key now always starts collapsed and toggle works on first access

### Citation Modal
- **Added title**: "Citation Details" header now displays when viewing individual citations

### Submission Forms
- **Simplified messages**: Shortened confirmation and success messages
- **Reduced modal size**: Smaller padding and more concise content
- **Non-technical language**: Replaced "hash/MD5" with "encrypted" for better understanding

### Filter Controls
- **Clear button fix**: Now appears correctly when reopening filter drawer with active date range
- **Smaller "More Options"**: Reduced font size for cleaner appearance

### About Box
- **Condensed content**: Simplified messaging while maintaining key information
- **Enhanced beta warning**: Now includes call to action for reporting issues
- **Reduced size**: Smaller padding and margins for more compact display

## 🐛 Bug Fixes
- Fixed references key button not working on first modal access
- Fixed clear all button visibility when filter drawer reopens
- Fixed pagination showing more than 5 numbered buttons
- Ensured references key modal is always collapsed when opened

## 🔧 Technical Changes
- Removed all references to AI assistants from codebase
- Improved word wrapping logic for better text flow
- Updated version tracking to 2.08

## 📝 Content Updates
- Improved accessibility of technical terms for general audience
- Streamlined user-facing messages throughout the application

---

*This release focuses on UI refinements and bug fixes to improve the overall user experience.*