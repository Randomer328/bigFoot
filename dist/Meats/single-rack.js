(() => {
 'use strict';
 const wrapIndex=(index,length)=>(index%length+length)%length;
 const swipeDirection=(dx,dy)=>Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.2?(dx<0?1:-1):0;
 const wheelDirection=value=>Math.abs(value)>=60?Math.sign(value):0;
 if(typeof module==='object'&&module.exports){module.exports={wrapIndex,swipeDirection,wheelDirection};return;}
 const rack=document.querySelector('[data-rack="single"]');if(!rack)return;
 const products=JSON.parse(document.getElementById('store-data').textContent),byId=new Map(products.map(p=>[p.id,p]));
 const panels=[...rack.querySelectorAll('[data-meat-panel]')],types=panels.map(p=>p.dataset.meatPanel),buttons=[...rack.querySelectorAll('[data-rack-select]')],dots=[...rack.querySelectorAll('[data-meat-type]')];
 const viewport=rack.querySelector('.rack-viewport'),inspector=rack.querySelector('.rack-inspector'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,selected=null,lastButton=null,drag=null,blockClickUntil=0,wheelAmount=0,wheelLocked=false,wheelTimer,resizeTimer;
 const title=value=>value[0].toUpperCase()+value.slice(1);
 function announce(message){rack.querySelector('[data-rack-status]').textContent=message;}
 function notify(productId){rack.dispatchEvent(new CustomEvent('rackchange',{detail:{productId}}));}
 function center(button,smooth=false){const item=button.closest('.rack-item'),v=viewport.getBoundingClientRect(),b=item.getBoundingClientRect();viewport.scrollTo({left:viewport.scrollLeft+b.left-v.left+(b.width-v.width)/2,behavior:smooth&&!reduced.matches?'smooth':'instant'});}
 function clearAttention(){buttons.forEach(b=>{b.setAttribute('aria-pressed','false');b.setAttribute('aria-expanded','false');b.closest('.rack-item').classList.remove('is-selected');});}
 function closeInspection(restore=true){inspector.hidden=true;rack.classList.remove('is-inspecting');delete rack.dataset.inspectedProduct;clearAttention();selected=null;notify(null);if(restore&&lastButton&&!lastButton.closest('[hidden]'))lastButton.focus({preventScroll:true});}
 function setCategory(value,direction=0,announceChange=true){
  const wasInspecting=!inspector.hidden;
  const focusHidden=!!document.activeElement.closest?.('[data-meat-panel]')||inspector.contains(document.activeElement);
  closeInspection(false);index=wrapIndex(value,types.length);const kind=types[index];
  for(const panel of panels){panel.getAnimations?.().forEach(a=>a.cancel());panel.hidden=panel.dataset.meatPanel!==kind;}
  rack.dataset.activeType=kind;rack.style.setProperty('--rack-drag','0px');
  rack.querySelector('[data-type-name]').textContent=title(kind);rack.querySelector('[data-type-position]').textContent=`0${index+1} / 0${types.length}`;rack.querySelector('[data-next-type]').textContent=title(types[wrapIndex(index+1,types.length)]);
  dots.forEach(d=>d.setAttribute('aria-pressed',String(d.dataset.meatType===kind)));
  rack.dispatchEvent(new CustomEvent('rackcategorychange',{detail:{category:kind}}));
  const panel=panels[index];center(panel.querySelectorAll('[data-rack-select]')[1]);
  if(direction&&!reduced.matches&&panel.animate)panel.animate([{opacity:.3,transform:`translateX(${direction*65}px)`},{opacity:1,transform:'translateX(0)'}],{duration:260,easing:'cubic-bezier(.2,.7,.2,1)'});
  if(focusHidden)viewport.focus({preventScroll:true});
  if(wasInspecting&&matchMedia('(max-width:760px)').matches)rack.querySelector('.category-controls').scrollIntoView({block:'start',behavior:'auto'});
  if(announceChange){announce(`${title(kind)}. Three cuts to explore. Select a cut for information.`);history.replaceState(null,'','#meat-'+kind);}
 }
 function inspect(id,keyboard=false){const p=byId.get(id);if(!p||p.category!==types[index])return;selected=id;lastButton=buttons.find(b=>b.dataset.rackSelect===id);clearAttention();lastButton.setAttribute('aria-pressed','true');lastButton.setAttribute('aria-expanded','true');lastButton.closest('.rack-item').classList.add('is-selected');
  rack.querySelector('[data-rack-name]').textContent=p.name;rack.querySelector('[data-rack-caption]').textContent=p.caption;rack.querySelector('[data-inspector-category]').textContent=p.category.toUpperCase();rack.querySelector('[data-inspector-type]').textContent=title(p.category);rack.querySelector('[data-inspector-cut]').textContent=p.cut;rack.querySelector('[data-product]').dataset.product=id;rack.querySelector('[data-inspector-link]').href='products.html#'+id;
  inspector.hidden=false;rack.classList.add('is-inspecting');rack.dataset.inspectedProduct=id;center(lastButton,true);notify(id);announce(`${p.name} selected. Product information is open.`);
  if(keyboard){inspector.tabIndex=-1;inspector.focus({preventScroll:true});}
  if(matchMedia('(max-width:760px)').matches)inspector.scrollIntoView({block:'nearest',behavior:reduced.matches?'auto':'smooth'});
 }
 buttons.forEach(b=>b.addEventListener('click',e=>{if(performance.now()<blockClickUntil)return;inspect(b.dataset.rackSelect,e.detail===0);}));
 rack.querySelector('[data-close-inspection]').addEventListener('click',()=>closeInspection());
 rack.querySelectorAll('[data-type-direction]').forEach(b=>b.addEventListener('click',()=>setCategory(index+Number(b.dataset.typeDirection),Number(b.dataset.typeDirection))));
 dots.forEach(b=>b.addEventListener('click',()=>{const to=types.indexOf(b.dataset.meatType);if(to!==index)setCategory(to,to>index?1:-1);}));
 rack.addEventListener('keydown',e=>{if(e.key==='Escape'&&!inspector.hidden){e.preventDefault();closeInspection();}});
 viewport.addEventListener('keydown',e=>{let to,direction=0;if(e.key==='ArrowRight'){to=index+1;direction=1;}else if(e.key==='ArrowLeft'){to=index-1;direction=-1;}else if(e.key==='Home')to=0;else if(e.key==='End')to=types.length-1;else return;e.preventDefault();setCategory(to,direction);});
 viewport.addEventListener('click',e=>{if(performance.now()<blockClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;panels[index].getAnimations?.().forEach(a=>a.cancel());drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,moving:false};},{passive:true});
 viewport.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;drag.dx=e.clientX-drag.x;drag.dy=e.clientY-drag.y;if(!drag.moving&&Math.abs(drag.dx)>18&&Math.abs(drag.dx)>Math.abs(drag.dy)*1.2){drag.moving=true;viewport.setPointerCapture(e.pointerId);rack.classList.add('is-swiping');}if(drag.moving){if(e.cancelable)e.preventDefault();rack.style.setProperty('--rack-drag',Math.max(-75,Math.min(75,drag.dx*.35))+'px');}},{passive:false});
 function finishDrag(e,cancelled=false){if(!drag||drag.id!==e.pointerId)return;const gesture=drag;drag=null;rack.classList.remove('is-swiping');rack.style.setProperty('--rack-drag','0px');if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);if(gesture.moving||Math.hypot(gesture.dx,gesture.dy)>18)blockClickUntil=performance.now()+350;if(gesture.moving){if(!cancelled){const direction=swipeDirection(gesture.dx,gesture.dy);if(direction)setCategory(index+direction,direction);}}}
 viewport.addEventListener('pointerup',e=>finishDrag(e));viewport.addEventListener('pointercancel',e=>finishDrag(e,true));
 viewport.addEventListener('wheel',e=>{const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.1||e.shiftKey;if(!horizontal)return;if(e.cancelable)e.preventDefault();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{wheelAmount=0;wheelLocked=false;},180);if(wheelLocked)return;const raw=e.deltaX||e.deltaY;wheelAmount+=raw*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientWidth:1);const direction=wheelDirection(wheelAmount);if(direction){wheelLocked=true;setCategory(index+direction,direction);}},{passive:false});
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(selected)center(lastButton);else center(panels[index].querySelectorAll('[data-rack-select]')[1]);},100);});
 const initial=types.findIndex(t=>location.hash==='#meat-'+t||location.hash==='#rack-'+t);setCategory(initial<0?0:initial,0,false);
})();
