'use client';
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { ACTS, FRAMES, type FrameConfig } from '@/lib/frames';
import { useLookbookStore } from '@/lib/store';
const Frame = React.lazy(() => import('./frames/Frame'));
gsap.registerPlugin(ScrollTrigger);
export default function FrameEngine(){const containerRef=useRef<HTMLDivElement>(null);const currentFrame=useLookbookStore(s=>s.currentFrame),setCurrentFrame=useLookbookStore(s=>s.setCurrentFrame),setScrollProgress=useLookbookStore(s=>s.setScrollProgress);
 useLenis(({scroll,limit})=>setScrollProgress(limit?Math.min(1,Math.max(0,scroll/limit)):0));
 useGSAP(()=>{const triggers=FRAMES.map(frame=>ScrollTrigger.create({trigger:`#frame-${frame.id}`,start:frame.motion.scrollTrigger.start,end:frame.motion.scrollTrigger.end,onEnter:()=>setCurrentFrame(frame.index),onEnterBack:()=>setCurrentFrame(frame.index)}));return()=>triggers.forEach(t=>t.kill())},{scope:containerRef,dependencies:[setCurrentFrame]});
 const showGrain=FRAMES[currentFrame-1]?.effects.grain;
 return <main ref={containerRef}>{FRAMES.map(frame=><section key={frame.id} id={`frame-${frame.id}`} className="frame-section" aria-label={frame.title} data-act={frame.act}><React.Suspense fallback={<FrameSkeleton config={frame}/>}><Frame config={frame}/></React.Suspense></section>)}{showGrain&&<div className="lookbook-grain" aria-hidden="true"/>}</main>}
function FrameSkeleton({config}:{config:FrameConfig}){return <div className="frame-skeleton" role="status" style={{borderColor:ACTS[config.act].color}}><span className="sr-only">Loading frame {config.index}</span></div>}
