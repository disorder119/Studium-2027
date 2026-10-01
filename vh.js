/* ==========================================================================
   STUDIUM 2027 · Speichern und Rückfragen, die überall funktionieren
   • VH.save(name, blob): als Claude-Artefakt über die Download-Funktion der
     Plattform (der Browser blockiert dort normale Downloads), sonst wie gewohnt
     über einen Download-Link.
   • VH.confirm(text): eigene Rückfrage auf der Seite – confirm() des Browsers
     wird im Artefakt blockiert und liefert dort immer „Nein“.
   ========================================================================== */
(() => {
  "use strict";
  let dlP = null;
  function downloads() {
    if (dlP) return dlP;
    const c = window.claude;
    if (!c || typeof c.use !== "function") return Promise.resolve(null);
    dlP = Promise.resolve(c.use("downloads")).catch(() => null);
    return dlP;
  }
  if (window.claude && typeof window.claude.use === "function") downloads();

  function anchor(name, blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* Ergebnis: "saved" | "declined" | "rejected" (Dateityp hier nicht erlaubt) | "error" */
  async function save(name, blob) {
    const dl = await downloads();
    if (dl) {
      try { await dl.save({ filename: name, data: blob }); return "saved"; }
      catch (e) {
        const code = e && e.code;
        if (code === "declined") return "declined";
        if (code === "rejected_extension" || code === "extension_not_enabled") return "rejected";
        if (code === "rate_limited") return "error";
        /* sonst: normaler Download-Versuch */
      }
    }
    try { anchor(name, blob); return "saved"; } catch (e) { return "error"; }
  }

  function confirmBox(text, okLabel, cancelLabel) {
    return new Promise(resolve => {
      const d = document.createElement("dialog");
      d.className = "vh-confirm";
      d.innerHTML = `<p></p><div class="vh-confirm-act"><button type="button" class="btn ghost sm" data-v="0"></button><button type="button" class="btn primary sm" data-v="1"></button></div>`;
      d.querySelector("p").textContent = text;
      d.querySelector('[data-v="0"]').textContent = cancelLabel || "Abbrechen";
      d.querySelector('[data-v="1"]').textContent = okLabel || "Ja, weiter";
      const done = v => { d.close(); d.remove(); resolve(v); };
      d.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) done(b.dataset.v === "1"); else if (e.target === d) done(false); });
      d.addEventListener("cancel", e => { e.preventDefault(); done(false); });
      document.body.appendChild(d);
      try { d.showModal(); } catch (e) { d.setAttribute("open", ""); }
      d.querySelector('[data-v="1"]').focus();
    });
  }

  /* Im Artefakt laufen Guide und Editor als zwei eigene Links (nur die Hauptseite eines
     Artefakts bekommt die Download-Funktion). Interne Links werden dorthin umgebogen. */
  const LINKS = { guide: "https://claude.ai/artifact/GidehqKsAceCUUptBrMkpa", editor: "https://claude.ai/artifact/2NHeZirC6YPKbsaN7RA3Fr" };
  const inArtifact = !!(window.claude && typeof window.claude.use === "function");
  document.addEventListener("click", e => {
    if (!inArtifact) return;
    const a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    const h = a.getAttribute("href") || "";
    let to = "";
    const m = h.match(/^\.\/editor\.html(?:#plan=([\w-]+))?$/);
    if (m && LINKS.editor) to = LINKS.editor + (m[1] ? "#" + m[1] : "");
    else if (/^\.\/index\.html(#[\w-]*)?$/.test(h) && LINKS.guide) to = LINKS.guide;
    if (!to) return;
    e.preventDefault();
    const n = document.createElement("a"); n.href = to; n.target = "_blank"; n.rel = "noopener"; document.body.appendChild(n); n.click(); n.remove();
  }, true);

  window.VH = { save, confirm: confirmBox, downloads, LINKS, inArtifact };
})();
