(() => {
  'use strict';

  function loadAug18Fixes(){
    if(document.documentElement.dataset.melatoAug18Fixes==='true')return;
    const current=document.currentScript?.src||'';
    if(!current)return;
    document.documentElement.dataset.melatoAug18Fixes='true';
    const base=current.replace(/melato-content-policy-20260811\.js(?:\?[^#]*)?$/,'');
    if(!base)return;
    if(!document.querySelector('link[data-melato-aug18-css]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=base+'melato-mobile-collection-header-20260818.css';
      link.dataset.melatoAug18Css='true';
      document.head.appendChild(link);
    }
    if(!document.querySelector('link[data-melato-aug18-header-priority]')){
      const priority=document.createElement('link');
      priority.rel='stylesheet';
      priority.href=base+'melato-mobile-header-priority-20260818.css';
      priority.dataset.melatoAug18HeaderPriority='true';
      document.head.appendChild(priority);
    }
    if(!document.querySelector('link[data-melato-pdp-cleanup-css]')){
      const cleanupCss=document.createElement('link');
      cleanupCss.rel='stylesheet';
      cleanupCss.href=base+'melato-pdp-cleanup-20260818.css';
      cleanupCss.dataset.melatoPdpCleanupCss='true';
      document.head.appendChild(cleanupCss);
    }
    /*
      P0 stability guard, 2026-08-18.
      melato-audit-ui-20260818.js is already loaded by melato-global-polish.liquid.
      Loading it again here duplicated document listeners and MutationObservers.

      melato-pdp-cleanup-20260818.js is intentionally NOT loaded here. Its broad
      DOM observer removed elements that melato-pdp-polish.js recreated, producing
      a permanent mutation ping-pong on product pages and eventual main-thread lock.
      The companion cleanup CSS remains safe because it does not mutate the DOM.
    */
  }

  loadAug18Fixes();

  const text=node=>(node?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  function unifyPolicyEmail(){
    if(!location.pathname.startsWith('/policies/'))return;
    document.querySelectorAll('a[href^="mailto:orders@melato.ca"]').forEach(a=>{a.href='mailto:support@melato.ca';a.textContent='support@melato.ca'});
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{if(node.nodeValue&&node.nodeValue.includes('orders@melato.ca'))node.nodeValue=node.nodeValue.replaceAll('orders@melato.ca','support@melato.ca')});
  }
  function apply(){
    if(document.body.matches('.template-product')){
      document.querySelectorAll('details').forEach(detail=>{const summary=detail.querySelector(':scope > summary');if(text(summary)==='story')detail.remove()});
      document.querySelectorAll('.pdp-thesis,.pdp-proof-mini,.product-assurances').forEach(node=>node.remove());
      document.querySelectorAll('.pdp-editorial,.melato-clean-pdp .pdp-editorial').forEach(section=>section.remove());
      document.querySelectorAll('.pdp-sticky-atc').forEach(bar=>{if(bar.querySelector('button[disabled],.pdp-atc--oos'))bar.remove()});
    }
    document.querySelectorAll('.cart-upsell').forEach(section=>{if(!section.querySelector('.upsell-card,[data-upsell-track]>*'))section.remove()});
    document.querySelectorAll('.brand-story__placeholder').forEach(svg=>svg.closest('.brand-story__media')?.remove());
    unifyPolicyEmail();
  }

  function installProductStabilityGuard(){
    if(!document.body.matches('.template-product'))return;
    if(document.documentElement.dataset.melatoPdpStabilityGuard==='true')return;
    document.documentElement.dataset.melatoPdpStabilityGuard='true';

    /* Product-image zoom is temporarily disabled at capture phase. The legacy
       zoom implementation applies a document-wide scroll lock on click. Until
       that component is rebuilt without a global overflow lock, image taps must
       remain inert rather than risking a trapped storefront on mobile browsers. */
    document.addEventListener('click',event=>{
      if(event.target instanceof Element && event.target.closest('.pdp-main-image')){
        event.stopImmediatePropagation();
      }
    },true);
  }

  const boot=()=>{
    apply();
    installProductStabilityGuard();

    /* Product pages are deliberately excluded from the document-wide observer.
       PDP content is server-rendered and the broad observer previously amplified
       competing enhancement scripts into an interaction freeze. */
    if(document.body.matches('.template-product'))return;
    let timer;
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,100)}).observe(document.documentElement,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
