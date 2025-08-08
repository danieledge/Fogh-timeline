/* leftline.carousel.bundle.js  v1.3-ZOOM
   Left-aligned, fixed-gap carousel with *fixed height* images
   and aspect-ratio–aware widths. Vanilla JS, single file.
   
   VERSION: 1.3-ZOOM (with modal zoom feature)

   New in v1.3:
   - data-height (default 300) fixes image height uniformly
   - data-fit: 'contain' (default) or 'cover'
   - data-bg: letterbox/pillarbox background
   - data-dynamic-width: true (default) sets each item width from natural ratio
     (portrait images become narrower, landscape wider) while keeping captions
     neatly underneath.
*/

(function LeftlineBundle(){
  console.log('Leftline carousel bundle loading...');
  // ---------- CSS ----------
  var CSS = `
.leftline{position:relative;width:100%;
  --ll-gap:16px;--ll-height:250px;--ll-radius:8px;
  --ll-shadow:0 4px 16px rgba(0,0,0,.15);
  --ll-caption-fs:.92rem;--ll-caption-lh:1.3;
  --ll-anim-ms:420ms;--ll-ease:cubic-bezier(.22,.61,.36,1);
  --ll-bg:transparent
}
.leftline-viewport{overflow:hidden;padding:10px 0}
.leftline-track{
  display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:var(--ll-gap);
  align-items:flex-start;justify-content:flex-start;
  transform:translateX(0);transition:transform var(--ll-anim-ms) var(--ll-ease);
  will-change:transform;padding:0;margin:0;list-style:none
}
.leftline-item{flex:0 0 auto;display:block !important;box-sizing:border-box}
.leftline-figure{display:flex;flex-direction:column;gap:8px}
.leftline-media{
  height:var(--ll-height);width:100%;overflow:hidden;border-radius:var(--ll-radius);
  box-shadow:var(--ll-shadow);background:var(--ll-bg);display:block;
  box-sizing:border-box
}
.leftline-media>img{
  width:100%;height:100%;display:block;object-fit:contain;object-position:center
}
.leftline-caption{font-size:var(--ll-caption-fs);line-height:var(--ll-caption-lh)}
/* Overlaid controls */
.leftline-overlay{pointer-events:none;position:absolute;inset:0;display:grid;place-items:center}
.leftline-arrows{pointer-events:auto;position:absolute;inset-inline:0;inset-block:0;display:flex;justify-content:space-between;align-items:center;padding:0 .25rem}
.leftline-btn{
  width:40px;height:40px;border-radius:10px;display:grid;place-items:center;border:1px solid rgba(0,0,0,.25);
  background:rgba(255,255,255,.55);backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.18);
  cursor:pointer;font:inherit;transition:transform .2s ease,opacity .2s ease
}
.leftline-btn:hover{transform:scale(1.05)}
.leftline-btn:active{transform:scale(.97)}
.leftline-btn[disabled]{opacity:.45;cursor:default}
.leftline-btn svg{width:18px;height:18px;display:block}
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
    height:300,              // px max height for images
    fit:'contain',           // 'contain' | 'cover'
    bg:'transparent',        // letterbox background
    gap:null,                // px; if null uses CSS var
    dynamicWidth:true,       // per-image width from natural ratio
    wrap:true, slideBy:'page',
    arrows:true, dots:false, wheel:true, drag:true, keys:true,
    autoplay:false, interval:5000,
    animationMs:null, ease:null,
    perView:{"0":1,"640":2,"960":3}
  };

  // ---------- Public API ----------
  // Modal functionality
  var modal = null;
  var zoomLevel = 1;
  var isPanning = false;
  var startX = 0, startY = 0;
  var translateX = 0, translateY = 0;
  
  function openModal(src, caption) {
    if (!modal) {
      // Create modal structure with zoom controls
      modal = document.createElement('div');
      modal.className = 'leftline-modal';
      modal.innerHTML = `
        <div class="leftline-modal-content">
          <span class="leftline-modal-close">&times;</span>
          <div class="leftline-modal-zoom-controls">
            <button class="leftline-zoom-in">+</button>
            <button class="leftline-zoom-out">-</button>
            <button class="leftline-zoom-reset">Reset</button>
            <span class="leftline-zoom-level">100%</span>
          </div>
          <div class="leftline-modal-img-container">
            <img class="leftline-modal-img">
          </div>
          <div class="leftline-modal-caption"></div>
        </div>`;
      document.body.appendChild(modal);
      
      // Add modal styles if not already added
      if (!document.querySelector('style[data-leftline-modal]')) {
        var modalCSS = `
          .leftline-modal {
            display: none; position: fixed; z-index: 9999; left: 0; top: 0;
            width: 100%; height: 100%; background-color: rgba(0,0,0,0.9);
          }
          .leftline-modal-content {
            position: relative; margin: auto; padding: 20px;
            max-width: 90%; max-height: 90vh; display: flex;
            flex-direction: column; align-items: center;
            justify-content: center; height: 100%;
          }
          .leftline-modal-img-container {
            position: relative; overflow: auto;
            max-width: 100%; max-height: 75vh;
            border: 1px solid #333;
          }
          .leftline-modal-img {
            max-width: 100%; height: auto; display: block;
            transform-origin: center center;
            transition: transform 0.2s ease;
            cursor: grab;
          }
          .leftline-modal-img.panning {
            cursor: grabbing;
            transition: none;
          }
          .leftline-modal-caption {
            color: white; text-align: center; padding: 10px;
            font-size: 1.1em;
          }
          .leftline-modal-close {
            position: absolute; top: 15px; right: 35px;
            color: #f1f1f1; font-size: 40px; font-weight: bold;
            cursor: pointer; z-index: 10000;
          }
          .leftline-modal-close:hover { color: #fff; }
          .leftline-modal-zoom-controls {
            position: absolute; top: 20px; left: 20px;
            z-index: 10001; display: flex; gap: 10px;
            align-items: center;
          }
          .leftline-modal-zoom-controls button {
            padding: 5px 10px; font-size: 18px;
            background: rgba(255,255,255,0.1);
            color: white; border: 1px solid #666;
            cursor: pointer; border-radius: 4px;
          }
          .leftline-modal-zoom-controls button:hover {
            background: rgba(255,255,255,0.2);
          }
          .leftline-zoom-level {
            color: white; padding: 0 10px;
            min-width: 60px; text-align: center;
          }
        `;
        var modalStyle = document.createElement('style');
        modalStyle.setAttribute('data-leftline-modal', 'true');
        modalStyle.appendChild(document.createTextNode(modalCSS));
        document.head.appendChild(modalStyle);
      }
      
      // Setup zoom controls
      var zoomIn = modal.querySelector('.leftline-zoom-in');
      var zoomOut = modal.querySelector('.leftline-zoom-out');
      var zoomReset = modal.querySelector('.leftline-zoom-reset');
      var zoomDisplay = modal.querySelector('.leftline-zoom-level');
      var modalImg = modal.querySelector('.leftline-modal-img');
      var imgContainer = modal.querySelector('.leftline-modal-img-container');
      
      zoomIn.onclick = function() {
        zoomLevel = Math.min(zoomLevel * 1.25, 5);
        updateZoom();
      };
      
      zoomOut.onclick = function() {
        zoomLevel = Math.max(zoomLevel / 1.25, 0.5);
        updateZoom();
      };
      
      zoomReset.onclick = function() {
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        updateZoom();
      };
      
      function updateZoom() {
        modalImg.style.transform = 'scale(' + zoomLevel + ') translate(' + translateX + 'px, ' + translateY + 'px)';
        zoomDisplay.textContent = Math.round(zoomLevel * 100) + '%';
      }
      
      // Pan functionality when zoomed
      modalImg.addEventListener('mousedown', function(e) {
        if (zoomLevel > 1) {
          isPanning = true;
          startX = e.clientX - translateX;
          startY = e.clientY - translateY;
          modalImg.classList.add('panning');
          e.preventDefault();
        }
      });
      
      document.addEventListener('mousemove', function(e) {
        if (isPanning) {
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          updateZoom();
        }
      });
      
      document.addEventListener('mouseup', function() {
        if (isPanning) {
          isPanning = false;
          modalImg.classList.remove('panning');
        }
      });
      
      // Mouse wheel zoom
      imgContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomLevel = Math.min(zoomLevel * 1.1, 5);
        } else {
          zoomLevel = Math.max(zoomLevel / 1.1, 0.5);
        }
        updateZoom();
      });
      
      // Close handlers
      modal.querySelector('.leftline-modal-close').onclick = closeModal;
      modal.onclick = function(e) {
        if (e.target === modal) closeModal();
      };
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
      });
    }
    
    // Reset zoom when opening
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
    var modalImg = modal.querySelector('.leftline-modal-img');
    modalImg.style.transform = 'scale(1)';
    modal.querySelector('.leftline-zoom-level').textContent = '100%';
    
    // Show modal with image
    modalImg.src = src;
    modal.querySelector('.leftline-modal-caption').textContent = caption || '';
    modal.style.display = 'block';
  }
  
  function closeModal() {
    if (modal) modal.style.display = 'none';
  }
  
  // Log version on load
  console.log('[LEFTLINE] Script loaded: v1.3-ZOOM (build: ' + new Date().toISOString() + ')');
  console.log('[LEFTLINE] Features: Carousel with zoom modal, pan, mouse wheel zoom');
  
  window.Leftline = { mount, mountAll, parseOptions, version: '1.3-ZOOM' };

  // ---------- Auto-mount ----------
  onReady(function(){ 
    mountAll(document); 
    // Also try after a delay for dynamically created content
    setTimeout(function() { 
      console.log('Delayed carousel mount attempt');
      mountAll(document); 
    }, 1000);
    // And again after more time
    setTimeout(function() { 
      console.log('Second delayed carousel mount attempt');
      mountAll(document); 
    }, 3000);
  });

  function mountAll(scope){
    var carousels = uniq([
      ...scope.querySelectorAll('.leftline-carousel'),
      ...scope.querySelectorAll('[data-carousel="leftline"]')
    ]);
    console.log('Found', carousels.length, 'carousel containers to mount');
    carousels.forEach(mount);
  }

  // ---------- Core ----------
  function mount(host, opts){
    if (!host || host.__leftline) return host;
    var imgs = Array.from(host.querySelectorAll('img')); 
    console.log('[LEFTLINE v1.3-ZOOM] Mounting carousel with', imgs.length, 'images');
    console.log('[LEFTLINE] Script version: 1.3-ZOOM with modal zoom feature');
    console.log('[LEFTLINE] Zoom feature:', typeof openModal === 'function' ? 'ENABLED' : 'MISSING');
    if (!imgs.length) return host;

    var o = Object.assign({}, DEF, parseOptions(host), (opts||{}));
    host.__leftline = { options:o };

    host.classList.add('leftline');
    host.style.setProperty('--ll-height', (o.height|0)+'px');
    host.style.setProperty('--ll-bg', o.bg || DEF.bg);
    if (isNum(o.gap)) host.style.setProperty('--ll-gap', o.gap+'px');
    if (isNum(o.animationMs)) host.style.setProperty('--ll-anim-ms', o.animationMs+'ms');
    if (o.ease) host.style.setProperty('--ll-ease', o.ease);

    var viewport = el('div','leftline-viewport');
    // Ensure viewport doesn't constrain horizontal layout
    viewport.style.overflow = 'hidden';
    viewport.style.width = '100%';
    var track    = el('ul','leftline-track',{role:'list'});
    // Force horizontal layout with comprehensive inline styles
    track.style.display = 'flex';
    track.style.flexWrap = 'nowrap';
    track.style.flexDirection = 'row';
    track.style.alignItems = 'flex-start';
    track.style.justifyContent = 'flex-start';
    track.style.gap = (o.gap || 16) + 'px';
    track.style.padding = '0';
    track.style.margin = '0';
    track.style.listStyle = 'none';
    track.style.transform = 'translateX(0)';
    track.style.transition = 'transform ' + (o.animationMs || 420) + 'ms ' + (o.ease || 'cubic-bezier(.22,.61,.36,1)');
    var overlay  = buildOverlay();
    var dots     = o.dots ? buildDots() : null;

    // Items (figure + caption)
    var items = imgs.map(function(img){
      var li  = el('li','leftline-item');
      // Force list item to be flex item
      li.style.flex = '0 0 auto';
      li.style.display = 'block';
      var fig = el('figure','leftline-figure');
      var med = el('div','leftline-media');
      var c   = img.cloneNode(true);
      c.setAttribute('draggable','false');
      c.decoding = c.decoding || 'async';
      c.loading  = c.loading  || 'lazy';
      c.style.objectFit = o.fit === 'cover' ? 'cover' : 'contain';
      c.style.cursor = 'pointer';  // Make image clickable
      med.appendChild(c);
      
      // Add click handler for modal
      c.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var captionText = c.getAttribute('data-caption') || c.getAttribute('alt') || img.getAttribute('data-caption') || img.getAttribute('alt') || '';
        var imageSrc = c.src || c.getAttribute('src') || img.src || img.getAttribute('src');
        openModal(imageSrc, captionText);
      });
      var cap = el('figcaption','leftline-caption'); cap.textContent = img.getAttribute('data-caption') || img.getAttribute('alt') || '';
      fig.appendChild(med); fig.appendChild(cap); li.appendChild(fig);
      return { li, img: c };
    });

    // Hide originals (noscript fallback remains)
    imgs.forEach(function(img){ var f=img.closest('figure'); (f||img).style.display='none'; });

    // Clear the host element completely before adding new structure
    while (host.firstChild) {
        host.removeChild(host.firstChild);
    }

    items.forEach(function(it){ track.appendChild(it.li); });
    viewport.appendChild(track);
    host.appendChild(viewport);
    host.appendChild(overlay.wrap);
    if (dots) host.appendChild(dots.wrap);

    // State
    var st = { index:0, total:items.length, perView:1, pageCount:1, animating:false };

    // Measure & set widths based on natural ratios
    function sizeItem(it){
      var maxH = o.height|0;  // Maximum height
      var H = maxH;  // Actual height to use
      var w = 0;
      var i = it.img;
      var nw = i.naturalWidth, nh = i.naturalHeight;
      
      // Get the container width to limit image size
      var containerWidth = host.offsetWidth || window.innerWidth;
      var maxWidth = Math.min(containerWidth * 0.9, 800); // Max 90% of container or 800px
      
      if (o.dynamicWidth && nw && nh){
        var ratio = nw/nh;
        w = Math.round(H * ratio);
        
        // If width exceeds max, scale down proportionally
        if (w > maxWidth) {
          w = maxWidth;
          H = Math.round(w / ratio);
          // But don't exceed the maximum height
          if (H > maxH) {
            H = maxH;
            w = Math.round(H * ratio);
          }
        }
        
        // Ensure minimum width
        w = Math.max(w, Math.round(H * 4/5));
      } else {
        // Fallback: treat 4:3 as default
        w = Math.round(H * 4/3);
        if (w > maxWidth) {
          w = maxWidth;
          H = Math.round(w * 3/4);
          if (H > maxH) {
            H = maxH;
            w = Math.round(H * 4/3);
          }
        }
      }
      
      it.li.style.width = w + 'px';
      // Use calculated height (may be less than max for wide images)
      var media = it.li.querySelector('.leftline-media');
      media.style.height = H + 'px';
      media.style.width = w + 'px';
      // Also set the image styles directly
      var img = media.querySelector('img');
      if (img) {
        img.style.height = '100%';
        img.style.width = '100%';
        img.style.objectFit = o.fit === 'cover' ? 'cover' : 'contain';
        img.style.objectPosition = 'center';
      }
    }

    // Define update function
    function update(animate) {
      items.forEach(sizeItem);
      computePerView();
      if (animate !== false && updateDots) updateDots();
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
      update: update,
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