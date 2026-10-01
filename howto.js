/* ==========================================================================
   STUDIUM 2027 · „So gehst du vor“
   Für jeden Studiengang eine kurze, einfache Anleitung: die Schritte, wie die
   Mappe aufgebaut ist, was an dieser Hochschule besonders zählt, und ein
   Steckbrief der Stadt. Alles aus den geprüften Daten (data.js, muster.js,
   kosten.js); nichts ist hier neu behauptet.
   Dazu: Grundwissen „Wie läuft eine Bewerbung an einer Kunsthochschule?“
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, M = window.STUDY_MUSTER, K = window.STUDY_KOSTEN;
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const dmy = iso => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}.${m}.${y}`; };
  const deg = x => x * Math.PI / 180;
  const km = (a, b) => { const q = Math.sin(deg(b.lat - a.lat) / 2) ** 2 + Math.cos(deg(a.lat)) * Math.cos(deg(b.lat)) * Math.sin(deg(b.lon - a.lon) / 2) ** 2; return Math.round(2 * 6371 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q))); };
  const euro = n => `${Math.round(n).toLocaleString("de-DE")} €`;
  const ul = a => `<ul>${a.filter(Boolean).map(x => `<li>${x}</li>`).join("")}</ul>`;
  const lang = () => { try { return JSON.parse(localStorage.getItem("vh-studium-2027") || "{}").lang === "ua" ? "ua" : "de"; } catch (e) { return "de"; } };
  const TX = {
    de: { h: "So gehst du vor", steps: "In 5 Schritten", mappe: "So ist die Mappe aufgebaut", have: "hast du schon", make: "musst du noch machen",
      pages: "Seiten", tips: "Das ist hier besonders wichtig", city: "Die Stadt", build: "Diese Mappe im Editor bauen", general: "Allgemein bei jeder Mappe" },
    ua: { h: "Як діяти", steps: "П’ять кроків", mappe: "Як побудоване портфоліо", have: "уже є", make: "ще треба зробити",
      pages: "стор.", tips: "Що тут особливо важливо", city: "Місто", build: "Зібрати це портфоліо в редакторі", general: "Загальне для кожного портфоліо" }
  };

  /* ---------- Schritte (aus den Daten des Studiengangs) ---------- */
  function steps(p) {
    const ia = p.internationalApplication || {}, pf = p.portfolio || {}, out = [];
    const dl = p.applicationDeadline ? `${dmy(p.applicationDeadline)}${p.deadlineTime ? ", " + p.deadlineTime + " Uhr" : ""}` : (p.deadlineShortText || p.deadlineText || "noch nicht veröffentlicht");
    out.push(["Termin im Kalender eintragen", `Frist: <b>${esc(dl)}</b>. Wenn die Frist knapp ist, zuerst die Zeugnisbewertung klären, denn sie dauert am längsten.`]);
    out.push([ia.route === "uni-assist" ? "Zeugnis bei uni-assist bewerten lassen (VPD)" : "Zeugnis vorbereiten", ia.route === "uni-assist"
      ? "Konto anlegen, Bachelor-Diplom und Notenübersicht hochladen. Das dauert 4–6 Wochen. Die Hochschule verlangt dieses Dokument."
      : esc(ia.text || "Diplom und Notenübersicht als beglaubigte Kopie mit beglaubigter Übersetzung bereithalten.")]);
    const cap = s => { s = String(s).trim().replace(/[.;]+$/, ""); return s.charAt(0).toUpperCase() + s.slice(1) + "."; };
    out.push(["Mappe zusammenstellen", `${pf.count ? esc(cap(pf.count)) + " " : ""}${pf.format ? esc(cap(pf.format)) + " " : ""}Unten steht Seite für Seite, was hinein soll.`]);
    out.push(["Im Portal bewerben und alles hochladen", `${p.portal ? esc(p.portal.label) : "Bewerbungsportal der Hochschule"}: Formular ausfüllen, Mappe, Lebenslauf${(p.requirements || []).some(r => /Motivation|Statement/i.test(r)) ? ", Motivationsschreiben" : ""} und Zeugnisse hochladen. Die Liste „Unterlagen“ oben zum Abhaken nutzen.`]);
    out.push(["Prüfung und Gespräch", esc((p.aptitudeTest && p.aptitudeTest.text) || "Nach der Mappenprüfung folgt in der Regel eine Einladung zur Eignungsprüfung.")]);
    return out;
  }

  /* ---------- Mappenaufbau (aus dem Musterplan) ---------- */
  function mappe(p) {
    const pl = M && M.plans && M.plans[p.id]; if (!pl) return "";
    const rows = pl.sections.filter(s => !s.extra).map(s => {
      const w = s.slots.filter(x => x.k === "w" || x.k === "m").length, n = s.slots.filter(x => x.k === "n").length;
      return `<li><b>${esc(s.title)}</b><span class="hw-n">${w ? `${w} ${w === 1 ? "Blatt" : "Blätter"} ${TX.de.have}` : ""}${w && n ? " · " : ""}${n ? `<em>${n} ${TX.de.make}</em>` : ""}</span>${s.hint ? `<small>${esc(s.hint)}</small>` : ""}</li>`;
    }).join("");
    const docs = (pl.docs || []).map(d => { const lib = M.DOC && M.DOC[d.key]; return lib ? `<li><b>${esc(lib[0])}</b>${d.note ? `<small>${esc(d.note)}</small>` : ""}</li>` : ""; }).join("");
    return `<p class="hw-strategy">${esc(pl.strategy)}</p><ol class="hw-sections">${rows}</ol>${docs ? `<p class="hw-sub">Dazu als eigene Datei</p><ul class="hw-docs">${docs}</ul>` : ""}`;
  }

  /* ---------- Tipps ---------- */
  function tips(p) {
    const pl = M && M.plans && M.plans[p.id], seen = new Set(), out = [];
    const add = t => { const k = String(t).slice(0, 40); if (!seen.has(k)) { seen.add(k); out.push(esc(t)); } };
    ((pl && pl.tips) || []).forEach(add);
    (p.warnings || []).forEach(add);
    return out;
  }
  const GENERAL = [
    "Fotografiere jedes Werk bei Tageslicht, gerade von vorn, mit gleichem Hintergrund.",
    "Schreibe zu jeder Arbeit Titel, Jahr, Material und Maße. Viele Hochschulen verlangen das.",
    "Zeige nur eigene Arbeiten, die dir wirklich gefallen. Lieber 15 starke als 25 gemischte.",
    "Beginne mit einem starken Blatt und ende mit einem starken Blatt.",
    "Mach vor dem Abschicken einen Probe-Export und schau dir das PDF ganz an."
  ];

  /* ---------- Stadt-Steckbrief ---------- */
  function city(p) {
    const c = D.cities[p.city]; if (!c) return "";
    const r = K && K.rent && K.rent[p.city], sem = K && K.semOf ? K.semOf(p) : null;
    const same = D.programs.filter(x => x.city === p.city && x.id !== p.id);
    const dist = D.home ? km(D.home, c) : null;
    return ul([
      `<b>${esc(c.name)}</b>${dist !== null ? `, ca. ${dist} km Luftlinie von Aschaffenburg` : ""}`,
      r ? `Ein WG-Zimmer kostet etwa <b>${euro(r[0])} bis ${euro(r[1])}</b> im Monat${r[3] ? "" : " (grobe Schätzung)"}.` : "",
      K && K.wohnheim ? `Im Wohnheim vom Studierendenwerk zahlt man im Schnitt ca. ${euro(K.wohnheim.amount)}, aber die Wartelisten sind lang. Früh anmelden.` : "",
      sem ? `Semesterbeitrag: ca. <b>${euro(sem.amount)}</b> pro Semester, meist mit Semesterticket.` : (K && K.semDefault ? `Semesterbeitrag: ca. ${euro(K.semDefault.lo)}–${euro(K.semDefault.hi)} pro Semester. Den genauen Betrag nennt das Studierendensekretariat.` : ""),
      same.length ? `Hier gibt es noch: ${same.map(x => `<button type="button" class="text-btn" data-open="${esc(x.id)}">${esc(x.course)}</button>`).join(", ")}` : ""
    ]);
  }

  function program(p) {
    if (!p) return "";
    const t = TX[lang()], tp = tips(p);
    return `<section class="dlg-sec hw">
      <h3>${esc(t.h)}</h3>
      <h4 class="hw-h">${esc(t.steps)}</h4>
      <ol class="hw-steps">${steps(p).map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("")}</ol>
      <h4 class="hw-h">${esc(t.mappe)}</h4>
      ${mappe(p) || `<p class="small muted">Für diesen Studiengang gibt es noch keinen Musterplan.</p>`}
      <p><a class="btn ghost sm" href="./editor.html#plan=${esc(p.id)}">${esc(t.build)}</a></p>
      ${tp.length ? `<h4 class="hw-h">${esc(t.tips)}</h4>${ul(tp)}` : ""}
      <h4 class="hw-h">${esc(t.general)}</h4>${ul(GENERAL)}
      <h4 class="hw-h">${esc(t.city)}</h4>${city(p)}
    </section>`;
  }

  /* Kurz-Steckbrief für das Städte-Fenster der Karte */
  function cityPanel(cid) {
    const c = D.cities[cid]; if (!c) return "";
    const ps = D.programs.filter(x => x.city === cid), r = K && K.rent && K.rent[cid];
    const sems = [...new Set(ps.map(x => K && K.semOf ? K.semOf(x) : null).filter(Boolean).map(s => Math.round(s.amount)))];
    return `<div class="hw-city"><p class="hw-sub">Steckbrief ${esc(c.name)}</p>${ul([
      r ? `WG-Zimmer ca. <b>${euro(r[0])}–${euro(r[1])}</b> im Monat${r[3] ? "" : " (Schätzung)"}` : "",
      sems.length ? `Semesterbeitrag ca. ${sems.map(s => euro(s)).join(" / ")} pro Semester` : "",
      `${ps.length} ${ps.length === 1 ? "Studiengang" : "Studiengänge"} aus deiner Liste: bei jedem steht unter „So gehst du vor“, was verlangt wird.`
    ])}</div>`;
  }

  window.Howto = { program, cityPanel, mappe };
})();
