# Icon Usage Comparison Report

## Icons Used in Timeline Data

Based on searching through all HTML and JavaScript files, the following icons are referenced in timeline entries:

### Used Icons (27 unique icons):
1. **apartment** - Used for modern housing developments
2. **alert** - Used for warnings/alerts (e.g., IRA bomb)
3. **bookmark** - Used for Crystal Palace
4. **building** - Used for industrial/sewerage buildings
5. **bunker** - Used for nuclear bunker
6. **car-explosion** - Used for car bomb incidents
7. **church** - Used multiple times for religious buildings
8. **cloud** - Used for temporary/iron churches
9. **crown** - Used for royalty (Margaret Finch)
10. **death** - Used for death/memorial entries
11. **edit** - Used for River Effra culverting
12. **fogh** - Used extensively for Friends of Gipsy Hill entries
13. **heart** - Used for Fanny the cat
14. **home** - Used for Victorian houses
15. **house** - Used for settlements/camps
16. **location** - Used for location markers/deaths
17. **londonmap** - Used for map-related entries
18. **microphone** - Used for recorded events (Pepys diary)
19. **police** - Used for police-related entries
20. **road** - Used for road construction
21. **shield** - Used for conservation areas
22. **target** - Used for bunker/military
23. **theater** - Used for theatrical productions
24. **tools** - Used for construction/hill work
25. **train** - Used for railway stations
26. **train-crash** - Used for train accidents
27. **tree** - Used for Great North Wood
28. **warning** - Used for WWII bombs
29. **water** - Used for floods

## Icons Defined in timeline-icons.js

The following icons are actually defined in the icons file:

### Available Icons (26 defined):
1. alert ✓
2. apartment ✓
3. bookmark ✓
4. building ✓
5. bunker ✓
6. car-explosion ✓
7. church ✓
8. cloud ✓
9. crown ✓
10. death ✓
11. edit ✓
12. heart ✓
13. home ✓
14. house ✓
15. location ✓
16. londonmap ✓
17. microphone ✓
18. police ✓
19. river (defined but not used)
20. road ✓
21. shield ✓
22. target ✓
23. theater ✓
24. tools ✓
25. train ✓
26. train-crash ✓
27. tree ✓
28. warning ✓
29. water ✓

## Missing Icons

### Icons used but NOT defined in timeline-icons.js:
1. **fogh** - This icon is used 7 times in the timeline for all Friends of Gipsy Hill entries
   - **Special handling**: The fogh icon is handled differently in the code:
     - In timeline-themed.html, it displays "FoGH" as text with special CSS styling
     - In timeline-main.js, it uses a custom SVG (foghIcon variable) instead of the icons object
     - It has special CSS classes (.content-icon.fogh) with a green gradient background

### Icons defined but NOT used:
1. **river** - Defined in the icons file but not used in any timeline entries

## Summary

- **Total icons used**: 29 unique icons
- **Total icons defined**: 26 icons
- **Missing definition**: 1 icon (fogh)
- **Unused definition**: 1 icon (river)

## Recommendations

1. The 'fogh' icon is already properly handled as a special case in the code, so no action needed
2. Consider whether the 'river' icon should be used for River Effra entries (currently using 'edit')
3. All other icons are properly matched between usage and definitions

## Technical Implementation Details

The timeline rendering code handles icons in two ways:
1. **Standard icons**: Pulled from the `icons` object in timeline-icons.js
2. **Special fogh icon**: 
   - Has custom rendering logic in timeline-main.js using a dedicated foghIcon SVG
   - Has special CSS styling with green gradient background
   - Represents the Friends of Gipsy Hill organization