# CLAUDE.md — fraser-music-card

Guidance for Claude Code working in this repo.

## What this is
A **Home Assistant custom Lovelace card** (frontend only) — an "Immersive" multi-room
music player for a Sonos + Music Assistant household. It is **not** an integration / Python
`custom_component`: it has no backend, no entities, no services of its own. It reads the
`hass` object and calls existing services. Treat any urge to add a Python component as a
smell — the data (`group_members`, `media_*`, `volume_level`) and actions
(`media_player.join`/`unjoin`/`volume_set`, `music_assistant.play_media`) already exist.

- **One self-contained vanilla ES module.** No framework, no imports, no build required.
  HA loads `fraser-music-card.js` directly as a JS module. (Lit/TS would add a build
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
| Group add/remove | `media_player.join` / `media_player.unjoin` on the **Sonos** entities | Native Sonos grouping; visible everywhere. |
| Play a playlist / album / track | `music_assistant.play_media` on the **MA** `media_player.mass_<room>` | MA `library://…` URIs only resolve on MA players. |
| "Master" room | `input_select.sonos_master` (holds the room *name*) | Shared with the play-scripts below; tidy single helper. |

Play-scripts (already exist; the card calls these, or MA directly):
- `script.music_play_on_master(media_id, media_type, enqueue)` — maps `input_select.sonos_master`
  → `media_player.mass_<room>` and calls `music_assistant.play_media`.
- `script.resume_audiobook_on_master` → delegates to `script.play_recent_audible_audiobook`.

Rooms (name → Sonos entity → MA entity → input_select option → default volume %):
- Lounge `media_player.lounge` `media_player.mass_lounge` "Lounge" 29
- Kitchen `media_player.kitchen` `media_player.mass_kitchen` "Kitchen" 36
- Master Bedroom `media_player.master_bedroom` `media_player.mass_master_bedroom` "Master Bedroom" 42
- Garage `media_player.garage` `media_player.mass_garage` "Garage" 25
- Spare Room `media_player.spare_room` `media_player.mass_spare_room` "Spare Room" 34
- Hall `media_player.hallway` `media_player.mass_hall` "Hall" 30  ← note: entity is `hallway`

> Migration in progress: the original card drove grouping through six
> `input_boolean.sonos_group_*` helpers. We are **removing those** in favour of live
> `group_members` + join/unjoin. See `NEXT_PROMPT.md`.

## Config (YAML) the card accepts
```yaml
type: custom:fraser-music-card
master_entity: input_select.sonos_master
play_script: script.music_play_on_master           # or omit to call music_assistant.play_media directly
audiobook:
  resume_script: script.resume_audiobook_on_master
rooms:
  - { name: Lounge, entity: media_player.lounge, mass_entity: media_player.mass_lounge, master_option: Lounge, default_volume: 29 }
  # …one per room
playlists:
  - { name: Chill, media_id: library://playlist/13, media_type: playlist }
  - { name: Favourite Songs, media_id: library://playlist/17, media_type: playlist, image: <art-url> }
  # …
```

## Deploy
This is a file-hosted card (we deliberately moved off the 24 KB inline-resource route):
1. Copy `fraser-music-card.js` to Home Assistant's `/config/www/`.
2. Register the resource once: Settings → Dashboards → ⋮ → Resources → Add
   `url: /local/fraser-music-card.js`, type **JavaScript Module**. (Or via the API /
   `ha_config_set_dashboard_resource(url="/local/fraser-music-card.js")`.)
3. Add the card to a dashboard (a full-width `panel` view works well).
4. **Hard-refresh** after every change (resources are cached): browser Ctrl/Cmd-Shift-R;
   wall tablet → restart Fully Kiosk; phone Companion app → reset frontend cache.

DM Sans font: register `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap`
as a CSS resource (document-level fonts are usable inside shadow DOM).

## Test
There is no browser available in CI / the agent sandbox, so we **cannot visually verify**.
Build defensively (guard missing entities/attributes) and run the DOM-stub smoke test:
```
node test/smoke-test.js fraser-music-card.js
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
