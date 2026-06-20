# Claude Code prompt — TVHGC multi-room music player for Home Assistant

Copy everything below the line into Claude Code, run from your Home Assistant config repo
(the folder containing `configuration.yaml`). The two files in `reference/` are the **design
source of truth** — read them first.

---

## What I want you to build

A custom **Home Assistant Lovelace card** — a multi-room music player — and wire it to my real
media players. It targets a **wall-mounted tablet in landscape at 1280×800**, so design at that
size and let it scale. Build it as a single self-contained custom card I can drop into
`/config/www/` and add as a dashboard resource (no separate build pipeline unless you think one
is clearly warranted — if so, use Vite + Lit + TypeScript and document the build).

This is **not** a web app to ship as-is. The files in `reference/` are HTML/JS design prototypes
showing the exact intended look and behaviour. Recreate that design faithfully as a Lovelace card
using Home Assistant's patterns (`hass` object, entity states/attributes, service calls), then
**wire every control to live entities**.

### Reference files (read these first)
- `reference/Music Player.dc.html` — the **chosen, final design** ("Immersive"), with the volume
  control already wired in prototype JS. This is what to match pixel-for-pixel.
- `reference/Music Player Layout (3 options).dc.html` — the three explored options for context;
  build **Option A (Immersive)** only.

> These are "Design Component" files: markup lives in the `<x-dc>…</x-dc>` template and behaviour
> in the `class Component extends DCLogic` block. Read both. Ignore the `support.js` runtime — it's
> just the prototyping harness, not something to reproduce.

This is a **high-fidelity** design: use the exact colours, type, spacing, and radii below.

---

## Fidelity & design tokens

**Type:** DM Sans everywhere (Google Fonts), weights 400/500/600/700/800. Sizes used: 11/12/13/14/15/16/20/46px.
Overlines are 11–12px, weight 700, UPPERCASE, letter-spacing .14–.16em.

**Album-art "wash" (signature behaviour):** the whole card background is a bold wash derived from
the **master speaker's current album art**. In the prototype it's a fixed teal gradient
`linear-gradient(155deg,#0c4a5a 0%,#0a3140 52%,#06222e 100%)` with two soft radial "ambient" blobs.
**In the real card, extract the dominant colour from the live album-art image** (e.g. `node-vibrant`,
or a small canvas down-sample average) and build the gradient + blobs from it, darkened for legibility.
Cross-fade the wash when the track/art changes (200–320ms). Fall back to the teal gradient when no
art is available.

**Colours (TVHGC design system):**
- Brand navy `#1D365F`, interactive azure `#0066FF`, live/active turquoise `#00CCCC` (and bright `#18b2c4`).
- Grouped/active rooms use turquoise; the master speaker chip blends into the album-art colour.
- Glass panels over the wash: `background: rgba(255,255,255,.06–.07)`, `border: 1px solid rgba(255,255,255,.13–.14)`, some with `backdrop-filter: blur(8px)`.
- Text on the wash: `#fff`, muted `rgba(255,255,255,.55–.7)`, turquoise highlight `#7fe9ef`.

**Radii:** pills `9999px` (chips, sliders, buttons); cards/rows `14–20px`; small buttons `10–12px`.
**Shadows:** album art `0 22px 50px rgba(0,0,0,.45)`; popover `0 18px 40px rgba(0,0,0,.5)`; play button `0 8px 22px rgba(0,0,0,.35)`.
**Motion:** 120–320ms ease-out (`cubic-bezier(.16,1,.3,1)`); no bounce. The "now playing" equaliser bars animate (`scaleY .3→1`, .9s, staggered delays).

---

## Layout (Option A — Immersive)

Fixed 1280×800 canvas, padding 40px, two columns with a 36px gap:

**Left block (flex:1), vertical, gap 22px:**
1. **Speaker row** — overline "SPEAKERS — TAP TO SET MASTER" + a wrapping row of room pills (one per
   media player). The **master** pill is filled with the album-art colour gradient and carries a tiny
   "MASTER" tag; rooms currently in the group get a turquoise dot + turquoise-tinted pill; others are
   plain glass pills. **Tapping a pill makes that speaker the master.**
2. **Player row** (flex, gap 22px):
   - **Album art** — 498×498, radius 20px, the live cover image. Overlaid at the bottom on a dark
     scrim: animated equaliser + track title + artist; a **progress scrubber** (elapsed / position /
     duration); and transport: **previous · play/pause (large white circle) · next**. If the current
     media is an **audiobook**, replace prev/next with **−30s / +30s** skip buttons.
   - **Group column** (flex:1, ~258px) — overline "TAP TO ADD TO GROUP" then one fixed-height (62px)
     row per room: name + status sublabel ("MASTER · PLAYING" / "IN GROUP" / "AVAILABLE") and a round
     toggle on the right (turquoise check if in group, glass "+" if not). **Tapping toggles that room
     in/out of the master's group.**
3. **Volume row** — glass bar containing: a volume icon · the **master/group volume slider**
   (drag to set) · a **room dropdown** button ("Lounge +2") that opens the per-room popover · a
   **"Master volume"** button.

**Right — Playlists panel (flex:none, 386px), glass, padding 24px:**
- Overline "AUDIOBOOK" + a prominent **"Play current audiobook"** button (azure→turquoise tint,
  book icon, shows current title + time remaining). This is **always top-left** of the panel.
- Overline "APPLE MUSIC PLAYLISTS" + a 2-column grid of playlist tiles (gradient cover + name + track
  count). Tapping a tile plays it on the current group.

### Volume popover (already prototyped — match it)
Opens above the dropdown, 340px, dark glass. Contents:
- Header "GROUP VOLUME" + room count.
- **"All rooms"** master slider at top (sets every room to one level).
- One row **per grouped room**: name, a **"Default"** button (reset icon — sets that speaker to its
  configured default level), the live percentage, and a **draggable slider**.
- Footer button **"Set all to master volume"**.
Dragging a room slider updates that room; the master/"All rooms" slider tracks the average.

---

## Wire it to Home Assistant

Make a **YAML-configurable** card. Config example:

```yaml
type: custom:tvhgc-music-card
master: media_player.lounge          # initial master; tapping a pill changes it at runtime
rooms:                                # speakers shown in the row + group column
  - entity: media_player.garage
    name: Garage
    default_volume: 40               # used by the per-room "Default" button (percent)
  - entity: media_player.master_bedroom
    name: Master Bedroom
    default_volume: 45
  - entity: media_player.kitchen
    default_volume: 40
  - entity: media_player.spare_room
  - entity: media_player.lounge
    default_volume: 50
  - entity: media_player.hall
audiobook:
  resume_entity: media_player.audiobookshelf   # "Play current audiobook" target
playlists:                            # Apple Music (via Music Assistant) tiles
  - name: Coastal Mornings
    media_content_id: library://playlist/...
    media_content_type: playlist
  - name: Deep Focus
    media_content_id: ...
  # …
```

### Entity → UI mapping (use `hass.states[entity].attributes`)
- **Album art:** `entity_picture` (prefix relative URLs with `hass.hassUrl()` / the HA base URL). Drive the colour wash from this image.
- **Now playing:** `media_title`, `media_artist`, `media_album_name`.
- **Progress:** `media_position`, `media_duration`, `media_position_updated_at` (advance position locally between state updates so the scrubber moves smoothly).
- **Audiobook detection:** treat as audiobook when `media_content_type` is `audiobook`/`podcast` (or the master is the configured audiobook entity) → show ±30s instead of prev/next.
- **Group membership:** `group_members` attribute (list of entity_ids). The master is the first / the configured master. A room is "in group" if its entity is in the master's `group_members`.
- **Volume:** `volume_level` (0–1) per entity → display as percent.

### Services to call
- Transport: `media_player.media_play_pause`, `media_player.media_next_track`, `media_player.media_previous_track`.
- Audiobook ±30s: `media_player.media_seek` with `seek_position: media_position ± 30` (clamp to 0…duration).
- Set master: when a speaker pill is tapped, make it the master — re-point the card's master and (if it was a follower) keep the group intact; transport/now-playing then read from the new master.
- Group add/remove: `media_player.join` (`entity_id: <master>`, `group_members: [<room>]`) to add; `media_player.unjoin` (`entity_id: <room>`) to remove.
- Volume (per room): `media_player.volume_set` (`entity_id: <room>`, `volume_level: 0–1`).
- Master / "All rooms" / "Set all to master volume": call `volume_set` for **every** member with the master level.
- Per-room **Default** button: `volume_set` to that room's `default_volume / 100`.
- Play a **playlist**: `media_player.play_media` (or `music_assistant.play_media`) on the master with the tile's `media_content_id` + `media_content_type`. Honour grouping.
- **Play current audiobook:** resume the configured `audiobook.resume_entity` (e.g. `media_player.media_play`, or its integration's resume service) and show its title + time remaining.

### State & behaviour notes
- Optimistically update sliders/toggles on interaction, then reconcile from `hass` on the next state push (HA updates ~1/s). Debounce `volume_set` while dragging (e.g. fire on pointer-up + throttled during drag).
- Sliders are custom (pointerdown on the track → compute %, pointermove to drag) — see the prototype's `startDrag`/`setVol` for the exact logic to port.
- The popover closes on outside-click / when another control is used.
- Everything must be touch-friendly (tablet): hit targets ≥ 44px.
- Handle unavailable/idle entities gracefully ("No data", dimmed controls) per the TVHGC voice (British, plain, no emoji).

---

## Deliverables
1. The custom card (single JS file in `/config/www/`, or a small Vite/Lit/TS project with build output there).
2. The dashboard **resource registration** steps and a ready-to-paste **card YAML** for my entities (use the example above; ask me for my real `media_player.*` entity ids if you need them).
3. A short README: install, configure, and how the album-art colour extraction + grouping work.
4. Match the reference design faithfully (colours, type, spacing, the wash, the popover). Call out any
   HA constraint that forces a deviation.

Start by reading both files in `reference/`, then propose the card's file structure and the exact
entity/service wiring before writing code.
