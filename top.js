/* ==========================================================================
   STUDIUM 2027 · „Hier würde ich anfangen“
   Fünf Bewerbungen, die laut Portfolio-Analyse am besten passen und zeitlich
   machbar sind. Fristen, Sprache und Entfernung kommen aus data.js, damit
   nichts doppelt gepflegt wird. Die Begründung ist eine Einschätzung.
   Veronika stellt ihr Deutsch-Niveau und den VPD-Stand selbst ein; die Karten
   zeigen dann, ob die Bewerbung schon möglich ist (gespeichert in „vh-top“).
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

  const K = "vh-top";
  const load = () => { try { return JSON.parse(localStorage.getItem(K) || "null") || {}; } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) { /* ohne Speicher weiter */ } };
  const lang = () => { try { return (JSON.parse(localStorage.getItem("vh-studium-2027") || "{}").lang === "ua") ? "ua" : "de"; } catch (e) { return "de"; } };

  const LV = { a2: 1, b1: 2, b2: 3, c1: 4 };
  const LV_NAME = { a2: "A2", b1: "B1", b2: "B2", c1: "C1" };

  /* need = Deutschstufe, die zur Bewerbung verlangt (oder empfohlen) ist; uni = Zeugnisbewertung über uni-assist (VPD) */
  const PICKS = [
    { id: "udk-kostuembild", need: "b1", uni: true,
      de: { tag: "Frist zuerst", why: "Figur und Kostüm sind deine größte Stärke, und die UdK will höchstens 20 Seiten. Die meisten davon hast du schon. Start wäre im Sommersemester 2027.",
        warn: "Knapp: Ohne fertige Zeugnisbewertung (VPD) von uni-assist wird es eng, weil die mehrere Wochen dauert. Dann lieber jetzt beantragen und die UdK im nächsten Durchgang einplanen." },
      ua: { tag: "термін найперший", why: "Фігура й костюм – твоя найсильніша сторона, а UdK хоче щонайбільше 20 сторінок. Більшість із них у тебе вже є. Початок навчання – літній семестр 2027.",
        warn: "Тісно: без готової оцінки атестата (VPD) від uni-assist буде складно, бо вона триває кілька тижнів. Тоді краще подати на VPD зараз і планувати UdK на наступний набір." } },
    { id: "dresden-kostuemgestaltung", need: "b2", ukraineException: true,
      de: { tag: "passt sehr genau", why: "Kostümbau mit historischer Schnitttechnik, Färben und viel Handarbeit. Das ist fast eine Beschreibung deiner handgenähten Stücke." },
      ua: { tag: "дуже точно пасує", why: "Виготовлення костюмів з історичним кроєм, фарбуванням і великою часткою ручної роботи. Це майже опис твоїх зшитих вручну речей." } },
    { id: "weissensee-textil", need: "a2",
      de: { tag: "Textil als Kunst", why: "Weißensee denkt Textil als Material und Oberfläche. Rost, Wachs und Malerei auf Leinen sind hier genau richtig. Die Frist endet mittags um 12 Uhr." },
      ua: { tag: "текстиль як мистецтво", why: "У Вайсензее текстиль – це матеріал і поверхня. Іржа, віск і живопис на льоні тут саме доречні. Термін спливає опівдні, о 12:00." } },
    { id: "burg-textile-kuenste", need: "b1", soft: true, uni: true,
      de: { tag: "freie Kunst mit Stoff", why: "Freie Kunst mit textilen Mitteln: Malerei und Textil dürfen ein Werk sein. Wichtig: Die BURG nimmt nur Arbeiten aus den letzten zwei Jahren, also 2025 und 2026." },
      ua: { tag: "вільне мистецтво з тканиною", why: "Вільне мистецтво текстильними засобами: живопис і текстиль можуть бути одним твором. Важливо: BURG приймає лише роботи за останні два роки, тобто 2025 і 2026." } },
    { id: "hfg-offenbach-kunst", need: "b2", english: true,
      de: { tag: "nah an zu Hause", why: "Der Fachbereich Kunst hat ein eigenes Lehrgebiet Mode, und du kannst zwischen Malerei, Bühne und Mode wechseln. Du könntest in Aschaffenburg wohnen bleiben." },
      ua: { tag: "близько до дому", why: "На факультеті мистецтва є власний напрям «Мода», і можна переходити між живописом, сценою та модою. Ти могла б і далі жити в Ашаффенбурзі." } }
  ];

  const TX = {
    de: { lvl: "Dein Deutsch heute", vpd: "Zeugnisbewertung (VPD) von uni-assist", unknown: "weiß nicht", c1: "C1 oder besser", a2: "A1–A2",
      have: "habe ich", notyet: "noch nicht", frist: "Frist", sprache: "Deutsch zur Bewerbung", start: "Deutsch bis Studienbeginn", mappe: "Mappe",
      ready: (a, b) => `${a} von ${b} Blättern hast du schon`, read: "Alles dazu lesen", build: "Mappe bauen", left: d => `noch ${d} Tage`, over: "vorbei",
      fits: "passt zu deinem Deutsch", need: n => `du brauchst noch ${n}`, needSoft: n => `${n} für die Prüfung empfohlen`, needEn: "du brauchst B2 (Deutsch oder Englisch)",
      exc: "Ausnahme für die Ukraine: B2 darf nachgereicht werden", vpdTodo: "VPD bei uni-assist beantragen, das dauert mehrere Wochen",
      sum: (n, t) => `Mit deinem Deutsch kannst du dich heute bei ${n} von ${t} bewerben.`, hint: "Stell hier dein Deutsch ein, dann siehst du bei jeder Hochschule, ob es schon reicht.",
      legend: "Wird nur auf diesem Gerät gespeichert." },
    ua: { lvl: "Твоя німецька зараз", vpd: "Оцінка атестата (VPD) від uni-assist", unknown: "не знаю", c1: "C1 або краще", a2: "A1–A2",
      have: "так, є", notyet: "ще ні", frist: "Термін", sprache: "Німецька для заявки", start: "Німецька до початку навчання", mappe: "Портфоліо",
      ready: (a, b) => `${a} з ${b} аркушів уже є`, read: "Усе про це", build: "Створити портфоліо", left: d => `ще ${d} дн.`, over: "минув",
      fits: "твоєї німецької достатньо", need: n => `потрібно ще ${n}`, needSoft: n => `для іспиту рекомендовано ${n}`, needEn: "потрібно B2 (німецька або англійська)",
      exc: "Виняток для України: B2 можна донести пізніше", vpdTodo: "подати на VPD в uni-assist – це триває кілька тижнів",
      sum: (n, t) => `З твоєю німецькою зараз можна подаватися в ${n} з ${t}.`, hint: "Вибери тут свій рівень німецької – і біля кожного вишу буде видно, чи його вже достатньо.",
      legend: "Зберігається лише на цьому пристрої." }
  };

  function deadline(p, t) {
    if (p.applicationDeadline) {
      const d = daysUntil(p.applicationDeadline);
      if (d < 0) return { txt: `${dmy(p.applicationDeadline)} · ${t.over}`, cls: "past" };
      return { txt: `${dmy(p.applicationDeadline)}${p.deadlineTime ? ", " + p.deadlineTime : ""} · ${t.left(d)}`, cls: d <= 45 ? "soon" : "ok" };
    }
    return { txt: p.deadlineShortText || p.deadlineText || "–", cls: "vague" };
  }

  function check(x, st, t) {
    const out = [], mine = LV[st.lvl];
    let ok = null;
    if (mine) {
      if (x.ukraineException) { ok = true; out.push(["ok", t.exc]); }
      else if (mine >= LV[x.need]) { ok = true; out.push(["ok", t.fits]); }
      else { ok = x.soft ? true : false; out.push([x.soft ? "info" : "warn", x.english ? t.needEn : x.soft ? t.needSoft(LV_NAME[x.need]) : t.need(LV_NAME[x.need])]); }
    } else if (x.ukraineException) out.push(["ok", t.exc]);
    if (x.uni && st.vpd === "no") out.push(["warn", t.vpdTodo]);
    return { ok, badges: out };
  }

  function render() {
    const root = $("#topRoot"); if (!root || !D) return;
    const L = lang(), t = TX[L], st = load();
    let items = PICKS.map((x, i) => ({ ...x, i, p: D.programs.find(p => p.id === x.id) })).filter(x => x.p).map(x => ({ ...x, c: check(x, st, t) }));
    if (LV[st.lvl]) items = items.slice().sort((a, b) => (b.c.ok === true) - (a.c.ok === true) || a.i - b.i);
    const nOk = items.filter(x => x.c.ok === true).length;
    const opt = (v, label, cur) => `<option value="${v}"${(cur || "") === v ? " selected" : ""}>${esc(label)}</option>`;
    const form = `<div class="top-prefs">
        <label class="top-pref" for="topLvl"><span>${esc(t.lvl)}</span>
          <select id="topLvl" data-top="lvl">${opt("", t.unknown, st.lvl)}${opt("a2", t.a2, st.lvl)}${opt("b1", "B1", st.lvl)}${opt("b2", "B2", st.lvl)}${opt("c1", t.c1, st.lvl)}</select></label>
        <label class="top-pref" for="topVpd"><span>${esc(t.vpd)}</span>
          <select id="topVpd" data-top="vpd">${opt("", t.unknown, st.vpd)}${opt("yes", t.have, st.vpd)}${opt("no", t.notyet, st.vpd)}</select></label>
        <p class="top-sum" aria-live="polite">${LV[st.lvl] ? esc(t.sum(nOk, items.length)) : esc(t.hint)} <small>${esc(t.legend)}</small></p>
      </div>`;
    root.innerHTML = form + `<ol class="top-list">${items.map((x, i) => {
      const p = x.p, tx = x[L] || x.de, dl = deadline(p, t), lr = p.languageRequirements || {};
      const langApp = lr.application && lr.application.replace(/\s*\(Bewerbung mit [^)]*\)/, "");
      const dist = D.home && D.cities[p.city] ? km(D.home, D.cities[p.city]) : null;
      const plan = M && M.plans[p.id];
      const showWarn = tx.warn && st.vpd !== "yes";
      return `<li class="top-card${x.c.ok === false ? " is-later" : ""}">
        <span class="top-rank" aria-hidden="true">${i + 1}</span>
        <div class="top-main">
          <p class="top-tag">${esc(tx.tag)}</p>
          <h3 class="top-title">${esc(p.course)}</h3>
          <p class="top-uni">${esc(p.university)} · ${esc(D.cities[p.city] ? D.cities[p.city].name : p.city)}${dist !== null ? ` · ca. ${dist} km` : ""}</p>
          ${x.c.badges.length ? `<ul class="top-badges">${x.c.badges.map(([k, s]) => `<li class="tb-${k}">${esc(s)}</li>`).join("")}</ul>` : ""}
          <p class="top-why">${esc(tx.why)}</p>
          ${showWarn ? `<p class="top-warn">${esc(tx.warn)}</p>` : ""}
          <dl class="top-facts">
            <div><dt>${esc(t.frist)}</dt><dd class="dl-${dl.cls}">${esc(dl.txt)}</dd></div>
            ${langApp ? `<div><dt>${esc(t.sprache)}</dt><dd>${esc(langApp)}</dd></div>` : ""}
            ${lr.start ? `<div><dt>${esc(t.start)}</dt><dd>${esc(lr.start)}</dd></div>` : ""}
            ${plan ? `<div><dt>${esc(t.mappe)}</dt><dd>${esc(t.ready(plan.sum.w + plan.sum.m, plan.sum.total))}</dd></div>` : ""}
          </dl>
        </div>
        <div class="top-act">
          <button type="button" class="btn primary sm" data-open="${esc(p.id)}">${esc(t.read)}</button>
          <a class="btn ghost sm" href="./editor.html#plan=${esc(p.id)}">${esc(t.build)}</a>
        </div>
      </li>`;
    }).join("")}</ol>`;
  }

  document.addEventListener("change", e => {
    const s = e.target.closest && e.target.closest("[data-top]"); if (!s) return;
    const st = load(); st[s.dataset.top] = s.value; save(st); render();
    const again = document.getElementById(s.id); if (again) again.focus();
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  window.TopPicks = { render };
})();
