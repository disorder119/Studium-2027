/* ==========================================================================
   STUDIUM 2027 · Oberfläche für „Stimmen“ (Erfahrungen und Tipps)
   ========================================================================== */
(() => {
  "use strict";
  const T = window.STUDY_STIMMEN;
  if (!T) return;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const st = { group: "all" };
  const groups = ["all", ...new Set(T.tips.map(t => t.group))];

  function card(t) {
    const k = T.kinds[t.kind], s = T.sources[t.src];
    return `<article class="sv-card"><header><span class="mu-badge ${k.cls}" title="${esc(k.note)}">${esc(k.label)}</span><span class="sv-grp">${esc(t.group)}</span><span class="sv-year">${esc(t.year)}</span></header>
      ${t.quote ? `<blockquote lang="de">„${esc(t.quote)}“</blockquote>` : ""}
      <p>${esc(t.text)}</p>
      <p class="sv-you"><b>Für dich:</b> ${esc(t.fuerDich)}</p>
      <p class="small muted"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a></p></article>`;
  }
  function render() {
    const root = $("#stimmenRoot"); if (!root) return;
    const list = T.tips.filter(t => st.group === "all" || t.group === st.group);
    root.innerHTML = `
      <div class="note sv-note"><b>Ehrlich gesagt:</b> Berichte von Studierenden zu genau diesen Hochschulen sind selten und oft alt. Deshalb steht bei jeder Stimme, <em>woher</em> sie kommt: <span class="mu-badge ok">Hochschule</span> offiziell, teils wörtlich · <span class="mu-badge f-good">Studierende</span> Bewertungen oder Bericht, sinngemäß · <span class="mu-badge tight">Forum</span> Einzelstimme, oft älter · <span class="mu-badge open">Mappenkurs</span> kommerzieller Anbieter. Nichts ist erfunden; zu jedem Eintrag führt der Link zur Quelle. Stand der Recherche: ${esc(T.stand)}.</div>
      <div class="toolbar"><div class="chips" role="group" aria-label="Hochschule">${groups.map(g => `<button type="button" class="chip${st.group === g ? " on" : ""}" data-sv-group="${esc(g)}" aria-pressed="${st.group === g}">${g === "all" ? "Alle" : esc(g)}</button>`).join("")}</div></div>
      <div class="sv-grid stag">${list.map(card).join("")}</div>
      <div class="sv-two">
        <div class="ko-box"><h3 class="h3">Diese Fragen kannst du Studierenden stellen</h3><ol class="sv-ask">${T.ask.map(q => `<li>${esc(q)}</li>`).join("")}</ol></div>
        <div class="ko-box"><h3 class="h3">Wo du Studierende triffst</h3><ul class="ko-help">${T.where.map(w => `<li><b>${esc(w[0])}</b><span>${esc(w[1])}</span></li>`).join("")}</ul></div>
      </div>`;
  }
  function block(p) {
    const own = T.tips.filter(t => !t.programs.includes("*") && T.match(t, p));
    const items = own.length ? own : T.tips.filter(t => t.programs.includes("*"));
    return `<section class="dlg-sec stimmen-sec"><h3>Erfahrungen und Tipps <small>– aus öffentlichen Quellen</small></h3>
      ${own.length ? "" : '<p class="small muted">Zu diesem Studiengang wurden keine eigenen Erfahrungsberichte gefunden. Allgemeiner Hinweis:</p>'}
      <div class="sv-grid sv-dlg">${items.map(card).join("")}</div>
      <p class="small muted">Alle Hinweise im Überblick: Abschnitt „Stimmen“. Stand ${esc(T.stand)}.</p></section>`;
  }
  document.addEventListener("click", e => { const g = e.target.closest("[data-sv-group]"); if (g) { st.group = g.dataset.svGroup; render(); } });
  window.StimmenUI = { render, block };
})();
