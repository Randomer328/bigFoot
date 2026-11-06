'use strict';

// Mobile navigation stays in sync with focus, viewport size and Escape.
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
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
    draft = `Hello Bigfoot team,\n\nI would like to discuss a wholesale enquiry.\n\nOperation: ${clean('region')}\nProduct: ${clean('product')}\nCompany: ${clean('company')}\nName: ${clean('name')}\nEmail: ${clean('email')}\nPhone: ${clean('phone') || 'Not provided'}\nEstimated quantity: ${clean('volume') || 'To discuss'}\nDestination: ${clean('destination')}\n\nRequirements:\n${clean('message')}\n\nPlease let me know the next steps.\n\n${clean('name')}`;
    preview.textContent = draft;
    const subject = `Wholesale enquiry — ${clean('product')} — ${clean('region')}`;
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
