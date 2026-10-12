/* Pure helper shared with the meaningful enquiry regression tests. */
function buildEnquiryDraft(input) {
  const fields={};
  for(const key of ['name','email','organisation','topic','message']) fields[key]=String(input[key]||'').trim();
  if(!fields.name || !fields.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new Error('Please enter your name, a valid email address and a message.');
  if(!['Logistics','Partnership','Careers','General'].includes(fields.topic)) throw new Error('Please select an enquiry topic.');
  const recipient=fields.topic==='Careers'?'recruitment@bigfoot.com.sg':'enquiries@bigfoot.com.sg';
  const subject=`Bigfoot — ${fields.topic} enquiry`;
  const body=`Name: ${fields.name}\nEmail: ${fields.email}\n${fields.organisation?`Organisation: ${fields.organisation}\n`:''}Topic: ${fields.topic}\n\n${fields.message}`;
  return {recipient,subject,body,href:`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
if(typeof module!=='undefined' && module.exports) module.exports={buildEnquiryDraft};

if(typeof document!=='undefined') {
  document.documentElement.classList.add('js');
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.getElementById('navigation');
  function menu(open,restore=false) {
    nav.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    if(restore) toggle.focus();
  }
  toggle.addEventListener('click',()=>menu(toggle.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',e=>{if(e.target.closest('a')) menu(false);});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header') && nav.classList.contains('is-open')) menu(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && nav.classList.contains('is-open')) menu(false,true);});
  matchMedia('(min-width:981px)').addEventListener('change',e=>{if(e.matches) menu(false);});

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pillarButtons=[...document.querySelectorAll('[data-pillar-select]')];
  const pillarMotion=document.getElementById('pillar-motion');
  if(pillarMotion && pillarButtons.length) {
    const cards=[...document.querySelectorAll('[data-pillar-card]')];
    const vehicles=[...pillarMotion.querySelectorAll('[data-vehicle]')];
    function choosePillar(index) {
      pillarButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
      cards.forEach((card,i)=>card.dataset.active=String(i===index));
      vehicles.forEach((vehicle,i)=>vehicle.classList.toggle('is-current',i===index));
      pillarMotion.style.setProperty('--vehicle-position',`${12.5+index*25}%`);
    }
    pillarButtons.forEach((button,index)=>{
      button.addEventListener('click',()=>choosePillar(index));
      button.addEventListener('focus',()=>choosePillar(index));
      cards[index].addEventListener('pointerenter',event=>{if(event.pointerType==='mouse') choosePillar(index);});
      button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next=event.key==='Home'?0:event.key==='End'?pillarButtons.length-1:
          (index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+pillarButtons.length)%pillarButtons.length;
        pillarButtons[next].focus();
      });
    });
  }
  if('IntersectionObserver' in window && !reduced.matches) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.remove('is-pending');observer.unobserve(entry.target);}
    }),{threshold:0.08});
    document.querySelectorAll('.reveal').forEach(element=>{element.classList.add('is-pending');observer.observe(element);});
    reduced.addEventListener('change',e=>{if(e.matches){document.querySelectorAll('.is-pending').forEach(x=>x.classList.remove('is-pending'));observer.disconnect();}});
  }

  document.querySelectorAll('details[name]').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open) document.querySelectorAll('details[name]').forEach(other=>{if(other!==detail && other.getAttribute('name')===detail.getAttribute('name')) other.open=false;});
  }));

  const dialog=document.getElementById('film-dialog');
  let filmOpener;
  document.querySelectorAll('[data-open-film]').forEach(link=>link.addEventListener('click',event=>{
    if(typeof dialog.showModal!=='function') return;
    event.preventDefault();filmOpener=link;
    const frame=dialog.querySelector('iframe');frame.src=frame.dataset.filmSrc;
    dialog.showModal();dialog.querySelector('[data-close-film]').focus();
  }));
  dialog.querySelector('[data-close-film]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    if(event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close',()=>{dialog.querySelector('iframe').removeAttribute('src');filmOpener?.focus();});

  const form=document.getElementById('enquiry-form');
  if(form) {
    const topic=new URLSearchParams(location.search).get('topic');
    if(['Logistics','Partnership','Careers','General'].includes(topic)) form.elements.topic.value=topic;
    form.addEventListener('input',()=>{document.getElementById('draft-preview').hidden=true;document.getElementById('form-error').textContent='';});
    form.addEventListener('submit',event=>{
      event.preventDefault();
      try {
        const draft=buildEnquiryDraft(Object.fromEntries(new FormData(form)));
        document.getElementById('draft-recipient').textContent=`To: ${draft.recipient} · ${draft.subject}`;
        document.getElementById('draft-body').textContent=draft.body;
        document.getElementById('draft-link').href=draft.href;
        document.getElementById('draft-preview').hidden=false;
        document.getElementById('form-error').textContent='';
        document.getElementById('draft-title').focus();
      } catch(error) {document.getElementById('form-error').textContent=error.message;}
    });
    // Install the intercepting handler before allowing a native submit action.
    form.querySelector('button[type="submit"]').disabled=false;
  }
}
