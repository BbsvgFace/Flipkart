# SAATH verification — 25 October 2026

## Completed

- **19 domain checks passed:** required fields and identity, ownership, zone and specialist permissions, protected cases, acceptance, consent, assistance confirmation, continuing care, offline observation sync and conflict preservation, delivery retry, relay deduplication/expiry, extraction fallback, and corrupt-storage handling.
- **29 browser scenarios passed** in headless Chrome, opening the app directly from `index.html`. These exercise both role entrances and the complete report → assignment → welfare check → assistance → follow-up → civilian tracking journey.
- Browser checks also cover English/Hindi persistence, safety referral, draft resume, voice fallback, offline intake and relay branches, restricted personal details, no-answer escalation, chats, guides, settings, reset confirmation and unavailable storage.
- No unexpected browser runtime errors during the tested journeys.
- No horizontal overflow on the tested overview, cases, team, map and settings screens at widths of 320, 390, 430, 1024 and 1440 pixels.
- Screenshots inspected for mobile/desktop home and volunteer layouts, report receipt, continuing care and Hindi. Fixed the manual-entry button contrast and guide-search matching during verification.
- Local preview server returned HTTP 200. The portable file version is the primary deliverable and needs no installation.
- The ZIP was extracted to a separate folder, all packaged files were compared byte-for-byte, and all 29 browser scenarios passed against that extracted copy. An initial timing race in the browser test was corrected by waiting for the receipt screen itself, not just its URL.

## Reproduce

Run `node tests/model.test.cjs`. For optional browser tests, install Playwright separately, or point `PLAYWRIGHT_MODULE` at an existing installation and `CHROME_PATH` at Chrome, then run `node tests/browser.test.cjs`. The test defaults to the local file entry. `SAATH_TEST_URL` can point at another extracted copy; `SAATH_QA_OUTPUT` selects an output folder for screenshots and results. Browser tests reset only the isolated test browser's demonstration state.

## Not verified

Physical microphone capture, audible speaker output, screen-reader navigation, physical mobile devices, and native-speaker Hindi usability have not been checked. The complete care-journey test uses the supported voice fallback; the separate microphone suite exercises synthetic audio capture. Visual inspection and automated layout checks do not establish accessibility conformance.

## Design and microphone refinement

After the mid-fidelity refinement, the 19 domain and 29 complete-browser checks passed again. A separate microphone/design suite exercises actual browser `getUserMedia`, Web Audio analysis and MediaRecorder using a **synthetic audio device**, with injected speech results for deterministic transcription checks. It verifies the responsive contour, interim/final text, stop flushing, local playback, stream cleanup, denied permission, speech-service errors, unsupported transcription, urgency gradients, assignment privacy, Hindi and the centre Home navigation. The new screens fit 320–1440px. Mobile screenshots were visually inspected after settling their entrance animations.

This proves the browser capture pipeline, not a physical phone microphone or the browser vendor's live transcription service. Phone and native-language testing remain open.

## Hosted verification

The production deployment is READY at **https://saath-care-prototype.vercel.app**. Independent unauthenticated requests returned HTTP 200 for the app and microphone script. All **29 complete browser scenarios** and **14 microphone/design scenarios** passed against this HTTPS deployment, with no browser runtime errors. The microphone checks include a permission request that completes after Home navigation; its resulting stream is immediately stopped.

Uploaded runtime files were verified against the local source by SHA-1. The final ZIP is extracted separately and every packaged file compared byte-for-byte. Tests run in isolated browser profiles and do not change the user's demonstration data.

## Floating selections and blue gradient revision

The latest production revision also passed **9 selection/theme checks** on the hosted URL: paired controls, all six criteria and eight help options, Microsoft 3D images, multi-selection across panels, full category explanations, Escape/focus restoration, reload persistence, conditional safeguarding fields, Hindi, a measured four-column grid with 16px gutters/content-frame margins at 320–768px, supplied radial gradient stops, and a white waveform surface. No runtime errors occurred. Mobile criteria, needs, form and voice screenshots were visually inspected. The 29 complete-browser checks, 14 microphone/design checks and 19 domain checks also passed after this refinement.

All 12 selected emoji are original Microsoft 3D PNGs downloaded from a pinned repository revision. Their license and source paths are included. Browser screenshots are evidence of layout and loading, not a claim of formal accessibility conformance or physical-device audio testing.

OTP, AI extraction/detection, server receipts, credentials, coordinator replies, Bluetooth relay and handoffs are explicitly simulated. These checks establish prototype behavior only; there is no real emergency dispatch, backend security or cross-device service to validate.
