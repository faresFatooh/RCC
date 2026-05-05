/* ============================================================
  ANIMATIONS.JS — Global subtle motion system
  - Section reveal (fade/slide)
  - Counter-up for key numbers
  - Typewriter for major titles
  - One-time, professional, low-noise behavior
============================================================ */
'use strict';

if (!window.__rcAnimationsInitialized) {
  window.__rcAnimationsInitialized = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const style = document.createElement('style');
  style.textContent = `
    .rc-anim {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
      transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);
      will-change: opacity, transform;
    }
    .rc-anim.rc-left  { transform: translate3d(-18px, 0, 0); }
    .rc-anim.rc-right { transform: translate3d(18px, 0, 0); }
    .rc-anim.rc-scale { transform: scale(.98); }
    .rc-anim.rc-in {
      opacity: 1;
      transform: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .rc-anim { opacity: 1 !important; transform: none !important; transition: none !important; }
    }
  `;
  document.head.appendChild(style);

  function q(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function addAnim(selector, variant) {
    q(selector).forEach((el) => {
      if (el.classList.contains('rc-anim')) return;
      el.classList.add('rc-anim');
      if (variant) el.classList.add(variant);
    });
  }

  function addStagger(selector, variant) {
    q(selector).forEach((el, i) => {
      if (el.classList.contains('rc-anim')) return;
      el.classList.add('rc-anim');
      if (variant) el.classList.add(variant);
      el.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
    });
  }

  function setupRevealAnimations() {
    addAnim('.ov-banner-left > *, .ov-banner-right > *', 'rc-right');
    addAnim('.ov-section-title, .ov-sub-title, .theme-header, .explore-header, .footer-brand', 'rc-left');
    addAnim('.ov-body-text, .sub, .footer-bottom', 'rc-right');
    addAnim('.ov-bags-img img, .theme-img-wrap img, .lead-photo-wrap img', 'rc-scale');
    addStagger('.ov-kpi-card, .theme-card, .explore-card, .ex-stat, .footer-col, .ov-tab', 'rc-up');
    addStagger('.lead-topic-card, .ov-biz-card, .sr-kpi-pillar, .sr-vision-pillar', 'rc-up');
    addStagger('.ov-section table tr', 'rc-up');
  }

  function observeReveal() {
    if (prefersReducedMotion) {
      q('.rc-anim').forEach((el) => el.classList.add('rc-in'));
      return;
    }
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('rc-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    q('.rc-anim').forEach((el) => io.observe(el));
  }

  function parseCounterText(text) {
    const match = text.match(/-?\d[\d,]*(?:\.\d+)?/);
    if (!match) return null;
    const numeric = match[0];
    const value = parseFloat(numeric.replace(/,/g, ''));
    if (!Number.isFinite(value) || value === 0) return null;
    const decimals = (numeric.split('.')[1] || '').length;
    return {
      value,
      decimals,
      prefix: text.slice(0, match.index),
      suffix: text.slice((match.index || 0) + numeric.length)
    };
  }

  function animateCounter(el) {
    if (el.dataset.rcCountDone === '1') return;
    const parsed = parseCounterText(el.textContent.trim());
    if (!parsed) return;
    el.dataset.rcCountDone = '1';

    const duration = 1400;
    const start = performance.now();
    const toText = (n) => parsed.decimals > 0
      ? n.toFixed(parsed.decimals)
      : Math.round(n).toLocaleString('en-US');

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const val = parsed.value * easeOutCubic(p);
      el.textContent = `${parsed.prefix}${toText(val)}${parsed.suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setupCounters() {
    const counterTargets = q('.stat-item strong, .ex-stat strong, .big-num, .ov-kpi-val, .ov-biz-num');
    if (prefersReducedMotion) return;
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counterTargets.forEach((el) => io.observe(el));
  }

  function typeWrite(el) {
    if (el.dataset.rcTyped === '1') return;
    const text = (el.dataset.rcOriginal || el.textContent || '').trim();
    if (!text || text.length > 80) return;
    el.dataset.rcTyped = '1';
    el.dataset.rcOriginal = text;
    el.textContent = '';
    let i = 0;
    const speed = 22;
    const step = () => {
      if (i >= text.length) return;
      el.textContent += text[i++];
      setTimeout(step, speed);
    };
    step();
  }

  function setupTypewriters() {
    const typeTargets = q('.ov-title, .ov-section-title h2, .theme-header h2, .explore-header h2, .lead-topic-card h4');
    if (prefersReducedMotion) return;
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        typeWrite(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.65 });
    typeTargets.forEach((el) => io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupRevealAnimations();
    observeReveal();
    setupCounters();
    setupTypewriters();
  });
}
