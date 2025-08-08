// Orbit carousel progressive enhancement
// Auto-upgrades:
// 1) Explicit: [data-carousel="orbit"]
// 2) Implicit: .carousel (common class used in galleries)
(() => {
  const explicit = Array.from(document.querySelectorAll('[data-carousel="orbit"]'));
  const implicit = Array.from(document.querySelectorAll('.carousel')).filter(el => !explicit.includes(el));
  const groups = [...explicit, ...implicit];
  if (!groups.length) return;

  for (const group of groups) enhance(group);

  function enhance(group) {
    // Prevent double-enhance
    if (group.dataset.orbitEnhanced === "true") return;

    // collect images
    // Only consider immediate or descendant <img> elements that are visible by default
    const imgs = Array.from(group.querySelectorAll('img')).filter(img => !img.closest('.orbit'));
    if (imgs.length === 0) return;

    // mark as enhanced
    group.dataset.orbitEnhanced = "true";

    // build orbit DOM
    const orbit = document.createElement('div');
    orbit.className = 'orbit';
    const center = document.createElement('div');
    center.className = 'orbit-center';
    center.setAttribute('role', 'region');
    center.setAttribute('aria-label', 'Image carousel');

    // controls (optional)
    const nav = document.createElement('div');
    nav.className = 'orbit-nav';
    nav.innerHTML = `
      <button type="button" class="orbit-prev" aria-label="Previous image">‹</button>
      <button type="button" class="orbit-next" aria-label="Next image">›</button>
      <button type="button" class="orbit-toggle" aria-label="Toggle animation">⏯</button>
    `;

    // move/copy images into orbit
    const step = 360 / imgs.length;
    imgs.forEach((img, i) => {
      const node = img.cloneNode(true);
      node.classList.add('orbit-item');
      node.decoding = node.decoding || 'async';
      node.loading = node.loading || 'lazy';
      node.style.setProperty('--angle', (i * step) + 'deg');
      center.appendChild(node);
    });

    // replace original content
    // Keep original children for noscript fallback, but hide via CSS
    group.appendChild(orbit);
    orbit.appendChild(center);
    orbit.appendChild(nav);

    // set up radius calculation
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0] || entry.contentBoxSize || entry.contentRect;
      const w = (box.inlineSize ?? box.width);
      const sample = center.querySelector('.orbit-item');
      const itemW = sample ? sample.getBoundingClientRect().width : 120;
      const r = Math.max(70, (w/2) - (itemW/2) - 8);
      center.style.setProperty('--r', r + 'px');
    });
    ro.observe(orbit);

    // animation controls
    center.classList.add('is-animating');

    const nudge = (delta) => {
      const curr = getComputedStyle(center).getPropertyValue('--angle').trim() || '0deg';
      const num = parseFloat(curr);
      center.style.setProperty('--angle', (num + delta) + 'deg');
    };

    nav.querySelector('.orbit-next')?.addEventListener('click', () => nudge(-step));
    nav.querySelector('.orbit-prev')?.addEventListener('click', () => nudge(step));
    nav.querySelector('.orbit-toggle')?.addEventListener('click', () => {
      center.classList.toggle('is-animating');
    });

    // keyboard support
    orbit.tabIndex = 0;
    orbit.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nudge(-step); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { nudge(step);  e.preventDefault(); }
      if (e.key.toLowerCase() === ' ') {
        center.classList.toggle('is-animating');
        e.preventDefault();
      }
    });
  }
})();