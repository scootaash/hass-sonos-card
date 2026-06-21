// Minimal DOM stub to smoke-test the card without a browser.
const fs = require("fs");
const file = process.argv[2];

const HANDLERS = [];
function mkEl() {
  const el = {
    _children: [],
    style: new Proxy({}, { get: (t, k) => t[k] || "", set: (t, k, v) => ((t[k] = v), true) }),
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    dataset: { room: "0", pl: "0", act: "0" },
    addEventListener(type, h) { HANDLERS.push({ type, h, el: this }); },
    removeEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    getAttribute() { return null; },
    setAttribute() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 300, height: 20 }; },
    querySelector() { return mkEl(); },
    querySelectorAll(sel) { return mkList(sel); },
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html || ""; },
    set textContent(v) { this._tc = v; },
    get textContent() { return this._tc || ""; },
    set src(v) { this._src = v; },
    crossOrigin: "",
  };
  return el;
}
function mkList(sel) {
  const n = { ".pill": 6, ".grow": 6, ".prow": 6, ".tile": 10, ".abtn": 2, ".slider.master": 2 }[sel] ?? 1;
  return Array.from({ length: n }, mkEl);
}

global.HTMLElement = class { attachShadow() { return (this._sr = mkEl()); } get shadowRoot() { return this._sr; } };
global.ResizeObserver = class { observe() {} disconnect() {} };
global.requestAnimationFrame = (cb) => cb();
global.Image = class { set src(v) { setTimeout(() => this.onload && this.onload(), 0); } };
global.window = { customCards: [], addEventListener() {}, removeEventListener() {} };
global.document = {
  createElement(t) {
    if (t === "canvas") return { width: 0, height: 0, getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(24 * 24 * 4).fill(120) }) }) };
    return mkEl();
  },
  addEventListener() {},
};
let CardClass = null;
global.customElements = { define(name, cls) { if (name === "sonos-music-card") CardClass = cls; }, get() { return null; } };

eval(fs.readFileSync(file, "utf8"));

// realistic-ish hass — live native grouping via group_members.
// Topology exercised: Master Bedroom + Kitchen are one group (MB coordinator);
// Lounge + Garage are another group (Lounge coordinator); Spare Room and Hall solo.
const A = (extra) => Object.assign({ volume_level: 0.3, media_content_type: "music", group_members: [] }, extra);
const hass = {
  callService(d, s, data) { /* record */ (hass._calls = hass._calls || []).push([d, s, data]); },
  // Browse stub — exercises the auto-populate-playlists path.
  callWS(msg) {
    (hass._ws = hass._ws || []).push(msg);
    return Promise.resolve({ children: [
      { title: "Coastal Mornings", media_content_id: "library://playlist/42", media_content_type: "playlist", thumbnail: "/api/media_proxy/42.jpg", can_play: true },
      { title: "Deep Focus", media_content_id: "library://playlist/43", media_content_type: "playlist", thumbnail: null, can_play: true },
      { title: "Not playable", media_content_id: "x", can_play: false, can_expand: false },
    ] });
  },
  states: {
    "media_player.master_bedroom": { state: "playing", attributes: A({ media_title: "Coast lines", media_artist: "Marlow Bay", media_duration: 238, media_position: 94, media_position_updated_at: new Date().toISOString(), entity_picture: "/api/media_player_proxy/media_player.master_bedroom?token=x", volume_level: 0.5, friendly_name: "Master Bedroom", group_members: ["media_player.master_bedroom", "media_player.kitchen"] }) },
    "media_player.kitchen": { state: "playing", attributes: A({ volume_level: 0.36, friendly_name: "Kitchen", group_members: ["media_player.master_bedroom", "media_player.kitchen"] }) },
    "media_player.lounge": { state: "playing", attributes: A({ volume_level: 0.29, friendly_name: "Lounge", group_members: ["media_player.lounge", "media_player.garage"] }) },
    "media_player.garage": { state: "playing", attributes: A({ volume_level: 0.25, friendly_name: "Garage", group_members: ["media_player.lounge", "media_player.garage"] }) },
    "media_player.spare_room": { state: "paused", attributes: A({ volume_level: 0.34, friendly_name: "Spare Room", group_members: ["media_player.spare_room"] }) },
    "media_player.hallway": { state: "idle", attributes: A({ volume_level: 0.3, friendly_name: "Hall", group_members: ["media_player.hallway"] }) },
    "media_player.mass_master_bedroom": { state: "playing", attributes: A({ media_title: "The Salt Path", media_duration: 15120, media_position: 480, media_position_updated_at: new Date().toISOString(), media_content_type: "audiobook" }) },
  },
};
const cfg = {
  default_room: "media_player.kitchen",
  // Exercise all three album-art "stage" overlays (groups / playlists / shortcuts).
  compact_groups: true,
  compact_playlists: true,
  compact_actions: true,
  rooms: [
    { name: "Lounge", entity: "media_player.lounge", mass_entity: "media_player.mass_lounge", icon: "mdi:sofa", default_volume: 29 },
    { name: "Kitchen", entity: "media_player.kitchen", mass_entity: "media_player.mass_kitchen", icon: "mdi:fridge", default_volume: 36 },
    { name: "Master Bedroom", entity: "media_player.master_bedroom", mass_entity: "media_player.mass_master_bedroom", default_volume: 42 },
    { name: "Garage", entity: "media_player.garage", mass_entity: "media_player.mass_garage", default_volume: 25 },
    { name: "Spare Room", entity: "media_player.spare_room", mass_entity: "media_player.mass_spare_room", default_volume: 34 },
    { name: "Hall", entity: "media_player.hallway", mass_entity: "media_player.mass_hall", default_volume: 30 },
  ],
  // Generic action buttons: a script (gets target_player injected) + a direct MA call with an MDI icon.
  actions: {
    title: "Audiobook",
    items: [
      { name: "Play current audiobook", service: "script.resume_audiobook_on_master", icon: "book", status_entity: "media_player.mass_master_bedroom", subtitle: "Resume where you left off" },
      { name: "Evening radio", service: "music_assistant.play_media", icon: "mdi:radio", data: { entity_id: "media_player.mass_kitchen", media_id: "library://radio/1", media_type: "radio" } },
    ],
  },
  // Auto-populated playlists: no explicit items, browse a Music Assistant source.
  playlists: { title: "Apple Music playlists", source: "library://playlist", source_type: "playlist" },
};

const card = new CardClass();
card.setConfig(cfg);
card.connectedCallback();
card.hass = hass;        // triggers build + update
card.hass = hass;        // second update (no rebuild)
card.getCardSize();

// fire every wired handler to exercise interactions (set master, toggle group, transport, volume drag, playlists, audiobook)
const fakeEvent = () => ({ clientX: 60, preventDefault() {}, stopPropagation() {}, composedPath: () => [], target: mkEl(), currentTarget: mkEl() });
let fired = 0, errs = 0;
for (const { type, h, el } of HANDLERS) {
  try { const e = fakeEvent(); e.currentTarget = el; h(e); fired++; }
  catch (err) { errs++; console.log("HANDLER ERR [" + type + "]:", err.message); }
}
card.hass = hass; // re-render after interactions

// Let the async playlist browse resolve, then re-render and report.
(async () => {
  await new Promise((r) => setTimeout(r, 20));
  try { card.hass = hass; } catch (err) { errs++; console.log("POST-BROWSE ERR:", err.message); }
  // The render error boundary must not have fired (it swallows throws into a message).
  if (card._lastError) { errs++; console.log("RENDER BOUNDARY TRIPPED:", card._lastError.message); }
  card.disconnectedCallback();
  console.log("handlers fired:", fired, "errors:", errs, "serviceCalls:", (hass._calls || []).length, "browsedPlaylists:", (card._playlists || []).length);
  console.log(errs ? "SMOKE FAIL: " + file : "SMOKE OK: " + file);
  process.exit(errs ? 1 : 0);
})();
