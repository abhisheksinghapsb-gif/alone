# GENESIS 6 Landing Page — Specification & Motion Architecture

This document formalizes the visual target, coordinate system, responsive adaptation, animation choreography, sound design, and accessibility rules for the Genesis 6 landing page.

---

## 1. Locked Technology Stack & Architecture

- **Framework**: Next.js 16 (App Router), React 19 (Server Shell + Focused Client Experience).
- **Styling**: Tailwind CSS v4 + Scoped CSS (`landing.css`) for spatial scene geometry and depth hierarchy.
- **Animation**: GSAP 3 + `@gsap/react` for entrance timelines and ambient idle loops; 2D HTML5 Canvas for drifting/twinkling starfield.
- **Audio Engine**: Native Web Audio API with synthesized oscillators (muted by default; rate-limited and voice-capped).
- **Assets**: Optimized local WebP and SVG artwork; zero external CDN dependencies for runtime assets.

---

## 2. 7-Layer Depth Hierarchy & Natural Occlusion

The scene establishes a unified, believable space arena environment across 7 coordinated depth layers:

```
[Layer 0] Distant Stadium Sky & Arena Floodlights (bg-arena.webp)
[Layer 1] Canvas 2D Starfield (SpaceEffects.tsx: 28 distant twinkling stars, 18 near drifting stars)
[Layer 2] Celestial Space Depth (Ringed planet, rotating blue planets, asteroid rocks, comets)
[Layer 3] Glowing Blue Moon Dome (moon-dome.webp: seated behind characters and barrier)
[Layer 3.5] Main Hero Characters:
            - Left: Dual-Wielding Neon Gunslinger (Colt: breathing, blinking, weapon readiness)
            - Right: Chameleon Hood Ninja (Leon: inward-facing, breathing, blinking, shuriken readiness)
[Layer 4] Arena Foreground Barrier (arena-foreground-barrier.webp: y=656..1024)
          * Naturally conceals lower torso cuts of characters and bottom boundary of the moon
[Layer 5] Grounded Arena Floor Objects:
            - Left: Star-Emblem Cannon Turret (grounded, barrel recoil on click)
            - Right: Squeak Balloon Accent (tethered buoyant bob, squash & rebound on click)
[Layer 6] Central Hero Identity & CTA:
            - 3D Genesis Wordmark + Golden Star Skull Emblem
            - High-contrast Edition Badge ("6TH EDITION · 2027") & Descriptor
            - Tactile Primary Register CTA Button
[Layer 7] Interface Shell:
            - Top-Left: GDAI Ribbon Badge (clear inset)
            - Center: Game Nav Buttons (Brochure [PDF link], Prize [unwired], Sponsors [unwired])
            - Top-Right: Sound Mute/Unmute & Pause Motion Controls
```

---

## 3. Reference Composition Measurements (1440 × 1024)

All proportional anchors are defined relative to the canonical 1440 × 1024 Figma frame and maintained via flexible CSS percentage/clamp rules:

| Element | Reference Pos (X, Y) | Reference Size (W, H) | Layer Depth | Parallax Factor |
| :--- | :--- | :--- | :--- | :--- |
| **Arena Background** | `0, 0` | `100% × 100%` | Distant Sky (0) | `0px` (locked) |
| **Ringed Planet** | `x: 71.5%, y: 15.9%` | `361 × 188` (25.1vw) | Celestial Space (2) | `±3px` |
| **Blue Planet Large** | `x: 4.0%, y: 25.4%` | `164 × 159` (11.4vw) | Celestial Space (2) | `±3px` (rotates 80s) |
| **Blue Moon Dome** | `x: 27.6%, y: 41.9%` | `645 × 306` (44.8vw) | Mid-Space Dome (3) | `±6px` |
| **Gunslinger (Colt)** | `x: 12.3%, y: 39.6%` | `383 × 300` (26.6vw) | Character Layer (3.5)| `±6px` |
| **Ninja (Leon, inward)**| `x: 62.4%, y: 41.6%` | `357 × 327` (24.8vw) | Character Layer (3.5)| `±6px` |
| **Foreground Barrier** | `0, y: 65.6%` | `100% × 34.4%` | Barrier Wall (4) | `0px` (arena locked) |
| **Foreground Cannon** | `x: -0.6%, y: 49.0%` | `282 × 343` (19.6vw) | Floor Object (5) | `±11px` (grounded) |
| **Squeak Balloon** | `x: 81.2%, y: 69.0%` | `252 × 330` (17.5vw) | Floor Object (5) | `±11px` |
| **Genesis Wordmark** | Centered horizontally, `y: 19.5%` | `clamp(340px, 34vw, 540px)` | Central Identity (6) | `±3px` |
| **Edition Badge** | Centered horizontally, `y: 43.5%` | Text block with dark capsule | Central Identity (6) | `0px` (stable) |
| **Register CTA** | Centered horizontally, `y: 57.5%` | `clamp(180px, 17vw, 250px)` | Central Identity (6) | `0px` (stable hit target)|
| **Header Controls** | Inset `32px` left, `24px` top | Flexible responsive bar | Stable Interface (7) | `0px` (stable) |

---

## 4. Responsive Scaling Across Laptop Sizes

The layout responds to both viewport width and viewport height.
Tested laptop resolutions:
- **1440 × 1024** (Canonical reference): Full scale with comfortable arena floor depth and natural barrier occlusion.
- **1440 × 900**: Vertical spacing compresses by 8%; character anchors shift downward slightly (`y: 38%`); arena barrier conceals lower torso cuts cleanly.
- **1536 × 864**: Scaled proportional clamps ensure central opening remains clear between Colt blasters and Leon shuriken.
- **1366 × 768**: Reduced decorative margins; logo scales to `clamp(280px, 32vw, 480px)`; Register button remains prominent; zero overlap.
- **1280 × 720**: Character scales adapt gracefully (`clamp(190px, 19vw, 280px)`); CTA button width `clamp(160px, 15vw, 210px)`; bottom arena bleeds naturally; no clipping of faces, logos, or buttons.

---

## 5. Animation Choreography & Internal Movement

### Coordinated Master Entrance (~1.5s)
1. **0.00s**: Deep space arena background emerges (`opacity: 0 -> 1`, duration `0.55s`).
2. **0.20s**: Blue Moon rises smoothly (`y: +18px -> 0px`, `opacity: 0 -> 1`, ease: `power2.out`, duration `0.75s`).
3. **0.25s**: Celestial ringed and blue planets fade in with scale ease.
4. **0.30s**: Left Gunslinger and Right Ninja enter to their arena anchors (`x: -32px / +32px -> 0px`, duration `0.7s`).
5. **0.40s**: Arena foreground barrier settles into place, concealing lower cuts.
6. **0.45s**: Cannon and Balloon character rise to floor positions.
7. **0.55s**: Genesis 3D Logo + Emblem drop into place with elastic settle (`y: -26px -> 0px`, `scale: 0.94 -> 1.0`, ease: `back.out(1.2)`).
8. **0.65s**: Header controls arrive with 60ms stagger.
9. **0.85s**: Primary `REGISTER` button pops in with satisfying bounce (`scale: 0.85 -> 1.0`, ease: `back.out(1.4)`).

### Ambient Idle Loops & Rotation
- **Large Blue Planet**: Continuous 360deg 2D rotation over 80s (`ease: none`, linear, infinite).
- **Small Blue Planet**: Continuous -360deg 2D reverse rotation over 110s (`ease: none`, linear, infinite).
- **Ringed Planet**: Slow celestial bob `±6px` and precession `±2.5deg` over `7.4s`.
- **Gunslinger**: Gentle breathing posture shift `±3.5px` over `4.6s` with periodic eyelid blink overlays.
- **Ninja**: Gentle breathing posture shift `±4px` over `5.2s` with periodic eyelid blink overlays.
- **Squeak Balloon**: Buoyant vertical bob `±8px` and slight rotation `±1.5deg` over `3.8s`.
- **Comets**: Periodic single comet pass every `9–13s` with random delay across the upper sky quadrant.

---

## 6. Tactile Feedback & Sound Engine

- Default state: **Muted** (`soundEnabled: false`).
- Audio starts **only** after explicit user opt-in via Sound Toggle button.
- Synthesized Web Audio oscillators:
  - **Hover Tick**: Crisp high frequency tick (`880Hz -> 1320Hz`, 45ms, volume `0.06`).
  - **Press Clack**: Punchy wooden game pop (`320Hz -> 110Hz`, 75ms, volume `0.12`).
  - **Toggle Click**: Dual-tone chime on sound enable/disable.
  - **Character Click Sounds**:
    - Colt: Retro sci-fi laser shot (`playColtBlaster()`).
    - Leon: Swift blade whoosh (`playNinjaSwoosh()`).
    - Cannon: Heavy mechanical blast thud (`playCannonBlast()`).
    - Balloon: Rubbery squeak pop (`playBalloonSqueak()`).
- Auto-suspend when tab is hidden or backgrounded.

---

## 7. Accessibility & Reduced Motion
- Respects `prefers-reduced-motion: reduce`:
  - Ambient idle loops and parallax are fully disabled.
  - Entrance movements collapse into immediate crisp appearance.
  - 2D Canvas starfield renders a static star snapshot.
- Dedicated **Pause Motion** toggle provided in the UI for visitor control over ambient motion.
- Semantic HTML tags: `<header>`, `<main>`, `<h1>`, `<nav>`, `<button>`, `<a>`.
- Full keyboard focusability with visible focus rings.
