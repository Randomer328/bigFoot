/* Bigfoot Engineering — service stage and enquiry route.
   Without JavaScript every service and step stays readable as static content. */

// Service stage: tabs drive the copy and a single focus marker that glides across the truck.
(() => {
  const explorer = document.querySelector('.eng-explorer');
  if (!explorer) return;
  const tabs = [...explorer.querySelectorAll('[data-explore]')];
  const panels = [...explorer.querySelectorAll('[data-service-panel]')];
  const pins = [...explorer.querySelectorAll('[data-pin]')];
  const focus = explorer.querySelector('.eng-focus');
  const focusLabel = explorer.querySelector('[data-focus-label]');
  const toggle = explorer.querySelector('.eng-autoplay');
  const toggleText = explorer.querySelector('[data-autoplay-text]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const keys = tabs.map(tab => tab.dataset.explore);
  let active = 0;
  let touring = false;

  function select(key, { moveFocus = false } = {}) {
    const index = Math.max(0, keys.indexOf(key));
    active = index;
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === index));
    panels.forEach((panel, i) => panel.setAttribute('aria-hidden', String(i !== index)));
    pins.forEach((pin, i) => pin.classList.toggle('is-active', i === index));
    const pin = pins[index];
    if (pin && focus) {
      focus.style.setProperty('--x', pin.style.getPropertyValue('--x'));
      focus.style.setProperty('--y', pin.style.getPropertyValue('--y'));
    }
    if (focusLabel) focusLabel.textContent = tabs[index].querySelector('b').textContent;
    explorer.dataset.selected = keys[index];
    if (moveFocus) tabs[index].focus();
  }

  function setTour(on) {
    touring = on && !reduced.matches;
    explorer.classList.toggle('is-touring', touring);
    toggle.hidden = reduced.matches;
    toggle.setAttribute('aria-pressed', String(!touring));
    toggleText.textContent = touring ? 'Pause tour' : 'Play tour';
  }

  // A visitor's own choice ends the automatic tour.
  function choose(key, moveFocus) {
    setTour(false);
    select(key, { moveFocus });
    const url = new URL(location.href);
    url.searchParams.set('service', key);
    history.replaceState(history.state, '', url);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => choose(tab.dataset.explore));
    tab.addEventListener('keydown', event => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next;
      if (event.key in map) next = (index + map[event.key] + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      choose(keys[next], true);
    });
    // When the progress line fills, the tour moves on.
    tab.querySelector('.eng-progress').addEventListener('animationend', () => {
      if (touring && index === active) select(keys[(active + 1) % keys.length]);
    });
  });
  pins.forEach(pin => pin.addEventListener('click', () => choose(pin.dataset.pin)));

  toggle.addEventListener('click', () => setTour(!touring));
  // Hold the tour while someone is reading or interacting with the stage.
  explorer.addEventListener('pointerenter', () => explorer.classList.add('is-held'));
  explorer.addEventListener('pointerleave', () => explorer.classList.remove('is-held'));
  explorer.addEventListener('focusin', () => explorer.classList.add('is-held'));
  explorer.addEventListener('focusout', event => { if (!explorer.contains(event.relatedTarget)) explorer.classList.remove('is-held'); });
  reduced.addEventListener('change', () => setTour(false));

  const requested = new URL(location.href).searchParams.get('service');
  select(keys.includes(requested) ? requested : keys[0]);
  explorer.classList.add('is-ready');
  setTour(!requested);
})();

// Enquiry route: three selectable steps.
(() => {
  const route = document.querySelector('.eng-process');
  if (!route) return;
  const tabs = [...route.querySelectorAll('[data-route-step]')];
  const panels = [...route.querySelectorAll('[data-route-panel]')];
  function select(index, moveFocus) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (moveFocus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next;
      if (event.key in map) next = (index + map[event.key] + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  route.classList.add('is-ready');
  select(0);
})();
