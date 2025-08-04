#!/bin/bash

# Auto-commit script for FOGH timeline - Clean output version
# This script commits changes and increments the version number

# Detect terminal capabilities
if [ -t 1 ] && command -v tput >/dev/null 2>&1; then
    # Terminal supports colors
    if [ "$(tput colors)" -ge 8 ]; then
        USE_COLOR=true
        GREEN=$(tput setaf 2)
        YELLOW=$(tput setaf 3)
        RED=$(tput setaf 1)
        BLUE=$(tput setaf 4)
        NC=$(tput sgr0)
    else
        USE_COLOR=false
    fi
else
    USE_COLOR=false
fi

# If no color support or if TERM is dumb, disable colors
if [ "$TERM" = "dumb" ] || [ -z "$TERM" ]; then
    USE_COLOR=false
fi

# Set empty strings if no color
if [ "$USE_COLOR" = false ]; then
    GREEN=""
    YELLOW=""
    RED=""
    BLUE=""
    NC=""
fi

# Get current date in DD/MM/YY format
CURRENT_DATE=$(date +"%d/%m/%y")

# Function to increment version
increment_version() {
    local version=$1
    local major=$(echo "$version" | cut -d. -f1)
    local minor=$(echo "$version" | cut -d. -f2)
    
    minor=$((minor + 1))
    
    if [ $minor -ge 100 ]; then
        major=$((major + 1))
        minor=0
    fi
    
    printf "%d.%02d" $major $minor
}

# Function to show progress without carriage returns
show_progress() {
    local message=$1
    if [ "$USE_COLOR" = true ]; then
        echo "${YELLOW}... ${message}${NC}"
    else
        echo "... $message"
    fi
}

# Function to show completion
show_complete() {
    local message=$1
    if [ "$USE_COLOR" = true ]; then
        echo "${GREEN}[OK] ${message}${NC}"
    else
        echo "[OK] $message"
    fi
}

# Function to show error
show_error() {
    local message=$1
    if [ "$USE_COLOR" = true ]; then
        echo "${RED}[ERROR] ${message}${NC}"
    else
        echo "[ERROR] $message"
    fi
}

# Function to show warning
show_warning() {
    local message=$1
    if [ "$USE_COLOR" = true ]; then
        echo "${YELLOW}[WARN] ${message}${NC}"
    else
        echo "[WARN] $message"
    fi
}

# Function to show info
show_info() {
    local message=$1
    if [ "$USE_COLOR" = true ]; then
        echo "${BLUE}[INFO] ${message}${NC}"
    else
        echo "[INFO] $message"
    fi
}

# Function to draw separator
draw_separator() {
    echo "----------------------------------------"
}

# Function to count files
count_files() {
    show_progress "Counting project files"
    local web_files=$(find . -maxdepth 1 -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) | wc -l)
    local images=$(find ./images -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.JPG" -o -name "*.png" -o -name "*.PNG" \) 2>/dev/null | grep -v thumb | wc -l)
    local icons=$(find ./icons -maxdepth 1 -type f -name "*.svg" 2>/dev/null | wc -l)
    
    echo ""
    draw_separator
    echo "Project Statistics"
    draw_separator
    echo "  Web files (HTML/JS/CSS): $web_files"
    echo "  Images: $images (excluding thumbnails)"
    echo "  Icons: $icons"
    draw_separator
}

# Function to check for unused images (simplified)
check_unused_files() {
    echo ""
    show_info "Checking for unused files..."
    
    local unused_count=0
    local unused_files=""
    
    # Check images
    show_progress "Scanning images"
    for img in images/*.jpg images/*.JPG images/*.png images/*.PNG; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            if [[ "$filename" == *"-thumb"* ]]; then
                continue
            fi
            if ! grep -q "$filename" *.html *.js *.css 2>/dev/null; then
                unused_files="${unused_files}    - $img\n"
                ((unused_count++))
            fi
        fi
    done
    
    # Check icons
    show_progress "Scanning icons"
    for icon in icons/*.svg; do
        if [ -f "$icon" ]; then
            filename=$(basename "$icon")
            if ! grep -q "$filename" *.html *.js *.css 2>/dev/null; then
                unused_files="${unused_files}    - $icon\n"
                ((unused_count++))
            fi
        fi
    done
    
    if [ $unused_count -gt 0 ]; then
        show_warning "Found $unused_count unused files:"
        echo -e "$unused_files"
        echo -n "  Continue with commit? (y/N): "
        read -r CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
            show_error "Commit cancelled by user"
            exit 0
        fi
        show_complete "Continuing with commit despite unused files"
    else
        show_complete "No unused files found"
    fi
}

# Function to check for missing thumbnails (simplified)
check_missing_thumbnails() {
    echo ""
    show_info "Checking for missing thumbnails..."
    
    local missing_count=0
    local missing_thumbs=""
    
    for img in images/*.jpg images/*.JPG images/*.png images/*.PNG; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            if [[ "$filename" == *"-thumb"* ]]; then
                continue
            fi
            
            name="${filename%.*}"
            ext="${filename##*.}"
            thumb_path="images/${name}-thumb.${ext,,}"
            
            if [ ! -f "$thumb_path" ]; then
                missing_thumbs="${missing_thumbs}    - $img\n"
                ((missing_count++))
            fi
        fi
    done
    
    if [ $missing_count -gt 0 ]; then
        show_warning "Found $missing_count images without thumbnails:"
        echo -e "$missing_thumbs"
        echo -n "  Would you like to generate thumbnails now? (y/N): "
        read -r GENERATE
        if [[ "$GENERATE" =~ ^[Yy]$ ]]; then
            if [ -f "./generate-thumbnails.sh" ]; then
                show_info "Running thumbnail generation..."
                ./generate-thumbnails.sh
                show_complete "Thumbnails generated successfully"
            else
                show_error "generate-thumbnails.sh not found"
            fi
        else
            show_info "Skipping thumbnail generation"
        fi
    else
        show_complete "All images have thumbnails"
    fi
}

# Function to display menu
show_menu() {
    echo ""
    draw_separator
    echo "FOGH Timeline Auto-Commit v2.0"
    draw_separator
    echo ""
    echo "Select option:"
    echo ""
    echo "1) Commit all changes"
    echo "   - Runs ALL safety checks"
    echo "   - Smart commit message"
    echo "   - Increments version"
    echo ""
    echo "2) Commit only timeline data"
    echo "   - Commits ONLY timeline-data.js"
    echo "   - Updates version"
    echo ""
    echo "3) Generate missing thumbnails"
    echo "   - No commit performed"
    echo ""
    echo "4) Exit"
    echo ""
    echo -n "Enter your choice (1-4): "
}

# Function to check branch
check_branch_protection() {
    local current_branch=$(git branch --show-current)
    
    echo ""
    show_info "Current branch: $current_branch"
    
    if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
        show_warning "You are on a protected branch ($current_branch)"
        echo -n "  Continue with commit to $current_branch? (y/N): "
        read -r CONTINUE_PROTECTED
        if [[ ! "$CONTINUE_PROTECTED" =~ ^[Yy]$ ]]; then
            show_error "Commit cancelled"
            exit 0
        fi
    fi
}

# Function to generate smart commit message
generate_smart_commit_message() {
    local commit_type=$1
    local timeline_changes=0
    local suggested_msg=""
    
    if git status --porcelain | grep -q "timeline-data.js"; then
        if [ -f "timeline-data.js" ]; then
            local current_entries=$(grep -c "date:" timeline-data.js 2>/dev/null || echo "0")
            local prev_entries=$(git show HEAD:timeline-data.js 2>/dev/null | grep -c "date:" 2>/dev/null || echo "0")
            timeline_changes=$((current_entries - prev_entries))
        fi
    fi
    
    if [ "$commit_type" = "data" ]; then
        if [ $timeline_changes -gt 0 ]; then
            suggested_msg="Add $timeline_changes new timeline entries"
        elif [ $timeline_changes -lt 0 ]; then
            suggested_msg="Remove $((-timeline_changes)) timeline entries"
        else
            suggested_msg="Update timeline data"
        fi
    else
        suggested_msg="Update timeline content and functionality"
    fi
    
    echo "$suggested_msg"
}

# Main script starts here
draw_separator
echo "FOGH Timeline Auto-Commit"
draw_separator

# Show file statistics
count_files

# Check if there are changes
echo ""
show_info "Checking repository status..."
GIT_STATUS=$(git status --porcelain)
if [ -z "$GIT_STATUS" ]; then
    show_warning "No changes to commit"
    exit 0
else
    show_complete "Found changes to commit"
fi

# Show changed files
echo ""
echo "Changed files:"
echo "$GIT_STATUS" | while read -r line; do
    status=$(echo "$line" | awk '{print $1}')
    file=$(echo "$line" | awk '{print $2}')
    case $status in
        "M") echo "  [M] $file" ;;
        "A") echo "  [A] $file" ;;
        "D") echo "  [D] $file" ;;
        "??") echo "  [?] $file" ;;
        *) echo "  [$status] $file" ;;
    esac
done

# Check branch
check_branch_protection

# Show menu
show_menu
read -r CHOICE

case $CHOICE in
    1)
        echo ""
        show_complete "Preparing to commit all changes..."
        COMMIT_TYPE="all"
        ;;
    2)
        if ! git status --porcelain | grep -q "timeline-data.js"; then
            show_warning "No changes in timeline-data.js to commit"
            exit 0
        fi
        echo ""
        show_complete "Preparing to commit timeline data only..."
        COMMIT_TYPE="data"
        ;;
    3)
        echo ""
        show_info "Starting thumbnail check..."
        check_missing_thumbnails
        show_complete "Thumbnail check complete"
        exit 0
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        show_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac

# Run checks
echo ""
show_info "Running pre-commit checks..."
check_unused_files
check_missing_thumbnails

# Get commit message
echo ""
SUGGESTED_MSG=$(generate_smart_commit_message "$COMMIT_TYPE")
show_info "Suggested commit message: $SUGGESTED_MSG"
echo -n "Enter message (or press Enter to use suggestion): "
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="$SUGGESTED_MSG"
fi

# Get version info
CURRENT_VERSION=$(grep -oP 'v\K[0-9]+\.[0-9]+(?= \()' timeline.html)
if [ -z "$CURRENT_VERSION" ]; then
    show_error "Could not find current version in timeline.html"
    exit 1
fi

NEW_VERSION=$(increment_version "$CURRENT_VERSION")
echo ""
show_info "Version: $CURRENT_VERSION -> $NEW_VERSION"

# Execute commit
echo ""
draw_separator
echo "Executing Commit Process"
draw_separator

# Update version
echo ""
show_progress "Updating version number"
sed -i "s|<span class=\"version\">v${CURRENT_VERSION} ([^)]*)</span>|<span class=\"version\">v${NEW_VERSION} (${CURRENT_DATE})</span>|" timeline.html
if [ $? -eq 0 ]; then
    show_complete "Version updated to v${NEW_VERSION}"
else
    show_error "Error updating version"
    exit 1
fi

# Configure git
show_progress "Configuring Git author"
export GIT_AUTHOR_NAME="Daniel Edge"
export GIT_AUTHOR_EMAIL="fogh@dan-edge.com"
export GIT_COMMITTER_NAME="Daniel Edge"
export GIT_COMMITTER_EMAIL="fogh@dan-edge.com"
show_complete "Git author configured"

# Stage files
show_progress "Staging files"
if [ "$COMMIT_TYPE" = "data" ]; then
    git add timeline.html timeline-data.js
    show_complete "Staged timeline files only"
else
    git add -A
    show_complete "All changes staged"
fi

# Commit
show_progress "Creating commit"
echo "  Message: \"$COMMIT_MSG\""
echo "  Author: Daniel Edge <fogh@dan-edge.com>"

git commit -m "$COMMIT_MSG" --author="Daniel Edge <fogh@dan-edge.com>" >/dev/null 2>&1
if [ $? -eq 0 ]; then
    show_complete "Commit created successfully"
else
    show_error "Error creating commit"
    exit 1
fi

# Push
show_progress "Pushing to GitHub"
git push >/dev/null 2>&1
if [ $? -eq 0 ]; then
    show_complete "Successfully pushed to GitHub"
    echo ""
    draw_separator
    echo "SUCCESS! Version ${NEW_VERSION} deployed"
    draw_separator
    echo "Date: ${CURRENT_DATE}"
    echo "Version: v${NEW_VERSION}"
    echo "Message: $COMMIT_MSG"
    echo "Author: Daniel Edge"
else
    show_error "Error pushing to GitHub"
    echo ""
    echo "Troubleshooting tips:"
    echo "  - Check your internet connection"
    echo "  - Verify your GitHub credentials"
    echo "  - Try: git push --verbose"
    exit 1
fi