# Genesis 6 — Sponsors, Prize characters and social footer

Prepared 28 October 2026. This revises the earlier repair prompt around the newly available spoken website review.

## What was reviewed

**Screen Recording 2026-10-28 233925.mp4** was available and inspected across its approximately 115-second duration. Its audio was transcribed locally using the downloaded decoder with the optional telemetry-enabled speech-detection runtime excluded. The decoder did not load ONNX Runtime, and its Python socket audit recorded no network events. The video shows Sponsors compared with Figma, sponsor hover behavior, the approved FAQ/Contact sections, and the Prize characters.

The earlier available **Screen Recording 2025-08-26 234812.mp4** is a silent solar-system animation, already inspected. It supplies a separate motion reference. This spoken review adds no new landing-planet composition request.

**20261028-1803-08.8928536.mp4** and **Screen Recording 2026-10-28 233611.mp4** were unavailable and were not inspected. Upload working copies to cover any requests unique to them.

## Requests mapped to evidence

| Time in the website recording | Request |
| --- | --- |
| 0:00–0:11 | Restore the complete Sponsors title, matching the Figma lettering. |
| 0:11–0:23 | Add restrained heading-icon movement/pop; enlarge GameCloud and Gamedoora and give their plates a border glow. |
| 0:23–0:41 | Remove the splash/wipe shine; use the approved About panel border-glow style as a reference. |
| 0:41–1:06 | Fix rising/overlapping glow and improve the Sponsors design and motion substantially. |
| 1:06–1:14 | FAQ and Contact are approved; preserve their design. |
| 1:14–1:43 | Add a small Buzz hop and natural, limited left/right character movement in Prize Pool. |
| 1:43–1:55 | Deliver detailed instructions executed step by step and page by page. |
| User's written request | Add the reference project's Instagram and LinkedIn links to the main project. |

## Concrete source finding

The previously reviewed source contains **public/assets/genesis/sponsors/sponsors-heading.svg** with viewBox **0 0 327 50**. Its path bounds, measured using an SVG path parser, extend from y=13.624 to **y=59.64** with no transforms or clip paths. The viewport therefore excludes the lower 9.64 units of the lettering. The available recording visibly shows a flat cut across the title's lower edge. Antigravity must confirm the live file matches and repair the asset bounds plus intrinsic dimensions; surrounding CSS padding alone cannot restore intrinsically clipped paths.

The current Windows implementation has not been independently edited or built here. Code-path observations from an older reviewed source are diagnostic leads to confirm locally, not a certification of the current working tree.

## Verified reference for social links

Reference HEAD/main was verified as **a83d690326868542116792f193aa06780b675be1**. Its Contact component contains:

- Instagram: https://www.instagram.com/gdxr_ait/
- LinkedIn: https://www.linkedin.com/company/87215024/

Source: https://github.com/vaman-dev/Genesis/blob/a83d690326868542116792f193aa06780b675be1/app/components/ContactSection.tsx

## Copy the task below into Antigravity

Continue the existing Genesis 6 project at G:\alone. Work on the current intended branch and preserve all uncommitted repairs. “Main project” means this project, not permission to switch to or overwrite Git main.

Use the current stack, lockfile, original artwork, and motion controls. Complete one section and verify it before moving to the next. The scope is a substantial Sponsors improvement, natural movement for the Prize Pool characters, and Instagram/LinkedIn links in the Contact footer.

The spoken review explicitly approves FAQ and Contact. Preserve their design, and add only the requested social footer to Contact. Keep Home, About, Timeline, Memories, the existing dividers, navigation, prize amounts, and accepted interactions intact. This pass adds no new homepage/solar-system composition.

1. Establish the live baseline

Read AGENTS.md and relevant installed framework guidance. Record the current branch, HEAD, git status, preview URL, and files owning these sections. Inspect the live implementation rather than assuming an earlier review copy is current.

If another agent owns a file required here, coordinate ownership and serialize that file's edits. Keep independent changes from overwriting each other.

Use Screen Recording 2026-10-28 233925.mp4 for the spoken requirements and Figma comparison. Its key requests are: complete Sponsors title; animate the heading icons; larger past-sponsor logos with border glow; remove the splash/wipe effect; fix glow drifting/overlap while scrolling; improve the Sponsors composition; add a modest Buzz hop and natural character movement to Prize Pool.

The solar-system reference was a separate motion reference. The files 20261028-1803-08.8928536.mp4 and Screen Recording 2026-10-28 233611.mp4 were unavailable to the reviewer. Any requests unique to those files remain pending unless a working copy is supplied and inspected locally. Do not claim that every recording has been covered.

Capture baseline laptop views and the relevant hover/scroll behavior before editing.

2. Rebuild the Sponsors presentation from the approved design

Use the supplied Figma design and existing original assets as the visual foundation. The recording shows the Sponsors frame in Figma. Preserve the cosmic navy/blue background, white SPONSORS heading flanked by the crowned icon and credits chest, a royal-blue Past Sponsors panel on the left, and six illustrated sponsor cards on the right. Keep the green, purple, and red top-row roles and the existing lower-row content. Keep the small Spike accent.

Improve proportion, hierarchy, spacing, readability, and polish within this composition. It should feel like a finished game-themed partner showcase. Avoid extra invented marketing copy, counters, panels, generic interface furniture, or new popups.

Fix the cut heading at its source. In the reviewed source, public/assets/genesis/sponsors/sponsors-heading.svg has width 327, height 50, and viewBox 0 0 327 50. Its untransformed path bounds reach y=59.64, so the lower portions of the letters fall outside its viewport.

Confirm whether the live asset matches. If it does, expand its bounds with appropriate padding; a height/viewBox height around 64–66 is a reasonable starting point after checking all paths/strokes. Update the corresponding intrinsic dimensions in data/sponsorsData.ts and any fixed-height wrapper assumptions. Let the heading retain its correct aspect ratio and complete silhouette. CSS padding around an intrinsically cropped SVG will not restore the missing letter portions. If the live source differs, identify and fix the actual clipping source.

Keep the title legible at rest, during entrance, and while scrolling. Never solve clipping by shrinking the entire section or obscuring it with a mask.

Make GameCloud and Gamedoora visibly larger. Aim for approximately 35–45% more visible logo width than in the recording, then adjust for balance. Their plates should use roughly 75–85% of the Past Sponsors panel's usable width where the viewport permits. Check the visible logo artwork itself, including baked-in asset padding.

Preserve brand proportions and spelling. Use object-fit:contain and the best existing source asset. Do not regenerate brand logos, distort them, or enlarge a small blurred copy unnecessarily.

Give the Past Sponsors header, plates, and surrounding padding a deliberate rhythm. On laptop, retain the left-panel/right-board relationship; on narrow displays, use a readable stacked layout with an appropriate card grid. The full title, all six cards, logos, and Spike must remain reachable. Allow natural page scrolling on short screens rather than squeezing the section into a fixed height.

Reserve a modest area for Spike and the existing selection caption if it remains useful. Remove accidental dead space and resolve overlaps without expanding the board into another empty panel.

Verify the static design before adding the revised motion.

3. Replace the Sponsors effects with controlled, coherent motion

Remove the broad splash, wipe, gloss, and light-sweep behavior identified around the past-sponsor logos in the recording. Inspect the actual live effect and all owners: it may involve a sheen layer, repeated gradient animation, transition, or duplicate hover rule. Remove obsolete code for that effect after checking its references.

Use the approved About text-panel border glow as a visual reference only. Keep About unchanged. Give the past-sponsor plates a crisp border with a soft, restrained cyan glow and a slightly stronger hover/focus state. Animate border intensity/opacity smoothly instead of sweeping a white band across the logos.

For illustrated sponsor cards, keep accent-colored light close to each card's angled perimeter. Prefer the existing perimeter SVG/path when available. A small local halo should support the outline; it must not wash over neighboring text, cards, the heading, or the section above.

Fix the upward-drifting or detached glow seen during scrolling. Inspect coordinate calculations, positioned ancestors, transforms, stale hover state, and any fixed/portal effect layer. Anchor effects to their own card or plate. If a pointer-following effect remains, convert viewport coordinates to the current element's local coordinates correctly and clear it when the pointer is no longer over that element.

Test by hovering a card and scrolling it away while keeping the pointer still. Its light must remain attached or clear correctly. Avoid a lingering hover state on a departed card. If selection is persistent, keep exactly one selected card and distinguish it subtly from temporary hover feedback.

Animate the crowned heading icon and credits chest with small, asynchronous movement. Suggested range: 2–4px float or 1–2 degrees of gentle sway over roughly 5–8 seconds. Add a brief, restrained pop of approximately 1.03–1.05 scale on pointer entry, returning smoothly to rest. Do not turn decorative icons into fake buttons with no action.

Keep card interaction responsive: approximately 2–4px lift, about 1.01–1.02 scale, and minimal tilt where useful. Preserve stable hit targets so moving the artwork does not cause repeated pointer enter/leave flicker.

Use a short, readable section entrance instead of a fast flash. Keep text readable throughout; stagger cards gently, with a total sequence around one second rather than a long series of hidden elements. Re-entering or reversing scroll must not replay a violent splash or leave content invisible.

Use separate layers for layout, entrance, idle, and hover/selection transforms. Scope GSAP targets to actual refs or stable data attributes; CSS Module class names must not be queried as plain global classes.

Pause idle effects when the section is offscreen, the tab is hidden, or effective motion is paused/reduced. Preserve the existing user-pause and OS-preference behavior. Clean up only effects owned by this section. Keep sound under the existing control and avoid idle-triggered audio.

Finish and browser-verify Sponsors before proceeding.

4. Add natural movement to the Prize Pool characters

Preserve the main/VR prize layout, medal artwork, ranks, amounts, existing hover feedback, three-second blinking, and the main character's two-gun colored shots.

For Buzz in VR, add an occasional small hop or buoyant lift rather than constant bouncing. Start with approximately 6–10px displacement, adjusted to the rendered character size, and allow several seconds of rest between hops. Use anticipation, a short lift, a clean landing, and a calm settle. Keep feet aligned with the stage on landing and animate the contact shadow consistently.

For the cowboy, add a subtle left/right weight shift and attention change. Use a small grounded lean, approximately 1–2 degrees around an appropriate lower-body pivot, with only a few pixels of translation over an unhurried cycle. Give Buzz a similarly modest directional shift where it fits his hop sequence.

The requested result is natural, limited motion. A flat sprite cannot reveal a new side of a body without additional artwork. Use a convincing small lean/pose shift with existing assets rather than pretending a flat card is a rotating 3D character. Avoid mirroring the whole sprite, large perspective flips, distorted faces, rubbery stretching, or generated morphing.

Apply these effects on dedicated wrappers. Keep blink artwork aligned with the face. Keep recoil and both muzzle effects attached to the moving guns. One transform owner must not erase another's motion.

On hover/focus, allow a small attention response without restarting the whole idle cycle. Preserve current medal-triggered shot colors and their cooldown. Stop new idle motion while the relevant stage is offscreen, the tab is hidden, or effective motion is paused/reduced; resume without a jump or burst of queued animation.

Recheck gunfire during a lean, blinking during a hop, rapid pointer movement, and repeated scrolling. Keep the complete character and effects inside the intended stage area with adequate headroom. Do not add auto-firing or new audio for these idle poses.

5. Add the reference Instagram and LinkedIn footer

Use https://github.com/vaman-dev/Genesis as the reference. The verified revision is a83d690326868542116792f193aa06780b675be1.

Read its app/components/ContactSection.tsx and the social-footer portion of app/components/contact-section.css. Copy/adapt only the small social SVG icons, labels, link behavior, and necessary styling.

Use these exact destinations:
- Instagram: https://www.instagram.com/gdxr_ait/
- LinkedIn: https://www.linkedin.com/company/87215024/

Add one copy of each link below the existing Contact/venue content, using the dark-blue closing strip as a visual starting point. Keep the existing Contact page and map/telephone behavior.

Use real anchors with target="_blank" and rel="noopener noreferrer", visible INSTAGRAM/LINKEDIN labels, accessible names, an accessible new-tab indication, and a clear keyboard focus outline. Mark decorative icons aria-hidden.

Keep icons approximately 22–24px and tap targets at least 44px high. Center the pair on laptop and allow wrapping on narrow screens. Use the page's navy styling, white labels, restrained yellow hover/focus accents, and a small optional lift that respects paused/reduced motion.

The footer must participate in normal document flow and remain above background overlays. Inspect the live closing strip: the older implementation was absolute, decorative, and pointer-events:none. Functional links must not inherit those inert/clipped-layer constraints.

Keep the links usable before animations initialize. Use standard external links; no social embeds, extra packages, login widgets, or additional popups. Preserve required attribution for copied source.

6. Validate and hand off the completed local changes

Use the actual production build for final browser checks. Start at 1536×730 and 1366×768, then check 320×568, 393×852, 412×924, 768×1024, 960×1440, 1024×768, 844×390, and 1280×450. Include fresh loads, resizing, and both scroll directions.

Verify the complete title, enlarged readable logos, all six cards, absence of the removed wipe/splash, attached and contained glow while scrolling, heading-icon movement, natural Prize poses, aligned blinking and both-gun effects, working social anchors, and no horizontal overflow or clipped content.

Recheck Home navigation/Register visibility, About, vertical Timeline, Memories, FAQ, Contact, brochure new-tab behavior, sound, and motion controls for regressions introduced by this work. Preserve their current accepted design.

Run the project's actual type/check script and production build. Missing targets, runtime errors, broken images, clipping, detached effects, and hidden content must be reported as failures. Passing a build or checking that a class exists does not establish visual correctness. Report untested browser engines and physical devices honestly.

Save concise notes to docs/review/sponsors-prizes-socials-repair.md with the baseline commit, diagnosed causes, changed files, asset-bound correction, reference revision/social URLs, before/after capture paths, actual results, pending unavailable-video requests, preview URL, and final git status.

Complete the local implementation without pausing for approval after each routine step. Leave it ready for visual review. Keep unrelated cleanup, dependency upgrades, commits, pushes, merges, and deployment outside this task.

