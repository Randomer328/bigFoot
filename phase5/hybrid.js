(() => {
 const status=document.getElementById('group-destination');
 document.querySelectorAll('[data-placeholder]').forEach(button=>{
  button.addEventListener('click',()=>{
   document.querySelectorAll('.hy-business-card').forEach(card=>card.classList.remove('is-selected'));
   button.closest('.hy-business-card').classList.add('is-selected');
   status.textContent=`${button.dataset.placeholder}: website destination coming soon. This tile is a placeholder; no separate business website has been built.`;
  });
  button.disabled=false;
 });
})();

(() => {
 const buttons=[...document.querySelectorAll('[data-market]')];
 const panels=[...document.querySelectorAll('[data-market-panel]')];
 const marketBox=document.querySelector('.reference-map .cp');
 if(marketBox)marketBox.classList.add('market-fixed');
 function chooseMarket(name){
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.market===name)));
  panels.forEach(p=>p.hidden=p.dataset.marketPanel!==name);
  document.querySelectorAll('[data-map-land]').forEach(p=>p.classList.toggle('is-selected',p.dataset.mapLand===name));
  document.querySelectorAll('[data-map-marker]').forEach(p=>p.classList.toggle('is-selected',p.dataset.mapMarker===name));
 }
 buttons.forEach((b,i)=>{
  b.addEventListener('click',()=>chooseMarket(b.dataset.market));
  b.addEventListener('focus',()=>chooseMarket(b.dataset.market));
  b.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();
  });
 });
 document.querySelectorAll('[data-map-land],[data-map-marker]').forEach(p=>p.addEventListener('click',()=>chooseMarket(p.dataset.mapLand||p.dataset.mapMarker)));
 if(buttons.length)chooseMarket('Singapore');
 const track=document.getElementById('group-track');
 if(track){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const arrows=[...document.querySelectorAll('[data-group-step]')];
  const update=()=>arrows.forEach(b=>b.disabled=Number(b.dataset.groupStep)<0?track.scrollLeft<=6:track.scrollLeft>=track.scrollWidth-track.clientWidth-6);
  arrows.forEach(b=>b.addEventListener('click',()=>track.scrollBy({left:Number(b.dataset.groupStep)*(track.querySelector('.hy-business-card').getBoundingClientRect().width+18),behavior:reduced.matches?'instant':'smooth'})));
  track.addEventListener('scroll',update,{passive:true});if('ResizeObserver' in window)new ResizeObserver(update).observe(track);else window.addEventListener('resize',update);update();
 }
})();

(() => {
 document.querySelectorAll('.v3-clients').forEach(section=>{
  const track=section.querySelector('.client-logo-track');
  const button=section.querySelector('[data-client-pause]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!track || !button)return;
  let paused=false;
  const sync=()=>{
   track.classList.toggle('is-scrolling',!reduced.matches);
   track.classList.toggle('is-paused',paused);
   button.disabled=reduced.matches;
   button.setAttribute('aria-pressed',String(paused));
   button.textContent=paused?'Resume logo scroll':'Pause logo scroll';
  };
  button.addEventListener('click',()=>{paused=!paused;sync();});
  reduced.addEventListener('change',sync);sync();
 });
})();
