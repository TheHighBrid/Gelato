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
    if(!document.querySelector('script[data-melato-aug18-js]')){
      const script=document.createElement('script');
      script.src=base+'melato-audit-ui-20260818.js';
      script.defer=true;
      script.dataset.melatoAug18Js='true';
      document.head.appendChild(script);
    }
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
      document.querySelectorAll('.pdp-editorial,.melato-clean-pdp .pdp-editorial').forEach(section=>{const kicker=section.querySelector('.pdp-kicker');if(kicker&&/editorial photos/i.test(kicker.textContent||''))kicker.remove();const heading=section.querySelector('.pdp-section-head h2');if(heading&&/extra angles|close-ups|texture/i.test(heading.textContent||''))heading.textContent='Details'});
      document.querySelectorAll('.pdp-sticky-atc').forEach(bar=>{if(bar.querySelector('button[disabled],.pdp-atc--oos'))bar.remove()});
    }
    document.querySelectorAll('.cart-upsell').forEach(section=>{if(!section.querySelector('.upsell-card,[data-upsell-track]>*'))section.remove()});
    document.querySelectorAll('.brand-story__placeholder').forEach(svg=>svg.closest('.brand-story__media')?.remove());
    unifyPolicyEmail();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,100)}).observe(document.documentElement,{childList:true,subtree:true});
})();
