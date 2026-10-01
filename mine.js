/* ==========================================================================
   STUDIUM 2027 · Meine Listen und Notizen
   Eigene Checklisten (beliebig viele), freie Notizen und Ideen sowie eine kleine
   Aufgabenliste je Bewerbung. Alles bleibt im Browser (Schlüssel „vh-mine“)
   und ist in der Komplett-Sicherung enthalten.
   ========================================================================== */
(() => {
  "use strict";
  const M = window.STUDY_MUSTER;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const KEY = "vh-mine";
  const uid = () => Math.random().toString(36).slice(2, 9);
  const lang = () => { try { return JSON.parse(localStorage.getItem("vh-studium-2027") || "{}").lang === "ua" ? "ua" : "de"; } catch (e) { return "de"; } };

  const blank = () => ({ v: 1, notes: "", lists: [{ id: "ideas", title: "Meine Ideen", items: [] }], prog: {} });
  let data = blank();
  try { const raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw && typeof raw === "object") data = Object.assign(blank(), raw); } catch (e) { /* leer starten */ }
  if (!Array.isArray(data.lists) || !data.lists.length) data.lists = blank().lists;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ohne Speicher weiter */ } };

  const TX = {
    de: { notes: "Meine Notizen", notesPh: "Alles, was du dir merken willst: Ideen, Fragen, Telefonnummern, Termine …", lists: "Meine Listen",
      newList: "Neue Liste", newListPh: "Name der Liste, z. B. „Was ich kaufen muss“", create: "Liste anlegen", add: "Hinzufügen", addPh: "Neuer Punkt …",
      del: "Liste löschen", sure: "Wirklich löschen?", yes: "Ja, löschen", no: "Behalten", start: "Vorschlag übernehmen", startH: "Vorschläge zum Übernehmen", empty: "Noch nichts drin.",
      saved: "Wird automatisch gespeichert, nur auf diesem Gerät.", progH: "Meine Aufgaben für diese Bewerbung", done: "erledigt" },
    ua: { notes: "Мої нотатки", notesPh: "Усе, що хочеш запам’ятати: ідеї, питання, телефони, дати …", lists: "Мої списки",
      newList: "Новий список", newListPh: "Назва списку, напр. «Що купити»", create: "Створити список", add: "Додати", addPh: "Новий пункт …",
      del: "Видалити список", sure: "Справді видалити?", yes: "Так, видалити", no: "Залишити", start: "Взяти пропозицію", startH: "Пропозиції", empty: "Поки що порожньо.",
      saved: "Зберігається автоматично, лише на цьому пристрої.", progH: "Мої завдання для цієї заявки", done: "виконано" }
  };

  /* Vorschläge: Inhalte aus der Portfolio-Analyse und den Bewerbungsdaten */
  const NEWL = k => (M && M.NEW && M.NEW[k] ? M.NEW[k][0] : k);
  const SUGGEST = [
    { id: "s-mappe", title: "Mappe nachlegen", items: [NEWL("figur"), NEWL("natur"), "Stofffalten zeichnen (Papier)", "Skizzenbuch: 10 Seiten fotografieren", "Line-up-Foto: 5 Looks nebeneinander", "Statement: eine Seite, drei Fragen", "Werkliste mit Titel, Jahr, Maßen"] },
    { id: "s-papiere", title: "Papiere klären", items: ["Bachelor-Diplom und Notenübersicht (Додаток) bereitlegen", "Vereidigte Übersetzung beauftragen", "Beglaubigte Kopien machen", "uni-assist-Konto anlegen und VPD beantragen", "Deutsch-Zertifikat C1: bei den Wunschhochschulen nachfragen", "BAföG-Amt schriftlich fragen (Zweitstudium)"] },
    { id: "s-lab", title: "Mein Auftritt", items: ["Lab-Eye-Veröffentlichung mit Datum und Link in den Lebenslauf", "Instagram-Link in die Mappe", "Lebenslauf als PDF (unter 5 MB)", "Foto von mir für Bewerbungen"] }
  ];

  function listHtml(l, small) {
    const t = TX[lang()], n = l.items.filter(i => i.d).length;
    return `<article class="mi-list${small ? " small" : ""}" data-list="${esc(l.id)}">
      <header><h4>${esc(l.title)}</h4>${l.items.length ? `<span class="mi-count">${n} / ${l.items.length} ${esc(t.done)}</span>` : ""}</header>
      <ul>${l.items.length ? l.items.map((i, k) => `<li class="${i.d ? "done" : ""}"><label><input type="checkbox" data-mi-chk="${esc(l.id)}" data-i="${k}"${i.d ? " checked" : ""}><span>${esc(i.t)}</span></label><button type="button" class="mi-x" data-mi-rm="${esc(l.id)}" data-i="${k}" aria-label="Punkt löschen">×</button></li>`).join("") : `<li class="muted small">${esc(t.empty)}</li>`}</ul>
      <form class="mi-add" data-mi-add="${esc(l.id)}"><input type="text" placeholder="${esc(t.addPh)}" aria-label="${esc(t.addPh)}" maxlength="200"><button class="btn ghost sm" type="submit">${esc(t.add)}</button></form>
      ${small ? "" : `<button type="button" class="text-btn mi-del" data-mi-dellist="${esc(l.id)}">${esc(t.del)}</button>`}
    </article>`;
  }

  function render() {
    const root = $("#mineRoot"); if (!root) return;
    const t = TX[lang()];
    const free = SUGGEST.filter(s => !data.lists.some(l => l.id === s.id));
    root.innerHTML = `
      <div class="mi-grid">
        <article class="mi-notes"><h3 class="h4">${esc(t.notes)}</h3>
          <textarea id="miNotes" rows="8" placeholder="${esc(t.notesPh)}" aria-label="${esc(t.notes)}">${esc(data.notes)}</textarea>
          <p class="small muted">${esc(t.saved)}</p></article>
        <div class="mi-lists"><h3 class="h4">${esc(t.lists)}</h3>
          ${data.lists.map(l => listHtml(l)).join("")}
          <form class="mi-new" id="miNew"><input type="text" id="miNewName" placeholder="${esc(t.newListPh)}" aria-label="${esc(t.newList)}" maxlength="80"><button class="btn primary sm" type="submit">${esc(t.create)}</button></form>
          ${free.length ? `<div class="mi-sug"><p class="hw-sub">${esc(t.startH)}</p><div class="mi-sug-row">${free.map(s => `<button type="button" class="chip" data-mi-sug="${esc(s.id)}">+ ${esc(s.title)}</button>`).join("")}</div></div>` : ""}
        </div>
      </div>`;
  }

  /* Aufgaben je Bewerbung (im Studiengang-Fenster) */
  function progBlock(id) {
    const t = TX[lang()], l = { id: "prog:" + id, title: t.progH, items: (data.prog[id] || []) };
    return `<section class="dlg-sec mine-prog">${listHtml(l, true)}</section>`;
  }
  const find = id => id.startsWith("prog:") ? { get items() { return (data.prog[id.slice(5)] = data.prog[id.slice(5)] || []); }, set items(v) { data.prog[id.slice(5)] = v; } } : data.lists.find(l => l.id === id);
  const rerender = id => {
    if (id && id.startsWith("prog:")) { const el = document.querySelector(`.mine-prog [data-list="${CSS.escape(id)}"]`); if (el) { const l = { id, title: TX[lang()].progH, items: data.prog[id.slice(5)] || [] }; el.outerHTML = listHtml(l, true); } }
    else render();
  };

  document.addEventListener("input", e => { if (e.target.id === "miNotes") { data.notes = e.target.value.slice(0, 20000); save(); } });
  document.addEventListener("change", e => {
    const c = e.target.closest && e.target.closest("[data-mi-chk]"); if (!c) return;
    const l = find(c.dataset.miChk); if (!l || !l.items[c.dataset.i]) return;
    l.items[c.dataset.i].d = c.checked; save(); rerender(c.dataset.miChk);
  });
  document.addEventListener("click", e => {
    const rm = e.target.closest("[data-mi-rm]");
    if (rm) { const l = find(rm.dataset.miRm); if (l) { l.items.splice(Number(rm.dataset.i), 1); save(); rerender(rm.dataset.miRm); } return; }
    const sug = e.target.closest("[data-mi-sug]");
    if (sug) { const s = SUGGEST.find(x => x.id === sug.dataset.miSug); if (s) { data.lists.push({ id: s.id, title: s.title, items: s.items.map(t => ({ t, d: false })) }); save(); render(); } return; }
    const dl = e.target.closest("[data-mi-dellist]");
    if (dl) {
      const l = data.lists.find(x => x.id === dl.dataset.miDellist), t = TX[lang()]; if (!l) return;
      const run = () => { data.lists = data.lists.filter(x => x.id !== l.id); if (!data.lists.length) data.lists = blank().lists; save(); render(); };
      if (!l.items.length) run();
      else if (window.VH) window.VH.confirm(`${t.sure} „${l.title}“`, t.yes, t.no).then(ok => { if (ok) run(); });
      else run();
    }
  });
  document.addEventListener("submit", e => {
    const f = e.target;
    if (f.id === "miNew") { e.preventDefault(); const v = $("#miNewName").value.trim(); if (!v) return; data.lists.push({ id: "l" + uid(), title: v.slice(0, 80), items: [] }); save(); render(); return; }
    if (f.matches && f.matches("[data-mi-add]")) {
      e.preventDefault(); const inp = f.querySelector("input"), v = inp.value.trim(); if (!v) return;
      const id = f.dataset.miAdd, l = find(id); if (!l) return; l.items.push({ t: v.slice(0, 200), d: false }); save(); rerender(id);
      const again = document.querySelector(`[data-mi-add="${CSS.escape(id)}"] input`); if (again) again.focus();
    }
  });

  window.addEventListener("storage", e => { if (e.key === KEY) { try { data = Object.assign(blank(), JSON.parse(e.newValue || "null") || {}); render(); } catch (err) { /* ignorieren */ } } });

  const start = () => render();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Mine = { render, progBlock, get: () => data, replace(o) { if (o && typeof o === "object") { data = Object.assign(blank(), o); save(); render(); } } };
})();
