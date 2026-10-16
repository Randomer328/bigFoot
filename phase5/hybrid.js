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
// One local sample journey, replayed by the three transport selectors.
(() => {
 const journey=document.querySelector('.transport-journey');
 if(!journey)return;
 const data=JSON.parse(journey.querySelector('#transport-sample-data').textContent);
 const tabs=[...journey.querySelectorAll('[data-transport-mode]')];
 const replay=journey.querySelector('.transport-replay');
 const stage=journey.querySelector('#transport-stage');
 const track=journey.querySelector('.transport-track');
 const vehicle=journey.querySelector('.transport-vehicle');
 const metrics=[...journey.querySelectorAll('.transport-metric')];
 const status=journey.querySelector('.transport-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='road',frame=0,observer,hasStarted=false;
 const format=(value,item)=>value.toLocaleString('en-SG',{minimumFractionDigits:item.decimals,maximumFractionDigits:item.decimals});
 function position(progress){
  const distance=Math.max(0,track.clientWidth-vehicle.offsetWidth);
  let altitude=0,pitch=0;
  if(mode==='air' && !reduced.matches){
   // Keep the original glide, easing the nose to level without a landing bump.
   const approach=Math.min(1,progress/.82);
   altitude=-32*Math.pow(1-approach,2);
   pitch=6*Math.pow(1-approach,2);
  }
  vehicle.style.transform=`translate(${distance*progress}px,${altitude}px) rotate(${pitch}deg)`;
  return distance*progress+vehicle.offsetWidth*.75;
 }
 function finish(){
  cancelAnimationFrame(frame);position(1);journey.dataset.state='complete';
  data[mode].metrics.forEach((item,i)=>{metrics[i].classList.add('is-revealed');metrics[i].querySelector('.transport-count').textContent=format(item.value,item);});
  status.textContent=`${data[mode].vehicle} journey complete.`;
 }
 function play(){
  cancelAnimationFrame(frame);hasStarted=true;observer?.disconnect();
  if(reduced.matches){finish();return;}
  journey.dataset.state='running';position(0);
  const values=data[mode].metrics;
  const arrived=values.map(()=>null);
  metrics.forEach((metric,i)=>{metric.classList.remove('is-revealed');metric.querySelector('.transport-count').textContent=format(0,values[i]);});
  status.textContent=`${data[mode].vehicle} moving across the route.`;
  const started=performance.now();
  function tick(now){
   const progress=Math.min(1,(now-started)/3200);
   const leading=position(progress);
   let allCounted=true;
   values.forEach((item,i)=>{
    const marker=track.clientWidth*(i+.5)/4;
    if(arrived[i]===null && (leading>=marker || progress===1)){arrived[i]=now;metrics[i].classList.add('is-revealed');}
    if(arrived[i]===null){allCounted=false;return;}
    const fraction=Math.min(1,(now-arrived[i])/500);
    const amount=item.value*(1-Math.pow(1-fraction,3));
    metrics[i].querySelector('.transport-count').textContent=format(fraction===1?item.value:(item.decimals?amount:Math.floor(amount)),item);
    if(fraction<1)allCounted=false;
   });
   if(progress<1 || !allCounted)frame=requestAnimationFrame(tick);else finish();
  }
  frame=requestAnimationFrame(tick);
 }
 function select(next,animate=true){
  cancelAnimationFrame(frame);mode=next;journey.dataset.mode=mode;
  tabs.forEach(tab=>{const selected=tab.dataset.transportMode===mode;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  stage.setAttribute('aria-labelledby',`transport-tab-${mode}`);
  journey.querySelectorAll('[data-transport-vehicle]').forEach(art=>art.hidden=art.dataset.transportVehicle!==mode);
  data[mode].metrics.forEach((item,i)=>{
   metrics[i].querySelector('.transport-count').textContent=format(item.value,item);
   metrics[i].querySelector('.transport-unit').textContent=item.unit;
   metrics[i].querySelector('.transport-label').textContent=item.label;
   metrics[i].setAttribute('aria-label',`${format(item.value,item)} ${item.unit} ${item.label} — sample`);
  });
  if(animate)play();else{position(0);status.textContent=`${data[mode].vehicle} selected.`;}
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.transportMode));
  tab.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
   tabs[target].focus();select(tabs[target].dataset.transportMode);
  });
  tab.disabled=false;
 });
 replay.addEventListener('click',play);replay.disabled=false;
 journey.classList.add('transport-enhanced');select('road',false);
 if(reduced.matches || !('IntersectionObserver' in window)){finish();}else{
  observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))play();},{threshold:.3});observer.observe(journey);
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
 if('ResizeObserver' in window)new ResizeObserver(()=>{if(journey.dataset.state==='complete')position(1);else if(!hasStarted)position(0);}).observe(track);
})();

// A single selected capability, with shareable URLs and browser-history support.
(() => {
 const menus=[...document.querySelectorAll('.nav-services')];
 document.addEventListener('click',event=>menus.forEach(menu=>{if(!menu.contains(event.target) || event.target.closest('a'))menu.open=false;}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')menus.forEach(menu=>{if(menu.open){menu.open=false;menu.querySelector('summary').focus();}});});
 const choices=[...document.querySelectorAll('[data-solution-choice]')];
 const panels=[...document.querySelectorAll('[data-solution-panel]')];
 if(!choices.length)return;
 const selector=document.querySelector('#solution-selector nav');
 selector.setAttribute('role','tablist');
 function select(key,updateURL=false){
  if(!panels.some(panel=>panel.id===key))key='cold-chain';
  choices.forEach(choice=>{const active=choice.dataset.solutionChoice===key;choice.setAttribute('aria-selected',String(active));choice.tabIndex=active?0:-1;});
  panels.forEach(panel=>{panel.hidden=panel.id!==key;});
  if(updateURL && location.hash!=='#'+key)history.pushState(null,'','#'+key);
 }
 choices.forEach((choice,index)=>{
  choice.setAttribute('role','tab');choice.setAttribute('aria-controls',choice.dataset.solutionChoice);
  choice.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();select(choice.dataset.solutionChoice,true);});
  choice.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?choices.length-1:(index+(event.key==='ArrowRight'?1:-1)+choices.length)%choices.length;
   choices[next].focus();select(choices[next].dataset.solutionChoice,true);
  });
 });
 panels.forEach(panel=>panel.setAttribute('role','tabpanel'));
 const fromURL=()=>select(location.hash.slice(1));
 window.addEventListener('popstate',fromURL);window.addEventListener('hashchange',fromURL);
 document.body.classList.add('solutions-interactive');fromURL();
})();

// Persistent touch-device cues: native scrollbars alone may disappear on mobile.
(() => {
 const mobile=matchMedia('(max-width:980px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const strips=document.querySelectorAll('[data-scroll-track],.client-logo-track,.solution-jumps nav,.membership-logos');
 strips.forEach((track,index)=>{
  if(track.dataset.scrollControlsReady)return;
  track.dataset.scrollControlsReady='true';
  if(!track.id)track.id='mobile-scroll-track-'+index;
  const label=track.getAttribute('aria-label') || 'items';
  const controls=document.createElement('div');controls.className='mobile-scroll-controls';controls.hidden=true;
  const buttons=[-1,1].map(direction=>{
   const button=document.createElement('button');button.type='button';button.textContent=direction<0?'←':'→';
   button.setAttribute('aria-label',(direction<0?'Previous ':'Next ')+label.toLowerCase());button.setAttribute('aria-controls',track.id);
   button.addEventListener('click',()=>track.scrollBy({left:direction*track.clientWidth*.8,behavior:reduced.matches?'instant':'smooth'}));
   controls.append(button);return button;
  });
  track.after(controls);
  const update=()=>{
   controls.hidden=!mobile.matches || track.scrollWidth<=track.clientWidth+3;
   track.classList.toggle('has-arrow-navigation',!controls.hidden);
   buttons[0].disabled=track.scrollLeft<=3;
   buttons[1].disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;
  };
  track.addEventListener('scroll',update,{passive:true});mobile.addEventListener('change',update);
  if('ResizeObserver' in window){const observer=new ResizeObserver(update);observer.observe(track);[...track.children].forEach(child=>observer.observe(child));}
  window.addEventListener('load',update,{once:true});update();
 });
})();
