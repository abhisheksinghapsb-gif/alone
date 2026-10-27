# GENESIS 6 — Repair Plan After Real Browser Testing

Prepared from the owner's screenshots and recordings, 28 October 2026.

## Execution instruction for Antigravity

Read this entire file before editing. This is a follow-up to `GENESIS_6_ANTIGRAVITY_OPTIMIZATION_MASTER.md`, based on failures found after your last optimization pass. Do not restart the project, rerun every previous cleanup operation, or redesign all sections.

**Execute Batch A only in the first run: Phases 0–3.** Finish the Home repair and its browser verification, then stop at that planned review boundary and return the evidence requested below. Batches B and C describe the subsequent work; do not execute them during the first run. Inside an authorized batch, continue through its phases without routine permission questions.

Use one coordinated writer. Do not let separate agents edit the same global CSS, scene, motion hook, page composition, or package files concurrently.

Do not commit, push, merge, deploy, reset, clean the working tree, restore the checkpoint over current work, or delete supplied artwork. Keep all existing uncommitted changes. Do not switch branches if doing so risks those changes.

## 1. Project and scope

- Project: `G:\alone`.
- Repository: `https://github.com/abhisheksinghapsb-gif/alone`.
- Expected current work branch: `optimization/responsive-cleanup`; inspect the actual branch before proceeding.
- Original review checkpoint: `e0638dc84f3fe45e86735dc35b13e8274d561502`. It is a recovery reference, not a reset instruction.
- Keep the installed Next.js App Router, React, TypeScript, Tailwind/custom CSS, GSAP/ScrollTrigger and Web Audio stack. Preserve the lockfile and installed versions unless a demonstrated defect requires a specific change.
- Read `AGENTS.md` and the relevant installed Next.js documentation before changing framework behavior.

Preserve these seven sections, their content, and their existing dividers:

1. Home / Landing.
2. About Genesis.
3. Vertical Timeline.
4. Sponsors.
5. Prize Pool, including VR Track.
6. FAQ.
7. Contact.

Preserve the accepted laptop artwork, visual hierarchy, colors, fonts, silhouettes, copy, dates, amounts, sponsor names, contact details, links, and current Register behavior. Do not add a backend, a menu, a sidebar, popups, a loader, generated video, new external destinations, or unrelated effects.

The right-hand Home Ninja remains plain and stationary. Keep its removed circle, aura, reticle, hover glow, tilt and idle animation removed. Preserve working Telescope, Gunslinger, Balloon, planet, star and prize interactions.

The same visual identity needs different geometry on wide screens, portrait tablets and phones. Matching the laptop does not require squeezing its coordinates into a narrow canvas. Do not scale the whole site with `transform: scale(...)`, CSS `zoom`, or a fixed-width wrapper.

## 2. Evidence: what actually failed

Use these filenames if the owner supplies the same media in Antigravity. The descriptions below are sufficient to start reproducing the defects if the media are not locally available.

| Evidence | What is visible | Classification |
| --- | --- | --- |
| `image(20261027-191036).png` | Phone Home navigation runs across the Genesis wordmark. A long empty blue region separates Register from the main character scene. The Balloon competes with the right character's face. | Confirmed composition/overlap problem; high priority. |
| `image(20261027-191054).png` | Sponsors reflows into readable single-column illustrated cards. | Valid responsive behavior to preserve. Check badge, crown, caption and interaction bounds; single-column layout itself is not a defect. |
| `image(20261027-191316).png` | Surface Pro 10 preset, **960×1440 CSS viewport**, displayed at 75% in DevTools. A large opaque arena/floor strip crosses the scene above the lower character cluster and cuts through the characters. | Confirmed foreground placement/occlusion defect. |
| `20261027-1911-02.4361725.mp4`, approximately 0–17 seconds | **412×924** phone preset. Sponsors and both Prize stages reflow. Prize medals are arranged as a long vertical list. | Preserve the content and functioning reflow. Review density and ranking layout; length alone does not prove missing content. |
| Same recording, approximately 18–23 seconds | FAQ Prizes category has two questions, a large unused blue panel area, then another substantial gap before the category controls. General/category switching is visible. | Confirmed mobile spacing and control-discoverability problem. Actual answer clipping or transition lockups still require interaction testing. |
| Same recording, approximately 27–41 seconds | Home has a large gap between identity/action and the characters; navigation and wordmark are crowded. The tester changes to an approximately **393×852** phone preset. | Reproduce at both phone sizes. Do not infer exact CSS dimensions from screenshot pixel width. |
| `20261027-1912-16.9060218.mp4`, approximately 0–1 seconds | **768×1024** iPad Mini preset. Arena foreground appears as an opaque horizontal band over the character heads/upper bodies, with the lower scene visible underneath. | Confirmed tablet Home failure. A higher character z-index alone would not repair the inconsistent geometry. |
| Same recording, approximately 2 seconds | About copy is readable, but a large fixed-looking panel leaves considerable unused space under two short paragraphs. | Review narrow-layout proportions. Do not invent more text to fill it or alter the accepted desktop panel. |
| Same recording, approximately 4–11 seconds | Timeline is vertical with a rail, milestones and illustrated chapters. | Preserve this implementation; verify alignment and reverse scrolling instead of replacing it. |
| Same recording, approximately 12–22 seconds | Sponsors, Prize/VR, FAQ and Contact remain present and reflow on the tablet. | Preserve working behavior. This is not evidence that every interactive state, browser or screen size has passed. |

Important interpretation rules:

- Some captures are taken partway down a section. A heading outside that particular viewport is not automatically missing. Record `scrollY` and retest from the document top.
- The grey DevTools surround, browser UI, Windows taskbar, touch-emulation cursor and recording cursor are not website elements to remove.
- DevTools' 75% preview scale is not the page's CSS viewport width or a browser-zoom test.
- Sponsors' single-column phone layout, a taller-than-screen section, and an image partially outside a viewport during normal scrolling can all be correct.
- The foreground concealing lower torso cut edges can be intentional. Concealing heads, faces, weapons, the logo or Register is not acceptable here.
- The recordings do not establish runtime FPS, device performance, memory growth, every blink interval, or all hidden-tab behavior. Measure those separately.

## 3. Correct the previous completion claims

The previous report marked all responsive sizes PASS. The supplied Home failures mean at least those affected cases are currently FAIL. Update `docs/optimization-report.md` with the reproduced state, test conditions and evidence; keep the earlier summary as history if useful, but supersede inaccurate completion claims.

Inspect `scripts/regression-check.js` before interpreting its output. Source-string checks can prove that a selector, link or section declaration exists. They cannot by themselves establish visible geometry, unoccluded controls, readable artwork, animation behavior or 17 successful browser layouts. If a Node script actually launches a browser, record which cases and assertions it executes.

The reported 4.4-second compilation versus an earlier 10.4 seconds is a build-time observation. It does not measure animation smoothness, and differing cache states make that comparison unsuitable as proof of optimization. Label build checks, source checks, browser checks and performance measurements separately.

Use only `PASS`, `FAIL` and `NOT TESTED`, with a short reason. Do not write “all platforms”, “zero lag” or “100% responsive” when only a finite emulated matrix has been checked.

## 4. Implementation ownership

Inspect the current code rather than assuming a prior ChatGPT experiment was applied. Those experiments were not pushed to this checkout.

| Area | Files to inspect |
| --- | --- |
| Home layout | `components/landing/ArenaScene.tsx`, `landing.css`, `LandingHeader.tsx`, `ExperienceControls.tsx`, `AnimatedCharacter.tsx` |
| Home motion | `hooks/useLandingMotion.ts`, `components/landing/RingedPlanet.tsx`, `SpaceEffects.tsx` |
| Assets and document | `data/landingScene.ts`, `components/landing/LandingExperience.tsx`, `app/globals.css`, `app/layout.tsx` |
| About | `components/ABout/AboutGenesisSection.tsx`, `BriefingPanel.tsx`, `about.css`, `hooks/useAboutMotion.ts` |
| Timeline | `components/timeline/TimelineSection.tsx`, `TimelineChapter.tsx`, `timeline.module.css` |
| Sponsors | `components/sponsors/sponsors.module.css`, `SponsorsSection.tsx`, `SponsorBoard.tsx`, `SponsorSlotCard.tsx`, `hooks/useSponsorsMotion.ts` |
| Sponsors divider | `components/sponsors/SponsorsDivider.tsx`, `sponsors.css` — retain its live divider rules |
| Prize / VR | `components/prize-pool/PrizePoolSection.tsx`, `PrizeStage.tsx`, `PrizeMedal.tsx`, `prize-pool.css`, `usePrizeMotion.ts`, `useCharacterBlink.ts` |
| FAQ | `components/FAQ/FAQSection.tsx`, `FAQSection.module.css`, `FAQAccordionItem.tsx`, `FAQCategoryTabs.tsx`, `useFAQMotion.ts` |
| Contact / sound | `components/contact/ContactSection.tsx`, `ContactSection.module.css`, `ContactPlate.tsx`, `useContactMotion.ts`, `lib/uiAudio.ts` |

Keep case-sensitive import paths correct. Do not normalize `ABout` or `FAQ` casually and break a Linux build.

---

# Batch A — Repair Home and prove it works

## Phase 0 — Verify the running version and establish a baseline

1. Inspect `git status`, current branch, HEAD and remotes. Preserve all current work. Record that HEAD alone does not describe uncommitted edits.
2. Confirm which process serves the preview and which project directory it belongs to. Do not kill a PID copied from an old log. Use one identified project preview for the checks.
3. Run the existing TypeScript check and production build, recording actual results. Inspect `package.json`: if `npm run lint` is `tsc --noEmit`, call it a TypeScript check.
4. For production testing, build the current files, start the production server on an available port such as 3002, and verify that URL. A `next start` server does not incorporate new source edits just because the browser is refreshed: rebuild and restart that verified server after each repair batch.
5. Reproduce Home at **412×924, 393×852, 768×1024 and 960×1440** before editing. Also capture the accepted laptop layout at **1536×730** and **1366×768**. Capture from `scrollY = 0` and the Home/About boundary.
6. Record CSS viewport dimensions, document client width, device pixel ratio, page zoom, preview scale if used, motion setting, pointer mode and elapsed entrance time. Record console errors and failed image requests.
7. In `docs/optimization-report.md`, add a recovery section with a short defect table: ID, reproduction size/state, symptom, confirmed cause, changed files, and result.

**Gate:** The correct current build is identified; the four supplied Home failures are reproduced or clearly explained. A laptop baseline exists. Do not claim a nonreproduced problem was fixed.

## Phase 1 — Diagnose the actual scene geometry

This phase is investigation before changing coordinates. Inspect rendered elements, computed CSS, image requests and active animation transforms.

### A. Map the coordinate systems

- Map the header, nav, identity, planets, moon, character wrappers, Balloon, Telescope, barrier and divider to their containing blocks.
- Read active base rules and every relevant media query. Confirm the rendered `.centerHeroWrap`, `.gunslingerWrap` and `.cannonWrap` are targeted by the current rules. Earlier selector fixes alone do not establish correct layout.
- Inspect conflicting `top`/`bottom`/height constraints, percentage positions based on an excessively tall hero, fixed dimensions, inline GSAP transforms, `translateX(-50%)` ownership, and margins introduced by wrapper changes.
- Check whether 768px and 960px portrait tablets retain a landscape/laptop scene simply because only width breakpoints were considered.

### B. Trace the foreground defect

- Inspect the **actual requested asset** and its rendered bounds. The original manifest uses a pure sky plate and a separate tightly cropped rail/floor. Confirm current code has not substituted a combined arena background or the wrong foreground export.
- Check whether the sky/background already includes another rail. Render one intentional rail/floor assembly, not duplicate walls from two assets.
- Compare the foreground's real visible rail line with the character face/body positions. A wrapper rectangle may contain transparent padding; inspect the visible artwork as well as `getBoundingClientRect()`.
- Check whether `top: 59.5%`-style positioning survives while characters are now bottom-anchored. Different reference systems can explain why an opaque floor crosses their heads on tall screens; confirm this in the current checkout before naming it the cause.
- Identify stacking contexts created by transforms, opacity, isolation or filters. Separate a stacking error from an anchor/size error. Do not use `z-index: 99999` to conceal a geometry defect.

### C. Check overflow honestly

- The recording shows page-level `overflow-x: hidden` styling. Audit its current use on `html`, `body` and the page root.
- Measure out-of-bounds functional content even if a scrollbar is absent. Page clipping can hide a broken layout.
- Keep intentional clipping local to sky particles, a canvas, artwork masks or a floor plane. Do not delete necessary masks, and do not use global clipping as the responsive fix.

**Gate:** Document the actual causes of phone header overlap, the oversized gap, and both tablet foreground failures. If one cause explains multiple symptoms, repair that shared cause rather than creating a patch per screenshot.

## Phase 2 — Recompose Home with a coherent ground plane

Change Home and its own header/motion support only. Touch shared page styles only when a reproduced shared defect requires it, and explain the change.

### A. Reserve real header space

1. On phones, give the badge and utility controls a real first row, followed by a second row containing Brochure, Prize and Sponsors. Use Grid/Flex with widths that fit at 320px.
2. Keep the identity below the actual occupied header area. An absolutely positioned header must not float over a logo positioned independently at an arbitrary percentage.
3. Prefer an in-flow mobile header in the same Home layout. If the header must remain outside the scene in the current architecture, explicitly reserve its responsive height using the same layout contract; do not add unrelated spacer divs per device.
4. Keep each control operable with a practical touch area, visible focus, and no overlap between transparent hit regions. Do not add a hamburger menu or remove controls.
5. Keep planets and comets out of essential text/control safe areas. They may animate behind the scene without competing with the wordmark or navigation.

### B. Use three fitting compositions

- **Wide / laptop:** preserve the accepted centered identity and flanking characters, with the approved floor and props. Bound artwork so large screens do not enlarge it without limit.
- **Portrait tablet:** create a balanced identity region above a shared character/floor scene. The 960×1440 case must not become a very tall laptop layout with an unrelated floor band through the middle.
- **Phone:** arrange header, identity/Register, character scene and divider as a compact sequence. Preserve both characters. Let short screens scroll naturally.

Choose transition widths where the artwork actually stops fitting. Consider height/aspect ratio for tall tablets and short landscapes; do not rely on a single `max-width` adjustment.

Avoid forcing the hero to fill a tall viewport if doing so creates the recorded empty gulf. At the two recorded phone sizes, use roughly **32–96 CSS pixels** between the Register control and the first major character silhouette as a starting composition target, then validate the full scene. This is not a universal hard-coded gap for every device. Do not measure the transparent padding of an image as its silhouette.

Use intrinsic content size and bounded scene proportions. Stable viewport units can help browser-chrome behavior, but replacing `vh` with `svh` or `dvh` alone will not repair unrelated anchors. Avoid a dynamic scene-height recalculation on every mobile address-bar movement.

### C. Give the scene one ground reference

1. Establish one local scene containing block with explicit bounds. Define a shared rail/horizon reference for the moon, character bases and foreground.
2. Position the rail/floor and character bases from that reference, using a small, documented set of scene variables or equivalent layout constraints. Do not let their anchors derive independently from different percentages of the whole page.
3. Keep the moon behind the characters. The foreground may conceal their intended lower cut edges. It must not conceal their eyes, faces, heads or weapons.
4. Give the floor a deliberate local crop if necessary. Preserve source proportions for bodies, logos and rings. Do not stretch the foreground into an enormous opaque rectangle to fill a tall container.
5. Keep the Telescope grounded on the floor and stationary, with only its existing bounded hover response. Place the Balloon where its motion and hover enlargement do not cover the Ninja's face or a button.
6. Keep the Balloon non-clickable; do not add navigation, a popup or button semantics merely to animate it.
7. Reserve motion margins. A resting layout that fits but collides during bobbing, hover, recoil or parallax is still a failure.
8. Leave the next divider in normal document flow immediately after the completed Home scene. No absolute-positioned artwork may escape into About.

### D. Protect motion while changing layout

- Separate layout placement from entrance, idle, pointer and hover transforms. Do not let GSAP and CSS overwrite the same positioning transform.
- Adapt paths to the scene's measured bounds after a meaningful resize. Keep the existing falling stars/comets; do not replace them with a static texture as a performance shortcut.
- Keep the ring axis and ring layers fixed while the planet surface rotates. Keep the correct current rotation direction; inspect it rather than reversing a sign blindly.
- Use the project's current lifecycle or a scoped `gsap.matchMedia()` setup for different motion conditions, with cleanup on breakpoint exit. Do not introduce a second competing global motion manager.
- Preserve motion pause and live reduced-motion behavior. Pausing during entrance must leave essential content visible in a complete resting pose.
- Do not replay every introduction or recreate RAF loops when resizing or returning to the tab.

**Gate:** Home has a coherent floor, visible faces/weapons, separate header and wordmark, a compact phone composition, and the accepted laptop appearance. There are no new global overrides or missing interactions.

## Phase 3 — Home browser verification and Batch A handoff

Check **320×568, 393×852, 412×924, 768×1024, 960×1440, 1366×768, 1536×730, and 844×390**. Also resize through each implemented breakpoint in both directions without reloading.

For each case:

1. Start at the document top; capture the settled Home and its lower boundary. Record the real CSS viewport, DPR and motion mode.
2. Inspect the initial entrance as well as the settled state. Confirm essential content never remains invisible after pause, quick scrolling or resize.
3. Verify no header/wordmark collision, no unintended face/weapon occlusion, no Telescope/CTA collision, and no Balloon covering the Ninja's face at maximum hover/idle extent.
4. Check actual rendered content against local clip boundaries, not just `scrollWidth === clientWidth`. Use targeted rectangles and hit testing where appropriate, followed by visual inspection of transparent artwork.
5. Verify stars fall, comets traverse the scene, planet surface rotation is visible with stationary rings, Telescope hover works, Balloon moves without click functionality, and the Ninja stays plain.
6. Verify both navigation anchors, keyboard focus, sound/motion controls and the brochure's new-tab behavior. Do not place calls or invent a Register action during testing.
7. Scroll into About and return. Confirm the divider and neighboring sections still work. Compare both laptop baselines.
8. Run the existing TypeScript check, production build and `git diff --check`. Rebuild/restart production before the final browser captures.

Return:

- A concise cause-and-fix explanation for the confirmed Home failures.
- The actual changed files.
- Before/after Home captures for **412×924, 768×1024, 960×1440 and 1536×730**, plus a result row for every Batch A viewport.
- A short motion-on browser recording or equivalent observable interaction evidence, with pause/reduced-motion checks described separately.
- Actual command results and outstanding failures.

**Stop here after Batch A. Do not perform Batches B/C or mark the whole project complete.** The purpose of this boundary is to establish that the most visibly broken component is repaired before expanding the change surface.

---

# Batch B — Targeted section improvements after Home review

Run only after the owner requests Batch B. Recheck the current working tree and keep the accepted Batch A result.

## Phase 4 — About, Timeline and Sponsors

### About: content-led narrow layout

- Preserve the two approved paragraphs, panel outline, cyan border glow, subtle clipped pointer glow, heading art and background.
- At phone/tablet widths, reduce obsolete panel minimum heights and excess padding where the supplied view shows empty space. Keep enough breathing room for the silhouette and readable copy.
- Do not invent copy, enlarge text excessively or crop the frame to make the box look full. Preserve its accepted laptop proportions.
- If all copy fits, do not show unnecessary scroll indicators or run an internal auto-scroll loop. If overflow genuinely exists, preserve touch/keyboard reading and avoid trapping document scrolling.
- Check 320px, text enlargement, late font loading and the last line of each paragraph. Keep decorative glow out of text contrast and pointer hit targets.

### Timeline: retain the working vertical design

- Preserve the four illustrated chapters, rail, milestone badge, larger glowing logo treatment and reading order.
- Test all milestone centers, active labels and rail progress at phone, tablet and laptop widths, including reverse scrolling and resize after partial progress.
- Invalidate cached geometry after actual font/image/layout changes. Do not read every chapter rectangle on every scroll tick or trigger endless refresh loops.
- Fix a reproduced fault only. Do not replace the current Timeline because another section failed.

### Sponsors: preserve readable illustrated cards

- Keep all six slots, past-sponsor logos, selection caption, mascot and divider.
- Keep one column on phones where two would make baked lettering illegible; use the existing fitting tablet/wide arrangement. A single-column phone view is acceptable.
- Reserve room for crowns, info badges, glow and hover extent rather than clipping them at the panel boundary. Keep the selected caption and mascot from covering cards.
- Preserve image aspect ratios and sharpness. Do not upscale small exports and call that a quality improvement.
- Keep the current introduction if its timing is already comfortable. Adjust only if actual playback shows the earlier rushed entrance; preserve readable text throughout.
- Check selection via mouse, keyboard and existing touch behavior. A decorative info badge must not become an invented popup.

**Gate:** Narrow About spacing improves; Timeline and Sponsors retain their accepted visuals and interactions; laptop comparisons reveal no unrelated changes.

## Phase 5 — Prize density and FAQ usability

### Prize / VR

The supplied phone layout preserves prizes, but makes the owner scroll a long distance through isolated medals. Improve the narrow composition while retaining both complete stages.

1. Preserve every approved amount and rank, both characters, the gem accent, stage headers, VR feedback, medals and dividers.
2. For phones, try a compact ranking group: first prize centered, with second and third in the following row. Use this only if the actual artwork, amounts and touch targets remain readable at 320px. Otherwise use a compact one-column fallback with controlled medal sizes and spacing.
3. For VR, keep the two medals side by side when they fit clearly; otherwise stack without unnecessary fixed-height gaps.
4. Give the character and medals separate reserved space. Do not let an entrance offset, pop response or bullet overlay cover rank text or a neighboring control.
5. Preserve blinking at approximately three-second intervals, paired shots from both main-character guns and the matching gold/silver/bronze reactions. Keep muzzle overlays registered to the scaled art.
6. Preserve down/up scroll behavior and VR holographic reactions. Offscreen, paused or hidden-tab effects must stop cleanly without leaving a flash, recoil or hologram stuck.
7. Do not rearrange a balanced tablet/laptop layout merely to make every viewport use the same grid.

### FAQ

1. Preserve the blue panel, orange heading, all four categories, existing copy, remembered open-question behavior and red-X collapse action.
2. On phones, remove the excessive fixed/minimum body height and the large spacer between the question panel and category navigation. Let the existing bottom category controls follow the panel closely in document flow.
3. Keep the category controls within easy reach of the collapsed question group. Fix spacing before adding sticky UI or moving the controls. Do not add a second duplicate tab group.
4. Keep the accepted laptop panel reasonably stable between categories. At narrow widths or increased text size, allow the panel to grow for complete answers. A legitimate content-driven height change is preferable to clipping or a screen of empty padding.
5. Test every answer, including the longest, rapid category switching, open/close during a transition, the red X with no answer open, and motion toggles midway through a transition.
6. Ensure closed answers are not focusable; preserve `aria-expanded`, `aria-controls`, category relationships and correct keyboard behavior. Do not merely remove `hidden` without replacing its accessibility behavior.
7. Do not animate the whole document height or force-scroll on every category click. Keep the reader's current question/header stable where feasible and test scroll anchoring after a category becomes shorter.
8. Refresh scroll-dependent geometry only after meaningful size changes settle. Avoid a ResizeObserver/refresh feedback loop.

**Gate:** All prize information and feedback remain clear; FAQ no longer has the recorded empty gulf on phones; every answer is complete; category switching does not hide rows or cause unexplained page jumps.

Finish Batch B with browser evidence at 320×568, 412×924, 768×1024, 960×1440 and the accepted laptop size. Rebuild production and run the normal code checks. Stop for the planned review boundary.

---

# Batch C — Runtime verification, measured optimization and final audit

Run only after the owner requests Batch C. Preserve the accepted layouts from Batches A and B.

## Phase 6 — Contact, navigation and motion state regression

Contact looks substantially intact in the recordings. Verify it; do not redesign it.

- Check complete names/digits, phone-plate bounds, venue address, heading and map on narrow/zoomed layouts. Retain current `tel:` and map URLs; inspect links without placing calls.
- Keep map loading from shifting the section or trapping an ordinary page scroll. Preserve its actual controls and attribution.
- Verify unique stable SVG IDs in the rendered DOM and no hydration warnings.
- Check smooth Prize/Sponsors anchor navigation, direct hash entry, modified clicks, Back/Forward and repeated clicks. Maintain one document scroller and honor reduced motion.
- Test motion ON → OFF during an entrance, hover, shot and scroll transition; OFF → ON afterward; live OS reduced-motion changes; and hidden-tab restoration after at least several seconds.
- Ensure essential content is visible when motion is disabled. Resume ambient animation safely without replaying every entrance, accumulating callbacks or restoring stale pointer transforms.
- Keep sound muted until enabled. Check muted/unmuted behavior, effect rate limits and hidden-tab restoration without an audio burst. Audio failure must not open a popup or break input.

## Phase 7 — Optimize demonstrated bottlenecks and finish safe cleanup

1. Measure the **production** site using matched browser, hardware, viewport, DPR, cache and throttle settings. Include first load and repeat scrolling/interaction.
2. Record actual image/JS/CSS requests and transfer, layout shifts, long main-thread tasks and the dominant animation/paint work. Use before/after traces for a meaningful change. Do not substitute compile time or deleted-file counts for runtime evidence.
3. Fix the measured bottleneck. Likely candidates to inspect include oversized canvas resolution, repeated offscreen loops, expensive large-area blur/filter painting, per-event tween allocation, duplicated asset loading and unnecessary state updates. Do not declare them causes without profiling.
4. Prefer transform/opacity for continuous motion where appropriate. Apply `will-change` narrowly after measurement; adding it to every object is not a blanket optimization.
5. Use one bounded animation/pointer owner per effect. Pause offscreen loops and clean up RAFs, observers, timers, media listeners and GSAP contexts. Do not add a perpetual layout-measurement loop.
6. Check responsive image delivery, accurate `sizes`, intrinsic dimensions, transparency and high-DPR quality. Lazy loading alone does not reduce the bytes of an oversized image once it is requested.
7. Keep critical above-the-fold artwork eager where justified. Avoid preloading every image. Confirm fonts retain their intended shape/weight and licensing.
8. Delete only proven dead code/assets. Trace CSS URLs, data manifests, dynamic animation frames, metadata, PDF links and SVG references. Preserve source art and live divider CSS. Do not remove a file because its name looks generated.
9. Keep changes small and causally justified. No framework replacement, breaking dependency upgrade, blanket memoization, extra scroll engine, unnecessary worker or unexplained Python runtime pipeline.
10. Record each meaningful removal and measured improvement in the existing report. Keep screenshots, traces and local recordings outside `public` and out of the shipped runtime.

## Phase 8 — Final responsive and behavior matrix

### CSS viewport coverage

| Group | Sizes |
| --- | --- |
| Small / standard phones | 320×568, 360×800, 375×812, 390×844 |
| Exact recorded phone cases and larger phones | 393×852, 412×924, 414×896, 430×932 |
| Small / portrait tablets | 600×900, 768×1024, 820×1180, **960×1440** |
| Landscape / small laptop | 1024×768, 1280×720, 1366×768 |
| Accepted laptop / desktop | 1440×900, 1536×730, 1920×1080, 2560×1440 |
| Short landscape | 844×390 |

Also test one pixel below/at/above each actual composition breakpoint, live resizing through them in both directions, portrait/landscape changes without reload, representative DPR 1/2/3, and 125%/150%/200% browser zoom or text enlargement. These are separate dimensions of testing; do not treat DevTools' preview scale as page zoom.

### State coverage

For all seven sections, inspect settled layout and boundary continuity. Exercise the following combinations at representative phone, tablet and laptop sizes:

- Fresh load at the top and direct section-hash entry.
- Slow scrolling down, scrolling back up, and rapid down/up reversal.
- Motion on, user-paused and OS reduced motion, including changes during an effect.
- Mouse hover/focus, keyboard-only navigation and touch/coarse-pointer behavior.
- Home maximum character/prop motion extents; every Sponsor selection; each main/VR prize reaction; every FAQ category and answer; Contact controls.
- Long FAQ answer, rapid category switching and loading fonts/images after the initial layout.
- Background tab and restore; repeated interaction and at least several complete scroll passes.
- Console errors, failed requests, hydration warnings, visible clipping, unwanted page overflow, hit-target occlusion, duplicate IDs and focus visibility.

Use Chromium plus available Firefox/WebKit testing. Label browser-engine emulation accurately. A real Android/iPhone check remains valuable: desktop device mode does not reproduce every mobile browser or hardware behavior. If no real device is available, record **NOT TESTED** and give a simple owner check; do not block independent repairs or claim the device passed.

### Evidence format

Keep one compact result table in `docs/optimization-report.md`:

`case | build/time | CSS viewport/DPR/zoom | browser/device | tested state | PASS/FAIL/NOT TESTED | evidence/reason`

Record screenshot/recording paths outside the runtime. Use actual captured outputs. Do not fabricate files, screenshots, trace measurements or test counts. If browser tooling is unavailable, finish implementable fixes and provide exact manual reproduction steps with those checks marked NOT TESTED.

Run the existing TypeScript check, production build, any meaningful runtime/asset validation and `git diff --check`. Inspect the diff for accidental artwork, copy, amount, link, font or unrelated layout changes. A security audit, if run, is a separate result and does not certify visual quality.

### Final handoff requirements

Return a short summary of repaired root causes, changed files, verified laptop preservation, per-viewport/state results, measured performance changes, limitations and local review commands. Report unverified cases explicitly. Keep working code ready for review without committing, pushing, merging or deploying automatically.

Do not finish with “all stages complete” while the supplied phone/tablet defects remain reproducible.

---

## Official implementation references

Consult these for API behavior; use the project's installed versions and instructions for the actual implementation:

- CSS viewport units and their sizing tradeoffs: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length>.
- Device Mode, viewport/DPR controls and emulation limitations: <https://developer.chrome.com/docs/devtools/device-mode>.
- GSAP responsive setup and cleanup: <https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>.
- Animation rendering cost and targeted layer promotion: <https://web.dev/articles/animations-guide>.

## Start now

Execute **Batch A, Phases 0–3 only**, against the existing working tree. Repair and verify Home at the exact recorded phone/tablet sizes, preserve the accepted laptop design and all neighboring sections, and return the required evidence before expanding the scope.
