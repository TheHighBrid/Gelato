# THE LIVING BOOK — Implementation Quick Reference
## For SOL 5.6 & Codex Collaborative Execution

---

## ONE-COMMAND PROJECT INIT

```bash
# Run this once to scaffold the entire project
cd /path/to/Gelato
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install gsap @gsap/react lenis zustand three @react-three/fiber @react-three/drei howler
npm install -D @types/howler
```

---

## CRITICAL FILE: lib/frames.ts

Copy this exactly. It is the single source of truth for all 31 frames.

```typescript
export interface FrameConfig {
  id: string;
  index: number;
  act: 'I' | 'II' | 'III' | 'IV';
  codename: string;
  title: string;
  assets: {
    images: string[];
    video?: string;
    audio?: string;
    textures?: string[];
  };
  motion: {
    parallaxLayers: number;
    scrollTrigger: {
      start: string;
      end: string;
      scrub: boolean | number;
    };
    mouseReactive: boolean;
    autoPlay: boolean;
  };
  effects: {
    grain: boolean;
    displacement: boolean;
    bloom: boolean;
    flash: boolean;
  };
  duration: number;
  transition: 'cut' | 'fade' | 'wipe' | 'flash' | 'dissolve';
}

export const FRAMES: FrameConfig[] = [
  // === ACT I: THE SCENE (Frames 1–8) ===
  {
    id: 'EXHIBIT-00', index: 1, act: 'I', codename: 'Fingerprint',
    title: 'A single fingerprint in dust. It breathes.',
    assets: { images: ['/frames/f01-fingerprint.webp'], textures: ['/textures/dust-overlay.png'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 4000, transition: 'dissolve'
  },
  {
    id: 'TAPE-BARRIER', index: 2, act: 'I', codename: 'TapeBarrier',
    title: 'Crime scene tape flutters in sodium vapor light.',
    assets: { images: ['/frames/f02-tape.webp'], textures: ['/textures/crime-tape-alpha.png'] },
    motion: { parallaxLayers: 3, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 5000, transition: 'fade'
  },
  {
    id: 'CHALK-01', index: 3, act: 'I', codename: 'ChalkOutline',
    title: 'A chalk outline of the Protective Custody Vest.',
    assets: { images: ['/frames/f03-chalk.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 4500, transition: 'dissolve'
  },
  {
    id: 'EVIDENCE-BAG', index: 4, act: 'I', codename: 'EvidenceBag',
    title: 'A garment sealed in condensation.',
    assets: { images: ['/frames/f04-bag.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: false, displacement: true, bloom: false, flash: false },
    duration: 4000, transition: 'fade'
  },
  {
    id: 'FLASH-BULB', index: 5, act: 'I', codename: 'FlashBulb',
    title: 'White overexposure. The flash burns.',
    assets: { images: ['/frames/f05-flash.webp'], video: '/video/f05-flash-loop.mp4' },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 0.5 }, mouseReactive: false, autoPlay: true },
    effects: { grain: false, displacement: false, bloom: true, flash: true },
    duration: 2000, transition: 'flash'
  },
  {
    id: 'MEASURE-TAPE', index: 6, act: 'I', codename: 'MeasureTape',
    title: 'A tailor's tape unfurled. Numbers bleed red.',
    assets: { images: ['/frames/f06-measure.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.2 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 4000, transition: 'wipe'
  },
  {
    id: 'MIRROR-FRAGMENT', index: 7, act: 'I', codename: 'MirrorFragment',
    title: 'Shattered mirror. Amber Alibi Sunglasses.',
    assets: { images: ['/frames/f07-mirror.webp'] },
    motion: { parallaxLayers: 4, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: false },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 6000, transition: 'dissolve'
  },
  {
    id: 'DOORKNOB', index: 8, act: 'I', codename: 'Doorknob',
    title: 'Brass doorknob. Light bleeds from the gap.',
    assets: { images: ['/frames/f08-doorknob.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: true, flash: false },
    duration: 5000, transition: 'fade'
  },

  // === ACT II: THE EVIDENCE (Frames 9–18) ===
  {
    id: 'VEST-DISSECTION', index: 9, act: 'II', codename: 'VestDissection',
    title: 'Protective Custody Vest. Anatomical. Marked A–H.',
    assets: { images: ['/frames/f09-vest-flat.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 7000, transition: 'dissolve'
  },
  {
    id: 'FABRIC-TEAR', index: 10, act: 'II', codename: 'FabricTear',
    title: 'Velour torn. The tear is a map, a wound, a mouth.',
    assets: { images: ['/frames/f10-tear.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 5000, transition: 'fade'
  },
  {
    id: 'CHAIN-WALLET', index: 11, act: 'II', codename: 'ChainWallet',
    title: 'Return to Sender Chain Wallet. Fence. Backlight.',
    assets: { images: ['/frames/f11-wallet.webp'] },
    motion: { parallaxLayers: 3, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 5000, transition: 'wipe'
  },
  {
    id: 'BAG-INTERIOR', index: 12, act: 'II', codename: 'BagInterior',
    title: 'Pocket Change Top Handle Bag. Contents: lipstick, key, blank note.',
    assets: { images: ['/frames/f12-bag-interior.webp'] },
    motion: { parallaxLayers: 3, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.2 }, mouseReactive: true, autoPlay: false },
    effects: { grain: false, displacement: false, bloom: false, flash: false },
    duration: 6000, transition: 'dissolve'
  },
  {
    id: 'TRACK-PANT-DRAPE', index: 13, act: 'II', codename: 'TrackPantDrape',
    title: 'Divididos Velour Track Pant. Draped like a discarded body.',
    assets: { images: ['/frames/f13-pant-drape.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 5000, transition: 'fade'
  },
  {
    id: 'EMBROIDERY-MAGNIFY', index: 14, act: 'II', codename: 'EmbroideryMagnify',
    title: '痛 pain — threads become landscapes, stitches become scars.',
    assets: { images: ['/frames/f14-embroidery.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 2 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 8000, transition: 'dissolve'
  },
  {
    id: 'SUNGLASSES-REFLECTION', index: 15, act: 'II', codename: 'SunglassesReflection',
    title: 'Amber Alibi Sunglasses. Lens reflects a figure outside.',
    assets: { images: ['/frames/f15-sunglasses.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 6000, transition: 'fade'
  },
  {
    id: 'JACKET-BACK', index: 16, act: 'II', codename: 'JacketBack',
    title: 'Conquista Velour Track Jacket. Shadow hand obscures CONQUER.',
    assets: { images: ['/frames/f16-jacket-back.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 5000, transition: 'wipe'
  },
  {
    id: 'SHOE-PRINT', index: 17, act: 'II', codename: 'ShoePrint',
    title: 'Muddy tread on marble. The pattern is the Melato M.',
    assets: { images: ['/frames/f17-shoe-print.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 4000, transition: 'dissolve'
  },
  {
    id: 'COLLAR-DETAIL', index: 18, act: 'II', codename: 'CollarDetail',
    title: 'Collar close-up. A hair strand caught in the zipper.',
    assets: { images: ['/frames/f18-collar.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 5000, transition: 'fade'
  },

  // === ACT III: THE WITNESSES (Frames 19–26) ===
  {
    id: 'SILHOUETTE-01', index: 19, act: 'III', codename: 'Silhouette01',
    title: 'Backlit figure in doorway. Divididos tracksuit. Face withheld.',
    assets: { images: ['/frames/f19-silhouette.webp'], video: '/video/f19-doorway-loop.mp4' },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: true },
    duration: 7000, transition: 'dissolve'
  },
  {
    id: 'HANDS-POCKET', index: 20, act: 'III', codename: 'HandsPocket',
    title: 'Hands in pockets. Fingers drumming. Chū jacket sleeve.',
    assets: { images: ['/frames/f20-hands.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 5000, transition: 'fade'
  },
  {
    id: 'WALK-AWAY', index: 21, act: 'III', codename: 'WalkAway',
    title: 'Figure walks down an impossibly long corridor. Passion Fruit set.',
    assets: { images: ['/frames/f21-corridor.webp'], video: '/video/f21-corridor-loop.mp4' },
    motion: { parallaxLayers: 3, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 8000, transition: 'wipe'
  },
  {
    id: 'SITTING-WAITING', index: 22, act: 'III', codename: 'SittingWaiting',
    title: 'Figure on metal bench. Protective Custody Vest. Head in hands.',
    assets: { images: ['/frames/f22-sitting.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 6000, transition: 'dissolve'
  },
  {
    id: 'EYE-CONTACT', index: 23, act: 'III', codename: 'EyeContact',
    title: 'Eyes behind Amber Alibi Sunglasses. Reflection shows the viewer.',
    assets: { images: ['/frames/f23-eyes.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: true, flash: false },
    duration: 7000, transition: 'fade'
  },
  {
    id: 'BACK-TO-BACK', index: 24, act: 'III', codename: 'BackToBack',
    title: 'Two figures back to back. Divididos vs Conquista. Tension.',
    assets: { images: ['/frames/f24-backtoback.webp'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.2 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 6000, transition: 'dissolve'
  },
  {
    id: 'DRESSING', index: 25, act: 'III', codename: 'Dressing',
    title: 'Hands buttoning Chū jacket. Each button a decision.',
    assets: { images: ['/frames/f25-dressing.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 2 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 7000, transition: 'wipe'
  },
  {
    id: 'DEPARTURE', index: 26, act: 'III', codename: 'Departure',
    title: 'Figure opens a door. Light floods. Full look. Identity still obscured.',
    assets: { images: ['/frames/f26-departure.webp'], video: '/video/f26-door-light.mp4' },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: false, autoPlay: true },
    effects: { grain: false, displacement: false, bloom: true, flash: true },
    duration: 6000, transition: 'flash'
  },

  // === ACT IV: THE DOSSIER (Frames 27–31) ===
  {
    id: 'CASE-FILE', index: 27, act: 'IV', codename: 'CaseFile',
    title: 'Manila case file. Label: MELATO — THE LIVING BOOK. Opens.',
    assets: { images: ['/frames/f27-casefile.webp'], textures: ['/textures/paper-grain.jpg'] },
    motion: { parallaxLayers: 2, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: true, autoPlay: true },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 6000, transition: 'dissolve'
  },
  {
    id: 'POLAROID-WALL', index: 28, act: 'IV', codename: 'PolaroidWall',
    title: 'Wall of polaroids. Each a frame from the lookbook. Some missing.',
    assets: { images: ['/frames/f28-polaroids.webp'], textures: ['/textures/polaroid-frame.png'] },
    motion: { parallaxLayers: 3, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: true, autoPlay: false },
    effects: { grain: true, displacement: false, bloom: false, flash: false },
    duration: 8000, transition: 'fade'
  },
  {
    id: 'RED-TAPE', index: 29, act: 'IV', codename: 'RedTape',
    title: 'Red MELATO tape seals the file. The seal is broken.',
    assets: { images: ['/frames/f29-redtape.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1.5 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 5000, transition: 'wipe'
  },
  {
    id: 'THE-LOGO', index: 30, act: 'IV', codename: 'TheLogo',
    title: 'Melato wordmark embossed in brass. Single spotlight.',
    assets: { images: ['/frames/f30-logo.webp'], textures: ['/textures/brass-normal.jpg'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 2 }, mouseReactive: true, autoPlay: true },
    effects: { grain: false, displacement: false, bloom: true, flash: false },
    duration: 7000, transition: 'dissolve'
  },
  {
    id: 'CLOSING-STATEMENT', index: 31, act: 'IV', codename: 'ClosingStatement',
    title: 'Black frame. A fingerprint appears. It is the viewer's.',
    assets: { images: ['/frames/f31-closing.webp'] },
    motion: { parallaxLayers: 1, scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 }, mouseReactive: false, autoPlay: true },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 6000, transition: 'fade'
  },
];

export const ACTS = {
  I: { name: 'THE SCENE', color: '#C41E3A', frames: FRAMES.filter(f => f.act === 'I') },
  II: { name: 'THE EVIDENCE', color: '#FFBF00', frames: FRAMES.filter(f => f.act === 'II') },
  III: { name: 'THE WITNESSES', color: '#B5A642', frames: FRAMES.filter(f => f.act === 'III') },
  IV: { name: 'THE DOSSIER', color: '#8B8680', frames: FRAMES.filter(f => f.act === 'IV') },
};

export const TRANSITIONS = {
  cut: { duration: 0, ease: 'none' },
  fade: { duration: 0.6, ease: 'power2.inOut' },
  wipe: { duration: 1.2, ease: 'power2.inOut' },
  flash: { duration: 0.8, ease: 'expo.out' },
  dissolve: { duration: 1.0, ease: 'sine.inOut' },
};
```

---

## CRITICAL FILE: app/lookbook/FrameEngine.tsx (Scaffold)

```tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { FRAMES, FrameConfig } from '@/lib/frames';
import { useLookbookStore } from '@/lib/store';

// Dynamic imports for each frame component
const frameComponents: Record<string, React.LazyExoticComponent<React.FC<{ config: FrameConfig }>>> = {
  'EXHIBIT-00': React.lazy(() => import('./frames/Frame01_Exhibit00')),
  'TAPE-BARRIER': React.lazy(() => import('./frames/Frame02_TapeBarrier')),
  // ... import all 31
};

gsap.registerPlugin(ScrollTrigger);

export default function FrameEngine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCurrentFrame, setScrollProgress } = useLookbookStore();

  useLenis(({ scroll, limit }) => {
    setScrollProgress(scroll / limit);
  });

  useGSAP(() => {
    FRAMES.forEach((frame, i) => {
      ScrollTrigger.create({
        trigger: `#frame-${frame.id}`,
        start: frame.motion.scrollTrigger.start,
        end: frame.motion.scrollTrigger.end,
        scrub: frame.motion.scrollTrigger.scrub,
        onEnter: () => setCurrentFrame(frame.index),
        onEnterBack: () => setCurrentFrame(frame.index),
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative">
      {FRAMES.map((frame) => (
        <section
          key={frame.id}
          id={`frame-${frame.id}`}
          className="relative w-full min-h-[120vh] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--void)' }}
          aria-label={frame.title}
        >
          <React.Suspense fallback={<FrameSkeleton color={frame.act} />}>
            {frameComponents[frame.id] && 
              React.createElement(frameComponents[frame.id], { config: frame })}
          </React.Suspense>
        </section>
      ))}
    </div>
  );
}

function FrameSkeleton({ color }: { color: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-dashed rounded-full animate-spin"
           style={{ borderColor: color }} />
    </div>
  );
}
```

---

## CRITICAL FILE: lib/store.ts (Zustand)

```typescript
import { create } from 'zustand';

interface LookbookState {
  introComplete: boolean;
  currentFrame: number;
  scrollProgress: number;
  audioEnabled: boolean;
  magnifyMode: boolean;
  setIntroComplete: (v: boolean) => void;
  setCurrentFrame: (n: number) => void;
  setScrollProgress: (n: number) => void;
  toggleAudio: () => void;
  toggleMagnify: () => void;
}

export const useLookbookStore = create<LookbookState>((set) => ({
  introComplete: false,
  currentFrame: 0,
  scrollProgress: 0,
  audioEnabled: false,
  magnifyMode: false,
  setIntroComplete: (v) => set({ introComplete: v }),
  setCurrentFrame: (n) => set({ currentFrame: n }),
  setScrollProgress: (n) => set({ scrollProgress: n }),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
  toggleMagnify: () => set((s) => ({ magnifyMode: !s.magnifyMode })),
}));
```

---

## CRITICAL FILE: app/globals.css (Core Styles)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --void: #0A0A0C;
  --chalk: #E8E4DC;
  --evidence: #C41E3A;
  --amber: #FFBF00;
  --brass: #B5A642;
  --fog: #1A1A2E;
  --ash: #8B8680;
}

html {
  background-color: var(--void);
  color: var(--chalk);
  scroll-behavior: auto; /* Lenis handles this */
}

body {
  font-family: 'Space Grotesk', 'JetBrains Mono', system-ui, monospace;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Hide scrollbar — the scroll is the experience */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Frame base */
.frame-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.parallax-layer {
  position: absolute;
  inset: -10%;
  will-change: transform;
}

/* Evidence marker */
.evidence-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--evidence);
  color: var(--void);
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(196, 30, 58, 0.4);
}

/* Grain overlay (CSS fallback) */
.grain-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  z-index: 9999;
}
```

---

## SOL 5.6 ASSET DELIVERY CHECKLIST

### Photography (Deliver as 16-bit TIFF + WebP/AVIF)

- [ ] **f01** through **f31** — All frame hero images (4000×6000px minimum)
- [ ] **f05, f19, f21, f26** — Looping background videos (5–15s, 4K, seamless)

### Audio (Deliver as WAV + MP3/OGG)

- [ ] `amb-void-drone-loop.wav` — Global ambient (seamless 30s loop)
- [ ] `sfx-shutter-click.wav` — Camera flash (Frame 5)
- [ ] `sfx-tape-rustle.wav` — Evidence bag / folder (Frames 4, 27)
- [ ] `sfx-heartbeat-loop.wav` — 72 BPM pulse (Frame 1)
- [ ] `sfx-wind-corridor.wav` — Draft / whistle (Frame 21)
- [ ] `sfx-chair-creak.wav` — Metal stress (Frame 22)
- [ ] `sfx-button-snap.wav` — Jacket fastener (Frame 25)
- [ ] `sfx-seal-crack.wav` — Wax / tape break (Frame 29)

### Textures (Deliver as PNG / JPG)

- [ ] `dust-overlay.png` — Floating particles, tileable, transparent
- [ ] `paper-grain.jpg` — Manila folder texture
- [ ] `fingerprint-alpha.png` — For displacement / reveal effects
- [ ] `concrete-diffuse.jpg` — Frame 3 surface
- [ ] `brass-normal.jpg` — Frame 30 emboss detail
- [ ] `polaroid-frame.png` — Frame 28 border overlay
- [ ] `crime-tape-alpha.png` — Frame 2 tape strips

---

## CODEX IMPLEMENTATION PRIORITY QUEUE

### Week 1: Foundation (P0 — Blocking)
1. `lib/frames.ts` — Frame registry (copy from above)
2. `lib/store.ts` — Zustand state
3. `app/layout.tsx` — Root with Lenis provider
4. `app/lookbook/LookbookShell.tsx` — Scroll container
5. `app/lookbook/FrameEngine.tsx` — Frame renderer with ScrollTrigger
6. `app/lookbook/IntroSequence.tsx` — 8-second intro timeline

### Week 2: Core Frames (P1 — Must Have)
7. `frames/Frame01_Exhibit00.tsx` — Fingerprint with pulse
8. `frames/Frame05_FlashBulb.tsx` — Flash transition system
9. `frames/Frame09_VestDissection.tsx` — Evidence markers
10. `frames/Frame23_EyeContact.tsx` — Sunglasses reflection
11. `frames/Frame27_CaseFile.tsx` — Dossier reveal
12. `frames/Frame30_TheLogo.tsx` — Brass emboss + spotlight

### Week 3: Full Frame Set (P2 — Complete)
13. Implement remaining 19 frame components
14. Wire all into FrameEngine
15. Global grain shader overlay

### Week 4: Polish (P3 — Ship)
16. Mobile adaptation (gyroscope, touch, reduced motion)
17. Audio engine integration
18. Performance audit & optimization
19. SEO meta tags, Open Graph
20. Launch

---

## KEY DECISIONS (Do Not Change Without Discussion)

1. **No text in frames.** System text only (loading, accessibility).
2. **Vertical scroll only.** No horizontal, no pagination dots, no progress bar.
3. **Lenis damping 0.1.** Heavy, deliberate scroll feel.
4. **Color palette locked.** No deviations without brand approval.
5. **31 frames exactly.** The number is the narrative structure.
6. **melato.ca/lookbook/the-living-book.** URL is canonical.

---

*"The garment is the crime scene. The body is absent. The evidence speaks."*
