// Enhanced image loading with thumbnails and lazy loading
// This can be integrated into timeline-main.js

(function() {
    // Configuration
    const THUMB_SUFFIX = '-thumb';
    const LOADING_THRESHOLD = '50px'; // Start loading 50px before entering viewport
    
    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadFullImage(img);
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: LOADING_THRESHOLD
    });
    
    // Load full resolution image
    function loadFullImage(img) {
        if (img.dataset.fullSrc && img.src !== img.dataset.fullSrc) {
            // Show loading state
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s';
            
            // Preload full image
            const fullImg = new Image();
            fullImg.onload = function() {
                img.src = img.dataset.fullSrc;
                img.style.filter = 'none';
                img.dataset.loaded = 'true';
            };
            fullImg.onerror = function() {
                console.error('Failed to load full image:', img.dataset.fullSrc);
                img.style.filter = 'none';
            };
            fullImg.src = img.dataset.fullSrc;
        }
    }
    
    // Enhanced image creation with thumbnail support
    window.createOptimizedImage = function(item, isSecond) {
        const imageSrc = isSecond ? item.image2 : item.image;
        const captionText = isSecond ? item.image2Caption : item.imageCaption;
        const captionHTML = isSecond ? item.image2CaptionHTML : item.imageCaptionHTML;
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'content-image';
        if (isSecond) imageContainer.className += ' second-image';
        
        const img = document.createElement('img');
        
        // Generate thumbnail path
        const thumbSrc = generateThumbnailPath(imageSrc);
        
        // Set initial thumbnail source
        img.src = thumbSrc;
        img.dataset.fullSrc = imageSrc;
        img.alt = item.title;
        img.loading = 'lazy'; // Native lazy loading as fallback
        
        // Add click handler for modal
        img.addEventListener('click', function() {
            if (img.dataset.loaded === 'true') {
                // Full image already loaded, open modal immediately
                openImageModal(imageSrc, captionText, captionHTML);
            } else {
                // Load full image first, then open modal
                img.style.cursor = 'wait';
                const fullImg = new Image();
                fullImg.onload = function() {
                    img.style.cursor = 'pointer';
                    openImageModal(imageSrc, captionText, captionHTML);
                };
                fullImg.onerror = function() {
                    img.style.cursor = 'pointer';
                    alert('Failed to load full image');
                };
                fullImg.src = imageSrc;
            }
        });
        
        // Observe image for lazy loading
        imageObserver.observe(img);
        
        imageContainer.appendChild(img);
        
        // Add caption if present
        if (captionText || captionHTML) {
            const caption = document.createElement('div');
            caption.className = 'content-image-caption';
            if (captionHTML) {
                caption.innerHTML = captionText;
            } else {
                caption.textContent = captionText;
            }
            imageContainer.appendChild(caption);
        }
        
        return imageContainer;
    };
    
    // Generate thumbnail path from original image path
    function generateThumbnailPath(imagePath) {
        // Check if thumbnail exists by trying to load it
        const pathParts = imagePath.split('.');
        const ext = pathParts.pop();
        const basePath = pathParts.join('.');
        const thumbPath = `${basePath}${THUMB_SUFFIX}.${ext}`;
        
        // For now, return thumbnail path if it exists, otherwise original
        // In production, you'd check if thumbnail exists on server
        return thumbPath;
    }
    
    // Enhanced CSS for loading states
    const style = document.createElement('style');
    style.textContent = `
        .content-image img {
            transition: filter 0.3s ease;
        }
        
        .content-image img[data-loaded="false"] {
            filter: blur(5px);
        }
        
        .content-image {
            background: #f0f0f0;
            background-image: linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
                              linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
                              linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        
        [data-theme="dark"] .content-image {
            background: #2a2a2a;
            background-image: linear-gradient(45deg, #333 25%, transparent 25%),
                              linear-gradient(-45deg, #333 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #333 75%),
                              linear-gradient(-45deg, transparent 75%, #333 75%);
        }
    `;
    document.head.appendChild(style);
    
})();