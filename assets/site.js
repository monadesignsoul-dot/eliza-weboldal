
(()=>{
  const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
  function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.innerHTML='Menü <span aria-hidden="true">☰</span>'}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.innerHTML=open?'Bezárás <span aria-hidden="true">×</span>':'Menü <span aria-hidden="true">☰</span>'});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
  window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
  const header=document.querySelector('#header');let ticking=false;function updateHeader(){header.classList.toggle('scrolled',window.scrollY>30);ticking=false}window.addEventListener('scroll',()=>{if(!ticking){window.requestAnimationFrame(updateHeader);ticking=true}},{passive:true});updateHeader();
  document.querySelectorAll('form[data-demo="newsletter"]').forEach(form=>{form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const name=form.querySelector('input[name="name"]');if(!name.value.trim()){name.setCustomValidity('Kérlek, add meg a teljes nevedet.');name.reportValidity();return}const msg=form.querySelector('textarea');if(msg&&!msg.value.trim()){msg.setCustomValidity('Kérlek, írd le röviden, miben segíthetek.');msg.reportValidity();return}form.querySelector('.form-status').textContent=form.dataset.demo==='newsletter'?'A feliratkozás és a kisokos letöltése jelenleg nem elérhető. Nem történt adatküldés.':'Az üzenetküldés jelenleg nem elérhető. Nem történt adatküldés vagy időpontkérés.'});form.querySelectorAll('input,textarea').forEach(field=>field.addEventListener('input',()=>{field.setCustomValidity('');form.querySelector('.form-status').textContent=''}))});
  const dialog=document.querySelector('#privacy-dialog');document.querySelectorAll('[data-privacy]').forEach(btn=>btn.addEventListener('click',()=>dialog.showModal()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  document.querySelectorAll('[data-treatment]').forEach(link=>link.addEventListener('click',()=>{const field=document.querySelector('#contact-message');if(!field.value.trim())field.value='Szeretnék érdeklődni: '+link.dataset.treatment+'.';field.dispatchEvent(new Event('input'))}));
})();

(() => {
  document.querySelectorAll('form[data-contact-form]').forEach(form => {
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    let sending = false;
    form.querySelectorAll('input:not([type="hidden"]),textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        if (!sending) {status.textContent=''; delete status.dataset.state;}
      });
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending) return;
      const name = form.elements.namedItem('name');
      const message = form.elements.namedItem('message');
      name.setCustomValidity(name.value.trim() ? '' : 'Kérlek, add meg a teljes nevedet.');
      message.setCustomValidity(message.value.trim() ? '' : 'Kérlek, írd le röviden, miben segíthetek.');
      if (!form.reportValidity()) return;
      const buttonContent = button.innerHTML;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      sending=true;
      button.disabled=true;
      button.textContent='Küldés folyamatban…';
      form.setAttribute('aria-busy','true');
      status.dataset.state='sending';
      status.textContent='Az üzenet küldése folyamatban…';
      try {
        const payload = new FormData(form);
        payload.set('name',name.value.trim());
        payload.set('email',form.elements.namedItem('email').value.trim());
        payload.set('message',message.value.trim());
        payload.set('source-page',window.location.pathname);
        const response = await fetch('/', {
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams(payload).toString(),
          signal:controller.signal,
        });
        if (!response.ok) throw new Error('Submission failed');
        form.reset();
        status.dataset.state='success';
        status.textContent='Köszönöm az üzeneted! Hamarosan jelentkezem az időpont egyeztetésével.';
      } catch {
        status.dataset.state='error';
        status.textContent='Az üzenetet nem sikerült elküldeni. Kérlek, próbáld újra; a beírt adataid megmaradtak.';
      } finally {
        clearTimeout(timeout);
        sending=false;
        button.disabled=false;
        button.innerHTML=buttonContent;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
