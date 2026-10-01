/* ==========================================================================
   STUDIUM 2027 · Fortschritt sichern und wiederfinden
   • fordert dauerhaften Speicher an (damit der Browser nichts löscht)
   • merkt sich, wo du zuletzt warst („Willkommen zurück“)
   • Komplett-Sicherung: Cockpit + Editor + Kosten-Rechner in einer Datei
   • erinnert an Sicherungen; Installation als App und Offline-Modus
   Alles bleibt im Browser dieses Geräts. Es gibt kein Konto und keinen Server.
   ========================================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const K_MAIN = "vh-studium-2027", K_KOSTEN = "vh-kosten", K_TOP = "vh-top", K_MINE = "vh-mine", K_BT = "vh-beratung", K_VISIT = "vh-visit", K_BACKUP = "vh-backup";
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const toast = msg => { const t = $("#toast"); if (!t) return; t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 4200); };
  const D = window.STUDY_DATA;
  const dayNum = ms => Math.floor(ms / 864e5);

  /* ------------------------------------------------------------ Dauerhafter Speicher */
  function askPersist() {
    if (!(navigator.storage && navigator.storage.persist)) return;
    navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist().then(ok => { window.__persisted = ok; }).catch(() => {}); else window.__persisted = true; }).catch(() => {});
  }
  ["pointerdown", "keydown"].forEach(ev => window.addEventListener(ev, askPersist, { once: true, passive: true }));

  /* ------------------------------------------------------------ Zusammenfassung */
  function summary() {
    const m = read(K_MAIN) || {};
    const check = Object.keys(m.check || {}).length, total = D && D.checklist ? D.checklist.length : 0;
    const sent = Object.values(m.status || {}).filter(s => ["abgeschickt", "einladung", "pruefung", "zusage"].includes(s)).length;
    const favs = Object.keys(m.fav || {}).length, notes = Object.keys(m.notes || {}).length;
    return { check, total, sent, favs, notes, any: check + sent + favs + notes + Object.keys(m.status || {}).length > 0 };
  }

  /* ------------------------------------------------------------ Letzte Position merken */
  const secs = $$("main section[id], main .hero[id]");
  const vis = new Map(); let cur = "";
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { es.forEach(e => vis.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)); let best = "", r = 0; vis.forEach((v, k) => { if (v > r) { r = v; best = k; } }); if (best) cur = best; }, { threshold: [.1, .3, .6] });
    secs.forEach(s => io.observe(s));
  }
  const title = id => { const s = document.getElementById(id); const h = s && (s.querySelector("h2") || s.querySelector("h1")); return h ? h.textContent.replace(/\s+/g, " ").trim() : id; };
  function saveVisit() { write(K_VISIT, { t: Date.now(), s: cur || "top" }); }
  setInterval(saveVisit, 4000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveVisit(); });
  window.addEventListener("pagehide", saveVisit);

  function rel(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60) return `vor ${m} Min.`;
    const h = Math.round(m / 60); if (h < 24) return `vor ${h} Std.`;
    const d = Math.round(h / 24); return d === 1 ? "gestern" : `vor ${d} Tagen`;
  }
  function welcome() {
    const v = read(K_VISIT); const prev = v && v.s ? v : null;
    const visits = ((read(K_VISIT + "-n") || 0) + 1); write(K_VISIT + "-n", visits);
    if (location.hash || !prev || prev.s === "top" || !document.getElementById(prev.s) || Date.now() - prev.t < 5 * 60000) return;
    const s = summary();
    const el = document.createElement("div"); el.className = "welcome wrap"; el.setAttribute("role", "status");
    el.innerHTML = `<div><b>Willkommen zurück!</b> Beim letzten Mal warst du bei „${esc(title(prev.s))}“ (${rel(Date.now() - prev.t)}).${s.any ? ` Dein Stand: ${s.check} von ${s.total} Unterlagen · ${s.sent} abgeschickt · ${s.favs} Favoriten.` : ""}</div>
      <div class="welcome-act"><button type="button" class="btn primary sm" data-wb-go="${esc(prev.s)}">Dort weitermachen</button><button type="button" class="btn ghost sm" data-wb-close>Schließen</button></div>`;
    const top = $("main"); top.insertBefore(el, top.firstChild);
    el.addEventListener("click", e => {
      const go = e.target.closest("[data-wb-go]");
      if (go) { const t = document.getElementById(go.dataset.wbGo); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); el.remove(); }
      if (e.target.closest("[data-wb-close]")) el.remove();
    });
  }

  /* ------------------------------------------------------------ Komplett-Sicherung */
  const idb = {
    open() { return new Promise(res => { try { const r = indexedDB.open("vh-editor", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }); },
    async get(k) { const db = await this.open(); if (!db) return undefined; return new Promise(res => { const q = db.transaction("kv", "readonly").objectStore("kv").get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); },
    async set(k, v) { const db = await this.open(); if (!db) return false; return new Promise(res => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = () => res(true); t.onerror = () => res(false); }); }
  };
  async function exportAll() {
    const data = { app: "vh-studium-all", v: 1, at: new Date().toISOString(), local: { [K_MAIN]: read(K_MAIN), [K_KOSTEN]: read(K_KOSTEN), [K_TOP]: read(K_TOP), [K_MINE]: read(K_MINE), [K_BT]: read(K_BT) }, editor: { projects: await idb.get("projects"), uploads: await idb.get("uploads"), cur: await idb.get("cur") } };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const r = await window.VH.save(`studium-2027-komplett-${new Date().toISOString().slice(0, 10)}.json`, blob);
    if (r !== "saved") { toast(r === "declined" ? "Sicherung abgebrochen." : "Sicherung hat nicht geklappt. Bitte noch einmal versuchen."); return; }
    write(K_BACKUP, Date.now()); info(); toast("Komplett-Sicherung gespeichert – bewahre die Datei sicher auf.");
  }
  function importAll(file) {
    const fr = new FileReader();
    fr.onload = async () => {
      try {
        const o = JSON.parse(fr.result);
        if (!o || o.app !== "vh-studium-all" || !o.local) throw new Error("format");
        if (!(await window.VH.confirm("Alles laden? Dein aktueller Fortschritt in diesem Browser wird durch die Sicherung ersetzt.", "Ja, laden", "Abbrechen"))) return;
        Object.entries(o.local).forEach(([k, v]) => { if ([K_MAIN, K_KOSTEN, K_TOP, K_MINE, K_BT].includes(k) && v && typeof v === "object") write(k, v); });
        if (o.editor) {
          if (Array.isArray(o.editor.projects)) await idb.set("projects", o.editor.projects);
          if (Array.isArray(o.editor.uploads)) await idb.set("uploads", o.editor.uploads);
          if (o.editor.cur) await idb.set("cur", o.editor.cur);
        }
        write(K_BACKUP, Date.now()); toast("Sicherung geladen – Seite wird neu gestartet …"); setTimeout(() => location.reload(), 900);
      } catch (e) { toast("Datei nicht lesbar – bitte eine „studium-2027-komplett“-Sicherung wählen."); }
    };
    fr.readAsText(file);
  }

  /* ------------------------------------------------------------ Infozeile, Buttons, Installation */
  let deferred = null;
  const standalone = window.matchMedia && (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function info() {
    const el = $("#saveInfo"); if (!el) return;
    const b = read(K_BACKUP);
    el.innerHTML = `<b>Dein Fortschritt wird automatisch gespeichert</b> – in diesem Browser auf diesem Gerät (kein Konto, kein Server). ${window.__persisted ? "Der Browser hat den Speicher als dauerhaft markiert." : ""}
      Letzte Komplett-Sicherung: <b>${b ? rel(Date.now() - b) : "noch nie"}</b>.
      <span class="save-act"><button type="button" class="text-btn" data-all-export>Alles sichern</button> · <label class="text-btn file-btn">Alles laden<input type="file" accept="application/json,.json" class="sr-only" data-all-import></label>${deferred && !standalone ? ' · <button type="button" class="text-btn" data-install>Als App installieren</button>' : ""}</span>
      ${isIOS && !standalone ? '<br><small>iPhone/iPad: In Safari auf „Teilen“ → „Zum Home-Bildschirm“ tippen, dann startet die Seite wie eine App und funktioniert auch offline.</small>' : ""}`;
  }
  function mount() {
    const foot = $(".footer > div");
    if (foot && !$("#saveInfo")) { const p = document.createElement("p"); p.id = "saveInfo"; p.className = "small save-info"; foot.appendChild(p); }
    const tools = $(".cockpit-tools");
    if (tools && !$("#exportAll")) {
      const b = document.createElement("button"); b.type = "button"; b.className = "text-btn"; b.id = "exportAll"; b.setAttribute("data-all-export", ""); b.textContent = "Alles sichern (inkl. Editor)";
      const l = document.createElement("label"); l.className = "text-btn file-btn"; l.innerHTML = 'Alles laden<input type="file" accept="application/json,.json" class="sr-only" data-all-import>';
      tools.appendChild(b); tools.appendChild(l);
    }
    info();
  }
  document.addEventListener("click", e => {
    if (e.target.closest("[data-all-export]")) exportAll();
    if (e.target.closest("[data-install]") && deferred) { deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; info(); }); }
  });
  document.addEventListener("change", e => { if (e.target.matches("[data-all-import]") && e.target.files[0]) { importAll(e.target.files[0]); e.target.value = ""; } });
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; info(); });

  /* ------------------------------------------------------------ Erinnerung an Sicherung */
  function remind() {
    const s = summary(), b = read(K_BACKUP), visits = read(K_VISIT + "-n") || 0;
    if (!s.any || visits < 3) return;
    if (b && dayNum(Date.now()) - dayNum(b) < 14) return;
    if (sessionStorage.getItem("vh-remind")) return;
    try { sessionStorage.setItem("vh-remind", "1"); } catch (e) { /* weiter */ }
    setTimeout(() => toast("Tipp: Sichere deinen Fortschritt – ganz unten „Alles sichern“. So geht nichts verloren, auch wenn du das Handy wechselst."), 6000);
  }

  /* ------------------------------------------------------------ Offline und App */
  if ("serviceWorker" in navigator && location.protocol !== "file:") window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));

  function init() { mount(); welcome(); remind(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.VHProgress = { exportAll, summary };
})();
