/* ==========================================================================
   STUDIUM 2027 · „Auf einen Blick“
   Alles, was Veronika für EINE Bewerbung braucht, als kurze Stichpunkte:
   Frist, wo bewerben, Deutsch, Zeugnis, Mappe, Prüfung, Unterlagen, Kosten,
   was noch fehlt. Genutzt im Studiengang-Fenster (index.html) und im Editor.
   Daten aus data.js; „Für dich“-Hinweise berücksichtigen ihren Stand:
   Deutsch sehr gut (Übersetzungsstudium), Bachelor in der Ukraine abgeschlossen.
   Abhaken der Unterlagen teilt sich den Speicher mit dem Guide (vh-studium-2027 → req).
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA;
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
  const dayNum = iso => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const daysUntil = iso => dayNum(iso) - dayNum(fmt.format(new Date()));
  const KEY = "vh-studium-2027";
  const BW = ["stuttgart", "reutlingen", "pforzheim"];

  let ext = null; // der Guide (app.js) reicht seinen eigenen Speicher herein, damit nichts überschrieben wird
  const readReq = id => { if (ext) return ext.get(id) || {}; try { const o = JSON.parse(localStorage.getItem(KEY) || "{}"); return (o.req && o.req[id]) || {}; } catch (e) { return {}; } };
  function writeReq(id, idx, on) {
    if (ext) { ext.set(id, idx, on); return; }
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || "{}");
      o.req = o.req || {}; o.req[id] = o.req[id] || {};
      if (on) o.req[id][idx] = true; else delete o.req[id][idx];
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) { /* ohne Speicher weiter */ }
  }

  const needsCert = s => /\b(B2|C1|C2|DSH|TestDaF)\b/i.test(s || "");
  const row = (label, body, cls) => body ? `<div class="bf-row${cls ? " " + cls : ""}"><dt>${esc(label)}</dt><dd>${body}</dd></div>` : "";
  const li = arr => `<ul>${arr.filter(Boolean).map(x => `<li>${x}</li>`).join("")}</ul>`;
  const you = t => `<span class="bf-you"><b>Für dich:</b> ${t}</span>`;

  function html(p, opts) {
    opts = opts || {};
    if (!p) return "";
    const pf = p.portfolio || {}, lr = p.languageRequirements || {}, ia = p.internationalApplication || {};
    const done = readReq(p.id);

    /* Frist */
    let frist = esc(p.deadlineText || "noch nicht veröffentlicht");
    if (p.applicationDeadline && p.deadlineExact) { const d = daysUntil(p.applicationDeadline); frist += d >= 0 ? ` <b class="bf-days">noch ${d} Tage</b>` : ` <b class="bf-days past">vorbei</b>`; }
    const fristBody = li([frist, p.applicationOpenText ? `Start der Bewerbung: ${esc(p.applicationOpenText)}` : "", p.startSemester ? `Studienbeginn: ${esc(p.startSemester)}` : ""]);

    /* Wo bewerben */
    const where = li([
      p.portal ? `<a href="${esc(p.portal.url)}" target="_blank" rel="noopener noreferrer">${esc(p.portal.label)} ↗</a>` : "",
      p.officialUrl ? `<a href="${esc(p.officialUrl)}" target="_blank" rel="noopener noreferrer">Offizielle Seite des Studiengangs ↗</a>` : ""
    ]);

    /* Deutsch */
    const langItems = [
      lr.application ? `Zur Bewerbung: ${esc(lr.application)}` : "",
      lr.start ? `Bis Studienbeginn: ${esc(lr.start)}` : ""
    ];
    if (needsCert(lr.application + " " + lr.start)) langItems.push(you("Dein Deutsch reicht. Frag aber nach, ob dein ukrainisches Übersetzerdiplom als Nachweis zählt. Wenn nicht: Zertifikat machen (TestDaF, DSH, telc C1 Hochschule oder Goethe C1)."));
    else langItems.push(you("Mit deinem Deutsch kein Problem."));

    /* Zeugnis / Zugang */
    const route = "Zeugnisbewertung über <b>uni-assist (VPD)</b>: dauert 4–6 Wochen, kostet 75 € (jede weitere Bewerbung 30 €). Früh beantragen!";
    const zugang = li([
      ia.route === "uni-assist" ? route : esc(ia.text || "Zeugnis direkt bei der Hochschule einreichen."),
      you("Mit deinem abgeschlossenen Bachelor aus der Ukraine hast du in der Regel direkten Hochschulzugang, ohne Studienkolleg. Diplom + Fächer- und Notenübersicht beglaubigt übersetzen lassen."),
      BW.includes(p.city) ? "Baden-Württemberg: Für ein Zweitstudium kann eine Gebühr von 650 € pro Semester anfallen. Frag die Hochschule, ob dein ausländischer Abschluss zählt." : ""
    ]);

    /* Mappe */
    const mappe = li([
      pf.count ? `<b>Umfang:</b> ${esc(pf.count)}` : "",
      pf.format ? `<b>Form:</b> ${esc(pf.format)}` : "",
      pf.maxSize && !/keine Angabe/i.test(pf.maxSize) ? `<b>Max. Größe:</b> ${esc(pf.maxSize)}` : "",
      pf.sketchbook && !/keine (Angabe|Vorgabe)/i.test(pf.sketchbook) ? `<b>Skizzenbuch:</b> ${esc(pf.sketchbook)}` : "",
      pf.video && !/keine Angabe/i.test(pf.video) ? `<b>Video:</b> ${esc(pf.video)}` : "",
      pf.ownTask ? `<b>Zusätzlich:</b> ${esc(pf.ownTask)}` : ""
    ]);

    /* Prüfung, Hausaufgabe, Praktikum */
    const pruef = li([
      p.aptitudeTest && p.aptitudeTest.text ? esc(p.aptitudeTest.text) : "",
      p.homework && p.homework.required ? `<b>Hausaufgabe:</b> ${esc(p.homework.text)}` : ""
    ]);
    const prakt = p.internship && p.internship.required === true ? `<b class="bf-must">Pflicht:</b> ${esc(p.internship.text)}` : "";

    /* Unterlagen zum Abhaken */
    const reqs = (p.requirements || []).map((r, i) => `<li><label><input type="checkbox" data-bf-req="${esc(p.id)}" data-idx="${i}"${done[i] ? " checked" : ""}> <span>${esc(r)}</span></label></li>`).join("");
    const nDone = (p.requirements || []).filter((r, i) => done[i]).length;

    /* Noch nachholen */
    const todo = (p.missingPortfolioElements || []).map(esc);
    if (prakt) todo.unshift(prakt);

    return `<div class="bf${opts.compact ? " compact" : ""}">
      ${opts.title === false ? "" : `<p class="bf-h">Auf einen Blick</p>`}
      <dl class="bf-list">
        ${row("Frist", fristBody, "bf-frist")}
        ${row("Wo bewerben", where)}
        ${row("Deutsch", li(langItems))}
        ${row("Zeugnis", zugang)}
        ${row("Mappe", mappe)}
        ${row("Prüfung", pruef)}
        ${row("Kosten", p.fees ? esc(p.fees) : "")}
        ${(p.warnings || []).length ? row("Achtung", li(p.warnings.map(esc)), "bf-warn") : ""}
        ${todo.length ? row("Noch machen", li(todo), "bf-todo") : ""}
      </dl>
      ${reqs && !opts.noReq ? `<div class="bf-req"><p class="bf-h2">Unterlagen <span class="bf-count" data-bf-count="${esc(p.id)}">${nDone} von ${(p.requirements || []).length} erledigt</span></p><ul class="bf-checks">${reqs}</ul></div>` : ""}
    </div>`;
  }

  document.addEventListener("change", e => {
    const c = e.target.closest && e.target.closest("[data-bf-req]"); if (!c) return;
    const id = c.dataset.bfReq;
    writeReq(id, c.dataset.idx, c.checked);
    const p = D && D.programs.find(x => x.id === id), done = readReq(id);
    const n = p ? (p.requirements || []).filter((r, i) => done[i]).length : 0;
    document.querySelectorAll(`[data-bf-count="${id}"]`).forEach(el => { el.textContent = `${n} von ${p ? (p.requirements || []).length : 0} erledigt`; });
    document.dispatchEvent(new CustomEvent("bf:req", { detail: { id } }));
  });

  window.Brief = { html, useStore(o) { ext = o; } };
})();
