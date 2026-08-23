(() => {
  'use strict';
  const STORAGE_KEY='melato:saved-products:v1';
  const normalize=v=>String(v||'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(x)?x.filter(i=>i&&i.handle):[]}catch(_){return[]}};
  const write=items=>{const seen=new Set(),unique=[];items.forEach(i=>{if(i?.handle&&!seen.has(i.handle)){seen.add(i.handle);unique.push(i)}});localStorage.setItem(STORAGE_KEY,JSON.stringify(unique));sync();window.dispatchEvent(new CustomEvent('melato:saved-updated',{detail:{items:unique}}))};

  function header(){
    const h=document.querySelector('.mxh,[data-house-header]'); if(!h)return;
    const host=h.closest('.shopify-section')||h.parentElement; if(host)host.classList.add('melato-header-host');
    const mark=h.querySelector('.mxh__menu-mark'); if(mark&&!mark.dataset.cleanup){mark.dataset.cleanup='1';mark.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'}
    if(!h.querySelector('.melato-saved-header-link')){
      const slot=h.querySelector('.mxh__left,.melato-house-header__left,.mxh__right,.melato-house-header__right');
      if(slot){const a=document.createElement('a');a.href='/pages/saved-products';a.className='melato-saved-header-link';a.setAttribute('aria-label','Saved products');a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="melato-saved-header-count" data-count="0"></span>';slot.appendChild(a)}
    }
  }
  function cardItem(card){if(!card)return null;const handle=card.dataset.productHandle;if(!handle)return null;const title=normalize(card.querySelector('.product-card__title,.product-card__heading')?.textContent);const url=card.querySelector('.product-card__title,.product-card__heading a,.product-card__media a')?.getAttribute('href')||('/products/'+handle);const imageEl=card.querySelector('.product-card__img--primary,.product-card__media img');return{handle,title,url,image:imageEl?.currentSrc||imageEl?.src||'',price:normalize(card.querySelector('.product-card__price')?.textContent)}}
  function cards(root=document){root.querySelectorAll('[data-product-card]').forEach(card=>{let b=card.querySelector('[data-wishlist-btn],.melato-card-save');if(!b){b=document.createElement('button');b.type='button';b.className='melato-card-save';b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';card.querySelector('.product-card__media')?.appendChild(b)}b.setAttribute('data-melato-save','');if(card.dataset.productHandle)b.dataset.productHandle=card.dataset.productHandle})}
  function sync(){const saved=read(),handles=new Set(saved.map(i=>i.handle));document.querySelectorAll('[data-melato-save]').forEach(b=>{const h=b.dataset.productHandle||b.closest('[data-product-card]')?.dataset.productHandle;const on=handles.has(h);b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Remove from saved products':'Save product')});document.querySelectorAll('.melato-saved-header-count').forEach(n=>{n.textContent=saved.length?String(saved.length):'';n.dataset.count=String(saved.length)});document.querySelectorAll('.melato-saved-header-link').forEach(n=>n.classList.toggle('is-active',saved.length>0))}
  function money(cents){if(window.Shopify&&typeof Shopify.formatMoney==='function')return Shopify.formatMoney(cents,window.DRIP?.shop?.moneyFormat||'${{amount}}');return'$'+(Number(cents||0)/100).toFixed(2)}
  async function savedPage(){const root=document.querySelector('[data-melato-saved-page]');if(!root)return;const grid=root.querySelector('[data-saved-grid]'),empty=root.querySelector('[data-saved-empty]'),items=read();if(!items.length){if(grid)grid.innerHTML='';if(empty)empty.hidden=false;return}if(empty)empty.hidden=true;if(grid)grid.innerHTML='<p style="grid-column:1/-1;color:#9b968d">Loading…</p>';const out=await Promise.all(items.map(async i=>{try{const r=await fetch('/products/'+encodeURIComponent(i.handle)+'.js',{headers:{Accept:'application/json'}});if(!r.ok)throw 0;const p=await r.json();return{...i,title:p.title||i.title,url:p.url||i.url||('/products/'+i.handle),image:p.featured_image||i.image||'',price:money(p.price),available:p.available!==false}}catch(_){return i}}));if(grid)grid.innerHTML=out.map(i=>'<article class="melato-saved-card"><a class="melato-saved-card__media" href="'+esc(i.url||('/products/'+i.handle))+'">'+(i.image?'<img src="'+esc(i.image)+'" alt="'+esc(i.title)+'" loading="lazy">':'')+'</a><button class="melato-saved-card__remove" type="button" data-remove-saved="'+esc(i.handle)+'" aria-label="Remove '+esc(i.title)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button><div class="melato-saved-card__body"><h2 class="melato-saved-card__title"><a href="'+esc(i.url||('/products/'+i.handle))+'">'+esc(i.title)+'</a></h2><p class="melato-saved-card__price">'+esc(i.price||'')+(i.available===false?' · SOLD OUT':'')+'</p></div></article>').join('')}
  function cleanup(){
    document.querySelectorAll('.cart-upsell').forEach(x=>{if(!x.querySelector('.upsell-card,[data-upsell-track]>*'))x.remove()});
    document.querySelectorAll('#cart-drawer a[data-cart-close][href]').forEach(a=>a.removeAttribute('data-cart-close'));
    // PDP disclosure state is user-owned. Never force-close product <details> here.
    document.querySelectorAll('body.template-product .pdp-sticky-atc').forEach(s=>{if(s.querySelector('button[disabled],.pdp-atc--oos'))s.remove()});
  }
  function run(){header();cards();sync();cleanup();savedPage()}
  function installObserver(){
    // Product pages are server-rendered and interactive. Never run document-wide
    // cleanup mutation cycles there, because user-owned disclosure state must persist.
    if(document.body.matches('.template-product'))return;
    let t;
    new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>{header();cards();sync();cleanup()},100)}).observe(document.documentElement,{childList:true,subtree:true});
  }
  function boot(){run();installObserver()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
