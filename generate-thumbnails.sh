#!/bin/bash

# Generate thumbnails for all images in the images directory
# Creates 400px wide thumbnails with -thumb suffix

IMAGE_DIR="./images"
THUMB_WIDTH=400
QUALITY=85

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required. Install with: apt-get install imagemagick"
    exit 1
fi

# Process each image
for img in "$IMAGE_DIR"/*.{jpg,JPG,png,PNG}; do
    if [ -f "$img" ]; then
        # Get filename without extension
        filename=$(basename "$img")
        name="${filename%.*}"
        ext="${filename##*.}"
        
        # Skip if already a thumbnail
        if [[ "$name" == *"-thumb" ]]; then
            continue
        fi
        
        # Output thumbnail path
        thumb_path="$IMAGE_DIR/${name}-thumb.${ext,,}"
        
        # Skip if thumbnail already exists
        if [ -f "$thumb_path" ]; then
            echo "Thumbnail exists: $thumb_path"
            continue
        fi
        
        # Generate thumbnail
        echo "Creating thumbnail: $thumb_path"
        convert "$img" -resize "${THUMB_WIDTH}x>" -quality "$QUALITY" "$thumb_path"
    fi
done

echo "Thumbnail generation complete!"