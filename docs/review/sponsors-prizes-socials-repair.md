# Genesis 6 — Sponsors, Prize Characters, and Contact Social Footer Review & Repair Notes

**Date**: 31 October 2026  
**Branch**: `optimization/responsive-cleanup`  
**Base Commit**: `a9c1f71af6e5dc340fbb827a68507341691b072d`  
**Working Directory**: `g:\alone`  
**Reference Project**: [vaman-dev/Genesis](https://github.com/vaman-dev/Genesis) (verified commit `a83d690326868542116792f193aa06780b675be1`)  

---

## 1. Executive Summary & Review Scope

This review documents the diagnosis, implementation, and automated multi-viewport verification of user requests derived from the spoken website review recording `Screen Recording 2026-10-28 233925.mp4`, compared against the approved Figma specification:

1. **Sponsors Heading Silhouette**: Identified and resolved intrinsic asset clipping in `public/assets/genesis/sponsors/sponsors-heading.svg`, fully restoring the lettering matching Figma.
2. **Sponsors Heading Icons Motion**: Implemented gentle asynchronous float/sway idle motion and restrained pointer hover scale pop on the crowned emblem and credits chest.
3. **Past Sponsors Plates & Logos**: Removed the broad wipe/sheen effect; enlarged GameCloud and Gamedoora visible artwork by ~40% by compensating for asset padding, sized plates to 83% of usable panel width, and added a crisp 2px cyan border with restrained glow referencing the approved About panel design.
4. **Sponsor Cards Local Perimeter Halo & Scroll Detachment Fix**: Replaced rectangular box-shadows and glint tracks with exact SVG perimeter outlines and localized halos; introduced capture scroll listeners that reliably detach hover state when cards scroll away from a stationary pointer.
5. **Prize Pool Characters Natural Motion**: Implemented an unhurried grounded lean (1.2°) for Cowboy and a buoyant, multi-phase hop (8.5px apex, anticipation crouch, landing, settle, rest) for Buzz in VR with synchronized contact shadow scaling.
6. **Contact Social Footer**: Integrated accessible Instagram and LinkedIn links from the reference project below the venue card in normal document flow.
7. **Preservation of Approved Scope**: Preserved approved FAQ, Contact, Home, About, Timeline, Memories, dividers, audio/motion toggles, and prize tiers.

*Note on Video Coverage*: `Screen Recording 2026-10-28 233925.mp4` was fully inspected for spoken requirements and visual references. The earlier `Screen Recording 2025-08-26 234812.mp4` served as a separate motion reference (no new solar-system composition was requested). The files `20261028-1803-08.8928536.mp4` and `Screen Recording 2026-10-28 233611.mp4` were unavailable locally; any requirements unique to those recordings remain pending until working copies are provided.

---

## 2. Root Cause Diagnoses & Technical Implementation

### 2.1 Sponsors Heading Clipping Resolution
- **Root Cause**: `public/assets/genesis/sponsors/sponsors-heading.svg` was defined with `viewBox="0 0 327 50"` and `height="50"`. Path bounding box calculations revealed path data extending down to `y=59.64`. In addition, the drop-shadow filter (`dy="3"`) cast pixels to `y=62.64`. Because the viewBox height was locked to 50, the bottom ~10–13px of the lettering was intrinsically truncated. External CSS padding could not recover this cropped graphic.
- **Repair**:
  - Expanded `sponsors-heading.svg` dimensions to `width="327" height="66"` and `viewBox="0 0 327 66"`.
  - Expanded `<rect id="wordmark-mask-rect" ... height="56"/>` and filter bounds to `height="52"` to prevent internal clipping.
  - Updated `data/sponsorsData.ts` intrinsic metadata (`SPONSORS_ASSETS.wordmark.height: 66`).
  - Rendered aspect ratio is preserved at ~4.95 with zero letter truncation.

### 2.2 Heading Icons Pop and Floating Motion
- **Implementation**:
  - Encapsulated the crown and chest in `components/sponsors/SponsorsSection.tsx` inside dedicated `.crownPopWrap` and `.chestPopWrap` containers.
  - Added CSS hover/focus-visible scaling (`transform: scale(1.04)`) with smooth 220ms transitions and reduced-motion overrides.
  - Updated `hooks/useSponsorsMotion.ts` with asynchronous, decoupled GSAP floating timelines:
    - **Crown**: 6.2s cycle, `y: -3px`, `rotation: -1.2°`, ease: `sine.inOut`.
    - **Chest**: 7.4s cycle, `y: -3.5px`, `rotation: 1.5°`, ease: `sine.inOut`.

### 2.3 Past Sponsors Plates & Logo Enlargement
- **Removal of Sheen**: Stripped `.plateSheen` and keyframe sweep animations from `components/sponsors/PastSponsorsPanel.tsx` and `components/sponsors/sponsors.module.css`.
- **Plate Visual Style**: Added dark cosmic backing (`rgba(6, 12, 34, 0.88)`), a crisp 2px cyan border (`rgba(0, 229, 255, 0.65)`), and a restrained cyan glow (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 229, 255, 0.35)`), brightening smoothly on hover/focus.
- **Usable Width Ratio**: Sized `.pastSponsorPlate` to `width: 90%; max-width: 285px`, achieving an 83% usable panel body width ratio (target: 75–85%).
- **Logo Visible Area Expansion**: Opaque artwork in `logo-gamecloud.webp` and `logo-gamedoora.webp` occupies only ~40% of the image height due to baked-in transparent margins. Applied `margin: -16% 0` within an `overflow: hidden` plate container to crop the transparent margin and expand visible logo width by ~40% without asset distortion.

### 2.4 Sponsor Cards Local Perimeter Halo & Scroll Detach Fix
- **Removal of Legacy Effects**: Removed rectangular hover borders (`.slotHoverBorder`, `.slotArrivalHighlight`) and sweep glint tracks (`.slotWindowGlintTrack`).
- **Perimeter SVG Halo**: Integrated `.slotHoverOutlineSvg` in `components/sponsors/SponsorSlotCard.tsx` rendering exact SVG paths matching each card's angled geometry (`slot.perimeterPath`) with soft stroke bloom.
- **Detached Glow Scroll Fix**: In desktop browsers, scrolling away from an element while keeping the cursor stationary does not reliably fire `pointerleave`. Added window and document capture scroll listeners that calculate pointer coordinates against `getBoundingClientRect()`, immediately resetting hover state (`data-is-hovered="false"`), clearing local spotlight coordinates, and restoring default transform.

### 2.5 Prize Pool Characters Natural Motion
- **Implementation in `components/prize-pool/usePrizeMotion.ts`**:
  - **Cowboy**: Unhurried 6.4s grounded weight shift with a lower-body anchor (`transformOrigin: '50% 95%'`, `rotation: ±1.2°`, `x: ±2.5px`).
  - **Buzz in VR**: 7.8s hop timeline featuring:
    1. Anticipation crouch: `y: 1.5px` (0.35s).
    2. Buoyant lift: `y: -8.5px`, `x: -1px`, `rotation: -0.9°` (0.55s).
    3. Crisp landing: `y: 0px` (0.42s).
    4. Settle / compression: `y: 1.2px` (0.32s).
    5. Rebound to rest: `y: 0px` (0.45s).
    6. Calm stationary rest: ~2.8s.
  - **Synchronized Contact Shadow**: Buzz's contact shadow (`characterShadowBase`) compresses and fades at hop apex (`scale: 0.82`, `opacity: 0.45`), expanding slightly on landing settle (`scaleX: 1.04`).

### 2.6 Contact Social Footer
- **Source**: Adapted from `vaman-dev/Genesis` (commit `a83d690326868542116792f193aa06780b675be1`).
- **Destination URLs**:
  - Instagram: `https://www.instagram.com/gdxr_ait/`
  - LinkedIn: `https://www.linkedin.com/company/87215024/`
- **Implementation**:
  - Placed inside `<footer className={styles.socialFooterContainer}>` in `components/contact/ContactSection.tsx` below the venue card in normal document flow.
  - Links include accessible `(opens in a new tab)` text, `target="_blank"`, `rel="noopener noreferrer"`, 22px vector icons, minimum 44px tap targets, yellow hover/focus accent colors, and clear 2px focus outlines.

---

## 3. Files Modified

| File Path | Description of Changes |
| :--- | :--- |
| `public/assets/genesis/sponsors/sponsors-heading.svg` | Expanded viewBox to `0 0 327 66` and height to `66`; updated mask/filter bounds. |
| `data/sponsorsData.ts` | Updated intrinsic wordmark height to 66. |
| `components/sponsors/SponsorsSection.tsx` | Added pop wrappers for crown and chest heading icons. |
| `components/sponsors/PastSponsorsPanel.tsx` | Removed sheen; applied 2px cyan border plate styling and logo padding compensation. |
| `components/sponsors/SponsorSlotCard.tsx` | Replaced rectangular box-shadows with SVG perimeter halo; added scroll hover detachment listener. |
| `components/sponsors/sponsors.module.css` | Styled plate border glow, icon pop states, perimeter hover outline, and removed glint keyframes. |
| `hooks/useSponsorsMotion.ts` | Updated crown and chest idle float/sway motion parameters. |
| `components/prize-pool/usePrizeMotion.ts` | Implemented Cowboy grounded lean, Buzz hop cycle, and synchronized contact shadow scaling. |
| `components/contact/ContactSection.tsx` | Added social footer with Instagram and LinkedIn anchors in document flow. |
| `components/contact/ContactSection.module.css` | Added responsive styles, focus rings, hover transitions, and reduced motion rules for socials. |
| `scripts/verify-sponsors-prizes-socials.js` | Automated verification test suite for functional checks, scroll detachment, and viewports. |
| `scripts/verify-interactions.js` | Updated verification script to accept `TARGET_URL` environment variable. |

---

## 4. Verification & Viewport Matrix Results

All checks were executed against the optimized production build (`http://localhost:3005`) using Chrome headless CDP automation.

### 4.1 Functional & Accessibility Checks
- **Sponsors Heading Silhouette**: **PASSED** (Height: 66px, Rendered: 327.0×66.0, unclipped silhouette).
- **Heading Icons Wrappers & Pop**: **PASSED** (`crownPopWrap`: true, `chestPopWrap`: true, scale: 1.04 on hover).
- **Past Sponsors Wipe/Sheen Removed**: **PASSED** (0 sheen elements found).
- **Past Sponsors Plate Width Ratio & Glow**: **PASSED** (Usable width ratio: 0.83 [83%], border: `2px solid rgba(0, 229, 255, 0.65)`).
- **Sponsor Cards Glint Wipe Removed**: **PASSED** (0 glint elements found).
- **Sponsor Cards SVG Perimeter Halo**: **PASSED** (6/6 cards equipped with `.slotHoverOutlineSvg`).
- **Hover Detached on Scroll Away**: **PASSED** (before scroll: `data-is-hovered="true"`; after scroll: `data-is-hovered="false"`, `transform=""`).
- **Prize Pool Character Motion & Shadow Sync**: **PASSED** (Cowboy lean, Buzz hop, shadow scaling, and dual blink layers verified).
- **Instagram Link**: **PASSED** (`https://www.instagram.com/gdxr_ait/`, target: `_blank`, tap height: 44px, icon: 22px).
- **LinkedIn Link**: **PASSED** (`https://www.linkedin.com/company/87215024/`, target: `_blank`, tap height: 44px).

### 4.2 Multi-Viewport Overflow Matrix
Tested across 10 responsive viewports; zero horizontal overflow detected (`scrollWidth <= clientWidth` in all cases):

| Viewport Category | Resolution | Scroll Width | Client Width | Horizontal Overflow | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Laptop Widescreen | 1536 × 730 | 1526px | 1536px | None | **PASS** |
| Standard Laptop | 1366 × 768 | 1356px | 1366px | None | **PASS** |
| Small Desktop / Netbook | 1024 × 768 | 1014px | 1024px | None | **PASS** |
| Tablet Portrait | 960 × 1440 | 950px | 960px | None | **PASS** |
| iPad Portrait | 768 × 1024 | 758px | 768px | None | **PASS** |
| Mobile (Android Large) | 412 × 924 | 412px | 412px | None | **PASS** |
| Mobile (iPhone Standard) | 393 × 852 | 393px | 393px | None | **PASS** |
| Mobile (Compact) | 320 × 568 | 320px | 320px | None | **PASS** |
| Mobile Landscape | 844 × 390 | 834px | 844px | None | **PASS** |
| Short Desktop Viewport | 1280 × 450 | 1270px | 1280px | None | **PASS** |

### 4.3 Visual Captures Generated
High-resolution screenshot captures for visual audit have been saved to:
- `docs/captures/sponsors-laptop-1536x730.png`
- `docs/captures/sponsors-laptop-1366x768.png`
- `docs/captures/sponsors-phone-393x852.png`
- `docs/captures/prize-laptop-1536x730.png`
- `docs/captures/prize-laptop-1366x768.png`
- `docs/captures/prize-phone-393x852.png`
- `docs/captures/contact-socials-laptop-1536x730.png`
- `docs/captures/contact-socials-laptop-1366x768.png`
- `docs/captures/contact-socials-phone-393x852.png`

---

## 5. Summary of Pending Items
No requests from `Screen Recording 2026-10-28 233925.mp4` remain unresolved. If specific features from `20261028-1803-08.8928536.mp4` or `Screen Recording 2026-10-28 233611.mp4` are required, working copies should be uploaded for further inspection.

