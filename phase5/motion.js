/* Site-wide motion layer (pairs with motion.css).
   1. Any content panel that is un-hidden by a tab/selector script fades and rises in.
   2. Section headings and card groups below the fold rise in as they scroll into view. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window) || !('MutationObserver' in window)) return;

  /* ---------- 1. panels revealed by removing [hidden] ---------- */
  function play(el, cls) {
    el.classList.remove('mo-enter', 'mo-enter-fade');
    void el.offsetWidth; // restart the animation if it is already running
    el.classList.add(cls);
  }
  function isPanel(el) {
    if (!(el instanceof HTMLElement) || el.hidden) return false;
    if (el.closest('.site-header, .site-footer, dialog')) return false;
    if (el.matches('.mobile-scroll-controls, [role=status], [aria-live]')) return false;
    return el.offsetHeight > 40;
  }
  new MutationObserver(function (records) {
    records.forEach(function (r) {
      var el = r.target;
      if (r.oldValue === null || !isPanel(el)) return; // only reacts to hidden -> shown
      play(el, el.matches('[data-transport-vehicle]') ? 'mo-enter-fade' : 'mo-enter');
    });
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true });
  document.addEventListener('animationend', function (e) {
    if (e.target.classList) e.target.classList.remove('mo-enter', 'mo-enter-fade');
  });

  /* ---------- 2. scroll reveal ---------- */
  var main = document.querySelector('main') || document.body;
  var vh = window.innerHeight;
  var picked = new Set();

  function usable(el) {
    if (picked.has(el) || el.closest('.reveal, [hidden], .site-header, .site-footer, dialog, .transport-journey')) return false;
    var cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky' || cs.animationName !== 'none' || cs.display === 'none') return false;
    var r = el.getBoundingClientRect();
    return r.height > 0 && r.top > vh * 0.92; // never hide anything already on screen at load
  }
  function isTrack(el) {
    var cs = getComputedStyle(el);
    return /auto|scroll/.test(cs.overflowX) || /track|marquee|logo/i.test(el.className || '');
  }

  // section intro blocks: the element that holds each section's h2
  main.querySelectorAll('section h2').forEach(function (h) {
    var block = h.parentElement;
    if (block && block.tagName !== 'SECTION' && usable(block)) picked.add(block);
    else if (usable(h)) picked.add(h);
  });
  // repeated items: children of grids/flex rows with 3+ similar children
  main.querySelectorAll('section *').forEach(function (box) {
    if (box.children.length < 3 || box.children.length > 16) return;
    var cs = getComputedStyle(box);
    if (!/grid|flex/.test(cs.display) || isTrack(box)) return;
    var kids = [].slice.call(box.children);
    var tag = kids[0].tagName;
    if (!kids.every(function (k) { return k.tagName === tag; })) return;
    if (box.closest('nav, form, [role=tablist]') || /^(LI|A|BUTTON|SPAN)$/.test(tag) && kids[0].offsetHeight < 60) return;
    kids.forEach(function (k, i) {
      if (usable(k)) { k.style.setProperty('--mo-delay', Math.min(i, 5) * 0.07 + 's'); picked.add(k); }
    });
  });

  function reveal(el) {
    if (!el.classList.contains('mo-pending')) return;
    el.classList.remove('mo-pending');
    el.classList.add('mo-in');
    io.unobserve(el);
    var clear = function () { el.classList.remove('mo-in'); el.style.removeProperty('--mo-delay'); };
    el.addEventListener('animationend', function done(ev) {
      if (ev.target !== el) return; // ignore animations bubbling up from children
      clear(); el.removeEventListener('animationend', done);
    });
    setTimeout(clear, 1600); // fallback if the animation never runs
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) reveal(en.target); });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  // Safety net: an element clipped by an overflow container may never "intersect",
  // so anything the page has scrolled to is revealed regardless.
  var ticking = false;
  function sweep() {
    ticking = false;
    var limit = window.innerHeight * 0.95;
    document.querySelectorAll('.mo-pending').forEach(function (el) {
      if (el.getBoundingClientRect().top < limit) reveal(el);
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sweep); } }, { passive: true });
  window.addEventListener('resize', sweep);

  picked.forEach(function (el) {
    // don't nest: skip an element whose ancestor is also being revealed
    for (var p = el.parentElement; p; p = p.parentElement) if (picked.has(p)) return;
    el.classList.add('mo-pending');
    io.observe(el);
  });

  // if the user switches reduced motion on mid-visit, show everything immediately
  reduced.addEventListener('change', function (e) {
    if (!e.matches) return;
    document.querySelectorAll('.mo-pending, .mo-in').forEach(function (el) { el.classList.remove('mo-pending', 'mo-in'); });
    io.disconnect();
  });
})();
