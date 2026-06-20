/* Sonos Music Card — multi-room music player (Immersive) for Home Assistant.
   Live native Sonos grouping (group_members + join/unjoin), helper-free. */
const TEAL = "linear-gradient(155deg,#0c4a5a 0%,#0a3140 52%,#06222e 100%)";
const VERSION = "0.4.1";
const ICON = {
  prev: '<polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line>',
  next: '<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  move: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>',
  exit: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  split: '<polyline points="15 14 20 9 15 4"></polyline><path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>',
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
    this._playlistItems = (plCfg.items || []).map((p) => ({ name: p.name, media_id: p.media_id, media_type: p.media_type || "playlist", image: p.image || null }));
    this._playlists = this._playlistItems.slice();
    this._playlistMsg = (this._playlistsConfigured && !this._playlistItems.length) ? "Loading playlists…" : null;
    this._browsed = false;
    this._focusKey = "smc-focus:" + this._rooms[0].entity;
    this._cfgDefaultFocus = config.default_room || null;
    this._focusEntity = null;
    this._localGroup = {};
    this._drag = null;
    this._localVol = {};
    this._localVolAt = {};
    this._open = false;
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
    const root = this.attachShadow ? (this.shadowRoot || this.attachShadow({ mode: "open" })) : this;
    const pills = this._rooms.map((r, i) =>
      `<button class="pill" data-room="${i}"><span class="dot"></span><span class="pn">${esc(r.name)}</span></button>`).join("");
    const grows = this._rooms.map((r, i) =>
      `<div class="grow" data-room="${i}"><div class="gtext"><span class="gn">${esc(r.name)}</span><span class="gs"></span></div><button class="gtog" data-room="${i}"></button></div>`).join("");
    const actionBtns = this._actions.map((a, i) =>
      `<button class="abtn" data-act="${i}"><span class="abic">${this._icon(a.icon, 22)}</span><span style="min-width:0"><span class="abt1">${esc(a.name)}</span><span class="abt2"></span></span></button>`).join("");
    const popRooms = this._rooms.map((r, i) =>
      `<div class="prow" data-room="${i}"><div class="prhead"><span class="prn">${esc(r.name)}</span><div class="prr"><button class="prdef" data-room="${i}">${svg(ICON.reset, 12, 2.2)}Default</button><span class="prpct"></span></div></div><div class="slider sm" data-room="${i}"><div class="strack"><div class="sfill"></div><div class="sknob"></div></div></div></div>`).join("");

    root.innerHTML = `<style>
:host{display:block;}
*{box-sizing:border-box;}
@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.root{position:relative;width:100%;max-width:1280px;margin:0 auto;border-radius:20px;overflow:hidden;background:${TEAL};font-family:'DM Sans',system-ui,sans-serif;color:#fff;}
.wash{position:absolute;inset:0;background:${TEAL};transition:opacity .3s;z-index:0;}
.blob{position:absolute;border-radius:99px;filter:blur(20px);z-index:0;}
.b1{top:-160px;left:-120px;width:620px;height:620px;background:radial-gradient(circle,rgba(24,178,196,.45),transparent 65%);}
.b2{bottom:-200px;right:120px;width:560px;height:560px;background:radial-gradient(circle,rgba(13,90,110,.6),transparent 65%);}
.wrap{position:relative;z-index:1;display:flex;gap:36px;padding:40px;}
.left{flex:1;display:flex;flex-direction:column;gap:22px;min-width:0;}
.ovl{font:700 11px/1.2 'DM Sans';letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.55);}
.col{display:flex;flex-direction:column;gap:10px;}
.pillrow{display:flex;gap:10px;flex-wrap:wrap;}
.pill{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:99px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:rgba(255,255,255,.78);font:500 14px/1 'DM Sans';cursor:pointer;transition:opacity .2s;}
.pill .dot{width:7px;height:7px;border-radius:99px;background:rgba(255,255,255,.3);}
.pill.current{background:rgba(0,204,204,.16);border-color:rgba(0,204,204,.55);color:#fff;box-shadow:inset 0 0 0 2px #18b2c4;}
.pill.current .dot{background:#eafdff;box-shadow:0 0 0 3px rgba(24,178,196,.55);}
.pill.follower{opacity:.4;background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.6);}
.pill.follower .dot{background:rgba(255,255,255,.25);}
.player{flex:1;display:flex;gap:22px;min-height:0;}
.art{position:relative;flex:none;width:498px;height:498px;border-radius:20px;overflow:hidden;background:linear-gradient(150deg,#1bb6c7,#0c5f72 48%,#07303f);}
.cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.scrim{position:absolute;left:0;right:0;bottom:0;padding:22px 26px 24px;background:linear-gradient(to top,rgba(4,22,30,.92),transparent);}
.np{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.eq{display:flex;align-items:flex-end;gap:3px;height:16px;}
.eq span{width:3px;height:100%;background:#00e0e0;border-radius:2px;transform-origin:bottom;}
.eq.on span{animation:eq .9s ease-in-out infinite;}
.eq.on span:nth-child(2){animation-delay:-.45s}
.npt{min-width:0;}
.t1{font:700 20px/1.2 'DM Sans';color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.t2{font:400 14px/1.3 'DM Sans';color:rgba(255,255,255,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.prog{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.prog .te{font:400 12px/1 'DM Sans';color:rgba(255,255,255,.7);min-width:30px;}
.bar{position:relative;flex:1;height:5px;border-radius:99px;background:rgba(255,255,255,.22);cursor:pointer;}
.bar .f{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:#fff;width:0;}
.bar .k{position:absolute;top:50%;width:12px;height:12px;border-radius:99px;background:#fff;transform:translate(-50%,-50%);left:0;}
.tr{display:flex;align-items:center;justify-content:center;gap:26px;}
.tr button{display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;color:rgba(255,255,255,.9);cursor:pointer;width:48px;height:48px;}
.tr .pp{width:74px;height:74px;border-radius:99px;background:#fff;color:#07303f;}
.gcol{flex:1;display:flex;flex-direction:column;gap:10px;min-width:0;}
.gchead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.splitbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);font:600 11px/1.1 'DM Sans';cursor:pointer;}
.splitbtn:hover{background:rgba(255,255,255,.14);}
.glist{flex:1;display:flex;flex-direction:column;gap:9px;}
.grow{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.13);cursor:pointer;}
.gtext{display:flex;flex-direction:column;gap:2px;min-width:0;}
.gn{font:600 15px/1.2 'DM Sans';color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.gs{font:500 11px/1 'DM Sans';letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;color:rgba(255,255,255,.45);}
.grow.grp{background:rgba(0,102,255,.14);border-color:rgba(0,102,255,.5);} .grow.grp .gs{color:#9cc0ff;}
.grow.master{background:rgba(0,204,204,.16);border-color:rgba(0,204,204,.55);box-shadow:inset 0 0 0 2px #18b2c4;} .grow.master .gs{color:#7fe9ef;}
.gtog{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:none;border-radius:99px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.85);cursor:pointer;flex:none;}
.grow.grp .gtog{background:#0066FF;color:#fff;}
.grow.master .gtog{background:#18b2c4;color:#06303d;}
.gtog.move{background:rgba(232,145,58,.2);color:#f3c18a;box-shadow:inset 0 0 0 1px rgba(232,145,58,.5);}
.volrow{position:relative;display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);}
.slider{position:relative;height:20px;display:flex;align-items:center;cursor:pointer;touch-action:none;flex:1;}
.slider .strack{position:relative;width:100%;height:6px;border-radius:99px;background:rgba(255,255,255,.2);}
.slider .sfill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,#0c6678,#18b2c4);width:0;}
.slider .sknob{position:absolute;top:50%;width:18px;height:18px;border-radius:99px;background:#fff;transform:translate(-50%,-50%);left:0;}
.btn{display:inline-flex;align-items:center;gap:8px;border-radius:99px;font:600 14px/1 'DM Sans';cursor:pointer;white-space:nowrap;padding:10px 16px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.18);}
.btn.act{background:#18b2c4;color:#06303d;border-color:transparent;}
.drop{padding:10px 12px;}
.pop{position:absolute;bottom:calc(100% + 12px);right:0;width:340px;max-width:calc(100vw - 32px);padding:18px;border-radius:16px;background:#0a2f3c;border:1px solid rgba(255,255,255,.14);z-index:30;}
.pophead,.prhead{display:flex;align-items:center;justify-content:space-between;}
.popcnt{font:600 12px/1 'DM Sans';color:#7fe9ef;}
.poprows{display:flex;flex-direction:column;gap:16px;margin-top:16px;}
.prn{font:600 14px/1 'DM Sans';color:#fff;}
.prr{display:flex;align-items:center;gap:10px;}
.prdef{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.82);font:600 11px/1 'DM Sans';cursor:pointer;}
.prpct{font:700 12px/1 'DM Sans';color:#7fe9ef;min-width:34px;text-align:right;}
.sm .strack{background:rgba(255,255,255,.15);} .sm .sfill{background:#18b2c4;}
.panel{flex:none;width:386px;display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);}
.actions{display:flex;flex-direction:column;gap:10px;}
.abtn{display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;border:1px solid rgba(0,102,255,.5);background:linear-gradient(135deg,rgba(0,102,255,.28),rgba(0,204,204,.2));color:#fff;cursor:pointer;text-align:left;width:100%;}
.abic{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.16);flex:none;}
.abic ha-icon{--mdc-icon-size:22px;}
.abt1{display:block;font:700 16px/1.2 'DM Sans';}
.abt2{display:block;font:400 13px/1.3 'DM Sans';color:rgba(255,255,255,.7);margin-top:3px;}
.grid{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px;overflow:auto;}
.tile{position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:14px;border-radius:14px;min-height:118px;border:none;cursor:pointer;text-align:left;overflow:hidden;color:#fff;}
.tile .tscrim{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),transparent 60%);}
.tile .tn{position:relative;font:700 15px/1.15 'DM Sans';color:#fff;}
.root.narrow .wrap{flex-direction:column;gap:24px;padding:28px;}
.root.narrow .panel{width:auto;}
.root.stack .player{flex-direction:column;}
.root.stack .art{width:100%;height:auto;aspect-ratio:1/1;}
.root.phone .volrow{flex-wrap:wrap;}
</style>
<div class="root">
  <div class="wash"></div><div class="blob b1"></div><div class="blob b2"></div>
  <div class="wrap">
    <div class="left">
      <div class="col"><span class="ovl">Speakers — tap to select group</span><div class="pillrow">${pills}</div></div>
      <div class="player">
        <div class="art">
          <img class="cover" alt="" style="display:none">
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
        </div>
        <div class="gcol"><div class="gchead"><span class="ovl">Tap to add to group</span><button class="splitbtn" style="display:none"></button></div><div class="glist">${grows}</div></div>
      </div>
      <div class="volrow">
        <span class="vic">${svg(ICON.vol, 20)}</span>
        <div class="slider master"><div class="strack"><div class="sfill"></div><div class="sknob"></div></div></div>
        <button class="btn mvol">${svg(ICON.reset, 16, 2.2)}Defaults</button>
        <div style="position:relative">
          <button class="btn drop" aria-label="Room volumes">${svg(ICON.chev, 18)}</button>
          <div class="pop" style="display:none">
            <div class="pophead"><span class="ovl">Room volumes</span><span class="popcnt"></span></div>
            <div class="poprows">${popRooms}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      ${this._actions.length ? `<span class="ovl">${esc(this._actionsTitle)}</span><div class="actions">${actionBtns}</div>` : ""}
      ${this._playlistsConfigured ? `<span class="ovl"${this._actions.length ? ' style="margin-top:4px"' : ""}>${esc(this._playlistsTitle)}</span><div class="grid"></div>` : ""}
    </div>
  </div>
</div>`;

    const $ = (s) => root.querySelector(s);
    this._root = $(".root");
    this.$ = {
      wash: $(".wash"), b1: $(".b1"), b2: $(".b2"), art: $(".art"), cover: $(".cover"),
      eq: $(".eq"), t1: $(".t1"), t2: $(".t2"), el: $(".el"), du: $(".du"),
      barF: $(".bar .f"), barK: $(".bar .k"), bar: $(".bar"),
      prev: $(".prev"), pp: $(".pp"), next: $(".next"),
      pills: [...root.querySelectorAll(".pill")], grows: [...root.querySelectorAll(".grow")],
      splitbtn: $(".splitbtn"),
      mFill: $(".slider.master .sfill"), mKnob: $(".slider.master .sknob"), mSlider: $(".slider.master"),
      drop: $(".drop"), pop: $(".pop"), popcnt: $(".popcnt"), mvol: $(".mvol"),
      grid: $(".grid"), actions: [...root.querySelectorAll(".abtn")],
      prows: [...root.querySelectorAll(".prow")],
    };

    // events
    this.$.pills.forEach((el) => el.addEventListener("click", () => this._selectGroup(+el.dataset.room)));
    this.$.grows.forEach((el) => el.addEventListener("click", () => this._toggleGroup(+el.dataset.room)));
    this.$.splitbtn.addEventListener("click", () => this._splitFocus());
    this.$.prev.addEventListener("click", () => this._prev());
    this.$.next.addEventListener("click", () => this._next());
    this.$.pp.addEventListener("click", () => this._svc("media_player", "media_play_pause", { entity_id: this._coordRoom().entity }));
    this.$.bar.addEventListener("pointerdown", (e) => this._seekDrag(e));
    this.$.mSlider.addEventListener("pointerdown", (e) => this._volDrag(e, "master"));
    this.$.prows.forEach((el) => {
      el.querySelector(".slider").addEventListener("pointerdown", (e) => this._volDrag(e, +el.dataset.room));
      el.querySelector(".prdef").addEventListener("click", () => this._setVol(this._rooms[+el.dataset.room], this._rooms[+el.dataset.room].def, true));
    });
    this.$.drop.addEventListener("click", (e) => { e.stopPropagation(); this._open = !this._open; this._update(); });
    this.$.mvol.addEventListener("click", () => this._setDefaults());
    this.$.actions.forEach((el) => el.addEventListener("click", () => this._runAction(+el.dataset.act)));
    this._renderTiles();
    this._onDoc = (e) => { if (this._open && !e.composedPath().includes(this.$.pop) && e.composedPath().indexOf(this.$.drop) < 0) { this._open = false; this._update(); } };
    document.addEventListener("click", this._onDoc);
    this._observe();
  }

  _resize() {
    if (!this._root) return;
    const w = this._root.clientWidth;
    if (!w) return; // not laid out yet — keep the default (landscape) until we have a real width
    this._root.classList.toggle("narrow", w < 1040);
    this._root.classList.toggle("stack", w < 760);
    this._root.classList.toggle("phone", w < 480);
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
      this._svc("media_player", "unjoin", { entity_id: r.entity });
    } else {
      this._optGroup(r.entity, true);
      this._svc("media_player", "join", { entity_id: this._coordRoom().entity, group_members: [r.entity] });
    }
    this._update();
  }
  // Header button: pull the focused speaker out so it becomes its own group.
  _splitFocus() {
    const f = this._focusRoom(); if (this._effMembers().size <= 1) return;
    this._optGroup(f.entity, false);
    this._svc("media_player", "unjoin", { entity_id: f.entity });
    this._update();
  }
  _prev() { this._svc("media_player", "media_previous_track", { entity_id: this._coordRoom().entity }); }
  _next() { this._svc("media_player", "media_next_track", { entity_id: this._coordRoom().entity }); }
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
      this.$.grid.innerHTML = this._playlistMsg ? `<div style="grid-column:1/-1;align-self:start;font:500 13px/1.45 'DM Sans';color:rgba(255,255,255,.6)">${esc(this._playlistMsg)}</div>` : "";
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
      const items = children.filter((c) => c.can_play || c.can_expand).map((c) => this._toItem(c));
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
      if (fire) this._svc("media_player", "media_seek", { entity_id: m.entity, seek_position: p * dur });
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
    // wash from art
    const pic = a.entity_picture || null;
    this._applyWash(pic);
    // cover
    if (pic) { if (this.$.cover.getAttribute("src") !== pic) this.$.cover.src = pic; this.$.cover.style.display = ""; }
    else this.$.cover.style.display = "none";
    // pills — focused group's coordinator = ring/bright; followers = grey; other masters/solo = normal
    this._rooms.forEach((r, i) => {
      const el = this.$.pills[i]; const gm = this._groupMembersOf(r);
      const isFollower = gm.length > 1 && gm[0] !== r.entity;
      el.classList.toggle("current", r.entity === coordE);
      el.classList.toggle("follower", isFollower && r.entity !== coordE);
    });
    // group rows — coordinator anchor / in group / available (stands out) / in another group (amber)
    const playing = s && s.state === "playing";
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
    // volume — master slider shows the group level (average); popover = per-room
    const mv = this._masterVal();
    this.$.mFill.style.width = mv + "%"; this.$.mKnob.style.left = mv + "%";
    this.$.drop.classList.toggle("act", this._open);
    this.$.pop.style.display = this._open ? "" : "none";
    if (this._open) {
      this.$.popcnt.textContent = grouped.length + (grouped.length === 1 ? " room" : " rooms");
      this._rooms.forEach((r, i) => {
        const row = this.$.prows[i]; const show = members.has(r.entity); row.style.display = show ? "" : "none";
        if (!show) return;
        const v = this._vol(r);
        row.querySelector(".prpct").textContent = v + "%";
        row.querySelector(".sfill").style.width = v + "%"; row.querySelector(".sknob").style.left = v + "%";
      });
    }
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

  _applyWash(pic) {
    if (pic === this._lastPic) return;
    this._lastPic = pic;
    if (!pic) return this._setWash(null);
    const img = new Image(); img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = c.height = 24;
        const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        let r = 0, g = 0, b = 0, wsum = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const sat = mx === 0 ? 0 : (mx - mn) / mx; const w = 0.15 + sat;
          r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; wsum += w;
        }
        this._setWash([r / wsum, g / wsum, b / wsum]);
      } catch (e) { this._setWash(null); }
    };
    img.onerror = () => this._setWash(null);
    img.src = pic;
  }
  _setWash(rgb) {
    if (!this.$) return;
    if (!rgb) {
      this.$.wash.style.background = TEAL;
      this.$.b1.style.background = "radial-gradient(circle,rgba(24,178,196,.45),transparent 65%)";
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

if (!customElements.get("sonos-music-card")) {
  customElements.define("sonos-music-card", SonosMusicCard);
  try { console.info(`%c sonos-music-card %c v${VERSION} `, "background:#18b2c4;color:#06303d;border-radius:3px 0 0 3px;font-weight:700", "background:#0a2f3c;color:#7fe9ef;border-radius:0 3px 3px 0"); } catch (e) {}
}
window.customCards = window.customCards || [];
window.customCards.push({ type: "sonos-music-card", name: "Sonos Music Card", description: "Immersive multi-room Sonos + Music Assistant player", preview: false });
