(() => {
  'use strict';
  const STORAGE_KEY = 'melato:saved-products:v1';
  const normalize = v => String(v || '').replace(/\s+/g, ' ').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

  function readSaved(){
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(value) ? value.filter(x => x && x.handle) : []; }
    catch (_) { return []; }
  }
  function writeSaved(items){
    const unique = [];
    const seen = new Set();
    items.forEach(item => { if(item && item.handle && !seen.has(item.handle)){ seen.add(item.handle); unique.push(item); } });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    syncSavedUI();
    window.dispatchEvent(new CustomEvent('melato:saved-updated', {detail:{items:unique}}));
  }
  function toggleSaved(item){
    if(!item || !item.handle) return;
    const saved = readSaved();
    const exists = saved.some(x => x.handle === item.handle);
    writeSaved(exists ? saved.filter(x => x.handle !== item.handle) : [item, ...saved]);
  }

  function markHeaderSticky(){
    const header = document.querySelector('.mxh, [data-house-header]');
    if(!header) return;
    const host = header.closest('.shopify-section') || header.parentElement;
    if(host) host.classList.add('melato-header-host');
  }

  function ensureMenuIcon(){
    const mark = document.querySelector('.mxh__menu-mark');
    if(!mark || mark.dataset.melatoHamburger === 'true') return;
    mark.dataset.melatoHamburger = 'true';
    mark.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  }

  function ensureCartClose(){
    const drawer = document.querySelector('#cart-drawer');
    if(!drawer) return;
    const header = drawer.querySelector('.cart-drawer__header');
    if(!header) return;
    const wrong = header.querySelector('.header-cart-button');
    let close = header.querySelector('[data-cart-close]');
    if(!close){
      close = document.createElement('button');
      close.type = 'button';
      close.className = 'cart-drawer__close-btn';
      close.setAttribute('data-cart-close','');
      close.setAttribute('aria-label','Close cart and continue shopping');
      close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      if(wrong) wrong.replaceWith(close); else header.appendChild(close);
    } else if(wrong){ wrong.remove(); }
  }

  function ensureHeaderSaved(){
    const header = document.querySelector('.mxh, [data-house-header]');
    if(!header || header.querySelector('.melato-saved-header-link')) return;
    const slot = header.querySelector('.mxh__left, .melato-house-header__left, .mxh__right, .melato-house-header__right');
    if(!slot) return;
    const link = document.createElement('a');
    link.href = '/pages/saved-products';
    link.className = 'melato-saved-header-link';
    link.setAttribute('aria-label','View saved products');
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="melato-saved-header-count" data-count="0"></span>';
    slot.appendChild(link);
  }

  function cardItem(card){
    if(!card) return null;
    const handle = card.getAttribute('data-product-handle');
    if(!handle) return null;
    const title = normalize(card.querySelector('.product-card__title, .product-card__heading')?.textContent);
    const url = card.querySelector('.product-card__title a, .product-card__heading a, .product-card__media a')?.getAttribute('href') || ('/products/' + handle);
    const imageEl = card.querySelector('.product-card__img--primary, .product-card__media img');
    const image = imageEl?.currentSrc || imageEl?.src || '';
    const price = normalize(card.querySelector('.product-card__price')?.textContent);
    return { handle, title, url, image, price };
  }

  function ensureCardSaveButtons(root=document){
    root.querySelectorAll('[data-product-card]').forEach(card => {
      let button = card.querySelector('[data-wishlist-btn], .melato-card-save');
      if(!button){
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'melato-card-save';
        button.setAttribute('aria-label','Save product');
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        card.querySelector('.product-card__media')?.appendChild(button);
      }
      button.setAttribute('data-melato-save','');
      const item = cardItem(card);
      if(item?.handle) button.setAttribute('data-product-handle', item.handle);
    });
  }

  function normalizeBadges(root=document){
    root.querySelectorAll('.product-card__badges .badge').forEach(badge => {
      const text = normalize(badge.textContent).toUpperCase();
      if(text === 'NEW' || text === 'NEW DROP') badge.textContent = 'NEW IN';
    });
  }

  async function enhanceCollectionBadges(){
    const match = location.pathname.match(/^\/collections\/([^/?#]+)/i);
    if(!match || !document.querySelector('[data-product-card]')) return;
    const handle = match[1];
    try{
      const response = await fetch('/collections/' + encodeURIComponent(handle) + '/products.json?limit=250', {headers:{Accept:'application/json'}});
      if(!response.ok) return;
      const payload = await response.json();
      const products = new Map((payload.products || []).map(p => [p.handle, p]));
      document.querySelectorAll('[data-product-card]').forEach(card => {
        const product = products.get(card.getAttribute('data-product-handle'));
        if(!product) return;
        let badges = card.querySelector('.product-card__badges');
        if(!badges){ badges=document.createElement('div'); badges.className='product-card__badges'; card.querySelector('.product-card__media')?.appendChild(badges); }
        const existing = new Set(Array.from(badges.querySelectorAll('.badge')).map(b => normalize(b.textContent).toUpperCase()));
        const tags = (product.tags || []).map(tag => String(tag).toLowerCase());
        const add = (label, cls) => { if(existing.has(label)) return; const span=document.createElement('span'); span.className='badge '+cls; span.textContent=label; badges.appendChild(span); existing.add(label); };
        if(product.available === false) add('SOLD OUT','badge--sold-out');
        if(tags.some(tag => tag === 'exclusive' || tag === 'web_exclusive' || tag === 'online_exclusive' || tag.includes('exclusive'))) add('EXCLUSIVE','badge--exclusive');
        if(tags.some(tag => tag === 'new' || tag === 'new_arrival' || tag === 'new-arrival' || tag === 'new_arrivals' || tag.includes('new_arrival'))) add('NEW IN','badge--new');
      });
    }catch(_){ /* status enhancement is non-blocking */ }
  }

  function syncSavedUI(){
    const saved = readSaved();
    const handles = new Set(saved.map(x => x.handle));
    document.querySelectorAll('[data-melato-save]').forEach(button => {
      const handle = button.getAttribute('data-product-handle') || button.closest('[data-product-card]')?.getAttribute('data-product-handle');
      const active = handles.has(handle);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('aria-label', active ? 'Remove from saved products' : 'Save product');
    });
    document.querySelectorAll('.melato-saved-header-count').forEach(node => {
      node.textContent = saved.length ? String(saved.length) : '';
      node.dataset.count = String(saved.length);
    });
    document.querySelectorAll('.melato-saved-header-link').forEach(node => node.classList.toggle('is-active', saved.length > 0));
  }

  function cleanCompleteSetArtifacts(){
    document.querySelectorAll('.pdp-set-card').forEach(card => {
      if(!document.createTreeWalker) return;
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      const bad = [];
      while(walker.nextNode()){
        const node = walker.currentNode;
        if(node.parentElement?.closest('.pdp-set-label')) continue;
        const text = normalize(node.nodeValue).toLowerCase().replace(/^,\s*/, '');
        if(text === 'selected piece' || text === 'matching piece' || text === 'matching pants' || text === 'matching jacket') bad.push(node);
      }
      bad.forEach(node => node.nodeValue='');
    });
  }

  function ensureServiceHero(){
    if(!/^\/pages\/(size-guide|size-guide-1|shipping-returns)\/?$/i.test(location.pathname)) return;
    const page = document.querySelector('.melato-page');
    if(!page || page.querySelector('.melato-page-header')) return;
    const shipping = /shipping-returns/i.test(location.pathname);
    const title = shipping ? 'Shipping & Returns' : 'Fit Guide';
    const sub = shipping ? 'Processing, delivery, tracking and return guidance in one place.' : 'Product-specific measurements, fit notes and personal sizing support.';
    const header = document.createElement('header');
    header.className = 'melato-page-header melato-hotfix-service-header';
    header.innerHTML = '<div class="melato-eyebrow">Melato Client Services</div><h1 class="melato-page-header__title">'+title+'</h1><p class="melato-page-header__subtitle">'+sub+'</p>';
    page.insertBefore(header, page.firstChild);
    const firstH1 = page.querySelector('.melato-container .rte h1');
    if(firstH1) firstH1.style.display = 'none';
  }

  function formatMoney(cents){
    if(window.Shopify && typeof window.Shopify.formatMoney === 'function'){
      const fmt = window.DRIP?.shop?.moneyFormat || '${{amount}}';
      return window.Shopify.formatMoney(cents, fmt);
    }
    return '$' + (Number(cents || 0) / 100).toFixed(2);
  }

  async function renderSavedPage(){
    const root = document.querySelector('[data-melato-saved-page]');
    if(!root) return;
    const grid = root.querySelector('[data-saved-grid]');
    const empty = root.querySelector('[data-saved-empty]');
    const items = readSaved();
    if(!items.length){ if(grid) grid.innerHTML=''; if(empty) empty.hidden=false; return; }
    if(empty) empty.hidden=true;
    if(grid) grid.innerHTML = '<p style="grid-column:1/-1;color:#9b968d">Loading saved pieces…</p>';
    const resolved = await Promise.all(items.map(async item => {
      try{
        const response = await fetch('/products/' + encodeURIComponent(item.handle) + '.js', {headers:{Accept:'application/json'}});
        if(!response.ok) throw new Error('not found');
        const p = await response.json();
        return {handle:item.handle,title:p.title || item.title,url:p.url || item.url || ('/products/'+item.handle),image:p.featured_image || item.image || '',price:formatMoney(p.price),available:p.available !== false};
      }catch(_){ return {...item,available:true}; }
    }));
    if(!grid) return;
    grid.innerHTML = resolved.map(item => '<article class="melato-saved-card" data-saved-handle="'+escapeHtml(item.handle)+'"><a class="melato-saved-card__media" href="'+escapeHtml(item.url || ('/products/'+item.handle))+'">'+(item.image?'<img src="'+escapeHtml(item.image)+'" alt="'+escapeHtml(item.title)+'" loading="lazy">':'')+'</a><button class="melato-saved-card__remove" type="button" data-remove-saved="'+escapeHtml(item.handle)+'" aria-label="Remove '+escapeHtml(item.title)+' from saved products"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button><div class="melato-saved-card__body"><h2 class="melato-saved-card__title"><a href="'+escapeHtml(item.url || ('/products/'+item.handle))+'">'+escapeHtml(item.title)+'</a></h2><p class="melato-saved-card__price">'+escapeHtml(item.price || '')+(item.available===false?' · SOLD OUT':'')+'</p></div></article>').join('');
  }

  function bind(){
    document.addEventListener('click', event => {
      const save = event.target.closest('[data-melato-save]');
      if(save){
        event.preventDefault(); event.stopPropagation();
        const item = cardItem(save.closest('[data-product-card]'));
        if(item) toggleSaved(item);
        return;
      }
      const remove = event.target.closest('[data-remove-saved]');
      if(remove){
        event.preventDefault();
        const handle = remove.getAttribute('data-remove-saved');
        writeSaved(readSaved().filter(item => item.handle !== handle));
        renderSavedPage();
      }
    });
  }

  function run(){
    markHeaderSticky();
    ensureMenuIcon();
    ensureCartClose();
    ensureHeaderSaved();
    ensureCardSaveButtons();
    normalizeBadges();
    cleanCompleteSetArtifacts();
    ensureServiceHero();
    syncSavedUI();
    enhanceCollectionBadges();
    renderSavedPage();
  }

  bind();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true}); else run();
  let timer;
  new MutationObserver(() => { clearTimeout(timer); timer=setTimeout(() => { ensureCartClose(); ensureCardSaveButtons(); normalizeBadges(); cleanCompleteSetArtifacts(); syncSavedUI(); }, 80); }).observe(document.documentElement,{childList:true,subtree:true});
})();
