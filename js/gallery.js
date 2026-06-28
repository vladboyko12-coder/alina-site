// ── Переиспользуемый лайтбокс + простая галерея (общие для всех страниц) ──
(function () {
  const LB = { el: null, img: null, counter: null, list: [], index: 0, touchX: 0, wired: false };

  function wire() {
    if (LB.wired) return LB.el != null;
    LB.el = document.getElementById('lightbox');
    if (!LB.el) return false;
    LB.img = document.getElementById('lb-img');
    LB.counter = document.getElementById('lb-counter');
    document.getElementById('lb-close')?.addEventListener('click', hide);
    document.getElementById('lb-prev')?.addEventListener('click', () => show(LB.index - 1));
    document.getElementById('lb-next')?.addEventListener('click', () => show(LB.index + 1));
    LB.el.addEventListener('click', (e) => { if (e.target === LB.el) hide(); });
    document.addEventListener('keydown', (e) => {
      if (!LB.el.classList.contains('open')) return;
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(LB.index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(LB.index + 1); }
    });
    LB.el.addEventListener('touchstart', (e) => { LB.touchX = e.touches[0].clientX; }, { passive: true });
    LB.el.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - LB.touchX;
      if (Math.abs(dx) > 50) show(LB.index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    LB.wired = true;
    return true;
  }

  function show(i) {
    const n = LB.list.length;
    if (!n) return;
    LB.index = ((i % n) + n) % n;
    const it = LB.list[LB.index];
    LB.img.src = it.src;
    LB.img.alt = it.alt || '';
    if (LB.counter) LB.counter.textContent = `${LB.index + 1} / ${n}`;
    // Предзагрузка соседей
    [LB.index - 1, LB.index + 1].forEach((k) => {
      const m = LB.list[((k % n) + n) % n];
      if (m) new Image().src = m.src;
    });
  }

  function hide() {
    LB.el.classList.remove('open');
    document.body.style.overflow = '';
    LB.img.src = '';
  }

  // Открыть лайтбокс над списком изображений [{src, alt}], начиная с index
  window.Lightbox = {
    open(images, index) {
      if (!wire() || !images || !images.length) return;
      LB.list = images;
      show(index || 0);
      LB.el.classList.add('open');
      document.body.style.overflow = 'hidden';
      document.getElementById('lb-close')?.focus();
    }
  };

  // Построить простую галерею: плитки-превью в gridEl из items, клик → лайтбокс.
  // opts: { thumbSrc(it)->url для превью, fullSrc(it)->url для лайтбокса }
  window.buildSimpleGallery = function (gridEl, items, opts) {
    if (!gridEl || !items || !items.length) return;
    const thumbSrc = (opts && opts.thumbSrc) || (opts && opts.fullSrc) || ((it) => it.file);
    const fullSrc = (opts && opts.fullSrc) || thumbSrc;
    const full = items.map((it) => ({ src: fullSrc(it), alt: it.alt || '' }));
    items.forEach((it, idx) => {
      const tile = document.createElement('div');
      tile.className = 'portfolio-tile';
      tile.setAttribute('role', 'listitem');
      tile.setAttribute('tabindex', '0');
      const img = document.createElement('img');
      img.src = thumbSrc(it);
      img.alt = it.alt || '';
      img.loading = 'lazy';
      img.width = it.w || 800;
      img.height = it.h || 600;
      tile.appendChild(img);
      tile.addEventListener('click', () => window.Lightbox.open(full, idx));
      tile.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.Lightbox.open(full, idx); });
      gridEl.appendChild(tile);
    });
  };
})();
