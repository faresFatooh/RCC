// =====================
// NAVBAR – scroll effect
// =====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// =====================
// FULLSCREEN MOBILE MENU
// =====================
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

function closeMenu() {
  mobileMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// =====================
// HERO – entrance animation
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.eyebrow, .hero-text h1, .sub, .btns, .stats');
  els.forEach((el, i) => {
    el.style.cssText = `opacity:0; transform:translateY(20px); transition: opacity .65s ease ${i * 0.1}s, transform .65s ease ${i * 0.1}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }));
  });
});

// =====================
// OVERVIEW SUB-NAV — active tab on click + scroll spy
// =====================
(function () {
  const subnav = document.getElementById('ovSubnav');
  if (!subnav) return;

  const tabs = [...subnav.querySelectorAll('.ov-tab')];

  // Smooth scroll on click + set active immediately
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const id = tab.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      // offset = navbar + subnav height
      const offset = (document.getElementById('navbar')?.offsetHeight || 64)
                   + (subnav.offsetHeight || 44);
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
      setActive(tab);
    });
  });

  // Scroll spy via IntersectionObserver
  const sections = tabs
    .map(t => document.getElementById(t.getAttribute('href').slice(1)))
    .filter(Boolean);

  const navH    = () => (document.getElementById('navbar')?.offsetHeight || 64);
  const subnavH = () => subnav.offsetHeight || 44;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id  = entry.target.id;
        const tab = tabs.find(t => t.getAttribute('href') === '#' + id);
        if (tab) setActive(tab);
      }
    });
  }, {
    rootMargin: `-${(navH() + subnavH())}px 0px -55% 0px`,
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));

  function setActive(activeTab) {
    tabs.forEach(t => t.classList.remove('active'));
    activeTab.classList.add('active');
  }
})();

// =====================
// BANNER TAGS — smooth scroll
// =====================
document.querySelectorAll('.ov-tags a').forEach(tag => {
  tag.addEventListener('click', e => {
    e.preventDefault();
    const id = tag.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    const offset = (document.getElementById('navbar')?.offsetHeight || 64)
                 + (document.getElementById('ovSubnav')?.offsetHeight || 44);
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

// =====================
// GLOBAL ANIMATIONS LOADER
// =====================
(function () {
  const hasScript = [...document.scripts].some(s => (s.getAttribute('src') || '').includes('js/animations.js'));
  if (hasScript || window.__rcAnimationsScriptLoading) return;
  window.__rcAnimationsScriptLoading = true;

  const script = document.createElement('script');
  script.src = 'js/animations.js';
  script.defer = true;
  document.body.appendChild(script);
})();

// =====================
// ARABIC PAGES — FORCE ENGLISH NUMERAL GLYPHS
// =====================
document.addEventListener('DOMContentLoaded', () => {
  if (document.documentElement.lang !== 'ar') return;
  if (window.__rcEnglishNumbersApplied) return;
  window.__rcEnglishNumbersApplied = true;

  const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
  const numberRegex = /[0-9٠-٩]+(?:[.,٫،][0-9٠-٩]+)*(?:[%+\-xX])?/g;
  const arToEnMap = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9','٫':'.','،':',' };
  let applying = false;

  function normalizeDigits(str) {
    return String(str).replace(/[٠-٩٫،]/g, (ch) => arToEnMap[ch] || ch);
  }

  function applyEnglishNumbers() {
    if (applying) return;
    applying = true;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('.en-num')) return NodeFilter.FILTER_REJECT;
          if (skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('svg')) return NodeFilter.FILTER_REJECT;
          return /[0-9٠-٩]/.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const targets = [];
    let current;
    while ((current = walker.nextNode())) targets.push(current);

    targets.forEach((textNode) => {
      const text = textNode.nodeValue || '';
      numberRegex.lastIndex = 0;
      if (!numberRegex.test(text)) return;

      const frag = document.createDocumentFragment();
      let last = 0;
      numberRegex.lastIndex = 0;
      let match;
      while ((match = numberRegex.exec(text)) !== null) {
        const idx = match.index;
        if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));
        const span = document.createElement('span');
        span.className = 'en-num';
        span.setAttribute('dir', 'ltr');
        span.setAttribute('lang', 'en');
        span.textContent = normalizeDigits(match[0]);
        frag.appendChild(span);
        last = idx + match[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });

    applying = false;
  }

  applyEnglishNumbers();

  const mo = new MutationObserver(() => {
    if (applying) return;
    requestAnimationFrame(applyEnglishNumbers);
  });
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
});
