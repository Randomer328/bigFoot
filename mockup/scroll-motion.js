(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;

  const selectors = [
    '.utility .wrap > *', '.header .brand', '.header nav > a', '.header .menu',
    '.hero-content > *', '.care-portrait', '.ribbon-grid > a',
    '.about-photo', '.about-copy > *', '.section-head > div > *', '.section-head > p',
    '.tabs', '.panel', '.extra-services > article', '.values > article',
    '.community-photo', '.group-context-cards > article', '.group-scope',
    '.process-intro > *', '.steps > article', '.growth-copy > *', '.future-card',
    '.story-gallery > figure', '.faq-intro > *', '.faqs > details',
    '.contact-copy > *', '.contact-row', '.footer-top > div', '.footer-bottom > *'
  ];
  const groupSelector = '.hero-content,.care-hero-grid,.ribbon-grid,.about-copy,.section-head,.extra-services,.values,.group-context-cards,.steps,.process-intro,.growth-copy,.story-gallery,.faq-intro,.faqs,.contact-copy,.contact-details,.footer-top,.footer-bottom,.utility .wrap,.header-inner';
  const elements = [...new Set(document.querySelectorAll(selectors.join(',')))];
  const groupCounts = new Map();
  const waiting = new Set(elements);

  function show(element) {
    element.classList.add('is-visible');
    waiting.delete(element);
    observer.unobserve(element);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) show(entry.target);
  }, {threshold:0.08,rootMargin:'0px 0px -24px 0px'});

  for (const element of elements) {
    const group = element.closest(groupSelector) || element.parentElement;
    const index = groupCounts.get(group) || 0;
    groupCounts.set(group, index + 1);
    element.style.setProperty('--reveal-delay', `${Math.min(index * 65, 240)}ms`);
    element.classList.add('motion-reveal');
    if (element.matches('.care-portrait,.future-card')) element.classList.add('motion-from-right');
    if (element.matches('.about-photo,.community-photo')) element.classList.add('motion-from-left');
    // Never hide content already passed when restoring a scroll position or opening a hash link.
    if (element.getBoundingClientRect().bottom <= 0) show(element);
    else observer.observe(element);
  }
  document.body.classList.add('motion-ready');

  document.addEventListener('focusin', event => {
    const element = event.target.closest('.motion-reveal');
    if (element) {element.style.setProperty('--reveal-delay','0ms');show(element);}
  });

  function animateContent(element) {
    if (!element || preference.matches || typeof element.animate !== 'function') return;
    if (element.matches('.motion-reveal')) show(element);
    element.animate([{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}], {
      duration:420,easing:'cubic-bezier(.22,1,.36,1)'
    });
  }
  // Keep tab changes and expanded FAQ copy lively after the initial scroll entrance.
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    tab.addEventListener('click', () => requestAnimationFrame(() => {
      animateContent(document.getElementById(tab.getAttribute('aria-controls')));
    }));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
        requestAnimationFrame(() => animateContent(document.querySelector('[role="tabpanel"]:not([hidden])')));
      }
    });
  });
  document.querySelectorAll('.faqs details').forEach(detail => {
    detail.addEventListener('toggle', () => {if (detail.open) animateContent(detail.querySelector('p'));});
  });
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    document.body.classList.remove('motion-ready');
    for (const element of [...waiting]) show(element);
    observer.disconnect();
    for (const element of elements) element.getAnimations().forEach(animation => animation.cancel());
  });
})();
