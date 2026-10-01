/* ==========================================================================
   STUDIUM 2027 · Motivation + Bewegung
   • „Dein Plan“: ermutigende, ehrliche Startseite (nächste Schritte, Fortschritt)
   • Scroll-Reveal, Zähler, Parallax, Fortschrittsbalken, Konfetti
   Alles respektiert prefers-reduced-motion. Ohne JS bleibt der Inhalt sichtbar.
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, M = window.STUDY_MUSTER;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TZ = "Europe/Berlin";
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const dayNum = iso => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const daysUntil = iso => dayNum(iso) - dayNum(fmt.format(new Date()));
  const dmy = iso => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}.${m}.${y}`; };
  const MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const days = d => `${(Math.round(d * 2) / 2).toString().replace(".", ",")} ${Math.round(d * 2) / 2 === 1 ? "Tag" : "Tage"}`;

  /* ------------------------------------------------------------ Fortschritt aus dem Browser-Speicher */
  function mine() {
    try { const o = JSON.parse(localStorage.getItem("vh-studium-2027") || "{}"); return { check: Object.keys(o.check || {}).length, status: Object.values(o.status || {}) }; } catch (e) { return { check: 0, status: [] }; }
  }

  /* ------------------------------------------------------------ Abschnitt „Dein Plan“ */
  function planItems() {
    return D.programs.filter(p => M.plans[p.id]).map(p => ({ p, pl: M.plans[p.id], f: window.MusterUI.feasibility(p) }));
  }
  function render() {
    const root = $("#mutRoot"); if (!root || !window.MusterUI) return;
    const all = planItems();
    const dated = all.filter(x => x.p.applicationDeadline && x.p.deadlineExact && x.f.cls !== "closed").sort((a, b) => a.p.applicationDeadline.localeCompare(b.p.applicationDeadline));
    const strong = dated.filter(x => x.pl.fit !== "mittel");
    const line = strong.slice(0, 5);
    const today = dated.find(x => x.f.cls === "ok" || x.f.cls === "tight") || dated[0];
    const avgReady = Math.round(100 * all.reduce((s, x) => s + (x.pl.sum.w + x.pl.sum.m) / x.pl.sum.total, 0) / all.length);
    const nWorks = Object.keys(M.catalog).length;
    const mi = mine(), checkTotal = D.checklist.length, sent = mi.status.filter(s => ["abgeschickt", "einladung", "pruefung", "zusage"].includes(s)).length;
    const pct = Math.round(100 * mi.check / checkTotal), C = 2 * Math.PI * 52;
    const A = M.analysis;

    let step = "";
    if (today) {
      const slots = today.pl.sections.flatMap(s => s.slots), nx = slots.find(s => s.k === "n" && s.crit) || slots.find(s => s.k === "n");
      const what = nx ? `${M.NEW[nx.key][0]} – ${nx.note || M.NEW[nx.key][1]}` : "Mappe im Editor durchgehen, Legenden prüfen und abschicken.";
      step = `<article class="mut-today mut-block"><div class="mut-today-l"><span class="eyebrow">Dein nächster Schritt · heute</span>
        <h3>${esc(today.p.course)} · ${esc(today.p.universityShort)}</h3>
        <p class="mut-today-what">${nx ? "Fang an mit: " : ""}<b>${esc(what)}</b></p>
        <p class="muted small">Frist ${esc(dmy(today.p.applicationDeadline))} · noch ${daysUntil(today.p.applicationDeadline)} Tage · ${today.pl.sum.w + today.pl.sum.m} von ${today.pl.sum.total} Blättern stehen schon.</p></div>
        <div class="mut-today-r"><a class="btn primary pulse" href="./editor.html#plan=${esc(today.p.id)}">Jetzt im Editor weitermachen</a>
        <button type="button" class="btn ghost" data-open="${esc(today.p.id)}" data-muster="1">Musterbewerbung ansehen</button></div></article>`;
    }
    const tl = line.map((x, i) => {
      const dl = daysUntil(x.p.applicationDeadline), d = x.p.applicationDeadline.slice(0, 10).split("-");
      const missing = x.pl.sum.n + x.pl.sum.m;
      return `<li class="mut-tl-item" style="--i:${i}"><span class="mut-date"><b>${d[2]}</b><small>${MON[Number(d[1]) - 1]} ${d[0]}</small></span>
        <div class="mut-tl-body"><b>${esc(x.p.course)}</b><span>${esc(x.p.universityShort)} · ${esc(D.cities[x.p.city].name)}</span>
        <small>noch ${dl} Tage · ${x.pl.sum.w} von ${x.pl.sum.total} Blättern da${missing ? ` · ${days(x.pl.sum.days)} bis fertig` : ""}</small></div>
        <span class="mu-badge ${x.f.cls}">${esc(x.f.label)}</span>
        <a class="btn ghost sm" href="./editor.html#plan=${esc(x.p.id)}">Mappe starten</a></li>`;
    }).join("");

    root.innerHTML = `
      <div class="mut-hero mut-block">
        <p class="eyebrow">Du kannst das</p>
        <h2 class="mut-title">Deine Mappe ist weiter,<br>als du denkst.</h2>
        <p class="mut-lead">Drei Jahre Malerei, handgenähte Mäntel und Hüte, ukrainische Schrift im Futter: Das ist kein Anfänger-Portfolio, das ist eine <b>Handschrift</b>. Eine Zusage kann niemand versprechen – aber eine Bewerbung, die nicht abgeschickt wird, hat sicher keine Chance. Die meisten Mappen stehen schon. Der nächste Schritt dauert weniger als zwei Stunden.</p>
      </div>
      <div class="mut-stats mut-grid">
        <div class="mut-stat"><b data-count="${nWorks}">0</b><small>Werke dokumentiert</small></div>
        <div class="mut-stat"><b data-count="3">0</b><small>Jahre Entwicklung (2023–26)</small></div>
        <div class="mut-stat"><b data-count="${all.length}">0</b><small>Musterbewerbungen fertig geplant</small></div>
        <div class="mut-stat"><b data-count="${avgReady}" data-suffix=" %">0</b><small>jeder Mappe stehen im Schnitt schon</small></div>
      </div>
      ${step}
      <div class="mut-split">
        <div class="mut-block"><h3 class="h3">Dein Weg bis zur Frist</h3><p class="muted small">Die nächsten Fristen mit sehr guter oder guter Passung – in dieser Reihenfolge anpacken.</p>
          <ol class="mut-tl">${tl}</ol></div>
        <div class="mut-block mut-ringbox"><h3 class="h3">Dein Fortschritt</h3>
          <div class="mut-ring" style="--c:${C.toFixed(1)};--off:${(C * (1 - pct / 100)).toFixed(1)}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" transform="rotate(-90 60 60)"/></svg><span><b data-count="${pct}" data-suffix=" %">0</b><small>Unterlagen</small></span></div>
          <p class="small">${mi.check} von ${checkTotal} Dokumenten der Checkliste bereit · <b>${sent}</b> Bewerbung${sent === 1 ? "" : "en"} abgeschickt</p>
          <p><a class="text-btn" href="#checkliste">Zur Checkliste</a> · <a class="text-btn" href="#cockpit">Zum Cockpit</a></p></div>
      </div>
      <div class="mut-block"><h3 class="h3">Das macht dich besonders</h3>
        <div class="mut-strengths mut-grid">${A.strengths.slice(0, 4).map(([t, x], i) => `<article class="mut-str"><span class="mut-n">${String(i + 1).padStart(2, "0")}</span><b>${esc(t)}</b><p>${esc(x)}</p></article>`).join("")}</div>
        <p class="muted small mt">Aus der Portfolio-Analyse: <a class="text-btn" href="#analyse">alle Stärken, Lücken und Schlüsselblätter ansehen</a>.</p></div>`;
    $$("[data-count]", root).forEach(el => { if (reduced) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); } else el.dataset.cd = "1"; });
    scan();
  }

  /** Fortschritt still aktualisieren (ohne den Abschnitt neu aufzubauen) */
  function refreshProgress() {
    const ring = $(".mut-ring"); if (!ring || !D.checklist) return;
    const mi = mine(), total = D.checklist.length, pct = Math.round(100 * mi.check / total), C = 2 * Math.PI * 52;
    const sent = mi.status.filter(s => ["abgeschickt", "einladung", "pruefung", "zusage"].includes(s)).length;
    ring.style.setProperty("--off", (C * (1 - pct / 100)).toFixed(1));
    const b = $("b", ring); if (b) { b.dataset.count = pct; b.textContent = pct + " %"; }
    const p = ring.parentElement.querySelector("p.small"); if (p) p.innerHTML = `${mi.check} von ${total} Dokumenten der Checkliste bereit · <b>${sent}</b> Bewerbung${sent === 1 ? "" : "en"} abgeschickt`;
  }

  /* ------------------------------------------------------------ Zähler */
  function countUp(el) {
    const to = Number(el.dataset.count), suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1300;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------ Reveal */
  const SEL_ITEM = ".section-head,.today-head,.guide,.pf-card,.an-verdict,.an-series,.mu-prio,.mu-disclaimer,.gallery-title,.src-grid>*,.mut-block,.mut-stat,.toolbar,.hero-lead,.stats";
  const SEL_GRID = ".today-list,.program-grid,.work-gallery,.an-strip,.arch-grid,.mu-list,.glossary,.checklist,.ua-steps,.mut-grid,.mut-tl,.bars,.ko-cards,.ko-steps,.sv-grid:not(.sv-dlg)";
  let io;
  const pending = new Set();
  function reveal(el, instant) {
    pending.delete(el); if (io) io.unobserve(el);
    if (el.dataset.cd) { el.textContent = (el.dataset.count || "") + (el.dataset.suffix || ""); if (!instant) { el.dataset.cdo = "1"; countUp(el); } return; }
    el.classList.add("in");
    if (el.classList.contains("stag")) setTimeout(() => el.classList.add("done"), instant ? 0 : 1600);
  }
  function sweep() { pending.forEach(el => { if (!el.isConnected) { pending.delete(el); return; } if (el.getBoundingClientRect().bottom < 0) reveal(el, true); }); }
  function scan() {
    clampLists();
    if (reduced || !io) return;
    $$(SEL_ITEM).forEach(el => { if (el.dataset.mo) return; el.dataset.mo = "1"; el.classList.add("rv"); io.observe(el); pending.add(el); });
    $$(SEL_GRID).forEach(el => { if (el.dataset.mo) return; el.dataset.mo = "1"; el.classList.add("stag"); io.observe(el); pending.add(el); });
    $$("[data-cd]").forEach(el => { if (el.dataset.cdo) return; el.dataset.cdo = "1"; io.observe(el); pending.add(el); });
    $$(".stat dd > b").forEach(el => { if (el.dataset.cdo || !/^\d+$/.test(el.textContent.trim())) return; el.dataset.cdo = "1"; el.dataset.count = el.textContent.trim(); el.dataset.cd = "1"; io.observe(el); pending.add(el); });
  }
  function initObserver() {
    io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) reveal(en.target, false); }), { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    window.addEventListener("scroll", () => { clearTimeout(sweep._t); sweep._t = setTimeout(sweep, 60); }, { passive: true });
    let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 80); }).observe($("main") || document.body, { childList: true, subtree: true });
    scan();
  }


  /* ------------------------------------------------------------ Handy: lange Listen als Vorschau */
  const CLAMP = [["#programGrid", 2700, "Alle Studiengänge zeigen"], [".mu-list", 1500, "Alle Musterbewerbungen zeigen"], [".sv-grid:not(.sv-dlg)", 2300, "Alle Stimmen zeigen"], [".arch-grid", 1150, "Ganzes Werkarchiv zeigen"], [".glossary", 1300, "Ganzes Glossar zeigen"], [".ev-list", 2300, "Alle Termine zeigen"], [".ko-cards", 2500, "Alle Themen zeigen"], [".an-series-grid", 1500, "Alle Serien zeigen"]];
  const mobile = () => window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
  function clampLists() {
    if (!mobile()) return;
    CLAMP.forEach(([sel, h, label]) => $$(sel).forEach(c => {
      if (c.dataset.cl) { evalClamp(c); return; }
      c.dataset.cl = "1"; c._h = h;
      const b = document.createElement("button"); b.type = "button"; b.className = "btn ghost clamp-btn"; b.textContent = label; b.hidden = true;
      b.addEventListener("click", () => { c.classList.remove("clamped"); c.dataset.clOpen = "1"; b.remove(); });
      c.insertAdjacentElement("afterend", b); c._btn = b;
      new MutationObserver(() => evalClamp(c)).observe(c, { childList: true });
      evalClamp(c);
    }));
  }
  function evalClamp(c) {
    if (c.dataset.clOpen || !c._btn) return;
    c.style.setProperty("--cl", c._h + "px"); c.classList.add("clamped");
    const tall = c.scrollHeight > c._h + 120;
    c.classList.toggle("clamped", tall); c._btn.hidden = !tall;
  }

  /* ------------------------------------------------------------ Hero: Titelbuchstaben, Parallax, Scrollbalken */
  function hero() {
    const h = $("#heroTitle"); if (h && !h.dataset.split) {
      h.dataset.split = "1"; h.setAttribute("aria-label", h.textContent.trim());
      let i = 0;
      const wrap = (node, em) => [...node.childNodes].map(n => (n.nodeType === 3 ? [...n.textContent].map(ch => `<span class="ch${ch === " " ? " sp" : ""}" style="--i:${i++}" aria-hidden="true">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("") : `<em>${wrap(n)}</em>`)).join("");
      h.innerHTML = wrap(h);
    }
    const art = $(".hero-art");
    if (art && matchMedia("(pointer:fine)").matches) {
      window.addEventListener("pointermove", e => { art.style.setProperty("--px", ((e.clientX / innerWidth) - .5).toFixed(3)); art.style.setProperty("--py", ((e.clientY / innerHeight) - .5).toFixed(3)); }, { passive: true });
    }
    const bar = document.createElement("div"); bar.id = "scrollbar"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
    let tick = false;
    const upd = () => { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`; tick = false; };
    window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }

  /* ------------------------------------------------------------ Konfetti */
  function celebrate() {
    if (reduced) return;
    const cv = document.createElement("canvas"); cv.className = "confetti"; cv.setAttribute("aria-hidden", "true");
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const x = cv.getContext("2d"), cols = ["#2a7f8e", "#ffc43c", "#4a90d9", "#3f8a5a", "#f08a5d", "#154c57"];
    const ps = Array.from({ length: 160 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .65, vx: (Math.random() - .5) * 16, vy: -8 - Math.random() * 12, r: 4 + Math.random() * 6, a: Math.random() * 6.28, va: (Math.random() - .5) * .4, c: cols[(Math.random() * cols.length) | 0], life: 0 }));
    let t0 = performance.now();
    const frame = t => {
      const dt = Math.min(2, (t - t0) / 16.7); t0 = t; x.clearRect(0, 0, cv.width, cv.height); let alive = 0;
      ps.forEach(p => { p.vy += .32 * dt; p.vx *= .995; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.life += dt; if (p.y < cv.height + 20 && p.life < 220) { alive++; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = Math.max(0, 1 - p.life / 220); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); } });
      if (alive) requestAnimationFrame(frame); else cv.remove();
    };
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ Start */
  function init() {
    if (!reduced) document.documentElement.classList.add("mo");
    hero();
    if (!reduced && "IntersectionObserver" in window) initObserver();
    else { let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(clampLists, 80); }).observe($("main") || document.body, { childList: true, subtree: true }); }
    render(); clampLists();
  }
  window.Motion = { render, celebrate, scan, refreshProgress };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
