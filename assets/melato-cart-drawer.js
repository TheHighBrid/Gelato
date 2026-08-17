(() => {
  'use strict';
  const drawer=document.getElementById('cart-drawer')||document.querySelector('.cart-drawer');
  const overlay=document.getElementById('drip-overlay')||document.querySelector('[data-overlay]');
  const pendingForms=new WeakSet();
  let lastFocused=null;
  if(!drawer)return;

  const locale=()=>document.documentElement.lang||navigator.language||'en-CA';
  const formatMoney=(cents,currency)=>{
    const amount=Number(cents||0)/100;
    const code=String(currency||'').trim().toUpperCase();
    if(code){
      try{return new Intl.NumberFormat(locale(),{style:'currency',currency:code}).format(amount)}catch(error){console.warn('Melato currency format fallback:',error)}
    }
    if(window.Shopify&&typeof Shopify.formatMoney==='function')return Shopify.formatMoney(cents,window.DRIP?.shop?.moneyFormat||'${{amount}}');
    return amount.toFixed(2);
  };
  const esc=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function toast(message){const node=document.getElementById('drip-toast');if(!node)return;node.textContent=message;node.classList.add('is-visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('is-visible'),2200)}
  function debounce(fn,wait){let t;return function(){const args=arguments;clearTimeout(t);t=setTimeout(()=>fn.apply(null,args),wait)}}
  const fetchCart=()=>fetch('/cart.js',{headers:{Accept:'application/json'}}).then(r=>r.json());

  function openCart(){lastFocused=document.activeElement;drawer.hidden=false;drawer.removeAttribute('inert');drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');overlay?.classList.add('is-visible');document.body.style.overflow='hidden';const target=drawer.querySelector('[data-cart-close],button,a,input,textarea,select');if(target)setTimeout(()=>target.focus(),40)}
  function closeCart(){drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');drawer.setAttribute('inert','');overlay?.classList.remove('is-visible');document.body.style.overflow='';if(lastFocused&&typeof lastFocused.focus==='function')lastFocused.focus()}
  function trapTab(event){const nodes=Array.from(drawer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled])'));if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}

  function updateCounts(count){document.querySelectorAll('[data-cart-item-count],.cart-count,.mxh__bag-count').forEach(el=>el.textContent=String(count||0));document.querySelectorAll('.mxh__bag').forEach(el=>el.setAttribute('aria-label','Cart with '+String(count||0)+' '+((count||0)===1?'item':'items')))}
  function updateSubtotal(total,currency){drawer.querySelectorAll('[data-cart-subtotal],.cart-subtotal__amount').forEach(el=>el.textContent=formatMoney(total||0,currency))}
  function updateCheckout(count){drawer.querySelectorAll('[data-checkout-btn],button[name="checkout"]').forEach(button=>button.disabled=!count)}
  const initialEmptyMarkup=drawer.querySelector('[data-cart-empty-template]')?.outerHTML||'<div class="cart-drawer__empty" data-cart-empty-template><p class="cart-drawer__empty-text">Your cart is empty.</p><a href="/collections/new-arrivals" class="melato-cart-cta">Explore new arrivals</a></div>';
  function renderItems(cart){const container=drawer.querySelector('[data-cart-items],.cart-drawer__items');if(!container)return;if(!cart.items?.length){container.innerHTML=initialEmptyMarkup;return}container.innerHTML=cart.items.map(item=>{const url=esc(item.url||'#'),image=esc(item.image||''),img=image?'<img class="cart-item__img" src="'+image+'" alt="'+esc(item.title)+'" width="88" height="110" loading="lazy">':'',variant=item.variant_title&&item.variant_title!=='Default Title'?'<span class="cart-item__variant">'+esc(item.variant_title)+'</span>':'';return'<div class="cart-item" role="listitem" data-line-key="'+esc(item.key)+'"><a href="'+url+'" class="cart-item__img-link" tabindex="-1" aria-hidden="true">'+img+'</a><div class="cart-item__info"><div class="cart-item__top"><a href="'+url+'" class="cart-item__title">'+esc(item.product_title)+'</a><button class="cart-item__remove" type="button" aria-label="Remove '+esc(item.product_title)+'" data-remove-line>×</button></div>'+variant+'<div class="cart-item__footer"><div class="qty-stepper" aria-label="Quantity for '+esc(item.product_title)+'"><button class="qty-stepper__btn" type="button" aria-label="Decrease quantity" data-qty-change="-1">−</button><input class="qty-stepper__value" type="number" value="'+item.quantity+'" min="0" aria-label="Quantity"><button class="qty-stepper__btn" type="button" aria-label="Increase quantity" data-qty-change="1">+</button></div><span class="price">'+formatMoney(item.final_line_price,cart.currency)+'</span></div></div></div>'}).join('')}
  function renderCart(cart){if(!cart)return;renderItems(cart);updateCounts(cart.item_count);updateSubtotal(cart.total_price,cart.currency);updateCheckout(cart.item_count)}
  function updateLine(key,quantity){if(!key)return;drawer.classList.add('is-updating');fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id:key,quantity})}).then(r=>r.json()).then(renderCart).catch(error=>{console.error('Melato cart update:',error);toast('Cart could not be updated.')}).finally(()=>drawer.classList.remove('is-updating'))}

  function isProductAddForm(form){if(!form)return false;const action=form.getAttribute('action')||'',hasVariant=!!form.querySelector('[name="id"]'),hasAdd=!!form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]');return action.includes('/cart/add')||form.matches('.pdp-form,.melato-clean-product__form,[data-product-form]')||(hasVariant&&hasAdd)}
  function buttonLoading(button,on){if(!button)return;if(on){button.dataset.originalText=button.textContent||'';button.disabled=true;button.classList.add('is-loading');button.textContent='Adding'}else{button.disabled=false;button.classList.remove('is-loading');button.textContent=button.dataset.originalText||'Add to cart'}}
  function addForm(form,submitter){if(pendingForms.has(form))return;const id=form.querySelector('[name="id"]');if(!id?.value){toast('Select an available option.');return}pendingForms.add(form);const button=submitter?.matches?.('button,input[type="submit"]')?submitter:form.querySelector('[name="add"],[data-pdp-atc],[data-atc-btn]');buttonLoading(button,true);const data=new FormData(form);if(!data.get('quantity'))data.set('quantity','1');fetch('/cart/add.js',{method:'POST',headers:{Accept:'application/json'},body:data}).then(async r=>{const payload=await r.json().catch(()=>({}));if(!r.ok)throw new Error(payload.description||payload.message||'Unable to add to cart.');return fetchCart()}).then(cart=>{renderCart(cart);openCart();toast('Added to cart')}).catch(error=>{console.error('Melato add to cart:',error);toast(error.message||'Unable to add to cart.')}).finally(()=>{pendingForms.delete(form);buttonLoading(button,false)})}

  document.addEventListener('click',event=>{
    const open=event.target.closest('[data-cart-open],[data-cart-toggle],.mxh__bag');
    if(open&&!open.closest('.cart-drawer')){event.preventDefault();fetchCart().then(cart=>{renderCart(cart);openCart()});return}
    const close=event.target.closest('[data-cart-close]');
    if(close){const href=close.getAttribute('href');if(!href||href==='#'){event.preventDefault();closeCart();return}closeCart();return}
    const qty=event.target.closest('[data-qty-change]');
    if(qty?.closest('.cart-drawer')){event.preventDefault();const row=qty.closest('.cart-item'),input=row?.querySelector('.qty-stepper__value');updateLine(row?.dataset.lineKey,Math.max(0,Number(input?.value||0)+Number(qty.dataset.qtyChange||0)));return}
    const remove=event.target.closest('[data-remove-line]');
    if(remove?.closest('.cart-drawer')){event.preventDefault();const row=remove.closest('.cart-item');updateLine(row?.dataset.lineKey,0);return}
    const toggle=event.target.closest('.cart-note-toggle');
    if(toggle?.closest('.cart-drawer')){const field=drawer.querySelector('#cart-note-field'),expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));if(field){field.hidden=expanded;field.setAttribute('aria-hidden',String(expanded))}}
  });
  document.addEventListener('change',event=>{const input=event.target.closest('.cart-drawer input[type="number"].qty-stepper__value');if(input){const row=input.closest('.cart-item');updateLine(row?.dataset.lineKey,Math.max(0,Number(input.value||0)))}});
  document.addEventListener('input',debounce(event=>{const note=event.target.closest('[data-note-input]');if(!note)return;const hidden=drawer.querySelector('[data-note-hidden]');if(hidden)hidden.value=note.value;fetch('/cart/update.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({note:note.value})}).catch(()=>{})},450));
  document.addEventListener('submit',event=>{const form=event.target.closest('form');if(!isProductAddForm(form))return;const submitter=event.submitter||document.activeElement;if(submitter?.closest('.shopify-payment-button,.shopify-payment-button__button'))return;event.preventDefault();event.stopImmediatePropagation();addForm(form,submitter)},true);
  overlay?.addEventListener('click',()=>{if(drawer.classList.contains('is-open'))closeCart()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer.classList.contains('is-open'))closeCart();if(event.key==='Tab'&&drawer.classList.contains('is-open'))trapTab(event)});fetchCart().then(renderCart).catch(()=>{});
})();
