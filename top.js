/* ==========================================================================
   STUDIUM 2027 · „Hier würde ich anfangen“
   Fünf Bewerbungen, die laut Portfolio-Analyse am besten passen und zeitlich
   machbar sind. Fristen, Sprache und Entfernung kommen aus data.js, damit
   nichts doppelt gepflegt wird. Die Begründung ist eine Einschätzung.
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, M = window.STUDY_MUSTER;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
  const dayNum = iso => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const daysUntil = iso => dayNum(iso) - dayNum(fmt.format(new Date()));
  const dmy = iso => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}.${m}.${y}`; };
  const deg = x => x * Math.PI / 180;
  const km = (a, b) => { const q = Math.sin(deg(b.lat - a.lat) / 2) ** 2 + Math.cos(deg(a.lat)) * Math.cos(deg(b.lat)) * Math.sin(deg(b.lon - a.lon) / 2) ** 2; return Math.round(2 * 6371 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q))); };

  const PICKS = [
    { id: "udk-kostuembild", tag: "Frist zuerst",
      why: "Figur und Kostüm sind deine größte Stärke, und die UdK will höchstens 20 Seiten. Die meisten davon hast du schon. Start wäre im Sommersemester 2027.",
      warn: "Knapp: Ohne fertige Zeugnisbewertung (VPD) von uni-assist wird es eng, weil die mehrere Wochen dauert. Dann lieber jetzt beantragen und die UdK im nächsten Durchgang einplanen." },
    { id: "dresden-kostuemgestaltung", tag: "passt sehr genau",
      why: "Kostümbau mit historischer Schnitttechnik, Färben und viel Handarbeit. Das ist fast eine Beschreibung deiner handgenähten Stücke." },
    { id: "weissensee-textil", tag: "Textil als Kunst",
      why: "Weißensee denkt Textil als Material und Oberfläche. Rost, Wachs und Malerei auf Leinen sind hier genau richtig. Die Frist endet mittags um 12 Uhr." },
    { id: "burg-textile-kuenste", tag: "freie Kunst mit Stoff",
      why: "Freie Kunst mit textilen Mitteln: Malerei und Textil dürfen ein Werk sein. Wichtig: Die BURG nimmt nur Arbeiten aus den letzten zwei Jahren, also 2025 und 2026." },
    { id: "hfg-offenbach-kunst", tag: "nah an zu Hause",
      why: "Der Fachbereich Kunst hat ein eigenes Lehrgebiet Mode, und du kannst zwischen Malerei, Bühne und Mode wechseln. Du könntest in Aschaffenburg wohnen bleiben." }
  ];

  function deadline(p) {
    if (p.applicationDeadline) {
      const d = daysUntil(p.applicationDeadline);
      if (d < 0) return { txt: `${dmy(p.applicationDeadline)} · vorbei`, cls: "past" };
      return { txt: `${dmy(p.applicationDeadline)}${p.deadlineTime ? ", " + p.deadlineTime + " Uhr" : ""} · noch ${d} Tage`, cls: d <= 45 ? "soon" : "ok" };
    }
    return { txt: p.deadlineShortText || p.deadlineText || "noch nicht veröffentlicht", cls: "vague" };
  }

  function render() {
    const root = $("#topRoot"); if (!root || !D) return;
    const items = PICKS.map(x => ({ ...x, p: D.programs.find(p => p.id === x.id) })).filter(x => x.p);
    root.innerHTML = `<ol class="top-list">${items.map((x, i) => {
      const p = x.p, dl = deadline(p), lang = p.languageRequirements && p.languageRequirements.application && p.languageRequirements.application.replace(/\s*\(Bewerbung mit [^)]*\)/, "");
      const dist = D.home && D.cities[p.city] ? km(D.home, D.cities[p.city]) : null;
      const plan = M && M.plans[p.id];
      const ready = plan ? `${plan.sum.w + plan.sum.m} von ${plan.sum.total} Blättern hast du schon` : "";
      return `<li class="top-card">
        <span class="top-rank" aria-hidden="true">${i + 1}</span>
        <div class="top-main">
          <p class="top-tag">${esc(x.tag)}</p>
          <h3 class="top-title">${esc(p.course)}</h3>
          <p class="top-uni">${esc(p.university)} · ${esc(D.cities[p.city] ? D.cities[p.city].name : p.city)}${dist !== null ? ` · ca. ${dist} km` : ""}</p>
          <p class="top-why">${esc(x.why)}</p>
          ${x.warn ? `<p class="top-warn">${esc(x.warn)}</p>` : ""}
          <dl class="top-facts">
            <div><dt>Frist</dt><dd class="dl-${dl.cls}">${esc(dl.txt)}</dd></div>
            ${lang ? `<div><dt>Deutsch zur Bewerbung</dt><dd>${esc(lang)}</dd></div>` : ""}
            ${ready ? `<div><dt>Mappe</dt><dd>${esc(ready)}</dd></div>` : ""}
          </dl>
        </div>
        <div class="top-act">
          <button type="button" class="btn primary sm" data-open="${esc(p.id)}">Alles dazu lesen</button>
          <a class="btn ghost sm" href="./editor.html#plan=${esc(p.id)}">Mappe bauen</a>
        </div>
      </li>`;
    }).join("")}</ol>`;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  window.TopPicks = { render };
})();
