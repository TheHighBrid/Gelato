'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { FrameConfig } from '@/lib/frames';
import { useLookbookStore } from '@/lib/store';

export default function Frame({config}:{config:FrameConfig}){
 const root=useRef<HTMLDivElement>(null); const magnifyMode=useLookbookStore(s=>s.magnifyMode);
 useGSAP(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return; const layers=gsap.utils.toArray<HTMLElement>('[data-depth]'); layers.forEach((layer,i)=>gsap.fromTo(layer,{yPercent:-3-i*2},{yPercent:3+i*2,ease:'none',scrollTrigger:{trigger:root.current,start:config.motion.scrollTrigger.start,end:config.motion.scrollTrigger.end,scrub:config.motion.scrollTrigger.scrub}})); if(config.motion.autoPlay)gsap.to('[data-breathe]',{scale:1.025,opacity:.86,duration:config.duration/2000,repeat:-1,yoyo:true,ease:'sine.inOut'});},{scope:root,dependencies:[config]});
 useEffect(()=>{const node=root.current;if(!node||!config.motion.mouseReactive||matchMedia('(pointer: coarse)').matches)return; const move=(e:PointerEvent)=>{const r=node.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5; gsap.to(node.querySelectorAll('[data-depth]'),{x:x*24,y:y*18,duration:1.2,ease:'power2.out',stagger:.03})}; node.addEventListener('pointermove',move); return()=>node.removeEventListener('pointermove',move)},[config.motion.mouseReactive]);
 const image=config.assets.images[0];
 return <div ref={root} className={`frame frame--${config.codename.toLowerCase()} ${config.effects.grain?'grain-overlay':''}`} data-transition={config.transition}>
   <div className="frame__image parallax-layer" data-depth data-breathe style={{transform:magnifyMode?'scale(1.12)':'none'}}><Image src={image} alt="" fill sizes="100vw" priority={config.index<=3} style={{objectFit:'cover'}}/></div>
   <div className="frame__shade" aria-hidden="true"/>{config.effects.flash&&<div className="frame__flash" aria-hidden="true"/>}
   {config.index===9&&<div className="frame__markers" aria-hidden="true">{'ABCDEFGH'.split('').map((x,i)=><i key={x} style={{left:`${18+(i%4)*21}%`,top:`${25+Math.floor(i/4)*45}%`}}>{x}</i>)}</div>}
   {config.index===30&&<div className="frame__spotlight" aria-hidden="true"/>}
   <span className="sr-only">{config.title}</span>
 </div>
}
