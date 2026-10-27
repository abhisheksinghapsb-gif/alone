# GENESIS 6 — Frequently Asked Questions (FAQ) Section Specification

This document formalizes the architecture, asset mapping, layout geometry, interaction model, motion rules, audio feedback, data grounding, and accessibility standards for the **Genesis 6 FAQ Section**.

---

## 1. Scope, Placement & Single-Page Architecture

- **Semantic Root**: `<section id="faq" aria-label="Frequently Asked Questions">`
- **Component Path**: `components/FAQ/FAQSection.tsx`
- **Document Order**:
  1. Landing Hero Scene (`#arena-scene`)
  2. Arena Section Divider (`#arena-section-divider`)
  3. About Genesis Section (`#about-genesis`)
  4. About-to-Sponsors Section Divider (`#about-to-sponsors-divider`)
  5. Sponsors Section (`#sponsors`)
  6. Sponsors-to-Prize Structural Divider (`#sponsors-prize-divider`)
  7. Prize Pool Section (`#prize-pool`)
  8. **Frequently Asked Questions Section (`#faq`)**
- **In-Page Seam**: Restrained dark-blue gradient seam at the top of the FAQ section (`topSeam`), preserving preceding dividers and sections with zero regression.
- **Scroll Behavior**: 100% native document flow; zero fixed-height traps, zero artificial page hijacking, and zero internal scrolling answer windows.

---

## 2. Asset Inventory & Deduplication Mapping

Source archives `Untitled (7).zip` (General), `Untitled (8).zip` (Technical), `Untitled (9).zip` (Prizes), and `Untitled (10).zip` (Logistics) contained duplicated assets (~2.23 MB each) and composite SVGs. Runtime assets are deduplicated and isolated under `public/assets/genesis/faq/`:

| Role | Source File | Original Payload | Runtime File | Optimized Size | Reduction / Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heading Plaque** | `Group 1000012443.svg` | `2,811 B` | `heading-plaque.svg` | `2,811 B` | Pure Vector SVG |
| **Heading FAQs** | `FAQs.svg` | `7,733 B` | `heading-faqs.svg` | `7,733 B` | Pure Vector SVG |
| **Plus Icon** | `+.svg` (17 × 17) | `957 B` | `icon-plus.svg` | `957 B` | Pure Vector SVG (rotates 45°) |
| **Close Button (Red X)** | Extracted from `Group 1000012460` | Baked into `7,656 B` SVG | `button-close.svg` | `3,147 B` | Isolated Interactive SVG |
| **Cosmic Pattern Bg** | `Cosmic Brawl Stars Pattern 2.svg` | `2,231,695 B` (2.23 MB SVG) | `bg-cosmic-pattern.webp` | `80,046 B` | **-96.4%** Shared WebP Cache |

**Total FAQ Section Runtime Assets**: `< 15 KB` of standalone vector assets, sharing the cached `80 KB` cosmic background from preceding sections.

---

## 3. Data Specification & Grounding Rules

All question and answer copy is strictly grounded in official project assets:
- **Genesis 6 Approved Brochure** (`public/documents/GENESIS_6_BROCHURE_.pdf`)
- **About Genesis Data** (`data/aboutGenesis.ts`)
- **Timeline Stages Data** (`components/timeline/timelineData.ts`)
- **Prize Pool Manifest** (`components/prize-pool/prizePoolData.ts`)

Where information has not yet been confirmed by event organizers, the copy explicitly displays: **"Details will be announced."** Internal metadata (`isPending`, `sourceReference`) is retained in `faqData.ts` and never exposed to the public UI.

### 13 Questions Across 4 Categories

#### Category 1: GENERAL
1. **What is Genesis?**
   - *Answer*: Genesis 2027 marks the 6th Edition of Army Institute of Technology's premier student-driven Game Jam, powered by the AR-VR Club (GDXR / GDAI). It is a high-energy 24-hour hackathon blending coding, creativity, and game design, where developers assemble to turn bold ideas into pitch-ready games and level up through interactive speaker sessions.
   - *Status*: Approved (Brochure Page 2 & `aboutGenesis.ts`).
2. **When and where is Genesis happening?**
   - *Answer*: Genesis kicks off with an intense 24-hour online game jam qualifier (Round 1), followed by the grand on-campus showdown (Round 2) hosted live at the Army Institute of Technology (AIT) campus in Pune. Exact tournament dates and operational schedule details will be announced.
   - *Status*: Pending specific calendar dates.
3. **Who can participate in Genesis?**
   - *Answer*: Genesis welcomes passionate game developers, student programmers, digital artists, and storytellers. Registration opens online across Unstop and IndieConnect. Detailed eligibility guidelines, squad compositions, and team-size limits details will be announced.
   - *Status*: Pending specific squad limits.
4. **Is there a registration fee?**
   - *Answer*: Details will be announced.
   - *Status*: Pending registration portal announcement.

#### Category 2: TECHNICAL
5. **What game engines are allowed?**
   - *Answer*: Details will be announced.
   - *Status*: Pending technical committee release.
6. **Can I use pre-made assets?**
   - *Answer*: Details will be announced.
   - *Status*: Pending asset attribution policy.
7. **What platforms can we develop for?**
   - *Answer*: Genesis features dual competition tracks: the Main Track supporting standard platforms, and a specialized VR Track for immersive experiences. Complete hardware targets, build submission requirements, and platform specifications details will be announced.
   - *Status*: Dual tracks approved; hardware targets pending.
8. **Will there be workshops or mentorship?**
   - *Answer*: Yes! Genesis provides hands-on mentorship from seasoned industry professionals alongside engaging speaker sessions and interactive challenges designed to level up your development skills and soft skills throughout the tournament.
   - *Status*: Approved (Brochure Page 2 & 6).

#### Category 3: PRIZES
9. **What are the prizes?**
   - *Answer*: Genesis 6 boasts a total prize pool exceeding ₹120,000! Cash prizes are distributed across the Main Prizes (1st: ₹17,500, 2nd: ₹15,000, 3rd: ₹12,500) and the VR Track (1st: ₹10,000, 2nd: ₹5,000). Winning and participating brawlers also receive exclusive custom merchandise, gadgets, goodies, and official certificates.
   - *Status*: Approved (Brochure Page 4–6 & `prizePoolData.ts`).
10. **How will winners be selected?**
    - *Answer*: All game prototypes submitted during the jam undergo preliminary evaluation by expert reviewers. Shortlisted finalists then present playable builds live to an esteemed panel of industry judges and audience members at AIT Pune. Detailed scoring rubrics and evaluation criteria details will be announced.
    - *Status*: Format approved; scoring rubrics pending.

#### Category 4: LOGISTICS
11. **Will food be provided?**
    - *Answer*: Details will be announced.
    - *Status*: Pending catering schedule.
12. **Can I sleep at the venue?**
    - *Answer*: Details will be announced.
    - *Status*: Pending campus overnight policy.
13. **What should I bring?**
    - *Answer*: Finalists attending the on-campus round at AIT Pune must bring their personal laptops or development rigs, power chargers, necessary test devices or VR gear, and valid student identification. Comprehensive check-in requirements and packing list details will be announced.
    - *Status*: Hardware approved; packing list details pending.

---

## 4. Geometric Stability & Layout Architecture

To prevent page jumps and layout thrashing when switching between categories containing varying question counts (General: 4, Technical: 4, Prizes: 2, Logistics: 3):
- **Shared Footprint**: The outer royal-blue panel (`panelCard`) maintains a fixed desktop width of `960px` and a minimum body height of `460px` (`minPanelContentHeightDesktop`).
- **Zero Width/Height Delta**: Automated CDP telemetry verified:
  - `General`: `width: 960px`, `height: 546px`, `top: 155.97px`
  - `Technical`: `width: 960px`, `height: 546px`, `top: 155.97px`
  - `Prizes`: `width: 960px`, `height: 546px`, `top: 155.97px` (Delta: `0.00px`)
  - `Logistics`: `width: 960px`, `height: 546px`, `top: 155.97px` (Delta: `0.00px`)
- **Natural Expansion**: When an answer expands or when rendering on mobile viewports (<768px), the panel expands downward naturally without clipping.

---

## 5. Interaction & Motion Rules

### Coordinated Section Entrance
- **Trigger**: ScrollTrigger with `start: 'top 80%'`, `once: true`.
- **Duration**: ~1.2–1.5 seconds.
- **Sequence**:
  1. Orange Plaque settles (`y: 14px -> 0px`, `opacity: 0 -> 1`, `duration: 0.65s`, `ease: 'power2.out'`).
  2. Royal-Blue Panel settles (`y: 16px -> 0px`, `opacity: 0 -> 1`, `duration: 0.75s`, `delay: 0.18s`).
  3. Question rows settle (`y: 8px -> 0px`, `opacity: 0 -> 1`, `duration: 0.45s`, `stagger: 0.045s`, `delay: 0.38s`).
  4. Category bar follows (`y: 12px -> 0px`, `opacity: 0 -> 1`, `duration: 0.6s`, `delay: 0.55s`).

### Category Switch Transition
- **Immediate Tab Feedback**: Control translates `2px` on press, orange underline transitions smoothly.
- **Row Settling**: New question rows settle with short stagger (`6px` translate, `220ms` duration, `40ms` stagger).
- **Interruptible**: Previous category switch timeline is killed immediately upon rapid tab switching.

### Accordion Expansion & Red X Control
- **Mechanical Drawer**: Height expansion over `320ms` (`cubic-bezier(0.2, 0.8, 0.2, 1)`).
- **Plus Rotation**: Icon smoothly rotates `45deg` into a close mark.
- **Single Open Rule**: Clicking another question opens it and collapses the previous; clicking the open question collapses it.
- **Red X Button**:
  - Located in the panel header right corner.
  - Collapses open answer in the active category.
  - Automatically disabled (`opacity: 0.45`, `filter: grayscale(40%)`) when no answer is open.

### Sound Feedback
- Respects `soundEnabled` prop.
- Plays quiet tactile UI sound (`uiAudio.playPressClack()`) strictly on deliberate question or category tab clicks.
- Zero audio on hover or scrolling.

### Reduced Motion
- Respects `motionPaused` prop and `@media (prefers-reduced-motion: reduce)`.
- Eliminates entrance translation, background depth, and sets transition durations to `0.01ms`.

---

## 6. Accessibility & WCAG 2.1 AA Compliance

- **Semantic Structure**: `<section>`, `<h2>` category title, `<h3>` question headings, native `<button>` controls.
- **Tablist Pattern**: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`.
- **Keyboard Navigation**:
  - `ArrowRight` / `ArrowLeft`: Navigates category tabs.
  - `Home` / `End`: Navigates to first/last category tab.
  - `Enter` / `Space`: Activates tabs and expands questions.
  - Focus stays on activated tab; zero automatic page scrolling.
- **Accordion ARIA**: `aria-expanded="true|false"`, `aria-controls="faq-body-*"`.
- **Inert Closed Answers**: Collapsed answers use HTML `hidden` attribute to ensure screen readers and keyboard tabs cannot focus closed content.
- **Focus Rings**: High contrast `3px solid #efc609` with `outline-offset: 3px`.
