# JavaScript File Analysis

## Files That CAN Be Safely Moved/Deleted

### Can Delete (Not Used):
1. **`update-timeline.js`** ✅
   - Not referenced anywhere
   - GitHub Actions create their own version inline
   - **Action:** DELETE

2. **`apply_category_updates.js`** ✅
   - Not referenced anywhere in the codebase
   - Appears to be a utility script
   - **Action:** DELETE or move to `utils/` if you want to keep it

3. **`check-citations.js`** ✅
   - Not referenced anywhere in the codebase
   - Appears to be a utility script
   - **Action:** DELETE or move to `utils/` if you want to keep it

## Files That MUST Stay in Root

### Core Application Files (Referenced in timeline.html):
1. **`timeline-data.js`** ❌ Cannot move
   - Loaded by: `timeline.html` line 872
   - Also referenced by: `admin-ui/admin.html`

2. **`timeline-main.js`** ❌ Cannot move
   - Loaded by: `timeline.html` line 881
   - Core application logic

3. **`search-morph.js`** ❌ Cannot move
   - Loaded by: `timeline.html` line 884
   - Search functionality

4. **`image-carousel.js`** ❌ Cannot move
   - Loaded by: `timeline.html` line 874
   - Image carousel functionality

5. **`staticman-integration.js`** ❌ Cannot move
   - Loaded by: `timeline.html` line 887
   - Comment system integration

6. **`sw.js`** ❌ Cannot move
   - Service Worker - MUST be in root
   - Loaded by: `timeline.html` line 815
   - Service workers have scope restrictions

## Summary

### Safe to Delete:
- `update-timeline.js`
- `apply_category_updates.js` 
- `check-citations.js`

### Must Keep in Root:
- `timeline-data.js`
- `timeline-main.js`
- `search-morph.js`
- `image-carousel.js`
- `staticman-integration.js`
- `sw.js`

### Recommendation:
If you want to organize better without breaking things:
1. Delete the unused utility scripts
2. Keep all active JS files in root since they're loaded with relative paths
3. To move active JS files, you'd need to update all `loadScript()` calls in `timeline.html`

## If You Want to Move Active JS Files to a Folder:

Create a `js/` folder and update these lines in `timeline.html`:
- Line 872: `'timeline-data.js'` → `'js/timeline-data.js'`
- Line 874: `'image-carousel.js'` → `'js/image-carousel.js'`
- Line 881: `'timeline-main.js'` → `'js/timeline-main.js'`
- Line 884: `'search-morph.js'` → `'js/search-morph.js'`
- Line 887: `'staticman-integration.js'` → `'js/staticman-integration.js'`

Also update in `admin-ui/admin.html`:
- Line 989: `'../timeline-data.js'` → `'../js/timeline-data.js'`

Note: `sw.js` CANNOT be moved - service workers must be in the root to have proper scope.