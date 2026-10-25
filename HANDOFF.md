# SAATH implementation handoff

## Scope locked by the user

Two experiences only: civilians report and track their own care requests; verified volunteers see zone summaries and act on authorized tasks. Separate phone/OTP and volunteer-ID entrances. Language choice precedes sign-in. Voice fills the same editable form as manual entry; it never submits without review. Coordinator and provider behavior has no separate UI and is explicitly simulated.

Latest specification: `SAATH_Complete_Project_Archive.zip`, supplied on 25 October 2026. The full decision log Q01–Q40, functional spec, engineering guide, visual rules and acceptance criteria were read. No further product brainstorming is required before routine fixes.

## Figma inspection and visual interpretation

File `AneLkMFDhIAnrf0c6RinHG`. Live design context and screenshots inspected for:

- `237:7429` — chat 3, the user's latest linked frame.
- `219:3276` — Civilian Home: central voice entry, manual alternative, three-item navigation.
- `219:3829` — Emergency Manual entry: criteria, relationship, identity, needs, location and notes.
- `237:7973` — Volunteer overview: status hero, counts, alerts, reports and zone context.
- `237:8736` — Patient Info: case details, needs, location, notes and escalation.

The archive explicitly instructs structural fidelity rather than copying grayscale or every alternate frame. Its white surfaces, functional blue/green/amber/red palette, rounded bento cards, voice orb, supplied audio and Noto typography drive the finished styling. Two supplied reference images and the logo exploration were inspected directly. No source Figma board was modified.

Old wireframe promises of nearby dispatch or arrival were replaced with truthful receipt and assignment states. Satellite imagery/live tracking was replaced with an explicitly fictional geographic reference diagram. Public institution insignia were not used to imply partnerships. No coordinator dashboard was added.

## Structure for Sol/Luna edits

There is no build step or application dependency. Classic deferred scripts are intentional: they work under `file://`, unlike many module/fetch-based structures.

1. `model.js`: the domain boundary. Testable in Node and exposed as `Saath` in the browser. Mutations enforce current role, zone, task approval, ownership, consent and state. UI-only hiding is not the sole demo guard.
2. `app.js`: page functions and shared rendering helpers. One delegated click/input/change/submit layer. Hash navigation supports browser Back. Transcripts and role/report drafts share the same form shape.
3. `i18n.js`: English keys and Hindi translations, loaded before app.js. New interface strings need a Hindi entry. Fictional seed data and user-entered notes are not automatically translated.
4. `styles.css` and `design.css`: responsive shell plus the user's mid-fidelity refinement. Desktop sidebar is hidden below 850px. Three-item dock remains accessible on small screens; its centre item is Home for both roles.
5. `tests/`: domain invariants and actual browser user journeys. No runtime dependency on testing tools.
6. `voice.js`: actual browser microphone, analyser-driven contour, optional browser transcription and in-memory playback. Stop flushes the last recognition result. Navigation cancels pending permissions and releases all streams. Audio is never written to localStorage or attached to case data.

Keep changes at the shared model boundary when correcting state semantics. Re-run domain tests after changing permissions or transitions, and the affected browser journey after altering UI handlers.

## State semantics

- Transport: `queued`, `failed`, `peer`, `ack`. Drafts are separate from submitted cases. A peer copy never makes a case visible to volunteers. Relay gateway is a separate explicit simulation, so it can acknowledge while the original phone remains offline.
- Verification: `reported`, `verified-limited`, `unable`. No-answer and unsafe/declined contact do not become safe or fulfilled.
- Tasks: `available`, `accepted`, `in-progress`, `completed`, `escalated`, `unable`. Receipt confirmation is separate from assistance recording. Task type and permissions are checked before acceptance.
- Care: `open`, `receiving`, `followup`, `review`, `continuing`. Single assistance does not automatically resolve a case. Continuing-care responsibility can be acknowledged in the simulation while the next task remains unclaimed.
- Privacy: zone-only anonymized summaries; exact submitted details available to reporter or an assigned authorized volunteer. Protected child tasks are never self-accepted. New medical referral tasks need additional authorization; the seeded medical case explicitly demonstrates authorized specialist acceptance.
- Offline observations: pending immutable payload with base case revision; remote case state stays unchanged. Sync applies only if no newer revision exists. Otherwise both records are preserved in the event history and the case is flagged for coordinator review.
- Notifications: read, acknowledged and accepted are distinct. Chats never mutate a case.
- Storage: versioned localStorage key `saath.prototype.v1`. Reset confirmation and export backup provided. Corrupt data is not silently overwritten. This is demonstration access control, not a secure backend.

## Known limits / intentional choices

- Use one tab and browser profile for the evaluated role-switch journey. A different device or origin has independent state. This is not a multi-user server.
- Live browser speech support varies. Unsupported/denied speech has typed and scripted fallbacks. Language detection and field extraction are deterministic local simulations.
- No clinical guidance, diagnoses, emergency hotline validation or legal child-placement protocol is presented. Guides are labeled project guidance, with direct-help referral language.
- Browser capture and cleanup are tested with a synthetic microphone. Real audio output quality, physical-device microphone capture, the vendor's live speech service, screen-reader experience and native Hindi usability require human/device testing.
- The informational map is not navigation. No GPS, real locations, photos, raw-audio uploads or institution API is collected.
- Fonts and all sounds are local. Opening from ZIP requires extraction first. A localhost preview is optional; there is no service-worker guarantee for reloading the HTTP version with network disabled.
- The local preview is served on port 4175. The portable file version is the primary deliverable.

## Design follow-up, 25 October 2026

Inspected the Product development page `185:17`, then live context/screenshots for civilian home `219:3276`, voice `219:3766`, reports `226:4381`, and volunteer home `237:7973`. The civilian layout now uses the large rounded entry surface, prominent central action, manual-entry pill and compact gradient report rows. The wave-shaped top of the voice panel is a live audio contour, as the user clarified. It responds to microphone samples rather than a decorative loop; reduced-motion uses a stationary contour. Report gradients encode reported urgency separately from transport, assignment and care status. Names appear only where `M.sensitive` permits them. Figma navigation/entry icons are downloaded locally under `assets/figma/`; native status bars are supplied by the phone, not fabricated in the page.

Vercel hosts only the runtime files and assets. No localStorage data, tests, account exports, attachment archives or credentials are uploaded. The `.vercelignore` also keeps support files out of CLI uploads. See `DEPLOYMENT.md` for the exact target; do not select an unrelated default project.

## Blue palette and floating selectors

The user subsequently supplied the radial stops `#1C56C2`, `#499CCF` at 64%, `#6C98E8` at 83%, `#7A9CDE` at 88%, `#5E94F3` at 97%, and `#4674F3` at 100%. These now form the voice background and microphone gradient. Shared accents and the prototype mark are blue rather than teal. Semantic green/yellow/red urgency colors remain and are more saturated.

`selectionTabs`, `openSelection`, and `selectionEmoji` in app.js reuse the existing `criteria`/`needs` draft arrays, validation, change handler and native dialog. Two side-by-side controls open a floating panel with a four-column grid; each emoji pill spans two columns. Definitions retain all original criteria wording and descriptions. Changes persist immediately. Native modal focus, Escape restoration, counts, Hindi, reload and safeguarding context are checked in `tests/selection.test.cjs`. Microsoft 3D PNGs are local and licensed under `assets/emoji/`; do not replace them with system text emoji.

The visible mobile content frame has 16px side margins and four columns with 16px gutters; larger viewports keep a centred reading frame. The voice page uses a dedicated centred wordmark/back/language header and a white panel continuous with the transcript. The contour itself remains audio-driven. The Manual Entry button is kept above the mobile dock at the standard 390×844 viewport.

## Next useful design step

Evaluate the completed civilian → volunteer → civilian journey with a human, focusing on whether the distinction between task completion and continuing care is understood without explanation. Adjust only observed friction rather than expanding the role scope.
