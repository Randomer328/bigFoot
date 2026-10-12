(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function selector(buttonAttr,panelAttr,onChoose) {
    const buttons=[...document.querySelectorAll(`[${buttonAttr}]`)];
    const panels=[...document.querySelectorAll(`[${panelAttr}]`)];
    if(!buttons.length) return;
    const values=[...new Set(buttons.map(button=>button.getAttribute(buttonAttr)))];
    function choose(value) {
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute(buttonAttr)===value)));
      panels.forEach(panel=>panel.hidden=panel.getAttribute(panelAttr)!==value);
      onChoose?.(Number(value));
    }
    choose(values[0]);
    buttons.forEach(button=>{
      const value=button.getAttribute(buttonAttr);
      button.addEventListener('click',()=>choose(value));
      button.addEventListener('focus',()=>choose(value));
      button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse') choose(value);});
      button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const index=values.indexOf(value);
        const next=event.key==='Home'?0:event.key==='End'?values.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+values.length)%values.length;
        // Keep map pins and the corresponding text controls in their own keyboard group.
        const sameGroup=button.parentElement;
        buttons.find(candidate=>candidate.parentElement===sameGroup && candidate.getAttribute(buttonAttr)===values[next])?.focus();
      });
    });
  }
  selector('data-journey','data-journey-panel',index=>document.querySelector('.shipment-journey').style.setProperty('--shipment-position',`${10+index*20}%`));
  selector('data-connection','data-connection-panel',index=>document.querySelector('.connection-explorer').dataset.active=String(index));
  selector('data-region','data-region-panel');

  const range=document.getElementById('heritage-range');
  const compare=document.getElementById('heritage-images');
  if(range && compare) {
    const update=()=>{
      compare.style.setProperty('--reveal',`${range.value}%`);
      range.setAttribute('aria-valuetext',`${range.value}% heritage preview revealed`);
    };
    range.addEventListener('input',update);range.disabled=false;update();
    function position(event) {
      const rect=compare.getBoundingClientRect();
      range.value=String(Math.round(Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))));update();
    }
    compare.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0) return;
      compare.setPointerCapture(event.pointerId);position(event);
    });
    compare.addEventListener('pointermove',event=>{if(compare.hasPointerCapture(event.pointerId)) position(event);});
    compare.addEventListener('pointerup',event=>{if(compare.hasPointerCapture(event.pointerId)) compare.releasePointerCapture(event.pointerId);});
  }
  const route=document.querySelector('.final-route');
  if(route) {
    if(reduced.matches || !('IntersectionObserver' in window)) route.classList.add('is-drawn');
    else {
      const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){route.classList.add('is-drawn');observer.disconnect();}},{threshold:.35});
      observer.observe(route);
      reduced.addEventListener('change',event=>{if(event.matches){route.classList.add('is-drawn');observer.disconnect();}});
    }
  }
})();
