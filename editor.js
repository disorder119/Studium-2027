/* ==========================================================================
   STUDIUM 2027 · Mappen-Editor
   Seiten (A4) mit Bildern und Text, Bild-Bibliothek (Katalog + eigene Uploads),
   Autosave im Browser (IndexedDB), PDF-Export (html2canvas + jsPDF, lokal).
   Nichts verlässt den Browser.
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, M = window.STUDY_MUSTER;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const DIM = { l: { w: 1123, h: 794, mm: [297, 210] }, p: { w: 794, h: 1123, mm: [210, 297] } };

  /* ------------------------------------------------------------ Layouts (x, y, w, h in %) */
  const LAYOUTS = [
    { id: "cover", name: "Deckblatt", l: [["txt", 10, 26, 80, 28, { fs: 56 }], ["txt", 10, 58, 80, 26, { fs: 20 }]], p: [["txt", 10, 22, 80, 24, { fs: 46 }], ["txt", 10, 50, 80, 30, { fs: 19 }]] },
    { id: "imgFull", name: "Bild groß", l: [["img", 6, 6, 88, 76], ["txt", 6, 84, 88, 10, { fs: 15 }]], p: [["img", 7, 4, 86, 82], ["txt", 7, 88, 86, 8, { fs: 14 }]] },
    { id: "imgText", name: "Bild + Text", l: [["img", 5, 6, 58, 88], ["txt", 67, 8, 28, 84, { fs: 16 }]], p: [["img", 7, 4, 86, 56], ["txt", 7, 63, 86, 31, { fs: 16 }]] },
    { id: "twoImg", name: "Zwei Bilder", l: [["img", 5, 6, 44, 76], ["img", 51, 6, 44, 76], ["txt", 5, 84, 90, 10, { fs: 14 }]], p: [["img", 7, 3, 86, 43], ["img", 7, 48, 86, 43], ["txt", 7, 92, 86, 5, { fs: 13 }]] },
    { id: "oneTwo", name: "Eins groß, zwei klein", l: [["img", 5, 6, 58, 78], ["img", 66, 6, 29, 37], ["img", 66, 46, 29, 38], ["txt", 5, 86, 90, 8, { fs: 14 }]], p: [["img", 7, 3, 86, 52], ["img", 7, 57, 42, 31], ["img", 51, 57, 42, 31], ["txt", 7, 90, 86, 7, { fs: 13 }]] },
    { id: "grid4", name: "Vier Bilder", l: [["img", 5, 5, 44.5, 40], ["img", 50.5, 5, 44.5, 40], ["img", 5, 47, 44.5, 40], ["img", 50.5, 47, 44.5, 40], ["txt", 5, 89, 90, 7, { fs: 14 }]], p: [["img", 6, 3, 43, 40], ["img", 51, 3, 43, 40], ["img", 6, 45, 43, 40], ["img", 51, 45, 43, 40], ["txt", 6, 87, 88, 9, { fs: 13 }]] },
    { id: "text", name: "Nur Text", l: [["txt", 12, 10, 76, 12, { fs: 36 }], ["txt", 12, 25, 76, 64, { fs: 20 }]], p: [["txt", 12, 8, 76, 9, { fs: 32 }], ["txt", 12, 20, 76, 70, { fs: 19 }]] },
    { id: "blank", name: "Leer", l: [], p: [] }
  ];
  const lay = id => LAYOUTS.find(x => x.id === id) || LAYOUTS[1];
  const slotsOf = (layoutId, o) => lay(layoutId)[o];
  const mkBlock = slot => (slot[0] === "img"
    ? { t: "img", src: "", up: "", work: "", fit: "contain", ph: "" }
    : { t: "txt", html: "", fs: (slot[5] && slot[5].fs) || 16, ff: "serif", al: "left", todo: false });
  const mkPage = (layoutId, o = "l") => ({ id: uid(), layout: layoutId, bg: "dark", blocks: slotsOf(layoutId, o).map(mkBlock) });

  /* ------------------------------------------------------------ Zustand */
  const S = { projects: [], cur: null, page: 0, sel: -1, uploads: [], tab: "page", libTab: "cat", libFilter: "all", libQ: "", exp: { name: "HorytskaVeronika", q: 1, limit: 0 } };
  const proj = () => S.projects.find(p => p.id === S.cur);
  const pgNow = () => proj().pages[S.page];
  const upMap = () => Object.fromEntries(S.uploads.map(u => [u.id, u]));
  const imgSrc = b => (b.up ? (upMap()[b.up] || {}).data || "" : b.src || "");

  /* ------------------------------------------------------------ Sicherung HTML */
  const ALLOWED = new Set(["B", "STRONG", "I", "EM", "U", "BR", "P", "DIV", "UL", "OL", "LI", "H2", "SPAN"]);
  function clean(html) {
    const t = document.createElement("template"); t.innerHTML = String(html || "");
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) return;
      if (c.nodeType !== 1 || !ALLOWED.has(c.tagName)) { c.remove(); return; }
      [...c.attributes].forEach(a => c.removeAttribute(a.name));
      walk(c);
    });
    walk(t.content);
    return t.innerHTML;
  }

  /* ------------------------------------------------------------ Speicher (IndexedDB, Fallback localStorage) */
  const store = (() => {
    let db = null;
    const open = () => new Promise(res => {
      try {
        const r = indexedDB.open("vh-editor", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("kv");
        r.onsuccess = () => { db = r.result; res(true); };
        r.onerror = () => res(false);
      } catch (e) { res(false); }
    });
    const tx = (mode, fn) => new Promise((res, rej) => { const t = db.transaction("kv", mode); const q = fn(t.objectStore("kv")); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); });
    return {
      async init() { this.ok = await open(); },
      async get(k) { try { if (this.ok) return await tx("readonly", s => s.get(k)); const v = localStorage.getItem("vh-ed-" + k); return v ? JSON.parse(v) : undefined; } catch (e) { return undefined; } },
      async set(k, v) { try { if (this.ok) await tx("readwrite", s => s.put(v, k)); else localStorage.setItem("vh-ed-" + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
    };
  })();
  let saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(async () => {
      const ok = await store.set("projects", S.projects) && await store.set("uploads", S.uploads) && await store.set("cur", S.cur);
      if (!ok) toast("Speichern im Browser nicht möglich – bitte Projekt als Datei sichern.");
    }, 350);
  }

  /* ------------------------------------------------------------ Verlauf */
  const H = { stack: [], i: -1 };
  function histReset() { H.stack = [JSON.stringify(proj())]; H.i = 0; undoBtns(); }
  function commit() {
    const snap = JSON.stringify(proj());
    if (snap !== H.stack[H.i]) {
      H.stack = H.stack.slice(0, H.i + 1); H.stack.push(snap);
      if (H.stack.length > 80) H.stack.shift();
      H.i = H.stack.length - 1;
    }
    save(); undoBtns(); renderCount();
  }
  function undoBtns() { $("#btnUndo").disabled = H.i <= 0; $("#btnRedo").disabled = H.i >= H.stack.length - 1; }
  function histGo(d) {
    const j = H.i + d; if (j < 0 || j >= H.stack.length) return;
    H.i = j;
    const obj = JSON.parse(H.stack[j]);
    S.projects = S.projects.map(p => (p.id === obj.id ? obj : p));
    S.page = Math.min(S.page, obj.pages.length - 1); S.sel = -1;
    renderAll(); save(); undoBtns();
  }

  /* ------------------------------------------------------------ Hilfen */
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600); }
  const caption = c => `<b>${esc(c.title)}</b><br>${esc([c.year, c.tech, c.size].filter(Boolean).join(" · "))}`;
  const plain = html => { const d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").trim(); };

  /* ------------------------------------------------------------ Seite rendern */
  function renderPage(pg, o, ctx = {}) {
    const d = DIM[o];
    const el = document.createElement("div");
    el.className = `pg ${pg.bg}`;
    el.style.width = d.w + "px"; el.style.height = d.h + "px";
    const slots = slotsOf(pg.layout, o);
    pg.blocks.forEach((b, i) => {
      const s = slots[i]; if (!s) return;
      const bl = document.createElement("div");
      bl.className = "blk " + b.t; bl.dataset.i = i;
      bl.style.cssText += `left:${s[1]}%;top:${s[2]}%;width:${s[3]}%;height:${s[4]}%;`;
      if (b.t === "img") {
        const src = imgSrc(b);
        if (src) { bl.style.backgroundImage = `url("${src}")`; bl.style.backgroundSize = b.fit; if (b.work && M.catalog[b.work]) bl.setAttribute("aria-label", M.catalog[b.work].title); }
        else { bl.classList.add("empty"); if (ctx.live) bl.innerHTML = `<div class="ph"><b>＋</b>Bild wählen oder hierher ziehen${b.ph ? `<small>${esc(b.ph)}</small>` : ""}</div>`; }
      } else {
        bl.classList.add("ff-" + b.ff);
        bl.style.fontSize = b.fs + "px"; bl.style.textAlign = b.al;
        bl.innerHTML = b.html;
        if (ctx.live) { bl.contentEditable = "true"; bl.spellcheck = true; bl.lang = "de"; if (b.todo) bl.classList.add("todo"); }
      }
      el.appendChild(bl);
    });
    const p = proj();
    if (p && p.pn && pg.layout !== "cover" && ctx.index !== undefined) {
      const f = document.createElement("div"); f.className = "pgfoot";
      f.innerHTML = `<span>${esc(p.footer || "")}</span><span>${ctx.index + 1}</span>`;
      el.appendChild(f);
    }
    return el;
  }

  /* ------------------------------------------------------------ Ansicht */
  function renderTop() {
    const sel = $("#projSelect");
    sel.innerHTML = S.projects.map(p => `<option value="${p.id}"${p.id === S.cur ? " selected" : ""}>${esc(p.name)}</option>`).join("");
    renderCount();
  }
  function renderCount() {
    const p = proj(); if (!p) return;
    const withImg = p.pages.filter(pg => pg.blocks.some(b => b.t === "img" && imgSrc(b))).length;
    const el = $("#edCount");
    let txt = `${p.pages.length} Seiten · ${withImg} mit Bild`, cls = "";
    if (p.target) {
      txt += ` · Soll ${p.target[0] === p.target[1] ? p.target[0] : p.target[0] + "–" + p.target[1]}`;
      cls = withImg >= p.target[0] && withImg <= p.target[1] ? "ok" : "warn";
    }
    el.textContent = txt; el.className = "ed-count " + cls;
  }
  function renderPages() {
    const p = proj(), o = p.o, d = DIM[o];
    const w = 150, z = w / d.w;
    const box = $("#pagesList"); box.innerHTML = "";
    p.pages.forEach((pg, i) => {
      const th = document.createElement("div");
      th.className = "th" + (i === S.page ? " cur" : ""); th.dataset.pi = i; th.tabIndex = 0; th.setAttribute("role", "button");
      th.setAttribute("aria-label", `Seite ${i + 1}`);
      const bx = document.createElement("div"); bx.className = "th-box"; bx.style.width = w + "px"; bx.style.height = d.h * z + "px";
      const mini = renderPage(pg, o, { index: i }); mini.style.transform = `scale(${z})`; bx.appendChild(mini); th.appendChild(bx);
      const meta = document.createElement("div"); meta.className = "th-meta";
      meta.innerHTML = `<span>${i + 1}</span><span class="th-act"><button type="button" data-act="up" aria-label="Nach oben"${i === 0 ? " disabled" : ""}>↑</button><button type="button" data-act="down" aria-label="Nach unten"${i === p.pages.length - 1 ? " disabled" : ""}>↓</button><button type="button" data-act="dup" aria-label="Duplizieren">⧉</button><button type="button" data-act="del" aria-label="Seite löschen">✕</button></span>`;
      th.appendChild(meta); box.appendChild(th);
    });
    const add = document.createElement("button"); add.type = "button"; add.className = "th-add"; add.dataset.act = "add"; add.textContent = "+ Seite"; box.appendChild(add);
  }
  let zoom = 1;
  function fitStage() {
    const p = proj(), d = DIM[p.o], st = $("#stage");
    const aw = st.clientWidth - 48, ah = st.clientHeight - 48;
    zoom = Math.max(.2, Math.min(aw / d.w, window.innerWidth < 1000 ? 9 : ah / d.h));
    $("#stageSize").style.width = d.w * zoom + "px"; $("#stageSize").style.height = d.h * zoom + "px";
    $("#stageInner").style.transform = `scale(${zoom})`;
  }
  function renderStage() {
    const p = proj(), inner = $("#stageInner");
    inner.innerHTML = ""; inner.classList.add("ed-live");
    const el = renderPage(pgNow(), p.o, { live: true, index: S.page });
    inner.appendChild(el);
    fitStage(); markSel();
  }
  function markSel() { $$("#stageInner .blk").forEach(b => b.classList.toggle("sel", Number(b.dataset.i) === S.sel)); }
  function refreshThumb() {
    const p = proj(), th = $(`#pagesList .th[data-pi="${S.page}"] .th-box`); if (!th) return;
    const d = DIM[p.o], z = 150 / d.w;
    const mini = renderPage(pgNow(), p.o, { index: S.page }); mini.style.transform = `scale(${z})`;
    th.innerHTML = ""; th.appendChild(mini);
  }

  /* ------------------------------------------------------------ Panels */
  function setTab(t) {
    S.tab = t;
    $$(".ed-tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
    ["page", "img", "txt", "out"].forEach(k => { $("#panel" + k[0].toUpperCase() + k.slice(1)).hidden = k !== t; });
    renderPanels();
  }
  function renderPanels() {
    if (S.tab === "page") panelPage();
    else if (S.tab === "img") panelImg();
    else if (S.tab === "txt") panelTxt();
    else panelOut();
  }
  function layIcon(l, o) {
    return `<span class="lay-i">${slotsOf(l.id, o).map(s => `<i class="${s[0] === "txt" ? "t" : ""}" style="left:${s[1]}%;top:${s[2]}%;width:${s[3]}%;height:${s[4]}%"></i>`).join("")}</span>`;
  }
  function panelPage() {
    const p = proj(), pg = pgNow();
    $("#panelPage").innerHTML = `
      <h4>Layout dieser Seite</h4>
      <div class="lay-grid">${LAYOUTS.map(l => `<button type="button" class="lay" data-layout="${l.id}" aria-pressed="${pg.layout === l.id}">${layIcon(l, p.o)}<span>${l.name}</span></button>`).join("")}</div>
      <h4>Hintergrund</h4>
      <div class="seg" role="group" aria-label="Hintergrund"><button type="button" data-bg="dark" aria-pressed="${pg.bg === "dark"}">Dunkel</button><button type="button" data-bg="light" aria-pressed="${pg.bg === "light"}">Hell</button></div>
      <h4>Projekt</h4>
      <label class="ed-field"><span>Name</span><input type="text" id="projName" value="${esc(p.name)}"></label>
      <div class="seg" role="group" aria-label="Ausrichtung"><button type="button" data-orient="l" aria-pressed="${p.o === "l"}">A4 quer</button><button type="button" data-orient="p" aria-pressed="${p.o === "p"}">A4 hoch</button></div>
      <label class="ed-chk"><input type="checkbox" id="pnChk"${p.pn ? " checked" : ""}> Seitenzahlen anzeigen</label>
      <label class="ed-field"><span>Fußzeile (links)</span><input type="text" id="footTxt" value="${esc(p.footer || "")}"></label>
      <div class="ed-row"><button type="button" class="btn ghost sm" id="projDup">Projekt duplizieren</button><button type="button" class="btn ghost sm" id="projDel">Projekt löschen</button></div>
      <p class="small muted">Alles wird automatisch in diesem Browser gespeichert. Für Sicherung oder anderen Rechner: Export → Projekt als Datei.</p>`;
  }
  function selBlock() { const pg = pgNow(); return pg && pg.blocks[S.sel]; }
  function panelImg() {
    const b = selBlock(), isImg = b && b.t === "img";
    const cat = Object.values(M.catalog);
    const flt = {
      all: () => true, acryl: c => /^acryl/.test(c.series), oel: c => c.series === "oel",
      textil: c => c.kind === "textil" && c.series !== "tx-detail" && c.series !== "tx-prozess", detail: c => c.series === "tx-detail" || c.series === "tx-prozess"
    };
    const q = S.libQ.toLowerCase();
    const items = cat.filter(flt[S.libFilter]).filter(c => !q || (c.title + " " + c.tech + " " + c.year).toLowerCase().includes(q));
    const ups = S.uploads;
    $("#panelImg").innerHTML = `
      <h4>Bildplatz</h4>
      ${isImg ? `<p>${imgSrc(b) ? "Bild ersetzen oder anpassen:" : "Leerer Bildplatz – unten ein Bild wählen."}</p>
        <div class="ed-row"><div class="seg" role="group" aria-label="Einpassung"><button type="button" data-fit="contain" aria-pressed="${b.fit === "contain"}">Einpassen</button><button type="button" data-fit="cover" aria-pressed="${b.fit === "cover"}">Füllen</button></div>
        <button type="button" class="btn ghost sm" id="imgClear"${imgSrc(b) ? "" : " disabled"}>Bild entfernen</button></div>`
        : `<p>Klicke in der Seite auf einen Bildplatz, dann auf ein Bild unten. Ohne Auswahl wird der erste freie Platz gefüllt.</p>`}
      <div class="lib-tabs"><div class="seg" role="group" aria-label="Quelle"><button type="button" data-lib="cat" aria-pressed="${S.libTab === "cat"}">Galerie (${cat.length})</button><button type="button" data-lib="up" aria-pressed="${S.libTab === "up"}">Meine Bilder (${ups.length})</button></div></div>
      ${S.libTab === "cat" ? `
        <label class="sr-only" for="libQ">Suchen</label><input type="search" id="libQ" placeholder="Galerie durchsuchen …" value="${esc(S.libQ)}">
        <div class="seg" role="group" aria-label="Filter">${[["all", "Alle"], ["acryl", "Acryl"], ["oel", "Öl"], ["textil", "Textil"], ["detail", "Details"]].map(([k, l]) => `<button type="button" data-lf="${k}" aria-pressed="${S.libFilter === k}">${l}</button>`).join("")}</div>
        <ul class="lib-grid">${items.map(c => `<li><button type="button" data-place-cat="${c.id}" title="${esc(c.title)}"><img src="./img/${c.id}.webp" alt="${esc(c.title)}" loading="lazy" width="90" height="110"><span>${esc(c.title)}</span></button></li>`).join("") || "<li class=muted>Nichts gefunden.</li>"}</ul>
        <p class="small muted">Galerie-Bilder haben Web-Auflösung (max. 640 px). Für scharfen Druck das Original unter „Meine Bilder“ hochladen und stattdessen einsetzen.</p>`
      : `<div class="up-drop" id="upDrop" tabindex="0" role="button">Bilder hochladen oder hierher ziehen<br><small>JPG, PNG, WebP – werden auf max. 2200 px verkleinert</small></div>
        <input type="file" id="upFile" accept="image/*" multiple class="sr-only">
        <ul class="lib-grid">${ups.map(u => `<li><button type="button" data-place-up="${u.id}" title="${esc(u.name)}"><img src="${u.data}" alt="${esc(u.name)}" width="90" height="110"><span>${esc(u.name)}</span></button><button type="button" class="del" data-del-up="${u.id}" aria-label="Upload löschen">×</button></li>`).join("") || "<li class=muted>Noch nichts hochgeladen.</li>"}</ul>`}`;
  }
  function panelTxt() {
    const b = selBlock(), isTxt = b && b.t === "txt";
    $("#panelTxt").innerHTML = !isTxt ? `<h4>Text</h4><p>Klicke in der Seite in einen Textblock, um ihn zu bearbeiten. Zum Formatieren Text markieren (ohne Markierung gilt es für den ganzen Block).</p>` : `
      <h4>Formatierung</h4>
      <div class="ed-row">
        <button type="button" class="tbtn" data-cmd="bold" aria-label="Fett"><b>B</b></button>
        <button type="button" class="tbtn" data-cmd="italic" aria-label="Kursiv"><i>I</i></button>
        <button type="button" class="tbtn" data-cmd="underline" aria-label="Unterstrichen"><u>U</u></button>
        <button type="button" class="tbtn" data-cmd="insertUnorderedList" aria-label="Liste">•≡</button>
        <button type="button" class="tbtn" data-cmd="h2" aria-label="Überschrift">H</button>
        <button type="button" class="tbtn" data-cmd="removeFormat" aria-label="Formatierung entfernen">T×</button>
      </div>
      <h4>Ausrichtung</h4>
      <div class="seg" role="group" aria-label="Ausrichtung">${[["left", "Links"], ["center", "Mitte"], ["right", "Rechts"], ["justify", "Block"]].map(([k, l]) => `<button type="button" data-al="${k}" aria-pressed="${b.al === k}">${l}</button>`).join("")}</div>
      <label class="ed-field"><span>Schriftgröße: <b id="fsOut">${b.fs}</b> px</span><input type="range" id="fsRange" min="9" max="90" value="${b.fs}"></label>
      <label class="ed-field"><span>Schrift</span><select id="ffSel"><option value="serif"${b.ff === "serif" ? " selected" : ""}>Serif (Garamond/Georgia)</option><option value="sans"${b.ff === "sans" ? " selected" : ""}>Sans (Systemschrift)</option><option value="mono"${b.ff === "mono" ? " selected" : ""}>Monospace</option></select></label>`;
  }
  function panelOut() {
    const p = proj(), issues = checkIssues();
    $("#panelOut").innerHTML = `
      <h4>PDF herunterladen</h4>
      <label class="ed-field"><span>Dateiname</span><input type="text" id="expName" value="${esc(S.exp.name)}"></label>
      <label class="ed-field"><span>Qualität</span><select id="expQ"><option value="0"${S.exp.q === 0 ? " selected" : ""}>Hoch (ca. 170 dpi)</option><option value="1"${S.exp.q === 1 ? " selected" : ""}>Mittel</option><option value="2"${S.exp.q === 2 ? " selected" : ""}>Klein (Bildschirm)</option></select></label>
      <label class="ed-field"><span>Größenlimit der Hochschule</span><select id="expLimit">${[[0, "kein Limit"], [5, "5 MB"], [12, "12 MB (KH Mainz)"], [30, "30 MB (HfBK Dresden)"], [40, "40 MB (HS Pforzheim)"], [50, "50 MB (BURG, HTW, Weißensee)"]].map(([v, l]) => `<option value="${v}"${S.exp.limit === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>
      ${issues.length ? `<ul class="ed-issues">${issues.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="small" style="color:var(--ok)">Keine offenen Platzhalter oder leeren Bildplätze.</p>`}
      <button type="button" class="btn primary" id="btnPdf">PDF herunterladen</button>
      <div class="ed-prog" id="expProg" hidden><b></b></div>
      <p class="small muted" id="expMsg" aria-live="polite">Das PDF besteht aus Bildern der Seiten (Text nicht markierbar), damit Schrift und Layout überall gleich aussehen. Unter dem Limit wird die Qualität automatisch gesenkt.</p>
      <h4>Alternative</h4>
      <button type="button" class="btn ghost" id="btnPrint">Drucken / Vektor-PDF (Browser)</button>
      <p class="small muted">Im Druckdialog „Als PDF speichern“ wählen; Text bleibt markierbar, Dateien sind oft kleiner.</p>
      <h4>Projekt sichern</h4>
      <div class="ed-row"><button type="button" class="btn ghost sm" id="btnSaveFile">Als Datei speichern</button><label class="btn ghost sm file-btn">Datei laden<input type="file" id="loadFile" accept="application/json,.json" class="sr-only"></label></div>`;
  }
  function checkIssues() {
    const p = proj(), out = [];
    p.pages.forEach((pg, i) => {
      const empty = pg.blocks.filter(b => b.t === "img" && !imgSrc(b)).length;
      const todo = pg.blocks.some(b => b.t === "txt" && b.todo);
      if (empty) out.push(`Seite ${i + 1}: ${empty} leerer Bildplatz`);
      if (todo) out.push(`Seite ${i + 1}: Platzhaltertext noch nicht ersetzt`);
    });
    return out;
  }
  function renderAll() { renderTop(); renderPages(); renderStage(); renderPanels(); undoBtns(); }

  /* ------------------------------------------------------------ Aktionen */
  function select(i) { S.sel = i; markSel(); const b = selBlock(); if (b) setTab(b.t === "img" ? "img" : "txt"); }
  function addPage(layoutId) {
    const p = proj(); p.pages.splice(S.page + 1, 0, mkPage(layoutId || "imgFull", p.o));
    S.page++; S.sel = -1; commit(); renderPages(); renderStage(); renderPanels();
  }
  function goPage(i) { S.page = i; S.sel = -1; renderPages(); renderStage(); renderPanels(); const t = $(`#pagesList .th[data-pi="${i}"]`); if (t) t.scrollIntoView({ block: "nearest" }); }
  function pageAct(act, i) {
    const p = proj();
    if (act === "up" && i > 0) { [p.pages[i - 1], p.pages[i]] = [p.pages[i], p.pages[i - 1]]; S.page = i - 1; }
    else if (act === "down" && i < p.pages.length - 1) { [p.pages[i + 1], p.pages[i]] = [p.pages[i], p.pages[i + 1]]; S.page = i + 1; }
    else if (act === "dup") { const c = JSON.parse(JSON.stringify(p.pages[i])); c.id = uid(); p.pages.splice(i + 1, 0, c); S.page = i + 1; }
    else if (act === "del") {
      if (p.pages.length === 1) { toast("Die letzte Seite kann nicht gelöscht werden."); return; }
      if (!confirm(`Seite ${i + 1} löschen? (Mit Strg+Z rückgängig zu machen)`)) return;
      p.pages.splice(i, 1); S.page = Math.min(S.page, p.pages.length - 1);
    } else return;
    S.sel = -1; commit(); renderPages(); renderStage(); renderPanels();
  }
  function setLayout(id) {
    const p = proj(), pg = pgNow(), slots = slotsOf(id, p.o);
    const oldImgs = pg.blocks.filter(b => b.t === "img"), oldTxt = pg.blocks.filter(b => b.t === "txt");
    let ii = 0, ti = 0;
    const nb = slots.map(s => (s[0] === "img" ? (oldImgs[ii++] || mkBlock(s)) : (oldTxt[ti++] || mkBlock(s))));
    const lostImg = oldImgs.slice(ii).some(b => imgSrc(b)), lostTxt = oldTxt.slice(ti).some(b => plain(b.html));
    if ((lostImg || lostTxt) && !confirm("Dieses Layout hat weniger Plätze – nicht untergebrachte Bilder/Texte gehen von dieser Seite verloren (Strg+Z holt sie zurück). Fortfahren?")) return;
    pg.layout = id; pg.blocks = nb; S.sel = -1;
    commit(); renderPages(); renderStage(); renderPanels();
  }
  function placeImage(data) {
    const pg = pgNow(), p = proj();
    if (!pg.blocks.some(b => b.t === "img")) { setLayout("imgFull"); return placeImage(data); }
    let i = S.sel >= 0 && pg.blocks[S.sel] && pg.blocks[S.sel].t === "img" ? S.sel : pg.blocks.findIndex(b => b.t === "img" && !imgSrc(b));
    if (i < 0) i = pg.blocks.findIndex(b => b.t === "img");
    const b = pg.blocks[i];
    b.src = data.src || ""; b.up = data.up || ""; b.work = data.work || ""; b.ph = "";
    if (data.work && M.catalog[data.work]) {
      const ti = pg.blocks.findIndex(x => x.t === "txt" && (!plain(x.html) || x.todo));
      if (ti >= 0) { pg.blocks[ti].html = caption(M.catalog[data.work]); pg.blocks[ti].todo = false; }
    }
    S.sel = i; commit(); renderPages(); renderStage(); renderPanels();
  }
  async function fileToUpload(file) {
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) {
      bmp = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
    }
    const w0 = bmp.width, h0 = bmp.height, k = Math.min(1, 2200 / Math.max(w0, h0));
    const c = document.createElement("canvas"); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
    const x = c.getContext("2d");
    let data = "";
    if (file.type === "image/png") { x.drawImage(bmp, 0, 0, c.width, c.height); data = c.toDataURL("image/png"); }
    if (!data || data.length > 3.2e6) { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height); data = c.toDataURL("image/jpeg", .9); }
    return { id: uid(), name: file.name.replace(/\.[^.]+$/, "").slice(0, 60), data, w: c.width, h: c.height };
  }
  async function addUploads(files, placeFirst) {
    const list = [...files].filter(f => /^image\//.test(f.type)); if (!list.length) { toast("Das ist keine Bilddatei."); return; }
    let first = null;
    for (const f of list) {
      try { const u = await fileToUpload(f); S.uploads.push(u); first = first || u; } catch (e) { toast(`„${f.name}“ konnte nicht gelesen werden (z. B. HEIC – bitte als JPG speichern).`); }
    }
    save();
    if (first && placeFirst) placeImage({ up: first.id });
    else { S.libTab = "up"; renderPanels(); }
    if (first) toast(`${list.length} Bild${list.length > 1 ? "er" : ""} hochgeladen`);
  }

  /* ------------------------------------------------------------ Projekte */
  function newProject(name, pages, extra) {
    const p = Object.assign({ id: uid(), name, o: "l", pages, planId: "", target: null, pn: true, footer: "Veronika Horytska" }, extra || {});
    S.projects.push(p); S.cur = p.id; S.page = 0; S.sel = -1; histReset(); renderAll(); save();
    return p;
  }
  function blankPages() {
    const c = mkPage("cover");
    c.blocks[0].html = "Veronika Horytska"; c.blocks[1].html = "Portfolio 2023–2026<br><br>veronikahorytska@icloud.com<br>Instagram: veronikahorytska";
    return [c, mkPage("imgFull")];
  }
  function buildFromPlan(prog) {
    const pl = M.plans[prog.id];
    const pages = [], cover = mkPage("cover");
    cover.blocks[0].html = "Veronika Horytska";
    cover.blocks[1].html = `Portfolio 2023–2026<br>Bewerbung: ${esc(prog.course)} · ${esc(prog.university)}<br><br>veronikahorytska@icloud.com<br>Instagram: veronikahorytska`;
    pages.push(cover);
    const skipped = [];
    const body = [];
    pl.sections.forEach(sec => sec.slots.forEach(sl => {
      if (sl.k === "w") {
        const c = M.catalog[sl.id], pg = mkPage("imgFull");
        pg.blocks[0].src = `./img/${sl.id}.webp`; pg.blocks[0].work = sl.id; pg.blocks[1].html = caption(c); body.push(pg);
      } else if (sl.k === "m") {
        const mt = M.MONT[sl.key], ids = mt[2], lid = ids.length === 2 ? "twoImg" : ids.length === 3 ? "oneTwo" : "grid4";
        const pg = mkPage(lid), imgs = pg.blocks.filter(b => b.t === "img");
        imgs.forEach((b, i) => { if (ids[i]) { b.src = `./img/${ids[i]}.webp`; b.work = ids[i]; } });
        const tb = pg.blocks.find(b => b.t === "txt"); tb.html = `<b>${esc(mt[0])}</b>`; body.push(pg);
      } else if (sl.k === "n") {
        const nw = M.NEW[sl.key], pg = mkPage("imgFull");
        pg.blocks[0].ph = `${nw[0]} – ${sl.note || nw[1]}`;
        pg.blocks[1].html = `<b>${esc(nw[0])}</b><br>Jahr · Technik · Maße`; pg.blocks[1].todo = true; body.push(pg);
      }
    }));
    const docPages = [], toc = [];
    (pl.docs || []).forEach(dc => {
      const dpg = mkPage("text");
      if (dc.key === "statement") {
        dpg.blocks[0].html = "Statement";
        dpg.blocks[1].html = "<p><b>Warum Kleidung als Bildträger?</b></p><p>[2–3 Sätze]</p><br><p><b>Woher kommen Pfeife, Reiter, Bison, Hut?</b></p><p>[2–3 Sätze]</p><br><p><b>Was möchte ich hier lernen?</b></p><p>[2–3 Sätze]</p>"; dpg.blocks[1].todo = true; docPages.push(dpg);
      } else if (dc.key === "cv") {
        dpg.blocks[0].html = "Lebenslauf";
        dpg.blocks[1].html = "<p><b>Persönliche Daten</b></p><p>[Name, Geburtsdatum, Wohnort, Kontakt]</p><br><p><b>Schule und Ausbildung</b></p><p>[Zeitraum – Schule/Abschluss]</p><br><p><b>Praktika, Kurse, Ausstellungen</b></p><p>[Zeitraum – Ort – Inhalt]</p><br><p><b>Sprachen</b></p><p>[Ukrainisch – Deutsch (Niveau) – Englisch]</p>"; dpg.blocks[1].todo = true; docPages.push(dpg);
      } else if (dc.key === "erklaerung") {
        dpg.blocks[0].html = "Mappenerklärung";
        dpg.blocks[1].html = "<p>[Eine Seite: Idee, Material und Reihenfolge der Mappe.]</p>"; dpg.blocks[1].todo = true; docPages.push(dpg);
      } else if (dc.key === "werkliste") { dpg._kind = "werkliste"; docPages.push(dpg); }
      else if (dc.key === "deckblatt") { dpg._kind = "toc"; dpg._comments = /kommentar/i.test(dc.note || ""); toc.push(dpg); }
      else skipped.push(M.DOC[dc.key][0]);
    });
    const all = [cover, ...toc, ...body, ...docPages];
    const listLines = () => all.map((pg, i) => ({ pg, i })).filter(x => x.pg.blocks.some(b => b.t === "img" && b.work)).map(x => ({ n: x.i + 1, c: M.catalog[x.pg.blocks.find(b => b.t === "img" && b.work).work] }));
    all.forEach(pg => {
      if (pg._kind === "werkliste") {
        const L = listLines(), fs = Math.max(8, Math.min(18, Math.floor(500 / (Math.max(L.length, 1) * 1.45))));
        pg.blocks[0].html = "Werkliste";
        pg.blocks[1].html = L.map(x => `<p>${x.n}. <b>${esc(x.c.title)}</b>, ${esc([x.c.year, x.c.tech, x.c.size].filter(Boolean).join(", "))}</p>`).join(""); pg.blocks[1].fs = fs;
      } else if (pg._kind === "toc") {
        const L = listLines(), fs = Math.max(8, Math.min(18, Math.floor(500 / (Math.max(L.length, 1) * (pg._comments ? 2.6 : 1.45)))));
        pg.blocks[0].html = "Inhaltsverzeichnis";
        pg.blocks[1].html = L.map(x => `<p>S. ${x.n} · <b>${esc(x.c.title)}</b>, ${esc(x.c.year)}${pg._comments ? "<br><i>[Kurzkommentar]</i>" : ""}</p>`).join(""); pg.blocks[1].fs = fs; pg.blocks[1].todo = !!pg._comments;
      }
      delete pg._kind; delete pg._comments;
    });
    return { pages: all, skipped };
  }
  function loadPlan(planId) {
    const prog = D.programs.find(p => p.id === planId); if (!prog || !M.plans[planId]) return;
    const { pages, skipped } = buildFromPlan(prog), pl = M.plans[planId];
    newProject(`${prog.universityShort} · ${prog.course}`, pages, { planId, target: pl.count, pn: !planId.startsWith("weissensee-"), footer: planId.startsWith("weissensee-") ? "" : "Veronika Horytska" });
    S.exp.name = "HorytskaVeronika";
    setTab("page");
    toast(`Mappe „${prog.universityShort}“ angelegt: ${pages.length} Seiten.${skipped.length ? " Eigene Dateien (nicht enthalten): " + skipped.join(", ") + "." : ""}`);
  }

  /* ------------------------------------------------------------ Export */
  const PRESETS = [[1, .92], [1, .85], [.8, .8], [.65, .72], [.5, .62]];
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function exportPdf() {
    const p = proj(), o = p.o, d = DIM[o];
    if (!window.html2canvas || !window.jspdf) { toast("PDF-Bibliotheken nicht geladen."); return; }
    const issues = checkIssues();
    if (issues.length && !confirm(`Noch offen:\n\n${issues.slice(0, 8).join("\n")}${issues.length > 8 ? "\n…" : ""}\n\nTrotzdem exportieren?`)) return;
    const prog = $("#expProg"), bar = $("#expProg b"), msg = $("#expMsg"), btn = $("#btnPdf");
    btn.disabled = true; prog.hidden = false; bar.style.width = "0";
    const host = $("#exportHost"), jpegs = [];
    try {
      for (let i = 0; i < p.pages.length; i++) {
        msg.textContent = `Seite ${i + 1} von ${p.pages.length} wird gerendert …`;
        const el = renderPage(p.pages[i], o, { index: i }); el.classList.add("exporting"); host.innerHTML = ""; host.appendChild(el);
        await Promise.all([...el.querySelectorAll(".blk.img")].map(b => { const m = /url\("(.*)"\)/.exec(b.style.backgroundImage || ""); return m ? loadImg(m[1]).catch(() => 0) : 0; }));
        const cv = await html2canvas(el, { scale: 1.75, backgroundColor: p.pages[i].bg === "dark" ? "#151210" : "#ffffff", logging: false, useCORS: true });
        jpegs.push(cv.toDataURL("image/jpeg", PRESETS[0][1])); bar.style.width = Math.round(100 * (i + 1) / (p.pages.length * 2)) + "%";
        host.innerHTML = "";
      }
      const limit = S.exp.limit * 1048576;
      const bytes = a => a.reduce((t, u) => t + (u.length - 23) * .75, 0);
      const reencode = async k => {
        msg.textContent = `Größe wird angepasst (Stufe ${k + 1} von ${PRESETS.length}) …`;
        const out = [];
        for (const u of jpegs) {
          const im = await loadImg(u), f = PRESETS[k][0], c = document.createElement("canvas");
          c.width = Math.round(im.width * f); c.height = Math.round(im.height * f); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          out.push(c.toDataURL("image/jpeg", PRESETS[k][1]));
        }
        return out;
      };
      let used = S.exp.q, final = used === 0 ? jpegs : await reencode(used);
      while (limit && bytes(final) > limit && used < PRESETS.length - 1) { used++; final = await reencode(used); }
      msg.textContent = "PDF wird erstellt …";
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: o === "l" ? "landscape" : "portrait", unit: "mm", format: "a4", compress: true });
      final.forEach((u, i) => { if (i) doc.addPage("a4", o === "l" ? "landscape" : "portrait"); doc.addImage(u, "JPEG", 0, 0, d.mm[0], d.mm[1], undefined, "FAST"); bar.style.width = (50 + Math.round(50 * (i + 1) / final.length)) + "%"; });
      const name = (S.exp.name || "Mappe").replace(/[^\wÄÖÜäöüß.-]+/g, "_").replace(/\.pdf$/i, "") + ".pdf";
      doc.save(name);
      const mb = bytes(final) / 1048576;
      msg.textContent = `Fertig: ${name} · ${p.pages.length} Seiten · ca. ${mb.toFixed(1)} MB${limit && mb * 1048576 > limit ? " – Limit trotz niedrigster Stufe überschritten, bitte Seiten oder Bilder verringern." : used > S.exp.q ? " (Qualität automatisch gesenkt, um das Limit einzuhalten)" : ""}`;
      if (limit && mb * 1048576 > limit) toast("Limit überschritten – siehe Hinweis im Export-Tab.");
    } catch (e) {
      console.warn(e);
      msg.textContent = "Export fehlgeschlagen: " + (e && e.message ? e.message : e) + (location.protocol === "file:" ? " – bitte über start.sh/start.bat öffnen." : "");
    } finally { host.innerHTML = ""; btn.disabled = false; setTimeout(() => { prog.hidden = true; }, 800); }
  }
  function printVector() {
    const p = proj(), root = $("#printRoot");
    root.innerHTML = ""; p.pages.forEach((pg, i) => root.appendChild(renderPage(pg, p.o, { index: i })));
    let st = $("#pageStyle"); if (!st) { st = document.createElement("style"); st.id = "pageStyle"; document.head.appendChild(st); }
    st.textContent = `@page { size: A4 ${p.o === "l" ? "landscape" : "portrait"}; margin: 0; }`;
    document.body.classList.add("printing");
    const done = () => { document.body.classList.remove("printing"); root.innerHTML = ""; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done); setTimeout(() => window.print(), 50);
  }
  function saveFile() {
    const p = proj(), used = new Set();
    p.pages.forEach(pg => pg.blocks.forEach(b => { if (b.up) used.add(b.up); }));
    const blob = new Blob([JSON.stringify({ app: "vh-mappe", v: 1, project: p, uploads: S.uploads.filter(u => used.has(u.id)) })], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (p.name.replace(/[^\wÄÖÜäöüß.-]+/g, "_") || "mappe") + ".mappe.json"; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function loadFile(file) {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const o = JSON.parse(fr.result); if (!o || o.app !== "vh-mappe" || !o.project || !Array.isArray(o.project.pages)) throw new Error();
        const have = new Set(S.uploads.map(u => u.id));
        (o.uploads || []).forEach(u => { if (u && u.id && typeof u.data === "string" && /^data:image\//.test(u.data) && !have.has(u.id)) S.uploads.push({ id: String(u.id), name: String(u.name || "Bild").slice(0, 60), data: u.data, w: u.w, h: u.h }); });
        const pr = o.project;
        const pages = pr.pages.map(pg => ({
          id: uid(), layout: lay(pg.layout).id, bg: pg.bg === "light" ? "light" : "dark",
          blocks: (pg.blocks || []).map(b => (b.t === "img"
            ? { t: "img", src: /^\.\/img\/[\w-]+\.webp$/.test(b.src || "") ? b.src : "", up: S.uploads.some(u => u.id === b.up) ? b.up : "", work: M.catalog[b.work] ? b.work : "", fit: b.fit === "cover" ? "cover" : "contain", ph: String(b.ph || "").slice(0, 200) }
            : { t: "txt", html: clean(b.html), fs: Math.max(8, Math.min(120, Number(b.fs) || 16)), ff: ["serif", "sans", "mono"].includes(b.ff) ? b.ff : "serif", al: ["left", "center", "right", "justify"].includes(b.al) ? b.al : "left", todo: !!b.todo }))
        }));
        if (!pages.length) throw new Error();
        newProject(String(pr.name || "Importiert").slice(0, 80), pages, { o: pr.o === "p" ? "p" : "l", planId: String(pr.planId || ""), target: Array.isArray(pr.target) ? pr.target.slice(0, 2).map(Number) : null, pn: pr.pn !== false, footer: String(pr.footer || "").slice(0, 80) });
        toast("Projekt geladen.");
      } catch (e) { toast("Datei nicht lesbar."); }
    };
    fr.readAsText(file);
  }

  /* ------------------------------------------------------------ Ereignisse */
  function selEl() { return $(`#stageInner .blk[data-i="${S.sel}"]`); }
  function syncText(el) {
    const b = pgNow().blocks[Number(el.dataset.i)]; if (!b || b.t !== "txt") return;
    b.html = clean(el.innerHTML); b.todo = false; el.classList.remove("todo");
  }
  let txtT;
  $("#stageInner").addEventListener("click", e => {
    const bl = e.target.closest(".blk"); if (!bl) { S.sel = -1; markSel(); return; }
    const i = Number(bl.dataset.i);
    if (S.sel !== i) select(i); else if (pgNow().blocks[i].t === "img") setTab("img");
  });
  $("#stageInner").addEventListener("focusin", e => { const bl = e.target.closest && e.target.closest(".blk.txt"); if (bl && S.sel !== Number(bl.dataset.i)) select(Number(bl.dataset.i)); });
  $("#stageInner").addEventListener("input", e => {
    const bl = e.target.closest(".blk.txt"); if (!bl) return;
    syncText(bl); clearTimeout(txtT); txtT = setTimeout(() => { refreshThumb(); commit(); }, 700);
  });
  $("#stageInner").addEventListener("focusout", e => { const bl = e.target.closest && e.target.closest(".blk.txt"); if (bl) { syncText(bl); clearTimeout(txtT); refreshThumb(); commit(); } });
  $("#stageInner").addEventListener("paste", e => {
    const bl = e.target.closest(".blk.txt"); if (!bl) return;
    e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData("text/plain"); document.execCommand("insertText", false, t);
  });
  ["dragover", "dragenter"].forEach(ev => $("#stageInner").addEventListener(ev, e => { const bl = e.target.closest(".blk.img"); if (bl && e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { e.preventDefault(); bl.classList.add("drop"); } }));
  $("#stageInner").addEventListener("dragleave", e => { const bl = e.target.closest(".blk.img"); if (bl) bl.classList.remove("drop"); });
  $("#stageInner").addEventListener("drop", e => {
    const bl = e.target.closest(".blk.img"); if (!bl) return;
    e.preventDefault(); bl.classList.remove("drop"); S.sel = Number(bl.dataset.i); addUploads(e.dataTransfer.files, true);
  });

  $("#pagesList").addEventListener("click", e => {
    const act = e.target.closest("[data-act]"), th = e.target.closest(".th");
    if (act && act.dataset.act === "add") { addPage("imgFull"); return; }
    if (act && th) { e.stopPropagation(); pageAct(act.dataset.act, Number(th.dataset.pi)); return; }
    if (th) goPage(Number(th.dataset.pi));
  });
  $("#pagesList").addEventListener("keydown", e => { const th = e.target.closest && e.target.closest(".th"); if (th && e.target === th && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); goPage(Number(th.dataset.pi)); } });

  $(".ed-tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) setTab(b.dataset.tab); });
  $(".ed-side").addEventListener("mousedown", e => { if (e.target.closest(".tbtn")) e.preventDefault(); });
  $(".ed-side").addEventListener("click", e => {
    const t = e.target;
    const l = t.closest("[data-layout]"); if (l) { setLayout(l.dataset.layout); return; }
    const bg = t.closest("[data-bg]"); if (bg) { pgNow().bg = bg.dataset.bg; commit(); renderPages(); renderStage(); renderPanels(); return; }
    const or = t.closest("[data-orient]"); if (or) { proj().o = or.dataset.orient; commit(); renderAll(); return; }
    if (t.closest("#projDup")) { const c = JSON.parse(JSON.stringify(proj())); c.id = uid(); c.name += " (Kopie)"; S.projects.push(c); S.cur = c.id; S.page = 0; S.sel = -1; histReset(); renderAll(); save(); return; }
    if (t.closest("#projDel")) {
      if (!confirm(`Projekt „${proj().name}“ endgültig löschen?`)) return;
      S.projects = S.projects.filter(p => p.id !== S.cur);
      if (!S.projects.length) newProject("Meine Mappe", blankPages()); else { S.cur = S.projects[0].id; S.page = 0; S.sel = -1; histReset(); renderAll(); save(); }
      return;
    }
    const fit = t.closest("[data-fit]"); if (fit) { const b = selBlock(); if (b) { b.fit = fit.dataset.fit; commit(); renderPages(); renderStage(); renderPanels(); } return; }
    if (t.closest("#imgClear")) { const b = selBlock(); if (b) { b.src = ""; b.up = ""; b.work = ""; commit(); renderPages(); renderStage(); renderPanels(); } return; }
    const lib = t.closest("[data-lib]"); if (lib) { S.libTab = lib.dataset.lib; renderPanels(); return; }
    const lf = t.closest("[data-lf]"); if (lf) { S.libFilter = lf.dataset.lf; renderPanels(); return; }
    const pc = t.closest("[data-place-cat]"); if (pc) { placeImage({ src: `./img/${pc.dataset.placeCat}.webp`, work: pc.dataset.placeCat }); return; }
    const pu = t.closest("[data-place-up]"); if (pu) { placeImage({ up: pu.dataset.placeUp }); return; }
    const du = t.closest("[data-del-up]");
    if (du) {
      const id = du.dataset.delUp, used = S.projects.some(p => p.pages.some(pg => pg.blocks.some(b => b.up === id)));
      if (used && !confirm("Dieses Bild wird in einem Projekt verwendet. Trotzdem löschen? (Der Bildplatz bleibt dann leer.)")) return;
      S.uploads = S.uploads.filter(u => u.id !== id); save(); renderPanels(); renderStage(); renderPages(); return;
    }
    if (t.closest("#upDrop")) { $("#upFile").click(); return; }
    const cmd = t.closest("[data-cmd]");
    if (cmd) {
      const el = selEl(); if (!el || !el.isContentEditable) return;
      el.focus(); const sel = getSelection();
      if (!sel.rangeCount || sel.isCollapsed || !el.contains(sel.anchorNode)) { const r = document.createRange(); r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r); }
      if (cmd.dataset.cmd === "h2") document.execCommand("formatBlock", false, document.queryCommandValue("formatBlock").toLowerCase() === "h2" ? "div" : "h2");
      else document.execCommand(cmd.dataset.cmd);
      syncText(el); refreshThumb(); commit(); return;
    }
    const al = t.closest("[data-al]"); if (al) { const b = selBlock(); if (b) { b.al = al.dataset.al; const el = selEl(); if (el) el.style.textAlign = b.al; commit(); renderPanels(); refreshThumb(); } return; }
    if (t.closest("#btnPdf")) { exportPdf(); return; }
    if (t.closest("#btnPrint")) { printVector(); return; }
    if (t.closest("#btnSaveFile")) { saveFile(); return; }
  });
  $(".ed-side").addEventListener("input", e => {
    const t = e.target, b = selBlock();
    if (t.id === "fsRange" && b) { b.fs = Number(t.value); $("#fsOut").textContent = b.fs; const el = selEl(); if (el) el.style.fontSize = b.fs + "px"; refreshThumb(); }
    if (t.id === "libQ") { S.libQ = t.value; const pos = t.selectionStart; renderPanels(); const n = $("#libQ"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    if (t.id === "projName") { proj().name = t.value; renderTop(); save(); }
    if (t.id === "footTxt") { proj().footer = t.value; save(); renderStage(); renderPages(); }
    if (t.id === "expName") S.exp.name = t.value;
  });
  $(".ed-side").addEventListener("change", e => {
    const t = e.target, b = selBlock();
    if (t.id === "fsRange") commit();
    if (t.id === "ffSel" && b) { b.ff = t.value; commit(); renderStage(); renderPages(); }
    if (t.id === "pnChk") { proj().pn = t.checked; commit(); renderStage(); renderPages(); }
    if (t.id === "expQ") S.exp.q = Number(t.value);
    if (t.id === "expLimit") S.exp.limit = Number(t.value);
    if (t.id === "upFile" && t.files.length) { addUploads(t.files, S.sel >= 0 && pgNow().blocks[S.sel] && pgNow().blocks[S.sel].t === "img" && t.files.length === 1); t.value = ""; }
    if (t.id === "loadFile" && t.files[0]) { loadFile(t.files[0]); t.value = ""; }
  });
  ["dragover", "dragenter"].forEach(ev => $(".ed-side").addEventListener(ev, e => { if (e.target.closest("#upDrop")) { e.preventDefault(); $("#upDrop").classList.add("over"); } }));
  $(".ed-side").addEventListener("dragleave", e => { const u = $("#upDrop"); if (u) u.classList.remove("over"); });
  $(".ed-side").addEventListener("drop", e => { if (e.target.closest("#upDrop")) { e.preventDefault(); $("#upDrop").classList.remove("over"); addUploads(e.dataTransfer.files, false); } });

  $("#projSelect").addEventListener("change", e => { S.cur = e.target.value; S.page = 0; S.sel = -1; histReset(); renderAll(); save(); });
  $("#btnNew").addEventListener("click", () => { const n = prompt("Name des neuen Projekts:", "Neue Mappe"); if (n) { newProject(n.slice(0, 80), blankPages()); setTab("page"); } });
  $("#btnUndo").addEventListener("click", () => histGo(-1));
  $("#btnRedo").addEventListener("click", () => histGo(1));
  $("#btnExportTop").addEventListener("click", () => setTab("out"));
  $("#btnPlan").addEventListener("click", () => { renderPlanList(); $("#planDlg").showModal(); $("#planSearch").focus(); });
  function renderPlanList() {
    const q = ($("#planSearch").value || "").toLowerCase();
    const ps = D.programs.filter(p => M.plans[p.id] && (p.course + " " + p.university + " " + p.universityShort).toLowerCase().includes(q))
      .sort((a, b) => (a.applicationDeadline || a.deadlineSortHint || "9999").localeCompare(b.applicationDeadline || b.deadlineSortHint || "9999"));
    $("#planList").innerHTML = ps.map(p => { const s = M.plans[p.id].sum; return `<li><button type="button" data-plan="${p.id}"><b>${esc(p.course)}</b><em>${s.total} Blätter</em><small>${esc(p.universityShort)} · ${esc(String(p.portfolio.count || "").slice(0, 70))}</small></button></li>`; }).join("") || '<li class="muted">Nichts gefunden.</li>';
  }
  $("#planSearch").addEventListener("input", renderPlanList);
  $("#planList").addEventListener("click", e => { const b = e.target.closest("[data-plan]"); if (b) { $("#planDlg").close(); loadPlan(b.dataset.plan); } });
  $("#planDlg").addEventListener("click", e => { if (e.target === $("#planDlg") || e.target.closest("[data-close-dlg]")) $("#planDlg").close(); });

  document.addEventListener("keydown", e => {
    const inEdit = e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && !inEdit && e.key.toLowerCase() === "z") { e.preventDefault(); histGo(e.shiftKey ? 1 : -1); }
    if ((e.ctrlKey || e.metaKey) && !inEdit && e.key.toLowerCase() === "y") { e.preventDefault(); histGo(1); }
  });
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => proj() && fitStage(), 100); });
  window.addEventListener("beforeunload", () => { try { clearTimeout(saveT); store.set("projects", S.projects); store.set("uploads", S.uploads); store.set("cur", S.cur); } catch (e) { /* nichts */ } });

  /* ------------------------------------------------------------ Start */
  (async () => {
    if (location.protocol === "file:") $("#fileWarn").hidden = false;
    await store.init();
    const [pr, up, cur] = await Promise.all([store.get("projects"), store.get("uploads"), store.get("cur")]);
    S.projects = Array.isArray(pr) ? pr : []; S.uploads = Array.isArray(up) ? up : [];
    S.cur = S.projects.some(p => p.id === cur) ? cur : (S.projects[0] && S.projects[0].id);
    const m = location.hash.match(/^#plan=([\w-]+)/);
    if (m && M.plans[m[1]]) {
      const ex = S.projects.find(p => p.planId === m[1]);
      if (ex) { S.cur = ex.id; histReset(); renderAll(); } else loadPlan(m[1]);
      history.replaceState(null, "", location.pathname);
    } else if (!S.projects.length) newProject("Meine Mappe", blankPages());
    else { S.page = 0; histReset(); renderAll(); }
    setTab("page");
    window.__editor = { S, loadPlan, exportPdf };
  })();
})();
