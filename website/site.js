(function(){
'use strict';
var LS='agf_lang', lang='en';
try{ lang=localStorage.getItem(LS)||((navigator.language||'').toLowerCase().indexOf('bn')===0?'bn':'en'); }catch(e){}
function t(k){ var d=window.I18N||{}; return (d[lang]&&d[lang][k])||(d.en&&d.en[k])||''; }
function applyLang(l){
  lang=l; try{localStorage.setItem(LS,l);}catch(e){}
  document.documentElement.lang=l; document.documentElement.classList.toggle('bn',l==='bn');
  document.querySelectorAll('[data-i18n]').forEach(function(el){ var v=t(el.getAttribute('data-i18n')); if(v) el.textContent=v; });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ var v=t(el.getAttribute('data-i18n-ph')); if(v) el.placeholder=v; });
  document.querySelectorAll('.lang-switch button').forEach(function(b){ var on=b.getAttribute('data-lang')===l; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on); });
  if(window.__lbRefresh) window.__lbRefresh();
}
document.querySelectorAll('.lang-switch button').forEach(function(b){ b.addEventListener('click',function(){ applyLang(b.getAttribute('data-lang')); }); });
applyLang(lang);

// mobile menu
var ham=document.getElementById('hamBtn'), dr=document.getElementById('drawer');
if(ham) ham.addEventListener('click',function(){ var o=dr.classList.toggle('open'); ham.setAttribute('aria-expanded',o); });

// product category tabs
document.querySelectorAll('.cat-tab[data-cat]').forEach(function(tab){ tab.addEventListener('click',function(){
  document.querySelectorAll('.cat-tab[data-cat]').forEach(function(x){x.classList.toggle('active',x===tab);});
  document.querySelectorAll('.cat-panel').forEach(function(p){p.classList.toggle('active',p.getAttribute('data-panel')===tab.getAttribute('data-cat'));});
  try{history.replaceState(null,'','#'+tab.getAttribute('data-cat'));}catch(e){}
});});
var h=location.hash.slice(1); if(h){ var ht=document.querySelector('.cat-tab[data-cat="'+h+'"]'); if(ht) ht.click(); }

// project filters
document.querySelectorAll('.cat-tab[data-filter]').forEach(function(tab){ tab.addEventListener('click',function(){
  var f=tab.getAttribute('data-filter');
  document.querySelectorAll('.cat-tab[data-filter]').forEach(function(x){x.classList.toggle('active',x===tab);});
  document.querySelectorAll('#workFilters ~ .works-grid .work').forEach(function(w){ w.hidden=!(f==='all'||w.getAttribute('data-cat')===f); });
});});

// lightbox
var lb=document.getElementById('lightbox');
if(lb){
  var cur=-1, img=document.getElementById('lbImg'), cap=document.getElementById('lbCap');
  function list(){ return Array.prototype.filter.call(document.querySelectorAll('.work-btn'),function(b){return !b.closest('.work').hidden;}); }
  function show(i){ var L=list(); if(!L.length) return; cur=(i+L.length)%L.length; var b=L[cur]; img.src=b.querySelector('img').src; img.alt=b.querySelector('img').alt; cap.textContent=b.closest('.work').querySelector('h3').textContent; }
  function open(b){ lb.hidden=false; document.body.style.overflow='hidden'; show(list().indexOf(b)); }
  function close(){ lb.hidden=true; document.body.style.overflow=''; }
  window.__lbRefresh=function(){ if(!lb.hidden) show(cur); };
  document.querySelectorAll('.work-btn').forEach(function(b){ b.addEventListener('click',function(){open(b);}); });
  document.getElementById('lbClose').addEventListener('click',close);
  document.getElementById('lbPrev').addEventListener('click',function(){show(cur-1);});
  document.getElementById('lbNext').addEventListener('click',function(){show(cur+1);});
  lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
  document.addEventListener('keydown',function(e){ if(lb.hidden) return; if(e.key==='Escape') close(); if(e.key==='ArrowLeft') show(cur-1); if(e.key==='ArrowRight') show(cur+1); });
}

// contact form
var form=document.getElementById('quoteForm');
if(form){
  var q=new URLSearchParams(location.search);
  if(q.get('product')){ var o=form.querySelector('#fproduct option[data-pid="'+q.get('product')+'"]'); if(o){ form.product.value=o.value; form.service.selectedIndex=/door|window|casement|tilt|tophung/i.test(o.getAttribute('data-pid'))?0:/curtain|railing|louver|partition/i.test(o.getAttribute('data-pid'))?1:/kitchen|living|office$/i.test(o.getAttribute('data-pid'))?2:0; } }
  if(q.get('subject')==='quote') form.service.value='Full Facade Project';
  var msg=document.getElementById('formMsg'), btn=document.getElementById('submitBtn'), lbl=document.getElementById('submitLbl');
  function say(txt,cls){ msg.className='form-msg show '+cls; msg.textContent=txt; }
  form.addEventListener('submit',function(e){
    e.preventDefault(); msg.className='form-msg';
    ['name','email','phone','message'].forEach(function(n){ form[n].classList.remove('bad'); });
    var bad=[]; if(form.name.value.trim().length<2) bad.push('name');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value.trim())) bad.push('email');
    if(form.phone.value.replace(/\D/g,'').length<7) bad.push('phone');
    if(form.message.value.trim().length<5) bad.push('message');
    if(bad.length){ bad.forEach(function(n){form[n].classList.add('bad');}); say(t('f.invalid'),'err'); form[bad[0]].focus(); return; }
    var data={}; new FormData(form).forEach(function(v,k){data[k]=String(v).trim();}); data.lang=lang; data.page=location.href;
    btn.disabled=true; lbl.textContent=t('f.sending');
    fetch((window.AG_API||'')+'/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){ return r.json().then(function(j){ if(!r.ok||!j.ok) throw j; return j; }); })
      .then(function(j){ say(t('f.ok')+' '+j.ref+'. '+t('f.ok2'),'ok'); form.reset(); })
      .catch(function(j){ if(j&&j.fields){ j.fields.forEach(function(n){ if(form[n]) form[n].classList.add('bad'); }); say(t('f.invalid'),'err'); } else say(t('f.err'),'err'); })
      .then(function(){ btn.disabled=false; lbl.textContent=t('f.send'); });
  });
}

// catalogue viewer
var vp=document.getElementById('vPages');
if(vp){
  var Z=1, pages=[].slice.call(vp.querySelectorAll('.cat-page')), cur=1, zl=document.getElementById('vZoom'), vc=document.getElementById('vCur'), sc=document.getElementById('vScroll');
  function setZ(z){ Z=Math.max(.6,Math.min(2.4,Math.round(z*10)/10)); vp.style.setProperty('--z',Z); zl.textContent=Math.round(Z*100)+'%'; sc.classList.toggle('zoomed',Z>1); }
  function go(n){ n=Math.max(1,Math.min(pages.length,n)); var r=pages[n-1].getBoundingClientRect(); window.scrollTo({top:window.pageYOffset+r.top-140,behavior:'smooth'}); }
  document.getElementById('vIn').addEventListener('click',function(){setZ(Z+.2);});
  document.getElementById('vOut').addEventListener('click',function(){setZ(Z-.2);});
  document.getElementById('vFit').addEventListener('click',function(){setZ(1);});
  document.getElementById('vPrev').addEventListener('click',function(){go(cur-1);});
  document.getElementById('vNext').addEventListener('click',function(){go(cur+1);});
  if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ cur=+e.target.getAttribute('data-p'); vc.textContent=cur; } }); },{rootMargin:'-45% 0px -45% 0px'}); pages.forEach(function(p){io.observe(p);}); }
  setZ(1);
}
})();
