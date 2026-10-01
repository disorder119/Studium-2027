/* ==========================================================================
   STUDIUM 2027 · Oberfläche für Kosten & Finanzierung
   Liest window.STUDY_DATA, STUDY_KOSTEN, STUDY_MUSTER. Rechner-Eingaben
   bleiben im Browser (localStorage "vh-kosten").
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, K = window.STUDY_KOSTEN, M = window.STUDY_MUSTER;
  if (!D || !K) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const eur = (v, d = 0) => `${Number(v).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d })} €`;
  const P = id => D.programs.find(p => p.id === id);
  const KEY = "vh-kosten";
  const STATUS = { sicher: ["belegt", "ok"], geplant: ["geplant · nicht beschlossen", "tight"], klaeren: ["bitte klären", "open"] };

  /* ------------------------------------------------------------ Zustand */
  function mine() { try { return JSON.parse(localStorage.getItem("vh-studium-2027") || "{}"); } catch (e) { return {}; } }
  const st = (() => {
    let o = {};
    try { o = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { o = {}; }
    const favs = Object.keys(mine().fav || {});
    const firstFav = favs.find(id => P(id));
    const s = Object.assign({ prog: firstFav || "haw-kostuemdesign", form: K.defaults.form, material: K.defaults.material, kv: K.defaults.kv, tag: "all" }, o);
    if (!P(s.prog)) s.prog = "haw-kostuemdesign";
    return s;
  })();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ohne Speicher weiter */ } };

  /* ------------------------------------------------------------ Berechnung für ein Programm */
  function calc(p, over = {}) {
    const sem = K.semOf(p);
    const b = K.budget({ city: p.city, form: over.form || st.form, grund: K.defaults.grund, kv: over.kv != null ? over.kv : st.kv, material: over.material != null ? over.material : st.material, sem: sem ? sem.amount : K.semDefault.amount });
    return { sem, b };
  }
  function bafoegRows(total) {
    return ["now", "s1", "s2"].map(k => {
      const x = K.bafoeg[k], gap = total - x.max;
      return { key: k, x, gap, cover: Math.min(100, Math.round(100 * x.max / total)) };
    });
  }

  /* ------------------------------------------------------------ Abschnitt im Studiengangs-Dialog */
  function block(p) {
    if (!K) return "";
    const tu = K.tuition(p), { sem, b } = calc(p), fees = K.applyFees(p);
    const r = K.rent[p.city];
    const rows = bafoegRows(b.total);
    return `<section class="dlg-sec kosten-sec" id="kostenSec">
      <h3>Kosten <small>– für dich als Ukrainerin mit § 24</small></h3>
      <dl class="ko-facts">
        <div class="kv"><dt>Studiengebühren</dt><dd><span class="mu-badge ${tu.cls}">${esc(tu.short)}</span><br><small>${esc(tu.text)}</small></dd></div>
        <div class="kv"><dt>Semesterbeitrag</dt><dd>${sem ? `<b>${eur(sem.amount, 2)}</b> pro Semester <small>(${esc(sem.stand)})</small>` : `<b>ca. ${eur(K.semDefault.lo)}–${eur(K.semDefault.hi)}</b> pro Semester <small>(Richtwert, inkl. Semesterticket ${eur(K.ticket.amount, 2)} – genauer Betrag beim Studierendensekretariat)</small>`}</dd></div>
        <div class="kv"><dt>WG-Zimmer in ${esc(D.cities[p.city].name)}</dt><dd><b>${eur(r[0])}–${eur(r[1])}</b> im Monat <small>(${r[3] ? "MLP-Studentenwohnreport 2025: " : ""}${esc(r[2])})</small></dd></div>
        <div class="kv"><dt>Wohnheim (Studierendenwerk)</dt><dd><b>ca. ${eur(K.wohnheim.amount)}</b> warm im Schnitt <small>– lange Wartelisten, früh bewerben</small></dd></div>
        <div class="kv"><dt>Kosten der Bewerbung</dt><dd>${fees.length ? fees.map(f => `${esc(f.label)}: <b>${eur(f.amount)}</b>`).join("<br>") : "keine Gebühr genannt"}${p.portfolio && /physisch/.test(p.portfolio.type || "") ? "<br><small>Physische Mappe: Druck, Aufziehen und Versand einplanen (Schätzung nötig, keine Quelle).</small>" : ""}</dd></div>
        <div class="kv"><dt>Beispiel-Monatsbudget (WG)</dt><dd><b>ca. ${eur(b.total)}</b> pro Monat <small>(Miete ${eur(b.miete)} + Alltag ${eur(K.defaults.grund)} + Versicherung ${eur(st.kv)} + Beitrag + Material ${eur(st.material)})</small></dd></div>
      </dl>
      <p class="ko-bafoeg"><b>Gegen BAföG gerechnet:</b> ${rows.map(x => `${esc(x.x.label)}: Höchstsatz ${eur(x.x.max)} → ${x.gap > 0 ? `Lücke <b>${eur(x.gap)}</b>` : "gedeckt"}`).join(" · ")}. Der Höchstsatz gilt nur bei niedrigem Einkommen der Eltern; ab 2027 sind die Beträge ein <em>Entwurf</em>.</p>
      <div class="ed-row"><button type="button" class="btn ghost" data-ko-open="${esc(p.id)}">Im Kosten-Rechner anpassen</button></div>
    </section>`;
  }

  /* ------------------------------------------------------------ Hauptabschnitt */
  function applicationBox() {
    const favIds = Object.keys(mine().fav || {}).filter(id => P(id));
    let ps = favIds.map(P), basis = `deine ${favIds.length} Favoriten`;
    if (!ps.length) {
      ps = D.programs.filter(p => M && M.plans[p.id] && p.applicationDeadline && p.deadlineExact && M.plans[p.id].fit !== "mittel")
        .sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline)).slice(0, 5);
      basis = "die fünf nächsten Fristen mit guter Passung (setze ★ Favoriten, dann rechnet die Seite mit deiner Auswahl)";
    }
    const uni = ps.filter(p => p.internationalApplication && p.internationalApplication.route === "uni-assist");
    const uniCost = uni.length ? 75 + 30 * (uni.length - 1) : 0;
    const fee = ps.map(p => (/Bewerbungsgebühr (\d+) €/.exec(p.fees || "") || [0, 0])[1]).map(Number).reduce((a, b) => a + b, 0);
    const phys = ps.filter(p => /physisch/.test((p.portfolio && p.portfolio.type) || ""));
    return `<div class="ko-box"><h3 class="h3">Was kostet die Bewerbung selbst?</h3>
      <p class="muted small">Berechnet für ${esc(basis)}.</p>
      <ul class="ko-list"><li><span>uni-assist (${uni.length} Bewerbung${uni.length === 1 ? "" : "en"}: ${uni.map(p => esc(p.universityShort + " " + p.course)).join(", ") || "–"})</span><b>${eur(uniCost)}</b></li>
        <li><span>Bewerbungsgebühren der Hochschulen (z. B. UdK)</span><b>${eur(fee)}</b></li>
        <li><span>Physische Mappen (${phys.length}: ${phys.map(p => esc(p.universityShort)).join(", ") || "keine"}) – Druck/Porto</span><b>Schätzung nötig</b></li></ul>
      <p class="ko-sum">Sicher berechenbar: <b>${eur(uniCost + fee)}</b>${uni.length ? ` · davon uni-assist 75 € + 30 € je weitere Bewerbung` : ""}</p>
      <p class="small muted">Sprachprüfung (B2/C1), Beglaubigungen und Übersetzungen kommen je nach Hochschule dazu – siehe Karten oben.</p></div>`;
  }
  function resHtml() {
    const p = P(st.prog), { sem, b } = calc(p), rows = bafoegRows(b.total);
    const wh = K.budget({ city: p.city, form: "wohnheim", grund: K.defaults.grund, kv: st.kv, material: st.material, sem: sem ? sem.amount : K.semDefault.amount }).total;
    return `<table class="ko-table"><tbody>${b.lines.map(l => `<tr><th scope="row">${esc(l.k)}<small>${esc(l.n)}</small></th><td>${eur(l.v)}</td></tr>`).join("")}</tbody><tfoot><tr><th scope="row">Monatsbedarf</th><td>${eur(b.total)}</td></tr></tfoot></table>
      <div class="ko-bars">${rows.map(x => `<div class="bar"><span class="bar-l">${esc(x.x.label)}</span><span class="bar-v">${eur(x.x.max)}</span><span class="bar-t" aria-hidden="true"><b style="width:${x.cover}%"></b></span><small>${x.gap > 0 ? `Lücke ohne weiteres Geld: <b>${eur(x.gap)}</b> pro Monat (${eur(x.gap * 12)} pro Jahr)` : "BAföG-Höchstsatz deckt den Bedarf"} · ${esc(x.x.from)}</small></div>`).join("")}</div>
      <p class="note ko-note">${esc(K.bafoeg.note)} BAföG ist zur Hälfte ein Darlehen (Rückzahlung bei 10.010 € gedeckelt). ${form() === "wg" && wh < b.total ? `Mit Wohnheimplatz sinkt der Bedarf auf etwa <b>${eur(wh)}</b>.` : ""}</p>`;
  }
  const form = () => st.form;
  function calcBox() {
    const opts = [...D.programs].sort((a, b) => a.universityShort.localeCompare(b.universityShort, "de") || a.course.localeCompare(b.course, "de"))
      .map(x => `<option value="${x.id}"${x.id === st.prog ? " selected" : ""}>${esc(x.universityShort)} · ${esc(x.course)} (${esc(D.cities[x.city].name)})</option>`).join("");
    return `<div class="ko-box ko-calc"><h3 class="h3">Monatsbudget-Rechner</h3>
      <p class="muted small">Wähle einen Studiengang – Stadt und Semesterbeitrag werden übernommen. Alle Werte lassen sich anpassen und bleiben nur in deinem Browser.</p>
      <div class="ko-inputs">
        <label class="ed-field"><span>Studiengang</span><select id="koProg">${opts}</select></label>
        <div class="ed-field"><span>Wohnform</span><div class="seg" role="group" aria-label="Wohnform"><button type="button" data-ko-form="wg" aria-pressed="${st.form === "wg"}">WG-Zimmer</button><button type="button" data-ko-form="wohnheim" aria-pressed="${st.form === "wohnheim"}">Wohnheim</button></div></div>
        <label class="ed-field"><span>Material pro Monat: <b id="koMatOut">${eur(st.material)}</b> <em>(eigene Schätzung)</em></span><input type="range" id="koMat" min="0" max="300" step="10" value="${st.material}"></label>
        <label class="ed-field"><span>Kranken- und Pflegeversicherung: <b id="koKvOut">${eur(st.kv)}</b></span><input type="range" id="koKv" min="100" max="200" step="5" value="${st.kv}"></label>
      </div>
      <div class="ko-res" aria-live="polite">${resHtml()}</div>
      <p class="small muted">Quellen: <a href="${esc(K.bafoeg.src.url)}" target="_blank" rel="noopener noreferrer">${esc(K.bafoeg.src.label)}</a> · Mieten: MLP-Studentenwohnreport 2025 · Stand ${esc(K.stand)}. Eine Orientierung, keine Beratung.</p></div>`;
  }
  function cardsBox() {
    const tags = ["all", "Geld", "Aufenthalt", "Zugang", "Alltag"];
    const list = K.cards.filter(c => st.tag === "all" || c.tag === st.tag);
    return `<div class="toolbar"><div class="chips" role="group" aria-label="Thema">${tags.map(t => `<button type="button" class="chip${st.tag === t ? " on" : ""}" data-ko-tag="${t}" aria-pressed="${st.tag === t}">${t === "all" ? "Alle Themen" : t} <span class="chip-n">${t === "all" ? K.cards.length : K.cards.filter(c => c.tag === t).length}</span></button>`).join("")}</div></div>
      <div class="ko-cards stag">${list.map(c => { const s = STATUS[c.status]; return `<details class="ko-card" id="ko-${c.id}"><summary><span class="ko-tag">${esc(c.tag)}</span><b>${esc(c.title)}</b><span class="mu-badge ${s[1]}">${esc(s[0])}</span></summary>
        <div class="ko-body"><p>${esc(c.text)}</p><h4 class="an-h">Das ist zu tun</h4><ul class="todo-list">${c.todo.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        <p class="small muted">Quellen: ${c.src.map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)} ↗</a>`).join(" · ")} · Stand ${esc(K.stand)}</p></div></details>`; }).join("")}</div>`;
  }
  function render() {
    const root = $("#kostenRoot"); if (!root) return;
    const open = $$("#kostenRoot details[open]").map(d => d.id);
    root.innerHTML = `
      <div class="ko-status"><span class="eyebrow">Dein Status</span><b>Ukrainische Staatsbürgerin · Aufenthaltserlaubnis nach § 24 AufenthG · wohnhaft in Aschaffenburg</b>
        <p>Alles auf dieser Seite ist auf deine Situation zugeschnitten. Jede Aussage trägt ein Etikett: <span class="mu-badge ok">belegt</span> in offiziellen Quellen gefunden · <span class="mu-badge tight">geplant</span> Entwurf, nicht beschlossen · <span class="mu-badge open">bitte klären</span> hängt vom Einzelfall ab. Stand der Recherche: ${esc(K.stand)}. <b>Das ist keine Rechts- oder Sozialberatung</b> – verbindlich entscheiden Hochschule, Ausländerbehörde, BAföG-Amt und Krankenkasse.</p></div>
      <h3 class="gallery-title">Was für dich gilt</h3>${cardsBox()}
      <h3 class="gallery-title">Rechnen</h3><div class="ko-two">${calcBox()}${applicationBox()}</div>
      <h3 class="gallery-title">Von der Zusage bis zum ersten Semester</h3>
      <ol class="ko-steps stag">${K.steps.map((s, i) => `<li style="--i:${i}"><span class="ko-when">${esc(s.when)}</span><div><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div></li>`).join("")}</ol>
      <h3 class="gallery-title">Wer dir verbindlich weiterhilft</h3>
      <ul class="ko-help">${K.help.map(h => `<li><b>${h[2] ? `<a href="${esc(h[2])}" target="_blank" rel="noopener noreferrer">${esc(h[0])} ↗</a>` : esc(h[0])}</b><span>${esc(h[1])}</span></li>`).join("")}</ul>`;
    open.forEach(id => { const d = document.getElementById(id); if (d) d.open = true; });
  }
  function rerenderCalc() {
    const two = $(".ko-two"); if (!two) return;
    const active = document.activeElement && document.activeElement.id;
    two.innerHTML = calcBox() + applicationBox();
    if (active) { const n = document.getElementById(active); if (n) n.focus(); }
  }

  /* ------------------------------------------------------------ Ereignisse */
  document.addEventListener("click", e => {
    const t = e.target;
    const tag = t.closest("[data-ko-tag]"); if (tag) { st.tag = tag.dataset.koTag; persist(); render(); return; }
    const f = t.closest("[data-ko-form]"); if (f) { st.form = f.dataset.koForm; persist(); rerenderCalc(); return; }
    const op = t.closest("[data-ko-open]");
    if (op) {
      st.prog = op.dataset.koOpen; persist(); render();
      const dlg = $("#programDialog"); if (dlg && dlg.open) dlg.close();
      setTimeout(() => { const el = $("#kosten"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
    }
  });
  document.addEventListener("change", e => { if (e.target.id === "koProg") { st.prog = e.target.value; persist(); rerenderCalc(); } });
  document.addEventListener("input", e => {
    if (e.target.id === "koMat" || e.target.id === "koKv") {
      if (e.target.id === "koMat") { st.material = Number(e.target.value); $("#koMatOut").textContent = eur(st.material); }
      else { st.kv = Number(e.target.value); $("#koKvOut").textContent = eur(st.kv); }
      persist(); const r = $(".ko-res"); if (r) r.innerHTML = resHtml();
    }
  });

  window.KostenUI = { render, block, calc };
})();
