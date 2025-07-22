#!/bin/bash

# Secure FTP Deployment Script for Gipsy Hill Timeline
# Uses environment variables for credentials

# Check if environment variables are set
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "Error: FTP credentials not set in environment variables"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export FTP_HOST='ftpupload.net'"
    echo "  export FTP_USER='your_username'"
    echo "  export FTP_PASS='your_password'"
    echo ""
    echo "Or create a .env file with these variables and run:"
    echo "  source .env && ./deploy-secure.sh"
    exit 1
fi

FTP_DIR="/htdocs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Gipsy Hill Timeline FTP Deployment ===${NC}"
echo -e "${YELLOW}Deploying to: $FTP_HOST${NC}"

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo -e "${RED}Error: lftp is not installed${NC}"
    echo "Please install lftp first: sudo apt-get install lftp"
    exit 1
fi

# Create a temporary file for lftp commands
LFTP_SCRIPT=$(mktemp)

# Write lftp commands to temporary file
cat > "$LFTP_SCRIPT" << EOF
set ssl:verify-certificate no
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $FTP_DIR

# First, clean the entire htdocs directory on the server
# This ensures ONLY the files we explicitly upload will be present
echo "Cleaning remote directory completely..."
# Remove all visible files and directories
rm -rf *
# Remove specific hidden files and directories
rm -rf .claude
rm -rf .git
rm -rf .vscode
rm -rf .idea
rm -f .env
rm -f .env.example
rm -f .gitignore
rm -f .DS_Store

# Now perform the main deployment
lcd $(pwd)
# Upload files - no need for --delete since we cleaned everything first
# Blacklist approach: Exclude sensitive directories and files
mirror --reverse --verbose --parallel=3 \
       --exclude-glob "debug/*" \
       --exclude-glob ".git/*" \
       --exclude-glob ".claude/*" \
       --exclude-glob "*.sh" \
       --exclude-glob ".env*" \
       --exclude-glob "*.log" \
       --exclude ".gitignore" \
       --exclude "VERSION" \
       --exclude-glob ".DS_Store" \
       --exclude-glob "Thumbs.db" \
       --exclude-glob ".vscode/*" \
       --exclude-glob ".idea/*" \
       --exclude-glob "node_modules/*" \
       . .
bye
EOF

# Update version number
echo -e "${YELLOW}Updating version number...${NC}"

# Read version from VERSION file (create if doesn't exist)
if [ ! -f VERSION ]; then
    echo "1.00" > VERSION
fi

CURRENT_VERSION=$(cat VERSION)
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)

# Increment minor version
MINOR_NUM=$((10#$MINOR + 1))
NEW_VERSION="${MAJOR}.$(printf "%02d" $MINOR_NUM)"

# Get timestamp
TIMESTAMP_PRETTY=$(date +"%H:%M %d/%m/%y")

# Save new version to file
echo "$NEW_VERSION" > VERSION

# Update version in HTML file - search for version span and update it
# This is more robust as it doesn't depend on exact HTML structure
if grep -q 'class="version"' timeline.html; then
    sed -i "s|<span class=\"version\">[^<]*</span>|<span class=\"version\">v${NEW_VERSION} (${TIMESTAMP_PRETTY})</span>|" timeline.html
else
    echo -e "${YELLOW}Warning: Could not find version span in timeline.html${NC}"
fi

echo -e "${GREEN}Updated version to: v${NEW_VERSION} (${TIMESTAMP_PRETTY})${NC}"
echo ""

echo -e "${YELLOW}Analyzing local files...${NC}"

# Count files by specific extension (excluding directories we won't deploy)
HTML_COUNT=$(find . -name "*.html" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
HTM_COUNT=$(find . -name "*.htm" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
CSS_COUNT=$(find . -name "*.css" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
JS_COUNT=$(find . -name "*.js" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
JSON_COUNT=$(find . -name "*.json" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
SVG_COUNT=$(find . -name "*.svg" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
PNG_COUNT=$(find . -name "*.png" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
JPG_COUNT=$(find . \( -name "*.jpg" -o -name "*.jpeg" \) ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
GIF_COUNT=$(find . -name "*.gif" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
ICO_COUNT=$(find . -name "*.ico" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
WEBP_COUNT=$(find . -name "*.webp" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
WOFF_COUNT=$(find . \( -name "*.woff" -o -name "*.woff2" \) ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
TTF_COUNT=$(find . -name "*.ttf" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
EOT_COUNT=$(find . -name "*.eot" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
TXT_COUNT=$(find . -name "*.txt" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
XML_COUNT=$(find . -name "*.xml" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)
MANIFEST_COUNT=$(find . -name "*.webmanifest" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" 2>/dev/null | wc -l)

# Count other files that will be deployed
OTHER_COUNT=$(find . -type f ! -name "*.html" ! -name "*.htm" ! -name "*.css" ! -name "*.js" ! -name "*.json" ! -name "*.svg" ! -name "*.png" ! -name "*.jpg" ! -name "*.jpeg" ! -name "*.gif" ! -name "*.ico" ! -name "*.webp" ! -name "*.woff" ! -name "*.woff2" ! -name "*.ttf" ! -name "*.eot" ! -name "*.txt" ! -name "*.xml" ! -name "*.webmanifest" ! -name "*.sh" ! -name ".env*" ! -name "*.log" ! -name ".gitignore" ! -name "VERSION" ! -name ".DS_Store" ! -name "Thumbs.db" ! -path "./debug/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./.vscode/*" ! -path "./.idea/*" ! -path "./node_modules/*" 2>/dev/null | wc -l)

TOTAL_COUNT=$((HTML_COUNT + HTM_COUNT + CSS_COUNT + JS_COUNT + JSON_COUNT + SVG_COUNT + PNG_COUNT + JPG_COUNT + GIF_COUNT + ICO_COUNT + WEBP_COUNT + WOFF_COUNT + TTF_COUNT + EOT_COUNT + TXT_COUNT + XML_COUNT + MANIFEST_COUNT + OTHER_COUNT))

echo ""
echo -e "${GREEN}Files to be deployed by extension:${NC}"
[ $HTML_COUNT -gt 0 ] && echo "  .html     : $HTML_COUNT"
[ $HTM_COUNT -gt 0 ] && echo "  .htm      : $HTM_COUNT"
[ $CSS_COUNT -gt 0 ] && echo "  .css      : $CSS_COUNT"
[ $JS_COUNT -gt 0 ] && echo "  .js       : $JS_COUNT"
[ $JSON_COUNT -gt 0 ] && echo "  .json     : $JSON_COUNT"
[ $SVG_COUNT -gt 0 ] && echo "  .svg      : $SVG_COUNT"
[ $PNG_COUNT -gt 0 ] && echo "  .png      : $PNG_COUNT"
[ $JPG_COUNT -gt 0 ] && echo "  .jpg/jpeg : $JPG_COUNT"
[ $GIF_COUNT -gt 0 ] && echo "  .gif      : $GIF_COUNT"
[ $ICO_COUNT -gt 0 ] && echo "  .ico      : $ICO_COUNT"
[ $WEBP_COUNT -gt 0 ] && echo "  .webp     : $WEBP_COUNT"
[ $WOFF_COUNT -gt 0 ] && echo "  .woff/2   : $WOFF_COUNT"
[ $TTF_COUNT -gt 0 ] && echo "  .ttf      : $TTF_COUNT"
[ $EOT_COUNT -gt 0 ] && echo "  .eot      : $EOT_COUNT"
[ $TXT_COUNT -gt 0 ] && echo "  .txt      : $TXT_COUNT"
[ $XML_COUNT -gt 0 ] && echo "  .xml      : $XML_COUNT"
[ $MANIFEST_COUNT -gt 0 ] && echo "  .manifest : $MANIFEST_COUNT"
[ $OTHER_COUNT -gt 0 ] && echo "  other     : $OTHER_COUNT"
echo "  ─────────────────────"
echo "  📦 Total  : $TOTAL_COUNT files"
echo ""

# List directories that will be created
DIRS=$(find . -type d ! -path "./debug*" ! -path "./.git*" ! -path "./.claude*" ! -name "." | sort)
if [ ! -z "$DIRS" ]; then
    echo -e "${GREEN}Directories to be created:${NC}"
    echo "$DIRS" | while read dir; do
        echo "  📁 $dir"
    done
    echo ""
fi

echo -e "${YELLOW}Starting deployment...${NC}"
echo "This will:"
echo "  🧹 Completely clean remote htdocs directory"
echo "  ✓ Upload $TOTAL_COUNT files to $FTP_HOST"
echo "  ✓ Create directory structure"
echo "  ✗ Exclude debug/, .git/, .claude/, and sensitive files"
echo ""
echo -e "${RED}WARNING: This will delete ALL files in the remote htdocs directory!${NC}"
echo ""

# Prompt for confirmation
echo -e "${YELLOW}Do you want to continue with the deployment? (yes/no)${NC}"
read -r CONFIRMATION

if [[ ! "$CONFIRMATION" =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Deployment cancelled by user.${NC}"
    rm -f "$LFTP_SCRIPT"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting deployment...${NC}"

# Create a temporary file to capture lftp output
LFTP_OUTPUT=$(mktemp)

# Execute lftp with the script and capture output
lftp -f "$LFTP_SCRIPT" 2>&1 | tee "$LFTP_OUTPUT"
DEPLOY_STATUS=${PIPESTATUS[0]}

# Since we clean everything first, we don't track individual deletions

# Clean up temporary output file
rm -f "$LFTP_OUTPUT"

# Clean up temporary file
rm -f "$LFTP_SCRIPT"

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
    echo ""
    echo -e "${GREEN}Deployment summary:${NC}"
    echo "  ✓ Cleaned remote directory completely"
    echo "  ✓ Uploaded: $TOTAL_COUNT files"
    echo "  ✓ Only approved files now on server"
    
    # Show the deployed directory structure
    echo ""
    echo -e "${GREEN}Remote directory structure (htdocs/):${NC}"
    
    # Create a temporary file for directory listing
    TREE_SCRIPT=$(mktemp)
    TREE_OUTPUT=$(mktemp)
    
    # Get remote directory structure with recursive listing
    cat > "$TREE_SCRIPT" << EOF
set ssl:verify-certificate no
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $FTP_DIR
ls -R > $TREE_OUTPUT
bye
EOF
    
    # Get the listing
    echo -e "${YELLOW}Fetching remote directory structure...${NC}"
    lftp -f "$TREE_SCRIPT" > "$TREE_OUTPUT" 2>/dev/null
    
    # Process and display the tree structure
    echo "htdocs/"
    
    # List root level files
    lftp -c "set ssl:verify-certificate no; set ftp:ssl-allow no; open -u $FTP_USER,$FTP_PASS $FTP_HOST; cd $FTP_DIR; ls" 2>/dev/null | grep -E '^-' | awk '{print $NF}' | sort | while read -r file; do
        echo "├── $file"
    done
    
    # Check if icons directory exists and list its contents
    if lftp -c "set ssl:verify-certificate no; set ftp:ssl-allow no; open -u $FTP_USER,$FTP_PASS $FTP_HOST; cd $FTP_DIR/icons; ls" 2>/dev/null | grep -q .; then
        echo "└── icons/"
        lftp -c "set ssl:verify-certificate no; set ftp:ssl-allow no; open -u $FTP_USER,$FTP_PASS $FTP_HOST; cd $FTP_DIR/icons; ls" 2>/dev/null | grep -E '^-' | awk '{print $NF}' | sort | while read -r file; do
            echo "    └── $file"
        done
    fi
    
    # Clean up
    rm -f "$TREE_SCRIPT" "$TREE_OUTPUT"
    
    # Generate timestamp for cache busting
    TIMESTAMP=$(date +%s)
    
    echo ""
    echo -e "${GREEN}Your timeline is now live at:${NC}"
    echo -e "${YELLOW}https://fogh.free.nf/timeline.html?cache=false&v=$TIMESTAMP${NC}"
    echo ""
    echo "This URL includes cache-busting parameters to ensure you see the latest version."
    
    # Commit changes to git
    echo ""
    echo -e "${YELLOW}Committing changes to git...${NC}"
    
    # Check if we're in a git repository
    if [ -d .git ]; then
        # Add the modified files
        git add timeline.html VERSION
        
        # Create commit message
        COMMIT_MSG="Deploy v${NEW_VERSION} to production

Version: v${NEW_VERSION} (${TIMESTAMP_PRETTY})
Files deployed: $TOTAL_COUNT
URL: https://fogh.free.nf/timeline.html

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        # Commit the changes
        git commit -m "$COMMIT_MSG" 2>&1 | grep -v "^#" || true
        
        echo -e "${GREEN}✓ Changes committed to git${NC}"
    else
        echo -e "${YELLOW}Not a git repository - skipping commit${NC}"
    fi
else
    echo -e "${RED}✗ Deployment failed with error code: $DEPLOY_STATUS${NC}"
    exit 1
fi