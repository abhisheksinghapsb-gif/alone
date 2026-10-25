# GENESIS 6 Landing Page — Motion Assets & Animation Architecture

This document details the motion assets, animation layers, interaction states, and generation provenance for the Genesis 6 landing page.

---

## 1. Motion Categorization Overview

Per the Genesis 6 art direction specification, animation is divided into six distinct, visible categories rather than generic whole-image floating:

| Motion Category | Elements Involved | Technical Mechanism | Cycle / Timing | Interactive Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **1. Ambient Movement** | Distant & near space stars, cosmic asteroids, comet trails, moon dome glow | 2D HTML5 Canvas (`SpaceEffects.tsx`) + GSAP timelines | Continuous, staggered phases (3.8s–7.4s) | Pauses on user toggle or `prefers-reduced-motion` |
| **2. Actual Object Rotation** | Large blue planet, small blue planet, ringed planet | CSS & GSAP `rotation` transforms | Large blue: 80s continuous 2D revolution<br>Small blue: 110s reverse revolution<br>Ringed: 7.4s precession (±2.5deg) | Stable silhouette and constant lighting |
| **3. Character Idle Animation** | Neon Gunslinger (Colt), Hooded Ninja (Leon), Squeak Balloon | GSAP breathing hover + eyelid blink overlays | Posture hover: 4.6s–5.4s<br>Natural blinks: 3.2s–6.2s randomized intervals | Realistic micro-movement without full-image wobble |
| **4. Pointer Response** | All scene depth layers | Smoothed requestAnimationFrame pointer tracking | Normalized `(-1 to 1)`, 8% dampening | Distant: ±3px<br>Midground: ±6px<br>Foreground: ±11px<br>CTA & Logo: 0px (locked) |
| **5. Click / Tap Reactions** | Colt, Leon, Cannon, Balloon | Interactive state triggers with 500ms cooldown + Web Audio | One-shot tactile gesture (~550–650ms) | Colt: weapon recoil + muzzle flare<br>Leon: shuriken ready<br>Cannon: barrel recoil<br>Balloon: squash & rebound |
| **6. Entrance Choreography** | Entire stage composition | Coordinated master GSAP timeline | Overlapping 1.5s sequence | Sequential layer reveals with back.out elastic settles |

---

## 2. Character Internal Animation & Interactive States

### Left Character: Dual-Wielding Neon Gunslinger (Colt)
- **Idle Posture**: Subtle breathing posture shift (`y: -3.5px`, duration `4.6s`, `sine.inOut`).
- **Natural Blink Cycle**: Periodic eyelid blink overlay positioned at `x: 44.8%, y: 40.6%` using character's exact skin tone (`#F3B497`), blinking for 130ms every 3.2–6.2s.
- **Pointer Aim**: Pointer tracking slightly angles blaster focus inward toward the central arena.
- **Click / Tap Reaction**:
  - Web Audio: `uiAudio.playColtBlaster()` (retro sci-fi laser sound).
  - Recoil: Weapon arms snap back 3px with 0.98 scale compression for 90ms, then ease back to idle over 380ms.
  - Visual FX: High-contrast muzzle flare accent (`/assets/genesis/motion/muzzle-flare.webp`) pops at the blaster tip for 110ms (`muzzlePop` keyframe).
  - Cooldown: 550ms cooldown prevents audio and animation stacking.

### Right Character: Chameleon Hood Ninja (Leon)
- **Orientation**: Renders facing inward to the left toward the center arena (**no horizontal mirror**).
- **Idle Posture**: Subtle breathing posture shift (`y: -4px`, duration `5.2s`, `sine.inOut`, offset phase).
- **Natural Blink Cycle**: Eyelid blink overlay inside the chameleon hood at `x: 46.5%, y: 38.2%`, blinking for 130ms.
- **Pointer Response**: Leans subtly inward toward the central identity.
- **Click / Tap Reaction**:
  - Web Audio: `uiAudio.playNinjaSwoosh()` (sharp shuriken whoosh sound).
  - Gesture: Lean forward (`rotate(-2.5deg) scale(1.02)`) readying shuriken for 100ms, then smoothly settling over 420ms.
  - Cooldown: 600ms cooldown.

### Left Foreground Object: Star-Emblem Cannon Turret
- **Grounding**: Firmly anchored on the arena floor (no floating or hovering).
- **Click / Tap Reaction**:
  - Web Audio: `uiAudio.playCannonBlast()` (heavy mechanical thud).
  - Recoil: Barrel recoils along its incline (`translate(-8px, 6px) scale(0.97)`) for 80ms, then rebounds with mechanical damping.
  - Visual FX: Muzzle spark flash at the barrel opening for 120ms.
  - Cooldown: 600ms cooldown.

### Right Foreground Accent: Squeak Balloon Character
- **Idle Motion**: Tethered vertical buoyant bob (`y: -8px`, `rotation: 1.5deg`, duration `3.8s`).
- **Click / Tap Reaction**:
  - Web Audio: `uiAudio.playBalloonSqueak()` (rubbery squeak pop).
  - Squash & Rebound: Soft vertical squash (`scale(1.14, 0.86) translateY(6px)`) for 90ms, followed by spring rebound (`scale(1, 1)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`) settling over 420ms.
  - Cooldown: 650ms cooldown.

---

## 3. Celestial Movement & Starfield Particles

### Canvas 2D Starfield (`SpaceEffects.tsx`)
- **Particle Budget**: 46 active stars (28 distant twinkling stars, 18 near drifting stars).
- **Colors**: Curated palette (`#E2F1FF`, `#FFFFFF`, `#CBE9FE`, `#FFF8D6`, `#A5E9FE`).
- **Near Star Drift**: Slow linear velocity (`vx: 0.08..0.24`, `vy: 0.02..0.08`) with edge recycling.
- **Sparkle Accents**: Dynamic 4-point cross sparkles drawn on prominent stars during peak twinkle phases.
- **Performance**: Canvas rendering capped at DPR 1.5; frame loop immediately cancels when motion is paused or document is hidden.

### Continuous Planet Rotations
- **Large Blue Planet**: Continuous 360deg rotation over 80s (`ease: none`, linear, infinite).
- **Small Blue Planet**: Continuous -360deg reverse rotation over 110s (`ease: none`, linear, infinite).
- **Ringed Planet**: Slow precession tilt (±2.5deg) and spatial drift (±6px) over 7.4s with smooth sine easing.

### Periodic Comet Streak
- Triggers every 9–13s along a deliberate diagonal path across the upper space quadrant.
- Eases across open space without obscuring faces or UI controls.

---

## 4. Generation Tools & Asset Provenance

### Available Capabilities & Audit
- Inspection of Antigravity session confirmed:
  - Local image and XML inspection capabilities: Available and fully utilized.
  - FFmpeg / Image processing via Python Pillow: Available and utilized to extract clean layers and compute exact parabolic barrier curves.
  - Video Generation tool: Not bundled or exposed as an interactive tool in this session; no unbilled or external video APIs were used.
- **Asset Extraction & Optimization**:
  - `arena-foreground-barrier.webp` (42 KB): Extracted directly from `landing page.svg` along the stadium barrier curve ($y=656..1024$) to naturally occlude lower character cuts and the moon dome.
  - `muzzle-flare.webp` (2.7 KB): Procedurally generated localized muzzle light flare for Colt and Cannon firing recoil reactions.
  - Static WebP assets: 22 optimized assets total 1.07 MB (well below the 3 MB budget).
  - Brochure: Untouched `GENESIS_6_BROCHURE_.pdf` (1.75 MB).
