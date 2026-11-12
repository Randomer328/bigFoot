(() => {'use strict';
 document.documentElement.classList.add('js');
 const menu=document.querySelector('.menu'),nav=document.getElementById('navigation');
 function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
 menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
 matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 const form=document.getElementById('enquiry-form');if(!form)return;
 const type=document.getElementById('carcass'),prefill=new URLSearchParams(location.search).get('carcass');if([...type.options].some(o=>o.value===prefill))type.value=prefill;
 const dialog=document.getElementById('enquiry-review');let draft='';
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 form.querySelectorAll('[required]').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
 form.addEventListener('submit',e=>{e.preventDefault();for(const input of form.querySelectorAll('[required]')){input.setCustomValidity(input.value.trim()?'':'Please enter this detail.');if(!input.reportValidity())return;}const data=new FormData(form);draft=['BIGFOOT MEATS AUSTRALIA — SUPPLY ENQUIRY','','Please review these requirements and confirm availability, specifications, pricing and supply arrangements.','','PRODUCT & SUPPLY',`Enquiry type: ${data.get('carcass')}`,`Number of carcasses: ${data.get('count')||'To discuss'}`,`Destination: ${data.get('destination').trim()}`,'','SPECIFICATIONS & REQUIREMENTS',data.get('specs').trim(),'','CONTACT DETAILS',`Name: ${data.get('name').trim()}`,`Company: ${data.get('company').trim()||'Not supplied'}`,`Email: ${data.get('email').trim()}`,`Phone: ${data.get('phone').trim()||'Not supplied'}`].join('\n');document.getElementById('draft-preview').textContent=draft;document.getElementById('email-draft').href=`mailto:enquiries@bigfoot.com.sg?subject=${encodeURIComponent('Bigfoot Meats Australia — '+data.get('carcass')+' enquiry')}&body=${encodeURIComponent(draft)}`;document.getElementById('draft-status').textContent='Nothing has been sent. Open your email app to send, or copy the enquiry.';dialog.showModal();});
 document.getElementById('copy-draft').addEventListener('click',async()=>{const status=document.getElementById('draft-status');try{await navigator.clipboard.writeText(draft);status.textContent='Enquiry copied. Paste it into an email to enquiries@bigfoot.com.sg.';}catch{const range=document.createRange();range.selectNodeContents(document.getElementById('draft-preview'));getSelection().removeAllRanges();getSelection().addRange(range);status.textContent='Copy the highlighted enquiry and email enquiries@bigfoot.com.sg.';}});
 document.getElementById('enquiry-fields').disabled=false;
})();
