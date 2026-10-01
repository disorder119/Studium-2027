/* ==========================================================================
   STUDIUM 2027 · Oberfläche für Analyse, Musterbewerbungen und Werkarchiv
   Liest window.STUDY_DATA (data.js) und window.STUDY_MUSTER (muster.js).
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA;
  const M = window.STUDY_MUSTER;
  if (!D || !M) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const TZ = "Europe/Berlin";
  const fmtYMD = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const todayISO = () => fmtYMD.format(new Date());
  const dayNum = iso => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const daysUntil = iso => dayNum(iso.slice(0, 10)) - dayNum(todayISO());
  const dmy = iso => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}.${m}.${y}`; };
  const P = id => D.programs.find(p => p.id === id);
  const imgOf = id => `./img/${id}.webp`;
  const stars = n => "★".repeat(n) + "☆".repeat(3 - n);
  const days = d => `${(Math.round(d * 2) / 2).toString().replace(".", ",")} ${Math.round(d * 2) / 2 === 1 ? "Tag" : "Tage"}`;
  const FIT_RANK = { "sehr hoch": 0, "hoch": 1, "mittel": 2 };
  const FIT_CLS = { "sehr hoch": "f-top", "hoch": "f-good", "mittel": "f-mid" };
  const plansList = () => D.programs.filter(p => M.plans[p.id]);

  /* ------------------------------------------------------------ Machbarkeit */
  /** Grobe Rechnung: 50 % der Tage bis zur Frist stehen für die Mappe zur Verfügung (Teilzeit). */
  function feasibility(p) {
    const s = M.plans[p.id].sum;
    if (p.applicationDeadline && p.deadlineExact) {
      const dl = daysUntil(p.applicationDeadline);
      if (dl < 0) return { cls: "closed", label: "Frist vorbei", detail: `Frist war am ${dmy(p.applicationDeadline)}.` };
      const avail = dl * 0.5;
      const ratio = avail > 0 ? s.days / avail : Infinity;
      const base = `Frist in ${dl} Tagen · Aufwand ca. ${days(s.days)} bei halber Zeit`;
      if (ratio <= 0.6) return { cls: "ok", label: "machbar", detail: base };
      if (ratio <= 1) return { cls: "tight", label: "knapp", detail: base };
      return { cls: "crit", label: "kritisch", detail: base };
    }
    return { cls: "open", label: "Frist offen", detail: `Frist noch nicht veröffentlicht · Aufwand ca. ${days(s.days)}` };
  }
  const deadlineLabel = p => (p.applicationDeadline && p.deadlineExact ? dmy(p.applicationDeadline) : (p.deadlineShortText || p.deadlineText || "–"));

  /* ------------------------------------------------------------ Raster-Zellen */
  function cell(slot, nr) {
    const num = nr ? `<span class="mu-n">${nr}</span>` : `<span class="mu-n plus">+</span>`;
    if (slot.k === "w") {
      const c = M.catalog[slot.id];
      return `<li class="mu-cell w"><div class="mu-img">${num}<img src="${imgOf(slot.id)}" alt="${esc(c.title)}" loading="lazy" width="180" height="200">${c.sold ? '<span class="mu-tag sold">Original verkauft</span>' : ""}</div>
        <b>${esc(c.title)}</b><small>${esc(c.year)}${c.size ? " · " + esc(c.size) : ""}</small>${slot.note ? `<em>${esc(slot.note)}</em>` : ""}</li>`;
    }
    if (slot.k === "m") {
      const mt = M.MONT[slot.key];
      return `<li class="mu-cell m"><div class="mu-img collage c${Math.min(4, mt[2].length)}">${num}${mt[2].slice(0, 4).map(i => `<img src="${imgOf(i)}" alt="" loading="lazy" width="90" height="100">`).join("")}<span class="mu-tag">Montage · ${days(mt[3])}</span></div>
        <b>${esc(mt[0])}</b><small>${esc(mt[1])}</small>${slot.note ? `<em>${esc(slot.note)}</em>` : ""}</li>`;
    }
    const nw = M.NEW[slot.key];
    return `<li class="mu-cell n${slot.crit ? " crit" : ""}"><div class="mu-img ph">${num}<span class="mu-ph-ico" aria-hidden="true">＋</span><span class="mu-tag">${slot.crit ? "Pflicht · " : "neu · "}${days(nw[2])}</span></div>
      <b>${esc(nw[0])}</b><small>${esc(slot.note || nw[1])}</small>${slot.note ? `<em>${esc(nw[1])}</em>` : ""}</li>`;
  }

  /* ------------------------------------------------------------ Abschnitt im Studiengangs-Dialog */
  function section(p) {
    const pl = M.plans[p.id];
    if (!pl) return "";
    const s = pl.sum, f = feasibility(p);
    let nr = 0;
    const rasters = pl.sections.map(sec => {
      const cells = sec.slots.map(sl => cell(sl, sec.extra ? 0 : ++nr)).join("");
      return `<div class="mu-sec"><h4>${esc(sec.title)} <span>${sec.slots.length}</span></h4>${sec.hint ? `<p class="small muted">${esc(sec.hint)}</p>` : ""}<ol class="mu-grid">${cells}</ol></div>`;
    }).join("");
    const docs = (pl.docs || []).length ? `<div class="mu-sec"><h4>Dokumente zur Bewerbung <span>${pl.docs.length}</span></h4><ul class="mu-docs">${pl.docs.map(dc => { const x = M.DOC[dc.key]; return `<li><b>${esc(x[0])}</b><span>${esc(dc.note || x[1])}</span><em>${days(x[2])}</em></li>`; }).join("")}</ul></div>` : "";
    return `<section class="dlg-sec muster" id="musterSec">
      <h3>Musterbewerbung <small>– Raster der Mappe</small></h3>
      <p class="reco-note">Unsere Zusammenstellung aus Veronikas vorhandenen Arbeiten, abgestimmt auf die veröffentlichten Angaben dieser Hochschule – <b>keine Zulassungsgarantie</b>.</p>
      <div class="mu-facts">
        <div><b>${esc(String(p.portfolio.count || "–")).slice(0, 90)}</b><small>Vorgabe der Hochschule</small></div>
        <div><b>${s.total} Blätter</b><small>${s.w} vorhanden · ${s.m} Montage · ${s.n} neu</small></div>
        <div><b>${days(s.days)}</b><small>Aufwand bis zur fertigen Mappe</small></div>
        <div><span class="mu-badge ${FIT_CLS[pl.fit]}">Passung ${esc(pl.fit)}</span><small>inhaltlich zu den Unterlagen</small></div>
      </div>
      <p class="mu-feas ${f.cls}"><span class="mu-badge ${f.cls}">${esc(f.label)}</span> ${esc(f.detail)}</p>
      <p class="mu-strategy"><b>Strategie:</b> ${esc(pl.strategy)}</p>
      ${rasters}${docs}
      <div class="mu-sec"><h4>Hinweise <span>${pl.tips.length}</span></h4><ul class="todo-list">${pl.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div>
      <div class="mu-legend"><span><i class="lg w"></i>vorhanden</span><span><i class="lg m"></i>Montage aus Vorhandenem</span><span><i class="lg n"></i>neu erstellen</span><span><i class="lg c"></i>Pflicht der Hochschule</span></div>
      <div class="ed-row"><a class="btn primary" href="./editor.html#plan=${p.id}">Im Editor öffnen (mit PDF-Export)</a><button type="button" class="btn ghost" data-mu-print>Muster drucken</button></div>
    </section>`;
  }

  /* ------------------------------------------------------------ Übersicht aller Musterbewerbungen */
  const ov = { cat: "all", sort: "frist" };
  function overviewRows() {
    let ps = plansList().filter(p => ov.cat === "all" || p.category === ov.cat);
    const key = {
      frist: p => (p.applicationDeadline && p.deadlineExact ? p.applicationDeadline : (p.deadlineSortHint || "9999-12-31")),
      passung: p => String(FIT_RANK[M.plans[p.id].fit]) + String(9999 - M.plans[p.id].sum.w).padStart(4, "0"),
      aufwand: p => String(Math.round(M.plans[p.id].sum.days * 10)).padStart(5, "0")
    }[ov.sort];
    return ps.sort((a, b) => key(a).localeCompare(key(b)));
  }
  function renderOverview() {
    const root = $("#musterRoot"); if (!root) return;
    const cats = [["all", "Alle"], ...Object.entries(D.categories).map(([k, v]) => [k, v.label])];
    const ps = overviewRows();
    const rows = ps.map(p => {
      const pl = M.plans[p.id], s = pl.sum, f = feasibility(p);
      const ready = Math.round(100 * (s.w + s.m) / s.total);
      return `<li class="mu-row"><button type="button" class="mu-row-main" data-open="${p.id}" data-muster="1">
        <b>${esc(p.course)}</b><span>${esc(p.universityShort)} · ${esc(D.cities[p.city].name)}</span></button>
        <span class="mu-row-dl"><small>Frist</small>${esc(deadlineLabel(p))}</span>
        <span class="mu-row-bar" title="${s.w} vorhanden, ${s.m} Montage, ${s.n} neu"><small>${s.w + s.m} von ${s.total} Blättern bereit</small><span class="bar-t" aria-hidden="true"><b style="width:${ready}%"></b></span></span>
        <span class="mu-row-eff"><small>Aufwand</small>${days(s.days)}</span>
        <span class="mu-row-fit"><span class="mu-badge ${FIT_CLS[pl.fit]}">${esc(pl.fit)}</span><span class="mu-badge ${f.cls}">${esc(f.label)}</span></span></li>`;
    }).join("");
    root.innerHTML = `
      <div class="note mu-disclaimer"><b>So ist das gemeint:</b> Zu jedem der ${plansList().length} Studiengänge gibt es eine Musterbewerbung als Raster – die Auswahl und Reihenfolge der vorhandenen Arbeiten, die zu Anzahl, Format und Pflichtinhalten der Hochschule passen. <b>Garantieren kann das niemand:</b> Aufnahmeprüfungen sind Auswahlverfahren mit mehr Bewerbungen als Plätzen. „Passung“ heißt: wie gut Veronikas Unterlagen zu dem passen, was die Hochschule veröffentlicht – keine Wahrscheinlichkeit.</div>
      <div class="toolbar"><div class="chips" role="group" aria-label="Kategorie">${cats.map(([k, l]) => `<button type="button" class="chip${ov.cat === k ? " on" : ""}" data-mu-cat="${k}" aria-pressed="${ov.cat === k}">${esc(l)}</button>`).join("")}</div>
        <div class="toolbar-row"><span class="muted small">${ps.length} Musterbewerbungen · Machbarkeit grob gerechnet: halbe Zeit bis zur Frist</span>
        <label class="sort"><span>Sortieren</span><select id="muSort"><option value="frist"${ov.sort === "frist" ? " selected" : ""}>Frist</option><option value="passung"${ov.sort === "passung" ? " selected" : ""}>Passung</option><option value="aufwand"${ov.sort === "aufwand" ? " selected" : ""}>Aufwand</option></select></label></div></div>
      <ol class="mu-list">${rows}</ol>
      ${priorities()}`;
  }

  /** Was bringt am meisten? – Häufigkeit der fehlenden Bausteine über alle Musterbewerbungen */
  function priorities() {
    const total = plansList().length;
    const nCount = {}, mCount = {}, crit = {};
    plansList().forEach(p => {
      const pl = M.plans[p.id];
      new Set(pl.sum.newKeys).forEach(k => { nCount[k] = (nCount[k] || 0) + 1; });
      pl.sections.forEach(sec => sec.slots.forEach(sl => { if (sl.k === "n" && sl.crit) crit[sl.key] = (crit[sl.key] || new Set()).add(p.id); }));
      new Set(pl.sections.flatMap(sec => sec.slots.filter(sl => sl.k === "m").map(sl => sl.key))).forEach(k => { mCount[k] = (mCount[k] || 0) + 1; });
    });
    const rowsM = Object.entries(mCount).sort((a, b) => b[1] - a[1]).map(([k, c]) => `<li><span class="pr-t">Montage</span><b>${esc(M.MONT[k][0])}</b><span>in ${c} von ${total}</span><em>${days(M.MONT[k][3])}</em><small>${esc(M.MONT[k][1])}</small></li>`).join("");
    const rowsN = Object.entries(nCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => `<li><span class="pr-t new">Neu</span><b>${esc(M.NEW[k][0])}</b><span>in ${c} von ${total}${crit[k] ? ` · Pflicht in ${crit[k].size}` : ""}</span><em>${days(M.NEW[k][2])}</em><small>${esc(M.NEW[k][1])}</small></li>`).join("");
    return `<div class="mu-prio"><h3>Was bringt am meisten?</h3><p class="muted small">Die Bausteine, die in den meisten Musterbewerbungen fehlen oder helfen. Zuerst die Montagen (Stunden), dann das Neue (Tage).</p><ul>${rowsM}${rowsN}</ul></div>`;
  }

  /* ------------------------------------------------------------ Analyse */
  const arch = { filter: "all" };
  function renderAnalysis() {
    const root = $("#analysisRoot"); if (!root) return;
    const A = M.analysis, C = M.catalog;
    const bars = A.scores.map(sc => `<div class="bar"><span class="bar-l">${esc(sc.label)}</span><span class="bar-v">${sc.v} / 5</span><span class="bar-t" aria-hidden="true"><b style="width:${sc.v * 20}%"></b></span><small>${esc(sc.note)}</small></div>`).join("");
    const card = ([t, x]) => `<li><b>${esc(t)}</b><span>${esc(x)}</span></li>`;
    const series = Object.entries(M.series).map(([key, sr]) => {
      const items = Object.values(C).filter(c => c.series === key);
      return `<article class="an-series"><header><h4>${esc(sr.label)}</h4><span class="eyebrow">${esc(sr.years)} · ${items.length} Blätter</span></header>
        <p>${esc(sr.text)}</p><p class="an-risk"><b>Achtung:</b> ${esc(sr.risk)}</p>
        <ul class="an-thumbs">${items.sort((a, b) => b.stars - a.stars).slice(0, 8).map(c => `<li><button type="button" data-mu-work="${c.id}" aria-label="${esc(c.title)}"><img src="${imgOf(c.id)}" alt="" loading="lazy" width="80" height="90"><span>${stars(c.stars)}</span></button></li>`).join("")}</ul></article>`;
    }).join("");
    const keys = Object.values(C).filter(c => c.stars === 3);
    const strip = (ids, cls) => `<ul class="an-strip ${cls || ""}">${ids.map(id => `<li><button type="button" data-mu-work="${id}"><img src="${imgOf(id)}" alt="${esc(C[id].title)}" loading="lazy" width="120" height="130"><span>${esc(C[id].title)}</span></button></li>`).join("")}</ul>`;
    root.innerHTML = `
      <p class="an-verdict">${esc(A.verdict)}</p>
      <div class="pf-grid">
        <article class="pf-card"><h3>Bewertung nach Bereichen</h3><div class="bars">${bars}</div>
          <p class="small muted mt">Skala 1–5 = fachliche Einschätzung des heutigen Stands, keine Note und keine Zulassungschance.</p></article>
        <div class="pf-cols an-cols">
          <article class="pf-card strong"><span class="pf-tag">Stärken</span><ul class="an-list">${A.strengths.map(card).join("")}</ul></article>
          <article class="pf-card gap"><span class="pf-tag">Lücken und Risiken</span><ul class="an-list">${A.risks.map(card).join("")}</ul></article>
          <article class="pf-card art"><span class="pf-tag">Wie eine Jury liest</span><p class="an-jury">${esc(A.jury)}</p>
            <h4 class="an-h">Je nach Hochschultyp</h4><ul class="an-list">${A.types.map(card).join("")}</ul></article>
        </div>
      </div>
      <h3 class="gallery-title">Die Serien im Einzelnen</h3>
      <div class="an-series-grid">${series}</div>
      <h3 class="gallery-title">Schlüsselblätter <small class="muted">(★★★ – in fast jede Mappe)</small></h3>${strip(keys.map(c => c.id))}
      <div class="an-two">
        <div><h3 class="gallery-title">Neu fotografieren</h3><p class="small muted">Zu dunkel oder zu flau – Tageslicht, manuell belichten, Details müssen lesbar sein.</p>${strip(A.reshoot, "small")}</div>
        <div><h3 class="gallery-title">Nur als Beleg, nie als Auftakt</h3><p class="small muted">Gute Arbeiten, die aber nicht das Niveau der Gruppe tragen.</p>${strip(A.weak, "small")}</div>
      </div>
      <h3 class="gallery-title">Werkarchiv <small class="muted">(${Object.keys(C).length} Blätter mit Einschätzung)</small></h3>
      <div class="chips" id="archChips" role="group" aria-label="Werkarchiv filtern"></div>
      <ul class="arch-grid" id="archGrid"></ul>`;
    renderArchive();
  }
  const ARCH_FILTERS = [
    ["all", "Alle", () => true],
    ["acryl", "Acryl", c => /^acryl/.test(c.series)],
    ["oel", "Öl", c => c.series === "oel"],
    ["textil", "Textil", c => c.kind === "textil" && c.series !== "tx-detail" && c.series !== "tx-prozess"],
    ["detail", "Details und Prozess", c => c.series === "tx-detail" || c.series === "tx-prozess"],
    ["key", "★★★", c => c.stars === 3]
  ];
  function renderArchive() {
    const chips = $("#archChips"), grid = $("#archGrid"); if (!chips || !grid) return;
    chips.innerHTML = ARCH_FILTERS.map(([k, l, fn]) => `<button type="button" class="chip${arch.filter === k ? " on" : ""}" data-mu-arch="${k}" aria-pressed="${arch.filter === k}">${esc(l)} <span class="chip-n">${Object.values(M.catalog).filter(fn).length}</span></button>`).join("");
    const fn = ARCH_FILTERS.find(f => f[0] === arch.filter)[2];
    grid.innerHTML = Object.values(M.catalog).filter(fn).map(c => `<li><button type="button" data-mu-work="${c.id}"><img src="${imgOf(c.id)}" alt="${esc(c.title)}" loading="lazy" width="150" height="170"><b>${esc(c.title)}</b><small>${esc(c.year)} · ${stars(c.stars)}</small></button></li>`).join("");
  }

  /* ------------------------------------------------------------ Werk-Dialog */
  function usage(id) {
    return plansList().filter(p => M.plans[p.id].sections.some(sec => sec.slots.some(sl => (sl.k === "w" && sl.id === id) || (sl.k === "m" && M.MONT[sl.key][2].includes(id))))).map(p => `${p.universityShort}: ${p.course}`);
  }
  function openWork(id) {
    const c = M.catalog[id], dlg = $("#workDialog"); if (!c || !dlg) return;
    const u = usage(id);
    $("#workBody").innerHTML = `<div class="wk"><img src="${imgOf(id)}" alt="${esc(c.title)}" width="480" height="520"><div>
      <p class="eyebrow">${esc(M.series[c.series].label)}</p><h2 id="workTitle" tabindex="-1">${esc(c.title)}</h2>
      <p class="muted">${esc(c.year)} · ${esc(c.tech)}${c.size ? " · " + esc(c.size) : ""}</p>
      <p class="an-stars" aria-label="${c.stars} von 3 Sternen">${stars(c.stars)} <small>${["", "Ergänzung / Detail", "stark", "Schlüsselblatt"][c.stars]}</small></p>
      ${c.sold ? '<p class="note">Laut Website verkauft: nur als Foto oder Druck verwenden, nicht als Original.</p>' : ""}
      <h4 class="an-h">Einschätzung</h4><p>${esc(c.note)}</p>
      <h4 class="an-h">In Musterbewerbungen</h4><p class="small muted">${u.length ? `${u.length} von ${plansList().length}: ${esc(u.slice(0, 6).join(" · "))}${u.length > 6 ? " …" : ""}` : "In keiner Musterbewerbung vorgesehen."}</p></div></div>`;
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    $("#workTitle").focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------ Ereignisse */
  document.addEventListener("click", e => {
    const t = e.target;
    const wk = t.closest("[data-mu-work]"); if (wk) { openWork(wk.dataset.muWork); return; }
    const ar = t.closest("[data-mu-arch]"); if (ar) { arch.filter = ar.dataset.muArch; renderArchive(); return; }
    const ct = t.closest("[data-mu-cat]"); if (ct) { ov.cat = ct.dataset.muCat; renderOverview(); return; }
    if (t.closest("[data-mu-print]")) { window.print(); return; }
    if (t.closest("#workDialog [data-close-work]")) { $("#workDialog").close(); return; }
    const dlg = $("#workDialog"); if (dlg && t === dlg) dlg.close();
  });
  document.addEventListener("change", e => { if (e.target.id === "muSort") { ov.sort = e.target.value; renderOverview(); } });

  window.MusterUI = { section, renderAll() { renderAnalysis(); renderOverview(); }, feasibility };
})();
