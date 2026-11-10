(() => {
 'use strict';
 const physics=globalThis.MeatRackPhysics;if(!physics)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),motions=[];let frame=0,last=0;
 function touched(m,now){return m.hover||m.focus||m.touchUntil>now;}
 function target(m,now){if(reduced.matches)return 0;if(touched(m,now))return .24;return m.selected ? 0.075 : 0;}
 function twistTarget(m,now){return reduced.matches||m.selected||touched(m,now)?0:-.22;}
 function paint(m){const s=m.assembly.style;s.setProperty('--motion-pitch',m.pitch.angle.toFixed(5)+'rad');s.setProperty('--motion-swing',m.swing.angle.toFixed(5)+'rad');s.setProperty('--motion-twist',(m.twist.angle+m.swing.angle*.2).toFixed(5)+'rad');s.setProperty('--shadow-x',(6+m.swing.angle*30).toFixed(2)+'px');s.setProperty('--shadow-y',(10+m.pitch.angle*30).toFixed(2)+'px');s.setProperty('--shadow-blur',(7+Math.abs(m.pitch.angle)*13).toFixed(2)+'px');m.item.classList.toggle('is-touched',m.hover||m.focus||m.touchUntil>performance.now());}
 function wake(){if(!frame&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
 function tick(now){frame=0;const dt=last?Math.min((now-last)/1000,1/30):1/120;last=now;let moving=false;
  for(const m of motions){const aim=target(m,now),yaw=twistTarget(m,now);if(reduced.matches||!m.visible){m.pitch.angle=aim;m.pitch.velocity=0;m.swing.angle=0;m.swing.velocity=0;m.twist.angle=yaw;m.twist.velocity=0;}else{physics.advance(m.pitch,aim,dt);physics.advance(m.swing,0,dt);physics.advance(m.twist,yaw,dt);}paint(m);if(m.visible&&!reduced.matches&&(Math.abs(m.pitch.angle-aim)>.00006||Math.abs(m.pitch.velocity)>.0002||Math.abs(m.swing.angle)>.00006||Math.abs(m.swing.velocity)>.0002||Math.abs(m.twist.angle-yaw)>.00006||Math.abs(m.twist.velocity)>.0002||m.touchUntil>now))moving=true;}
  if(moving&&!document.hidden)frame=requestAnimationFrame(tick);else last=0;
 }
 document.querySelectorAll('[data-rack]').forEach(rack=>{
  const local=[];
  rack.querySelectorAll('[data-rack-select]').forEach(button=>{
   const mass=Number(button.dataset.motionMass)||1,m={button,item:button.closest('.rack-item'),assembly:button.querySelector('.hanger-assembly'),pitch:physics.create(mass),swing:physics.create(mass*1.1),twist:physics.create(mass*.8),selected:button.getAttribute('aria-pressed')==='true',hover:false,focus:false,touchUntil:0,visible:false,previousX:0};if(!m.assembly)return;motions.push(m);local.push(m);m.pitch.angle=target(m,0);m.twist.angle=twistTarget(m,0);paint(m);
   button.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||reduced.matches)return;m.hover=true;const r=button.getBoundingClientRect();m.previousX=e.clientX;m.swing.velocity+=((e.clientX-r.left)/r.width-.5)*.7/mass;m.pitch.velocity+=.08/mass;wake();});
   button.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!m.hover||reduced.matches)return;const dx=Math.max(-12,Math.min(12,e.clientX-m.previousX));m.swing.velocity=Math.max(-.8,Math.min(.8,m.swing.velocity+dx*.003/mass));m.previousX=e.clientX;wake();});
   button.addEventListener('pointerleave',()=>{m.hover=false;wake();});
   button.addEventListener('pointerdown',e=>{if(reduced.matches)return;if(e.pointerType!=='mouse')m.touchUntil=performance.now()+450;m.swing.velocity+=.13/mass;wake();},{passive:true});
   button.addEventListener('pointercancel',()=>{m.touchUntil=0;m.hover=false;wake();});
   button.addEventListener('focus',()=>{m.focus=button.matches(':focus-visible');wake();});button.addEventListener('blur',()=>{m.focus=false;wake();});
  });
  rack.addEventListener('rackchange',e=>{for(const m of local){const was=m.selected;m.selected=m.button.dataset.rackSelect===e.detail.productId;if(m.selected&&!was&&!reduced.matches)m.swing.velocity+=.09/m.swing.mass;}wake();});
  const observer=new IntersectionObserver(entries=>{for(const e of entries){for(const m of local){m.visible=e.isIntersecting;if(!e.isIntersecting){m.hover=false;m.touchUntil=0;}}}wake();},{rootMargin:'30px'});observer.observe(rack.querySelector('.rack-display'));
 });
 reduced.addEventListener('change',wake);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;for(const m of motions){m.hover=false;m.touchUntil=0;}}else wake();});
 wake();
})();
