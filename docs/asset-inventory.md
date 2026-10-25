# GENESIS 6 Landing Page — Asset Inventory

This inventory documents all assets found in `G:\alone\components\landing page`, their formats, resolutions, transparency, visual inspection details, and mapping to the Figma 103:68 landing page composition.

## 1. Inventory Summary Table

| Filename | Type | Dimensions / ViewBox | Mode / Alpha | File Size | Intended Design Element | Individual or Composite | Notes & Figma Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Dual-Wielding Neon Gunslinger 1.png` | PNG | 1532 × 1200 | RGBA (Yes) | 1.47 MB | Left Hero Character (Colt) | Individual | Left character anchor (`x=177, y=406, 383×300` in Figma). |
| `Chameleon Hood Ninja Brawler 1.png` | PNG | 1428 × 1308 | RGBA (Yes) | 1.30 MB | Right Hero Character (Leon) | Individual | Right character anchor (`matrix(-1 0 0 1 1256 426)`, mirrored, `x=900, y=426, 357×327` in Figma). |
| `Glossy Blue Star-Emblem Cannon Turret 1.png` | PNG | 1128 × 1372 | RGBA (Yes) | 997 KB | Foreground Turret (Penny Cannon) | Individual | Left foreground anchor (`x=-9, y=502, 282×343` in Figma). Grounded, stable. |
| `Group 1000012450.png` | PNG | 1832 × 1216 | RGBA (Yes) | 896 KB | Squeak Balloon Character | Composite | Lower-right foreground anchor (`x=1169, y=706, 252×330`). Contains speech bubble "Fine, you have my full attention." |
| `Neon Purple Ringed Planet 1.png` | PNG | 1444 × 752 | RGBA (Yes) | 670 KB | Ringed Space Planet | Individual | Upper-right celestial space object (`x=1030, y=163, 361×188` in Figma). |
| `Glossy Blue Planet Icon 1.png` | PNG | 656 × 636 | RGBA (Yes) | 298 KB | Blue Cratered Planet (Large) | Individual | Upper-left celestial object (`x=58, y=260, 164×159` in Figma). |
| `Glossy Blue Planet Icon 2.png` | PNG | 452 × 440 | RGBA (Yes) | 157 KB | Blue Cratered Planet (Medium) | Individual | Additional celestial depth object (`x=1224, y=465, 113×110` in Figma). |
| `Glossy Blue Planet Icon 3.png` | PNG | 212 × 208 | RGBA (Yes) | 40 KB | Blue Cratered Planet (Small) | Individual | Small celestial accent (`x=265, y=227, 53×52` in Figma). |
| `Glossy Violet Asteroid Rock 1-1.png` | PNG | 284 × 252 | RGBA (Yes) | 93 KB | Violet Asteroid Rock (Large) | Individual | Right side mid-layer rock (`x=1328, y=462, 71×63` in Figma). |
| `Glossy Violet Asteroid Rock 1.png` | PNG | 164 × 144 | RGBA (Yes) | 32 KB | Violet Asteroid Rock (Small) | Individual | Left side mid-layer rock (`x=232, y=383, 41×36` in Figma). |
| `Neon Comet Shooting Star 1.png` | PNG | 1012 × 508 | RGBA (Yes) | 290 KB | Neon Comet Streak (Large) | Individual | Shooting comet accent across dark sky (`x=-16, y=393, 253×127` in Figma). |
| `Neon Comet Shooting Star 2.png` | PNG | 364 × 180 | RGBA (Yes) | 49 KB | Neon Comet Streak (Medium) | Individual | Celestial comet streak (`x=1307, y=602, 91×45` in Figma). |
| `Neon Comet Shooting Star 3.png` | PNG | 360 × 180 | RGBA (Yes) | 48 KB | Neon Comet Streak | Individual | Celestial comet streak (`x=931, y=291, 90×45` in Figma). |
| `Neon Comet Shooting Star 4.png` | PNG | 336 × 168 | RGBA (Yes) | 43 KB | Neon Comet Streak | Individual | Celestial comet streak (`x=376, y=285, 90×45` in Figma). |
| `Neon Comet Shooting Star 5.png` | PNG | 360 × 180 | RGBA (Yes) | 48 KB | Neon Comet Streak | Individual | Celestial comet streak (`x=327, y=137, 84×42` in Figma). |
| `Group 1000012441.png` | PNG | 1900 × 1196 | RGBA (Yes) | 106 KB | GENESIS Logo + Skull/Star Emblem | Composite | Central hero identity (`x=350, y=260, 740×470` in Figma). Also available as vector paths in SVG. |
| `Group 1000012447.png` | PNG | 3703 × 244 | RGBA (Yes) | 68 KB | Header Controls (Brochure, Prize, Sponsors) | Composite strip | 3 distinct buttons separated by transparent spacing: Button 1: Brochure (0..1127), Button 2: Prize (1332..2355), Button 3: Sponsors (2616..3703). |
| `Group 1000012449.png` | PNG | 300 × 528 | RGBA (Yes) | 17 KB | GDAI Hanging Ribbon Badge | Individual | Upper-left brand badge (`x=80, y=6..120` in Figma). |
| `Group 1074.png` | PNG | 1044 × 503 | RGBA (Yes) | 18 KB | REGISTER CTA Button | Individual | Yellow 3D comic CTA (`x=588, y=590, 250×83` in Figma). |
| `btn-settings.png` | PNG | 567 × 302 | RGBA (Yes) | 6.6 KB | Hamburger / Settings Button | Individual | Excluded from landing page per explicit instructions (no hamburger/sidebar). Sound control is added separately. |
| `landing page.svg` | SVG | 1440 × 1024 viewBox | Mixed | 13.43 MB | Complete Figma Frame 103:68 | Full Scene Vector & Embedded Image Container | Contains embedded clean background arena (`image2_103_68.png`, 1440×1024) and giant glowing blue moon (`image3_103_68.png`, 1820×864). |

## 2. Key Extracted Assets from `landing page.svg`

Because `landing page.svg` was exported directly from Figma node 103:68, it preserved two crucial layers that are NOT otherwise available as standalone PNG files in the folder:

1. **Space Arena Stadium Background (`bg-arena`)**:
   - Extracted from `image2_103_68.png` in SVG defs.
   - Exact size: 1440 × 1024, RGB.
   - Clean dark outer space sky, neon horizon dome, and blue stadium arena floor. Contains zero characters, zero foreground objects, and zero buttons.
2. **Giant Glowing Blue Moon (`moon-dome`)**:
   - Extracted from `image3_103_68.png` in SVG defs.
   - Exact size: 1820 × 864, RGBA transparent.
   - Sits at `x=397, y=429, width=645, height=306` behind the characters and central opening.
3. **Balloon Character Standalone (`balloon-solo`)**:
   - Extracted from `image8_103_68.png` in SVG defs (1094 × 1438, RGBA).
   - Contains the Squeak balloon head on a stick without the speech bubble, permitting clean rendering with or without dialog.

## 3. Duplicate and Missing Artwork Audit

- **Duplicates**:
  - `landing page.svg` contains redundant references to `image1_103_68` (ringed planet) and comets that were mapped twice. In our web implementation, we render only single canonical instances.
  - Comets 2, 3, 4, 5 share identical styling with slight scale variations.
- **Missing Local Assets**:
  - The brochure PDF (`GENESIS_6_BROCHURE_.pdf`) was not inside `components/landing page`, but was verified and retrieved intact from the local project archive at `G:\genesis\required files\GENESIS_6_BROCHURE_.pdf` (1.75 MB).
- **Optimization Strategy**:
  - Using high-efficiency WebP (quality 85–88) for all scene raster layers reduces the initial raster payload from **7.25 MB down to ~0.75 MB**, easily meeting the target of ≤ 3 MB with pristine visual fidelity.
