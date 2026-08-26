(() => {
  'use strict';

  const STYLE_ID = 'melato-mobile-qa-20260826';
  const css = `
/* MELATO MOBILE QA 2026-08-26 */
.melato-recently-viewed .product-card__info{
  display:flex!important;flex-direction:column!important;align-items:center!important;
  justify-content:flex-start!important;text-align:center!important;padding:13px 4px 4px!important;gap:7px!important;
}
.melato-recently-viewed .product-card__title{
  width:100%!important;margin:0!important;text-align:center!important;
  color:#f5f1e8!important;font-family:var(--font-heading-family,'Bebas Neue',sans-serif)!important;
  font-size:16px!important;font-weight:600!important;line-height:1.05!important;
  letter-spacing:.035em!important;text-transform:uppercase!important;text-decoration:none!important;
}
.melato-recently-viewed .product-card__price{
  width:100%!important;display:flex!important;justify-content:center!important;align-items:center!important;
  margin:0!important;text-align:center!important;color:#f5f1e8!important;font-size:15px!important;letter-spacing:.04em!important;
}

body.template-product .melato-pdp-rebuild .pdp-proof-mini{display:none!important}
body.template-product .pdp-conversion-assurances{
  margin:16px 0 0!important;padding:12px 0!important;
  border-top:1px solid rgba(255,255,255,.12)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;
}
body.template-product .pdp-conversion-assurances__facts,
body.template-product .pdp-conversion-assurances__payments{display:none!important}
body.template-product .pdp-conversion-assurances__trust{
  display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:0!important;
  width:100%!important;margin:0!important;padding:0!important;overflow-x:auto!important;
  scrollbar-width:none!important;white-space:nowrap!important;
}
body.template-product .pdp-conversion-assurances__trust::-webkit-scrollbar{display:none!important}
body.template-product .pdp-conversion-assurances__trust li{
  flex:0 0 auto!important;margin:0!important;padding:0 12px!important;
  font-size:10px!important;line-height:1.25!important;letter-spacing:.105em!important;text-transform:uppercase!important;
}
body.template-product .pdp-conversion-assurances__trust li:first-child{padding-left:0!important}
body.template-product .pdp-conversion-assurances__trust li+li{border-left:1px solid rgba(255,255,255,.16)!important}
body.template-product .pdp-conversion-assurances__trust a{
  color:inherit!important;text-decoration:none!important;border-bottom:0!important;background:none!important;
}

body.template-product .melato-pdp-rebuild .pdp-content-stack{gap:14px!important;margin-top:24px!important}
body.template-product .melato-pdp-rebuild .pdp-story-tech__grid,
body.template-product .melato-pdp-rebuild .pdp-spec-grid{grid-template-columns:1fr!important;gap:10px!important}
body.template-product .melato-pdp-rebuild .pdp-mini-detail,
body.template-product .melato-pdp-rebuild .pdp-spec{
  overflow:hidden!important;background:#111214!important;border:1px solid rgba(255,255,255,.095)!important;
  border-radius:18px!important;box-shadow:none!important;margin:0!important;
}
body.template-product .melato-pdp-rebuild .pdp-mini-detail[open],
body.template-product .melato-pdp-rebuild .pdp-spec[open]{background:#141517!important}
body.template-product .melato-pdp-rebuild .pdp-mini-detail summary,
body.template-product .melato-pdp-rebuild .pdp-spec summary{
  min-height:54px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;
  gap:18px!important;padding:0 18px!important;list-style:none!important;cursor:pointer!important;
}
body.template-product .melato-pdp-rebuild .pdp-mini-detail summary::-webkit-details-marker,
body.template-product .melato-pdp-rebuild .pdp-spec summary::-webkit-details-marker{display:none!important}
body.template-product .melato-pdp-rebuild .pdp-mini-detail summary::after,
body.template-product .melato-pdp-rebuild .pdp-spec summary::after{
  content:'+'!important;display:grid!important;place-items:center!important;flex:0 0 26px!important;
  width:26px!important;height:26px!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:50%!important;
  color:var(--pdp-title-accent,#d3a74a)!important;font-size:17px!important;font-weight:400!important;line-height:1!important;
}
body.template-product .melato-pdp-rebuild .pdp-mini-detail[open] summary::after,
body.template-product .melato-pdp-rebuild .pdp-spec[open] summary::after{content:'−'!important}
body.template-product .melato-pdp-rebuild .pdp-mini-detail__content,
body.template-product .melato-pdp-rebuild .pdp-spec .pdp-rte{
  padding:0 18px 20px!important;max-width:64ch!important;font-size:13px!important;line-height:1.7!important;
}

body.template-product .melato-pdp-rebuild .pdp-set{padding:24px!important}
body.template-product .melato-pdp-rebuild .pdp-set-grid{gap:18px!important}
body.template-product .melato-pdp-rebuild .pdp-set-card{
  width:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;
  justify-content:flex-start!important;text-align:center!important;padding:18px!important;
}
body.template-product .melato-pdp-rebuild .pdp-set-media-link{
  width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;
}
body.template-product .melato-pdp-rebuild .pdp-set-image{
  display:block!important;width:min(360px,100%)!important;height:auto!important;margin:0 auto!important;object-position:50% 50%!important;
}
body.template-product .melato-pdp-rebuild .pdp-set-card .purchase-summary__title,
body.template-product .melato-pdp-rebuild .pdp-set-card .purchase-summary__price{
  width:100%!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important;
}

@media(max-width:749px){
  #melato-announcement-bar{
    min-height:52px!important;height:auto!important;padding:0 12px!important;
  }
  #melato-announcement-bar .melato-ann__item{
    font-size:12px!important;line-height:1.2!important;letter-spacing:.13em!important;font-weight:800!important;
  }
  #melato-announcement-bar .melato-ann__group{gap:32px!important;padding-right:32px!important}

  .melato-footer .melato-footer__wrap{width:min(100% - 28px,1180px)!important;padding-top:42px!important;padding-bottom:24px!important}
  .melato-footer .melato-footer__top{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:32px 20px!important}
  .melato-footer .melato-footer__brand{grid-column:1/-1!important}
  .melato-footer .melato-footer__brand .melato-footer__tagline{margin:24px 0 14px!important;max-width:30rem!important}
  .melato-footer .melato-footer__column h2{margin-bottom:15px!important}
  .melato-footer .melato-footer__column ul{gap:13px!important}
  .melato-footer .melato-footer__column:last-of-type{grid-column:1/-1!important}
  .melato-footer .melato-footer__column:last-of-type ul{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:13px 20px!important}
  .melato-footer .melato-footer__notes{margin-top:38px!important;padding:28px 0!important;gap:20px!important}
  .melato-footer .melato-footer__notes h2{font-size:36px!important;line-height:.95!important}
  .melato-footer .melato-footer__field{grid-template-columns:minmax(0,1fr) auto!important}
  .melato-footer .melato-footer__bottom{grid-template-columns:1fr!important;padding-top:22px!important;gap:16px!important}

  body.template-product .melato-pdp-rebuild .pdp-buybox{padding:20px!important}
  body.template-product .melato-pdp-rebuild .pdp-atc-row{grid-template-columns:70px minmax(0,1fr)!important;gap:9px!important}
  body.template-product .melato-pdp-rebuild .pdp-set{padding:20px!important}
  body.template-product .melato-pdp-rebuild .pdp-set-grid{grid-template-columns:1fr!important}

  [data-melato-living-book] .mlb-chapter-head + .mlb-grid{margin-top:28px!important}
  [data-lb-director] .mlbd__case-rail + .mlbd__gallery{margin-top:34px!important}
  [data-lb-director] .mlbd__case-masthead{margin-bottom:50px!important}
}
`;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function normalizeRecentlyViewed(root = document) {
    root.querySelectorAll('.melato-recently-viewed .product-card__price, .melato-recently-viewed .price').forEach((node) => {
      const before = node.textContent || '';
      const after = before.replace(/\bCA\$/g, '$').replace(/^\s*CAD\s*/i, '$');
      if (after !== before) node.textContent = after;
    });
  }

  function normalizePdp(root = document) {
    const pdp = root.querySelector('.melato-pdp-rebuild');
    if (!pdp) return;

    if (pdp.dataset.qaDefaultPanels !== 'closed') {
      pdp.querySelectorAll('details.pdp-mini-detail[open], details.pdp-spec[open]').forEach((panel) => panel.removeAttribute('open'));
      pdp.dataset.qaDefaultPanels = 'closed';
    }

    pdp.querySelectorAll('.pdp-set-card').forEach((card) => {
      const image = card.querySelector('.pdp-set-image');
      if (image) {
        image.style.marginInline = 'auto';
        image.style.objectPosition = '50% 50%';
      }
    });
  }

  function run() {
    injectStyles();
    normalizeRecentlyViewed(document);
    normalizePdp(document);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true });
  else run();

  let timer;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = window.setTimeout(run, 90);
  }).observe(document.documentElement, { childList:true, subtree:true });
})();
