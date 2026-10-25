# GENESIS 6 — Sponsors Section Specification

This document formalizes the architecture, asset mapping, layout geometry, interaction choreography, sound design, responsive breakpoints, and accessibility rules for the **Sponsors** section of Genesis 6.

---

## 1. Scope & Placement

- **Placement**: Immediately following the About Genesis section in the single, continuous native scrolling document (`#page-root`).
- **Semantic Root**: `<section id="sponsors" aria-labelledby="sponsors-heading">`
- **Document Order**:
  1. Landing Scene (`#landing-hero-scene`)
  2. Arena Section Divider (`#arena-section-divider`)
  3. About Genesis (`#about-genesis`)
  4. About-to-Sponsors Section Divider (`#about-to-sponsors-divider`)
  5. Sponsors Section (`#sponsors`)
- **Navigation Integration**: Header Sponsors control connects via in-page anchor `<a href="#sponsors">` with `scroll-margin-top: 96px` to account for the persistent header.
- **Scroll Behavior**: Native document scrolling; zero nested overflow scrollbars; zero artificial scroll snapping or hijacking.

---

## 2. Asset Inventory & Optimization Mapping

All source assets located in `components/sponser/` and extracted into `components/sponser/source-assets/` are preserved untouched. Runtime assets are deployed under `public/assets/genesis/sponsors/`:

| Role | Source File (Dimensions) | Original Payload | Runtime File | Optimized Size | Reduction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cosmic Pattern Bg** | `Cosmic Brawl Stars Pattern 1.svg` (1440 × 1025) | `2,231,776 B` (2.23 MB) | `bg-cosmic-pattern.webp` (1487 × 1058) | `78,200 B` (78.2 KB) | **-96.5%** |
| **SPONSORS Wordmark** | `Group 1000012443.svg` (327 × 50) | `16,093 B` (16.1 KB) | `sponsors-heading.svg` (Vector SVG) | `16,093 B` (15.7 KB) | Pure Vector |
| **Crowned Royal Icon** | `icon_skin_category_royals 1.svg` (71 × 90) | `24,201 B` (24.2 KB) | `icon-crowned-royal.webp` (170 × 214) | `8,300 B` (8.3 KB) | **-65.7%** |
| **Credits Chest Icon** | `icon_credits_stack3 1.svg` (139 × 111) | `289,820 B` (289.8 KB) | `icon-credits-chest.webp` (570 × 455) | `36,700 B` (36.7 KB) | **-87.3%** |
| **Spike Accent Character** | `img_shadow_smash_spike 1.svg` (195 × 239) | `252,395 B` (252.4 KB) | `character-spike.webp` (400 × 490) | `30,500 B` (30.5 KB) | **-87.9%** |
| **GameCloud Logo Plate** | `Group 1000012455.svg` (370 × 167) | `357,923 B` (357.9 KB) | `logo-gamecloud.webp` (1924 × 870) | `51,900 B` (51.9 KB) | **-85.5%** |
| **GAMEDOORA Logo Plate** | `Group 1000012457.svg` (355 × 154) | `149,196 B` (149.2 KB) | `logo-gamedoora.webp` (1910 × 829) | `30,300 B` (30.3 KB) | **-79.7%** |
| **Slot Banner 1** | Extracted from `Group 1000012454` | `489,000 B` (489 KB PNG) | `slot-banner-1.webp` (1440 × 648) | `64,500 B` (64.5 KB) | **-86.8%** |
| **Slot Banner 2** | Extracted from `Group 1000012454` | `378,400 B` (378 KB PNG) | `slot-banner-2.webp` (1276 × 268) | `42,300 B` (42.3 KB) | **-88.8%** |
| **Slot Banner 3** | Extracted from `Group 1000012454` | `274,700 B` (275 KB PNG) | `slot-banner-3.webp` (680 × 297) | `36,400 B` (36.4 KB) | **-86.7%** |
| **Top Dark Strip** | `Rectangle 64.svg` (1440 × 18) | `198 B` | `strip-dark.svg` | `198 B` | Pure Vector |
| **Bottom Blue Strip** | `Rectangle 484.svg` (1440 × 35) | `174 B` | `strip-blue.svg` | `174 B` | Pure Vector |

**Total Runtime Assets Footprint**: `~395 KB` (down from >5.38 MB in source reference, an overall **>92% reduction**).

---

## 3. Desktop Composition & Layout Hierarchy

Calibrated for standard laptop viewports (`1536 × 730`, `1440 × 900`, `1366 × 768`):

- **Centered Container Width**: `max-width: 1300px` with `padding: 0 32px`.
- **Heading Group**:
  - Centered SPONSORS wordmark (`327px`).
  - Flanked on left by Crowned Character Icon (`65px`).
  - Flanked on right by Credits Chest Icon (`110px`).
  - Complete, unclipped illustrations with subtle vertical drift.
- **Main Columns Split**:
  - `grid-template-columns: 310px 1fr` (Past Sponsors ~26%, Six-Slot Board ~74%).
- **Past Sponsors Panel**:
  - Tilted game-panel silhouette (`transform: skewX(-1.5deg)`) with deep blue gradient.
  - Header plaque reading `PAST SPONSORS` in `Lilita One` with non-interactive ornament.
  - Level logo plates (`transform: skewX(1.5deg)`) for GameCloud and GAMEDOORA.
- **Six-Slot Board**:
  - 3 columns × 2 rows CSS Grid (`gap: 16px`).
  - Recessed outer backing (`.sponsorBoardBacking`) with dynamic glowing top accent seam adopting the active slot's accent color.
  - Spike champion accent connected to lower-right corner (`right: -25px; bottom: -20px;`, `pointer-events: none`).
  - Compact reserved caption bar beneath board (`.sponsorCaptionBar`).

---

## 4. Six-Slot Board Data Structure & State

```typescript
export interface SponsorSlotData {
  id: string;
  order: number;
  categoryLabel: string;
  categoryName: string;
  status: string;
  captionText: string;
  accentColor: string;
  svgPath: string;
  bannerSrc: string;
  badgeLabel: string;
  ariaLabel: string;
}
```

### Slot Configurations:
1. **Title Sponsor**: `id: 'title-sponsor'`, `#82D724` (Green), `Partner to be announced`.
2. **Event Partner**: `id: 'event-partner'`, `#9C3EF4` (Purple), `Partner to be announced`.
3. **Platform Sponsor**: `id: 'platform-sponsor'`, `#FF3838` (Red), `Partner to be announced`.
4. **Slot 4**: `id: 'slot-4'`, `#2373FF` (Blue), `To be announced`.
5. **Slot 5**: `id: 'slot-5'`, `#FF7A00` (Orange), `To be announced`.
6. **Slot 6**: `id: 'slot-6'`, `#FFB800` (Amber), `To be announced`.

### Reserved Caption Texts:
- Default: `Title Sponsor · Partner to be announced`
- Unspecified: `Sponsor slot · To be announced`

---

## 5. Interaction & Motion Choreography

1. **Hover & Keyboard Focus**:
   - `transform: translateY(-4px) scale(1.02)`
   - Capped pointer-responsive tilt (~1.75° maximum) on fine pointers.
   - Separate hit target and motion wrapper to prevent hover flicker.
2. **Deliberate Selection**:
   - Click, Enter, or Space selects a slot.
   - Persistent accent outline + active glow.
   - SVG perimeter energy pulse travels around the frame over `550ms` (`@keyframes energyTravel`).
   - Board's top accent seam transitions to slot's accent color.
   - Reserved caption updates without shifting surrounding layout.
   - Spike character makes a small upward settle (`translateY(-4px)` over `350ms`).
   - Sound: plays `uiAudio.playPressClack()` when audio is enabled.
3. **Section Entrance**:
   - GSAP ScrollTrigger (`trigger: #sponsors`, `start: 'top 75%'`, `once: true`).
   - Heading settles: `y: -20 -> 0`, `opacity: 0 -> 1` (0.7s).
   - Past panel enters from left: `x: -28 -> 0`, `opacity: 0 -> 1` (0.75s).
   - Six slots stagger: `stagger: 0.06s`, `scale: 0.96 -> 1`, `opacity: 0 -> 1` (0.6s).
   - Spike settles: `y: 22 -> 0`, `opacity: 0 -> 1` (0.65s).
   - Total sequence: `~1.0s`.
4. **Ambient Drift**:
   - Crown and Chest drift `2.5-3px` over `2.8-3.2s` (`sine.inOut`, `yoyo`).
   - Spike idle sway `2.5px` over `3.5s`.
5. **Reduced Motion**:
   - Immediate visibility (`opacity: 1`, `transform: none`).
   - Animations, tilts, and energy travel pulses disabled.
   - Selection remains fully clear via persistent outline, color change, and caption update.

---

## 6. About-to-Sponsors Divider

- **Height**: `96px` (desktop), `64px` (mobile).
- **Style**: Dark navy bulkhead with blue/violet edge treatments.
- **Seam**: Central cyan/gold energy seam with GSAP ScrollTrigger single highlight sweep.
- **Centerpiece**: Bezel with Crown emblem (`icon-crowned-royal.webp`) and golden glow.
- **Side Details**: Polygonal stepped notches (left and right).

---

## 7. Responsive Breakpoints

| Breakpoint | Layout Behavior | Slot Grid | Archive Panel |
| :--- | :--- | :--- | :--- |
| **Desktop (>1100px)** | Two-column split (310px / 1fr) | 3 cols × 2 rows | Left panel, vertical stacked logos |
| **Compact (<1100px)** | Single column stack | 3 cols × 2 rows | Placed below board (`order: 2`), horizontal logos |
| **Tablet (<768px)** | Single column, compact padding | 2 cols × 3 rows | Stacked below, Spike hidden to avoid overlap |
| **Mobile (<480px)** | Single column | 1 col × 6 rows | Stacked below, compact caption pill |
