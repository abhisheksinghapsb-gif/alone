# Genesis 6 — Complete outstanding work

Updated 31 October 2026.

## Why this replaces the previous prompt

The previous prompt focused on Sponsors, Prize character motion, and social links. It left earlier Memories and landing-planet repairs outside the implementation scope and treated them as regression checks. This continuation gives all known relevant requirements numbered completion criteria while preserving sections already approved.

The actual recent Antigravity output and local Windows working tree have not been supplied. This document therefore does not claim to identify every current visual defect. On 31 October, the pushed optimization/responsive-cleanup branch was still at a9c1f71af6e5dc340fbb827a68507341691b072d. New local work cannot be verified from that checkpoint. The prompt requires the agent with access to G:\alone to inspect its current implementation, repair failures, and return evidence for each item.

The earlier available website recording 233925.mp4 and solar-system reference were inspected in this conversation. The two unavailable recordings named below were not inspected; their unique requests cannot honestly be marked covered. This revision does not infer a full Sun-and-orbiting-planets homepage from the silent reference; it restores the user's explicit surface-spin/fixed-rings requirement.

No website source has been modified as part of preparing this prompt.

## Copy everything below into Antigravity

Finish the outstanding Genesis 6 work in the existing project at G:\alone. This is an implementation task: edit the source, run the site, repair the visible failures, and verify the result. An audit, plan, checklist, or report by itself is not completion.

Preserve the current branch, dirty work, installed stack, lockfile, original assets, and accepted design. Read AGENTS.md and inspect the actual local source. Record the branch, HEAD, git status, preview URL, and baseline captures. Do not assume the local project still matches an older pushed commit.

Use one agent to execute the stages in order. If another agent is already editing a shared file, coordinate ownership before modifying it. Complete and verify one section before continuing.

Create one working checklist at docs/review/genesis-completion.md. Record each requirement below, its implementation files, browser evidence, and VERIFIED or BLOCKED status. Update it after each stage. An existing implementation may be retained only after it is actually verified. A class name, source comment, progress attribute, or successful build alone is insufficient evidence.

Keep routine decisions moving without approval pauses. If a genuine missing asset or unavailable recording blocks one item, record that exact blocker and continue independent items. Never mark the whole task complete while required items remain unresolved.

The available website recording, Screen Recording 2026-10-28 233925.mp4, provides the Sponsors/Prize requests below. The earlier solar-system clip provides a motion reference. The reviewer could not inspect 20261028-1803-08.8928536.mp4 or Screen Recording 2026-10-28 233611.mp4. If working copies are attached locally, inspect and transcribe their explicit requests into the checklist; otherwise leave their unique requests pending. Do not invent their contents.

STAGE 1 — Establish stable page scrolling and navigation

Requirement 1: Keep one vertically scrolling website in this order:
Home → About → Timeline → complete main/VR Prize Pool → Memories → Sponsors → FAQ → Contact.

Inspect the current composition and preserve this order. Keep each section ID unique. Identify the real scrolling element. A wrapper used as a GSAP scope is not automatically a scroll container.

Requirement 2: Prize and Sponsors navigation must scroll to the correct existing section with a smooth, controlled transition. Honor reduced motion with immediate navigation. Keep normal wheel, trackpad, touch, keyboard, and reverse scrolling usable. Avoid nested vertical scrollers, wheel interception, forced snapping, and competing scroll controllers.

Keep the brochure opening in a new tab. Preserve Register's existing approved behavior; do not invent a registration destination, popup, or new menu.

Keep the existing dividers and approved About, vertical Timeline, FAQ, and Contact designs. Fix only a reproduced regression in these accepted sections, documenting it. Do not redesign them to create visible activity.

STAGE 2 — Complete the Memories repair

Requirement 3: The gallery must remain visible through its entire scroll journey. Reproduce the earlier failure where Polaroids disappeared into a long empty navy area. Measure section/viewport bounds, actual scroll position, sticky ancestors, overflow rules, and ScrollTrigger start/end/progress to identify the cause.

For document scrolling, use the document consistently and omit a custom ScrollTrigger scroller override. Use a viewport-root observer. If the current application genuinely uses a custom scroller, use that exact element consistently instead.

Check whether an overflow-x:hidden ancestor creates a different overflow ancestor that prevents sticky positioning. Correct only the measured incompatible rule. Preserve horizontal containment without creating another vertical scroller.

Requirement 4: Preserve the reference Memories background, orange title, eight Polaroids, photo positions/order, captions, and tilts. Preserve the reference's normal 560svh journey and sticky 100svh viewport when compatible. Keep the title/background stationary while the camera focuses photo 01 and pans through 02–08 over seven equal scroll-driven transitions with ease:none.

Use one system for holding the viewport in place. Do not combine sticky and an additional pin with duplicate spacing. Keep the focused photo and caption fully readable, including short landscape screens.

Requirement 5: Scrolling upward must retrace the same camera journey. Verify all eight focus positions, intermediate positions, entry from Prize Pool, exit into Sponsors, and re-entry in both directions. There must be no blank interval, abrupt reset, or wrong neighboring section covering the gallery.

Requirement 6: Before initialization, if initialization fails, and in paused/reduced mode, all eight photos must remain accessible in a readable static gallery. Remove the long animated scroll extent in static mode. Preserve the currently viewed photo as closely as practical when switching modes.

Refresh geometry after relevant layout, fonts, images, or resize changes. Scope cleanup to Memories. Keep the existing placeholder photos until actual replacements are supplied.

STAGE 3 — Finish the earlier landing motion requirements

Requirement 7: Implement and verify the existing planet's surface rotation about its own tilted axis. Keep the ring orientation fixed. Use a stable layout wrapper, stationary front/rear ring layers, and an independently moving globe surface with coherent lighting and occlusion.

Inspect and repair the existing RingedPlanet renderer and its assets. Do not rotate a flattened planet-and-rings picture like a wheel. Use the solar-system reference to guide smoothness and depth while preserving the approved landing composition and positions.

Use elapsed active time, retain phase through pause/resume, and avoid a catch-up burst after tab restoration. Compare actual frames several seconds apart: surface details move while rings, planet bounds, and nearby controls stay stable.

Requirement 8: Verify the existing falling foreground stars/meteors use the supplied assets and actually travel through the sky, with bounded particle count and cleanup. Do not count static artwork as a working falling effect. Preserve the accepted composition and CTA readability.

Requirement 9: Keep the telescope stationary during ambient motion. Preserve only its approved bounded hover response. Keep Ninja/Leon plain and stationary without the removed aura, circle, reticle, popout, or idle animation. Keep accepted Colt blinking/shooting working.

Requirement 10: Keep Balloon non-clickable, with controlled movement and a small hover response. Preserve its accepted speech bubble and avoid layout shifts, offscreen drift, pointer-trigger loops, or new popup functionality.

Check the moon/title centering, Register visibility, character placement, and foreground occlusion on both a fresh laptop load and a live phone-to-laptop resize. Repair any concrete remaining mismatch.

STAGE 4 — Finish the Sponsors redesign and motion

Requirement 11: Restore the complete SPONSORS title. A concrete defect in the reviewed source is:
public/assets/genesis/sponsors/sponsors-heading.svg has viewBox 0 0 327 50, but its letter paths extend to y=59.64.

Confirm the current asset. If it matches, expand the SVG bounds with suitable padding, typically to a height around 64–66 after checking strokes, and update intrinsic dimensions in data/sponsorsData.ts plus any fixed-height wrapper assumptions. CSS padding around an intrinsically cropped SVG cannot restore missing letters.

Verify complete lettering at rest, during entrance, hover, and scroll. Do not shrink the whole section to conceal clipping.

Requirement 12: Make an evident visual improvement while following the supplied Figma composition: navy cosmic pattern, white title between the crown and chest, royal-blue Past Sponsors panel on the left, six illustrated cards on the right, and Spike in a reserved lower corner.

Improve proportions, alignment, spacing, background visibility, and contrast. Remove accidental dead space and excessive dark overlays that obscure the design. Keep role colors and supplied artwork. Do not add invented marketing copy, counters, generic panels, or popups.

Keep the 3×2 card arrangement on laptop where readable, then deliberately adapt the grid on smaller displays. Allow natural vertical page height on short screens.

Requirement 13: Enlarge GameCloud and Gamedoora visibly, starting around 35–45% more visible logo width than the reviewed result and balancing within the panel. Let the plates use approximately 75–85% of the panel's usable width where possible. Inspect internal asset padding so the visible logo actually grows.

Use the best supplied source with object-fit:contain. Preserve brand proportions, names, and sharpness.

Requirement 14: Remove the unwanted splash/wipe/gloss/light-sweep effect around the past-sponsor logos, including obsolete sheen layers, animations, and duplicate rules after checking references.

Replace it with a crisp, restrained cyan perimeter glow inspired by the approved About text-panel border. Keep About unchanged. Brighten the border smoothly on hover/focus; do not sweep a white band across the logo.

Requirement 15: Fix sponsor glow that rises upward or overlaps content while scrolling. Keep each effect anchored to its card or plate, with correct local coordinates and positioning. Use the illustrated card's perimeter path for its accent outline where available, with only a small local halo.

Check positioning, transformed ancestors, stale hover state, and any fixed/portal effect. Hover a card, hold the pointer still, and scroll it away: the glow must stay attached or clear correctly. Keep one selected card if selection is retained and distinguish it subtly from hover.

Requirement 16: Animate the crown and credits chest visibly but tastefully: a few pixels of asynchronous float/sway, with a brief approximately 1.03–1.05 hover pop. Give the cards a restrained lift and stable hit area. Preserve Spike's accepted response.

Use a readable coordinated entrance with a gentle stagger, approximately 1.2–1.6 seconds overall. Avoid flashing or hidden content on reverse/re-entry. Separate entrance, idle, and interaction transform owners; use refs or stable data targets compatible with CSS Modules.

Finish and browser-verify Sponsors before proceeding.

STAGE 5 — Finish both Prize Pool tracks

Requirement 17: Preserve the main/VR design, medal assets, ranks, amounts, and approved interactions. Make scroll-driven entrance motion scrub to the user's scroll so upward scrolling reverses the same positions/opacity smoothly. Avoid a one-time entrance that leaves everything fixed on return or replay triggers that flash.

Requirement 18: Keep both character blink rigs working approximately every three seconds while active. Keep the face overlays aligned during all added movement. Pause correctly offscreen, when the tab is hidden, and with effective motion paused/reduced.

Requirement 19: Hover/focus on main prize medals must produce the established small pop and trigger both guns with the rank's gold, silver, or bronze palette. Preserve cooldown and paired-shot behavior, with both effects originating from their actual moving muzzles. Keep sound under the existing sound control.

Requirement 20: Add the requested Buzz movement: an occasional modest hop/lift with anticipation, landing, settle, and a corresponding contact shadow. Start around 8–12px at laptop size, adjusting to the rendered character. Leave rest between hops. Keep a subtle natural directional shift.

Requirement 21: Give the cowboy a natural small left/right weight shift or lean around an appropriate grounded pivot. Start around 1–2 degrees and a few pixels of translation over an unhurried cycle. Preserve hover attention, blinking, recoil, and both gun origins.

Flat artwork cannot expose a new side without more artwork. Use convincing limited pose movement instead of whole-image mirroring, fake 3D flips, distorted faces, or generated morphing.

Keep idle, hover, recoil, and blink on separate appropriate layers. Verify shooting while leaning and blinking while moving. Keep complete characters and effects within the intended stage with headroom.

Requirement 22: Verify the existing VR medal feedback and Buzz response as well as the main track. Keep both VR prizes interactive through pointer, keyboard, and touch activation where appropriate. Do not invent another route, popup, or automatic firing.

STAGE 6 — Add the exact reference social footer

Requirement 23: Add the reference's Instagram and LinkedIn links to the current Contact section:
Instagram: https://www.instagram.com/gdxr_ait/
LinkedIn: https://www.linkedin.com/company/87215024/

Reference:
https://github.com/vaman-dev/Genesis
Previously verified revision:
a83d690326868542116792f193aa06780b675be1

Read its app/components/ContactSection.tsx and the relevant social-footer CSS. Copy/adapt only the small SVG icons, labels, link behavior, and necessary styling, preserving required attribution.

Requirement 24: Render exactly one copy of each link below the Contact/venue content. Preserve Contact's mural, names, phone links, map, and approved layout. Use the dark-blue closing strip as a visual starting point, but keep functional links in normal document flow above overlays.

The older decorative strip was absolute with pointer-events:none. Do not place functional links in an inert or clipped layer.

Use real anchors, target="_blank", rel="noopener noreferrer", visible labels, accessible names/new-tab indication, and clear keyboard focus. Decorative SVGs are aria-hidden. Use approximately 22–24px icons and at least 44px-high tap targets, centered on laptop and wrapping on small phones. Keep the links usable before animation initialization.

Use existing navy/white/yellow styling with restrained hover feedback. Add no social embeds, login widgets, new packages, or additional popups.

STAGE 7 — Responsive repair, performance and completion evidence

Requirement 25: Make the full site adapt without hiding required content or scaling the entire page as one image. Use deliberate section layouts, fluid sizing, maximum widths, and natural vertical height. Keep characters, text, buttons, cards, and captions clear of accidental overlap or foreground obstruction.

Verify 1536×730 and 1366×768 first, then 320×568, 393×852, 412×924, 768×1024, 960×1440, 1024×768, 844×390, 1280×450, 1920×1080, and 2560×1440. Include fresh loads, resize in both directions, and orientation changes. Recording resolution is not the browser's CSS viewport.

Requirement 26: Preserve the existing single user-pause control and OS reduced-motion preference. Gate ambient work on section activity, document visibility, and effective pause. Resume without catch-up jumps. Use scoped GSAP cleanup, bounded particles, stable asset dimensions, and appropriate loading for below-fold imagery. Avoid per-frame React state and unnecessary global listeners.

After the features work, remove only dead code/styles/assets made obsolete by these repairs and verified unused. Check dynamic asset references and public URLs before removing files. Do not replace functional animation with a static approximation to claim better performance. Do not upgrade dependencies or delete supplied asset collections as a shortcut.

Requirement 27: Run the actual type/check script and production build, then inspect a fresh production preview in the browser. Test interactions and visible results, not only class existence. Recheck About, vertical Timeline, FAQ, Contact, all section dividers, brochure/new-tab links, Register visibility, motion controls, and audio control. Correct regressions introduced by this work.

Every requirement must end with concrete evidence in docs/review/genesis-completion.md:
- Requirement number and VERIFIED or BLOCKED.
- Actual changed files, or proof an existing implementation was already correct.
- Relevant viewport and before/after capture paths.
- Browser observation or meaningful measurement.
- Any remaining failure and exact blocker.

Use before/after frames for moving surfaces and character poses, a hovered-card scroll test for glow, every photo focus point for Memories, reverse-scroll comparisons for Prize Pool, and actual new-tab destination checks for social links.

Provide the exact local preview URL, build/check results, changed-file summary, branch/HEAD/git status, and all unresolved requirement numbers in the final handoff. Report untested engines/devices honestly.

Keep the checklist updated if context is running low, with the current stage and next unfinished requirement so continuation can resume accurately. A checkpoint is not permission to mark the work complete.

Complete the local implementation. Leave commits, pushes, merges, and deployment for my subsequent instruction.

