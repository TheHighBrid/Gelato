# THE LIVING BOOK
## Interactive Editorial Lookbook — Comprehensive Blueprint
### melato.ca | Crime Scene Aesthetic | 31 Editorial Frames

---

## 0. EXECUTIVE SUMMARY

**Project Codename:** `GELATO-LIVINGBOOK-v1.0`  
**Repository:** `https://github.com/TheHighBrid/Gelato`  
**Target Domain:** `melato.ca/lookbook/the-living-book`  
**Collaborative Framework:** SOL 5.6 (Creative Direction & Asset Pipeline) + Codex (Engineering & Implementation)  
**Narrative Mode:** Purely visual — zero text, zero UI chrome, zero conventional navigation  
**Core Metaphor:** A forensic evidence binder that breathes. Each frame is an "exhibit." The user is the detective.

---

## 1. CREATIVE DIRECTION

### 1.1 Brand Alignment
Melato's existing identity — "THE CULTURE WEARS US," the "Protective Custody Vest," "Amber Alibi Sunglasses," the Japanese kanji embroidery (痛 pain / 忠 loyalty) — already operates in the semantic territory of surveillance, protection, division, and testimony. **The Living Book** does not depart from this; it *intensifies* it. The lookbook treats every garment as a piece of evidence in an unsolved narrative.

### 1.2 Aesthetic Pillars

| Pillar | Description | Technical Translation |
|--------|-------------|----------------------|
| **Forensic Noir** | High-contrast chiaroscuro, desaturated color with selective saturation (blood reds, amber warnings, chalk whites) | CSS filters, WebGL post-processing, LUT color grading |
| **Tactile Decay** | Grain, dust, paper texture, fingerprint smudges, tape residue | Canvas noise overlays, SVG texture masks, film grain shaders |
| **Kinetic Evidence** | Objects that shift when observed; parallax depth suggesting hidden layers | Multi-plane parallax, scroll-linked transforms, mouse-reactive lighting |
| **Sacred Silence** | No text. No voiceover. No captions. Sound design only: low-frequency hums, shutter clicks, wind, distant sirens | Web Audio API, procedural soundscapes |

### 1.3 Color Palette

```
Primary:
  --void:        #0A0A0C    (Deep black-blue, background base)
  --chalk:       #E8E4DC    (Forensic chalk white, highlights)
  --evidence:    #C41E3A    (Crime scene tape red, accent)
  --amber:       #FFBF00    (Caution / Alibi Sunglasses tie-in)

Secondary:
  --brass:       #B5A642    (Evidence tag hardware)
  --fog:         #1A1A2E    (Atmospheric depth)
  --ash:         #8B8680    (Desaturated midtones)

Gradients:
  --blood-pool:  linear-gradient(180deg, #0A0A0C 0%, #1A0A0A 50%, #C41E3A 100%)
  --polaroid:    linear-gradient(135deg, #E8E4DC 0%, #D4CFC7 100%)
```

### 1.4 Typography (System Only — No Visible Text in Frames)

Despite the "no text" rule for frames, system-level metadata and loading states require a typeface:

- **Primary:** `Space Grotesk` or `JetBrains Mono` — utilitarian, forensic report aesthetic
- **Fallback:** `system-ui, monospace`

---

## 2. NARRATIVE ARCHITECTURE — 31 FRAMES

### Narrative Spine: "The Unsolved Wearing"

The story is not about a crime. It is about the *absence* of a crime — the moment before meaning collapses. Each frame is an exhibit. The user assembles the narrative through observation.

---

### ACT I: THE SCENE (Frames 1–8) — *Atmosphere & Discovery*

| Frame | Codename | Visual Description | Product Integration | Motion Behavior |
|-------|----------|---------------------|---------------------|-----------------|
| **1** | `EXHIBIT-00` | Extreme close-up: a single fingerprint in dust on black lacquer. The whorls subtly shift like a living thing. | None — pure atmosphere | Slow pulse (4s cycle). Mouse proximity causes the print to "smudge" slightly |
| **2** | `TAPE-BARRIER` | Yellow crime scene tape ("CRIME SCENE — DO NOT CROSS") stretched across frame, backlit by sodium vapor light. Tape flutters in nonexistent wind. | Colorway reference to brand amber | Tape ripples on scroll. Parallax depth: tape in foreground, light in deep background |
| **3** | `CHALK-01` | Overhead shot: a chalk outline on concrete. But the outline is of a garment — the "Protective Custody Vest" silhouette. Chalk dust particles float. | Vest silhouette as evidence | Scroll-triggered: outline "draws itself" (SVG stroke animation) |
| **4** | `EVIDENCE-BAG` | A clear evidence bag containing a folded garment. Condensation on the plastic. Barcode label: `MELATO-001`. | Generic brand piece | Bag sways gently. Mouse movement creates condensation "breath" on plastic |
| **5** | `FLASH-BULB` | White frame — pure overexposure. Fades to reveal: a dark room, a camera flash just fired. Afterimage burns on retina. | None — transition beat | Flash syncs to user scroll velocity (faster scroll = brighter flash) |
| **6** | `MEASURE-TAPE` | A tailor's measuring tape unfurled across a body (implied, not shown). Numbers bleed into red at certain intervals. | Sizing as forensic measurement | Tape unspools on scroll. Red zones pulse |
| **7** | `MIRROR-FRAGMENT` | Shattered mirror reflecting fragments of a face wearing "Amber Alibi Sunglasses." Each shard shows a different angle. | Sunglasses hero shot | Parallax per shard. Mouse tilts the reflection plane |
| **8** | `DOORKNOB` | Brass doorknob, slightly ajar. Light bleeds from the gap. Handle has a smudge. | Brass hardware tie-in | Door creaks open further as user scrolls down. Light intensity increases |

### ACT II: THE EVIDENCE (Frames 9–18) — *Product as Clue*

| Frame | Codename | Visual Description | Product Integration | Motion Behavior |
|-------|----------|---------------------|---------------------|-----------------|
| **9** | `VEST-DISSECTION` | The "Protective Custody Vest" laid flat, anatomical diagram style. Arrows point to features. But the arrows are crime scene markers (A, B, C...). | Vest product hero | Markers drop in sequentially (staggered animation). Hover reveals detail zoom |
| **10** | `FABRIC-TEAR` | Extreme macro of velour fabric torn. The tear forms a shape — a map, a wound, a mouth. | Divididos/Passion Fruit/Chū velour texture | Fabric "breathes" — subtle scale oscillation. Scroll tears it further |
| **11** | `CHAIN-WALLET` | "Return to Sender Chain Wallet" hanging from a chain link fence, backlit. Chain casts shadow patterns. | Wallet product shot | Chain swings with physics (simple pendulum). Shadow reacts to virtual light position |
| **12** | `BAG-INTERIOR` | "Pocket Change Top Handle Bag" — interior view. Contents: a lipstick, a key, a folded note (blank). | Bag product detail | Parallax layers: bag exterior, interior lining, contents at different depths |
| **13** | `TRACK-PANT-DRAPE` | "Divididos Velour Track Pant" draped over a chair like a discarded body. Pant leg pools on floor. | Track pant hero | Cloth simulation — gentle sway. Chair creaks on mouse hover |
| **14** | `EMBROIDERY-MAGNIFY` | Microscopic view of the "痛 pain" embroidery. Threads become landscapes. Stitches become scars. | Kanji detail — brand storytelling | Infinite zoom illusion. Scroll = magnification |
| **15** | `SUNGLASSES-REFLECTION` | "Amber Alibi Sunglasses" on a table. Lens reflects a window. In the reflection: a figure stands outside. | Sunglasses product | Reflection figure moves based on mouse position (inverse parallax) |
| **16** | `JACKET-BACK` | "Conquista Velour Track Jacket" back view — "CONQUER the world" text. But the text is partially obscured by a shadow of a hand. | Jacket hero | Shadow hand moves slowly across text. Scroll changes shadow angle |
| **17** | `SHOE-PRINT` | A muddy shoe print on white marble. But the tread pattern is the Melato "M" logo. | Brand easter egg | Print "presses" into marble on scroll (displacement effect) |
| **18** | `COLLAR-DETAIL` | Extreme close-up of a jacket collar. A hair strand caught in the zipper. | Detail shot — intimacy | Hair strand blows in virtual wind. Zipper teeth glint |

### ACT III: THE WITNESSES (Frames 19–26) — *The Human Element*

| Frame | Codename | Visual Description | Product Integration | Motion Behavior |
|-------|----------|---------------------|---------------------|-----------------|
| **19** | `SILHOUETTE-01` | Backlit figure in doorway. Wearing full "Divididos" tracksuit. Face in shadow. Identity withheld. | Full look — Divididos set | Figure shifts weight. Light flickers (faulty bulb simulation) |
| **20** | `HANDS-POCKET` | Hands in jacket pockets. Fingers drumming. Nervous energy. "Chū" jacket sleeve visible. | Chū jacket detail | Finger drumming syncs to ambient audio BPM |
| **21** | `WALK-AWAY` | Figure walking away down a corridor. Wearing "Passion Fruit" set. Corridor stretches impossibly long. | Passion Fruit full look | Infinite corridor illusion. Figure shrinks with scroll but never reaches end |
| **22** | `SITTING-WAITING` | Figure sits on a metal bench. "Protective Custody Vest" over a bare torso. Head in hands. | Vest styling — vulnerability | Slow breathing animation. Bench creaks |
| **23** | `EYE-CONTACT` | Extreme close-up: eyes behind "Amber Alibi Sunglasses." Reflection in lenses shows the viewer. | Sunglasses — direct address | Blink animation (random intervals). Reflection warps slightly |
| **24** | `BACK-TO-BACK` | Two figures, back to back. One in "Divididos," one in "Conquista." Tension. Division. | Collection juxtaposition | Figures separate slightly on scroll. Gap reveals a light source |
| **25** | `DRESSING` | Hands buttoning a jacket. Slow, deliberate. Each button a decision. | "Chū" jacket — ritual | Button sequence triggers on scroll progress. Audio: button snap |
| **26** | `DEPARTURE` | Figure opens a door. Light floods in. Wearing full look. Identity still obscured. | Full collection finale — mystery | Door opens on scroll completion. Light blooms (WebGL bloom pass) |

### ACT IV: THE DOSSIER (Frames 27–31) — *Resolution & Brand Reveal*

| Frame | Codename | Visual Description | Product Integration | Motion Behavior |
|-------|----------|---------------------|---------------------|-----------------|
| **27** | `CASE-FILE` | A manila case file on a desk. Label: `MELATO — THE LIVING BOOK`. File opens. | Brand reveal — dossier metaphor | File opens on scroll. Papers shuffle |
| **28** | `POLAROID-WALL` | Wall covered in polaroids. Each polaroid is a frame from the lookbook, rearranged. Some are missing. | Collection recap | Polaroids tilt on hover. Missing ones create negative space |
| **29** | `RED-TAPE` | Red "MELATO" tape seals the file shut. But the seal is broken. | Brand lockup — disruption | Seal cracks on scroll. Tape tears |
| **30** | `THE-LOGO` | The Melato wordmark, embossed in brass on a dark surface. A single spotlight. | Pure brand — confidence | Spotlight follows mouse. Emboss catches light |
| **31** | `CLOSING-STATEMENT` | Black frame. Then: a single fingerprint appears. It is the viewer's. (Camera access or stylized representation). | Meta-narrative — user as participant | Fingerprint "scans" in. Fade to brand URL |

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Stack Recommendation

```
Framework:        Next.js 14+ (App Router) — SSR for SEO, SSG for performance
Styling:          Tailwind CSS + CSS Modules (for frame-specific styles)
Animation:        GSAP 3.x + ScrollTrigger (primary motion engine)
                  Lenis (smooth scroll — critical for parallax feel)
3D/WebGL:         React Three Fiber + Drei (for frames requiring 3D depth)
                  Custom shaders for grain, displacement, bloom
State Management: Zustand (lightweight, for frame progression & audio state)
Audio:            Howler.js or native Web Audio API (procedural soundscapes)
Image Pipeline:    Next.js Image + Sharp (WebP/AVIF optimization)
                  Cloudinary or Vercel Edge for responsive images
Analytics:        Vercel Analytics (performance) + custom scroll-depth tracking
```

### 3.2 Component Hierarchy

```
app/
├── layout.tsx                    # Root layout — preload assets, audio context
├── page.tsx                      # Entry point — mounts Lookbook shell
├── lookbook/
│   ├── LookbookShell.tsx         # Main container — scroll container, state provider
│   ├── IntroSequence.tsx         # Pre-loader / intro animation
│   ├── FrameEngine.tsx           # Frame renderer — handles transitions
│   ├── AudioEngine.tsx           # Ambient soundscape manager
│   └── frames/
│       ├── Frame.tsx             # Base frame component (abstract)
│       ├── Frame01_Exhibit00.tsx
│       ├── Frame02_TapeBarrier.tsx
│       ├── ... (31 frame components)
│       └── Frame31_ClosingStatement.tsx
├── components/
│   ├── shaders/
│   │   ├── FilmGrain.tsx         # Post-processing grain overlay
│   │   ├── DisplacementMap.tsx   # Texture displacement effects
│   │   └── BloomPass.tsx         # Light bloom for revelation moments
│   ├── ui/
│   │   ├── EvidenceMarker.tsx    # Reusable crime scene marker
│   │   ├── Polaroid.tsx          # Polaroid frame component
│   │   └── CaseFile.tsx          # Manila folder animation
│   └── effects/
│       ├── ParallaxPlane.tsx     # Multi-layer parallax system
│       ├── FlashBulb.tsx         # White flash transition
│       └── FingerprintScanner.tsx # Frame 31 meta-effect
├── hooks/
│   ├── useScrollProgress.ts      # Normalized scroll position (0-1)
│   ├── useMousePosition.ts       # Normalized mouse (0-1)
│   ├── useAudioContext.ts        # Web Audio API context manager
│   └── useFrameVisibility.ts     # Intersection Observer for frame activation
├── lib/
│   ├── frames.ts                 # Frame registry — metadata, asset paths, triggers
│   ├── audio.ts                  # Soundscape definitions & procedural generation
│   └── constants.ts              # Color palette, timing, easing curves
├── types/
│   └── lookbook.ts               # TypeScript interfaces for frames, assets, state
└── public/
    ├── frames/                   # Optimized image assets (WebP/AVIF)
    ├── audio/                    # Compressed audio assets (MP3/OGG)
    └── textures/                 # Grain maps, dust overlays, paper textures
```

### 3.3 Frame Data Schema

```typescript
// lib/frames.ts

interface FrameConfig {
  id: string;                    // e.g., "EXHIBIT-00"
  index: number;                 // 1-31
  act: 'I' | 'II' | 'III' | 'IV';
  codename: string;
  assets: {
    images: string[];              // Optimized image paths
    video?: string;                // Looping background video (if applicable)
    audio?: string;                // Frame-specific ambient layer
    textures?: string[];           // Shader textures
  };
  motion: {
    parallaxLayers: number;        // 1 (flat) to 5 (deep)
    scrollTrigger: {
      start: string;              // e.g., "top center"
      end: string;                // e.g., "bottom center"
      scrub: boolean | number;    // Scroll-linked smoothing
    };
    mouseReactive: boolean;       // Does frame respond to cursor?
    autoPlay: boolean;            // Does frame have ambient animation?
  };
  effects: {
    grain: boolean;
    displacement: boolean;
    bloom: boolean;
    flash: boolean;
  };
  duration: number;                // Estimated viewport time (ms) — for audio sync
  nextFrameTransition: 'cut' | 'fade' | 'wipe' | 'flash' | 'dissolve';
}

const FRAMES: FrameConfig[] = [
  {
    id: 'EXHIBIT-00',
    index: 1,
    act: 'I',
    codename: 'Fingerprint',
    assets: {
      images: ['/frames/f01-fingerprint.webp'],
      textures: ['/textures/dust-overlay.png']
    },
    motion: {
      parallaxLayers: 2,
      scrollTrigger: { start: 'top bottom', end: 'bottom top', scrub: 1 },
      mouseReactive: true,
      autoPlay: true
    },
    effects: { grain: true, displacement: true, bloom: false, flash: false },
    duration: 4000,
    nextFrameTransition: 'dissolve'
  },
  // ... 30 more entries
];
```

---

## 4. INTRO SEQUENCE SPECIFICATION

### 4.1 Phase Breakdown (Total: ~8 seconds)

| Phase | Duration | Visual | Audio |
|-------|----------|--------|-------|
| **Phase 0: The Void** | 0.0s – 1.5s | Pure black. A barely perceptible hum. A single pixel of light appears at center. | 60Hz sub-bass hum. Faint vinyl crackle. |
| **Phase 1: The Evidence Tag** | 1.5s – 3.5s | A manila evidence tag materializes from the pixel. It rotates in 3D space. Text types out: `CASE FILE: MELATO-LB-001`. Text is for the intro only — disappears after. | Typewriter mechanical sounds. Tag rustles. |
| **Phase 2: The Fingerprint** | 3.5s – 5.5s | Tag dissolves into dust. From the dust, a fingerprint emerges — the same fingerprint from Frame 1. It pulses with life. | Dust particles whisper. Pulse syncs to heartbeat (72 BPM). |
| **Phase 3: The Title** | 5.5s – 7.0s | Fingerprint expands to fill screen, then shatters into 31 fragments. Each fragment becomes a frame thumbnail, arranged in a grid that collapses into a single scrollable column. | Shatter sound — glass breaking in reverse. Low whoosh. |
| **Phase 4: The Handoff** | 7.0s – 8.0s | Screen fades to black. A single yellow crime scene tape line wipes across horizontally. The tape reads: `THE LIVING BOOK`. Then: scroll indicator appears (subtle downward pulse). | Tape tear sound. Silence. Then: ambient soundscape begins. |

### 4.2 Technical Implementation

- **Engine:** GSAP timeline with `ScrollTrigger` disabled during intro
- **3D:** R3F for evidence tag rotation and fragment shatter
- **Shaders:** Custom fragment shader for dust-to-fingerprint morph
- **Audio:** Web Audio API oscillator for hum + preloaded sound effects
- **State:** Intro completion sets `introComplete = true` in Zustand store, enabling scroll

---

## 5. INTERACTION DESIGN

### 5.1 Scroll Behavior

```
Mode: Virtual Scroll (Lenis)
Damping: 0.1 (heavy, deliberate — like turning pages in a thick file)
Direction: Vertical only
Velocity Sensitivity: 
  - Slow scroll (< 500px/s): Cinematic, smooth
  - Fast scroll (> 1500px/s): Motion blur effect activates
  - Snap points: None (continuous flow — the "evidence stream")
```

### 5.2 Mouse Interactions

| Gesture | Behavior | Frames Applied |
|---------|----------|---------------|
| **Move** | Parallax depth shift (multi-plane) | All frames with `mouseReactive: true` |
| **Hover** | Evidence markers illuminate; textures reveal detail | Frames 9, 11, 12, 14, 15, 17 |
| **Click/Hold** | "Magnifying glass" effect — 2x zoom with circular mask | Frames 7, 14, 18 (detail frames) |
| **Double Click** | Frame "locks" — pauses scroll, expands to fullscreen, audio isolates | Any frame (optional easter egg) |

### 5.3 Mobile Adaptations

- **Gyroscope:** Device tilt replaces mouse parallax (subtle, ±5°)
- **Touch:** Swipe velocity controls scroll. Long-press triggers magnify.
- **Haptic:** Vibration on frame transitions (if supported)
- **Performance:** Reduce shader complexity. Disable 3D elements. Use CSS transforms only.

### 5.4 Keyboard Navigation (Accessibility)

```
Arrow Down / Page Down:  Advance to next frame snap point
Arrow Up / Page Up:      Retreat to previous frame
Spacebar:                Toggle ambient audio
M:                       Toggle magnify mode
Escape:                  Exit fullscreen / Return to top
```

---

## 6. ASSET PIPELINE

### 6.1 Photography Direction (Shot List for SOL 5.6)

**Camera:** Medium format digital (Hasselblad X2D or Phase One) for maximum detail  
**Lighting:** Single-source hard light (Profoto B10 with grid) + negative fill. Occasional practicals (sodium vapor, bare bulb).  
**Color Treatment:** Capture neutral. Grade in post to forensic palette.  
**Resolution:** Minimum 4000×6000px per frame. Deliver in 16-bit TIFF.  
**Aspect Ratio:** 3:2 (portrait orientation preferred for vertical scroll)  

**Specific Shot Requirements:**

| Frame | Shot Type | Lighting | Props | Model Direction |
|-------|-----------|----------|-------|-----------------|
| 1 | Macro (1:1) | Raking side light, hard shadow | Black lacquer surface, fingerprint powder | N/A |
| 2 | Wide | Backlit sodium vapor | Crime scene tape, stands | N/A |
| 3 | Overhead flat lay | Soft diffused overhead | Concrete slab, chalk, vest | N/A |
| 7 | Macro composite | Multiple small sources | Shattered mirror, sunglasses | Face partially visible |
| 9 | Flat lay | Overhead softbox | Vest, evidence markers A-H | N/A |
| 19 | Full body silhouette | Hard backlight, no front fill | Doorway frame | Stand still, weight shift |
| 23 | Extreme close-up | Ring light + single key | Sunglasses | Stare into lens, blink naturally |
| 30 | Product still | Single spotlight, gobo | Brass plate, logo emboss | N/A |

### 6.2 Video Assets

- **Format:** MP4 (H.264) + WebM (VP9) fallback
- **Resolution:** 1920×1080 minimum (4K preferred for zoom)
- **Duration:** 5–15 second seamless loops
- **Compression:** HandBrake CRF 18–22
- **Usage:** Background atmosphere for frames 2, 5, 19, 21, 26

### 6.3 Audio Assets

| Asset | Type | Description | Trigger |
|-------|------|-------------|---------|
| `ambient-void` | Loop | Sub-bass drone, 60Hz hum, distant city | Global — plays throughout |
| `shutter-click` | One-shot | Vintage camera shutter | Frame 5 flash |
| `tape-rustle` | One-shot | Manila folder / evidence bag | Frame 27 case file |
| `heartbeat` | Loop | 72 BPM, muffled | Frame 1 fingerprint pulse |
| `wind-corridor` | Loop | Low whistle, draft | Frame 21 infinite corridor |
| `chair-creak` | One-shot | Metal stress | Frame 22 bench sit |
| `button-snap` | One-shot | Jacket button | Frame 25 dressing |
| `seal-crack` | One-shot | Wax / tape break | Frame 29 red tape |

### 6.4 Texture Library (Procedural & Static)

```
/textures/
  dust-overlay.png          # Floating particles (tilable)
  paper-grain.jpg           # Manila folder texture
  fingerprint-alpha.png     # For displacement maps
  concrete-diffuse.jpg      # Frame 3 surface
  brass-normal.jpg          # Frame 30 emboss detail
  polaroid-frame.png        # Frame 28 border
  crime-tape-alpha.png      # Frame 2 tape strips
  film-grain-16mm.mp4       # Global overlay (subtle)
```

---

## 7. PERFORMANCE BUDGET

### 7.1 Targets

```
First Contentful Paint (FCP):     < 1.2s
Largest Contentful Paint (LCP):  < 2.5s
Time to Interactive (TTI):       < 3.5s
Cumulative Layout Shift (CLS):   < 0.05
Total Blocking Time (TBT):       < 200ms
Frame Rate:                      60fps (desktop) / 30fps (mobile)
```

### 7.2 Optimization Strategies

1. **Progressive Loading:**
   - Frame 1–5 assets preload immediately
   - Frames 6–15 load after intro completes
   - Frames 16–31 lazy-load on scroll approach

2. **Image Strategy:**
   - Next.js `<Image>` with `priority` for first 5 frames
   - `loading="lazy"` for remainder
   - `placeholder="blur"` with LQIP (Low Quality Image Placeholders)
   - AVIF format with WebP fallback

3. **Shader Optimization:**
   - Run heavy fragment shaders at 0.5x resolution (upscaled via CSS)
   - Use `requestAnimationFrame` throttling for off-screen frames
   - Dispose WebGL contexts when frames exit viewport

4. **Audio:**
   - Load ambient track first (compressed MP3, ~2MB)
   - One-shot SFX load on-demand
   - Mute audio until user interaction (browser policy compliance)

5. **Code Splitting:**
   - Each frame component is a dynamic import
   - `React.lazy()` + `Suspense` with skeleton placeholders

---

## 8. ACCESSIBILITY & ETHICS

### 8.1 Accessibility

- **Reduced Motion:** Respect `prefers-reduced-motion` — disable parallax, auto-play, and flash effects. Substitute with static frames with fade transitions.
- **Color Contrast:** Ensure evidence markers and interactive elements meet WCAG AA even in dark mode.
- **Screen Reader:** Provide `aria-label` descriptions for each frame (hidden visually, available to assistive tech). Frame 31 fingerprint scanner offers text alternative.
- **Focus Management:** Keyboard navigation maintains visible focus indicators.

### 8.2 Content Warnings

- The "crime scene" aesthetic is atmospheric, not graphic. No blood, no violence, no bodies.
- Frame 3 chalk outline is of a garment, not a person.
- Frame 22 shows vulnerability (head in hands) but is styled, not distressing.
- Consider a subtle content note: "This experience uses forensic and noir imagery in a stylized, non-graphic manner."

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1–2) — *Codex Primary*

```
□ Initialize Next.js 14 project in /Gelato repo
□ Configure Tailwind, GSAP, Lenis, Zustand, R3F
□ Build FrameEngine.tsx — scroll container, frame registry, transition system
□ Build AudioEngine.tsx — ambient soundscape, Web Audio API context
□ Implement IntroSequence.tsx — 8-second intro timeline
□ Set up asset pipeline (public/frames, public/audio, public/textures)
□ Deploy to Vercel preview environment
```

### Phase 2: Frame Construction (Week 3–5) — *SOL 5.6 & Codex Parallel*

```
SOL 5.6:
  □ Produce all 31 frame photography (raw assets)
  □ Grade and export optimized WebP/AVIF
  □ Record/procure audio assets
  □ Generate texture library

Codex:
  □ Build Frame base component with parallax, mouse, shader hooks
  □ Implement Frames 1–8 (Act I)
  □ Implement Frames 9–18 (Act II)
  □ Implement Frames 19–26 (Act III)
  □ Implement Frames 27–31 (Act IV)
  □ Wire all frames into FrameEngine with scroll triggers
```

### Phase 3: Polish & Effects (Week 6) — *Codex Primary*

```
□ Film grain shader overlay (global)
□ Displacement maps for fingerprint/smudge effects
□ Bloom pass for revelation moments (Frames 26, 30)
□ Flash bulb transition system
□ Mobile adaptation (gyroscope, touch, haptics)
□ Performance audit — Lighthouse 95+ score target
□ Cross-browser testing (Chrome, Safari, Firefox, Edge)
```

### Phase 4: Integration & Launch (Week 7) — *Collaborative*

```
□ Final asset integration (replace placeholders with production assets)
□ Audio sync and mixing
□ SEO meta tags, Open Graph, Twitter Cards
□ Analytics instrumentation (scroll depth, frame dwell time)
□ Domain mapping: melato.ca/lookbook/the-living-book
□ Launch
```

---

## 10. GIT WORKFLOW

```
main
├── develop
│   ├── feature/intro-sequence
│   ├── feature/frame-engine
│   ├── feature/audio-engine
│   ├── feature/act-i-frames
│   ├── feature/act-ii-frames
│   ├── feature/act-iii-frames
│   ├── feature/act-iv-frames
│   ├── feature/shaders-effects
│   └── feature/mobile-adaptation
└── release/v1.0
```

**Branch Naming:** `feature/<descriptor>` | `fix/<issue>` | `assets/<batch>`  
**Commit Convention:** `feat:`, `fix:`, `assets:`, `perf:`, `docs:`  
**PR Requirements:** Visual preview link (Vercel), Lighthouse score, mobile screenshot

---

## 11. COLLABORATION PROTOCOL — SOL 5.6 ↔ CODEX

### Communication Contract

```
SOL 5.6 → Codex:
  "Deliverable: [Asset Type] for [Frame ID]
   Spec: [Resolution/Format/Duration]
   Reference: [Mood board / Shot list item]
   Blocker: [Yes/No — does Codex need this to proceed?]"

Codex → SOL 5.6:
  "Request: [Asset Type] for [Frame ID]
   Reason: [Technical or creative justification]
   Deadline: [Date]
   Fallback: [What happens if unavailable?]"
```

### Shared Resources

- **Figma File:** `GELATO-LIVINGBOOK-MASTER` — wireframes, frame layouts, asset placement guides
- **Asset Drive:** `/assets/` directory in repo — version-controlled LFS for large files
- **Staging URL:** `https://gelato-lookbook.vercel.app` — auto-deployed on every PR

---

## 12. RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Asset production delays (photography) | Medium | High | Build with placeholder images (Unsplash crime scene aesthetic) first. Swap assets in Phase 4. |
| WebGL performance on low-end devices | High | Medium | Progressive enhancement — CSS-only fallback for mobile. Shader quality scales with GPU tier. |
| Audio autoplay blocked by browsers | High | Low | Audio initializes on first user interaction (click/scroll). Intro is silent until interaction. |
| SEO impact of image-heavy, text-light page | Medium | Medium | Structured data (Schema.org ImageObject), alt text, meta descriptions, sitemap. |
| Repository bloat from 31 high-res images | Medium | Medium | Use Git LFS. Store production assets on CDN (Cloudinary). Repo contains only compressed references. |

---

## 13. APPENDIX

### A. Easing Curves (GSAP)

```javascript
const EASINGS = {
  forensic:    'power4.inOut',    // Heavy, deliberate
  revelation:  'expo.out',        // Sudden clarity
  breath:      'sine.inOut',      // Organic pulse
  shatter:     'elastic.out(1, 0.3)', // Fragment dispersal
  tape:        'power2.inOut',    // Mechanical pull
};
```

### B. Shader Snippets (Reference)

**Film Grain Fragment Shader:**
```glsl
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;
  float noise = random(uv + uTime * 0.01);
  gl_FragColor = vec4(vec3(noise), uIntensity);
}
```

### C. Frame Transition Matrix

| From → To | Transition | Duration | Easing |
|-----------|-----------|----------|--------|
| Act I → Act II | Flash bulb + dissolve | 800ms | `expo.out` |
| Act II → Act III | Horizontal wipe (crime tape pull) | 1200ms | `power2.inOut` |
| Act III → Act IV | Vertical fold (case file closing) | 1000ms | `power4.inOut` |
| Within Act | Soft crossfade | 600ms | `sine.inOut` |

### D. Asset Naming Convention

```
frames/
  f01-exhibit00-fingerprint-[version]-[size].webp
  f02-tapebarrier-tape-[version]-[size].webp

audio/
  sfx-shutter-click-[version].mp3
  amb-void-drone-loop-[version].mp3

textures/
  tex-dust-overlay-[version].png
  tex-paper-grain-[version].jpg
```

---

## 14. SIGN-OFF CHECKLIST

- [ ] All 31 frames have approved shot lists
- [ ] Intro sequence storyboard approved
- [ ] Color palette locked
- [ ] Technical stack confirmed
- [ ] Repository initialized with branch protection
- [ ] Vercel project linked
- [ ] Asset delivery schedule agreed
- [ ] Performance budget accepted
- [ ] Accessibility audit scheduled
- [ ] Launch date set

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-13  
**Prepared for:** SOL 5.6 & Codex collaborative execution  
**Repository:** https://github.com/TheHighBrid/Gelato  
**Destination:** melato.ca/lookbook/the-living-book

---

*"The garment is the crime scene. The body is absent. The evidence speaks."*
