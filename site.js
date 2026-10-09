// Shared mobile navigation and service section behavior.
(function(){
  var toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.site-nav');
  function closeMenu(){if(!toggle||!nav)return;nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}
  if(toggle&&nav){
    toggle.addEventListener('click',function(){var open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
    nav.querySelectorAll('a').forEach(function(link){link.addEventListener('click',closeMenu);});
    document.addEventListener('keydown',function(event){if(event.key==='Escape'){closeMenu();document.querySelectorAll('.nav-services[open]').forEach(function(menu){menu.open=false;});toggle.focus();}});
    matchMedia('(max-width:900px)').addEventListener('change',closeMenu);
  }
  document.querySelectorAll('.page-accordion details').forEach(function(item){
    var timer,summary=item.querySelector('summary');
    summary.addEventListener('pointerenter',function(event){if(event.pointerType==='mouse')timer=setTimeout(function(){item.open=true;},160);});
    summary.addEventListener('pointerleave',function(){clearTimeout(timer);});
    item.addEventListener('toggle',function(){if(item.open)item.parentNode.querySelectorAll('details').forEach(function(other){if(other!==item)other.open=false;});});
  });
  var quoteForm=document.getElementById('quote-email-form');
  if(quoteForm){
    function draft(){
      var name=quoteForm.elements.name.value.trim(),email=quoteForm.elements.email.value.trim(),message=quoteForm.elements.message.value.trim();
      var body='Name: '+name+'\r\nEmail: '+email+'\r\n\r\n'+message;
      var url='mailto:enquiries@bigfoot.com.sg?subject='+encodeURIComponent('Quotation request')+'&body='+encodeURIComponent(body);
      quoteForm.dataset.emailDraft=url;
      return url;
    }
    quoteForm.addEventListener('input',draft);
    quoteForm.addEventListener('submit',function(event){
      event.preventDefault();
      if(quoteForm.reportValidity())window.location.href=draft();
    });
    draft();
  }
})();
