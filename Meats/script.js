'use strict';
document.documentElement.classList.add('js');

// Mobile navigation stays in sync with focus, viewport size and Escape.
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
  const disclosure = navigation.querySelector('.company-menu');
  if (disclosure) disclosure.open = false;
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.header')) closeMenu();
});
matchMedia('(min-width: 801px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Product filters support bookmarkable URLs and browser back/forward.
const filters = [...document.querySelectorAll('[data-filter]')];
function applyFilter(value) {
  const valid = ['all', 'meat', 'specialist'].includes(value) ? value : 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === valid)));
  const cards = [...document.querySelectorAll('[data-category]')];
  cards.forEach(card => { card.hidden = valid !== 'all' && card.dataset.category !== valid; });
  const count = document.querySelector('#product-count');
  if (count) count.textContent = `${cards.filter(card => !card.hidden).length} product categories`;
}
function filterFromUrl() {
  const hash = location.hash.slice(1);
  const target = document.getElementById(hash);
  // A product deep link must remain visible even when the query filters it out.
  const value = target?.dataset.category || new URLSearchParams(location.search).get('category');
  applyFilter(value);
}
if (filters.length) {
  filterFromUrl();
  filters.forEach(button => button.addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('category', button.dataset.filter);
    url.hash = '';
    history.pushState({}, '', url);
    applyFilter(button.dataset.filter);
  }));
  addEventListener('popstate', filterFromUrl);
  addEventListener('hashchange', filterFromUrl);
}

// A contact enquiry is an email draft. Nothing is submitted to a server.
const form = document.querySelector('#enquiry-form');
if (form) {
  const params = new URLSearchParams(location.search);
  for (const key of ['region', 'product']) {
    const select = form.elements.namedItem(key);
    const value = params.get(key);
    if ([...select.options].some(option => option.value === value)) select.value = value;
  }
  const dialog = document.querySelector('#review-dialog');
  const preview = document.querySelector('#draft-preview');
  const status = document.querySelector('#copy-status');
  let draft = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const clean = key => (data[key] || '').trim();
    // Native required validation accepts spaces; reject those before drafting.
    for (const key of ['name', 'company', 'destination', 'message']) {
      if (!clean(key)) {
        const field = form.elements.namedItem(key);
        field.setCustomValidity('Please enter your details.');
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), {once:true});
        return;
      }
    }
    draft = `Hello Bigfoot team,\n\nI would like to discuss a wholesale enquiry.\n\nEnquiry for: ${form.elements.region.selectedOptions[0].textContent}\nProduct: ${clean('product')}\nCompany: ${clean('company')}\nName: ${clean('name')}\nEmail: ${clean('email')}\nPhone: ${clean('phone') || 'Not provided'}\nEstimated quantity: ${clean('volume') || 'To discuss'}\nDestination: ${clean('destination')}\n\nRequirements:\n${clean('message')}\n\nPlease let me know the next steps.\n\n${clean('name')}`;
    preview.textContent = draft;
    const subject = `Wholesale enquiry — ${clean('product')} — ${form.elements.region.selectedOptions[0].textContent}`;
    document.querySelector('#send-email').href = `mailto:enquiries@bigfoot.com.sg?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;
    status.textContent = 'Nothing has been sent. If your email app omits any details, use Copy enquiry instead.';
    dialog.showModal();
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  document.querySelector('#copy-draft').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft);
      status.textContent = 'Enquiry copied. Paste it into an email to enquiries@bigfoot.com.sg.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Draft selected. Use your device’s Copy command, then paste it into your email app.';
    }
  });
  // Keep native GET submission disabled until all draft handlers are ready.
  document.querySelector('#enquiry-fields').disabled = false;
}


// Company disclosure remains usable with the keyboard and dismisses on Escape.
const companyMenu = document.querySelector('.company-menu');
document.addEventListener('click', event => {
  if (!event.target.closest('.company-menu')) companyMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && companyMenu.open) {
    companyMenu.open = false;
    companyMenu.querySelector('summary').focus();
  }
});

// Product selection changes the photograph, formats and enquiry destination together.
const rangeTabs = [...document.querySelectorAll('[data-product-key]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (rangeTabs.length) {
  const productData = JSON.parse(document.querySelector('#product-data').textContent);
  const keys = rangeTabs.map(tab => tab.dataset.productKey);
  const panel = document.querySelector('#range-panel');
  const image = document.querySelector('#range-image');
  function selectProduct(key, updateUrl = false, moveFocus = false) {
    if (!Object.prototype.hasOwnProperty.call(productData, key)) key = keys[0];
    const product = productData[key];
    rangeTabs.forEach(tab => {
      const selected = tab.dataset.productKey === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    panel.setAttribute('aria-labelledby', 'range-tab-' + key);
    image.src = 'assets/' + product.image + '.webp';
    image.alt = product.alt;
    image.parentElement.dataset.product = key;
    document.querySelector('#range-label').textContent = product.label;
    document.querySelector('#range-description').textContent = product.description;
    const formats = document.querySelector('#range-formats');
    formats.replaceChildren(...product.formats.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    document.querySelector('#range-enquiry').href = 'contact.html?product=' + encodeURIComponent(product.enquiry);
    document.querySelector('#range-product-name').textContent = product.name.toLowerCase();
    document.querySelector('#range-status').textContent = product.name + ' selected';
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('range', key);
      if (url.href !== location.href) history.pushState({}, '', url);
      if (!reducedMotion.matches) {
        image.getAnimations().forEach(animation => animation.cancel());
        image.animate([{opacity:.4, transform:'scale(.985)'},{opacity:1, transform:'scale(1)'}], {duration:350,easing:'ease-out'});
      }
    }
  }
  function selectProductFromUrl() {
    const query = new URLSearchParams(location.search).get('range');
    const hash = location.hash.slice(1);
    selectProduct(keys.includes(query) ? query : (keys.includes(hash) ? hash : keys[0]));
  }
  rangeTabs.forEach((tab,index) => {
    tab.addEventListener('click', () => selectProduct(tab.dataset.productKey, true));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (['ArrowRight','ArrowDown'].includes(event.key)) next = (index + 1) % keys.length;
      else if (['ArrowLeft','ArrowUp'].includes(event.key)) next = (index + keys.length - 1) % keys.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = keys.length - 1;
      else return;
      event.preventDefault();
      selectProduct(keys[next], true, true);
    });
  });
  addEventListener('popstate', selectProductFromUrl);
  addEventListener('hashchange', selectProductFromUrl);
  selectProductFromUrl();
}

// The farm panorama has a persistent pause control; offscreen animation stops too.
const hero = document.querySelector('.hero');
const motionToggle = document.querySelector('[data-motion-toggle]');
if (hero && motionToggle) {
  motionToggle.addEventListener('click', () => {
    const paused = hero.classList.toggle('motion-paused');
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
  });
  const observer = new IntersectionObserver(entries => {
    hero.classList.toggle('hero-offscreen', !entries[0].isIntersecting);
  });
  observer.observe(hero);
}

// Scroll chapters select one anchored photograph, without changing reading order.
const chapters = [...document.querySelectorAll('[data-chapter]')];
const scenes = [...document.querySelectorAll('[data-scene]')];
const chapterLinks = [...document.querySelectorAll('[data-story-jump]')];
let activeChapter = -1;
function updateChapter() {
  if (!chapters.length) return;
  const visual = document.querySelector('.story-visual');
  const mobile = matchMedia('(max-width: 560px)').matches;
  const target = mobile ? Math.min(innerHeight * .88, visual.getBoundingClientRect().bottom + 110) : innerHeight * .58;
  let current = 0;
  chapters.forEach((chapter,index) => {
    if (chapter.getBoundingClientRect().top <= target) current = index;
  });
  if (current === activeChapter) return;
  activeChapter = current;
  scenes.forEach((scene,index) => {
    scene.classList.toggle('is-active', index === current);
    scene.setAttribute('aria-hidden', String(index !== current));
  });
  chapterLinks.forEach((link,index) => {
    if (index === current) link.setAttribute('aria-current','step');
    else link.removeAttribute('aria-current');
  });
}
let scheduled = false;
function updateScroll() {
  scheduled = false;
  const length = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.header').style.setProperty('--reading-progress', length > 0 ? String(Math.min(1,Math.max(0,scrollY / length))) : '0');
  updateChapter();
}
function requestScrollUpdate() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
addEventListener('scroll', requestScrollUpdate, {passive:true});
addEventListener('resize', requestScrollUpdate);
addEventListener('load', requestScrollUpdate);
addEventListener('hashchange', requestScrollUpdate);
updateScroll();
