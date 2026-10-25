const {JSDOM}=require('jsdom');
const fs=require('fs'),assert=require('node:assert/strict');
const render=require('./helpers/render-rack.cjs');
const source=fs.readFileSync(require('path').resolve(__dirname,'../assets/melato-rack.js'),'utf8');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function create(reduced=false){
const dom=new JSDOM(await render(),{url:'https://melato.test/',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
w.matchMedia=q=>({matches:q.includes('reduced')?reduced:true,addEventListener(){}});
w.ResizeObserver=class{observe(){}disconnect(){}};w.IntersectionObserver=class{observe(){}disconnect(){}};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.HTMLImageElement.prototype.decode=()=>Promise.resolve();
const p=w.HTMLElement.prototype;Object.defineProperty(p,'clientWidth',{get(){return this.hasAttribute('data-rack-viewport')?1200:300;}});
Object.defineProperty(p,'offsetWidth',{get(){return 300;}});Object.defineProperty(p,'offsetLeft',{get(){return this.hasAttribute('data-rack-item')?600+Array.from(this.parentNode.children).indexOf(this)*138:0;}});
p.getBoundingClientRect=function(){return {left:0,top:0,width:300,height:375,right:300,bottom:375};};
p.setPointerCapture=function(){};p.hasPointerCapture=()=>false;p.releasePointerCapture=function(){};
w.eval(source);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return {w,dom,r:w.document.querySelector('[data-melato-rack]').__mrack};
}
function pointer(w,node,type,props){const e=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:1,pointerType:'mouse',button:0,clientX:100,clientY:100,...props});node.dispatchEvent(e);}
require('node:test')('rack interaction and media contract', async()=>{let passed=[];const {w,dom,r}=await create();
assert.equal(r.items.length,14);assert.equal(r.data.filter(x=>x.back).length,7);assert.equal(r.data[0].title,'Divididos Track Jacket');passed.push('14 prepared fronts and seven explicit backs');
r.next.click();r.next.click();assert.equal(r.nearest(r.target),2);passed.push('rapid arrows advance sequentially');
r.snapTo(4,true);pointer(w,r.viewport,'pointerenter',{clientX:600});pointer(w,r.viewport,'pointermove',{clientX:640});assert.ok(r.target>r.pos);passed.push('hover moves the full rack without a held button');
pointer(w,r.viewport,'pointerdown',{clientX:500,clientY:100});pointer(w,w,'pointermove',{clientX:500,clientY:160});assert.equal(r.drag,null);passed.push('vertical touch motion is not hijacked');
r.snapTo(0,true);pointer(w,r.viewport,'pointerdown',{clientX:100});pointer(w,w,'pointermove',{clientX:30});pointer(w,w,'pointerup',{clientX:30});assert.equal(r.suppressClick,true);r.items[0].querySelector('a').click();assert.equal(r.selected,null);passed.push('drag release does not accidentally open an item');
await r.open(0);assert.equal(r.stage.open,true);assert.equal(r.items[0].classList.contains('is-picked'),true);assert.equal(w.location.pathname,'/');r.setTurn(180);assert.equal(r.rotation,180);passed.push('pull-out, back view and no false product URL');
await r.change(1);assert.equal(r.selected,1);assert.equal(r.items[0].classList.contains('is-picked'),false);passed.push('next returns previous piece before opening next');
r.openDrawer();let buttons=r.sizes.querySelectorAll('button');assert.equal(buttons[0].disabled,false);buttons[0].click();let posted;
w.fetch=async(url,opts)=>{posted={url,...JSON.parse(opts.body)};return {ok:true,json:async()=>({})};};await r.addToCart();assert.equal(posted.quantity,1);assert.equal(posted.id,r.current.variants[0].id);assert.match(r.msg.textContent,/Added/);passed.push('availability and successful cart payload');
w.fetch=async()=>({ok:false});await r.addToCart();assert.match(r.msg.textContent,/Could not/);assert.equal(r.addBtn.disabled,false);passed.push('cart failure restores the purchase control');
await r.close();assert.equal(r.stage.open,false);assert.equal(r.selected,null);assert.equal(w.document.documentElement.style.overflow,'');passed.push('return restores the rack and scrolling');
await r.open(8);assert.equal(r.stage.querySelector('[data-rack-side="back"]').hidden,true);assert.equal(r.turn.max,'35');await r.close();passed.push('missing back limits rotation and hides reverse control');
const existing=r;w.eval(source);assert.equal(r.root.__mrack,existing);r.destroy();assert.equal(r.root.__mrack,undefined);passed.push('duplicate script and section unload clean-up');dom.window.close();
const second=await create(true);second.r.snapTo(5);assert.equal(second.r.active,5);assert.equal(second.r.raf,0);await second.r.open(0);await second.r.close();second.r.destroy();second.dom.window.close();passed.push('reduced motion uses immediate transitions');
console.log(passed.map((x,i)=>`${i+1}. PASS ${x}`).join('\n'));console.log(`${passed.length} rack behavior checks passed`);
});
