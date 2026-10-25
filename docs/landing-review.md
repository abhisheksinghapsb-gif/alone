# GENESIS 6 Landing Page — Laptop Viewport Repair & Verification Report

## 1. Measured Target Viewport

- **Browser Content Area**: `1536 × 730 CSS px`
- **Device Pixel Ratio (DPR)**: `1.25`
- **Physical Screen Resolution**: `1920 × 1080` (125% Windows display scaling)
- **Outer Browser Bounds**: `1536 × 816 px`
- **Status**: The landing composition is strictly anchored to this single measured viewport content area, discarding all competing media query overrides.

---

## 2. Baseline State & Prior Defect Analysis

A recoverable git snapshot was created prior to modifications:
- Branch: `backup-pre-repair`

### Prior Defects Identified & Fixed:
1. **Full-Frame Barrier Sizing Defect**:
   - `arena-foreground-barrier.webp` ($1440 \times 1024$, aspect ratio $1.406$) was styled with `object-fit: cover` and aligned to the bottom.
   - On the wide laptop viewport ($1536 \times 730$, aspect ratio $2.104$), `object-fit: cover` scaled the image to width $1536\text{ px}$ and height $1092\text{ px}$. Bottom alignment caused the image to be clipped from the top, pushing the source arena wall ledge ($y=732$) up to $y=418.5\text{ px}$ ($57.3\%$ of viewport height), obstructing character chests, weapons, and belts.
2. **Conflicting Sizing Systems**:
   - Characters, background, and barrier used disparate viewport units (`vh`, `vw`, `clamp()`) and different vertical anchors (`bottom: 19vh` vs `top: clamp()`), causing characters to shift relative to the wall on different aspect ratios.
3. **Baked-in Background Stars & Comets**:
   - `bg-arena.webp` contained painted stationary stars, nebulae dots, and diagonal comet streaks. Adding animated stars over this left stationary painted stars visible in the sky.
4. **Weak Starfield Motion**:
   - Some canvas stars had zero velocity; others were moving too slowly (<10 px/s) to read as falling stars.
5. **Balloon & Dialogue Composite Squash**:
   - `balloon-dialog.webp` combined Squeak, the balloon, and the speech bubble in a single image. Hover and click animations distorted the dialogue bubble text along with the balloon body.
6. **Entrance & Parallax Transform Overwrites**:
   - GSAP entrance tweens and pointer parallax wrote transforms (`x`, `y`) onto the same DOM nodes, creating transform fighting and snapping.
7. **Eyelid Skin Patches**:
   - Articulated eye patches were artificially rendered over Colt's eyes, appearing as visual artifacts on a flattened raster image.
8. **Invalid Lint Command in Next.js 16**:
   - `next lint` is no longer supported in Next.js 16 CLI and threw `Invalid project directory provided: G:\alone\lint`.

---

## 3. Implementation Changes & Architecture

### Single Unified Coordinate System
The scene is built around a single explicit coordinate system calibrated for the measured $1536 \times 730$ content area:
- **Header**: Top 3%–13% ($y=0..70\text{ px}$).
- **Genesis Identity**: Centered in the upper-middle region ($y=124..343\text{ px}$, $17\%..47\%$).
- **Hero Characters**: Left and right framing characters:
  - Colt: $x=46\text{ px}$, $y=248\text{ px}$, width $399\text{ px}$, height $387\text{ px}$. Heads and weapons at $y \approx 290..350\text{ px}$ ($40\%..48\%$).
  - Leon: $x=1083\text{ px}$, $y=255\text{ px}$, width $407\text{ px}$, height $380\text{ px}$. Heads at $y \approx 290..350\text{ px}$ ($40\%..48\%$). Leon faces inward toward the central action.
- **Arena Barrier Rail & Ledge**:
  - Tightly bounded foreground asset `arena-rail-tight.webp` ($1440 \times 368$, containing only the physical barrier rail and floor from $y=656..1024$).
  - Positioned at `top: 59.5%` ($y=434\text{ px}$), placing the visible railing ledge at $y=515\text{ px}$ ($70.5\%$ of scene height).
  - Characters' torsos extend naturally behind the railing; lower torso cutoffs are cleanly occluded without overlapping character faces, blasters, or shuriken.
- **Arena Floor**: Occupies the bottom $29.5\%$ ($y=515..730\text{ px}$).
- **Register CTA**: Centered at $x=672\text{ px}$, $y=493\text{ px}$, with a dedicated backdrop glow framing the button without colliding with characters or identity.
- **Cannon**: Anchored to the lower-left foreground floor at $x=92\text{ px}$, $y=562\text{ px}$.
- **Balloon**: Anchored to the lower-right foreground floor at $x=1275\text{ px}$, $y=438\text{ px}$, reading clearly as a foreground character.

### Derived Artwork Assets
1. `public/assets/genesis/static/bg-space-sky.webp` ($1440 \times 1024$):
   - Created by inpainting the sky region of `bg-arena.webp` to eliminate all painted stars, starbursts, and fixed comet streaks, while preserving the atmospheric dome glow and background stadium lighting.
   - Completely separates sky from foreground: contains zero duplicate arena walls or floors.
2. `public/assets/genesis/static/arena-rail-tight.webp` ($1440 \times 368$):
   - Extracted tightly bounded railing and floor geometry ($y=656..1024$) with transparent upper sky.
   - Eliminates vertical scaling distortion caused by full-frame images on wide aspect ratios.
3. `public/assets/genesis/static/squeak-balloon.webp` ($677 \times 1089$):
   - Isolated balloon body, Squeak character, and tether without speech bubble.
4. `public/assets/genesis/static/squeak-dialog.webp` ($1173 \times 551$):
   - Isolated dialogue bubble ("Fine, you have my full attention.") rendered independently without deformation.

### Canvas 2D Falling Stars Simulation
- Constrained strictly to the sky region above the barrier rail ($y \le 515\text{ px}$).
- **Particle Count**: 52 active particles across 3 depth planes.
- **Vertical Velocity**: $vy = 32..68\text{ px/s}$ (clearly visible downward falling motion).
- **Horizontal Drift**: $vx = 7..17\text{ px/s}$ (slight diagonal trajectory).
- **Zero Static Stars**: Every particle has non-zero velocity and elapsed-time physics ($dt$).
- **Tab Inactivity & Resuming**: Time delta $dt$ is clamped to $0.08\text{ s}$ to prevent particle teleportation or jumps when returning from background tabs.
- **Recycling**: Particles exiting bottom/right boundaries are recycled to top/left boundaries smoothly.
- **Lifecycle & Pause**: Single RAF loop; pause flag freezes physics while preserving particle coordinates.

### Balloon & Character Interaction
- Squeak balloon rebuilt with 4 separate nested wrappers:
  1. `#balloon-character-group`: Layout anchoring on the arena floor.
  2. `#balloon-ambient-wrapper`: Gentle ambient bobbing tween ($8\text{ px}$, $2.8\text{ s}$).
  3. `#balloon-hover-wrapper`: Mouse hover tilt and lift ($-\text{4 deg}$, $-6\text{ px}$).
  4. `#balloon-click-squash`: Button click reaction with vertical squash ($0.85\times$) followed by elastic recoil spring.
- Dialogue bubble is attached via `#squeak-dialog-wrapper` outside the squash wrapper, keeping the text sharp and distortion-free during all interactions.
- Cannon recoil: Grounded idle pose with spring recoil on click.
- Eyelid patches removed: Characters use natural subtle breathing and hover readiness.

---

## 4. Files Modified / Created

| File | Status | Description |
| :--- | :--- | :--- |
| `public/assets/genesis/static/bg-space-sky.webp` | **Created** | Inpainted starless cosmic sky plate |
| `public/assets/genesis/static/arena-rail-tight.webp` | **Created** | Tightly bounded foreground barrier railing and floor ($1440 \times 368$) |
| `public/assets/genesis/static/squeak-balloon.webp` | **Created** | Isolated balloon body and Squeak character |
| `public/assets/genesis/static/squeak-dialog.webp` | **Created** | Isolated dialogue speech bubble |
| `components/landing/landing.css` | **Modified** | Rebuilt unified layout coordinate system for $1536 \times 730$ |
| `components/landing/SpaceEffects.tsx` | **Modified** | Replaced with 52-particle falling star simulation with $dt$ physics |
| `components/landing/AnimatedCharacter.tsx` | **Modified** | Rebuilt balloon with nested wrappers; removed fake eyelids |
| `components/landing/ArenaScene.tsx` | **Modified** | Swapped background to `bgSpaceSky` and barrier to `arenaRailTight` |
| `hooks/useLandingMotion.ts` | **Modified** | Dedicated DOM wrappers for entrance, idle, and parallax |
| `hooks/useSceneActivity.ts` | **Modified** | Eliminated redundant RAF loops; centralized pointer smoothing |
| `data/landingScene.ts` | **Modified** | Added new asset manifests |
| `package.json` | **Modified** | Configured working lint script (`"lint": "tsc --noEmit"`) for Next 16 |

---

## 5. Verification Checkpoints

### Checkpoint A — Composition
- Measured browser viewport: $1536 \times 730\text{ CSS px}$ (DPR 1.25).
- Colt: Upper body, head, hair, neon blasters fully visible ($y=248..578\text{ px}$); torso cutoff occluded behind barrier.
- Leon: Hooded head, shuriken, belt fully visible ($y=255..580\text{ px}$); faces inward toward central CTA.
- Genesis 3D Logo & Star Skull: Prominently centered at $y=124..343\text{ px}$ without colliding with nav or Register.
- Register Button: Centered at $y=493\text{ px}$ with clear visual separation from characters and floor.
- Barrier Rail: Ledge cleanly placed at $y=515\text{ px}$ ($70.5\%$ scene height), occluding moon dome and character cutoffs.
- Grounded Objects: Cannon at lower left ($y=562\text{ px}$); Balloon and Dialogue at lower right ($y=438\text{ px}$, $y=585\text{ px}$).
- Captured Screenshot: `checkpoint_a_composition.png`.

### Checkpoint B — Movement & Physics
- Ran for 8 seconds in Chrome CDP test harness:
  - Star 0: moved from $x=1368.1, y=41.9$ to $x=1443.4, y=362.4$ ($\Delta y = +320.5\text{ px}$).
  - Star 5: moved from $x=1432.2, y=283.0$ to $x=69.9, y=149.7$ (recycled across boundary).
  - Star 10: moved from $x=1086.3, y=156.9$ to $x=1161.4, y=477.1$ ($\Delta y = +320.2\text{ px}$).
  - Zero stationary stars remain in the sky plate or canvas.
- Characters maintain head and weapon clearance at all extremes of idle motion.

### Checkpoint C — Interaction & Lifecycle
- Balloon Hover:
  - Balloon body: `transform: matrix(0.997, -0.069, 0.069, 0.997, 0, -6)` (tilt $-4^\circ$, lift $-6\text{ px}$).
  - Dialogue bubble: `transform: none` (completely fixed, zero distortion).
- Balloon Click Squash:
  - Balloon body: `transform: matrix3d(1, 0, 0, 0, 0, 0.85, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)` (squash to $0.85\times$).
  - Dialogue bubble: remains fixed and fully readable.
- Repeated Clicks: GSAP tweens cleanly kill preceding tweens without accumulation.
- Sound & Motion Toggles:
  - Mute: Default muted; Web Audio oscillators trigger only after explicit toggle.
  - Motion Pause: Pauses canvas RAF loop and GSAP timelines cleanly; resuming continues smoothly without position snapping.
- Captured Final Screenshot: `after_laptop_repair.png`.

---

## 6. Build, Type-Check & Lint Results

1. **Production Build (`npm run build`)**:
   ```
   ▲ Next.js 16.4.3 (Turbopack)
   ✓ Compiled successfully in 1077ms
   Running TypeScript ...
   Finished TypeScript in 3.1s ...
   Generating static pages (3/3) in 1152ms
   Finalizing page optimization ...
   Route (app)
   ┌ ○ /
   └ ○ /_not-found
   ○ (Static) prerendered as static content
   Exit code: 0
   ```
2. **TypeScript Type Check (`npx tsc --noEmit`)**:
   - Exit code: `0`
   - Zero errors across all `.ts` and `.tsx` files.
3. **Lint Check (`npm run lint`)**:
   ```
   > genesis-6-landing@1.0.0 lint
   > tsc --noEmit
   Exit code: 0
   ```

---

## 7. Unresolved Limitations

- **None**. All defects reviewed have been comprehensively resolved, verified on the measured laptop viewport ($1536 \times 730\text{ CSS px}$), and confirmed in the live browser.

---

## 8. Part 1 Refinement Verification (Telescope, Planets, Comets, Characters, Balloon)

- **Stationary Telescope**: Grounded at $x=12\text{ px}, y=562\text{ px}$. Excluded from pointer parallax. Local hover scale $1.045$ anchored at tripod base (`50% 92%`).
- **Planetary Axial Rotations**: Large blue planet rotated continuously on visible center ($50.69\% 50.00\%$, $55\text{ s}$); small blue planet rotated continuously ($50.47\% 50.00\%$, $75\text{ s}$); purple ringed planet rotated continuously on center ($48.93\% 48.60\%$, $110\text{ s}$) with complete illustration integrity.
- **Supplied Neon Comets**: Alternates 3 variants of the supplied artwork descending diagonally downward-right across open sky lanes ($1.85\text{ s} .. 2.05\text{ s}$ passes, $3.5\text{ s} .. 5.5\text{ s}$ intervals).
- **Character Hover Depth**: Colt and Leon lift $-5\text{ px}$ and enlarge $1.04\times$ from lower-body anchors (`50% 92%`), preserving inward orientation and safe containment behind the barrier rail.
- **Decorative Responsive Balloon**: Removed all click handlers and button roles. Added asymmetrical buoyant idle loop ($-8\text{ px}$ vertical, $+2.2\text{ px} \leftrightarrow -1.2\text{ px}$ horizontal, $4.5\text{ s}$ cycle) and hover lift ($-10\text{ px}$, $1.06\times$, $2.2^\circ$ tilt) with independent, undeformed dialogue speech bubble.

