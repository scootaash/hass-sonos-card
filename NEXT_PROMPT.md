# Next task — live native grouping + group-aware visuals

Paste this into a fresh Claude Code session running **inside this repo**. Read `CLAUDE.md`
and `design/Music Player.dc.html` first.

---

## Context
`sonos-music-card.js` is a working Home Assistant custom Lovelace card (an immersive
multi-room music player for Sonos + Music Assistant). It currently drives speaker grouping
through six `input_boolean.sonos_group_*` helpers, which are unwieldy and — critically — do
**not** reflect grouping changes made in other apps (e.g. the Sonos app). The card already
handles: album-art colour wash, now-playing + progress, transport, custom volume sliders +
the per-room popover, playlist tiles, the audiobook button, and responsive reflow. Keep all
of that working.

## What to build

### 1. Replace helper-based grouping with live native grouping
- **Source of truth = `group_members`** read from the Sonos `media_player.<room>` entities
  (see CLAUDE.md table). Compute the full grouping topology across all rooms each update, so
  the card reflects groups formed/changed in the Sonos app within ~1 s.
- **Add to group** = `media_player.join` (target = master's Sonos entity, `group_members:
  [room]`). **Remove** = `media_player.unjoin` (target = room). Adding a room that's already
  in another group should relocate it (join handles this).
- **Delete** all `input_boolean.sonos_group_*` usage from the card and its config schema.
- Keep `input_select.sonos_master` as the "master" (and keep `script.music_play_on_master` /
  `script.resume_audiobook_on_master` for playback) **unless** you and the user decide to go
  fully helper-free (card calls `music_assistant.play_media` on the master's `mass_*` entity
  directly). Default: keep `input_select`.

### 2. Group-aware visual states (the point of this task)
- **Top-nav speaker pills (master selector):**
  - available/idle → normal pill
  - **already grouped → greyed/dimmed, but still tappable** (selecting it as master must work)
  - selected master → the existing ring highlight (inset border + dot ring), no layout shift
- **"Tap to add to group" rows:** make the speaker's situation obvious —
  - **In this group** (turquoise + ✓)
  - **Idle / available** (plain + ＋)
  - **In another group** → distinct treatment (e.g. amber + a "Move from <coordinator/room>"
    sublabel + a move icon) so it's clear that adding it *relocates* it from its current group

### 3. Master-vs-coordinator behaviour
Real Sonos groups have a coordinator. When the user taps a pill for a speaker that's currently
grouped under a **different** coordinator: default to **(a)** focus/show that speaker's
existing group (just change which group the card is centred on). Confirm (a) vs (b) "pull it
out and make it the new playback room" with the user before implementing.

### 4. Deployment
Ship as a file (no inline 24 KB limit). Deploy `sonos-music-card.js` to `/config/www/` and
register `url: /local/sonos-music-card.js`. Do NOT reintroduce the inline-resource minify
squeeze. (You may keep an optional `npm run minify` for a smaller `dist/`, but the readable
source is the deployable.)

## Constraints & acceptance
- Single vanilla file, Shadow DOM, zero deps. Stay faithful to `design/Music Player.dc.html`
  (colours, DM Sans, spacing, radii, the popover).
- Must remain responsive (1280×800 tablet → phone).
- Preserve optimistic-then-reconcile behaviour so external (Sonos/MA app) changes flow in.
- You can't see it render — run `node test/smoke-test.js sonos-music-card.js` and require
  `errors: 0`; update the smoke test's stub `hass` to include grouped `group_members` so the
  new topology logic is exercised. Then hand off to the user for on-device verification.
- Update `CLAUDE.md` (remove the "migration in progress" note once done) and the config
  example to drop the booleans.
