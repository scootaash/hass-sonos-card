/* Sonos Music Card — multi-room music player (Immersive) for Home Assistant.
   Live native Sonos grouping (group_members + join/unjoin), helper-free. */
const TEAL = "linear-gradient(155deg,#0c4a5a 0%,#0a3140 52%,#06222e 100%)";
const VERSION = "0.15.0";
const ICON = {
  prev: '<polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line>',
  next: '<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"></line>',
  move: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>',
  exit: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  split: '<polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>',
  close: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.6L3 8"></path><path d="M3 3v5h5"></path>',
  vol: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>',
  chev: '<polyline points="6 9 12 15 18 9"></polyline>',
  bars: '<line x1="4" y1="21" x2="4" y2="11"></line><line x1="12" y1="21" x2="12" y2="4"></line><line x1="20" y1="21" x2="20" y2="14"></line>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
  play: '<polygon points="5 3 19 12 5 21 5 3"></polygon>',
  star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"></polygon>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
  radio: '<circle cx="12" cy="12" r="2"></circle><path d="M4.93 19.07a10 10 0 0 1 0-14.14M7.76 16.24a6 6 0 0 1 0-8.49M16.24 7.76a6 6 0 0 1 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14"></path>',
  clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  music: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
};
const GRADS = ["#1bb6c7,#0c5f72", "#5a3fa6,#2f2170", "#e8913a,#a8451f", "#c0395f,#7a1f3a"];
const svg = (p, w = 24, sw = 2, fill = "none") =>
  `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="${fill}" stroke="${fill === "none" ? "currentColor" : "none"}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const playIco = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>';
const pauseIco = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"></rect><rect x="14" y="5" width="4" height="14" rx="1.2"></rect></svg>';
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (s) => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

class SonosMusicCard extends HTMLElement {
  setConfig(config) {
    if (!config || !Array.isArray(config.rooms) || !config.rooms.length)
      throw new Error("sonos-music-card: `rooms` must be a non-empty list, each with at least an `entity` (the Sonos media_player.*). See the README for an example.");
    this._cfg = config;
    this._rooms = config.rooms.map((r) => ({
      name: r.name || r.entity,
      entity: r.entity,
      massEntity: r.mass_entity || null,
      icon: r.icon || null,
      def: r.default_volume != null ? r.default_volume : 40,
    }));
    const noEntity = this._rooms.find((r) => !r.entity);
    if (noEntity) throw new Error("sonos-music-card: every room needs an `entity` (its Sonos media_player.*); add it to: " + JSON.stringify(noEntity.name || "(unnamed room)"));
    // Action buttons — generic list; legacy `audiobook:` maps to a single action.
    const ab = config.audiobook;
    const actionsCfg = config.actions || (ab ? {
      title: "Audiobook",
      items: [{ name: "Play current audiobook", service: ab.resume_script || "script.resume_audiobook_on_master", icon: "book", status_entity: ab.source_entity || null, subtitle: "Resume where you left off" }],
    } : null);
    this._actionsTitle = (actionsCfg && actionsCfg.title) || "Shortcuts";
    this._actions = ((actionsCfg && actionsCfg.items) || []).map((a) => ({
      name: a.name || "Run", service: a.service || "", data: a.data || a.service_data || {},
      icon: a.icon || "play", statusEntity: a.status_entity || null, subtitle: a.subtitle || "",
    }));
    // Playlists — single section; either explicit `items` or auto-browse a `source`.
    const plCfg = Array.isArray(config.playlists) ? { items: config.playlists } : (config.playlists || {});
    this._playlistsConfigured = config.playlists != null;
    this._playlistsTitle = plCfg.title || "Playlists";
    this._playlistSource = plCfg.source || null;
    this._playlistSourceType = plCfg.source_type || "playlist";
    this._playlistBrowseEntity = plCfg.browse_entity || null;
    this._playlistDedupe = plCfg.dedupe === undefined ? "name" : plCfg.dedupe; // "name" (default) | "id" | false
    this._playlistItems = (plCfg.items || []).map((p) => ({ name: p.name, media_id: p.media_id, media_type: p.media_type || "playlist", image: p.image || null }));
    this._playlists = this._playlistItems.slice();
    this._playlistMsg = (this._playlistsConfigured && !this._playlistItems.length) ? "Loading playlists…" : null;
    this._browsed = false;
    this._compactGroups = !!config.compact_groups;   // groups → icon strip on the art, tap to open
    this._compactPlaylists = !!config.compact_playlists; // playlists → icon on the art, tap to open
    this._compactActions = !!config.compact_actions; // shortcuts → icon on the art, tap to open
    // Colour theme: ha = derive from Home Assistant's theme (default); art = recolour
    // from the playing album art (the original immersive wash); home = fixed teal.
    const th = (config.theme || "ha").toString().toLowerCase();
    this._theme = th === "art" || th === "home" ? th : "ha";
    this._stage = "art";                              // album-art "stage": art | groups | playlists | actions | volume
    this._focusKey = "smc-focus:" + this._rooms[0].entity;
    this._cfgDefaultFocus = config.default_room || null;
    this._focusEntity = null;
    this._localGroup = {};
    this._drag = null;
    this._localVol = {};
    this._localVolAt = {};
    this._lastPic = undefined;
    this._pillColor = null;
    this._built = false;
    if (this.shadowRoot) this._built = false;
  }

  set hass(hass) {
    this._hass = hass;
    try {
      if (!this._built) this._build();
      this._update();
      this._errored = false; this._lastError = null;
    } catch (e) { this._renderError(e); return; }
    this._browsePlaylists();
  }
  getCardSize() { return 14; }
  // Visual GUI editor (shown when editing the card in a dashboard).
  static getConfigElement() { return document.createElement("sonos-music-card-editor"); }
  static getStubConfig(hass) {
    const players = hass ? Object.keys(hass.states).filter((e) => e.startsWith("media_player.") && !e.includes("mass_")) : [];
    const e = players[0] || "media_player.living_room";
    const name = (hass && hass.states[e] && hass.states[e].attributes.friendly_name) || "Room 1";
    return { rooms: [{ name, entity: e, default_volume: 30 }] };
  }
  connectedCallback() {
    try { if (this._hass && !this._built) this._build(); } catch (e) { this._renderError(e); }
    this._timer = setInterval(() => { if (this._errored || !this._hass) return; try { this._update(); } catch (e) { this._renderError(e); } }, 500);
    this._observe();
  }
  // Attach the ResizeObserver to the (possibly just-built) root. Build and connect
  // can happen in either order, so (re)observe whenever we have a root.
  _observe() {
    if (!this._root || typeof ResizeObserver === "undefined") return;
    if (!this._ro) this._ro = new ResizeObserver(() => this._resize());
    this._ro.disconnect();
    this._ro.observe(this._root);
    requestAnimationFrame(() => this._resize());
  }
  disconnectedCallback() {
    clearInterval(this._timer);
    if (this._ro) this._ro.disconnect();
  }
  // Render error boundary — never leave a blank card; show why + how to fix.
  _renderError(err) {
    this._errored = true; this._lastError = err;
    try { console.error("sonos-music-card:", err); } catch (e) {}
    const root = this.shadowRoot || (this.attachShadow ? this.attachShadow({ mode: "open" }) : this);
    const msg = esc(err && err.message ? err.message : String(err));
    try {
      root.innerHTML = `<div style="font-family:'DM Sans',system-ui,sans-serif;background:linear-gradient(155deg,#3a1320,#2a0e18);color:#fff;border:1px solid #a83a52;border-radius:16px;padding:20px 22px;line-height:1.45;">
        <div style="font-weight:700;font-size:15px;margin-bottom:8px">Sonos Music Card couldn't render</div>
        <div style="font-size:13px;white-space:pre-wrap;color:#ffd9e0">${msg}</div>
        <div style="font-size:12px;margin-top:10px;color:rgba(255,255,255,.7)">If you just changed the config or updated the card, hard-refresh to clear the cached version (Ctrl/Cmd-Shift-R) and check Settings → Dashboards → Resources has a single, up-to-date entry. Loaded card version: v${VERSION}.</div>
      </div>`;
    } catch (e) {}
  }

  _st(id) { return this._hass && this._hass.states[id]; }
  _roomByEntity(eid) { return this._rooms.find((r) => r.entity === eid); }
  _friendly(eid) { const st = this._st(eid); return (st && st.attributes && st.attributes.friendly_name) || eid; }
  // Live Sonos topology: each room's group_members (>=1, with [0] = coordinator).
  _groupMembersOf(r) {
    const s = this._st(r.entity); const gm = s && s.attributes.group_members;
    return Array.isArray(gm) && gm.length ? gm : [r.entity];
  }
  // Optimistic grouping override (short TTL) so a join/unjoin feels instant but
  // external Sonos/MA changes still reconcile within a few seconds.
  _freshOpt(eid) {
    const o = this._localGroup[eid]; if (!o) return null;
    if (Date.now() - o.at > 3000) { delete this._localGroup[eid]; return null; }
    return o;
  }
  _optGroup(eid, inb) { this._localGroup[eid] = { in: inb, at: Date.now() }; }
  // The "focused" room = the pill the user last selected (defaults to a playing
  // room). Selecting a pill never joins/unjoins — it just re-centres the card.
  _focusRoom() { return this._rooms.find((r) => r.entity === this._focusEntity) || this._rooms[0]; }
  // Effective membership of the selected group (focus's group + optimistic edits).
  _effMembers() {
    const focus = this._focusRoom();
    const fo = this._freshOpt(focus.entity);
    if (fo && fo.in === false) return new Set([focus.entity]); // optimistic split → solo
    const set = new Set(this._groupMembersOf(focus)); set.add(focus.entity);
    for (const r of this._rooms) {
      const o = this._freshOpt(r.entity);
      if (o) { if (o.in) set.add(r.entity); else if (r.entity !== focus.entity) set.delete(r.entity); }
    }
    set.add(focus.entity);
    return set;
  }
  // Real Sonos coordinator of the selected group (drives now-playing / playback).
  _coordEntity() {
    const focus = this._focusRoom();
    const fo = this._freshOpt(focus.entity);
    if (fo && fo.in === false) return focus.entity;
    const gm = this._groupMembersOf(focus); const m = this._effMembers();
    return m.has(gm[0]) ? gm[0] : focus.entity;
  }
  _coordRoom() { return this._roomByEntity(this._coordEntity()) || this._focusRoom(); }
  // Control entity for a room: the Music Assistant player when present, else the
  // Sonos entity. Stream/queue control (grouping + transport) goes through MA so
  // there's a single controller — native Sonos control while MA streams drops the
  // audiobook ("too many requests from too many sources"). State is still READ from
  // the Sonos entity (group_members / now-playing / art), which MA keeps accurate.
  _massOf(r) { return (r && r.massEntity) || (r && r.entity) || null; }
  _grouped() { const m = this._effMembers(); return this._rooms.filter((r) => m.has(r.entity)); }
  _loadFocus() { try { const v = localStorage.getItem(this._focusKey); return (v && this._rooms.some((r) => r.entity === v)) ? v : null; } catch (e) { return null; } }
  _defaultFocus() {
    if (this._cfgDefaultFocus && this._rooms.some((r) => r.entity === this._cfgDefaultFocus)) return this._cfgDefaultFocus;
    const p = this._rooms.find((r) => { const s = this._st(r.entity); return s && s.state === "playing"; });
    return (p || this._rooms[0]).entity;
  }
  _persistFocus() { try { localStorage.setItem(this._focusKey, this._focusEntity); } catch (e) {} }
  _vol(r) {
    if (this._localVol[r.entity] != null) return this._localVol[r.entity];
    const s = this._st(r.entity);
    return s && s.attributes.volume_level != null ? Math.round(s.attributes.volume_level * 100) : 0;
  }

  _build() {
    this._built = true;
    this._lastStageRender = null;
    this._lastPic = undefined;
    const root = this.attachShadow ? (this.shadowRoot || this.attachShadow({ mode: "open" })) : this;
    const pbg = `<span class="pbg">${svg(ICON.play, 30, 0, "currentColor")}</span>`;
    const pills = this._rooms.map((r, i) =>
      r.icon
        ? `<button class="pill picon" data-room="${i}" title="${esc(r.name)}" aria-label="${esc(r.name)}">${pbg}${this._icon(r.icon, 20)}</button>`
        : `<button class="pill" data-room="${i}">${pbg}<span class="dot"></span><span class="pn">${esc(r.name)}</span></button>`).join("");
    const grows = this._rooms.map((r, i) =>
      `<div class="grow" data-room="${i}">${r.icon ? `<span class="gicon">${this._icon(r.icon, 22)}</span>` : ""}<div class="gtext"><span class="gn">${esc(r.name)}</span><span class="gs"></span></div><button class="gtog" data-room="${i}"></button></div>`).join("");
    const actionBtns = this._actions.map((a, i) =>
      `<button class="abtn" data-act="${i}"><span class="abic">${this._icon(a.icon, 22)}</span><span style="min-width:0"><span class="abt1">${esc(a.name)}</span><span class="abt2"></span></span></button>`).join("");
    const popRooms = this._rooms.map((r, i) =>
      `<div class="prow" data-room="${i}"><div class="prhead"><span class="prn">${esc(r.name)}</span><div class="prr"><button class="prdef" data-room="${i}" aria-label="Reset to default">${svg(ICON.reset, 14, 2.2)}</button><span class="prpct"></span></div></div><div class="prslide"><button class="vbtn rdn" data-room="${i}" aria-label="Volume down">${svg(ICON.minus, 16, 2.6)}</button><div class="slider sm" data-room="${i}"><div class="strack"><div class="sfill"></div><div class="sknob"></div></div></div><button class="vbtn rup" data-room="${i}" aria-label="Volume up">${svg(ICON.plus, 16, 2.6)}</button></div></div>`).join("");
    const cg = this._compactGroups, cp = this._compactPlaylists, ca = this._compactActions;
    const showAct = ca && this._actions.length;       // compact shortcuts only meaningful with actions
    const panelActions = !ca && this._actions.length;  // actions live in the side panel unless compact
    const groupBuilder = `<div class="gchead"><span class="ovl">Tap to add to group</span><div class="ghbtns"><button class="addall" style="display:none"></button><button class="splitbtn" style="display:none"></button></div></div><div class="glist">${grows}</div>`;
    const playlistGrid = `<span class="ovl"${panelActions && !cp ? ' style="margin-top:4px"' : ""}>${esc(this._playlistsTitle)}</span><div class="grid"></div>`;
    const panelHasContent = panelActions || (!cp && this._playlistsConfigured);

    root.innerHTML = `<style>
:host{display:block;--smc-tint:255,255,255;--smc-accent:#18b2c4;--smc-accent-rgb:0,204,204;--smc-accent-ink:#06303d;--smc-shadow:0 1px 4px rgba(0,0,0,.14);}
*{box-sizing:border-box;}
@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.root{position:relative;width:100%;max-width:1280px;margin:0 auto;border-radius:20px;overflow:hidden;background:${TEAL};font-family:'DM Sans',system-ui,sans-serif;color:#fff;}
.wash{position:absolute;inset:0;background:${TEAL};transition:opacity .3s;z-index:0;}
.blob{position:absolute;border-radius:99px;filter:blur(20px);z-index:0;}
.b1{top:-160px;left:-120px;width:620px;height:620px;background:radial-gradient(circle,rgba(var(--smc-accent-rgb),.45),transparent 65%);}
.b2{bottom:-200px;right:120px;width:560px;height:560px;background:radial-gradient(circle,rgba(13,90,110,.6),transparent 65%);}
/* theme: ha — adopt the Home Assistant theme's card surface + text, and tint the
   chrome from the theme text colour (so it matches frosted-glass / any HA theme). */
.root.theme-ha{background:var(--ha-card-background,var(--card-background-color,${TEAL}));color:var(--primary-text-color,#fff);--smc-tint:var(--rgb-primary-text-color,255,255,255);--smc-accent:var(--primary-color,#18b2c4);--smc-accent-rgb:var(--rgb-primary-color,0,204,204);--smc-accent-ink:var(--text-primary-color,#06303d);--smc-shadow:var(--ha-card-box-shadow,0 2px 9px rgba(0,0,0,.16));backdrop-filter:blur(16px) saturate(1.25);-webkit-backdrop-filter:blur(16px) saturate(1.25);}
.root.theme-ha .wash,.root.theme-ha .blob{display:none;}
.root.theme-ha .scrim,.root.theme-ha .topstrip{--smc-tint:255,255,255;}
/* Frosted theme: read on a light surface. Stages are opaque (a solid theme
   floor under the translucent card surface) so the album-art placeholder can't
   bleed through; buttons are defined by a stronger fill + border + drop shadow
   rather than a faint tint. */
.root.theme-ha .stageovl{background:var(--ha-card-background,var(--card-background-color,#0c4a5a)),var(--ha-card-background,var(--card-background-color,#0c4a5a)),var(--ha-card-background,var(--card-background-color,#0c4a5a)),var(--primary-background-color,#0c4a5a);backdrop-filter:blur(22px) saturate(1.3);-webkit-backdrop-filter:blur(22px) saturate(1.3);}
.root.theme-ha .pill{color:rgba(var(--smc-tint),.95);}
.root.theme-ha .pill:not(.current),.root.theme-ha .vbtn:not(.act):not(.active){background:rgba(var(--smc-tint),.12);border-color:rgba(var(--smc-tint),.32);box-shadow:var(--smc-shadow);}
.root.theme-ha .volrow{background:rgba(var(--smc-tint),.1);border-color:rgba(var(--smc-tint),.26);box-shadow:var(--smc-shadow);}
.root.theme-ha .grow:not(.grp):not(.master),.root.theme-ha .abtn{background:rgba(var(--smc-tint),.13);border-color:rgba(var(--smc-tint),.28);}
.root.theme-ha .grow.grp{background:rgba(var(--smc-accent-rgb),.2);}
.root.theme-ha .grow:not(.master),.root.theme-ha .abtn,.root.theme-ha .panel,.root.theme-ha .stageovl{box-shadow:var(--smc-shadow);}
.wrap{position:relative;z-index:1;display:flex;gap:36px;padding:40px;}
.left{flex:1;display:flex;flex-direction:column;gap:22px;min-width:0;}
.ovl{font:700 11px/1.2 'DM Sans';letter-spacing:.16em;text-transform:uppercase;color:rgba(var(--smc-tint),.55);}
.col{display:flex;flex-direction:column;gap:10px;}
.pillrow{display:grid;grid-template-columns:repeat(var(--pcols,6),auto);gap:10px;justify-content:start;align-items:start;}
.pill{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 16px;border-radius:99px;border:1px solid rgba(var(--smc-tint),.16);background:rgba(var(--smc-tint),.07);color:rgba(var(--smc-tint),.78);font:500 14px/1 'DM Sans';cursor:pointer;transition:opacity .2s;}
.pill.picon{padding:9px 12px;}
.pill.picon ha-icon{--mdc-icon-size:22px;display:block;}
.pill .dot,.pill .pn,.pill.picon>svg,.pill.picon>ha-icon{position:relative;z-index:1;}
.pbg{position:absolute;inset:0;z-index:0;display:none;align-items:center;justify-content:center;color:rgba(var(--smc-tint),.6);pointer-events:none;}
.pill.playing-bg .pbg{display:flex;}
.pill.playing-bg>svg,.pill.playing-bg>ha-icon,.pill.playing-bg .dot,.pill.playing-bg .pn{opacity:.32;}
.pill .dot{width:7px;height:7px;border-radius:99px;background:rgba(var(--smc-tint),.3);}
.pill.current{background:rgba(var(--smc-accent-rgb),.16);border-color:rgba(var(--smc-accent-rgb),.55);color:rgba(var(--smc-tint),.95);box-shadow:inset 0 0 0 2px var(--smc-accent);}
.pill.current .dot{background:var(--smc-accent);box-shadow:0 0 0 3px rgba(var(--smc-accent-rgb),.55);}
.pill.follower{opacity:.55;background:rgba(var(--smc-tint),.04);border-color:rgba(var(--smc-tint),.1);color:rgba(var(--smc-tint),.6);}
.pill.follower:hover{opacity:.85;}
.pill.follower .dot{background:rgba(var(--smc-tint),.25);}
.player{flex:1;display:flex;gap:22px;min-height:0;}
.art{position:relative;flex:none;width:498px;height:498px;border-radius:20px;overflow:hidden;background:linear-gradient(150deg,#1bb6c7,#0c5f72 48%,#07303f);}
.cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.scrim{position:absolute;left:0;right:0;bottom:0;padding:22px 26px 24px;background:linear-gradient(to top,rgba(4,22,30,.92),transparent);transition:opacity .28s;}
.player.cg{justify-content:center;}
.player.cg .art{flex:1;width:auto;height:auto;aspect-ratio:1/1;max-width:560px;max-height:100%;}
.topstrip{position:absolute;top:0;left:0;right:0;z-index:3;display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:14px 14px 30px;pointer-events:none;background:linear-gradient(to bottom,rgba(4,22,30,.82),rgba(4,22,30,.34) 52%,transparent);}
.gstrip{pointer-events:auto;display:flex;align-items:center;gap:7px;cursor:pointer;padding:6px 9px;border-radius:99px;background:rgba(4,22,30,.32);backdrop-filter:blur(9px) saturate(1.4);-webkit-backdrop-filter:blur(9px) saturate(1.4);box-shadow:inset 0 0 0 1px rgba(var(--smc-tint),.14);}
.gstrip:empty{display:none;}
.gstrip.active{background:rgba(var(--smc-accent-rgb),.5);box-shadow:inset 0 0 0 2px rgba(var(--smc-accent-rgb),.9);}
.gsi{width:40px;height:40px;border-radius:50%;background:rgba(var(--smc-tint),.2);display:inline-flex;align-items:center;justify-content:center;color:#fff;font:700 15px/1 'DM Sans';}
.gsi ha-icon{--mdc-icon-size:22px;}
.trigs{pointer-events:auto;display:flex;align-items:center;gap:8px;flex:none;}
.pltrig,.actrig{pointer-events:auto;width:49px;height:49px;border-radius:50%;border:none;background:rgba(4,22,30,.42);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(9px) saturate(1.4);-webkit-backdrop-filter:blur(9px) saturate(1.4);box-shadow:inset 0 0 0 1px rgba(var(--smc-tint),.16);transition:background .18s;}
.pltrig:hover,.actrig:hover{background:rgba(var(--smc-accent-rgb),.32);}
.pltrig.active,.actrig.active{background:var(--smc-accent);color:var(--smc-accent-ink);box-shadow:inset 0 0 0 1px rgba(var(--smc-tint),.3);}
.stageovl{position:absolute;inset:0;z-index:4;background:linear-gradient(150deg,#0c4a5a,#06222e);padding:18px 16px 16px;display:flex;flex-direction:column;gap:10px;opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity .28s ease,transform .28s ease,visibility .28s;overflow:auto;}
.art.has-strip .stageovl{padding-top:72px;}
.art.s-groups .gstage,.art.s-playlists .plstage,.art.s-actions .actstage,.art.s-volume .vstage{opacity:1;visibility:visible;transform:none;}
.art.s-groups .scrim,.art.s-playlists .scrim,.art.s-actions .scrim,.art.s-volume .scrim{opacity:0;pointer-events:none;}
.art.s-groups .topstrip,.art.s-playlists .topstrip,.art.s-actions .topstrip,.art.s-volume .topstrip{z-index:5;background:none;}
/* With a stage open, hide the cover so the (no longer min-height-stretched) art
   can't show a stretched image behind it. In ha, the box behind the frosted
   stage is the theme surface, not the teal placeholder. */
.art.s-groups .cover,.art.s-playlists .cover,.art.s-actions .cover,.art.s-volume .cover{display:none!important;}
.root.theme-ha .art.s-groups,.root.theme-ha .art.s-playlists,.root.theme-ha .art.s-actions,.root.theme-ha .art.s-volume{background:var(--ha-card-background,var(--card-background-color,#0c4a5a)),var(--primary-background-color,#0c4a5a);}
/* Light album art: deepen the now-playing scrim so white text/transport stay legible. */
.art.lightart .scrim{background:linear-gradient(to top,rgba(4,22,30,.97),rgba(4,22,30,.6) 38%,rgba(4,22,30,.18) 72%,transparent);}
.art.lightart .topstrip{background:linear-gradient(to bottom,rgba(4,22,30,.92),rgba(4,22,30,.4) 55%,transparent);}
.stageovl .grid{flex:1;}
.stageovl .actions{flex:none;}
.vshd{display:flex;align-items:center;justify-content:space-between;flex:none;}
.vstage .poprows{flex:1;overflow:auto;display:flex;flex-direction:column;gap:16px;margin-top:4px;}
.np{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.eq{display:flex;align-items:flex-end;gap:3px;height:16px;}
.eq span{width:3px;height:100%;background:#00e0e0;border-radius:2px;transform-origin:bottom;}
.eq.on span{animation:eq .9s ease-in-out infinite;}
.eq.on span:nth-child(2){animation-delay:-.45s}
.npt{min-width:0;}
.t1{font:700 20px/1.2 'DM Sans';color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.t2{font:400 14px/1.3 'DM Sans';color:rgba(var(--smc-tint),.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.prog{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.prog .te{font:400 12px/1 'DM Sans';color:rgba(var(--smc-tint),.7);min-width:30px;}
.bar{position:relative;flex:1;height:5px;border-radius:99px;background:rgba(var(--smc-tint),.22);cursor:pointer;}
.bar .f{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:#fff;width:0;}
.bar .k{position:absolute;top:50%;width:12px;height:12px;border-radius:99px;background:#fff;transform:translate(-50%,-50%);left:0;}
.tr{display:flex;align-items:center;justify-content:center;gap:26px;}
.tr button{display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:rgba(var(--smc-tint),.9);cursor:pointer;width:48px;height:48px;}
.tr .pp{width:74px;height:74px;border-radius:99px;background:#fff;color:#07303f;}
.gcol{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0;}
.gchead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.ghbtns{display:flex;gap:8px;flex-wrap:wrap;}
.splitbtn,.addall{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;border:1px solid rgba(var(--smc-tint),.22);background:rgba(var(--smc-tint),.08);color:rgba(var(--smc-tint),.85);font:600 11px/1.1 'DM Sans';cursor:pointer;}
.splitbtn:hover,.addall:hover{background:rgba(var(--smc-tint),.14);}
.addall{border-color:rgba(var(--smc-accent-rgb),.45);color:var(--smc-accent);}
.glist{flex:1;display:flex;flex-direction:column;gap:9px;}
.grow{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:14px;background:rgba(var(--smc-tint),.06);border:1px solid rgba(var(--smc-tint),.13);cursor:pointer;}
.gicon{display:inline-flex;align-items:center;justify-content:center;width:26px;flex:none;color:rgba(var(--smc-tint),.85);}
.gicon ha-icon{--mdc-icon-size:24px;}
.gtext{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;}
.gn{font:600 15px/1.2 'DM Sans';color:rgba(var(--smc-tint),.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gs{font:500 11px/1 'DM Sans';letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:rgba(var(--smc-tint),.45);}
.grow.grp{background:rgba(var(--smc-accent-rgb),.1);border-color:rgba(var(--smc-accent-rgb),.4);} .grow.grp .gs{color:var(--smc-accent);}
.grow.master{background:rgba(var(--smc-accent-rgb),.16);border-color:rgba(var(--smc-accent-rgb),.55);box-shadow:inset 0 0 0 2px var(--smc-accent);} .grow.master .gs{color:var(--smc-accent);}
.gtog{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:99px;background:rgba(var(--smc-tint),.1);color:rgba(var(--smc-tint),.85);cursor:pointer;flex:none;}
.grow.grp .gtog{background:var(--smc-accent);color:var(--smc-accent-ink);}
.grow.master .gtog{background:var(--smc-accent);color:var(--smc-accent-ink);}
.gtog.move{background:rgba(232,145,58,.2);color:#f3c18a;box-shadow:inset 0 0 0 1px rgba(232,145,58,.5);}
.volrow{position:relative;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:16px;background:rgba(var(--smc-tint),.07);border:1px solid rgba(var(--smc-tint),.13);}
.vic{display:inline-flex;align-items:center;color:rgba(var(--smc-tint),.8);flex:none;}
.vgroup{flex:1;min-width:0;display:flex;align-items:center;background:rgba(var(--smc-tint),.06);border:1px solid rgba(var(--smc-tint),.14);border-radius:99px;padding:2px;}
.vstep{width:42px;height:42px;border-radius:50%;border:none;background:transparent;color:rgba(var(--smc-tint),.85);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none;}
.vstep:hover{background:rgba(var(--smc-tint),.14);}
.vbtn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1px solid rgba(var(--smc-tint),.18);background:rgba(var(--smc-tint),.08);color:rgba(var(--smc-tint),.9);cursor:pointer;flex:none;}
.vbtn:hover{background:rgba(var(--smc-tint),.16);}
.vbtn.act{background:var(--smc-accent);color:var(--smc-accent-ink);border-color:transparent;}
.mpct{font:700 9.5px/1 'DM Sans';color:#06303d;pointer-events:none;}
.vbtn.drop.active{background:var(--smc-accent);color:var(--smc-accent-ink);border-color:transparent;}
.vbtn.drop.active svg{transform:rotate(180deg);}
.slider{position:relative;height:42px;display:flex;align-items:center;cursor:pointer;touch-action:none;flex:1;min-width:50px;}
.slider .strack{position:relative;width:100%;height:8px;border-radius:99px;background:rgba(var(--smc-tint),.2);}
.slider .sfill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:var(--smc-accent);width:0;}
.slider .sknob{position:absolute;top:50%;width:20px;height:20px;border-radius:99px;background:#fff;transform:translate(-50%,-50%);left:0;display:flex;align-items:center;justify-content:center;}
.slider.master .sknob{width:34px;height:34px;box-shadow:0 2px 6px rgba(0,0,0,.35);}
.prhead{display:flex;align-items:center;justify-content:space-between;}
.popcnt{font:600 12px/1 'DM Sans';color:var(--smc-accent);}
.prn{font:600 14px/1 'DM Sans';color:rgba(var(--smc-tint),.95);}
.prr{display:flex;align-items:center;gap:8px;}
.prdef{display:inline-flex;align-items:center;justify-content:center;padding:6px 8px;border-radius:99px;background:rgba(var(--smc-tint),.08);border:1px solid rgba(var(--smc-tint),.2);color:rgba(var(--smc-tint),.82);cursor:pointer;}
.prpct{font:700 12px/1 'DM Sans';color:var(--smc-accent);min-width:34px;text-align:right;}
.prslide{display:flex;align-items:center;gap:10px;margin-top:8px;}
.sm .strack{background:rgba(var(--smc-tint),.15);} .sm .sfill{background:var(--smc-accent);}
.panel{flex:none;width:386px;display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:20px;background:rgba(var(--smc-tint),.07);border:1px solid rgba(var(--smc-tint),.14);}
.actions{display:flex;flex-direction:column;gap:10px;}
.abtn{display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;border:1px solid rgba(0,102,255,.5);background:linear-gradient(135deg,rgba(0,102,255,.28),rgba(var(--smc-accent-rgb),.2));color:#fff;cursor:pointer;text-align:left;width:100%;transition:transform .09s ease,filter .12s ease;}
.abtn:active{transform:scale(.97);filter:brightness(1.1);}
.abic{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(var(--smc-tint),.16);flex:none;}
.abic ha-icon{--mdc-icon-size:22px;}
.abt1{display:block;font:700 16px/1.2 'DM Sans';}
.abt2{display:block;font:400 13px/1.3 'DM Sans';color:rgba(var(--smc-tint),.7);margin-top:3px;}
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px;overflow:auto;}
.tile{position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;border-radius:14px;min-height:118px;border:none;cursor:pointer;text-align:left;overflow:hidden;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.22);transition:transform .09s ease,filter .12s ease,box-shadow .12s ease;}
.tile:active{transform:scale(.94);filter:brightness(1.14);box-shadow:0 6px 18px rgba(0,0,0,.4);}
.tile .tscrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),transparent 60%);}
.tile .tn{position:relative;font:700 15px/1.15 'DM Sans';color:#fff;}
.root.narrow .wrap{flex-direction:column;gap:20px;padding:20px;}
.root.narrow .panel{width:auto;padding:16px;}
.root.narrow .panel .grid{overflow:visible;}
.root.stack .player{flex-direction:column;}
.root.stack .art{width:100%;height:auto;aspect-ratio:1/1;}
.root.stack .gsi{width:34px;height:34px;font-size:13px;}
.root.stack .gsi ha-icon{--mdc-icon-size:19px;}
.root.stack .pltrig,.root.stack .actrig{width:44px;height:44px;}
.root.stack .art.has-strip .stageovl{padding-top:64px;}
/* On stacked layouts, let an open stage grow the card so the popup is the single
   scroll — rather than scrolling inside the album-art square. */
.root.stack .art.s-groups,.root.stack .art.s-playlists,.root.stack .art.s-actions,.root.stack .art.s-volume{height:auto;aspect-ratio:auto;}
.root.stack .art.s-groups .gstage,.root.stack .art.s-playlists .plstage,.root.stack .art.s-actions .actstage,.root.stack .art.s-volume .vstage{position:relative;overflow:visible;}
.root.stack .art.s-playlists .grid,.root.stack .art.s-volume .poprows{overflow:visible;}
/* Phones: smaller pills/icons and tighter padding (it's framed by the popup anyway). */
.root.phone{border-radius:14px;}
.root.phone .wrap{padding:12px;gap:16px;}
.root.phone .panel{padding:12px;}
.root.phone .pill{padding:7px 12px;gap:6px;}
.root.phone .pill.picon{padding:7px 10px;}
.root.phone .pill.picon ha-icon{--mdc-icon-size:19px;}
.root.phone .pill.picon>svg{width:19px;height:19px;}
.root.phone .gsi{width:30px;height:30px;}
.root.phone .gsi ha-icon{--mdc-icon-size:17px;}
.root.phone .pltrig,.root.phone .actrig{width:40px;height:40px;}
.root.phone .vstep{width:34px;height:34px;}
.root.phone .volrow{padding:8px 10px;}
</style>
<div class="root${this._theme === "ha" ? " theme-ha" : ""}">
  <div class="wash"></div><div class="blob b1"></div><div class="blob b2"></div>
  <div class="wrap">
    <div class="left">
      <div class="col"><div class="pillrow">${pills}</div></div>
      <div class="volrow">
        <span class="vic">${svg(ICON.vol, 20)}</span>
        <div class="vgroup">
          <button class="vstep mdn" aria-label="Group volume down">${svg(ICON.minus, 20, 2.8)}</button>
          <div class="slider master"><div class="strack"><div class="sfill"></div><div class="sknob"><span class="mpct"></span></div></div></div>
          <button class="vstep mup" aria-label="Group volume up">${svg(ICON.plus, 20, 2.8)}</button>
        </div>
        <button class="vbtn mvol" aria-label="Reset all to defaults">${svg(ICON.reset, 17, 2.2)}</button>
        <button class="vbtn drop" aria-label="Room volumes">${svg(ICON.chev, 18)}</button>
      </div>
      <div class="player${cg ? " cg" : ""}">
        <div class="art${(cg || cp || showAct) ? " has-strip" : ""}">
          <img class="cover" alt="" style="display:none">
          ${(cg || cp || showAct) ? `<div class="topstrip">${cg ? `<div class="gstrip"></div>` : "<span></span>"}<div class="trigs">${cp ? `<button class="pltrig" aria-label="${esc(this._playlistsTitle)}" title="${esc(this._playlistsTitle)}">${svg(ICON.music, 22)}</button>` : ""}${showAct ? `<button class="actrig" aria-label="${esc(this._actionsTitle)}" title="${esc(this._actionsTitle)}">${this._icon(this._actions[0] ? this._actions[0].icon : "book", 22)}</button>` : ""}</div></div>` : ""}
          <div class="scrim">
            <div class="np"><div class="eq"><span></span><span></span><span></span><span></span></div>
              <div class="npt"><div class="t1">—</div><div class="t2"></div></div></div>
            <div class="prog"><span class="te el">0:00</span>
              <div class="bar"><div class="f"></div><div class="k"></div></div>
              <span class="te du">0:00</span></div>
            <div class="tr">
              <button class="prev"></button>
              <button class="pp"></button>
              <button class="next"></button>
            </div>
          </div>
          ${cg ? `<div class="stageovl gstage">${groupBuilder}</div>` : ""}
          ${cp ? `<div class="stageovl plstage"><div class="grid"></div></div>` : ""}
          ${showAct ? `<div class="stageovl actstage"><div class="actions">${actionBtns}</div></div>` : ""}
          <div class="stageovl vstage"><div class="vshd"><span class="ovl">Room volumes</span><span class="popcnt"></span></div><div class="poprows">${popRooms}</div></div>
        </div>
        ${cg ? "" : `<div class="gcol">${groupBuilder}</div>`}
      </div>
    </div>
    ${panelHasContent ? `<div class="panel">
      ${panelActions ? `<span class="ovl">${esc(this._actionsTitle)}</span><div class="actions">${actionBtns}</div>` : ""}
      ${(!cp && this._playlistsConfigured) ? playlistGrid : ""}
    </div>` : ""}
  </div>
</div>`;

    const $ = (s) => root.querySelector(s);
    this._root = $(".root");
    this.$ = {
      wash: $(".wash"), b1: $(".b1"), b2: $(".b2"), art: $(".art"), cover: $(".cover"),
      eq: $(".eq"), t1: $(".t1"), t2: $(".t2"), el: $(".el"), du: $(".du"),
      barF: $(".bar .f"), barK: $(".bar .k"), bar: $(".bar"),
      prev: $(".prev"), pp: $(".pp"), next: $(".next"),
      pillrow: $(".pillrow"),
      pills: [...root.querySelectorAll(".pill")], grows: [...root.querySelectorAll(".grow")],
      splitbtn: $(".splitbtn"), addall: $(".addall"),
      mFill: $(".slider.master .sfill"), mKnob: $(".slider.master .sknob"), mSlider: $(".slider.master"),
      mdn: $(".mdn"), mup: $(".mup"), mpct: $(".mpct"),
      drop: $(".drop"), popcnt: $(".popcnt"), mvol: $(".mvol"),
      grid: $(".grid"), actions: [...root.querySelectorAll(".abtn")],
      prows: [...root.querySelectorAll(".prow")],
      gstrip: $(".gstrip"), pltrig: $(".pltrig"), actrig: $(".actrig"),
    };

    // events
    this.$.pills.forEach((el) => el.addEventListener("click", () => this._selectGroup(+el.dataset.room)));
    this.$.grows.forEach((el) => el.addEventListener("click", () => this._toggleGroup(+el.dataset.room)));
    this.$.splitbtn.addEventListener("click", () => this._splitFocus());
    this.$.addall.addEventListener("click", () => this._addAll());
    this.$.prev.addEventListener("click", () => this._prev());
    this.$.next.addEventListener("click", () => this._next());
    this.$.pp.addEventListener("click", () => this._svc("media_player", "media_play_pause", { entity_id: this._massOf(this._coordRoom()) }));
    this.$.bar.addEventListener("pointerdown", (e) => this._seekDrag(e));
    this.$.mSlider.addEventListener("pointerdown", (e) => this._volDrag(e, "master"));
    this.$.mdn.addEventListener("click", () => this._nudge("master", -5));
    this.$.mup.addEventListener("click", () => this._nudge("master", 5));
    this.$.prows.forEach((el) => {
      const i = +el.dataset.room;
      el.querySelector(".slider").addEventListener("pointerdown", (e) => this._volDrag(e, i));
      el.querySelector(".prdef").addEventListener("click", () => this._setVol(this._rooms[i], this._rooms[i].def, true));
      el.querySelector(".rdn").addEventListener("click", () => this._nudge(i, -5));
      el.querySelector(".rup").addEventListener("click", () => this._nudge(i, 5));
    });
    this.$.drop.addEventListener("click", () => this._toggleStage("volume"));
    this.$.mvol.addEventListener("click", () => this._setDefaults());
    this.$.actions.forEach((el) => el.addEventListener("click", () => this._runAction(+el.dataset.act)));
    if (this._compactGroups && this.$.gstrip) this.$.gstrip.addEventListener("click", () => this._toggleStage("groups"));
    if (this._compactPlaylists && this.$.pltrig) this.$.pltrig.addEventListener("click", () => this._toggleStage("playlists"));
    if (this.$.actrig) this.$.actrig.addEventListener("click", () => this._toggleStage("actions"));
    this._renderTiles();
    this._observe();
  }

  _resize() {
    if (!this._root) return;
    const w = this._root.clientWidth;
    if (!w) return; // not laid out yet — keep the default (landscape) until we have a real width
    this._root.classList.toggle("narrow", w < 1040);
    this._root.classList.toggle("stack", w < 760);
    this._root.classList.toggle("phone", w < 480);
    this._balancePills();
  }
  // Spread the top-nav pills into balanced rows (all on one line, or evenly split
  // across however many lines they need) — never a single pill dangling below.
  _balancePills() {
    const pr = this.$ && this.$.pillrow; if (!pr || !this.$.pills.length) return;
    const gap = 10, n = this.$.pills.length;
    let maxW = 0;
    for (const p of this.$.pills) { const bw = p.getBoundingClientRect().width; if (bw > maxW) maxW = bw; }
    const avail = pr.getBoundingClientRect().width;
    if (!maxW || !avail) return;
    let perLine = Math.max(1, Math.floor((avail + gap) / (maxW + gap)));
    perLine = Math.min(perLine, n);
    const rows = Math.ceil(n / perLine);
    const cols = Math.ceil(n / rows);
    if (pr.style.getPropertyValue("--pcols") !== String(cols)) pr.style.setProperty("--pcols", String(cols));
  }

  _svc(d, s, data) { if (this._hass) this._hass.callService(d, s, data); }
  // Top-nav pill: focus the group this speaker belongs to. Never joins/unjoins.
  _selectGroup(i) {
    const r = this._rooms[i]; if (!r) return;
    this._focusEntity = r.entity; this._persistFocus(); this._update();
  }
  // Group row: add (join), remove (unjoin), or relocate (join from another group).
  _toggleGroup(i) {
    const r = this._rooms[i]; if (!r) return;
    if (r.entity === this._coordEntity()) return; // coordinator anchor — split via the header button
    if (this._effMembers().has(r.entity)) {
      this._optGroup(r.entity, false);
      this._svc("media_player", "unjoin", { entity_id: this._massOf(r) });
    } else {
      this._optGroup(r.entity, true);
      this._svc("media_player", "join", { entity_id: this._massOf(this._coordRoom()), group_members: [this._massOf(r)] });
      this._toDefault(r);
    }
    this._update();
  }
  // A newly-added speaker joins at its configured default volume.
  _toDefault(r) {
    this._localVol[r.entity] = r.def; this._localVolAt[r.entity] = Date.now();
    this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: r.def / 100 });
  }
  // Compact mode: swap the album-art "stage" between now-playing, groups, playlists.
  _toggleStage(s) { this._stage = this._stage === s ? "art" : s; this._update(); }
  // Header button: pull the focused speaker out so it becomes its own group.
  _splitFocus() {
    const f = this._focusRoom(); if (this._effMembers().size <= 1) return;
    this._optGroup(f.entity, false);
    this._svc("media_player", "unjoin", { entity_id: this._massOf(f) });
    this._update();
  }
  _prev() { this._svc("media_player", "media_previous_track", { entity_id: this._massOf(this._coordRoom()) }); }
  _next() { this._svc("media_player", "media_next_track", { entity_id: this._massOf(this._coordRoom()) }); }
  // Built-in glyph by name, or pass `mdi:*` through to HA's <ha-icon>.
  _icon(name, size = 22) {
    if (typeof name === "string" && name.startsWith("mdi:"))
      return `<ha-icon icon="${esc(name)}" style="--mdc-icon-size:${size}px;width:${size}px;height:${size}px"></ha-icon>`;
    return svg(ICON[name] || ICON.play, size);
  }
  _runAction(i) {
    const a = this._actions[i]; if (!a || !a.service) return;
    const dot = a.service.indexOf("."); if (dot < 0) return;
    const dom = a.service.slice(0, dot), srv = a.service.slice(dot + 1);
    const c = this._coordRoom(); const data = Object.assign({}, a.data);
    if (dom === "script") { data.target_player = c.massEntity; data.target_room = c.name; }
    this._svc(dom, srv, data);
  }
  _tilesHtml() {
    return this._playlists.map((p, i) => {
      const bg = p.image ? `background-image:url('${esc(p.image)}');background-size:cover;background-position:center;` : `background:linear-gradient(150deg,${GRADS[i % 4]});`;
      return `<button class="tile" data-pl="${i}" style="${bg}"><span class="tscrim"></span><span class="tn">${esc(p.name)}</span></button>`;
    }).join("");
  }
  _renderTiles() {
    if (!this.$ || !this.$.grid) return;
    if (!this._playlists.length) {
      this.$.grid.innerHTML = this._playlistMsg ? `<div style="grid-column:1/-1;align-self:start;font:500 13px/1.45 'DM Sans';color:rgba(var(--smc-tint),.6)">${esc(this._playlistMsg)}</div>` : "";
      this.$.tiles = [];
      return;
    }
    this.$.grid.innerHTML = this._tilesHtml();
    this.$.tiles = [...this.$.grid.querySelectorAll(".tile")];
    this.$.tiles.forEach((el) => el.addEventListener("click", () => this._playPlaylist(+el.dataset.pl)));
  }
  _browseTarget() {
    return this._playlistBrowseEntity || (this._rooms.find((r) => r.massEntity) || {}).massEntity || null;
  }
  _log(...a) { try { console.info("sonos-music-card:", ...a); } catch (e) {} }
  _toItem(c) { return { name: c.title, media_id: c.media_content_id, media_type: c.media_content_type || "playlist", image: c.thumbnail || null }; }
  // Drop duplicates the browse returns: by media_id (default) or by name.
  _dedupe(items) {
    const mode = this._playlistDedupe;
    if (!mode || mode === "none") return items;
    const seen = new Set();
    return items.filter((it) => {
      const key = mode === "name" ? String(it.name || "").trim().toLowerCase() : (it.media_id || "");
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  _browseChildren(entity_id, id, type) {
    const msg = { type: "media_player/browse_media", entity_id };
    if (id != null) { msg.media_content_id = id; msg.media_content_type = type || ""; }
    return this._hass.callWS(msg).then((res) => (res && res.children) || []);
  }
  // Auto-populate tiles: try the configured source, then discover a "Playlists"
  // folder from the player's root. Logs structure + shows a message on failure.
  async _browsePlaylists() {
    if (this._browsed || this._playlistItems.length || !this._playlistsConfigured) return;
    const ent = this._browseTarget();
    if (!ent || !this._hass || typeof this._hass.callWS !== "function") return;
    this._browsed = true;
    try {
      let children = [];
      if (this._playlistSource) {
        try { children = await this._browseChildren(ent, this._playlistSource, this._playlistSourceType); } catch (e) { this._log("source browse failed:", e && e.message ? e.message : e); }
        this._log(`source ${this._playlistSource} → ${children.length} children`);
      }
      if (!children.length) {
        const root = await this._browseChildren(ent, null, null);
        this._log("root nodes:", root.map((c) => `${c.title} [${c.media_content_id} :: ${c.media_content_type}]`));
        const folder = root.find((c) => /playlist/i.test(`${c.title || ""} ${c.media_content_id || ""}`));
        if (folder) { children = await this._browseChildren(ent, folder.media_content_id, folder.media_content_type); this._log(`discovered ${folder.media_content_id} → ${children.length} children`); }
      }
      const items = this._dedupe(children.filter((c) => c.can_play || c.can_expand).map((c) => this._toItem(c)));
      if (items.length) { this._playlists = items; this._playlistMsg = null; }
      else this._playlistMsg = `No playlists found${this._playlistSource ? ` at ${this._playlistSource}` : ""}. Open HA → Media on ${ent} to find the id (details in the browser console).`;
      this._renderTiles();
    } catch (e) {
      console.warn("sonos-music-card: playlist browse failed —", e && e.message ? e.message : e);
      this._playlistMsg = "Couldn't load playlists: " + (e && e.message ? e.message : e);
      this._renderTiles();
    }
  }
  _playPlaylist(i) {
    const p = this._playlists[i]; if (!p) return;
    const mass = this._coordRoom().massEntity; if (!mass) return;
    this._svc("music_assistant", "play_media", { entity_id: mass, media_id: p.media_id, media_type: p.media_type || "playlist" });
  }
  _livePos(s) {
    if (!s) return 0;
    let pos = s.attributes.media_position || 0;
    if (s.state === "playing" && s.attributes.media_position_updated_at)
      pos += (Date.now() - new Date(s.attributes.media_position_updated_at).getTime()) / 1000;
    return pos;
  }

  _seekDrag(e) {
    const m = this._coordRoom(); const s = this._st(m.entity); const dur = s && s.attributes.media_duration;
    if (!dur) return;
    const track = this.$.bar; const rect = track.getBoundingClientRect();
    const apply = (x, fire) => {
      let p = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      this.$.barF.style.width = p * 100 + "%"; this.$.barK.style.left = p * 100 + "%";
      if (fire) this._svc("media_player", "media_seek", { entity_id: this._massOf(m), seek_position: p * dur });
    };
    this._drag = { seek: true };
    apply(e.clientX, false);
    const move = (ev) => apply(ev.clientX, false);
    const up = (ev) => { apply(ev.clientX, true); this._drag = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }

  _volDrag(e, key) {
    e.preventDefault();
    const track = e.currentTarget; const rect = track.getBoundingClientRect();
    // Master slider moves the whole group together (uniform shift, preserving each
    // room's relative level); a per-room slider sets that one room absolutely.
    const grouped = key === "master" ? this._grouped() : null;
    const start = key === "master" ? this._masterVal() : 0;
    const base = {}; if (grouped) grouped.forEach((r) => (base[r.entity] = this._vol(r)));
    const apply = (x) => {
      const v = Math.round(Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * 100);
      const now = Date.now();
      if (key === "master") { this._drag = { master: true, val: v }; const d = v - start; grouped.forEach((r) => { this._localVol[r.entity] = Math.max(0, Math.min(100, base[r.entity] + d)); this._localVolAt[r.entity] = now; }); }
      else { this._drag = { room: key, val: v }; this._localVol[this._rooms[key].entity] = v; this._localVolAt[this._rooms[key].entity] = now; }
      this._update();
    };
    apply(e.clientX);
    let last = 0;
    const move = (ev) => { apply(ev.clientX); const n = Date.now(); if (n - last > 180) { last = n; this._commitVol(key); } };
    const up = (ev) => { apply(ev.clientX); this._commitVol(key); this._drag = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  }
  _commitVol(key) {
    if (key === "master") this._grouped().forEach((r) => this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: this._localVol[r.entity] / 100 }));
    else { const r = this._rooms[key]; this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: this._localVol[r.entity] / 100 }); }
  }
  _setVol(r, p, fire) { this._localVol[r.entity] = p; this._localVolAt[r.entity] = Date.now(); if (fire) this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: p / 100 }); this._update(); }
  // Set every grouped room to its own configured default volume.
  _setDefaults() {
    const now = Date.now();
    this._grouped().forEach((r) => { this._localVol[r.entity] = r.def; this._localVolAt[r.entity] = now; this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: r.def / 100 }); });
    this._update();
  }
  // +/- buttons: nudge the group (relative, all grouped rooms) or one room by delta.
  _nudge(key, delta) {
    const now = Date.now();
    const bump = (r) => { const v = Math.max(0, Math.min(100, this._vol(r) + delta)); this._localVol[r.entity] = v; this._localVolAt[r.entity] = now; this._svc("media_player", "volume_set", { entity_id: r.entity, volume_level: v / 100 }); };
    if (key === "master") this._grouped().forEach(bump);
    else { const r = this._rooms[key]; if (r) bump(r); }
    this._update();
  }
  // Add every speaker that isn't already in the focused group, in one join call.
  _addAll() {
    const coord = this._coordRoom();
    const out = this._rooms.filter((r) => !this._effMembers().has(r.entity));
    if (!out.length) return;
    out.forEach((r) => this._optGroup(r.entity, true));
    this._svc("media_player", "join", { entity_id: this._massOf(coord), group_members: out.map((r) => this._massOf(r)) });
    out.forEach((r) => this._toDefault(r));
    this._update();
  }
  _masterVal() {
    if (this._drag && this._drag.master) return this._drag.val;
    const g = this._grouped(); if (!g.length) return 0;
    return Math.round(g.reduce((a, r) => a + this._vol(r), 0) / g.length);
  }

  _update() {
    if (!this._hass || !this.$) return;
    if (!this._focusEntity) this._focusEntity = this._loadFocus() || this._defaultFocus();
    if (!this._drag) {
      const now = Date.now();
      for (const e in this._localVol) {
        const st = this._st(e); const real = st && st.attributes.volume_level != null ? Math.round(st.attributes.volume_level * 100) : null;
        if ((real != null && Math.abs(real - this._localVol[e]) <= 2) || now - (this._localVolAt[e] || 0) > 3000) { delete this._localVol[e]; delete this._localVolAt[e]; }
      }
    }
    const members = this._effMembers(); const coordE = this._coordEntity();
    const m = this._coordRoom(); const s = this._st(m.entity); const a = (s && s.attributes) || {};
    const grouped = this._grouped();
    const playing = s && s.state === "playing";
    // background — from album art (art), fixed teal (home), or the HA theme surface
    // (ha: handled in CSS via .theme-ha; no JS wash so the theme shows through).
    const pic = a.entity_picture || null;
    this._detectArt(pic);
    // cover
    if (pic) { if (this.$.cover.getAttribute("src") !== pic) this.$.cover.src = pic; this.$.cover.style.display = ""; }
    else this.$.cover.style.display = "none";
    // album-art "stage" overlays — volume always available; groups/playlists/shortcuts in compact mode
    this.$.art.classList.toggle("s-volume", this._stage === "volume");
    if (this._compactGroups || this._compactPlaylists || (this._compactActions && this._actions.length)) {
      this.$.art.classList.toggle("s-groups", this._stage === "groups");
      this.$.art.classList.toggle("s-playlists", this._stage === "playlists");
      this.$.art.classList.toggle("s-actions", this._stage === "actions");
      // The open stage's trigger is the close affordance — no separate × needed.
      if (this.$.gstrip) this.$.gstrip.classList.toggle("active", this._stage === "groups");
      if (this.$.pltrig) this.$.pltrig.classList.toggle("active", this._stage === "playlists");
      if (this.$.actrig) this.$.actrig.classList.toggle("active", this._stage === "actions");
      if (this._lastStageRender !== this._stage) {
        if (this.$.pltrig) this.$.pltrig.innerHTML = this._stage === "playlists" ? svg(ICON.close, 22) : svg(ICON.music, 22);
        if (this.$.actrig) this.$.actrig.innerHTML = this._stage === "actions" ? svg(ICON.close, 22) : this._icon(this._actions[0] ? this._actions[0].icon : "book", 22);
        this._lastStageRender = this._stage;
      }
    }
    if (this._compactGroups && this.$.gstrip) {
      this.$.gstrip.innerHTML = grouped.map((r) =>
        `<span class="gsi" title="${esc(r.name)}">${r.icon ? this._icon(r.icon, 18) : esc((r.name || "·").charAt(0).toUpperCase())}</span>`).join("");
    }
    // pills — focused coordinator = ring; followers = grey; the playing group's
    // coordinator gets a subtle play watermark behind its icon (only one usually plays)
    this._rooms.forEach((r, i) => {
      const el = this.$.pills[i]; const gm = this._groupMembersOf(r);
      const isFollower = gm.length > 1 && gm[0] !== r.entity;
      const pst = this._st(r.entity);
      el.classList.toggle("current", r.entity === coordE);
      el.classList.toggle("follower", isFollower && r.entity !== coordE);
      el.classList.toggle("playing-bg", !!(pst && pst.state === "playing" && gm[0] === r.entity));
    });
    // group rows — coordinator anchor / in group / available (stands out) / in another group (amber)
    this._rooms.forEach((r, i) => {
      const el = this.$.grows[i]; const inSel = members.has(r.entity); const isCoord = r.entity === coordE;
      const elsewhere = !inSel && this._groupMembersOf(r).length > 1;
      el.classList.toggle("master", isCoord);            // highlighted current style
      el.classList.toggle("grp", inSel && !isCoord);     // blue = in the group
      // not in the group → default grey row; the move button alone flags "in another group"
      const sub = el.querySelector(".gs"); const tog = el.querySelector(".gtog");
      tog.classList.toggle("move", elsewhere);
      if (isCoord) { sub.textContent = playing ? "Master · playing" : "Master"; tog.innerHTML = svg(ICON.check, 18, 3); }
      else if (inSel) { sub.textContent = "In group"; tog.innerHTML = svg(ICON.check, 18, 3); }
      else if (elsewhere) { const c = this._roomByEntity(this._groupMembersOf(r)[0]); sub.textContent = "Move from " + (c ? c.name : this._friendly(this._groupMembersOf(r)[0])); tog.innerHTML = svg(ICON.exit, 18, 2.2); }
      else { sub.textContent = "Available"; tog.innerHTML = svg(ICON.plus, 18, 2.4); }
    });
    // split button — make the focused speaker its own group (when it's grouped)
    const canSplit = members.size > 1;
    this.$.splitbtn.style.display = canSplit ? "" : "none";
    if (canSplit) this.$.splitbtn.innerHTML = svg(ICON.split, 14, 2.2) + "<span>Make " + esc(this._focusRoom().name) + " its own group</span>";
    // add-all button — join every speaker not already in the focused group
    const anyOut = this._rooms.some((r) => !members.has(r.entity));
    this.$.addall.style.display = anyOut ? "" : "none";
    if (anyOut) this.$.addall.innerHTML = svg(ICON.plus, 13, 2.6) + "<span>Add all</span>";
    // now playing
    this.$.t1.textContent = a.media_title || (s ? (s.state === "idle" ? "Nothing playing" : m.name) : "No data");
    this.$.t2.textContent = a.media_artist || a.media_album_name || "";
    this.$.eq.classList.toggle("on", !!playing);
    this.$.pp.innerHTML = playing ? pauseIco : playIco;
    if (!this._trSet) { this.$.prev.innerHTML = svg(ICON.prev, 26, 2); this.$.next.innerHTML = svg(ICON.next, 26, 2); this._trSet = 1; }
    // progress
    if (!(this._drag && this._drag.seek)) {
      const pos = this._livePos(s); const dur = a.media_duration || 0;
      const pct = dur ? Math.max(0, Math.min(100, (pos / dur) * 100)) : 0;
      this.$.barF.style.width = pct + "%"; this.$.barK.style.left = pct + "%";
      this.$.el.textContent = fmt(pos); this.$.du.textContent = dur ? fmt(dur) : "—";
    }
    // volume — master slider shows the group level (average); the per-room sliders
    // live on the "volume" album-art stage (the chevron opens it; tap again to close)
    const mv = this._masterVal();
    this.$.mFill.style.width = mv + "%"; this.$.mKnob.style.left = mv + "%";
    this.$.mpct.textContent = grouped.length ? mv + "%" : "";
    this.$.drop.classList.toggle("active", this._stage === "volume");
    this.$.popcnt.textContent = grouped.length + (grouped.length === 1 ? " room" : " rooms");
    this._rooms.forEach((r, i) => {
      const row = this.$.prows[i]; if (!row) return;
      const show = members.has(r.entity); row.style.display = show ? "" : "none";
      if (!show) return;
      const v = this._vol(r);
      row.querySelector(".prpct").textContent = v + "%";
      row.querySelector(".sfill").style.width = v + "%"; row.querySelector(".sknob").style.left = v + "%";
    });
    // action subtitles — live now-playing from status_entity, else the static subtitle
    this._actions.forEach((act, i) => {
      const el = this.$.actions[i]; if (!el) return;
      let text = act.subtitle || "";
      if (act.statusEntity) {
        const st = this._st(act.statusEntity);
        if (st && st.attributes && st.attributes.media_title) {
          const dur = st.attributes.media_duration, pos = this._livePos(st);
          const left = dur ? ` · ${Math.max(0, Math.round((dur - pos) / 60))}m left` : "";
          text = st.attributes.media_title + left;
        }
      }
      const sub = el.querySelector(".abt2"); if (sub) sub.textContent = text;
    });
  }

  // Sample the album art: derive the wash colour (art mode) and detect whether the
  // image is light, so the now-playing scrim can deepen and keep white text legible.
  _detectArt(pic) {
    if (pic === this._lastPic) return;
    this._lastPic = pic;
    const lum = (v) => { if (this.$ && this.$.art) this.$.art.classList.toggle("lightart", v != null && v > 142); };
    const wash = (rgb) => { if (this._theme === "art") this._setWash(rgb); else if (this._theme === "home") this._setWash(null); };
    if (!pic) { lum(null); wash(null); return; }
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = c.height = 24;
        const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        let r = 0, g = 0, b = 0, wsum = 0, lr = 0, lg = 0, lb = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const sat = mx === 0 ? 0 : (mx - mn) / mx; const w = 0.15 + sat;
          r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; wsum += w;
          lr += d[i]; lg += d[i + 1]; lb += d[i + 2];
        }
        const n = d.length / 4;
        lum(0.2126 * (lr / n) + 0.7152 * (lg / n) + 0.0722 * (lb / n));
        wash([r / wsum, g / wsum, b / wsum]);
      } catch (e) { lum(null); wash(null); }
    };
    img.onerror = () => { lum(null); wash(null); };
    img.src = pic;
  }
  _setWash(rgb) {
    if (!this.$) return;
    if (!rgb) {
      this.$.wash.style.background = TEAL;
      this.$.b1.style.background = "radial-gradient(circle,rgba(var(--smc-accent-rgb),.45),transparent 65%)";
      this.$.b2.style.background = "radial-gradient(circle,rgba(13,90,110,.6),transparent 65%)";
      this._pillColor = null;
    } else {
      const [r, g, b] = rgb.map((x) => Math.max(0, Math.min(255, x)));
      const dk = (f) => `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
      this.$.wash.style.background = `linear-gradient(155deg,${dk(0.6)} 0%,${dk(0.34)} 52%,${dk(0.2)} 100%)`;
      this.$.b1.style.background = `radial-gradient(circle,rgba(${r | 0},${g | 0},${b | 0},.5),transparent 65%)`;
      this.$.b2.style.background = `radial-gradient(circle,${dk(0.55)},transparent 65%)`;
      this._pillColor = `linear-gradient(135deg,${dk(0.95)},${dk(0.55)})`;
    }
    this.$.wash.style.opacity = ".55";
    requestAnimationFrame(() => requestAnimationFrame(() => { if (this.$) this.$.wash.style.opacity = "1"; }));
  }
}

// Visual config editor (light DOM, HA form helpers). Edits the same YAML schema;
// preserves actions:/playlists: and any other keys untouched.
class SonosMusicCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({ rooms: [] }, config || {});
    if (!Array.isArray(this._config.rooms)) this._config.rooms = [];
    this._rebuild();
  }
  set hass(hass) { this._hass = hass; this._applyHass(); }
  _emit() { this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true })); }
  _setTop(key, val) {
    this._config = Object.assign({}, this._config);
    if (val === undefined || val === "" || val === null) delete this._config[key]; else this._config[key] = val;
    this._emit();
  }
  _setRoom(i, key, val) {
    const rooms = this._config.rooms.map((r, j) => (j === i ? Object.assign({}, r) : r));
    if (val === undefined || val === "" || val === null) delete rooms[i][key]; else rooms[i][key] = val;
    this._config = Object.assign({}, this._config, { rooms });
    this._emit();
  }
  _addRoom() { this._config = Object.assign({}, this._config, { rooms: this._config.rooms.concat([{ name: "", entity: "" }]) }); this._emit(); this._rebuild(); }
  _removeRoom(i) { this._config = Object.assign({}, this._config, { rooms: this._config.rooms.filter((_, j) => j !== i) }); this._emit(); this._rebuild(); }
  _applyHass() { if (this._hass && this._pickers) this._pickers.forEach((el) => { try { el.hass = this._hass; } catch (e) {} }); }
  _btn(label, cb) {
    const b = document.createElement("button"); b.textContent = label;
    b.style.cssText = "padding:8px 14px;border-radius:8px;border:1px solid var(--divider-color,rgba(127,127,127,.4));background:var(--secondary-background-color,rgba(127,127,127,.12));color:var(--primary-text-color,inherit);font:inherit;cursor:pointer;";
    b.addEventListener("click", cb); return b;
  }
  _text(label, value, onInput, type) {
    // Prefer HA's themed field, but fall back to a native input when ha-textfield
    // isn't loaded in the editor context (otherwise it renders as an empty element).
    if (customElements.get("ha-textfield")) {
      const el = document.createElement("ha-textfield");
      el.label = label; el.value = value == null ? "" : String(value); if (type) el.type = type; el.style.width = "100%";
      el.addEventListener("input", () => onInput(el.value)); return el;
    }
    const wrap = document.createElement("label");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:4px;width:100%;";
    const lab = document.createElement("span"); lab.textContent = label; lab.style.cssText = "font-size:12px;opacity:.7;";
    const el = document.createElement("input");
    el.type = type || "text"; el.value = value == null ? "" : String(value);
    el.style.cssText = "padding:9px;border-radius:6px;background:var(--secondary-background-color,rgba(127,127,127,.12));color:var(--primary-text-color,inherit);border:1px solid var(--divider-color,rgba(127,127,127,.3));font:inherit;width:100%;box-sizing:border-box;";
    el.addEventListener("input", () => onInput(el.value));
    wrap.append(lab, el); return wrap;
  }
  _entity(label, value, onChange) {
    const el = document.createElement("ha-entity-picker");
    el.label = label; el.value = value || ""; el.allowCustomEntity = true;
    try { el.includeDomains = ["media_player"]; } catch (e) {}
    if (this._hass) try { el.hass = this._hass; } catch (e) {}
    el.addEventListener("value-changed", (e) => onChange(e.detail.value)); this._pickers.push(el); return el;
  }
  _iconPicker(label, value, onChange) {
    const el = document.createElement("ha-icon-picker");
    el.label = label; el.value = value || "";
    if (this._hass) try { el.hass = this._hass; } catch (e) {}
    el.addEventListener("value-changed", (e) => onChange(e.detail.value)); this._pickers.push(el); return el;
  }
  _roomCard(room, i) {
    const box = document.createElement("div");
    box.style.cssText = "border:1px solid var(--divider-color,rgba(127,127,127,.3));border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;";
    const head = document.createElement("div"); head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
    const title = document.createElement("span"); title.textContent = room.name || room.entity || `Room ${i + 1}`; title.style.fontWeight = "600";
    head.appendChild(title); head.appendChild(this._btn("Remove", () => this._removeRoom(i))); box.appendChild(head);
    box.appendChild(this._text("Name", room.name, (v) => this._setRoom(i, "name", v)));
    box.appendChild(this._entity("Sonos speaker (media_player)", room.entity, (v) => {
      this._setRoom(i, "entity", v);
      const cur = this._config.rooms[i];
      if (v && cur && !cur.name) { // auto-fill the name from the entity's friendly name
        const st = this._hass && this._hass.states[v];
        const fn = st && st.attributes && st.attributes.friendly_name;
        if (fn) { this._setRoom(i, "name", fn); this._rebuild(); }
      }
    }));
    box.appendChild(this._entity("Music Assistant player (mass_*)", room.mass_entity, (v) => this._setRoom(i, "mass_entity", v)));
    box.appendChild(this._text("Default volume %", room.default_volume == null ? "" : room.default_volume, (v) => this._setRoom(i, "default_volume", v === "" ? undefined : Number(v)), "number"));
    box.appendChild(this._iconPicker("Icon", room.icon, (v) => this._setRoom(i, "icon", v)));
    return box;
  }
  _setPlaylist(key, val) {
    let pl = this._config.playlists; if (Array.isArray(pl)) pl = { items: pl }; pl = Object.assign({}, pl);
    if (val === undefined || val === "" || val === null) delete pl[key]; else pl[key] = val;
    this._config = Object.assign({}, this._config, { playlists: pl });
    this._emit();
  }
  _switch(label, value, onChange) {
    const wrap = document.createElement("div"); wrap.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;";
    const lab = document.createElement("span"); lab.textContent = label; lab.style.cssText = "font-size:14px;";
    const sw = document.createElement("ha-switch"); sw.checked = !!value;
    sw.addEventListener("change", () => onChange(sw.checked));
    wrap.append(lab, sw); return wrap;
  }
  _select(label, value, options, onChange) {
    const wrap = document.createElement("div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:4px;";
    const lab = document.createElement("span"); lab.textContent = label; lab.style.cssText = "font-size:12px;opacity:.7;";
    const sel = document.createElement("select");
    sel.style.cssText = "padding:9px;border-radius:6px;background:var(--secondary-background-color,rgba(127,127,127,.12));color:var(--primary-text-color,inherit);border:1px solid var(--divider-color,rgba(127,127,127,.3));font:inherit;";
    options.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; if (String(value) === v) o.selected = true; sel.appendChild(o); });
    sel.addEventListener("change", () => onChange(sel.value));
    wrap.append(lab, sel); return wrap;
  }
  _playlistsCard() {
    let pl = this._config.playlists; if (Array.isArray(pl)) pl = { items: pl }; pl = pl || {};
    const box = document.createElement("div");
    box.style.cssText = "border:1px solid var(--divider-color,rgba(127,127,127,.3));border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;";
    const h = document.createElement("span"); h.textContent = "Playlists"; h.style.fontWeight = "600"; box.appendChild(h);
    box.appendChild(this._text("Section title", pl.title, (v) => this._setPlaylist("title", v)));
    box.appendChild(this._text("Source (Music Assistant browse id, e.g. library://playlist)", pl.source, (v) => this._setPlaylist("source", v)));
    box.appendChild(this._text("Source type", pl.source_type, (v) => this._setPlaylist("source_type", v)));
    box.appendChild(this._select("Remove duplicates", pl.dedupe === undefined ? "name" : String(pl.dedupe), [["name", "Same name (default)"], ["id", "Exact duplicates only"], ["false", "Keep all"]], (v) => this._setPlaylist("dedupe", v === "false" ? false : v)));
    if (Array.isArray(pl.items) && pl.items.length) { const n = document.createElement("span"); n.textContent = `+ ${pl.items.length} explicit item(s) (edit in YAML)`; n.style.cssText = "font-size:11px;opacity:.6;"; box.appendChild(n); }
    return box;
  }
  // Shortcuts (actions) — a generic list of buttons, each calling a script/service.
  _actionsObj() { let a = this._config.actions; if (Array.isArray(a)) a = { items: a }; return Object.assign({ items: [] }, a || {}); }
  _commitActions(a) { this._config = Object.assign({}, this._config, { actions: a }); delete this._config.audiobook; this._emit(); }
  _setActionTop(key, val) { const a = Object.assign({}, this._actionsObj()); if (val == null || val === "") delete a[key]; else a[key] = val; this._commitActions(a); }
  _setAction(i, key, val) { const a = this._actionsObj(); const items = a.items.map((it, j) => (j === i ? Object.assign({}, it) : it)); if (val == null || val === "") delete items[i][key]; else items[i][key] = val; this._commitActions(Object.assign({}, a, { items })); }
  _addAction() { const a = this._actionsObj(); this._commitActions(Object.assign({}, a, { items: a.items.concat([{ name: "", service: "" }]) })); this._rebuild(); }
  _removeAction(i) { const a = this._actionsObj(); this._commitActions(Object.assign({}, a, { items: a.items.filter((_, j) => j !== i) })); this._rebuild(); }
  _scriptEntity(label, value, onChange) {
    const el = document.createElement("ha-entity-picker");
    el.label = label; el.value = value || ""; el.allowCustomEntity = true;
    try { el.includeDomains = ["script"]; } catch (e) {}
    if (this._hass) try { el.hass = this._hass; } catch (e) {}
    el.addEventListener("value-changed", (e) => onChange(e.detail.value)); this._pickers.push(el); return el;
  }
  _actionsCard() {
    const a = this._actionsObj();
    const box = document.createElement("div");
    box.style.cssText = "border:1px solid var(--divider-color,rgba(127,127,127,.3));border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;";
    const h = document.createElement("span"); h.textContent = "Shortcuts (scripts)"; h.style.fontWeight = "600"; box.appendChild(h);
    box.appendChild(this._text("Section title", a.title, (v) => this._setActionTop("title", v)));
    a.items.forEach((it, i) => {
      const row = document.createElement("div");
      row.style.cssText = "border:1px solid var(--divider-color,rgba(127,127,127,.25));border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px;";
      const head = document.createElement("div"); head.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
      const t = document.createElement("span"); t.textContent = it.name || it.service || `Shortcut ${i + 1}`; t.style.cssText = "font-weight:600;font-size:13px;";
      head.append(t, this._btn("Remove", () => this._removeAction(i))); row.appendChild(head);
      row.appendChild(this._text("Name", it.name, (v) => this._setAction(i, "name", v)));
      row.appendChild(this._scriptEntity("Script (service)", it.service, (v) => {
        this._setAction(i, "service", v);
        const cur = this._actionsObj().items[i];
        if (v && cur && !cur.name) { const st = this._hass && this._hass.states[v]; const fn = st && st.attributes && st.attributes.friendly_name; if (fn) { this._setAction(i, "name", fn); this._rebuild(); } }
      }));
      row.appendChild(this._iconPicker("Icon", it.icon, (v) => this._setAction(i, "icon", v)));
      box.appendChild(row);
    });
    box.appendChild(this._btn("+ Add shortcut", () => this._addAction()));
    return box;
  }
  _rebuild() {
    if (!this._config) return;
    this._pickers = []; this.innerHTML = "";
    const root = document.createElement("div"); root.style.cssText = "display:flex;flex-direction:column;gap:14px;padding:8px 0;";
    root.appendChild(this._entity("Default room (focused on load)", this._config.default_room, (v) => this._setTop("default_room", v)));
    root.appendChild(this._select("Theme", this._config.theme || "ha", [["ha", "Home Assistant theme"], ["art", "Album artwork (dynamic)"], ["home", "Home teal (fixed)"]], (v) => this._setTop("theme", v === "ha" ? undefined : v)));
    this._config.rooms.forEach((room, i) => root.appendChild(this._roomCard(room, i)));
    root.appendChild(this._btn("+ Add room", () => this._addRoom()));
    root.appendChild(this._actionsCard());
    root.appendChild(this._playlistsCard());
    root.appendChild(this._switch("Compact groups (icon strip on the album art)", this._config.compact_groups, (v) => this._setTop("compact_groups", v || undefined)));
    root.appendChild(this._switch("Compact playlists (icon on the album art)", this._config.compact_playlists, (v) => this._setTop("compact_playlists", v || undefined)));
    root.appendChild(this._switch("Compact shortcuts (icon on the album art)", this._config.compact_actions, (v) => this._setTop("compact_actions", v || undefined)));
    this.appendChild(root); this._applyHass();
  }
}
if (!customElements.get("sonos-music-card-editor")) customElements.define("sonos-music-card-editor", SonosMusicCardEditor);

if (!customElements.get("sonos-music-card")) {
  customElements.define("sonos-music-card", SonosMusicCard);
  try { console.info(`%c sonos-music-card %c v${VERSION} `, "background:#18b2c4;color:#06303d;border-radius:3px 0 0 3px;font-weight:700", "background:#0a2f3c;color:#7fe9ef;border-radius:0 3px 3px 0"); } catch (e) {}
}
window.customCards = window.customCards || [];
window.customCards.push({ type: "sonos-music-card", name: "Sonos Music Card", description: "Immersive multi-room Sonos + Music Assistant player", preview: false });
