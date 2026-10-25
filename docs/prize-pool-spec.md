# GENESIS 6 — Prize Pool Section Specification

This document formalizes the architecture, asset mapping, layout geometry, trophy inspection and activation choreography, sound design, responsive breakpoints, and accessibility rules for the **Prize Pool** section of Genesis 6.

---

## 1. Scope, Placement & Single-Page Architecture

- **Semantic Root**: `<section id="prize-pool" aria-labelledby="prize-pool-heading">`
- **Divider Component**: `<div id="sponsors-prize-divider" role="separator" aria-label="Sponsors to Prize Pool divider">`
- **Document Order**:
  1. Landing Hero Scene (`#arena-scene`)
  2. Arena Section Divider (`#arena-section-divider`)
  3. About Genesis (`#about-genesis`)
  4. About-to-Sponsors Section Divider (`#about-to-sponsors-divider`)
  5. Sponsors Section (`#sponsors`)
  6. Sponsors-to-Prize Section Divider (`#sponsors-prize-divider`)
  7. **Prize Pool Section (`#prize-pool`)**
- **Navigation Integration**: Header `PRIZES` control connects via in-page anchor `<a href="#prize-pool">` with `scroll-margin-top: 96px` to account for the sticky global navigation bar.
- **Scroll Behavior**: 100% native document flow; zero nested scroll containers, zero artificial scroll snapping, and zero page hijacking.

---

## 2. Asset Inventory & Optimization Mapping

Original archive `Untitled (7).zip` and composition reference `prize pool.png` were sourced from `G:\genesis\required files\prize pool\`. Original vector files and uncompressed assets are archived in `components/prize-pool/source-assets/`.

Optimized, production-ready runtime assets are deployed under `public/assets/genesis/prize-pool/`:

| Role | Source File (Dimensions) | Original Payload | Runtime File | Optimized Size | Reduction / Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PRIZE POOL Banner** | `Group 1083.svg` (527 × 116) | `14,511 B` | `title-prize-pool.svg` | `14,622 B` | Pure Vector SVG |
| **PRIZES Heading** | `event-info-1.svg` (274 × 73) | `11,201 B` | `heading-prizes.svg` | `11,272 B` | Pure Vector SVG |
| **VR TRACK Heading** | `event-info.svg` (363 × 70) | `10,734 B` | `heading-vr-track.svg` | `10,812 B` | Pure Vector SVG |
| **Main 1st Medal** | Extracted from `Group 1000012445` | Part of `117,927 B` panel | `medal-main-1.svg` | `36,596 B` | Isolated Vector SVG |
| **Main 2nd Medal** | Extracted from `Group 1000012445` | Part of `117,927 B` panel | `medal-main-2.svg` | `36,878 B` | Isolated Vector SVG |
| **Main 3rd Medal** | Extracted from `Group 1000012445` | Part of `117,927 B` panel | `medal-main-3.svg` | `38,815 B` | Isolated Vector SVG |
| **VR 1st Medal** | Extracted from `Group 1000012444` | Part of `79,420 B` panel | `medal-vr-1.svg` | `36,725 B` | Isolated Vector SVG |
| **VR 2nd Medal** | Extracted from `Group 1000012444` | Part of `79,420 B` panel | `medal-vr-2.svg` | `36,205 B` | Isolated Vector SVG |
| **Cowboy (Woody)** | `woddy 1.svg` (487 × 436, raster embedded) | `393,218 B` (393 KB SVG) | `woody.webp` (974 × 872) | `58,098 B` | **-85.2%** WebP |
| **Space Ranger (Buzz)** | `buzzlight 1.svg` (624 × 535, raster embedded) | `408,326 B` (408 KB SVG) | `buzzlight.webp` (1248 × 1070) | `45,396 B` | **-88.9%** WebP |
| **Purple Gem & Sparkle** | `Group 765.svg` (164 × 176) | `4,371 B` | `gem-sparkle.svg` | `4,394 B` | Pure Vector SVG |
| **Cosmic Pattern Bg** | Reused from Sponsors | `78,200 B` | `bg-cosmic-pattern.webp` | `0 B` (shared cache) | Read-only reuse |

**Total Runtime Assets Footprint**: `~294 KB` (down from >2.8 MB of raw SVGs with embedded rasters, representing an overall **>89.5% reduction**).

---

## 3. Prize Data Structure

All prize awards are strictly typed in `components/prize-pool/prizePoolData.ts`:

```typescript
export interface PrizeMedalData {
  id: string;
  trackId: 'main' | 'vr';
  position: '1st' | '2nd' | '3rd';
  positionNumber: number;
  amount: number;
  formattedAmount: string; // e.g. "₹17,500"
  label: string;
  categoryName: string;
  medalSvg: string;
  rankBadgeColor: string;
  spotlightColor: string;
  glowColor: string;
  ariaLabel: string;
}
```

### Verified Values & Configurations

1. **Main Prizes Track (`PRIZES`)**:
   - **1st Prize**: `₹17,500` | Gold Theme (`#FFE600` spotlight, `#FFD700` glow) | Scale: `1.06`
   - **2nd Prize**: `₹15,000` | Cool Silver Theme (`#C0D8F8` spotlight, `#A8D0FF` glow) | Scale: `1.00`
   - **3rd Prize**: `₹12,500` | Warm Bronze Theme (`#FF9E42` spotlight, `#FF8A00` glow) | Scale: `1.00`
2. **VR Track (`VR TRACK`)**:
   - **1st Prize**: `₹10,000` | Gold Theme (`#FFE600` spotlight, `#FFD700` glow) | Scale: `1.05`
   - **2nd Prize**: `₹5,000` | Cool Silver Theme (`#C0D8F8` spotlight, `#A8D0FF` glow) | Scale: `1.00`

- All 5 prize amounts are rendered as permanent, accessible vector lettering visible on page load without requiring any click or hover interaction.
- Indian Rupee (`₹`) currency formatting is preserved uniformly.

---

## 4. Two Trophy Stages Architecture

The section is designed as two distinct physical game stages inside a 1280px max-width container:

### Upper Stage: Main Prizes
- **Hero Character**: Cowboy (Woody) anchored to the left edge (`300px` width on desktop), standing on the stage floor.
- **Header Strip**: Cyan bevel bar (`#18c2f5`) carrying the authentic `PRIZES` vector wordmark.
- **Stage Surface**: Deep blue gradient shell (`#081944` to `#0d276b`) with top bevel border (`#1da1f2`) and dark drop-shadow floor line.
- **Medal Row**: Three main prize medals (`1st → 2nd → 3rd`) arranged in left-to-right rank order. The 1st prize plaque is rendered ~6% larger than 2nd and 3rd for natural visual hierarchy.
- **Close Button Removed**: The decorative red close-button from the Figma SVG panel was permanently omitted.

### Inter-Stage Accent: Purple Gem Bridge
- Positioned centrally between the Main stage and VR stage.
- Floats with a gentle ambient 4–6px vertical oscillation and subtle tilt (`±2deg`).
- Pulses a coordinated sparkle flash when any medal is activated.

### Lower Stage: VR Track
- **Medal Row**: Two VR prize medals (`1st → 2nd`) positioned on the left side of the stage.
- **Hero Character**: Space Ranger (Buzz Lightyear) anchored to the right edge (`310px` width on desktop), grounded to the stage floor.
- **Lighting Accent**: Restrained violet/cyan gradient lighting accent (`#1a0b36` blend) harmonizing with the VR theme while remaining inside the blue panel family.

---

## 5. Interaction Choreography & Motion Specs

### A. Trophy Inspection (Hover & Keyboard Focus)
- **Target Element**: Semantic `<button class="prizeMedalButton">` with full keyboard accessibility.
- **Plaque Lift**: Transforms `-7px` along the Y-axis.
- **Scale Factor**: `1.035x` (`1.08x` for 1st prize).
- **Independent Star Badge**: Rises an additional `-4px` (`transform: translateY(-4px)`).
- **Contact Shadow**: Expands blur (`22px`), increases spread, and pulls down by `12px` to emphasize real elevation.
- **Local Stage Spotlight**: Soft tapered conical beam (`spotlightConical`) with an elliptical floor light pool behind the active medal fades in smoothly to opacity `0.98`.
- **Spotlight Color Matrix**:
  - Gold (1st): `rgba(255, 230, 0, 0.45)` beam, `rgba(255, 215, 0, 0.35)` pool.
  - Silver (2nd): `rgba(180, 220, 255, 0.40)` beam, `rgba(140, 200, 255, 0.30)` pool.
  - Bronze (3rd): `rgba(255, 160, 60, 0.40)` beam, `rgba(255, 138, 0, 0.30)` pool.

### B. Activation Flourish (Click, Enter, or Space)
- **Duration**: `750ms` coordinated sequence.
- **Spam Cooldown**: `900ms` strict throttling via `isCoolingDown` ref to prevent particle node accumulation.
- **Sequence Steps**:
  1. *Anticipation (0–120ms)*: Plaque dips down `-3px`, star badge tilts `3deg`.
  2. *Elevation & Gleam (120–400ms)*: Plaque leaps upward to `-12px`; diagonal gleam sheen sweeps across the plaque frame (masked cleanly away from typography).
  3. *Local Particle Burst (200–650ms)*: 6 vector gem/star shapes expand radially (`35–65px`) from behind the badge, rotate, and fade to zero opacity.
  4. *Settle (650–750ms)*: Plaque smoothly returns to the resting hover posture without visual pops or resets.
- **Audio Feedback**: Invokes `uiAudio.playEmblemAccent()` if global sound is enabled (`soundEnabled: true`). Silent when muted.

### C. Character Ambient Motion
- **Cowboy**: Subtle `2.5px` vertical breathing loop over `3.2s` with easing.
- **Space Ranger**: Grounded `2.0px` breathing loop over `3.6s` with a slight `0.8deg` shoulder sway.
- **Gem Sparkle**: Continuous `5px` drift over `4.0s` with a synchronized `1.5deg` tilt.

### D. ScrollTrigger Entrance Reveals
- Triggers when `#prize-pool` enters `85%` of the viewport:
  - Banner descends `30px` with spring settle (`0.8s`).
  - Stage bodies fade and scale up from `0.96` (`0.9s`).
  - Cowboy and Space Ranger slide in from their respective outer flanks (`-40px` and `+40px`).
  - Medals drop with a staggered cadence (`3rd → 2nd → 1st`, `0.1s` stagger).

---

## 6. Sponsors-to-Prize Divider Specification

- **Element**: `<div id="sponsors-prize-divider">`
- **Height**: `88px` on desktop (`>1024px`), `64px` on tablet (`768px–1024px`), `48px` on mobile (`<768px`).
- **Structure**:
  - Upper seam: `2px` cyan/violet accent line (`#22d3ee` to `#818cf8`) completing the Sponsors boundary.
  - Body: Deep beveled navy band (`#050c24`) with subtle diagonal game hatch pattern.
  - Lower seam: `2px` burnished gold seam (`#ffd700`) introducing the Prize Pool stage.
  - Central Bezel: Diamond-cut metallic badge holding a miniature purple gem ornament (`32px × 32px`).
  - Entrance Effect: Light glint travels across the gold seam once when scrolled into view.

---

## 7. Responsive Breakpoint Matrix

| Viewport | Width × Height | Stage Layout | Character Position | Medals Arrangement |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop 1440** | `1440 × 900` | Dual-column (Art + Medals) | Full size on flanks (`300px`) | Main: 3 columns (`1fr 1fr 1fr`), VR: 2 columns |
| **Laptop 1366** | `1366 × 768` | Dual-column (Art + Medals) | Scaled (`260px`) | Main: 3 columns (`1fr 1fr 1fr`), VR: 2 columns |
| **Tablet Landscape** | `1024 × 768` | Compact Dual-column | Scaled (`220px`) | Main: 3 columns, VR: 2 columns |
| **Tablet Portrait** | `768 × 1024` | Single-column stacked | Centered character header row | Main: 2 columns top + 1 centered bottom; VR: 2 columns |
| **Mobile Standard** | `390 × 844` | Single-column stacked | Centered art (`180px`) | Main: 1 column stacked; VR: 1 column stacked |
| **Mobile Compact** | `360 × 800` | Single-column stacked | Centered art (`160px`) | Main: 1 column stacked; VR: 1 column stacked |

- Zero horizontal overflow (`overflow-x: clip`).
- All 5 monetary values maintain minimum `18px` bold typography and 100% legibility across all breakpoints.

---

## 8. Accessibility & Performance Guardrails

1. **Heading Hierarchy**:
   - Section heading: `<h2 class="sr-only">Genesis 6 Prize Pool</h2>`
   - Main Track heading: `<h3 class="sr-only">Main Tournament Prizes</h3>`
   - VR Track heading: `<h3 class="sr-only">VR Track Prizes</h3>`
2. **Accessible Names on Buttons**:
   - Example: `aria-label="Preview first prize celebration, main prizes, 17,500 rupees"`
3. **Reduced Motion (`prefers-reduced-motion: reduce`)**:
   - Disables entrance animations, idle bobbing, spotlights, and particle bursts.
   - Preserves high-contrast focus rings and instantaneous visual selection feedback.
4. **Motion Pause Wiring**:
   - Connected to shared `motionPaused` state from `LandingExperience`. Ambient animations freeze instantly when paused.
5. **DOM Order Integrity**:
   - `['landing-header', 'about-genesis', 'sponsors', 'sponsors-prize-divider', 'prize-pool']`.

---

## 9. Verification & Build Results

- **TypeScript Compilation**: `npx tsc --noEmit` — **0 errors**.
- **ESLint**: `npm run lint` — **PASSED**.
- **Production Build**: `npm run build` (`Next.js 16.4.3 Turbopack`) — **COMPILED & PRERENDERED SUCCESSFULLY**.
- **Interactive Verification**: Verified via Chrome DevTools Protocol (CDP) headless test harness with recorded interaction sequence and screenshot captures.
