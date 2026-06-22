# CLAUDE.md — sonos-music-card

Guidance for Claude Code working in this repo.

## What this is
A **Home Assistant custom Lovelace card** (frontend only) — an "Immersive" multi-room
music player for a Sonos + Music Assistant household. It is **not** an integration / Python
`custom_component`: it has no backend, no entities, no services of its own. It reads the
`hass` object and calls existing services. Treat any urge to add a Python component as a
smell — the data (`group_members`, `media_*`, `volume_level`) and actions
(`media_player.join`/`unjoin`/`volume_set`, `music_assistant.play_media`) already exist.

- **One self-contained vanilla ES module.** No framework, no imports, no build required.
  HA loads `sonos-music-card.js` directly as a JS module. (Lit/TS would add a build
  pipeline for no real benefit — don't introduce one.)
- Shadow DOM for style isolation. No external runtime dependencies.
- Target: a wall-mounted tablet at **1280×800 landscape**, but must stay **responsive**
  down to phones (it reflows to one column; the album art becomes a square that fills width).

## Design source of truth
`design/Music Player.dc.html` is the chosen "Immersive" design — match its colours, type
(DM Sans), spacing, radii, and the volume popover. `design/PROMPT.md` is the original brief;
`design/Music Player Layout (3 options).dc.html` is context only (build Option A).
Tone in any UI copy: British, plain, no emoji.

## Entity / service model (IMPORTANT — verified against the live system)
Each room has **two** entities. Use the right one for the right job:

| Need | Entity | Why |
|------|--------|-----|
| Grouping state (live, reflects Sonos app) | **Sonos** `media_player.<room>` → `group_members` | The Sonos integration keeps `group_members` accurate; MA's `mass_*` report `group_members: []`. |
| Now-playing / artist / progress | Sonos `media_player.<room>` | Populated when MA streams to the Sonos player. |
| Album art (for the colour wash) | Sonos `media_player.<room>` → `entity_picture` | It's a same-origin `/api/media_player_proxy/...` URL → canvas-safe. MA art is absolute `http://192.168…:8095` (mixed-content + taints canvas). |
| Volume read/set | Sonos `media_player.<room>` → `volume_level`, `media_player.volume_set` | Native. |
| Group add/remove/relocate | `media_player.join` (target = coordinator's Sonos entity, `group_members: [room]`) / `media_player.unjoin` (target = room) | Native Sonos grouping; visible everywhere. `join` relocates a room already in another group. |
| Play a playlist / album / track | `music_assistant.play_media` on the **MA** `media_player.mass_<coordinator>` | MA `library://…` URIs only resolve on MA players; play to the selected group's coordinator. |
| Focused group / "master" | **Card-internal** (the last pill tapped), persisted to `localStorage` | Helper-free — no `input_select`. The card derives the *coordinator* of the focused group from live `group_members[0]`. |

Grouping model (live, native — no helpers):
- **Source of truth** = `group_members` on each Sonos `media_player.<room>`. A room is *solo* when
  `group_members` ≤ 1 entry, *grouped* when > 1 with `group_members[0]` = the **coordinator**.
- **Top-nav pills select a group** (focus) — they never join/unjoin. Tapping any speaker re-centres
  the card on the group it belongs to; the coordinator (hence now-playing / transport / playback
  target) is whatever Sonos reports, unchanged by the tap.
- **Right-column rows build the focused group**: add (`join`), remove (`unjoin`), or relocate a room
  from another group (`join` → "Move from \<coordinator\>"). The coordinator row is a no-op anchor.
- **"Make \<room\> its own group"** button (top of the group column) `unjoin`s the focused speaker —
  the only way to split out the coordinator.

Playback is helper-free and generic (nothing here is hard-wired to Apple Music / Audible):
- **Playlists** (`playlists:`) → tiles play via `music_assistant.play_media` on the focused group's
  coordinator `mass_<room>`. Either list explicit `items`, or give a `source` (an MA browse id, e.g.
  a provider's playlists node) and the card **auto-populates** the tiles by browsing it (`hass.callWS`
  `media_player/browse_media`). If the `source` returns nothing it **falls back to discovering** a
  "Playlists" folder from the player's root, logs the browse structure to the console, and shows an
  on-card message instead of a blank grid (no more silent empties). The section heading is configurable.
- **Action buttons** (`actions:`) → a generic list of buttons, each calling a configured `service`.
  For `script.*` services the card injects `target_player` (coordinator's `mass_<room>`) and
  `target_room`; other services receive exactly their configured `data`. Icons are built-in glyph
  names or `mdi:*` (rendered via HA's `<ha-icon>`). An optional `status_entity` drives a live
  subtitle (now-playing title + minutes left). The legacy `audiobook:` block still works (it maps to
  one action). The Audible resume script must read `target_player` instead of an `input_select`
  (one-line change), e.g. `target: { entity_id: "{{ target_player }}" }`.

Rooms (name → Sonos entity → MA entity → default volume %):
- Lounge `media_player.lounge` `media_player.mass_lounge` 29
- Kitchen `media_player.kitchen` `media_player.mass_kitchen` 36
- Master Bedroom `media_player.master_bedroom` `media_player.mass_master_bedroom` 42
- Garage `media_player.garage` `media_player.mass_garage` 25
- Spare Room `media_player.spare_room` `media_player.mass_spare_room` 34
- Hall `media_player.hallway` `media_player.mass_hall` 30  ← note: entity is `hallway`

## Config (YAML) the card accepts
There's also a **visual GUI editor** (`getConfigElement` → `sonos-music-card-editor`): edit the
card in a dashboard to get a form for the rooms (entity pickers, default volume, `mdi:*` icon),
the **shortcuts/scripts** (name + a `script.*` picker + icon → writes `actions:`), the playlists,
`default_room`, and the three compact toggles. It writes the same YAML. When a room has an
`icon`, its top-nav pill becomes icon-only and the icon shows in the group rows. The pill of the
**playing** group's coordinator gets a play watermark behind its (faded) icon (focus is still the
ring) — so it's clear which of several groups is actually playing. In compact mode the open
stage's trigger icon turns into a ✕ (tap it to close, or tap another trigger to switch) — there's
no separate close button stealing a row. (`_text` falls back to a native `<input>` when
`ha-textfield` isn't loaded in the editor context, so the Name / Default-volume fields always
render.)

The **per-room volume sliders** are an album-art "stage" too (always available, no compact flag):
the chevron beside the master slider swaps the album art for the room sliders and back — the old
popover overflowed on phones. On stacked/phone widths an open stage **grows the card** (so the
surrounding popup does the single scroll) rather than scrolling inside the album-art square.
The **colour theme** is configurable (`theme:`, default `ha`): `ha` adopts Home Assistant's theme
surfaces — the card background becomes `--ha-card-background`/`--card-background-color` (translucent
themes like frosted-glass show through, plus a `backdrop-filter` blur), text uses
`--primary-text-color`, and the chrome surfaces/borders are tinted from `--rgb-primary-text-color`
via the `--smc-tint` token (so they adapt to light/dark). The **stage overlays** (groups / playlists
/ shortcuts / volume) are frosted in `ha` too — theme card background + `backdrop-filter` blur — so
they don't drop a dark island into a light dashboard. **Accents** (rings, slider fill, ✓ checks,
active triggers) are tokenised (`--smc-accent` / `--smc-accent-rgb` / `--smc-accent-ink`) and map to
`--primary-color` / `--rgb-primary-color` / `--text-primary-color` in `ha`. The album-art region
(cover, scrim, now-playing, transport, compact triggers) keeps white-on-dark via a tint reset, since
it sits over artwork (and the `.mpct` % stays dark — it's on the white knob). Chrome shadows come
from a `--smc-shadow` token that maps to `--ha-card-box-shadow` in `ha` (so depth matches the
dashboard's cards). Independent of theme, the card samples the cover's luminance and adds `.art.lightart`
when it's a light image, deepening the now-playing scrim so white text/transport stay legible. Open
submenus hide the cover (and use the theme surface behind the frosted stage) so the artwork can't
stretch behind them. `art` is the original wash that recolours from the playing
artwork; `home` is the fixed teal. `art`/`home` are unchanged because `--smc-tint` defaults to
`255,255,255`. The editor has a Theme dropdown.
```yaml
type: custom:sonos-music-card
default_room: media_player.lounge          # optional: which group is focused on first load (localStorage wins after)
theme: ha                                  # ha (adopt HA theme surfaces, default) | art (recolour from album art) | home (fixed teal)
compact_groups: false                      # true → grouped-speaker icon strip on the album art; tap swaps to the group builder
compact_playlists: false                   # true → a playlists icon on the album art; tap swaps to the playlist grid
compact_actions: false                     # true → a shortcuts icon on the album art; tap swaps to the action buttons
rooms:
  - { name: Lounge, entity: media_player.lounge, mass_entity: media_player.mass_lounge, icon: mdi:sofa, default_volume: 29 }
  # …one per room (mass_entity is required for playlist/action playback; icon is optional, mdi:*)

# Generic action buttons (right panel). `audiobook:` is still accepted as a one-item shorthand.
actions:
  title: Audiobook                         # optional section heading (default "Shortcuts")
  items:
    - name: Play current audiobook
      service: script.resume_audiobook_on_master   # script.* gets target_player + target_room injected
      icon: book                                    # built-in glyph name, or mdi:* via <ha-icon>
      status_entity: media_player.mass_lounge       # optional: live subtitle (now-playing + "Xm left")
      subtitle: Resume where you left off           # static fallback subtitle
    # - { name: Evening radio, service: music_assistant.play_media, icon: mdi:radio,
    #     data: { entity_id: media_player.mass_lounge, media_id: library://radio/1, media_type: radio } }

# Playlist tiles — either auto-populate from a Music Assistant source, or list items explicitly.
playlists:
  title: Apple Music playlists             # optional heading
  source: library://playlist               # browse this MA node → one tile per playlist found
  source_type: playlist                    # optional content_type for the browse call
  dedupe: name                             # drop duplicates MA returns: name (default) | id | false
  # browse_entity: media_player.mass_lounge  # optional; defaults to the first room with a mass_entity
  # items:                                  # optional: explicit tiles (override auto-browse)
  #   - { name: Chill, media_id: library://playlist/13, media_type: playlist, image: <art-url> }
```
Builtin action glyphs: `book play star headphones radio clock heart moon bolt music vol bars`
(anything else → `mdi:*`). Find a `source`/`media_id` by opening HA's media browser on the MA
player — the path it shows is the browse id.

## Deploy
This is a file-hosted card (we deliberately moved off the 24 KB inline-resource route):
1. Copy `sonos-music-card.js` to Home Assistant's `/config/www/`.
2. Register the resource once: Settings → Dashboards → ⋮ → Resources → Add
   `url: /local/sonos-music-card.js`, type **JavaScript Module**. (Or via the API /
   `ha_config_set_dashboard_resource(url="/local/sonos-music-card.js")`.)
3. Add the card to a dashboard (a full-width `panel` view works well).
4. **Hard-refresh** after every change (resources are cached): browser Ctrl/Cmd-Shift-R;
   wall tablet → restart Fully Kiosk; phone Companion app → reset frontend cache.

DM Sans font: register `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap`
as a CSS resource (document-level fonts are usable inside shadow DOM).

## Test
There is no browser available in CI / the agent sandbox, so we **cannot visually verify**.
Build defensively (guard missing entities/attributes) and run the DOM-stub smoke test:
```
node test/smoke-test.js sonos-music-card.js
```
It instantiates the card with a stubbed DOM + a realistic `hass`, renders, and fires every
wired event handler. **Acceptance: `errors: 0`.** Always run it (and run it against the
minified output too if you minify) before declaring done. Then ask the user to confirm the
on-device look — never claim the UI is correct from code alone.

## Conventions
- Keep it a single vanilla file, Shadow DOM, zero deps. Don't add a framework or a bundler.
- No comments unless a non-obvious *why* needs recording.
- Optimistic UI: update sliders/toggles immediately on interaction, then reconcile from the
  next `hass` push (and clear optimistic values once HA confirms, or after ~3 s) so changes
  made in **other apps (Sonos/MA)** flow through. This is a core requirement — the card must
  keep up with external state changes.
- Avoid layout shift on state change (e.g. don't add/remove text or change a pill's size
  when it becomes master — use an inset ring/border + dot colour instead).
```
