# fraser-music-card

An immersive multi-room music player **custom Lovelace card** for Home Assistant, built for a
Sonos + Music Assistant household and a wall-mounted tablet (1280×800), responsive down to
phones. Album-art colour wash, master/speaker selector, live speaker grouping, custom volume
sliders with a per-room popover, Apple Music (via Music Assistant) playlist tiles, and an
audiobook resume button.

It is a **frontend card only** — no integration / Python component. It reads `hass` state and
calls existing services (`media_player.*`, `music_assistant.play_media`).

## Install
1. Copy `fraser-music-card.js` into your HA `/config/www/` folder.
2. Add a dashboard resource: **Settings → Dashboards → ⋮ → Resources → Add**
   - URL: `/local/fraser-music-card.js`
   - Type: **JavaScript Module**
3. (For the exact font) add a second resource, type **Stylesheet**:
   `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap`
4. Add the card to a dashboard — a full-width `panel` view is ideal. Example config and the
   entity model are in [`CLAUDE.md`](CLAUDE.md).
5. Hard-refresh (resources are cached).

## Develop
```
npm install      # only needed if you want to minify
npm test         # node DOM-stub smoke test — must report "errors: 0"
npm run minify   # optional: dist/fraser-music-card.min.js
```
There's no headless browser here, so the smoke test validates logic, not pixels — verify the
look on a real device.

- `CLAUDE.md` — architecture, entity/service model, conventions (read this first).
- `design/` — the design source of truth (the "Immersive" prototype) + original brief.
- `NEXT_PROMPT.md` — the current roadmap task (live native grouping + group-aware visuals).

## Status / roadmap
Grouping is **live and native**: the card reads Sonos `group_members` and acts via
`media_player.join`/`unjoin`, so groups formed in the Sonos app appear within ~1 s. Top-nav pills
select which group is focused; the right column adds/removes/relocates speakers. It's helper-free
(no `input_boolean`/`input_select`) — the focused room is tracked internally and persisted per device.

## License
MIT
