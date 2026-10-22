const menu=document.querySelector('.menu');const nav=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open);menu.textContent=open?'×':'☰';});
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');nav.classList.remove('open');menu.textContent='☰';}
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
const tabs=[...document.querySelectorAll('[role=tab]')];
function activateTab(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==index;});if(focus)tabs[index].focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activateTab(i));tab.addEventListener('keydown',e=>{let next=i;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activateTab(next,true);});});

// Keep the most recently hovered or keyboard-focused reassurance card highlighted.
const reassuranceCards=[...document.querySelectorAll('#care .values .value')];
function highlightReassurance(card){reassuranceCards.forEach(item=>item.classList.toggle('is-highlighted',item===card));}
if(reassuranceCards.length){
 highlightReassurance(reassuranceCards.find(card=>card.classList.contains('is-highlighted'))||reassuranceCards[0]);
 reassuranceCards.forEach(card=>{
  card.addEventListener('pointerenter',()=>highlightReassurance(card));
  card.addEventListener('focusin',()=>highlightReassurance(card));
 });
}
