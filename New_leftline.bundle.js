
/* leftline.carousel.bundle.js  v1.2
   Left-aligned, fixed-gap carousel with *fixed height* images
   and aspect-ratio–aware widths. Vanilla JS, single file.

   New in v1.2:
   - data-height (default 300) fixes image height uniformly
   - data-fit: 'contain' (default) or 'cover'
   - data-bg: letterbox/pillarbox background
   - data-dynamic-width: true (default) sets each item width from natural ratio
     (portrait images become narrower, landscape wider) while keeping captions
     neatly underneath.
*/

(function LeftlineBundle(){
  // ---------- CSS ----------
  var CSS = `
.leftline{position:relative;width:100%;
  --ll-gap:16px;--ll-height:250px;--ll-radius:8px;
  --ll-shadow:0 2px 8px rgba(0,0,0,.1);
  --ll-caption-fs:.92rem;--ll-caption-lh:1.3;
  --ll-anim-ms:420ms;--ll-ease:cubic-bezier(.22,.61,.36,1);
  --ll-bg:var(--bg-secondary, #ffffff);
  --ll-text:var(--text-primary, #2c3e50);
  --ll-border:var(--border-color, #e5e7eb)
}
[data-theme="dark"] .leftline{
  --ll-shadow:0 2px 12px rgba(0,0,0,.3);
  --ll-bg:var(--bg-secondary, #242424);
  --ll-text:var(--text-primary, #e8e8e8);
  --ll-border:var(--border-color, #3a3a3a)
}
.leftline-viewport{overflow:hidden}
.leftline-track{
  display:flex;flex-flow:row nowrap;gap:var(--ll-gap);
  align-items:flex-start;justify-content:flex-start;
  transform:translateX(0);transition:transform var(--ll-anim-ms) var(--ll-ease);
  will-change:transform;padding:0;margin:0;list-style:none
}
.leftline-item{flex:0 0 auto;display:block}
.leftline-figure{display:grid;grid-template-rows:auto auto;gap:4px}
.leftline-media{
  height:var(--ll-height);width:auto;overflow:hidden;border-radius:var(--ll-radius);
  box-shadow:var(--ll-shadow);background:var(--ll-bg);display:block;
  border:1px solid var(--ll-border);position:relative;z-index:1;pointer-events:auto
}
.leftline-media>img{
  width:100%;height:100%;display:block;object-position:center
}
.leftline-caption{
  font-size:0.8rem;
  line-height:1.3;
  color:var(--text-secondary, #6c757d);
  font-weight:400;
  letter-spacing:0.01em;
  margin-top:6px;
  text-align:center;
  opacity:0.9;
  transition:opacity 0.2s ease;
  overflow:hidden;
  white-space:normal;
  word-wrap:break-word;
  max-width:100%;
  padding:0 4px;
  font-family:var(--font-secondary, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  display:-webkit-box;
  -webkit-line-clamp:3;
  -webkit-box-orient:vertical
}
.leftline-item:hover .leftline-caption{
  opacity:1
}
[data-theme="dark"] .leftline-caption{
  color:var(--text-secondary, #a8a8a8);
  opacity:0.85
}
[data-theme="dark"] .leftline-item:hover .leftline-caption{
  opacity:1
}
/* Overlaid controls */
.leftline-overlay{pointer-events:none;position:absolute;inset:0;display:grid;place-items:center;z-index:2}
.leftline-arrows{pointer-events:none;position:absolute;inset-inline:0;inset-block:0;display:flex;justify-content:space-between;align-items:center;padding:0 .25rem}
.leftline-btn{
  pointer-events:auto;
  width:40px;height:40px;border-radius:10px;display:grid;place-items:center;
  border:1px solid var(--ll-border);
  background:var(--bg-tertiary, rgba(255,255,255,.9));
  backdrop-filter:blur(6px);box-shadow:0 2px 8px rgba(0,0,0,.15);
  cursor:pointer;font:inherit;transition:transform .2s ease,opacity .2s ease;
  color:var(--text-primary)
}
[data-theme="dark"] .leftline-btn{
  background:var(--bg-tertiary, rgba(46,46,46,.9));
  box-shadow:0 2px 8px rgba(0,0,0,.3)
}
.leftline-btn:hover{transform:scale(1.05);background:var(--bg-secondary)}
.leftline-btn:active{transform:scale(.97)}
.leftline-btn[disabled]{opacity:.45;cursor:default}
.leftline-btn svg{width:18px;height:18px;display:block;fill:currentColor}
.leftline-edgefade{pointer-events:none;position:absolute;inset:0;
  background:linear-gradient(90deg,rgba(0,0,0,.06),transparent 70%) left,
             linear-gradient(270deg,rgba(0,0,0,.06),transparent 70%) right;
  background-size:20% 100%,20% 100%;background-repeat:no-repeat;opacity:.0;transition:opacity .3s ease}
.leftline:hover .leftline-edgefade{opacity:.55}
/* Dots (optional) */
.leftline-dots{display:flex;gap:8px;margin-top:10px}
.leftline-dot{width:8px;height:8px;border-radius:50%;border:1px solid currentColor;background:transparent;padding:0;cursor:pointer}
.leftline-dot[aria-current="true"]{background:currentColor}
@media (prefers-reduced-motion:reduce){.leftline-track{transition:none}.leftline-btn{transition:none}}
  `;
  var style=document.createElement('style');style.setAttribute('data-leftline','true');style.appendChild(document.createTextNode(CSS));document.head.appendChild(style);

  // ---------- Defaults ----------
  var DEF = {
    height:250,              // px fixed height for all images
    fit:'contain',           // 'contain' | 'cover'
    bg:'#f4f4f4',            // letterbox background
    gap:null,                // px; if null uses CSS var
    dynamicWidth:true,       // per-image width from natural ratio
    wrap:true, slideBy:'page',
    arrows:true, dots:false, wheel:true, drag:true, keys:true,
    autoplay:false, interval:5000,
    animationMs:null, ease:null,
    perView:{"0":1,"640":2,"960":3}
  };

  // ---------- Modal with zoom functionality ----------
  // Define modal early so it's available for click handlers
  var modal = null;
  var zoomLevel = 1;
  var isPanning = false;
  var startX = 0, startY = 0;
  var translateX = 0, translateY = 0;
  
  function openImageModal(src, caption) {
    if (!modal) {
      // Create modal structure
      modal = document.createElement('div');
      modal.className = 'leftline-image-modal';
      modal.innerHTML = `
        <div class="leftline-modal-content">
          <span class="leftline-modal-close">&times;</span>
          <div class="leftline-zoom-controls">
            <button class="leftline-zoom-btn" data-zoom="in">+</button>
            <button class="leftline-zoom-btn" data-zoom="out">−</button>
            <button class="leftline-zoom-btn" data-zoom="reset">Reset</button>
            <span class="leftline-zoom-level">100%</span>
          </div>
          <div class="leftline-modal-img-container">
            <img class="leftline-modal-img">
          </div>
          <div class="leftline-modal-caption"></div>
        </div>`;
      document.body.appendChild(modal);
      
      // Add modal styles
      var modalCSS = `
        .leftline-image-modal {
          display: none; position: fixed; z-index: 10000;
          left: 0; top: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.95);
        }
        .leftline-modal-content {
          position: relative; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .leftline-modal-close {
          position: absolute; top: 20px; right: 30px;
          color: #fff; font-size: 35px; font-weight: bold;
          cursor: pointer; z-index: 10001;
          background: rgba(0,0,0,0.5); border-radius: 50%;
          width: 40px; height: 40px; text-align: center;
          line-height: 35px;
        }
        .leftline-modal-close:hover { background: rgba(0,0,0,0.8); }
        .leftline-zoom-controls {
          position: absolute; top: 20px; left: 20px;
          z-index: 10001; display: flex; gap: 8px;
          background: rgba(0,0,0,0.7); padding: 8px;
          border-radius: 8px;
        }
        .leftline-zoom-btn {
          padding: 6px 12px; background: rgba(255,255,255,0.1);
          color: white; border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px; cursor: pointer;
          font-size: 16px; min-width: 40px;
        }
        .leftline-zoom-btn:hover { background: rgba(255,255,255,0.2); }
        .leftline-zoom-level {
          color: white; padding: 6px 12px;
          min-width: 60px; text-align: center;
        }
        .leftline-modal-img-container {
          overflow: auto; max-width: 90%; max-height: 80vh;
          position: relative; cursor: move;
        }
        .leftline-modal-img {
          display: block; transform-origin: center;
          transition: transform 0.2s;
        }
        .leftline-modal-img.grabbing { cursor: grabbing; }
        .leftline-modal-caption {
          color: white; text-align: center;
          padding: 10px 20px; font-size: 14px;
          max-width: 80%; margin-top: 10px;
        }
      `;
      
      if (!document.querySelector('style[data-leftline-modal]')) {
        var modalStyle = document.createElement('style');
        modalStyle.setAttribute('data-leftline-modal', 'true');
        modalStyle.appendChild(document.createTextNode(modalCSS));
        document.head.appendChild(modalStyle);
      }
      
      // Setup event handlers
      var modalImg = modal.querySelector('.leftline-modal-img');
      var imgContainer = modal.querySelector('.leftline-modal-img-container');
      
      // Zoom controls
      modal.querySelector('[data-zoom="in"]').onclick = function() {
        zoomLevel = Math.min(zoomLevel * 1.25, 5);
        updateZoom();
      };
      
      modal.querySelector('[data-zoom="out"]').onclick = function() {
        zoomLevel = Math.max(zoomLevel / 1.25, 0.5);
        updateZoom();
      };
      
      modal.querySelector('[data-zoom="reset"]').onclick = function() {
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
      };
      
      function updateZoom() {
        modalImg.style.transform = 'scale(' + zoomLevel + ') translate(' + translateX + 'px, ' + translateY + 'px)';
        modal.querySelector('.leftline-zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
      }
      
      // Pan functionality
      modalImg.addEventListener('mousedown', function(e) {
        if (zoomLevel > 1) {
          isPanning = true;
          startX = e.clientX - translateX * zoomLevel;
          startY = e.clientY - translateY * zoomLevel;
          modalImg.classList.add('grabbing');
          e.preventDefault();
        }
      });
      
      document.addEventListener('mousemove', function(e) {
        if (isPanning) {
          translateX = (e.clientX - startX) / zoomLevel;
          translateY = (e.clientY - startY) / zoomLevel;
          updateZoom();
        }
      });
      
      document.addEventListener('mouseup', function() {
        isPanning = false;
        modalImg.classList.remove('grabbing');
      });
      
      // Mouse wheel zoom
      imgContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomLevel = Math.min(Math.max(zoomLevel * delta, 0.5), 5);
        updateZoom();
      });
      
      // Close handlers
      modal.querySelector('.leftline-modal-close').onclick = closeModal;
      modal.onclick = function(e) {
        if (e.target === modal) closeModal();
      };
      
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
          closeModal();
        }
      });
    }
    
    // Reset and show
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    modal.querySelector('.leftline-modal-img').src = src;
    modal.querySelector('.leftline-modal-caption').textContent = caption || '';
    modal.querySelector('.leftline-zoom-level').textContent = '100%';
    modal.style.display = 'block';
  }
  
  function closeModal() {
    if (modal) modal.style.display = 'none';
  }
  
  // Make modal function available globally IMMEDIATELY
  window.openImageModal = openImageModal;
  
  // ---------- Public API ----------
  window.Leftline = { mount, mountAll, parseOptions };

  // ---------- Auto-mount ----------
  onReady(function(){ 
    // Ensure modal is available before mounting
    if (!window.openImageModal) {
      window.openImageModal = openImageModal;
    }
    mountAll(document); 
  });

  function mountAll(scope){
    uniq([
      ...scope.querySelectorAll('.leftline-carousel'),
      ...scope.querySelectorAll('[data-carousel="leftline"]')
    ]).forEach(mount);
  }

  // ---------- Core ----------
  function mount(host, opts){
    if (!host || host.__leftline) return host;
    var imgs = Array.from(host.querySelectorAll('img')); if (!imgs.length) return host;

    var o = Object.assign({}, DEF, parseOptions(host), (opts||{}));
    host.__leftline = { options:o };

    host.classList.add('leftline');
    host.style.setProperty('--ll-height', (o.height|0)+'px');
    host.style.setProperty('--ll-bg', o.bg || DEF.bg);
    if (isNum(o.gap)) host.style.setProperty('--ll-gap', o.gap+'px');
    if (isNum(o.animationMs)) host.style.setProperty('--ll-anim-ms', o.animationMs+'ms');
    if (o.ease) host.style.setProperty('--ll-ease', o.ease);

    var viewport = el('div','leftline-viewport');
    var track    = el('ul','leftline-track',{role:'list'});
    // Force horizontal layout with inline styles
    track.style.display = 'flex';
    track.style.flexDirection = 'row';
    track.style.flexWrap = 'nowrap';
    var overlay  = buildOverlay();
    var dots     = o.dots ? buildDots() : null;

    // Items (figure + caption)
    var items = imgs.map(function(img){
      var li  = el('li','leftline-item');
      var fig = el('figure','leftline-figure');
      var med = el('div','leftline-media');
      var c   = img.cloneNode(true);
      c.setAttribute('draggable','false');
      c.decoding = c.decoding || 'async';
      c.loading  = c.loading  || 'lazy';
      c.style.objectFit = o.fit === 'cover' ? 'cover' : 'contain';
      c.style.cursor = 'pointer';
      med.appendChild(c);
      
      // Add click handler for modal - function to handle clicks
      var isDragging = false;
      var startPos = null;
      
      var handleImageClick = function(e) {
        // Don't open modal if we were dragging
        if (isDragging) {
          isDragging = false;
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        // Try to get full-size image from data attribute first, fallback to src
        // Check both cloned element and original for data-full-src
        var imgSrc = c.getAttribute('data-full-src') || img.getAttribute('data-full-src') || img.getAttribute('src') || c.src;
        var caption = c.getAttribute('data-caption') || img.getAttribute('data-caption') || img.getAttribute('alt') || c.getAttribute('alt') || '';
        console.log('Image clicked - Full src:', imgSrc, 'Has data-full-src:', !!c.getAttribute('data-full-src'));
        // Use the global function
        if (window.openImageModal) {
          window.openImageModal(imgSrc, caption);
        } else {
          console.error('openImageModal function not found!');
        }
      };
      
      // Track drag to prevent false clicks
      var handlePointerDown = function(e) {
        startPos = { x: e.clientX, y: e.clientY };
        isDragging = false;
      };
      
      var handlePointerMove = function(e) {
        if (startPos) {
          var dx = Math.abs(e.clientX - startPos.x);
          var dy = Math.abs(e.clientY - startPos.y);
          if (dx > 5 || dy > 5) {
            isDragging = true;
          }
        }
      };
      
      var handlePointerUp = function(e) {
        if (!isDragging) {
          handleImageClick(e);
        }
        startPos = null;
        isDragging = false;
      };
      
      // Add both click and pointer handlers for better touch support
      c.addEventListener('click', handleImageClick);
      med.addEventListener('click', handleImageClick);
      
      // Add pointer events for better touch handling
      med.addEventListener('pointerdown', handlePointerDown);
      med.addEventListener('pointermove', handlePointerMove);
      med.addEventListener('pointerup', handlePointerUp);
      c.addEventListener('pointerdown', handlePointerDown);
      c.addEventListener('pointermove', handlePointerMove);
      c.addEventListener('pointerup', handlePointerUp);
      
      med.style.cursor = 'pointer';  // Make media container clickable
      
      var cap = el('figcaption','leftline-caption'); cap.textContent = img.getAttribute('data-caption') || img.getAttribute('alt') || '';
      fig.appendChild(med); fig.appendChild(cap); li.appendChild(fig);
      return { li, img: c };
    });

    // Hide originals (noscript fallback remains)
    imgs.forEach(function(img){ var f=img.closest('figure'); (f||img).style.display='none'; });

    items.forEach(function(it){ track.appendChild(it.li); });
    viewport.appendChild(track);
    host.appendChild(viewport);
    host.appendChild(overlay.wrap);
    if (dots) host.appendChild(dots.wrap);

    // State
    var st = { index:0, total:items.length, perView:1, pageCount:1, animating:false };

    // Measure & set widths based on natural ratios
    // First pass: determine the common height that fits all images
    function determineCommonHeight() {
      var minHeight = 250; // Start with max desired height
      var containerWidth = host.offsetWidth || window.innerWidth;
      var maxAllowedWidth = containerWidth * 0.9; // Max 90% of container for widest image
      
      items.forEach(function(it) {
        var img = it.img;
        var nw = img.naturalWidth, nh = img.naturalHeight;
        if (nw && nh) {
          var ratio = nw/nh;
          // Check what height would be needed if this image took max width
          var heightForMaxWidth = maxAllowedWidth / ratio;
          // If this image would need a smaller height to fit, use that
          if (heightForMaxWidth < minHeight) {
            minHeight = heightForMaxWidth;
          }
        }
      });
      
      return Math.min(Math.round(minHeight), 250);
    }
    
    var commonHeight = determineCommonHeight();
    
    function sizeItem(it){
      var H = commonHeight;  // Use the common height for ALL images
      var w = 0;
      var i = it.img;
      var nw = i.naturalWidth, nh = i.naturalHeight;
      
      if (nw && nh){
        var ratio = nw/nh;
        // Calculate width based on common height and aspect ratio
        w = Math.round(H * ratio);
        
        // Minimum width for very narrow images
        w = Math.max(w, Math.round(H * 0.5));  // Min 50% of height
      } else {
        // Fallback: treat 4:3 as default
        w = Math.round(H * 4/3);
      }
      
      it.li.style.width = w + 'px';
      it.li.style.display = 'inline-block';  // Force horizontal display
      it.li.style.verticalAlign = 'top';
      
      // Set media container height using common height
      var media = it.li.querySelector('.leftline-media');
      media.style.height = H + 'px';
      media.style.width = w + 'px';
      
      // Ensure image fills container while maintaining aspect ratio
      var img = media.querySelector('img');
      if (img) {
        img.style.height = '100%';
        img.style.width = '100%';
        img.style.objectFit = 'contain';  // Maintain aspect ratio
        img.style.objectPosition = 'center';
      }
    }

    // Initial measurement (after images load if needed)
    var loadedCount = 0;
    items.forEach(function(it){
      if (it.img.complete && it.img.naturalWidth) {
        sizeItem(it);
      } else {
        it.img.addEventListener('load', function(){ sizeItem(it); computePerView(); update(false); }, {once:true});
        it.img.addEventListener('error', function(){ sizeItem(it); computePerView(); update(false); }, {once:true});
      }
    });

    // Controls
    overlay.prev.addEventListener('click', prev);
    overlay.next.addEventListener('click', next);

    if (o.keys){
      host.tabIndex = 0;
      host.addEventListener('keydown', function(e){
        if (e.key==='ArrowRight'){ e.preventDefault(); next(); }
        if (e.key==='ArrowLeft'){  e.preventDefault(); prev(); }
        if (e.key==='Home'){ e.preventDefault(); goTo(0); }
        if (e.key==='End'){  e.preventDefault(); goTo(st.total-1); }
      });
    }
    if (o.wheel){
      var wlock=0;
      host.addEventListener('wheel', function(e){
        var overflow = st.total > st.perView; if (!overflow) return;
        e.preventDefault();
        var now=performance.now(); if (now - wlock < 250) return; wlock = now;
        (e.deltaY>0 || e.deltaX>0) ? next() : prev();
      }, {passive:false});
    }
    if (o.drag){
      var dragging=false, startX=0, acc=0, TH=60;
      host.addEventListener('pointerdown', function(e){ dragging=true; startX=e.clientX; acc=0; try{host.setPointerCapture(e.pointerId)}catch(_){}})
      window.addEventListener('pointermove', function(e){
        if(!dragging) return;
        var dx=e.clientX-startX;
        if(Math.abs(dx-acc)>TH){ (dx<acc)?next():prev(); acc=dx; }
      });
      window.addEventListener('pointerup', ()=>dragging=false);
      window.addEventListener('pointercancel', ()=>dragging=false);
    }

    // Autoplay
    var timer=null;
    function startAuto(){ if(!o.autoplay || st.total<=st.perView) return; stopAuto(); timer=setInterval(next,o.interval); }
    function stopAuto(){ if(timer){clearInterval(timer); timer=null;} }
    host.addEventListener('mouseenter', stopAuto);
    host.addEventListener('mouseleave', startAuto);

    // Resize: recompute perView based on real item widths
    var ro = new ResizeObserver(function(){ computePerView(); });
    ro.observe(host);

    // Function to update controls visibility based on whether scrolling is needed
    function updateControlsVisibility() {
      var needsControls = st.total > st.perView;
      if (overlay.wrap) {
        overlay.wrap.style.display = needsControls ? '' : 'none';
      }
      if (dots && dots.wrap) {
        dots.wrap.style.display = needsControls ? '' : 'none';
      }
    }

    // Compute how many items fit (variable widths)
    function computePerView(){
      // ensure every item has a width; if not, size now with current height
      items.forEach(function(it){
        if (!it.li.style.width) sizeItem(it);
      });
      var space = host.clientWidth;
      var g = gapPx();
      var count = 0, used = 0;
      for (var i=0;i<items.length;i++){
        var w = items[i].li.getBoundingClientRect().width;
        var nextUsed = used + (count>0 ? g : 0) + w;
        if (nextUsed <= space) {
          used = nextUsed; count++;
        } else { break; }
      }
      st.perView = Math.max(1, count || 1);
      st.pageCount = Math.max(1, Math.ceil(st.total / st.perView));
      if (dots) renderDots(dots.wrap, st.pageCount);
      // keep index valid
      st.index = normIndex(st.index);
      applyOrder(st.index);
      updateControlsVisibility();
      startAuto();
    }

    // Helpers for variable-width slide distances
    function gapPx(){ return parseFloat(getComputedStyle(host).getPropertyValue('--ll-gap'))||16; }
    function widthOfRange(start, count){
      var g = gapPx(), sum = 0;
      for (var k=0;k<count;k++){
        var i = (start + k) % items.length;
        sum += items[i].li.getBoundingClientRect().width;
        if (k < count-1) sum += g;
      }
      return sum;
    }

    function stepCount(){ return (DEF.slideBy==='item' ? 1 : st.perView); } // slideBy resolved below

    // Because slideBy can be set via data-attr:
    function currentStep(){ return (o.slideBy==='item') ? 1 : st.perView; }

    function normIndex(i){
      return o.wrap
        ? ((i%st.total)+st.total)%st.total
        : Math.max(0, Math.min(i, Math.max(0, st.total - st.perView)));
    }

    function applyOrder(start){
      var n = st.total;
      for (var i=0;i<n;i++){
        var order = (i - start); if (order < 0) order += n;
        items[i].li.style.order = String(order);
      }
      updateDots();
    }

    // Smooth slide with variable distances
    function slideTo(newIndex, dir){
      if (st.animating) return;
      st.animating = true;

      var s = currentStep();
      var delta = 0;
      if (dir==='next'){
        // width of the page we're moving past (starting from current index)
        delta = widthOfRange(st.index, s);
        // After reordering to newIndex, start translated +delta then animate to 0
        applyOrder(newIndex);
        track.style.transition='none';
        track.style.transform='translateX(' + (-delta) + 'px)'; // content shifted left by old-page width
        void track.offsetWidth;
        track.style.transition='transform var(--ll-anim-ms) var(--ll-ease)';
        track.style.transform='translateX(0)';
      } else {
        // moving to previous page: width of the page now *before* newIndex
        delta = widthOfRange(newIndex, s);
        applyOrder(newIndex);
        track.style.transition='none';
        track.style.transform='translateX(' + (delta) + 'px)'; // start shifted right
        void track.offsetWidth;
        track.style.transition='transform var(--ll-anim-ms) var(--ll-ease)';
        track.style.transform='translateX(0)';
      }

      track.addEventListener('transitionend', function done(){
        track.removeEventListener('transitionend', done);
        st.index = newIndex;
        st.animating = false;
      }, {once:true});
    }

    function next(){
      if (st.total <= st.perView) return;
      var s = currentStep();
      var target = normIndex(st.index + s);
      slideTo(target,'next'); startAuto();
    }
    function prev(){
      if (st.total <= st.perView) return;
      var s = currentStep();
      var target = normIndex(st.index - s);
      slideTo(target,'prev'); startAuto();
    }
    function goTo(i){
      var target = normIndex(i);
      if (target === st.index) return;
      // pick direction by distance around ring
      var forward = ((target - st.index + st.total) % st.total) <= (st.total/2);
      slideTo(target, forward ? 'next' : 'prev'); startAuto();
    }

    function goToPage(p){
      p = clamp(p|0, 0, st.pageCount-1);
      goTo(p * st.perView);
    }

    function updateDots(){
      if (!dots) return;
      var activePage = Math.floor(st.index / st.perView);
      Array.from(dots.wrap.querySelectorAll('.leftline-dot')).forEach(function(b,i){
        b.setAttribute('aria-current', i===activePage ? 'true' : 'false');
      });
    }

    // Init
    // Ensure widths exist even if images are cached-not-complete
    items.forEach(sizeItem);
    computePerView();
    startAuto();

    // API
    host.leftline = {
      next, prev, goTo,
      update: function(){ items.forEach(sizeItem); computePerView(); },
      destroy: function(){
        stopAuto(); ro.disconnect();
        if (host.contains(viewport)) host.removeChild(viewport);
        if (host.contains(overlay.wrap)) host.removeChild(overlay.wrap);
        if (dots && host.contains(dots.wrap)) host.removeChild(dots.wrap);
        imgs.forEach(function(img){ var f=img.closest('figure'); (f||img).style.display=''; });
        host.classList.remove('leftline'); delete host.leftline; delete host.__leftline;
      },
      getState: function(){ return { index:st.index,total:st.total,perView:st.perView,pageCount:st.pageCount,height:o.height,fit:o.fit }; }
    };

    return host;
  }

  // ---------- UI builders ----------
  function buildOverlay(){
    var wrap = el('div','leftline-overlay');
    var edge = el('div','leftline-edgefade'); wrap.appendChild(edge);
    var arrows = el('div','leftline-arrows');
    var mk = function(dir){
      var b = el('button','leftline-btn',{type:'button','aria-label': dir==='prev'?'Previous':'Next'});
      b.innerHTML = dir==='prev'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return b;
    };
    var prev = mk('prev'), next = mk('next');
    arrows.appendChild(prev); arrows.appendChild(next);
    wrap.appendChild(arrows);
    wrap.prev = prev; wrap.next = next;
    return { wrap, prev, next };
  }

  function buildDots(){
    var wrap = el('div','leftline-dots'); return { wrap };
  }
  function renderDots(wrap,count){
    wrap.innerHTML = '';
    for (var i=0;i<count;i++){
      wrap.appendChild(el('button','leftline-dot',{type:'button','data-page':String(i),'aria-label':'Go to page '+(i+1)}));
    }
  }

  // ---------- Options & utils ----------
  function parseOptions(elm){
    var o = {};
    num(elm,'height',v=>o.height=v);
    str(elm,'fit',v=>o.fit=v==='cover'?'cover':'contain');
    str(elm,'bg',v=>o.bg=v);
    num(elm,'gap',v=>o.gap=v);
    bool(elm,'dynamic-width',v=>o.dynamicWidth=v);
    bool(elm,'wrap',v=>o.wrap=v);
    enm(elm,'slide-by',['page','item'],v=>o.slideBy=v);
    bool(elm,'arrows',v=>o.arrows=v);
    bool(elm,'dots',v=>o.dots=v);
    bool(elm,'wheel',v=>o.wheel=v);
    bool(elm,'drag',v=>o.drag=v);
    bool(elm,'keys',v=>o.keys=v);
    bool(elm,'autoplay',v=>o.autoplay=v);
    num(elm,'interval',v=>o.interval=v);
    num(elm,'animation-ms',v=>o.animationMs=v);
    str(elm,'ease',v=>o.ease=v);
    var pv = elm.getAttribute('data-per-view'); if (pv){ try{o.perView = JSON.parse(pv);}catch(_){} }
    return o;
  }

  function el(tag,cls,attrs){ var n=document.createElement(tag); if(cls) n.className=cls; if(attrs) for(var k in attrs) n.setAttribute(k,attrs[k]); return n; }
  function uniq(arr){ return arr.filter((x,i,a)=>a.indexOf(x)===i); }
  function onReady(fn){ (document.readyState==='loading')?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn(); }
  function isNum(x){ return typeof x==='number' && isFinite(x); }
  function num(el,name,cb){ var v=el.getAttribute('data-'+name); if(v==null) return; var n=+v; if(isFinite(n)) cb(n); }
  function str(el,name,cb){ var v=el.getAttribute('data-'+name); if(v==null) return; cb(v); }
  function bool(el,name,cb){ var v=el.getAttribute('data-'+name); if(v==null) return; cb(v==='true'||v===''||v==='1'); }
  function enm(el,name,list,cb){ var v=el.getAttribute('data-'+name); if(v==null) return; if(list.indexOf(v)>=0) cb(v); }
  function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }
})();