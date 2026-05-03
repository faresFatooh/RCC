/* ============================================================
   ANIMATIONS.JS — Riyadh Cement Annual Report 2025
   - Fade + slide on scroll (repeatable)
   - Counter animation (repeatable)
   - Text typewriter effect
   - Image reveal
   ============================================================ */

'use strict';

/* ─── Easing ─────────────────────────────────────────────── */
const easeOutCubic  = t => 1 - Math.pow(1 - t, 3);
const easeOutExpo   = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/* ─── CSS for base animation states ─────────────────────── */
const style = document.createElement('style');
style.textContent = `
  .anim-fade-up,
  .anim-fade-left,
  .anim-fade-right,
  .anim-fade-in,
  .anim-scale-up,
  .anim-reveal {
    opacity: 0;
    transition: none;
    will-change: transform, opacity;
  }
  .anim-fade-up    { transform: translateY(36px); }
  .anim-fade-left  { transform: translateX(-36px); }
  .anim-fade-right { transform: translateX(36px); }
  .anim-scale-up   { transform: scale(0.94); }
  .anim-reveal     { clip-path: inset(0 100% 0 0); }

  .anim-fade-up.in,
  .anim-fade-left.in,
  .anim-fade-right.in,
  .anim-fade-in.in,
  .anim-scale-up.in {
    opacity: 1;
    transform: none;
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .anim-reveal.in {
    opacity: 1;
    clip-path: inset(0 0% 0 0);
    transition: clip-path 0.9s cubic-bezier(0.16,1,0.3,1),
                opacity 0.1s;
  }

  /* Stagger delays */
  .anim-d1 { transition-delay: 0.05s !important; }
  .anim-d2 { transition-delay: 0.12s !important; }
  .anim-d3 { transition-delay: 0.19s !important; }
  .anim-d4 { transition-delay: 0.26s !important; }
  .anim-d5 { transition-delay: 0.33s !important; }
  .anim-d6 { transition-delay: 0.40s !important; }
  .anim-d7 { transition-delay: 0.47s !important; }
`;
document.head.appendChild(style);

/* ─── Assign animation classes to elements ──────────────── */
function assignClasses() {

  /* Hero */
  q('.eyebrow')?.classList.add('anim-fade-up', 'anim-d1');
  q('.hero-text h1')?.classList.add('anim-fade-up', 'anim-d2');
  q('.sub')?.classList.add('anim-fade-up', 'anim-d3');
  q('.btns')?.classList.add('anim-fade-up', 'anim-d4');
  q('.hero-stats, .stats')?.classList.add('anim-fade-up', 'anim-d5');

  /* Theme section */
  q('.theme-header')?.classList.add('anim-fade-up');
  q('.theme-img-wrap img')?.classList.add('anim-fade-up');
  qa('.theme-card').forEach((el, i) => {
    el.classList.add('anim-fade-up', `anim-d${Math.min(i + 1, 7)}`);
  });
  qa('.group-title').forEach(el => el.classList.add('anim-fade-up'));

  /* Explore section */
  q('.explore-header')?.classList.add('anim-fade-up');
  qa('.explore-card').forEach((el, i) => {
    el.classList.add('anim-scale-up', `anim-d${Math.min(i + 1, 7)}`);
  });
  qa('.ex-stat').forEach((el, i) => {
    el.classList.add('anim-fade-up', `anim-d${Math.min(i + 1, 6)}`);
  });

  /* Footer */
  q('.footer-brand')?.classList.add('anim-fade-up', 'anim-d1');
  qa('.footer-col').forEach((el, i) => {
    el.classList.add('anim-fade-up', `anim-d${i + 2}`);
  });
  q('.footer-bottom')?.classList.add('anim-fade-in');
}

/* ─── Intersection Observer (repeatable) ────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      } else {
        /* Remove so it re-animates on next scroll into view */
        entry.target.classList.remove('in');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  qa('.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-fade-in, .anim-scale-up, .anim-reveal')
    .forEach(el => observer.observe(el));
}

/* ─── Counter animation (repeatable) ────────────────────── */
function initCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
      }
    });
  }, { threshold: 0.4 });

  qa('[data-count]').forEach(el => counterObserver.observe(el));
}

function runCounter(el) {
  const raw      = el.dataset.count;
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const decimals = parseInt(el.dataset.decimals || '0');
  const target   = parseFloat(raw);
  const duration = 1800;
  const start    = performance.now();

  function formatNum(val) {
    if (decimals > 0) {
      // e.g. 787.6 → "787.6"
      return val.toFixed(decimals);
    } else {
      // e.g. 3497830 → "3,497,830"
      return Math.round(val).toLocaleString('en-US');
    }
  }

  function tick(now) {
    const p   = Math.min((now - start) / duration, 1);
    const val = target * easeOutExpo(p);
    el.textContent = prefix + formatNum(val) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ─── Typewriter effect ──────────────────────────────────── */
function initTypewriters() {
  const twObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typewrite(entry.target);
      } else {
        /* Reset for re-play */
        const el = entry.target;
        el.textContent = '';
      }
    });
  }, { threshold: 0.5 });

  qa('[data-typewrite]').forEach(el => {
    el.dataset.original = el.textContent.trim();
    el.textContent = '';
    twObserver.observe(el);
  });

  /* Typewrite span only (theme-header) */
  const spanObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const span = entry.target;
        const text = span.dataset.original;
        const speed = 40;
        let i = 0;
        span.textContent = '';
        function typeSpan() {
          if (i < text.length) { span.textContent += text[i++]; setTimeout(typeSpan, speed); }
        }
        typeSpan();
      } else {
        entry.target.textContent = '';
      }
    });
  }, { threshold: 0.5 });

  qa('[data-typewrite-span]').forEach(el => spanObserver.observe(el));
}

function typewrite(el) {
  const text    = el.dataset.original || el.dataset.typewrite;
  const speed   = parseInt(el.dataset.speed || '40');
  let   i       = 0;
  el.textContent = '';

  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    }
  }
  type();
}

/* ─── Assign data attributes to counters ────────────────── */
function assignCounters() {
  const isRTL = document.documentElement.dir === 'rtl';

  /* Hero stats */
  const heroStats = qa('.stat-item strong');
  const heroData = isRTL
    ? [
        { count: '787.6', decimals: 1, prefix: '', suffix: ' مليون ر.س' },
        { count: '207.8', decimals: 1, prefix: '', suffix: ' مليون ر.س' },
        { count: '3.6',   decimals: 1, prefix: '', suffix: ' م+ طن' },
      ]
    : [
        { count: '787.6', decimals: 1, prefix: 'SAR ', suffix: 'M' },
        { count: '207.8', decimals: 1, prefix: 'SAR ', suffix: 'M' },
        { count: '3.6',   decimals: 1, prefix: '',     suffix: 'M+T' },
      ];

  heroStats.forEach((el, i) => {
    if (!heroData[i]) return;
    el.dataset.count    = heroData[i].count;
    el.dataset.prefix   = heroData[i].prefix;
    el.dataset.suffix   = heroData[i].suffix;
    el.dataset.decimals = heroData[i].decimals;
  });

  /* Explore stats */
  const exStats = qa('.ex-stat strong');
  const exData = isRTL
    ? [
        { count: '787.6',    decimals: 1, prefix: '', suffix: ' مليون ر.س' },
        { count: '207.8',    decimals: 1, prefix: '', suffix: ' مليون ر.س' },
        { count: '3497830',  decimals: 0, prefix: '', suffix: ' طن' },
        { count: '393312',   decimals: 0, prefix: '', suffix: ' طن' },
        { count: '3626304',  decimals: 0, prefix: '', suffix: '' },
        { count: '85',       decimals: 0, prefix: '', suffix: ' مليون ر.س' },
      ]
    : [
        { count: '787.6',    decimals: 1, prefix: 'SAR ', suffix: 'M' },
        { count: '207.8',    decimals: 1, prefix: 'SAR ', suffix: 'M' },
        { count: '3497830',  decimals: 0, prefix: '',     suffix: 'T' },
        { count: '393312',   decimals: 0, prefix: '',     suffix: 'T' },
        { count: '3626304',  decimals: 0, prefix: '',     suffix: '' },
        { count: '85',       decimals: 0, prefix: 'SAR ', suffix: 'M' },
      ];

  exStats.forEach((el, i) => {
    if (!exData[i]) return;
    el.dataset.count    = exData[i].count;
    el.dataset.prefix   = exData[i].prefix;
    el.dataset.suffix   = exData[i].suffix;
    el.dataset.decimals = exData[i].decimals;
  });

  /* Big numbers in theme section — skip ones that contain images */
  qa('.big-num').forEach(el => {
    if (el.querySelector('img')) return; /* skip SAR icon ones */
    const txt = el.textContent.trim();
    const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) {
      el.dataset.count    = num;
      el.dataset.decimals = '0';
      el.dataset.prefix   = '';
      el.dataset.suffix   = '';
    }
  });
}

/* ─── Assign typewriter to headings ─────────────────────── */
function assignTypewriters() {
  /* Section headings get typewriter — skip theme-header h2 (has colored span) */
  qa('.explore-header h2').forEach(el => {
    el.setAttribute('data-typewrite', '');
    el.dataset.speed = '35';
  });

  /* theme-header h2 — typewrite only the span text, keep prefix static */
  qa('.theme-header h2').forEach(el => {
    const span = el.querySelector('span');
    if (!span) return;
    const spanText = span.textContent.trim();
    span.textContent = '';
    span.dataset.original = spanText;
    span.setAttribute('data-typewrite-span', '');
  });
}

/* ─── Helpers ────────────────────────────────────────────── */
function q(sel)  { return document.querySelector(sel); }
function qa(sel) { return [...document.querySelectorAll(sel)]; }

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  assignClasses();
  assignCounters();
  assignTypewriters();

  /* Small delay so CSS is applied before observer fires */
  requestAnimationFrame(() => {
    initScrollAnimations();
    initCounters();
    initTypewriters();
  });
});
