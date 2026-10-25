# GENESIS 6 — About Genesis Section Specification

This document formalizes the architecture, asset mapping, layout geometry, interaction choreography, sound design, and accessibility rules for the **About Genesis** section.

---

## 1. Scope & Measured Laptop Target

- **Placement**: Immediately beneath the Genesis 6 Landing Scene in the same vertically scrolling document (`#page-root`).
- **Semantic Root**: `<section id="about-genesis" aria-labelledby="about-genesis-heading">`.
- **Target Browser Viewport**: `1536 × 730 CSS px` (DPR `1.25`, physical `1920 × 1080` with 125% Windows display scaling).
- **Navigation**: Reachable via natural document scrolling; no secondary routing or synthetic camera controls.

---

## 2. Asset Inventory & Runtime Optimization

All original assets under `components/ABout/Untitled (5)` are preserved untouched. Clean, lightweight runtime copies are served from `public/assets/genesis/about/`:

| Asset Role | Source File (Dimensions) | Original Payload | Runtime File | Optimized Size | Reduction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **City Battle Scene** | `Neon Moonlit Mecha City Battle 1.svg` (1440 × 1024) | `2,905,883 B` (2.91 MB) | `mecha-city-battle.webp` (1512 × 1040) | `243,702 B` (243 KB) | **-91.6%** |
| **Genesis Wordmark** | `4ff7e395-e990-482b-a88a-177d32d9b5a8 1.svg` (510 × 176) | `1,297,434 B` (1.30 MB) | `genesis-wordmark.webp` (2138 × 736) | `62,674 B` (62 KB) | **-95.2%** |
| **Decorative Pattern** | `Group 808.svg` (1015 × 981) | `71,330 B` (71 KB) | `decorative-pattern.webp` (734 × 732) | `15,290 B` (15 KB) | **-78.6%** |
| **About Plaque** | `Group 1083.svg` (438 × 184) | `8,856 B` (Vector SVG) | `about-title-plaque.svg` (Vector SVG) | `8,856 B` (8.8 KB) | Pure SVG |
| **Skull Star Emblem** | `brawl-star-loading.svg` (145 × 143) | `5,819 B` (Vector SVG) | `skull-star-emblem.svg` (Vector SVG) | `5,819 B` (5.8 KB) | Pure SVG |
| **Panel Silhouette** | `Vector 38.svg` (741 × 695) | `289 B` (Vector SVG) | Dynamic SVG Path (`BriefingPanel.tsx`) | `0 B` (Inline) | Zero Network |
| **Directional Gradient**| `Rectangle 489.svg` (844 × 1024) | `513 B` (Vector SVG) | Pure CSS Gradient (`aboutGradientOverlay`) | `0 B` (Inline) | Zero Network |

**Total Section Runtime Payload**: `~336 KB` (down from over 7.68 MB in the mockup reference, an overall **>95% payload reduction**).

Unused reference assets retained in project workspace without shipping to client:
- `about (1).svg` (7.68 MB full composition reference).
- `Cinematic Sci-Fi Arena Dome 1.svg` (3.06 MB alternative dome background).
- `brawlers_description_paragraph.svg` (330 KB obsolete outlined text).

---

## 3. Two-Region Arena Composition

Calibrated for the measured `1536 × 730` laptop content area:

```
+---------------------------------------------------------------------------------------------------+
| Top Seam Transition (linear-gradient: -45px to +55px, #040414 -> night sky)                      |
|                                                                                                   |
|  [LEFT REGION: 46% usable width (~650px)]               [RIGHT REGION: 54% action vista]          |
|                                                                                                   |
|  +---------------------------+                          - Full illuminated nighttime skyline      |
|  | [Skull] [ ABOUT PLAQUE ]  |                          - Large foreground mecha warrior          |
|  +---------------------------+                            (helmet, eye sensors, YOYO chest badge, |
|                                                           purple fist, and yellow arm visible)    |
|  +---------------------------+                          - Upper airborne mecha combatant          |
|  |     G E N E S I S         |                          - Ground running mecha combatant          |
|  +---------------------------+                                                                    |
|          | (20px clear space)                                                                     |
|  +-------------------------------------+                                                          |
|  |            /=======\                |                                                          |
|  |   +-------+ TOP TAB +-------+       |                                                          |
|  |   | 5px Solid Black Outline |       |                                                          |
|  |   | Solid Cyan #BCE6F2 Fill |       |                                                          |
|  |   | Live 3-Paragraph HTML Copy      |                                                          |
|  |   +-------------------------+       |                                                          |
|  |   Dark Offset Edge Shadow (7px, 9px)|                                                          |
|  +-------------------------------------+                                                          |
+---------------------------------------------------------------------------------------------------+
```

### Approved Live Event Copy (HTML Normal Flow)
- **H2 (Accessible Semantic Heading)**: `About Genesis`
- **Paragraph 1**:
  “**Genesis 6** is the sixth edition of Army Institute of Technology, Pune’s student-driven game jam, powered by the AR-VR Club.”
- **Paragraph 2**:
  “Across **24 hours**, participants bring coding, creativity and game design together to turn ideas into **playable experiences**. Interactive challenges and speaker sessions add new perspectives along the way.”
- **Paragraph 3**:
  “Bring your ideas. Build with your team. Create something worth playing.”

### Reconstructed Cyan Briefing Panel (`Vector 38` Geometry)
- **Top Tab**: Centered on panel width (`tabLeft = (W - tabWidth) / 2`), width `180–210px`, height `42.5px`, with 45° beveled shoulders (`bevelWidth = 32.5px`).
- **Silhouette Path Formula**:
  `M {tabLeft} 2.5 L {leftShoulderX} 45 H 2.5 V {H - 2.5} H {W - 2.5} V 45 H {rightShoulderX} L {tabRight} 2.5 Z`
- **Border & Shadow**: Constant `5px` solid black stroke, offset physical thickness shadow at `(x=+7px, y=+9px, #050814)`.
- **Text Safety**: Solid `#BCE6F2` fill prevents scene show-through; `padding: 56px 42px 34px 40px` guarantees comfortable clearance from borders.

---

## 4. Interaction Choreography

### 1. Section Entrance Timeline
- **Trigger**: Single `ScrollTrigger` firing once at `start: 'top 75%'`.
- **Duration**: ~0.9s coordinated sequence:
  1. `0.00s`: Battle background settles from `scale: 1.04` to `1.0` (0.9s, `power2.out`).
  2. `0.15s`: About plaque slides `y: +16px` to `0px` with fade-in (0.65s, `power2.out`).
  3. `0.20s`: Skull emblem settles with rotation `rotation: -14deg` to `0deg`, scale `0.88` to `1.0` (0.6s, `back.out(1.6)`).
  4. `0.28s`: Genesis wordmark appears `y: +14px` to `0px` with fade-in (0.6s, `power2.out`).
  5. `0.35s`: Cyan briefing board enters `y: +18px` to `0px` with fade-in (0.7s, `power2.out`).
  6. `0.50s`: Paragraph elements appear with restrained stagger `0.1s`, `y: +10px` to `0px` (0.5s, `power1.out`).

### 2. Pointer-Responsive Parallax
- **Calculation**: Section-relative normalized coordinates `[-1, 1]` with `lerp: 0.08` linear smoothing in a single RAF loop.
- **Background Layer**: `translate3d(-cx * 5px, -cy * 4px, 0)` with `20px` overscan margin.
- **Decorative Pattern**: `translate3d(cx * 3px, cy * 2.5px, 0)`.
- **Plaque & Emblem Group**: `translate3d(cx * 4px, cy * 3px, 0) rotate(cx * 1.2deg)`.
- **Briefing Reading Surface**: Remains completely stable.
- **Reset**: Smooth deceleration to `(0, 0)` on pointer leave.

### 3. Reactive Edge Lighting
- Lightweight radial gradient trace tracks pointer position along the frame's outer border:
  `radial-gradient(circle 130px at var(--edge-x) var(--edge-y), rgba(255,255,255,0.55), rgba(0,229,255,0.35) 40%, transparent 75%)`
  with `mix-blend-mode: overlay`. Fades cleanly when pointer leaves (`opacity: 0`).

### 4. Tactile Emblem Activation
- **Trigger**: Click / Space / Enter on `<button id="about-emblem-btn">` (`aria-label="Animate Genesis emblem"`).
- **Motion**: Instant tactical tilt to `-14deg` and `scale: 1.12` (0.1s) followed by damped elastic return to `0deg` (0.48s, `elastic.out(1.3, 0.45)`).
- **Visual Accent**: Golden pulse ring expands behind emblem (`scale: 0.9 -> 1.55`, `opacity: 0.75 -> 0`).
- **Sound**: Plays `uiAudio.playEmblemAccent()` (synthesized `587Hz -> 880Hz -> 440Hz` triangle oscillator pop, rate-limited to 180ms).
- **Idempotency**: Existing tween is killed before restarting; zero stacking on repeated clicks.

### 5. Accessibility & Performance Guardrails
- **prefers-reduced-motion**: Halts all entrance spatial offsets, cancels parallax loops, and renders immediate static presentation.
- **Page Visibility**: Background tabs pause RAF loop and suspend Web Audio context.
- **Motion Pause**: Global pause motion toggle freezes parallax and emblem reactions.
- **Audio Default**: Muted until user explicitly activates header sound control.
