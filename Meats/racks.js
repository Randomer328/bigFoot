(() => {
 'use strict';
 const products=JSON.parse(document.getElementById('store-data').textContent),byId=new Map(products.map(p=>[p.id,p])),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-rack]').forEach(rack=>{
  const viewport=rack.querySelector('.rack-viewport'),buttons=[...rack.querySelectorAll('[data-rack-select]')],items=buttons.map(b=>b.closest('.rack-item')),prev=rack.querySelector('[data-rack-direction="-1"]'),next=rack.querySelector('[data-rack-direction="1"]');
  let active=1,scrollTimer,programmatic=false,programTimer;
  function update(index,announce=false){active=Math.max(0,Math.min(buttons.length-1,index));const p=byId.get(buttons[active].dataset.rackSelect);buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===active));items[i].classList.toggle('is-selected',i===active);});rack.querySelector('[data-rack-name]').textContent=p.name;rack.querySelector('[data-rack-caption]').textContent=p.caption;rack.querySelector('[data-product]').dataset.product=p.id;rack.querySelector('[data-rack-position]').textContent=`0${active+1} / 0${buttons.length}`;prev.disabled=active===0;next.disabled=active===buttons.length-1;if(announce)rack.querySelector('[data-rack-status]').textContent=`${p.name} selected. Choose quantity to add it to your request.`;}
  function center(index,smooth=true){const item=items[index],vr=viewport.getBoundingClientRect(),ir=item.getBoundingClientRect();programmatic=true;clearTimeout(programTimer);viewport.scrollTo({left:viewport.scrollLeft+ir.left-vr.left+(ir.width-vr.width)/2,behavior:smooth&&!reduced.matches?'smooth':'instant'});programTimer=setTimeout(()=>{programmatic=false;},650);}
  function select(index,focus=false){update(index,true);center(active);if(focus)buttons[active].focus({preventScroll:true});}
  buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
  [prev,next].forEach(b=>b.addEventListener('click',()=>{select(active+Number(b.dataset.rackDirection));if(b.disabled)buttons[active].focus({preventScroll:true});}));
  viewport.addEventListener('keydown',e=>{let target;if(e.key==='ArrowRight')target=active+1;else if(e.key==='ArrowLeft')target=active-1;else if(e.key==='Home')target=0;else if(e.key==='End')target=buttons.length-1;else return;e.preventDefault();select(target,true);});
  viewport.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(programmatic)return;const r=viewport.getBoundingClientRect(),middle=r.left+r.width/2;let closest=0,distance=Infinity;items.forEach((item,i)=>{const box=item.getBoundingClientRect(),d=Math.abs(box.left+box.width/2-middle);if(d<distance){distance=d;closest=i;}});if(closest!==active)update(closest,true);},130);},{passive:true});
  viewport.addEventListener('pointerdown',()=>{programmatic=false;clearTimeout(programTimer);},{passive:true});
  update(1);center(1,false);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>center(active,false),80);});
 });
})();
