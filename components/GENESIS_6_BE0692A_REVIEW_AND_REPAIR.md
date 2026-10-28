# Genesis 6 — Code Review and Antigravity Repair Instructions

Reviewed 28 October 2026.

Repository: <https://github.com/abhisheksinghapsb-gif/alone>

Branch: `optimization/responsive-cleanup`

Reviewed commit: **`be0692a16542e2cf56e0281f80909f0165eb0162`**

## Review conclusion

The project builds and has its seven sections and required assets. Its current visual verification does not justify an all-PASS report. There are confirmed Home geometry defects and a reproduced motion-pause defect. The supplied screenshots also capture an unfinished entrance, which makes the missing Register button look like a permanent layout failure.

Keep the existing stack and artwork. The necessary work is a targeted repair of layout relationships, motion state and verification, followed by a small cleanup. A replacement website or another broad redesign would expand the problem.

No application source was changed or pushed during this review. The reviewed checkout was kept separate from earlier local experiments.

## What was verified

| Check | Actual result |
| --- | --- |
| Remote branch SHA | Matches the supplied `be0692a16542e2cf56e0281f80909f0165eb0162`. |
| Clean dependency installation | `npm ci --no-audit --no-fund` succeeded. |
| Existing `npm run lint` | Passed. This script runs `tsc --noEmit`, not ESLint. |
| Production build | Passed on Linux with the locked Next.js 16.4.3 installation. Compilation reported 4.7 seconds; this is not a runtime-performance benchmark. |
| Additional unused-code check | Failed only for three unused bindings in `TimelineChapter.tsx`: `isPulsing`, `motionPaused`, `isHighlighted`. |
| Production dependency audit | `npm audit --omit=dev --json` reported zero known vulnerabilities. This is a dependency-advisory result, not a general security certification. |
| Literal local asset references | 102 distinct literal `/assets/`, `/documents/` and `/fonts/` references checked; no missing files found. This is not an exhaustive proof for every dynamically constructed path. |
| Settled Home Register | Observed with effective opacity 1 and its image loaded after the entrance completed. Its parent had opacity 0 in an earlier observation. |
| Actual Prize navigation | Activating the real header link reached `#prize-pool`; the section top was approximately 0px after scrolling. |
| Alternate anchors | `#about-genesis` / `#about` and `#prize-pool` / `#prizepool` are preserved using aliases. The original links are not broken by this naming difference. |
| Sponsor selection | Six slots present. Keyboard selection of Event Partner updated its pressed state, deselected Title Sponsor, and updated the caption. |
| FAQ interaction | Prizes category and one expanded answer worked. All thirteen answers and every rapid-switch combination were not exhaustively exercised. |
| Repeated inline SVG IDs | No duplicates found in the rendered inline SVG ID sample. |
| Portrait and short-landscape Home | The supplied occlusion failures were reproduced. |
| Motion pause | A Prize idle loop restarted on section entry while `data-motion-paused` remained `true`. |

Browser review used the unchanged production build in Chromium through an isolated review harness. Selected CSS viewport sizes were inspected at DPR 1; the harness also allowed a live frame resize. This is not a claim of real-phone, Safari, Firefox, high-DPR, or complete viewport-matrix verification. Tool/extension errors were not treated as application defects. Target-device FPS, long-task traces and audio playback were not benchmarked.

## Confirmed findings, in priority order

### R1 — Home artwork is anchored independently from the foreground

**Priority: high. Evidence: source, supplied screenshots and browser reproduction.**

Files: `components/landing/landing.css`, especially the portrait rules around lines 924–987 and short-landscape rules around lines 1212–1274.

The portrait repair bottom-anchors the floor, but character bases still use viewport-height-derived offsets. These are not a shared rail reference. The floor height depends on the image width/aspect ratio; character placement depends on unrelated `vh`/pixel values. Moving only the floor to `bottom: 0` therefore does not preserve visible faces and weapons.

The short-landscape case is particularly clear. At an 844×390 CSS viewport, with 834px content width:

- Scene: top 0, bottom 390.
- Foreground: top approximately 176.9, bottom 390, height approximately 213.1.
- Gunslinger: top approximately 272.3, bottom 382, opacity 1.
- Ninja: top approximately 262.9, bottom 382, opacity 1.
- Moon: top approximately 264.1, bottom 378, opacity 1.

The foreground has the higher stacking order and covers these objects. They are present and opaque; their absence is not a loading issue. A bounding-box existence check cannot detect this.

The short-height media query also has no width limit. It can affect a wide, short desktop window as well as a phone. Test such windows instead of assuming this is only a mobile preset problem.

At 1366×768, the supplied screenshot shows the moon's straight lower edge above the curved rail. This is another consequence of independent vertical placement. Conceal the moon's intended cut edge behind the opaque part of the rail across its width.

**Repair:** establish one local scene/ground reference that controls foreground height, character bases, moon cut edge and grounded props. Allow short viewports to scroll through a coherent scene rather than forcing everything into a 390px-tall clipped canvas. Preserve the laptop arrangement and intended concealment of lower torso cut edges. Do not raise the characters above the foreground with an arbitrary z-index.

Source: <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/landing/landing.css#L924>

### R2 — The verification scripts can pass invisible or obstructed content

**Priority: high. Evidence: source and supplied results.**

In `scripts/verify-batch-a.js`:

- Line 144 waits a fixed 1800ms after navigation.
- Lines 149–153 read rectangles without checking visibility, loaded images or ancestor opacity.
- Line 248 declares PASS using only page overflow, nonnegative navigation clearance and Balloon/Ninja rectangle overlap.
- The calculated character gap and foreground position do not participate in that PASS decision.
- There is no check that the foreground visually conceals essential character features.
- A failed case is collected as data but does not cause a failing process exit.

In `hooks/useLandingMotion.ts`, the normal entrance totals approximately **2.52 seconds after setup**. Register starts near 1.92 seconds. The screenshot job can therefore capture a deliberately hidden CTA before its animation starts. Navigation and the badge are also staged late. After the sequence completed, Register and navigation were visible in the review browser.

Do not “repair” a capture-timing failure by deleting controls, permanently disabling motion or applying a global opacity override. Fix the readiness checks and separately test early/paused entrance states.

`scripts/verify-interactions.js` also checks only each element's own opacity. A button can have opacity 1 while its parent `#register-layer` has opacity 0. Its motion test clicks twice in one evaluation and mainly checks the data attribute; it does not demonstrate that the underlying animations stopped. Errors are logged without a reliable nonzero exit.

**Repair:** wait for actual page/image/font readiness and a bounded settled entrance condition. Check the effective visibility of essential elements through their ancestors, active clip regions and real hit targets. Inspect screenshots for transparent artwork and curved foreground masks. Check temporal behavior, not just a pause flag. A missing element, broken image, failed assertion or test error must fail the command. Report unavailable checks as NOT TESTED.

Sources:

- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/scripts/verify-batch-a.js#L142>
- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/scripts/verify-batch-a.js#L248>
- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/hooks/useLandingMotion.ts#L79>

### R3 — Pause and visibility state do not consistently control GSAP work

**Priority: high. Evidence: browser reproduction plus source.**

In `components/prize-pool/usePrizeMotion.ts`, the setup effect depends only on `sectionRef`, while its scroll and visibility callbacks capture the initial `motionPaused` value. The later pause effect stops idle tweens, but a subsequent section-entry callback can restart them using the old false value.

Reproduction: pause on Home, then activate Prize navigation. The document remained `data-motion-paused="true"`, yet two observations showed the Cowboy idle transform changing from approximately -1.4936px to -2.7173px, and Buzz from approximately -2.4626px to -1.3059px. These are ambient loops restarting despite the pause state.

Related source problems to repair in the same lifecycle pass:

- Home pause/resume helpers operate on idles and comets but do not control the entrance timeline stored in `masterTimelineRef`. A mid-entrance pause needs an explicit readable final state.
- Home and About entrance setup sample reduced motion once. A live preference change cannot safely depend on that old snapshot.
- `LandingExperience.tsx` uses one state for user pause and the OS preference, allowing a preference change to overwrite the user's choice.
- Prize visibility restoration and its pause effect can resume idle work without checking whether the section is visible.
- Sponsors/FAQ/Contact recreate entrance effects when pause changes. Preserve the intended entrance/reverse behavior instead of making every control change replay an introduction.

**Repair:** compute an effective pause from independent user intent and live reduced-motion preference. Use current values in callbacks. Ambient work may run only when motion is allowed, the document is visible and its section is active. Maintain one owner for each tween/RAF/timer. Keep functional reading progress and accessible content available while decoration is paused.

Source: <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/prize-pool/usePrizeMotion.ts#L212>

### R4 — FAQ spacing is imposed by fixed minimums and distributed free space

**Priority: medium. Evidence: source, video and rendered measurements.**

`FAQSection.module.css` uses `min-height: 100vh` and `justify-content: space-between` on the section. The mobile panel body retains `min-height: 380px` even for a two-question category. In the phone review, the Prizes rows occupied approximately 182px, the body occupied 380px, and the gap between the panel and category controls was approximately 222px.

Closed answer drawers also retained approximately 20px of height because the direct Grid child has vertical padding. A 0fr track does not remove that padding contribution.

**Repair:** keep the accepted desktop panel stable, but use content-led narrow layouts and a bounded normal gap before category controls. Place answer padding inside a proper inner content wrapper so a closed drawer can actually collapse. Preserve visibility/focus semantics, full answer text, all four categories and the existing design. Do not add a second tab group or a popup.

Source: <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/FAQ/FAQSection.module.css#L7>

### R5 — Timeline badge, connector and marker use inconsistent geometry

**Priority: medium. Evidence: source and rendered measurements.**

`TimelineSection.tsx` measures the center of each `.nodeWrapper`, not the actual milestone button. The wrapper stretches to chapter height and has top padding. The actual badge center was approximately 12px below the measured wrapper center. Meanwhile `.connectorBeam` uses a fixed top offset around 52px; its center was approximately 151–158px above the badge in the reviewed layout.

The marker/progress transforms also have two writers: scroll updates write them directly, while JSX writes transforms derived from `activeStageIndex`. A React state update can overwrite a continuous position with a discrete stage position.

**Repair:** retain the vertical design and artwork. Measure the actual badge centers; align connectors to those same anchors; give continuous marker/progress transforms one owner. Recompute geometry after relevant size/font changes. Preserve reverse scrolling and functional progress with decoration disabled.

Sources:

- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/timeline/TimelineSection.tsx#L54>
- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/timeline/TimelineSection.tsx#L405>
- <https://github.com/abhisheksinghapsb-gif/alone/blob/be0692a16542e2cf56e0281f80909f0165eb0162/components/timeline/timeline.module.css#L354>

### R6 — Cleanup remains, but it is smaller than the visual failures

**Priority: lower. Evidence: source and compiler check.**

- Remove the three proven unused TimelineChapter bindings after tracing their callers. If a pulse state/timer exists solely for the unused prop, remove that dead path too.
- Consolidate repeated hand-written CDP plumbing if retained. Use an explicit base URL and an isolated test browser; do not attach to an arbitrary existing tab on a fixed debugging port.
- Retire or rewrite `scripts/test-ninja-hover.js`. It searches for the obsolete `#leon-hover-popup` and labels the screenshot “popped”, while the current Home Ninja must remain plain.
- Keep supplied source artwork. `components` occupies roughly 120MB because it includes design exports; that is not the same as browser download size. `public` is roughly 7MB, including a roughly 1.75MB brochure requested separately.
- Responsive image variants, font delivery, canvas resolution and offscreen effects deserve measurement. They are not an explanation for the confirmed geometric occlusion, and no target-device performance trace was collected during this review.
- In `uiAudio.ts`, review context creation outside error guards, missing voice-limit checks on some paths, and resetting voice counts while suspended nodes remain scheduled. These are source-level lifecycle risks, not confirmed audible failures from this review. Verify before making a “no audio burst” claim.

## Copyable Antigravity implementation instruction

The following is the complete task. It supersedes the old all-PASS execution assumptions, while preserving the existing design and seven-section scope.

```text
Repair the existing Genesis 6 project in G:\alone using the independently reviewed commit be0692a16542e2cf56e0281f80909f0165eb0162 as the reference.

Read AGENTS.md, the current source and GENESIS_6_BE0692A_REVIEW_AND_REPAIR.md completely. Inspect the actual current branch/HEAD and preserve any newer work; do not reset to the reference commit.

Keep the installed stack, lockfile, all seven sections, dividers, approved artwork/copy, both Prize tracks, navigation aliases, brochure new-tab behavior and current unconfigured Register action. Preserve the accepted laptop design. The Home Ninja stays plain and stationary. Do not add features, popups, a menu, a loader, generated video or a new animation/scroll engine.

Work sequentially with one writer. Complete and verify each step before expanding the change surface. Do the implementation, not merely a plan. Fix introduced regressions before advancing.

1. Make verification truthful first.
Inspect scripts/verify-batch-a.js and verify-interactions.js. Replace the fixed 1800ms capture assumption with bounded readiness checks. The Home sequence currently lasts about 2.52s after setup; Register begins near 1.92s. Check image loading, fonts, ancestor opacity/visibility and settled content. The button's own rectangle or opacity is insufficient. Test actual pause behavior over time. Make assertion errors and failing cases exit nonzero. Preserve historical evidence and append a corrected result; do not relabel broken states PASS. Retire the obsolete Ninja pop test instead of adding that effect back.

2. Repair Home geometry as one scene.
In landing.css/ArenaScene.tsx, relate the foreground, character bases, moon cut edge and grounded props to one local ground reference. At 844x390 the foreground occupies approximately y177-390 while both characters occupy approximately y263-382, so it conceals them despite opacity 1. Portrait tablets also conceal essential character features. Do not fix this with higher character z-index or another independent bottom percentage. Permit a taller scrollable scene on short screens. Check the short-height rule's effect on wide desktop windows too. Conceal the moon's straight base behind the curved rail at 1366x768. Preserve proportions, complete faces/weapons, header spacing and laptop hierarchy; allow intentional lower-torso occlusion. Keep maximum hover/parallax/recoil extents safe.

3. Repair the motion lifecycle.
Separate user pause from live OS reduced motion. Current scroll/visibility callbacks must read current state, not a captured initial motionPaused. In particular fix usePrizeMotion.ts: its callbacks restart idles after the user pauses. Gate all repeated work with effective motion permission AND visible document AND active section. On pause during an entrance, show a complete readable resting state. Do not replay all introductions on pause/resume or resize. Keep one transform owner for layout, entrance, ambient and interaction layers. Preserve falling stars/comets, fixed-axis planet rotation, stationary Telescope, non-clickable Balloon, plain Ninja, blinking, both-gun prize shots, rank colors and VR feedback.

4. Repair FAQ proportions without redesigning it.
On phones remove the unnecessary full-viewport space distribution and the 380px panel minimum for a two-question category. Keep category navigation close to the panel in normal flow. Fix the closed Grid drawer's residual padding height with an appropriate inner wrapper. Retain desktop stability, all questions, accessibility and interruption-safe transitions. Test every category, longest answer, rapid switching, red-X collapse and pause mid-transition.

5. Repair Timeline alignment without replacing its design.
Measure actual milestone buttons instead of stretched node wrappers. Align connector centers with the badges; current connectors can be about 150px above them. Give marker/progress transforms one owner instead of JSX and direct scroll writes competing. Invalidate geometry on relevant resize/font/content changes. Preserve vertical chapters, reverse motion, keyboard navigation and functional reading progress while decoration is paused. Remove the three proven unused TimelineChapter bindings and any genuinely dead caller state.

6. Complete a narrow cleanup and regression pass.
Preserve the working Sponsor selection/cards, About panel/glow, Prize/VR behavior and Contact details. Improve About or Prize spacing only where an actual responsive defect remains. Review audio error/voice/visibility cleanup without introducing new cues. Delete only proven unused files or code after tracing dynamic paths; retain source art and live divider rules. Measure production bottlenecks before changing image/font/canvas delivery. Do not claim smoothness from compilation time or file-count reductions.

Verify Home at 320x568, 393x852, 412x924, 768x1024, 960x1440, 1024x768, 1366x768, 1536x730 and 844x390. Also check a wide short window such as 1280x450, actual breakpoint boundaries, live resize in both directions, and representative zoom. Scroll all seven sections down and back up. Exercise pause before/after section entry, reduced motion, hidden-tab restoration, Sponsor selection, Prize/VR reactions and FAQ switching. Keep browser/document scrolling natural. Essential content must be visible and reachable; intentionally scrollable content need not all fit in one short viewport.

Rebuild and restart the production preview after source changes. Run the existing TypeScript check, production build, meaningful browser/asset checks and git diff --check. Return actual screenshots after readiness, concise before/after findings, changed files, command results, and a per-case PASS/FAIL/NOT TESTED table. Mark real-device, browser-engine and performance checks that could not be performed as NOT TESTED. Do not invent measurements or claim all-platform perfection.

Leave the result ready for local review. Do not commit, push, merge or deploy automatically. Do not stop after a successful build if the visual failures remain.
```

## Owner handoff after implementation

Review the repaired Home first at the exact failed sizes, then FAQ and Timeline. If the screenshots or interactions still fail, retain the failure status and repair that cause before accepting the result. Once the changes are ready for another code review, push the review branch and share its exact new commit hash and report. Keep `main` unchanged until the reviewed result is accepted.
