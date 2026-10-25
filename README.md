# SAATH

A mobile-first, fictional care-continuity prototype with **Civilian** and **Verified Volunteer** experiences. Built from the supplied project archive and inspected Figma wireframes.

## Open it

1. Extract the ZIP completely.
2. Open **index.html** in Chrome or Edge. No installation, API keys, server or account is required.
3. Use one browser and the same extracted folder for the entire demonstration. The two role experiences share that browser's local state.

Optional: with Node.js installed, run `node serve.cjs` and open **http://127.0.0.1:4175**. The file version and localhost version have separate browser storage. Browser speech recognition is more likely to be supported on localhost; typed input and the demonstration transcript always work.

For phone testing, use the HTTPS Vercel link in `DEPLOYMENT.md`. Open it in your phone's browser and allow microphone access. Each device keeps its own demo state; switch roles on the same device for the connected walkthrough.

## Demo accounts

| Entrance | ID / number | Code | Permission example |
|---|---|---|---|
| Civilian | 9000000001 | OTP **123456** | Own reports only |
| Volunteer Rohan | SAATH-V101 | **2468** | Zone A; welfare and essentials |
| Volunteer Dr. Asha | SAATH-V102 | **2468** | Zone A; separately authorized medical referrals |
| Volunteer Farah | SAATH-V103 | **2468** | Zone B; welfare and essentials |
| Volunteer Neel | SAATH-V104 | **2468** | Zone A; welfare checks |

All accounts are fictional. Phone verification and volunteer credentials are simulated, with no SMS or production security. A limited unverified civilian path is also available.

## Five-minute walkthrough

1. Choose English or Hindi, then Civilian. Sign in with the demo phone and OTP.
2. Start voice reporting → no immediate danger → **Try a demo description** → **Fill the form · simulated AI**. Manual entry uses the same form.
3. Check the categories and needs, set relationship, observation source, landmark, Zone A and permission to share. Review and explicitly confirm submission.
4. Open Settings → **Sign out / switch demo role**. Enter Volunteer using Rohan's ID and code.
5. Open the new case in **Cases**. Notice that the exact address is hidden. **Acknowledge alert** does not accept a task. Accept **Essentials delivery** to unlock necessary details.
6. Start a welfare check; select person reached and explicit consent. Record an observation. Then record the assistance outcome, confirmed receipt, continuing care, a future time and the next action.
7. The assistance task completes while the case requires follow-up. The next task remains unclaimed. Optionally run the explicitly labeled coordinator handoff acknowledgement.
8. Sign out and return to the same civilian number. Open **Reports** to see the outcome and continuing-care status.

**Offline:** In Settings choose Offline or Delivery failure. Submit a report and inspect its **NOT SENT** state. Explore relay copy, failure, expiry, simulated gateway receipt and duplicate acknowledgement. Or change to Connected and use Retry / sync.

**Volunteer offline:** Accept a task while connected; go offline and record its welfare check. The field note stays local, and the civilian's acknowledged case state is unchanged. Sync after reconnecting. The explicit conflicting-update simulation retains both records for review.

## What works, and what is simulated

Real browser functionality: separate role entrances, permission-based UI and transitions, forms, validation, local storage, reload persistence, English/Hindi interface, optional browser transcription, local drafts, retry, filters, guide search, chats, notifications, sounds, map interaction, and the complete report-to-outcome journey.

The microphone now uses `getUserMedia` for actual capture. The panel's curved upper edge responds to detected audio; it is not a looping decorative animation. Browser transcription updates the editable text while you speak. Stop allows the last recognition result to arrive and offers temporary local playback. If transcription is unsupported or its service fails, recording and manual/keyboard-dictation fallback remain available. Audio is held only in memory on the voice screen and discarded when leaving it. A two-minute limit prevents an unattended capture. Backgrounding the page stops capture.

Simulated: OTP, verification credentials, AI extraction and language detection, network/server acknowledgement, team and coordinator messages, institutional referrals, continuing-care handoff, Bluetooth peers, encryption concept, and conflicts. There is **no emergency dispatch, live triage, real mesh, external messaging, cross-device sync, or backend**. Browser recognition, when available, may use the browser vendor's speech service. SAATH does not attach raw audio to a report or save it to browser storage.

The centre navigation item is **Home** for both roles. Report rows use right-edge red/amber/green gradients for reported urgency, with equivalent text labels. Green means routine reported urgency; it never asserts that someone is safe or that care is complete. Delivery and care status remain explicit on each row.

Criteria and Help needed are adjacent pill controls that open floating selection panels. Options use local Microsoft Fluent 3D emoji beside their full labels, with two choices per row. The screen and panel grids use four columns, 16px gutters and 16px content-frame margins. Choices save immediately to the draft, survive closing or switching panels, and never submit a report. All six criteria explanations remain available in the panel. The voice screen uses the supplied saturated blue radial stops and a white waveform surface; its upper edge still responds to live audio.

Use fictional information only. Browser storage is neither production authentication nor protected medical-record storage. Private browsing, moving the extracted folder, or clearing browser data can remove or isolate the demonstration state. When storage cannot be read or written, the app shows temporary-session mode; export before closing. Reset requires confirmation.

## Files and checks

- `index.html` — entry point; local assets and plain scripts.
- `styles.css` — responsive light visual system and reduced-motion support.
- `design.css` — refinement from the Product development mid-fidelity screens.
- `app.js` — routes, screens, browser speech, sound and event handling.
- `voice.js` — microphone stream, analysis, optional transcription and temporary playback.
- `model.js` — shared data, permission checks, state transitions and offline handling.
- `i18n.js` — central English → Hindi interface catalog.
- `assets/` — supplied eight MP3 files, local Noto fonts and prototype mark.
- `tests/model.test.cjs` — dependency-free domain tests: `node tests/model.test.cjs`.
- `tests/browser.test.cjs` — optional development-only Playwright browser test; the app itself has no package dependency. Install Playwright separately to run it, or set `PLAYWRIGHT_MODULE` to an existing installation and `CHROME_PATH` to a Chrome executable.
- `HANDOFF.md` — decisions and source mapping for future edits.
- `QA.md` — verification evidence and remaining limitations.
- `DEPLOYMENT.md` — Vercel target and phone preview details.
- `tests/design.test.cjs` — optional browser checks with synthetic microphone input, waveform, transcript, permissions and responsive layouts.

## Attribution

Audio: user-supplied SAATH project archive; original filenames preserved. Typography: Noto Sans and Noto Sans Devanagari, SIL Open Font License; see `assets/fonts/OFL.txt`. Map and provisional mark: original SVGs for this prototype. The archive's generated logo was an unapproved exploration, so it has not been represented as an approved production logo.

Selection symbols: Microsoft Fluent Emoji 3D, from [Microsoft's official source](https://github.com/microsoft/fluentui-emoji), MIT License. See `assets/emoji/LICENSE.txt` and `SOURCES.json` for the pinned source revision and each original asset path. The Figma Community reference page blocked automated downloads; these are Microsoft's original 3D files, not platform text emoji or generated substitutes.
