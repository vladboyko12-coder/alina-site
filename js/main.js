'use strict';

// ── Константы ──────────────────────────────────────────────
const CAT_LABELS = {
  living:   'Гостиная',
  bedroom:  'Спальня',
  kitchen:  'Кухня',
  bathroom: 'Ванная',
  hallway:  'Прихожая',
  kids:     'Детская',
};

// ── Утилиты ────────────────────────────────────────────────
function getCatLabel(cat) {
  return CAT_LABELS[cat] || cat;
}

// ── Бургер-меню ────────────────────────────────────────────
function initBurger() {
  const burger   = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
}

// ── Шапка: класс scrolled ──────────────────────────────────
function initScrolledHeader() {
  const header = document.querySelector('header.site-nav');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Галерея ────────────────────────────────────────────────
function renderGallery() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const catCounters = {};

  window.WORKS.forEach((work, index) => {
    const cat   = work.cat || 'living';
    const label = getCatLabel(cat);

    catCounters[cat] = (catCounters[cat] || 0) + 1;
    const num = catCounters[cat];

    const w = work.w || 800;
    const h = work.h || 600;

    const tile = document.createElement('div');
    tile.className        = 'portfolio-tile';
    tile.dataset.cat      = cat;
    tile.dataset.index    = index;
    tile.setAttribute('role', 'listitem');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `${label} ${num}`);

    tile.innerHTML = `
      <img
        src="assets/img/thumb/${work.file}"
        alt="${work.alt || 'Дизайн интерьера — ' + label}"
        loading="lazy"
        width="${w}"
        height="${h}"
      >
      <div class="tile-overlay" aria-hidden="true">
        <div class="tile-overlay-inner">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="14" cy="14" r="8"/><path d="M20 20l6 6" stroke-linecap="round"/>
          </svg>
          <span class="tile-cat">${label}</span>
        </div>
      </div>
    `;

    tile.addEventListener('click', () => openLightbox(Number(tile.dataset.index)));

    grid.appendChild(tile);
  });
}

// Сколько работ показывать в «Все» до раскрытия
const GALLERY_LIMIT = 12;
function isMobileGallery() { return window.matchMedia('(max-width: 640px)').matches; }
let currentCat = 'all';
let galleryExpanded = false;

function getMatchedTiles() {
  return [...document.querySelectorAll('.portfolio-tile')]
    .filter(tile => currentCat === 'all' || tile.dataset.cat === currentCat);
}

function updateGalleryView(animate) {
  const allTiles = [...document.querySelectorAll('.portfolio-tile')];
  const matched  = getMatchedTiles();
  const limited  = currentCat === 'all' && !galleryExpanded && !isMobileGallery();
  const visible  = new Set(limited ? matched.slice(0, GALLERY_LIMIT) : matched);

  allTiles.forEach(tile => {
    const shouldShow = visible.has(tile);
    const isShown    = tile.style.display !== 'none';

    if (shouldShow && !isShown) {
      tile.style.display = 'block';
      if (animate && typeof gsap !== 'undefined') {
        gsap.fromTo(
          tile,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    } else if (!shouldShow && isShown) {
      if (animate && typeof gsap !== 'undefined') {
        gsap.to(tile, {
          opacity: 0,
          scale: 0.96,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => { tile.style.display = 'none'; },
        });
      } else {
        tile.style.display = 'none';
      }
    }
  });

  updateGalleryToggle(matched.length);
}

function updateGalleryToggle(matchedCount) {
  const wrap   = document.querySelector('.portfolio-more');
  const toggle = document.getElementById('gallery-toggle');
  if (!wrap || !toggle) return;

  if (currentCat === 'all' && !isMobileGallery() && matchedCount > GALLERY_LIMIT) {
    wrap.classList.remove('is-hidden');
    toggle.textContent = galleryExpanded
      ? 'Свернуть'
      : `Показать все работы (${matchedCount})`;
    toggle.setAttribute('aria-expanded', String(galleryExpanded));
  } else {
    wrap.classList.add('is-hidden');
  }
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      galleryExpanded = false;
      updateGalleryView(true);
    });
  });
}

function initGalleryToggle() {
  const toggle = document.getElementById('gallery-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    galleryExpanded = !galleryExpanded;
    updateGalleryView(true);
    if (!galleryExpanded) {
      document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ── Клавиатурная навигация по тайлам ──────────────────────
function initKeyboardNav() {
  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    // только плитки главной сетки; тизеры обрабатывают Enter сами (js/gallery.js)
    if (e.key === 'Enter' && el?.classList.contains('portfolio-tile') && el.closest('#portfolio-grid')) {
      el.click();
    }
  });
}

// ── Лайтбокс (делегирует общему модулю js/gallery.js) ──────
function openLightbox(index) {
  const images = window.WORKS.map((w, i) => ({
    src: `assets/img/full/${w.file}`,
    alt: w.alt || `Дизайн интерьера — работа ${i + 1}`,
  }));
  window.Lightbox.open(images, index);
}

// ── Инициализация ──────────────────────────────────────────
function init() {
  initBurger();
  initScrolledHeader();
  if (window.WORKS) renderGallery();
  initFilters();
  initGalleryToggle();
  updateGalleryView(false);
  window.matchMedia('(max-width: 640px)').addEventListener('change', () => {
    galleryExpanded = false;
    updateGalleryView(false);
  });
  initKeyboardNav();
  initAnimations();

  if (window.REAL_WORKS && window.buildSimpleGallery) {
    buildSimpleGallery(document.getElementById('real-teaser-grid'),
      window.REAL_WORKS.slice(0, 8),
      { thumbSrc: it => `assets/img/real/thumb/${it.file}`,
        fullSrc:  it => `assets/img/real/full/${it.file}` });
  }
  if (window.DRAWINGS && window.buildSimpleGallery) {
    buildSimpleGallery(document.getElementById('draw-teaser-grid'),
      window.DRAWINGS.slice(0, 3),
      { thumbSrc: it => `assets/drawings/img/${it.file}`,
        fullSrc:  it => `assets/drawings/img/${it.file}` });
  }
}

// ── Анимации GSAP ──────────────────────────────────────────
function initAnimations() {
  // Guard: если GSAP не загружен или пользователь предпочитает без анимаций — выходим
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Регистрируем ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Hero: каскадное появление ──
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const heroEls = heroContent.querySelectorAll('.eyebrow, .hero-title, .hero-sub, .hero-btns');
    gsap.fromTo(
      heroEls,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      }
    );
  }

  // ── Hero: parallax фона при скролле ──
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg && typeof ScrollTrigger !== 'undefined') {
    gsap.to(heroBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ── Хелпер: reveal при скролле (снизу + прозрачность) ──
  function scrollReveal(selector, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: options.y ?? 40 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.9,
        ease: options.ease ?? 'power3.out',
        stagger: options.stagger ?? 0.1,
        scrollTrigger: {
          trigger: options.trigger ?? els[0],
          start: 'top 82%',
          once: true,
        },
      }
    );
  }

  // ── Секция: Портфолио — заголовок и фильтры ──
  scrollReveal('#portfolio .eyebrow, #portfolio h2, #portfolio .section-lead', {
    trigger: '#portfolio',
    stagger: 0.08,
  });
  scrollReveal('.portfolio-filters', { trigger: '#portfolio', y: 20, delay: 0.3 });

  // ── Секция: Пакеты / Стоимость ──
  scrollReveal('#services .eyebrow, #services h2, #services .section-lead', {
    trigger: '#services',
    stagger: 0.08,
  });
  scrollReveal('.discount-strip', { trigger: '#services', y: 20 });
  scrollReveal('.price-card', {
    trigger: '.pricing-grid',
    stagger: 0.12,
    y: 30,
  });
  scrollReveal('.pricing-conditions, .drawings', {
    trigger: '.pricing-conditions',
    stagger: 0.1,
    y: 20,
  });

  // ── Секция: Этапы работы ──
  scrollReveal('#process .eyebrow, #process h2', {
    trigger: '#process',
    stagger: 0.08,
  });
  scrollReveal('.process-step', {
    trigger: '#process',
    stagger: 0.14,
    y: 30,
  });

  // ── Полоса «о себе» ──
  scrollReveal('.bio-text', { trigger: '.bio-strip', y: 24 });

  // ── Секция: Контакты ──
  scrollReveal('#contacts .eyebrow, #contacts h2, #contacts .section-lead', {
    trigger: '#contacts',
    stagger: 0.08,
  });
  scrollReveal('.contact-btn', {
    trigger: '#contacts',
    stagger: 0.1,
    y: 20,
  });
}

document.addEventListener('DOMContentLoaded', init);
