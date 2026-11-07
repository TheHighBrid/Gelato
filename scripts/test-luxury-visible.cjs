const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const { chromium } = require('playwright');
(async () => {
  const engine = new Liquid({ root:'snippets', extname:'.liquid' });
  engine.registerFilter('json', value => JSON.stringify(value));
  const header = await engine.parseAndRender(fs.readFileSync('sections/melato-header.liquid','utf8').split('{% schema %}')[0], {
    section:{id:'test',settings:{},blocks:[]},shop:{name:'Melato'},cart:{item_count:0},routes:{root_url:'/',cart_url:'/cart',search_url:'/search'},linklists:{'main-menu':{links:[{title:'New Arrivals',url:'/collections/new-arrivals',links:[]},{title:'Contact',url:'/pages/contact',links:[]}]}}
  });
  const mainCollection = fs.readFileSync('sections/main-collection.liquid','utf8');
  const collectionCss = mainCollection.match(/<style>([\s\S]*?)<\/style>/)[1];
  const cartCss = fs.readFileSync('snippets/cart-drawer.liquid','utf8').match(/<style>([\s\S]*?)<\/style>/)[1];
  const styles = ['melato-luxury-tokens.css','theme.css','melato-collection-navigation.css','melato-palette-v3.css','premium-enhancements.css','melato-storefront-tail.css','melato-apple-design.css'].map(name=>fs.readFileSync('assets/'+name,'utf8')).join('\n');
  const browser = await chromium.launch({executablePath:path.resolve(process.argv[2]),args:['--no-sandbox'],headless:true});
  const results=[];
  for(const width of [320,390,768,1440]) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    const body = '<main><header class="melato-collection-header"><div class="melato-collection-header__text"><h1>New arrivals</h1></div></header><div class="melato-product-grid__inner" style="--cols-desktop:3;--cols-mobile:2">'+Array.from({length:3},()=>'<article class="product-card"><div class="product-card__media"></div><h3 class="product-card__title">Fixture garment</h3><span class="product-card__price">$125.00 CAD</span></article>').join('')+'</div></main>';
    await page.setContent('<html><head><style>:root{--font-size-base:16px;--font-body-family:var(--font-commerce);--font-heading-family:var(--font-editorial);--color-bg:var(--surface-page);--color-text:var(--text-primary);--container-width:1600px;--container-padding:var(--page-gutter);--line-height-body:1.6}'+styles+collectionCss+cartCss+'</style></head><body>'+header+body+'</body></html>');
    assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    assert.equal(await page.locator('[data-mxh]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    assert.match(await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily),/Plus Jakarta Sans/);
    assert.equal(await page.locator('.product-card__price').first().evaluate(e=>getComputedStyle(e).fontVariantNumeric),'lining-nums tabular-nums');
    const cols=await page.locator('.melato-product-grid__inner').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
    assert.equal(cols,width<375?1:width<1024?2:3);
    await page.getByRole('button',{name:'Open navigation'}).click();
    assert.equal(await page.locator('[data-mxh-menu]').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('[data-mxh-drawer]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    await page.getByRole('button',{name:'Close navigation'}).click();
    assert.equal(await page.locator('[data-mxh-menu]').getAttribute('aria-expanded'),'false');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.setContent('<style>'+styles+cartCss+'</style><aside class="cart-drawer is-open"><h2 class="cart-drawer__title">Your bag</h2><span class="cart-item__price">$125.00 CAD</span></aside>');
    assert.equal(await page.locator('.cart-drawer').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
    assert.equal(await page.locator('.cart-drawer__title').evaluate(e=>getComputedStyle(e).color),'rgb(17, 17, 17)');
    results.push({width,columns:cols,whiteCanvas:true,whiteHeader:true,whiteDrawer:true,tabularPrices:true,navigationOpensAndCloses:true,noHorizontalOverflow:true});
    await page.close();
  }
  await browser.close();console.log(JSON.stringify(results,null,2));
})().catch(error=>{console.error(error);process.exit(1)});
