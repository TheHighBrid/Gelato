(() => {
  'use strict';
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
