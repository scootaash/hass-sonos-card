// Minimal DOM stub to smoke-test the card without a browser.
const fs = require("fs");
const file = process.argv[2];

const HANDLERS = [];
function mkEl() {
  const el = {
    _children: [],
    style: new Proxy({}, { get: (t, k) => t[k] || "", set: (t, k, v) => ((t[k] = v), true) }),
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    dataset: { room: "0", pl: "0" },
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
  const n = { ".pill": 6, ".grow": 6, ".prow": 6, ".tile": 10, ".slider.master": 2 }[sel] ?? 1;
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
global.customElements = { define(name, cls) { CardClass = cls; }, get() { return null; } };

eval(fs.readFileSync(file, "utf8"));

// realistic-ish hass
const A = (extra) => Object.assign({ volume_level: 0.3, media_content_type: "music", group_members: [] }, extra);
const hass = {
  callService(d, s, data) { /* record */ (hass._calls = hass._calls || []).push([d, s, data]); },
  states: {
    "input_select.sonos_master": { state: "Master Bedroom", attributes: { options: ["Garage", "Master Bedroom", "Kitchen", "Spare Room", "Lounge", "Hall"] } },
    "input_boolean.sonos_group_kitchen": { state: "on", attributes: {} },
    "input_boolean.sonos_group_lounge": { state: "off", attributes: {} },
    "input_boolean.sonos_group_master_bedroom": { state: "off", attributes: {} },
    "input_boolean.sonos_group_garage": { state: "off", attributes: {} },
    "input_boolean.sonos_group_spare_room": { state: "off", attributes: {} },
    "input_boolean.sonos_group_hall": { state: "off", attributes: {} },
    "media_player.master_bedroom": { state: "playing", attributes: A({ media_title: "Coast lines", media_artist: "Marlow Bay", media_duration: 238, media_position: 94, media_position_updated_at: new Date().toISOString(), entity_picture: "/api/media_player_proxy/media_player.master_bedroom?token=x", volume_level: 0.5 }) },
    "media_player.kitchen": { state: "playing", attributes: A({ volume_level: 0.36 }) },
    "media_player.lounge": { state: "idle", attributes: A({ volume_level: 0.29 }) },
    "media_player.garage": { state: "idle", attributes: A({ volume_level: 0.25 }) },
    "media_player.spare_room": { state: "paused", attributes: A({ volume_level: 0.34 }) },
    "media_player.hallway": { state: "idle", attributes: A({ volume_level: 0.3 }) },
  },
};
const cfg = {
  master_entity: "input_select.sonos_master",
  rooms: [
    { name: "Lounge", entity: "media_player.lounge", group_boolean: "input_boolean.sonos_group_lounge", master_option: "Lounge", default_volume: 29 },
    { name: "Kitchen", entity: "media_player.kitchen", group_boolean: "input_boolean.sonos_group_kitchen", master_option: "Kitchen", default_volume: 36 },
    { name: "Master Bedroom", entity: "media_player.master_bedroom", group_boolean: "input_boolean.sonos_group_master_bedroom", master_option: "Master Bedroom", default_volume: 42 },
    { name: "Garage", entity: "media_player.garage", group_boolean: "input_boolean.sonos_group_garage", master_option: "Garage", default_volume: 25 },
    { name: "Spare Room", entity: "media_player.spare_room", group_boolean: "input_boolean.sonos_group_spare_room", master_option: "Spare Room", default_volume: 34 },
    { name: "Hall", entity: "media_player.hallway", group_boolean: "input_boolean.sonos_group_hall", master_option: "Hall", default_volume: 30 },
  ],
  playlists: Array.from({ length: 10 }, (_, i) => ({ name: "PL" + i, media_id: "library://playlist/" + i, media_type: "playlist", image: i % 2 ? "http://x/" + i + ".jpg" : undefined })),
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

card.disconnectedCallback();
console.log("handlers fired:", fired, "errors:", errs, "serviceCalls:", (hass._calls || []).length);
console.log(errs ? "SMOKE FAIL: " + file : "SMOKE OK: " + file);
process.exit(errs ? 1 : 0);
