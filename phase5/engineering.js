/* The static field notes remain readable when JavaScript is unavailable. */
(() => {
  const explorer = document.querySelector('.eng-explorer');
  if (!explorer) return;
  const controls = [...explorer.querySelectorAll('[data-explore]')];
  const panels = [...explorer.querySelectorAll('[data-service-panel]')];
  const known = new Set(controls.map(button => button.dataset.explore));
  const param = 'vehicle';
  function select(key, writeHistory = false) {
    if (!known.has(key)) key = 'vehicle';
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.explore === key)));
    panels.forEach(panel => { panel.hidden = panel.dataset.servicePanel !== key; });
    explorer.dataset.selected = key;
    explorer.querySelector('[data-selection-label]').textContent = controls.find(button => button.dataset.explore === key).getAttribute('aria-label');
    if (writeHistory) {
      const url = new URL(location.href);
      url.searchParams.set(param, key);
      history.pushState({}, '', url);
    }
  }
  controls.forEach((button, index) => {
    button.addEventListener('click', () => select(button.dataset.explore, true));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % controls.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + controls.length - 1) % controls.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = controls.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      controls[next].focus();
      select(controls[next].dataset.explore, true);
    });
  });
  function readSelection() { select(new URL(location.href).searchParams.get(param)); }
  readSelection();
  explorer.querySelector('.eng-hotspots').hidden = false;
  explorer.classList.add('is-interactive');
  window.addEventListener('popstate', readSelection);
})();

// The enquiry route follows the main site's selectable transport journey.
(() => {
  const route = document.querySelector('.eng-process');
  if (!route) return;
  const tabs = [...route.querySelectorAll('[data-route-step]')];
  const panels = [...route.querySelectorAll('[data-route-panel]')];
  const markers = [...route.querySelectorAll('[data-route-marker]')];
  const ticket = route.querySelector('.eng-route-ticket');
  const track = route.querySelector('.eng-route-track');
  const progress = route.querySelector('.eng-route-progress');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let animation;
  function move(animate) {
    animation?.cancel();
    const start = markers[0].offsetLeft;
    const finish = markers[active].offsetLeft;
    ticket.style.left = `${finish}px`;
    progress.style.width = `${finish - start}px`;
    if (animate && !reduced.matches && ticket.animate) {
      animation = ticket.animate([
        { left: `${active === 0 ? start - 24 : start}px`, opacity: .5 },
        { left: `${finish}px`, opacity: 1 }
      ], { duration: 1000, easing: 'cubic-bezier(.25,.7,.3,1)' });
    }
  }
  function select(key, writeHistory = false, animate = true) {
    const index = tabs.findIndex(tab => tab.dataset.routeStep === key);
    active = index < 0 ? 0 : index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== active; });
    markers.forEach((marker, i) => {
      marker.classList.toggle('is-current', i === active);
      marker.setAttribute('aria-pressed', String(i === active));
    });
    route.querySelector('.eng-route-status').textContent = `${tabs[active].textContent.trim().replace(/\s+/g, ' ')} selected.`;
    move(animate);
    if (writeHistory) {
      const url = new URL(location.href);
      url.searchParams.set('step', tabs[active].dataset.routeStep);
      history.pushState({}, '', url);
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab.dataset.routeStep, true));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      select(tabs[next].dataset.routeStep, true);
    });
  });
  markers.forEach(marker => {
    marker.disabled = false;
    marker.addEventListener('click', () => select(marker.dataset.routeMarker, true));
  });
  route.querySelector('.eng-route-controls').hidden = false;
  route.classList.add('eng-route-enhanced');
  route.querySelector('.eng-route-replay').addEventListener('click', () => move(true));
  const restore = () => select(new URL(location.href).searchParams.get('step'), false, false);
  restore();
  window.addEventListener('popstate', restore);
  if ('ResizeObserver' in window) new ResizeObserver(() => move(false)).observe(track);
  else window.addEventListener('resize', () => move(false));
  reduced.addEventListener('change', () => move(false));
})();
