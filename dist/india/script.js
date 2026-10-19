(() => {
 const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
 const mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 function setMenu(open,restore=false){nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.textContent=open?'×':'☰';if(restore)menu.focus();}
 menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
 nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
 document.addEventListener('click',e=>{if(!e.target.closest('.header')&&nav.classList.contains('open'))setMenu(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open'))setMenu(false,true);});
 mobile.addEventListener('change',()=>setMenu(false));
 const header=document.querySelector('.header');
 function headerSize(){document.documentElement.style.setProperty('--header-offset',`${header.offsetHeight+20}px`);}
 if('ResizeObserver'in window)new ResizeObserver(headerSize).observe(header);headerSize();
 const tabs=[...document.querySelectorAll('[role=tab]')];
 const keys=tabs.map(t=>t.getAttribute('aria-controls'));
 function selectService(index,update=false,focus=false){
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(keys[i]).hidden=i!==index;});
  if(update&&location.hash!=='#'+keys[index])history.pushState(null,'','#'+keys[index]);
  if(focus)tabs[index].focus();
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>selectService(i,true));
  tab.addEventListener('keydown',e=>{let next=i;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();selectService(next,true,true);});
 });
 function syncService(){const index=keys.indexOf(location.hash.slice(1));selectService(index<0?0:index);}
 window.addEventListener('hashchange',syncService);window.addEventListener('popstate',syncService);syncService();
 document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const key=link.getAttribute('href').slice(1),index=keys.indexOf(key);
  if(index>=0)selectService(index);
  const target=document.getElementById(key);if(!target)return;
  e.preventDefault();if(location.hash!=='#'+key)history.pushState(null,'','#'+key);
  (index>=0?document.getElementById('services'):target).scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  if(index>=0)tabs[index].focus({preventScroll:true});
  else{if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}
 }));
 const navLinks=[...nav.querySelectorAll('a[href^="#"]')];
 if('IntersectionObserver'in window){
  const seen=new Map();const observer=new IntersectionObserver(entries=>{entries.forEach(e=>seen.set(e.target.id,e.isIntersecting));const current=navLinks.find(a=>seen.get(a.hash.slice(1)));navLinks.forEach(a=>{if(a===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-15% 0px -55% 0px'});
  navLinks.forEach(a=>{const section=document.querySelector(a.hash);if(section)observer.observe(section);});
 }
 document.querySelectorAll('.faqs details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.faqs details').forEach(other=>{if(other!==item)other.open=false;});}));
 function dialogController(dialog){
  let opener;
  const close=()=>dialog.close();
  dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',close));
  dialog.addEventListener('click',e=>{const rect=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom))close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true});});
  return trigger=>{if(typeof dialog.showModal!=='function')return false;opener=trigger;setMenu(false);dialog.showModal();document.body.classList.add('dialog-open');return true;};
 }
 const enquiry=document.getElementById('enquiry-dialog'),form=document.getElementById('enquiry-form'),preview=document.getElementById('draft-preview');
 const openEnquiry=dialogController(enquiry);
 document.querySelectorAll('[data-open-enquiry]').forEach(link=>link.addEventListener('click',e=>{
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(!openEnquiry(link))return;e.preventDefault();preview.hidden=true;document.getElementById('form-error').textContent='';document.getElementById('copy-status').textContent='';
  const panel=link.closest('[role=tabpanel]');form.elements.topic.value=panel?{'cold-storage':'Cold storage','warehousing':'Warehousing','handling-delivery':'Handling & delivery'}[panel.id]:'General';
  enquiry.scrollTop=0;form.elements.name.focus({preventScroll:true});
 }));
 form.addEventListener('input',()=>{preview.hidden=true;document.getElementById('form-error').textContent='';document.getElementById('copy-status').textContent='';});
 form.addEventListener('submit',e=>{e.preventDefault();try{
  const draft=buildEnquiryDraft(Object.fromEntries(new FormData(form)));
  document.getElementById('draft-recipient').textContent=`To: ${draft.recipient} · ${draft.subject}`;document.getElementById('draft-body').textContent=draft.body;document.getElementById('draft-link').href=draft.href;
  preview.hidden=false;document.getElementById('form-error').textContent='';document.getElementById('draft-title').focus();
 }catch(error){document.getElementById('form-error').textContent=error.message;}});
 document.getElementById('copy-draft').addEventListener('click',async()=>{
  const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(document.getElementById('draft-recipient').textContent+'\n\n'+document.getElementById('draft-body').textContent);status.textContent='Enquiry copied.';}catch{status.textContent='Select the enquiry text above to copy it, or use Open email draft.';}
 });
 const photoDialog=document.getElementById('photo-dialog'),openPhoto=dialogController(photoDialog),photos=[...document.querySelectorAll('[data-photo]')];let photoIndex=0;
 function showPhoto(index){photoIndex=(index+photos.length)%photos.length;const trigger=photos[photoIndex],image=trigger.querySelector('img');document.getElementById('expanded-photo').src=image.src;document.getElementById('expanded-photo').alt=image.alt;document.getElementById('photo-caption').textContent=trigger.closest('figure').querySelector('figcaption').textContent;document.getElementById('photo-position').textContent=`${photoIndex+1} / ${photos.length}`;}
 photos.forEach((button,i)=>button.addEventListener('click',()=>{showPhoto(i);openPhoto(button);}));
 document.getElementById('previous-photo').addEventListener('click',()=>showPhoto(photoIndex-1));document.getElementById('next-photo').addEventListener('click',()=>showPhoto(photoIndex+1));
 photoDialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+(e.key==='ArrowRight'?1:-1));}});
})();
