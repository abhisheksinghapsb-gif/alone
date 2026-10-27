# Genesis 6 — Sponsors Section Architecture & Verification Report

## 1. Executive Summary

The **Sponsors** section (`#sponsors`) for **Genesis 6** (organized by the Game Development and AI Club, Army Institute of Technology, Pune) has been refined to **faithfully preserve the original Figma composition** (Figma artboard node `196:546` / component `193:640`), superseding earlier proposals for an asymmetrical featured arena or bottom horizontal strip.

The refined presentation introduces three coherent interaction and motion improvements while retaining the original game aesthetics, card order, and illustrated environments:
1. **Preserved Original Figma Composition**:
   - **Cosmic Blue Illustrated Background**: Rich starfield with Brawl Stars icon silhouettes (`bg-cosmic-pattern.webp`).
   - **Centered SPONSORS Heading**: Balanced wordmark flanked on the left by the Crowned character icon (`icon-crowned-royal.webp`) and on the right by the Credits chest (`icon-credits-chest.webp`).
   - **Tall Royal-Blue Past Sponsors Panel (Left 28–32%)**: Tilted game panel with dark outline, top header plaque with circular blue info icon, and two substantial, level, unskewed logo plates for **GameCloud Technologies** and **GAMEDOORA**.
   - **Six Illustrated Sponsor Slots (Right 68–72%)**: 3 columns × 2 rows arrangement on desktop:
     - Row 1: Title Sponsor (green `#82D724`), Event Partner (purple `#9C3EF4`), Platform Sponsor (red `#FF3838`).
     - Row 2: Slot 4 (blue/lavender `#2373FF`), Slot 5 (orange `#FF7A00`), Slot 6 (gold `#FFB800`).
     - Original badges, angled boundaries, and scenery preserved without obstruction.
   - **Spike Mascot at Lower-Right**: Retained in his dedicated corner below Card 6 in normal flow with **zero overlap** onto cards, badges, announcement text, or controls.
2. **Dimensional Game Cards**:
   - Small dark offset edge, restrained inset highlight, crisp outline following the card's angled shape.
   - Hover lift of 4.5px with scale capped at 1.02.
   - Pointer move perspective tilt (< 1.5°) coalesced via `requestAnimationFrame` and disabled on touch devices.
3. **Travelling Edge Highlight**:
   - Deliberate card selection triggers a single high-energy light travelling smoothly around the card's exact angled perimeter SVG path (~850ms) in its accent color, settling into a crisp selected border.
   - Replaces rectangular box glows with true polygon geometry.
4. **Connected Character Response**:
   - When any sponsor slot is selected, the Credits chest gives a restrained settle, and the Spike mascot leans toward the selected column (`lean-left`, `lean-center`, `lean-right`) before returning smoothly.
   - Crown, chest, and mascot have asynchronous 6–9 second idle loops (~2.5–3px displacement) that automatically pause when Sponsors is offscreen or the browser tab is hidden.
5. **Slower, Coordinated Entrance**:
   - 1.8–2.0 second coordinated entrance sequence: Heading settles -> Past Sponsors panel settles -> Six-card board enters with restrained card stagger -> Caption bar settles -> Spike mascot arrives.

---

## 2. File Ownership & Isolation Boundaries

The implementation strictly respects repository separation:
- **Components**:
  - `components/sponsors/SponsorsSection.tsx` — Semantic root section, selection state, companion lean logic, accessible headings.
  - `components/sponsors/PastSponsorsPanel.tsx` — Left archive panel, royal-blue container, upright logo plates with sheen.
  - `components/sponsors/SponsorBoard.tsx` — 3×2 grid container, outer backing frame, caption bar, and lower-right Spike dock.
  - `components/sponsors/SponsorSlotCard.tsx` — Vector SVG card surface, perimeter travelling highlight SVG, hover glint, native button accessibility.
- **Styling**:
  - `components/sponsors/sponsors.module.css` — Scoped CSS Module encapsulating all layout, responsive matrix, and keyframe animations.
  - `components/sponsors/sponsors.css` — Preserved untouched for shared section divider rules.
- **Data & Hooks**:
  - `data/sponsorsData.ts` — Sponsor slot configurations, exact SVG `viewBox` coordinates, perimeter SVG path data, asset manifests.
  - `hooks/useSponsorsMotion.ts` — GSAP ScrollTrigger coordinated entrance and asynchronous ambient idle loops with lifecycle cleanup.

---

## 3. Runtime Asset Inventory & Vector Geometries

All assets reside under `public/assets/genesis/sponsors/`:

| Role | Asset File | Type | Resolution / ViewBox | Payload Size |
| :--- | :--- | :--- | :--- | :--- |
| **Cosmic Background** | `bg-cosmic-pattern.webp` | WebP | 1487 × 1058 | 80.0 KB |
| **SPONSORS Wordmark** | `sponsors-heading.svg` | SVG | 327 × 50 | 16.1 KB |
| **Crowned Royal Icon** | `icon-crowned-royal.webp` | WebP | 170 × 214 | 8.3 KB |
| **Credits Chest** | `icon-credits-chest.webp` | WebP | 570 × 455 | 36.7 KB |
| **Spike Mascot** | `character-spike.webp` | WebP | 400 × 490 | 30.5 KB |
| **GameCloud Logo Plate** | `logo-gamecloud.webp` | WebP | 1924 × 870 | 51.9 KB |
| **GAMEDOORA Logo Plate** | `logo-gamedoora.webp` | WebP | 1910 × 829 | 30.3 KB |
| **Slot 1 (Title Sponsor)** | `slots/slot-1-title-sponsor.svg` | SVG | `15 20 315 185` | 13.9 KB |
| **Slot 2 (Event Partner)** | `slots/slot-2-event-partner.svg` | SVG | `325 20 315 185` | 13.9 KB |
| **Slot 3 (Platform Sponsor)** | `slots/slot-3-platform-sponsor.svg` | SVG | `630 20 315 185` | 13.9 KB |
| **Slot 4 (Blue/Lavender)** | `slots/slot-4-slot-4.svg` | SVG | `15 210 315 185` | 13.9 KB |
| **Slot 5 (Orange)** | `slots/slot-5-slot-5.svg` | SVG | `325 210 315 185` | 13.9 KB |
| **Slot 6 (Gold)** | `slots/slot-6-slot-6.svg` | SVG | `630 210 315 185` | 13.9 KB |

---

## 4. Card Perimeter Geometries for Travelling Edge Highlights

Each card uses its exact angled boundary path from Figma for precision perimeter illumination:

- **Row 1 Slots** (`y = 20 to 205`):
  - Slot 1 (Title Sponsor): `d="M45.2997 54.9917H326.54L313.913 199.138H31.8008L45.2997 54.9917Z"`
  - Slot 2 (Event Partner): `d="M347.427 54.9917H628.667L616.04 199.138H333.928L347.427 54.9917Z"`
  - Slot 3 (Platform Sponsor): `d="M649.558 54.9917H930.798L918.171 199.138H636.059L649.558 54.9917Z"`
- **Row 2 Slots** (`y = 210 to 395`):
  - Slot 4: `d="M30.4599 243.931H310.888L298.297 388.077H17L30.4599 243.931Z"`
  - Slot 5: `d="M332.589 243.931H613.017L600.426 388.077H319.129L332.589 243.931Z"`
  - Slot 6: `d="M634.716 243.931H915.144L902.553 388.077H621.256L634.716 243.931Z"`

---

## 5. Viewport Verification Matrix

| Viewport | Past Width | Board Width | Section Height | Overflow | Card 6 Overlap | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1440 × 1024** | 389.9px (30.8%) | 858px (69.2%) | 1024px | **None** (`false`) | **None** (`false`) | PASS |
| **1440 × 900** | 389.9px (30.8%) | 858px (69.2%) | 900px | **None** (`false`) | **None** (`false`) | PASS |
| **1366 × 768** | 389.9px (30.8%) | 858px (69.2%) | 792px | **None** (`false`) | **None** (`false`) | PASS |
| **1280 × 720** | 389.1px (31.4%) | 828px (68.6%) | 780px | **None** (`false`) | **None** (`false`) | PASS |

---

## 6. Accessibility & Performance Guardrails

1. **Semantic HTML & Screen Reader Support**:
   - `<section id="sponsors" aria-labelledby="sponsors-heading">`
   - Visible heading `<h2 id="sponsors-heading">` with screen-reader text and decorative wordmark.
   - Six slots are native `<button type="button">` with `aria-pressed`, `aria-label`, and high-contrast focus rings (`outline: 2.5px solid #38bdf8`).
   - Accessible announcement region with `aria-live="polite"` announcing slot state changes without layout shift.
2. **Reduced Motion**:
   - Full support for `prefers-reduced-motion: reduce` and the interactive `motionPaused` prop.
   - Entrance timelines, idle loops, tilt transforms, and travelling pulse animations are instantly neutralized, presenting the clean static Figma layout.
3. **Sound Control**:
   - `soundEnabled` prop integrates with existing `uiAudio.playPressClack()` on deliberate user clicks only. Zero autoplay, scroll, or idle sounds.
4. **Lifecycle Cleanup**:
   - GSAP timeline contexts, ScrollTriggers, RAF handles, timeout references, and visibility listeners are cleanly destroyed upon component unmount.
