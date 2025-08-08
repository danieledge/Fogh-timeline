// stack3d.js - 3D stack/coverflow carousel
// Auto-enhances elements with class="stack3d"

(function() {
  'use strict';

  class Stack3D {
    constructor(element) {
      this.element = element;
      this.slides = Array.from(element.querySelectorAll('img'));
      this.currentIndex = 0;
      
      if (this.slides.length === 0) return;
      
      // Store reference on element for external access
      element.stack3d = this;
      
      this.init();
    }
    
    init() {
      // Layout slides in 3D stack
      this.layout();
      
      // Add keyboard support
      this.element.setAttribute('tabindex', '0');
      this.element.addEventListener('keydown', this.handleKeydown.bind(this));
      
      // Add touch/swipe support
      this.addTouchSupport();
      
      // Add click support on slides
      this.slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
          if (index !== this.currentIndex) {
            this.goTo(index);
          }
        });
      });
    }
    
    layout() {
      const total = this.slides.length;
      const spacing = 60; // Z-spacing between slides
      const rotationMax = 45; // Max rotation angle
      
      this.slides.forEach((slide, index) => {
        const offset = index - this.currentIndex;
        const absOffset = Math.abs(offset);
        const sign = offset > 0 ? 1 : offset < 0 ? -1 : 0;
        
        // Position in 3D space
        const translateX = offset * 150; // Horizontal spacing
        const translateZ = -absOffset * spacing; // Depth
        const rotateY = sign * Math.min(absOffset * 15, rotationMax); // Rotation
        
        // Apply transform
        slide.style.transform = `
          translateX(${translateX}px)
          translateZ(${translateZ}px)
          rotateY(${rotateY}deg)
        `;
        
        // Adjust opacity and filter for depth
        const opacity = Math.max(0.3, 1 - absOffset * 0.2);
        slide.style.opacity = opacity;
        slide.style.filter = absOffset > 0 ? `blur(${absOffset}px)` : 'none';
        
        // Mark active slide
        slide.setAttribute('data-active', index === this.currentIndex);
        
        // Make visible
        slide.classList.add('is-visible');
        
        // Set z-index for proper stacking
        slide.style.zIndex = total - absOffset;
      });
    }
    
    goTo(index) {
      // Clamp index to valid range
      this.currentIndex = Math.max(0, Math.min(index, this.slides.length - 1));
      this.layout();
    }
    
    next() {
      this.goTo(this.currentIndex + 1);
    }
    
    prev() {
      this.goTo(this.currentIndex - 1);
    }
    
    handleKeydown(e) {
      switch(e.key) {
        case 'ArrowRight':
          this.next();
          e.preventDefault();
          break;
        case 'ArrowLeft':
          this.prev();
          e.preventDefault();
          break;
      }
    }
    
    addTouchSupport() {
      let startX = 0;
      let startTime = 0;
      let isDragging = false;
      
      this.element.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startTime = Date.now();
      }, { passive: true });
      
      this.element.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;
        const deltaTime = Date.now() - startTime;
        
        // Swipe detection
        if (Math.abs(deltaX) > 50 || (Math.abs(deltaX) > 30 && deltaTime < 300)) {
          if (deltaX > 0) {
            this.prev();
          } else {
            this.next();
          }
        }
        
        isDragging = false;
      }, { passive: true });
    }
  }
  
  // Auto-enhance all .stack3d elements
  function enhanceAll() {
    document.querySelectorAll('.stack3d').forEach(element => {
      if (!element.stack3d) {
        new Stack3D(element);
      }
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAll);
  } else {
    enhanceAll();
  }
  
  // Also run after a delay to catch dynamically added content
  setTimeout(enhanceAll, 100);
  
  // Make Stack3D available globally
  window.Stack3D = Stack3D;
})();