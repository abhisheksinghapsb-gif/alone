# GENESIS 6 — Timeline Roadmap Specification (4 Wide Illustrated Chapters)

This document formalizes the architecture, asset inventory, layout geometry, interaction choreography, sound design, responsive verification, and optimization audit for the **Genesis 6 Timeline Redesign**.

---

## 1. Scope, Placement & Single-Page Architecture

- **Semantic Root**: `<section id="timeline" aria-label="Genesis 6 Tournament Roadmap and 4 Illustrated Chapters">`
- **Document Order**:
  1. Landing Hero Scene (`#landing-hero-scene`)
  2. Arena Section Divider (`#arena-section-divider`)
  3. About Genesis (`#about-genesis`)
  4. **Timeline Section (`#timeline`)**
  5. About-to-Sponsors Structural Divider (`#sponsors-divider`)
  6. Sponsors Section (`#sponsors`)
  7. Sponsors-to-Prize Structural Divider (`#sponsors-prize-divider`)
  8. Prize Pool Section (`#prize-pool`)
- **Scroll Behavior**: 100% natural document flow; strictly downward vertical scrolling revealing subsequent tournament checkpoints farther down the page. Zero horizontal page hijacking, zero card-stack carousels, and zero layout overflow.
- **Scroll Margin**: `scroll-margin-top: 80px` to respect the global sticky header.

---

## 2. 4 Wide Illustrated Chapters & Asset Inventory

The Timeline replaces narrow portrait cards with **4 full-width illustrated chapters** (desktop reading width ~1000–1180px) built from genuine layered assets extracted from tournament artwork:

| Chapter | Milestones & Theme | Layered Assets | Payload Size |
| :--- | :--- | :--- | :--- |
| **01 — Registration** | Warm Pink & Gold · Phase 1: Open Now | • `chapter1-env.webp` (Warm pink & gold environment)<br>• `chapter1-character.webp` (Shelly champion silhouette) | 40.2 KB<br>119.9 KB |
| **02 — Round 1** | Blue & Cyan · Phase 2: Online 24h Jam | • `chapter2-env.webp` (Deep blue arena rays)<br>• `chapter2-star.svg` (Pure vector star emblem) | 78.0 KB<br>2.1 KB |
| **03 — Round 2** | Lime & Yellow · Phase 3: On Campus Showdown | • `chapter3-env.webp` (Lime arena explosion)<br>• `chapter3-character.webp` (Spike cactus bomb thrower) | 86.0 KB<br>162.0 KB |
| **04 — Result** | Clash Red, Gold & Blue · Phase 4: Grand Finale | • `chapter4-env.webp` (Clash battlefield)<br>• `chapter4-emblem.webp` (Dual-faced brawl emblem) | 134.3 KB<br>97.4 KB |
| **Header Elements** | Tournament Guide & Wordmark | • `heading-banner.svg` (Parallelogram orange plate)<br>• `heading-text.svg` (TIMELINE wordmark)<br>• `guide-character.webp` (Buzz guide mascot)<br>• Pure CSS 3D speech bubble ("Let's make this legendary") | 2.8 KB<br>11.8 KB<br>162.2 KB<br>0 KB |
| **Spine & Accents** | Continuous Vertical Gold Rail | • Continuous 12px gold bar + 56px numbered milestone nodes (01–04)<br>• `golden-track.svg` / `strip-dark.svg` | 16.9 KB<br>0.2 KB |

All raster assets are optimized as modern high-density WebP files, providing an overall payload reduction of **>94%** compared to original embedded base64 SVGs while achieving razor-sharp visual fidelity on Retina and high-DPI displays.

---

## 3. Strict Vertical Document Layout & Component Architecture

1. **Section Header Area**:
   - Centered orange TIMELINE parallelogram plate with crisp wordmark.
   - Dedicated Guide Mascot dock: Buzz character seated comfortably beside a dimensional 3D speech bubble displaying *"Let's make this legendary"*, entirely above the timeline flow with zero card overlap.
2. **Continuous Vertical Gold Rail**:
   - Substantial 12px vertical track (`background: linear-gradient(180deg, #FDD944 0%, #F07527 100%)`) running down the left spine.
   - 4 large milestone circular nodes (`56px × 56px`) with heavy 3D beveled borders and centered milestone numbers (`01`, `02`, `03`, `04`).
   - A gold travelling progress marker tracks smoothly down the rail according to real-time scroll position.
3. **Wide Illustrated Chapter Cards (`TimelineChapter.tsx`)**:
   - Desktop width: `min(100%, 1132px)`.
   - Connected to spine nodes via horizontal glowing energy connector beams.
   - Separated into three distinct dimensional depth planes:
     - **Background Environment Layer**: Panoramic arena backdrop with subtle parallax.
     - **Foreground Character/Emblem Layer**: Elevated hero element with drop shadows.
     - **Dimensional Title Plate**: 3D angled container featuring live HTML typography, phase badges, dates, and event descriptions.

---

## 4. Scroll-Driven Animation & Interaction Choreography

Isolated **GSAP and ScrollTrigger** choreography scoped via `timelineRef`:

1. **Continuous Scrubbed Travelling Rail Marker**:
   - The travelling progress marker advances down the vertical rail directly bound to window scroll progress (`scrub: 0.4`), reflecting exact reading position.
2. **Independent Layer Reveals**:
   - Each chapter card activates as it approaches the viewport (`start: 'top 88%'`).
   - Outer card container reveals with smooth lift (`y: 36 -> 0`, `opacity: 0 -> 1`, `duration: 0.75s`).
   - Foreground character layer glides independently (`x: 24 -> 0`, `duration: 0.85s, ease: 'power2.out'`).
   - Title plate settles with slight scale overshoot (`scale: 0.96 -> 1.0`, `duration: 0.65s, ease: 'back.out(1.4)'`).
3. **Micro-Interactions & Audio Feedback**:
   - Hovering over any chapter elevates the card (`transform: translateY(-5px)`) and intensifies ambient border glow.
   - Mouse hover triggers `uiAudio.playHoverTick()`.
   - Card click/tap triggers `uiAudio.playPressClack()`.
   - Zero audio triggers during passive scrolling.
4. **Reduced Motion Graceful Degradation**:
   - When `prefers-reduced-motion: reduce` or `motionPaused=true`, all GSAP animations immediately resolve to static resting states (`opacity: 1, transform: none`).

---

## 5. Comprehensive Responsive Verification Matrix

Automated CDP verification executed on the running development server across all target viewports:

| Viewport | Device Class | Rail & Nodes | Chapter Width | Mascot Guide | Horizontal Overflow | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1536 × 864** | Wide Laptop | Intact (Left) | 1132px | Normal Flow Above | None (`1526px / 1536px`) | **PASS** |
| **1440 × 900** | Standard Laptop | Intact (Left) | 1132px | Normal Flow Above | None (`1430px / 1440px`) | **PASS** |
| **1366 × 768** | Compact Laptop | Intact (Left) | 1080px | Normal Flow Above | None (`1356px / 1366px`) | **PASS** |
| **1280 × 720** | Small Laptop | Intact (Left) | 1020px | Normal Flow Above | None (`1270px / 1280px`) | **PASS** |
| **768 × 1024** | Tablet Portrait | Compact Rail | 100% | Stacked Above | None (`758px / 768px`) | **PASS** |
| **390 × 844** | Modern Mobile | Mini Rail (40px) | 100% | Compact Bubble | None (`390px / 390px`) | **PASS** |
| **320 × 700** | Small Mobile | Mini Rail (36px) | 100% | Compact Bubble | None (`320px / 320px`) | **PASS** |

---

## 6. Accessibility & Isolation Audit

- **Zero Global Contamination**: Scoped exclusively to `components/timeline/` and `public/assets/genesis/timeline/`.
- **Keyboard Navigation**: Full `tabindex="0"` focus support with high-contrast `:focus-visible` gold rings.
- **Semantic Structure**: `<section id="timeline">` with semantic `<ol>` list of checkpoints.
