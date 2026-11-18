/* Header dropdowns (Our Group / ESG / Services). Click or hover on desktop, accordion in the mobile drawer. */
(function () {
  var dds = [].slice.call(document.querySelectorAll('.bf-dd'));
  if (!dds.length) return;
  var desktop = matchMedia('(min-width:1201px) and (hover:hover)');
  function set(d, on) {
    d.classList.toggle('open', on);
    d.querySelector('.bf-dd-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function closeAll(except) { dds.forEach(function (d) { if (d !== except) set(d, false); }); }
  dds.forEach(function (d) {
    var btn = d.querySelector('.bf-dd-btn'), t;
    btn.addEventListener('click', function () { var on = !d.classList.contains('open'); closeAll(d); set(d, on); });
    d.addEventListener('mouseenter', function () { if (!desktop.matches) return; clearTimeout(t); t = setTimeout(function () { closeAll(d); set(d, true); }, 70); });
    d.addEventListener('mouseleave', function () { if (!desktop.matches) return; clearTimeout(t); t = setTimeout(function () { set(d, false); }, 220); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('open')) { e.stopPropagation(); set(d, false); btn.focus(); } });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.bf-dd')) closeAll(); });
  matchMedia('(min-width:1201px)').addEventListener('change', function () { closeAll(); });
})();
