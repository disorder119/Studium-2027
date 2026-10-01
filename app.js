/* ==========================================================================
   STUDIUM 2027 · App-Logik (Vanilla JS, keine Abhängigkeiten, keine Cookies,
   kein Tracking). Persönliche Daten nur in localStorage dieses Browsers.
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA;
  const MAP = window.STUDY_MAP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TZ = "Europe/Berlin";
  const CAL = '<svg class="cal-ico" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="2" y="3.5" width="12" height="10.5" rx="1.5"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3"/></svg>';

  /* ------------------------------------------------------------ Speicher */
  const STORE_KEY = "vh-studium-2027";
  const store = (() => {
    const blank = { v: 2, fav: {}, status: {}, notes: {}, req: {}, check: {}, lang: "de", prefs: {} };
    let data = blank;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) data = Object.assign({}, blank, JSON.parse(raw));
    } catch (e) { data = blank; }
    // Migration: alte Checkliste der ersten Version bleibt unangetastet erhalten
    // (Schlüssel "nika-study-tasks"); sie hatte andere Aufgaben-IDs.
    const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); return true; } catch (e) { return false; } };
    return { get: () => data, save, replace(n) { data = Object.assign({}, blank, n); save(); } };
  })();
  const S = () => store.get();

  /* ------------------------------------------------------------ Sprache */
  const I18N = {
    de: {},
    ua: {
      "skip": "До змісту", "nav.radar": "Терміни", "nav.map": "Мапа", "nav.programs": "Програми", "nav.cockpit": "Кокпіт", "nav.portfolio": "Портфоліо", "nav.analysis": "Аналіз", "nav.muster": "Зразки", "nav.plan": "План", "nav.kosten": "Витрати", "nav.stimmen": "Голоси", "nav.more": "Ще", "nav.editor": "Редактор", "nav.events": "Події", "nav.ukraine": "Україна", "nav.glossary": "Словник", "nav.checklist": "Чекліст", "nav.sources": "Джерела",
      "hero.sub": "Особистий навігатор для вступу та навчання",
      "hero.lead": "Які програми підходять до твоїх робіт, куди подавати, до якого числа, що потрібно – і який наступний крок? Усі терміни взято з офіційних сайтів вишів.",
      "today.eyebrow": "Що робити далі?", "today.title": "Сьогодні в фокусі",
      "q1": "Що мені підходить?", "q2": "Куди можна подати?", "q3": "До якого числа?", "q4": "Що мені потрібно?", "q5": "Який мій наступний крок?", "q6": "Де натиснути, щоб почати?",
      "map.eyebrow": "Міста", "map.title": "Мапа Німеччини", "map.help": "Торкнись точки: програми, кількість і найближчий термін у місті. Відстань – по прямій від Ашаффенбурга.",
      "map.lgHigh": "збіг ≥ 80 %", "map.lgMid": "70–79 %", "map.lgLow": "менше 70 %",
      "radar.eyebrow": "Терміни", "radar.title": "Радар термінів", "radar.help": "У хронологічному порядку. «Приблизно» означає: виш ще не опублікував точну дату.", "radar.favOnly": "лише обране", "radar.icsAll": "Усі точні терміни в календар (.ics)",
      "prog.eyebrow": "Що мені підходить?", "prog.title": "Програми навчання", "prog.help": "Portfolio-Match = наскільки зміст програми збігається з твоїми роботами. Це НЕ шанс на вступ.", "prog.sort": "Сортувати", "prog.search": "Пошук",
      "cockpit.eyebrow": "Твої заявки", "cockpit.title": "Кокпіт заявок", "cockpit.help": "Статус, обране та нотатки зберігаються лише в цьому браузері на цьому пристрої.", "cockpit.showAll": "показати всі програми", "cockpit.export": "Зберегти дані (.json)", "cockpit.import": "Завантажити копію",
      "pf.eyebrow": "Твоє портфоліо 2023–2026", "pf.title": "Портфоліо та оцінка", "pf.help": "Не оцінка мистецтва. Оцінка того, що вже сильне для різних типів вступу і чого бракує. Без прогнозу, чи тебе приймуть.", "pf.profile": "Твій профіль (основа Portfolio-Match)", "pf.strong": "Сильні сторони", "pf.gapDesign": "Можливі прогалини – дизайн", "pf.gapArt": "Можливі прогалини – вільне мистецтво", "pf.todo": "Допоможе майже всюди – ще створити", "pf.gallery": "Твої роботи в рекомендаціях",
      "an.eyebrow": "Погляд професора", "an.title": "Аналіз портфоліо", "an.help": "Кожну роботу з PDF-портфоліо розглянуто окремо: сильні сторони, прогалини, ключові роботи. Фахова оцінка, не оцінка і не прогноз вступу.", "ko.eyebrow": "Гроші та все навколо", "ko.title": "Витрати та фінансування", "ko.help": "Семестровий внесок, оренда, BAföG, страхування, статус, стипендії – для тебе як українки з § 24. Кожна цифра з джерелом і датою.", "sv.eyebrow": "Досвід і поради", "sv.title": "Голоси студентів", "sv.help": "Що кажуть студенти, абітурієнти та самі виші – з джерелом і посиланням. Нічого не вигадано.", "mu.eyebrow": "Мапа для кожного вишу", "mu.title": "Зразки заявок", "mu.help": "Для кожної програми – сітка: які роботи, в якому порядку, що вже є і чого бракує. Торкнись рядка, щоб побачити всю мапу.", "ev.eyebrow": "Консультації", "ev.title": "Консультації з портфоліо та події", "ev.help": "Консультація перед подачею – це нормально і дуже корисно. Минулі події позначені сірим.", "ev.past": "показати минулі", "ev.fav": "лише обране", "ev.icsAll": "Усі майбутні події в календар (.ics)",
      "ua.eyebrow": "Український атестат", "ua.title": "Атестат, право на вступ, мова", "ua.langTable": "Вимоги до мови – порівняння",
      "ck.eyebrow": "Документи", "ck.title": "Підготувати загалом", "ck.help": "Не кожен документ потрібен всюди. Що вимагає конкретний виш – дивись у програмі в розділі «Вимоги цього вишу».",
      "gl.eyebrow": "Простою мовою", "gl.title": "Словник", "gl.help": "Найважливіші слова про вступ – простою німецькою з коротким поясненням українською.",
      "src.eyebrow": "Якість даних", "src.title": "Перед відправкою – завжди перевір ще раз", "src.how": "Як проводилося дослідження", "src.notIncluded": "Перевірено, але не включено",
      "footer": "Особиста орієнтація – не офіційна консультація вишу.", "toTop": "Догори ↑"
    }
  };
  const UI = {
    de: {
      nextDeadline: "Nächste Frist", programs: "Passende Studiengänge", cities: "Städte", openApps: "Offene Bewerbungen",
      openAppsSub: n => `${n} Portale gerade offen`, yourApps: "aus deinem Cockpit",
      now: "JETZT", soon: "BALD", later: "SPÄTER", unpublished: "NOCH NICHT VERÖFFENTLICHT", closed: "GESCHLOSSEN",
      details: "Details", official: "Offizielle Studiengangsseite", portal: "Bewerbungsportal", ics: "Zum Kalender hinzufügen",
      match: "Portfolio-Match", deadline: "Bewerbungsfrist", today: "heute", tomorrow: "morgen", inDays: n => `noch ${n} Tage`, ago: n => (n === 1 ? "gestern" : `vor ${n} Tagen`),
      approx: "ungefähr", annual: "jährliche Regel", published: "Datum offiziell", noTime: "Uhrzeit nicht angegeben",
      favAdd: "Als Favorit merken", favRemove: "Favorit entfernen", all: "Alle",
      tOpen: "Bewerbung jetzt offen", t30: "Frist < 30 Tage", tNoIntern: "ohne Vorpraktikum", tCounsel: "mit Mappenberatung", tNear: "nahe Aschaffenburg", tFav: "Favoriten",
      results: (n, t) => `${n} von ${t} Studiengängen`, none: "Keine Studiengänge mit diesen Filtern.", reset: "Filter zurücksetzen",
      stale: "Bitte Frist erneut auf der Hochschulseite prüfen.", checked: "Zuletzt geprüft",
      cityAll: "Alle Städte zeigen", cityRemove: "Stadtfilter entfernen", km: n => `ca. ${n} km Luftlinie`,
      homeLabel: "Wohnort", saved: "Gespeichert", copied: "Kopiert",
      noteLabel: "Meine Notizen (nur auf diesem Gerät)", notePh: "z. B. „Am 12.11. Mappenberatung besucht“ oder „noch B2-Nachweis nötig“",
      statusLabel: "Mein Status", uaNote: "Офіційні назви та дані вишів подано німецькою мовою."
    },
    ua: {
      nextDeadline: "Найближчий термін", programs: "Програми, що підходять", cities: "Міста", openApps: "Відкриті заявки",
      openAppsSub: n => `${n} порталів зараз відкрито`, yourApps: "з твого кокпіту",
      now: "ЗАРАЗ", soon: "СКОРО", later: "ПІЗНІШЕ", unpublished: "ЩЕ НЕ ОПУБЛІКОВАНО", closed: "ЗАКРИТО",
      details: "Деталі", official: "Офіційна сторінка програми", portal: "Портал для подачі", ics: "Додати в календар",
      match: "Portfolio-Match", deadline: "Термін подачі", today: "сьогодні", tomorrow: "завтра", inDays: n => `ще ${n} дн.`, ago: n => (n === 1 ? "вчора" : `${n} дн. тому`),
      approx: "приблизно", annual: "щорічне правило", published: "офіційна дата", noTime: "час не вказано",
      favAdd: "Додати в обране", favRemove: "Прибрати з обраного", all: "Усі",
      tOpen: "Подача відкрита", t30: "Термін < 30 днів", tNoIntern: "без практики", tCounsel: "з консультацією", tNear: "поблизу Ашаффенбурга", tFav: "Обране",
      results: (n, t) => `${n} з ${t} програм`, none: "Немає програм за цими фільтрами.", reset: "Скинути фільтри",
      stale: "Будь ласка, перевір термін на сайті вишу ще раз.", checked: "Остання перевірка",
      cityAll: "Показати всі міста", cityRemove: "Прибрати фільтр міста", km: n => `бл. ${n} км по прямій`,
      homeLabel: "Місце проживання", saved: "Збережено", copied: "Скопійовано",
      noteLabel: "Мої нотатки (лише на цьому пристрої)", notePh: "напр. «12.11. була на консультації» або «ще потрібен B2»",
      statusLabel: "Мій статус", uaNote: "Офіційні назви та дані вишів подано німецькою мовою."
    }
  };
  /* Ergänzungen 10/2026: Startseite, Empfehlung, „Kurz gesagt“ */
  Object.assign(I18N.ua, {
    "hero.hi": "Вітаю, Вероніко", "hero.sub": "Твій шлях до навчання – крок за кроком",
    "hero.lead": "Тут усе в одному місці: відповідні програми, терміни, витрати й допомога з портфоліо. Не треба встигнути все одразу – просто почни з кроку 1.",
    "hero.cta1": "Почати", "hero.cta2": "Переглянути програми",
    "start.eyebrow": "Як це працює", "start.title": "Чотири кроки до вступу",
    "start.c1t": "Знайти свою програму", "start.c1d": "30 програм: текстиль, мода, костюм і мистецтво. Познач те, що тобі подобається.", "start.c1g": "Переглянути →",
    "start.c2t": "Стежити за термінами", "start.c2d": "До якого числа що треба надіслати? Тут видно, що на черзі.", "start.c2g": "Терміни →",
    "start.c3t": "Розібратися з витратами", "start.c3d": "Внески, BAföG, житло і що діє для тебе з § 24 – простими словами.", "start.c3g": "Витрати →",
    "start.c4t": "Зібрати портфоліо", "start.c4d": "Завантаж фото робіт, напиши тексти й збережи все як PDF.", "start.c4g": "Відкрити редактор →",
    "start.hint": "Усе, що ти позначаєш чи вписуєш, автоматично зберігається на цьому пристрої. Можеш повернутися будь-коли.",
    "top.eyebrow": "Моя порада", "top.title": "З цього варто почати",
    "top.lead": "П’ять програм, які найкраще пасують до твоїх робіт і реальні за часом. Подавайся одночасно в кілька місць: у мистецьких вишах скрізь більше заявок, ніж місць, і кожна додаткова заявка збільшує твій шанс.",
    "top.hint": "Порядок залежить від термінів і від того, наскільки програма пасує до твого портфоліо. Усі 30 програм – нижче.",
    "nav.start": "Початок", "nav.top": "Моя порада", "nav.editor": "Створити портфоліо", "nav.plan": "Твій план", "nav.muster": "Зразки заявок",
    "nav.analysis": "Наскільки сильне портфоліо?", "nav.stimmen": "Досвід студентів", "nav.cockpit": "Мій стан", "nav.ukraine": "Україна і § 24",
    "an.eyebrow": "Чесна оцінка", "an.title": "Наскільки сильне твоє портфоліо?",
    "tldr.h": "Коротко",
    "tl.radar.1": "Угорі – те, що треба зробити найраніше.",
    "tl.radar.2": "«Приблизно» означає: виш ще не оприлюднив точну дату.",
    "tl.radar.3": "Кнопкою календаря всі точні терміни потраплять у календар твого телефону.",
    "tl.programme.1": "30 програм, упорядкованих за тим, наскільки вони пасують до твоїх робіт.",
    "tl.programme.2": "Зірочкою можна запам’ятати програму. Обрані з’являться в термінах і в розділі «Мій стан».",
    "tl.programme.3": "Кнопка «Details» відкриває все про виш: термін, портфоліо, мову, витрати й поради.",
    "tl.analyse.1": "Твої роботи дуже самобутні. Це твоя найбільша перевага.",
    "tl.analyse.2": "Чого ще бракує: власних рисунків на папері, ескізів і лайн-апу твоїх образів.",
    "tl.analyse.3": "Для текстилю й костюма портфоліо вже сильне, для чистого модного дизайну бракує ще кількох аркушів.",
    "tl.muster.1": "Для кожної програми є готова послідовність твоїх робіт.",
    "tl.muster.2": "Суцільна рамка – робота вже є. Пунктир – її ще треба створити.",
    "tl.muster.3": "У редакторі з цього вийде твоє PDF-портфоліо.",
    "tl.kosten.1": "У більшості федеральних земель плати за навчання немає. Ти платиш лише семестровий внесок – у цих вишах приблизно 270–400 € за семестр.",
    "tl.kosten.2": "З § 24 ти можеш отримувати BAföG. Блокований рахунок не потрібен.",
    "tl.kosten.3": "Нижче можна порахувати, скільки грошей тобі потрібно на місяць.",
    "tl.stimmen.1": "Поради від студентів і від самих вишів.",
    "tl.stimmen.2": "На кожній картці видно, звідки порада і що вона означає для тебе.",
    "tl.ukraine.1": "Чи достатньо твого українського атестата для навчання, залежить від твого документа. Кроки нижче показують, як це з’ясувати.",
    "tl.ukraine.2": "Деякі мистецькі виші за особливого мистецького хисту приймають і без повного права на вступ. Запитай про це на консультації щодо портфоліо.",
    "tl.ukraine.3": "Потрібний рівень німецької для заявки дуже різний: від A2 до C1. Таблиця показує його для кожного вишу.",
    "tl.checkliste.1": "Ці документи потрібні майже скрізь. Почни рано з перекладів і завірень – це триває найдовше.",
    "tl.checkliste.2": "Позначки зберігаються автоматично.",
    "tab.start": "Початок", "tab.prog": "Програми", "tab.kosten": "Витрати", "tab.editor": "Редактор", "tab.more": "Ще"
  });
  const L = () => (S().lang === "ua" ? "ua" : "de");
  const T = k => (UI[L()][k] !== undefined ? UI[L()][k] : UI.de[k]);
  function applyStaticI18n() {
    const lang = L();
    document.documentElement.lang = lang === "ua" ? "uk" : "de";
    $$("[data-i18n]").forEach(el => {
      if (!el.dataset.de) el.dataset.de = el.textContent;
      const v = lang === "ua" ? I18N.ua[el.dataset.i18n] : null;
      el.textContent = v || el.dataset.de;
    });
    $$(".lang-btn").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  /* ------------------------------------------------------------ Datum (Europe/Berlin) */
  const fmtYMD = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const fmtHM = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const todayISO = () => fmtYMD.format(new Date());               // "YYYY-MM-DD" in Berlin
  const nowHM = () => fmtHM.format(new Date()).replace(/^24/, "00"); // "HH:MM" in Berlin
  const dayNum = iso => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const daysUntil = iso => dayNum(iso) - dayNum(todayISO());
  const MONTHS = { de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."], ua: ["січ.", "лют.", "бер.", "квіт.", "трав.", "черв.", "лип.", "серп.", "вер.", "жовт.", "лист.", "груд."] };
  const WD = { de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], ua: ["нд", "пн", "вт", "ср", "чт", "пт", "сб"] };
  const dmy = iso => { const [y, m, d] = iso.split("-"); return `${d}.${m}.${y}`; };
  const weekday = iso => WD[L()][new Date(dayNum(iso) * 864e5).getUTCDay()];
  /** Ist eine Frist vorbei? Ohne Uhrzeit gilt das Tagesende (Berlin). */
  function isPast(iso, time) {
    const n = daysUntil(iso);
    if (n < 0) return true;
    if (n > 0) return false;
    return time ? nowHM() > time : false;
  }
  function countdown(iso, time) {
    if (isPast(iso, time)) { const n = -daysUntil(iso); return n === 0 ? T("closed").toLowerCase() : T("ago")(n); }
    const n = daysUntil(iso);
    if (n === 0) return time ? `${T("today")} ${time}` : T("today");
    if (n === 1) return T("tomorrow");
    return T("inDays")(n);
  }

  /* ------------------------------------------------------------ Hilfsfunktionen */
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const deg = d => d * Math.PI / 180;
  function km(a, b) { const R = 6371, dLa = deg(b.lat - a.lat), dLo = deg(b.lon - a.lon); const q = Math.sin(dLa / 2) ** 2 + Math.cos(deg(a.lat)) * Math.cos(deg(b.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q))); }
  const P = id => D.programs.find(p => p.id === id);
  const cityName = id => D.cities[id].name;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800); }
  const prefersReduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollToEl = el => el && el.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });

  /* ==========================================================================
     PORTFOLIO-MATCH – Berechnung (dokumentiert)
     --------------------------------------------------------------------------
     Jeder Studiengang hat in data.js Gewichte (0–3) für die Kriterien, die
     er inhaltlich verlangt bzw. fördert (match.weights). D.strengths enthält
     Veronikas heutige Ausprägung je Kriterium (0–1).

       Abdeckung   = Σ(w·s) / Σ(w)
                     → Wie gut deckt das heutige Portfolio ab, was der
                       Studiengang inhaltlich verlangt?
       Schwerpunkt = min(1, Anteil der Gewichte auf Veronikas Kernpraxis / 0,5)
                     Kernpraxis = textil, kleidung, objekt, handwerk
                     → Ist Kleidung/Textil als künstlerische Praxis im Zentrum
                       des Studiengangs? (Malerei/Freie Kunst ist sekundär.)
       Portfolio-Match = round(100 · (0,65·Abdeckung + 0,35·Schwerpunkt))

     Das Ergebnis beschreibt NUR die inhaltliche Passung zu vorhandenen
     Arbeiten – keine Zulassungschance, keine Kunstnote. Hürden wie
     Vorpraktikum oder Sprachniveau werden separat als Hinweise angezeigt.
     ========================================================================== */
  const CORE = ["textil", "kleidung", "objekt", "handwerk"];
  function computeMatch(p) {
    const w = p.match.weights; let sw = 0, sws = 0, core = 0;
    const parts = [];
    for (const [k, wt] of Object.entries(w)) {
      const s = D.strengths[k].v; sw += wt; sws += wt * s; if (CORE.includes(k)) core += wt;
      parts.push({ key: k, weight: wt, strength: s });
    }
    const coverage = sws / sw;
    const focus = Math.min(1, (core / sw) / 0.5);
    const score = Math.round(100 * (0.65 * coverage + 0.35 * focus));
    parts.sort((a, b) => b.weight - a.weight || b.strength - a.strength);
    return { score, coverage: Math.round(coverage * 100), focus: Math.round(focus * 100), parts };
  }
  D.programs.forEach(p => { p._match = computeMatch(p); p._km = km(D.home, D.cities[p.city]); });

  /* ------------------------------------------------------------ Fristen-Status */
  function deadlineState(p) {
    const t = todayISO();
    if (p.applicationDeadline && p.deadlineExact) {
      if (isPast(p.applicationDeadline, p.deadlineTime)) return "closed";
      const open = p.applicationOpen ? t >= p.applicationOpen : !!p.openNow;
      const n = daysUntil(p.applicationDeadline);
      if (open || n <= 30) return "now";
      if (n <= 90) return "soon";
      return "later";
    }
    if (p.deadlineBasis === "range" && p.applicationOpen && t >= p.applicationOpen) return "now";
    return "unpublished";
  }
  const isOpenNow = p => {
    const st = deadlineState(p); if (st === "closed") return false;
    const t = todayISO();
    if (p.applicationOpen) return t >= p.applicationOpen;
    return !!p.openNow;
  };
  const sortKey = p => p.applicationDeadline || p.deadlineSortHint || "9999-12-31";
  function deadlineShort(p) {
    if (p.applicationDeadline && p.deadlineExact) return dmy(p.applicationDeadline) + (p.deadlineTime ? `, ${p.deadlineTime}` : "");
    return p.deadlineShortText || p.deadlineText;
  }
  const isStale = p => daysUntil(p.lastVerified) < -D.staleAfterDays;
  const STATE_LABEL = st => T({ now: "now", soon: "soon", later: "later", unpublished: "unpublished", closed: "closed" }[st]);

  /* ------------------------------------------------------------ Tags */
  /** Sprachstufe für das Tag: erste Stufe der Studienstart-Angabe, sonst die der Bewerbung. */
  function langLevel(p) {
    const s = (p.languageRequirements.start || "").match(/\b([ABC][12])\b/);
    if (s) return s[1];
    const b = (p.languageRequirements.application || "").match(/\b([ABC][12])\b/);
    return b ? b[1] + " (Bewerbung)" : null;
  }
  function tagsFor(p) {
    const tags = [];
    if (p.portfolio.required) tags.push({ t: /^physisch/.test(p.portfolio.type) ? "Mappe (Originale)" : "Mappe", k: "mappe" });
    if (p.aptitudeTest.required) tags.push({ t: "Eignungsprüfung", k: "eignung" });
    if (p.homework.required) tags.push({ t: "Hausaufgabe", k: "haus" });
    if (p.internship.required) tags.push({ t: "Praktikum", k: "prakt", warn: true });
    const lv = langLevel(p); if (lv) tags.push({ t: `Deutsch ${lv}`, k: "lang", warn: lv.startsWith("C") });
    if (p.internationalApplication.route === "uni-assist") tags.push({ t: "uni-assist", k: "ua" });
    return tags;
  }

  /* ------------------------------------------------------------ ICS-Export */
  const icsEsc = s => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
  function fold(line) { const out = []; let cur = ""; for (const ch of line) { if (new TextEncoder().encode(cur + ch).length > 74) { out.push(cur); cur = " " + ch; } else cur += ch; } out.push(cur); return out.join("\r\n"); }
  const compact = iso => iso.replace(/-/g, "");
  const nextDay = iso => new Date((dayNum(iso) + 1) * 864e5).toISOString().slice(0, 10);
  const VTZ = ["BEGIN:VTIMEZONE", "TZID:Europe/Berlin", "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT", "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD", "END:VTIMEZONE"];
  function icsEvent(ev) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const L2 = ["BEGIN:VEVENT", `UID:${ev.uid}@studium.veronikahorytska.de`, `DTSTAMP:${stamp}`];
    if (ev.time) {
      const [h, m] = ev.time.split(":").map(Number);
      const end = ev.endTime || `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      L2.push(`DTSTART;TZID=Europe/Berlin:${compact(ev.date)}T${ev.time.replace(":", "")}00`, `DTEND;TZID=Europe/Berlin:${compact(ev.date)}T${end.replace(":", "")}00`);
    } else {
      L2.push(`DTSTART;VALUE=DATE:${compact(ev.date)}`, `DTEND;VALUE=DATE:${compact(nextDay(ev.endDate || ev.date))}`);
    }
    L2.push(`SUMMARY:${icsEsc(ev.summary)}`, `DESCRIPTION:${icsEsc(ev.description)}`);
    if (ev.location) L2.push(`LOCATION:${icsEsc(ev.location)}`);
    if (ev.url) L2.push(`URL:${ev.url}`);
    (ev.alarms || []).forEach(a => L2.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEsc(ev.summary)}`, `TRIGGER:${a}`, "END:VALARM"));
    L2.push("END:VEVENT");
    return L2;
  }
  function downloadICS(events, filename) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Veronika Horytska//Studium 2027//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...VTZ];
    events.forEach(e => lines.push(...icsEvent(e)));
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /** Nur verifizierte, konkrete Fristen werden exportiert. */
  function deadlineIcs(p, ms) {
    const date = ms ? ms.date : p.applicationDeadline;
    const time = ms ? null : p.deadlineTime;
    const label = ms ? ms.label : `FRIST: ${p.course} – ${p.universityShort}`;
    const src = p.sources[0];
    return {
      uid: `${p.id}-${ms ? "ms-" + date : "deadline"}`, date, time: null,
      summary: label + (time ? ` (bis ${time} Uhr)` : ""),
      description: `${p.university} · ${p.course}\n${ms ? "" : p.deadlineText + "\n"}${p.deadlineBasis === "annual" && !ms ? "Hinweis: jährlich gleiche Frist laut Hochschule.\n" : ""}Bitte die Frist vor dem Absenden auf der Hochschulseite prüfen.\nQuelle (geprüft ${dmy(src.checked)}): ${src.url}`,
      url: p.officialUrl, location: cityName(p.city), alarms: ["-P7D", "-P2D"]
    };
  }
  function eventIcs(e) {
    return {
      uid: `ev-${e.id}`, date: e.date, endDate: e.endDate, time: e.time || null, endTime: e.endTime || null,
      summary: `${e.title} – ${e.university}`,
      description: `${e.mode}${e.place ? " · " + e.place : ""}\n${e.registration || ""}\nOffizielle Quelle: ${e.url}`,
      location: e.place || cityName(e.city), url: e.url, alarms: ["-P1D"]
    };
  }

  /* ==========================================================================
     RENDER: Kennzahlen + „Heute im Blick“
     ========================================================================== */
  function renderStats() {
    const upcoming = D.programs.filter(p => p.applicationDeadline && p.deadlineExact && !isPast(p.applicationDeadline, p.deadlineTime)).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const nx = upcoming[0];
    const cities = new Set(D.programs.map(p => p.city)).size;
    const openPortals = D.programs.filter(isOpenNow).length;
    const mine = Object.values(S().status).filter(s => ["offen", "abgeschickt", "einladung", "pruefung"].includes(s)).length;
    $("#stats").innerHTML = `
      <div class="stat stat-wide"><dt>${esc(T("nextDeadline"))}</dt><dd>${nx ? `<button type="button" class="stat-link" data-open="${nx.id}"><b>${esc(dmy(nx.applicationDeadline))}</b> <span>${esc(countdown(nx.applicationDeadline, nx.deadlineTime))}</span><small>${esc(nx.course)} · ${esc(nx.universityShort)}</small></button>` : "–"}</dd></div>
      <div class="stat"><dt>${esc(T("programs"))}</dt><dd><b>${D.programs.length}</b></dd></div>
      <div class="stat"><dt>${esc(T("cities"))}</dt><dd><b>${cities}</b></dd></div>
      <div class="stat"><dt>${esc(T("openApps"))}</dt><dd><b>${mine}</b><small>${esc(T("yourApps"))} · ${esc(T("openAppsSub")(openPortals))}</small></dd></div>`;
  }

  function renderToday() {
    const items = [];
    const t = todayISO();
    // 1) Fristen in den nächsten 45 Tagen
    const grouped = {};
    D.programs.filter(p => p.applicationDeadline && p.deadlineExact && !isPast(p.applicationDeadline, p.deadlineTime) && daysUntil(p.applicationDeadline) <= 45)
      .forEach(p => { const k = p.universityShort + p.applicationDeadline; (grouped[k] = grouped[k] || []).push(p); });
    Object.values(grouped).forEach(ps => { const p = ps[0];
      items.push({ d: p.applicationDeadline, html: `<b>${esc(dmy(p.applicationDeadline))}${p.deadlineTime ? ", " + esc(p.deadlineTime) : ""}</b> Frist ${esc(p.universityShort)} · ${esc(ps.map(x => x.course).join(" + "))} <em>(${esc(countdown(p.applicationDeadline, p.deadlineTime))})</em>`, open: p.id }); });
    // 2) Portale, die in den nächsten 31 Tagen öffnen
    const seen = new Set();
    D.programs.filter(p => p.applicationOpen && p.applicationOpen > t && daysUntil(p.applicationOpen) <= 31).forEach(p => {
      const key = p.universityShort + p.applicationOpen; if (seen.has(key)) return; seen.add(key);
      items.push({ d: p.applicationOpen, html: `<b>${esc(dmy(p.applicationOpen))}</b> Bewerbung öffnet: ${esc(p.universityShort)} – Account anlegen`, open: p.id });
    });
    // 3) Beratungstermine in den nächsten 21 Tagen
    D.events.filter(e => e.date && e.exact && !isPast(e.endDate || e.date, e.endTime || e.time) && daysUntil(e.date) <= 21).forEach(e =>
      items.push({ d: e.date, html: `<b>${esc(dmy(e.date))}${e.time ? " · " + esc(e.time) : ""}</b> ${esc(e.title)} – ${esc(e.university)}${e.registration && /Anmeldung/.test(e.registration) ? " <em>(Anmeldung!)</em>" : ""}`, href: "#termine" }));
    items.sort((a, b) => a.d.localeCompare(b.d));
    // 4) Dauerhafte Aufgabe: uni-assist früh starten
    const needUA = D.programs.some(p => p.internationalApplication.route === "uni-assist" && deadlineState(p) !== "closed");
    if (needUA) items.push({ d: "z", html: `<b>Daueraufgabe</b> uni-assist/VPD für BURG, UdK, HAW, Hannover früh beantragen (4–6 Wochen)`, href: "#ukraine" });
    $("#todayList").innerHTML = items.slice(0, 7).map(i => `<li>${i.open ? `<button type="button" class="today-item" data-open="${i.open}">${i.html}</button>` : `<a class="today-item" href="${i.href}">${i.html}</a>`}</li>`).join("") || `<li class="muted">–</li>`;
  }

  function renderStaleBanner() {
    const stale = D.programs.filter(isStale);
    const el = $("#staleBanner");
    if (!stale.length) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = `<b>${esc(T("stale"))}</b> Die Daten wurden am ${esc(dmy(D.researchDate))} geprüft – das ist über ${D.staleAfterDays} Tage her. Vor jeder Abgabe bitte die offizielle Quelle öffnen.`;
  }

  /* ==========================================================================
     KARTE
     ========================================================================== */
  const R = Math.PI / 180;
  const project = (lon, lat) => [MAP.pad + (lon * R - MAP.minX) * MAP.k, MAP.pad + (MAP.maxY - Math.log(Math.tan(Math.PI / 4 + lat * R / 2))) * MAP.k];
  const mapState = { city: null };
  function cityStats(cid) {
    const ps = D.programs.filter(p => p.city === cid);
    const best = Math.max(...ps.map(p => p._match.score));
    const next = ps.filter(p => p.applicationDeadline && p.deadlineExact && !isPast(p.applicationDeadline, p.deadlineTime)).sort((a, b) => a.applicationDeadline.localeCompare(b.applicationDeadline))[0];
    return { ps, best, next };
  }
  function renderMap() {
    const stage = $("#mapStage");
    const W = MAP.W, H = MAP.H;
    const cids = [...new Set(D.programs.map(p => p.city))];
    const pts = cids.map(c => { const [x, y] = project(D.cities[c].lon, D.cities[c].lat); return { c, x, y, ...cityStats(c) }; });
    const [hx, hy] = project(D.home.lon, D.home.lat);
    const scale = Math.max(0.2, (stage.clientWidth || 400) / W);
    const px = v => v / scale; // CSS-Pixel → SVG-Einheiten
    // Treffer-Radius: ≥ 22 CSS-px, aber nicht größer als halber Abstand zum Nachbarn
    pts.forEach(p => {
      const nn = Math.min(...pts.filter(q => q !== p).map(q => Math.hypot(q.x - p.x, q.y - p.y)), Math.hypot(hx - p.x, hy - p.y));
      p.hit = Math.max(px(12), Math.min(px(22), nn / 2));
      p.r = px(5 + Math.min(4, p.ps.length));
    });
    const fs = px(12.5);
    // Label-Platzierung (gierig, ohne Überlappung)
    const boxes = pts.map(p => ({ x: p.x - p.r, y: p.y - p.r, w: 2 * p.r, h: 2 * p.r }));
    boxes.push({ x: hx - px(7), y: hy - px(7), w: px(14), h: px(14) });
    const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const labelOf = p => D.cities[p.c].name.replace(" (Saale)", "").replace(" am Main", "").replace(" (Hof)", "");
    const order = [...pts].sort((a, b) => (b.c === mapState.city) - (a.c === mapState.city) || b.ps.length - a.ps.length);
    const homeLabel = { text: "Aschaffenburg", x: hx + px(10), y: hy + px(4), anchor: "start" };
    {
      const w = homeLabel.text.length * fs * 0.52;
      boxes.push({ x: homeLabel.x, y: homeLabel.y - fs * 0.8, w, h: fs });
    }
    order.forEach(p => {
      const text = labelOf(p) + (p.ps.length > 1 ? ` · ${p.ps.length}` : "");
      const w = text.length * fs * 0.52, h = fs, g = p.r + px(4);
      const cands = [[g, h * 0.35, "start"], [-g, h * 0.35, "end"], [0, -g - h * 0.1, "middle"], [0, g + h * 0.8, "middle"], [g * 0.8, -g * 0.6, "start"], [-g * 0.8, -g * 0.6, "end"], [g * 0.8, g + h * 0.4, "start"], [-g * 0.8, g + h * 0.4, "end"]];
      for (const [dx, dy, anchor] of cands) {
        const x = p.x + dx, y = p.y + dy;
        const bx = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
        const box = { x: bx - px(2), y: y - h * 0.82, w: w + px(4), h: h + px(1) };
        if (box.x < 0 || box.x + box.w > W || box.y < 0 || box.y + box.h > H) continue;
        if (boxes.some(b => overlaps(b, box))) continue;
        boxes.push(box); p.label = { text, x, y, anchor }; break;
      }
    });
    const color = s => (s >= 80 ? "var(--accent)" : s >= 70 ? "var(--cream-2)" : "var(--dim)");
    stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="germany" role="group" aria-label="Deutschlandkarte mit ${pts.length} Hochschulstädten">
      <defs><radialGradient id="gland" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#f4f7f9"/><stop offset="1" stop-color="#dfe7ec"/></radialGradient></defs>
      <path d="${MAP.d}" class="land" fill="url(#gland)"/>
      <g class="home" transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})" aria-hidden="true">
        <circle r="${px(7)}" class="home-ring"/><circle r="${px(2.4)}" class="home-dot"/>
      </g>
      <text class="map-label home-label" x="${homeLabel.x.toFixed(1)}" y="${homeLabel.y.toFixed(1)}" style="font-size:${fs.toFixed(1)}px">Aschaffenburg</text>
      ${pts.map(p => {
        const active = mapState.city === p.c;
        const nextTxt = p.next ? `nächste Frist ${dmy(p.next.applicationDeadline)}` : "nächste Frist noch nicht veröffentlicht";
        return `<g class="pin${active ? " active" : ""}${mapState.city && !active ? " dim" : ""}" data-city="${p.c}" tabindex="0" role="button" aria-pressed="${active}" aria-label="${esc(D.cities[p.c].name)}: ${p.ps.length} ${p.ps.length === 1 ? "Studiengang" : "Studiengänge"}, ${esc(nextTxt)}, ${p._km || km(D.home, D.cities[p.c])} km">
          <circle class="hit" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.hit.toFixed(1)}"/>
          ${active ? `<circle class="halo" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.r + px(7)).toFixed(1)}"/>` : ""}
          <circle class="dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" style="fill:${color(p.best)}"/>
          ${p.label ? `<text class="map-label" x="${p.label.x.toFixed(1)}" y="${p.label.y.toFixed(1)}" text-anchor="${p.label.anchor}" style="font-size:${fs.toFixed(1)}px">${esc(p.label.text)}</text>` : ""}
        </g>`;
      }).join("")}
    </svg>`;
  }
  function renderCityPanel() {
    const el = $("#cityPanel");
    if (!mapState.city) {
      el.innerHTML = `<p class="muted small">${L() === "ua" ? "Обери місто на мапі." : "Wähle eine Stadt auf der Karte."}</p>`;
      return;
    }
    const c = mapState.city, st = cityStats(c);
    const ps = st.ps.sort((a, b) => b._match.score - a._match.score);
    el.innerHTML = `<div class="cp-head"><div><p class="eyebrow">${esc(D.cities[c].name)}</p><h3>${ps.length} ${ps.length === 1 ? "Studiengang" : "Studiengänge"}</h3>
      <p class="small muted">${esc(T("km")(km(D.home, D.cities[c])))} · ${st.next ? `nächste Frist <b>${esc(dmy(st.next.applicationDeadline))}</b> (${esc(countdown(st.next.applicationDeadline, st.next.deadlineTime))})` : "nächste Frist noch nicht veröffentlicht"}</p></div>
      <button type="button" class="text-btn" data-clear-city>× ${esc(T("cityRemove"))}</button></div>
      <ul class="cp-list">${ps.map(p => `<li><button type="button" data-open="${p.id}"><span class="cp-match">${p._match.score}%</span><span><b>${esc(p.course)}</b><small>${esc(p.universityShort)} · ${esc(deadlineShort(p))}</small></span></button></li>`).join("")}</ul>`;
  }
  function setCity(c) {
    mapState.city = mapState.city === c ? null : c;
    renderMap(); renderCityPanel(); renderPrograms();
  }

  /* ------------------------------------------------------------ Tooltip (Desktop-Hover) */
  function initMapTip() {
    const stage = $("#mapStage"), tip = $("#mapTip");
    stage.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const g = e.target.closest(".pin");
      if (!g) { tip.hidden = true; return; }
      const c = g.dataset.city, st = cityStats(c);
      tip.innerHTML = `<b>${esc(D.cities[c].name)}</b><br>${st.ps.length} ${st.ps.length === 1 ? "Studiengang" : "Studiengänge"} · bis ${st.best}% Match<br>${st.next ? "nächste Frist " + dmy(st.next.applicationDeadline) : "Frist noch offen"}`;
      const r = stage.parentElement.getBoundingClientRect();
      tip.style.left = `${Math.min(r.width - 190, e.clientX - r.left + 14)}px`;
      tip.style.top = `${e.clientY - r.top + 14}px`;
      tip.hidden = false;
    });
    stage.addEventListener("pointerleave", () => { tip.hidden = true; });
  }

  /* ==========================================================================
     DEADLINE-RADAR
     ========================================================================== */
  function radarItems() {
    const favOnly = $("#radarFavOnly").checked;
    const items = [];
    D.programs.forEach(p => {
      if (favOnly && !S().fav[p.id]) return;
      items.push({ p, ms: null, state: deadlineState(p), key: sortKey(p) });
      (p.milestones || []).filter(m => m.radar && m.date && m.exact).forEach(m => {
        items.push({ p, ms: m, state: isPast(m.date) ? "closed" : daysUntil(m.date) <= 30 ? "now" : daysUntil(m.date) <= 90 ? "soon" : "later", key: m.date });
      });
    });
    return items;
  }
  function renderRadar() {
    const groups = ["now", "soon", "later", "unpublished", "closed"];
    const items = radarItems();
    const html = groups.map(g => {
      const list = items.filter(i => i.state === g).sort((a, b) => g === "closed" ? b.key.localeCompare(a.key) : a.key.localeCompare(b.key));
      if (!list.length) return "";
      const rows = list.map(({ p, ms }) => {
        const exact = ms ? true : (p.applicationDeadline && p.deadlineExact);
        const date = ms ? ms.date : p.applicationDeadline;
        const time = ms ? null : p.deadlineTime;
        const basis = ms ? "" : p.deadlineBasis === "annual" ? T("annual") : p.deadlineBasis === "published" ? T("published") : "";
        const when = exact ? `<span class="r-date">${esc(dmy(date).slice(0, 6))}<small>${esc(date.slice(0, 4))}</small></span>` : `<span class="r-date approx">≈<small>${esc(T("approx"))}</small></span>`;
        const cd = exact ? countdown(date, time) : "";
        return `<li class="r-item ${g}${S().fav[p.id] ? " is-fav" : ""}">
          ${when}
          <button type="button" class="r-main" data-open="${p.id}">
            <b>${esc(ms ? ms.label : p.course)}</b>
            <span>${esc(p.universityShort)} · ${esc(cityName(p.city))}</span>
            <span class="r-meta">${exact ? `${esc(dmy(date))}${time ? ", " + esc(time) + " Uhr" : ""}${!time && !ms ? " · " + esc(T("noTime")) : ""}${basis ? " · " + esc(basis) : ""}` : esc(p.deadlineText)}</span>
          </button>
          <span class="r-side">${cd ? `<span class="r-cd">${esc(cd)}</span>` : ""}${exact && g !== "closed" ? `<button type="button" class="ics-btn" data-ics="${p.id}"${ms ? ` data-ms="${ms.date}"` : ""} aria-label="${esc(T("ics"))}: ${esc(p.course)}" title="${esc(T("ics"))}">${CAL}</button>` : ""}</span>
        </li>`;
      }).join("");
      const pref = (S().prefs.radarOpen || {})[g];
      const isOpen = pref !== undefined ? pref : (g === "now" || g === "soon");
      const first = list[0], fp = first.p, fd = first.ms ? first.ms.date : fp.applicationDeadline;
      const preview = isOpen ? "" : `<span class="r-preview">${fd && g !== "unpublished" ? esc(dmy(fd)) + " · " : ""}${esc(first.ms ? first.ms.label : fp.course)} – ${esc(fp.universityShort)}${list.length > 1 ? " …" : ""}</span>`;
      return `<details class="r-group ${g}" data-group="${g}"${isOpen ? " open" : ""}><summary><span class="r-badge ${g}">${esc(STATE_LABEL(g))}</span>${preview}<span class="r-count">${list.length}</span></summary><ol>${rows}</ol></details>`;
    }).join("");
    $("#radarList").innerHTML = html || `<p class="muted">${esc(T("none"))}</p>`;
  }

  /* ==========================================================================
     FILTER, SORTIERUNG, KARTEN
     ========================================================================== */
  const filt = { cat: "all", toggles: new Set(), q: "", sort: "match" };
  const TOGGLES = [
    { id: "open", label: () => T("tOpen"), test: p => isOpenNow(p) },
    { id: "d30", label: () => T("t30"), test: p => p.applicationDeadline && p.deadlineExact && !isPast(p.applicationDeadline, p.deadlineTime) && daysUntil(p.applicationDeadline) < 30 },
    { id: "nointern", label: () => T("tNoIntern"), test: p => p.internship.required === false },
    { id: "counsel", label: () => T("tCounsel"), test: p => p.counselling.length > 0 },
    { id: "near", label: () => T("tNear") + ` (≤ ${D.nearKm} km)`, test: p => p._km <= D.nearKm },
    { id: "fav", label: () => T("tFav"), test: p => !!S().fav[p.id] || S().status[p.id] === "favorit" }
  ];
  function renderFilters() {
    const cats = [["all", T("all")], ...Object.entries(D.categories).map(([k, v]) => [k, v.label])];
    $("#catChips").innerHTML = cats.map(([k, l]) => `<button type="button" class="chip${filt.cat === k ? " on" : ""}" data-cat="${k}" aria-pressed="${filt.cat === k}">${esc(l)} <span class="chip-n">${k === "all" ? D.programs.length : D.programs.filter(p => p.tags.includes(k)).length}</span></button>`).join("");
    $("#toggleChips").innerHTML = TOGGLES.map(t => `<button type="button" class="chip tog${filt.toggles.has(t.id) ? " on" : ""}" data-toggle="${t.id}" aria-pressed="${filt.toggles.has(t.id)}">${esc(t.label())}</button>`).join("");
  }
  function filtered() {
    let ps = D.programs.slice();
    if (mapState.city) ps = ps.filter(p => p.city === mapState.city);
    if (filt.cat !== "all") ps = ps.filter(p => p.tags.includes(filt.cat));
    filt.toggles.forEach(id => { const t = TOGGLES.find(x => x.id === id); ps = ps.filter(t.test); });
    if (filt.q) {
      const q = filt.q.toLowerCase();
      ps = ps.filter(p => [p.course, p.university, p.universityShort, cityName(p.city), p.degree, p.courseNote].join(" ").toLowerCase().includes(q));
    }
    const by = {
      match: (a, b) => b._match.score - a._match.score,
      deadline: (a, b) => {
        const ca = deadlineState(a) === "closed", cb = deadlineState(b) === "closed";
        return ca - cb || sortKey(a).localeCompare(sortKey(b)) || b._match.score - a._match.score;
      },
      distance: (a, b) => a._km - b._km || b._match.score - a._match.score,
      city: (a, b) => cityName(a.city).localeCompare(cityName(b.city), "de") || b._match.score - a._match.score,
      university: (a, b) => a.university.localeCompare(b.university, "de") || a.course.localeCompare(b.course, "de")
    };
    return ps.sort(by[filt.sort]);
  }
  function statusLabel(id) { const s = D.cockpitStatuses.find(x => x.id === id); return s ? s.label : ""; }
  function card(p) {
    const st = deadlineState(p), fav = !!S().fav[p.id], my = S().status[p.id];
    const cat = D.categories[p.category];
    const exact = p.applicationDeadline && p.deadlineExact;
    return `<article class="pcard${fav ? " is-fav" : ""}" id="card-${p.id}">
      <div class="pc-top">
        <span class="pc-cat">${esc(cat.short)}</span>
        <button type="button" class="fav-btn" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${esc(fav ? T("favRemove") : T("favAdd"))}: ${esc(p.course)}">${fav ? "★" : "☆"}</button>
      </div>
      <div class="pc-match" title="${esc(T("match"))}"><b>${p._match.score}</b><span>%</span><small>${esc(T("match"))}</small></div>
      <h3 class="pc-title">${esc(p.course)}</h3>
      <p class="pc-uni">${esc(p.university)}</p>
      <p class="pc-meta">${esc(cityName(p.city))} · ${esc(T("km")(p._km))}<br>${esc(p.degree)}</p>
      <div class="pc-deadline ${st}">
        <span class="r-badge ${st}">${esc(STATE_LABEL(st))}</span>
        <span class="pc-dl"><small>${esc(T("deadline"))}</small>${esc(deadlineShort(p))}${exact ? ` <em>${esc(countdown(p.applicationDeadline, p.deadlineTime))}</em>` : ""}</span>
      </div>
      <ul class="pc-tags">${tagsFor(p).map(t => `<li class="${t.warn ? "warn" : ""}">${esc(t.t)}</li>`).join("")}</ul>
      ${my ? `<p class="pc-status">● ${esc(statusLabel(my))}</p>` : ""}
      ${isStale(p) ? `<p class="pc-stale">⚠ ${esc(T("stale"))}</p>` : ""}
      <div class="pc-actions">
        <button type="button" class="btn primary" data-open="${p.id}">${esc(T("details"))}</button>
        <a class="btn ghost" href="${esc(p.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(T("official"))} ↗</a>
      </div>
    </article>`;
  }
  function renderPrograms() {
    const ps = filtered();
    const af = [];
    if (mapState.city) af.push(`${esc(D.cities[mapState.city].name)} <button type="button" class="x" data-clear-city aria-label="${esc(T("cityRemove"))}">×</button>`);
    $("#activeFilter").innerHTML = `<span>${esc(T("results")(ps.length, D.programs.length))}</span>${af.map(a => `<span class="af">${a}</span>`).join("")}${(filt.cat !== "all" || filt.toggles.size || filt.q || mapState.city) ? `<button type="button" class="text-btn" data-reset>${esc(T("reset"))}</button>` : ""}`;
    $("#programGrid").innerHTML = ps.length ? ps.map(card).join("") : `<div class="empty">${esc(T("none"))} <button type="button" class="text-btn" data-reset>${esc(T("reset"))}</button></div>`;
  }

  /* ==========================================================================
     DETAILANSICHT
     ========================================================================== */
  let lastOpener = null, lastOpenId = null;
  const yesNo = v => v === true ? "ja" : v === false ? "nein" : "bitte prüfen";
  function row(label, value, cls = "") { return value ? `<div class="kv ${cls}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : ""; }
  function thumbs(ids) {
    return `<ul class="thumbs">${ids.filter(id => D.works[id]).map(id => `<li><img src="./img/${id}.webp" alt="" loading="lazy" width="120" height="150"><span>${esc(D.works[id].title)}</span></li>`).join("")}</ul>`;
  }
  function openProgram(id, opener) {
    const p = P(id); if (!p) return;
    lastOpener = opener || document.activeElement; lastOpenId = id;
    const st = deadlineState(p), m = p._match, my = S().status[p.id] || "", fav = !!S().fav[p.id];
    const exact = p.applicationDeadline && p.deadlineExact;
    const evs = p.counselling.map(eid => D.events.find(e => e.id === eid)).filter(Boolean);
    const reqDone = S().req[p.id] || {};
    $("#dlgCrumb").textContent = `${cityName(p.city)} · ${D.categories[p.category].label}`;
    $("#dialogContent").innerHTML = `
      <header class="dlg-head">
        <p class="eyebrow">${esc(p.university)}</p>
        <h2 id="dlgTitle">${esc(p.course)}</h2>
        <dl class="dlg-facts">
          ${p.languageRequirements && p.languageRequirements.application ? row("Deutsch zur Bewerbung", p.languageRequirements.application) : ""}${row("Studiengang", p.course + (p.courseNote ? " – " + p.courseNote : ""))}${row("Abschluss", p.degree)}${row("Stadt", `${cityName(p.city)} · ${T("km")(p._km)}`)}${row("Startsemester", p.startSemester)}
        </dl>
        ${L() === "ua" ? `<p class="ua-note">${esc(T("uaNote"))}</p>` : ""}
        <div class="dlg-actions">
          <a class="btn primary" href="${esc(p.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(T("official"))} ↗</a>
          ${p.portal ? `<a class="btn ghost" href="${esc(p.portal.url)}" target="_blank" rel="noopener noreferrer">${esc(p.portal.label)} ↗</a>` : ""}
          ${exact && st !== "closed" ? `<button type="button" class="btn ghost" data-ics="${p.id}">${esc(T("ics"))}</button>` : ""}
          <button type="button" class="btn ghost fav-btn-wide" data-fav="${p.id}" aria-pressed="${fav}">${fav ? "★ " + esc(T("favRemove")) : "☆ " + esc(T("favAdd"))}</button>
        </div>
      </header>

      <section class="dlg-sec deadline-sec ${st}">
        <h3>Frist</h3>
        <p class="big-deadline"><span class="r-badge ${st}">${esc(STATE_LABEL(st))}</span> ${esc(p.deadlineText)}${exact ? ` <em>(${esc(countdown(p.applicationDeadline, p.deadlineTime))})</em>` : ""}</p>
        <p class="small">${p.applicationOpenText ? `Bewerbungsstart: ${esc(p.applicationOpenText)}. ` : ""}${exact ? (p.deadlineBasis === "annual" ? "Feste jährliche Frist laut Hochschule. " : "Datum offiziell veröffentlicht. ") + (p.deadlineTime ? "" : T("noTime") + ".") : "Kein exaktes Datum veröffentlicht – deshalb kein Kalendereintrag."}</p>
        ${p.deadlineNote ? `<p class="note">${esc(p.deadlineNote)}</p>` : ""}
        ${(p.milestones || []).length ? `<ul class="milestones">${p.milestones.map(ms => `<li class="${ms.date && isPast(ms.date) ? "past" : ""}"><span>${ms.date ? esc(dmy(ms.date)) : "–"}</span> ${esc(ms.label)} ${ms.date && ms.exact && !isPast(ms.date) ? `<button type="button" class="ics-btn" data-ics="${p.id}" data-ms="${ms.date}" aria-label="${esc(T("ics"))}">${CAL}</button>` : ""}</li>`).join("")}</ul>` : ""}
      </section>

      <section class="dlg-sec">
        <h3>Warum passt das zu dir?</h3>
        <p>${esc(p.why)}</p>
        <div class="match-box">
          <div class="mb-score"><b>${m.score}%</b><span>${esc(T("match"))}</span></div>
          <div class="mb-explain small">Abdeckung ${m.coverage}% · Schwerpunkt Textil/Kleidung ${m.focus}% <button type="button" class="text-btn small" data-howmatch>Wie wird das berechnet?</button></div>
          <ul class="mb-bars">${m.parts.map(x => `<li><span>${esc(D.strengths[x.key].label)}</span><i aria-hidden="true"><b style="width:${Math.round(x.strength * 100)}%"></b></i><em>${"●".repeat(x.weight)}${"○".repeat(3 - x.weight)}</em></li>`).join("")}</ul>
          <p class="small muted">Balken = wie stark das Kriterium in deinem heutigen Portfolio ist · Punkte = wie wichtig es für diesen Studiengang ist. Keine Zulassungschance.</p>
        </div>
      </section>

      <section class="dlg-sec">
        <h3>Bewerbung einfach erklärt</h3>
        <ol class="steps">${p.steps.map((s, i) => `<li><span class="step-n">${i + 1}</span><div><b>${esc(s.title)}</b>${s.text ? `<p>${esc(s.text)}</p>` : ""}</div></li>`).join("")}</ol>
      </section>

      <section class="dlg-sec">
        <h3>Mappe <small>– offizielle Angaben der Hochschule</small></h3>
        <dl class="kv-grid">
          ${row("benötigt?", yesNo(p.portfolio.required))}${row("digital / physisch", p.portfolio.type)}${row("Umfang", p.portfolio.count)}${row("Dateiformat", p.portfolio.format)}${row("max. Dateigröße", p.portfolio.maxSize)}${row("Videos", p.portfolio.video)}${row("Prozessarbeiten", p.portfolio.process)}${row("Skizzenbuch", p.portfolio.sketchbook)}${row("Eigene Aufgabe / Vorgaben", p.portfolio.ownTask)}${row("Hausaufgabe", (p.homework.required === true ? "ja – " : p.homework.required === false ? "nein – " : "") + p.homework.text)}${row("Deadline der Mappe", p.portfolio.deadlineText)}
        </dl>
      </section>

      <section class="dlg-sec reco">
        <h3>Empfehlung für deine Mappe</h3>
        <p class="reco-note">Das ist unsere Ableitung aus deinem Portfolio – <b>keine Vorgabe der Hochschule</b>.</p>
        <h4>Stark für diese Bewerbung</h4>${thumbs(p.suggestedWorks)}
        ${p.supplement || (p.supplementWorks || []).length ? `<h4>Ergänzend</h4>${p.supplement ? `<p>${esc(p.supplement)}</p>` : ""}${thumbs(p.supplementWorks || [])}` : ""}
        <h4>Noch erstellen</h4><ul class="todo-list">${p.missingPortfolioElements.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      </section>

      ${window.MusterUI ? window.MusterUI.section(p) : ""}

      <section class="dlg-sec">
        <h3>Voraussetzungen</h3>
        <dl class="kv-grid">
          ${row("Eignungsprüfung", p.aptitudeTest.text)}${row("Vorpraktikum", (p.internship.required === true ? "ja – " : p.internship.required === false ? "nein – " : "") + p.internship.text)}${row("Deutsch bei Bewerbung", p.languageRequirements.application)}${row("Deutsch bei Studienstart", p.languageRequirements.start)}${row("Ausländisches Zeugnis", p.internationalApplication.text)}${row("Ohne volle HZB?", p.withoutHZB)}${row("Kosten", p.fees)}
        </dl>
        ${p.warnings.length ? `<ul class="warn-list">${p.warnings.map(w => `<li>⚠ ${esc(w)}</li>`).join("")}</ul>` : ""}
      </section>

      ${window.KostenUI ? window.KostenUI.block(p) : ""}
      ${window.StimmenUI ? window.StimmenUI.block(p) : ""}

      <section class="dlg-sec">
        <h3>Von dieser Hochschule verlangt</h3>
        <ul class="req-list">${p.requirements.map((r, i) => `<li><label><input type="checkbox" data-req="${p.id}" data-idx="${i}"${reqDone[i] ? " checked" : ""}> <span>${esc(r)}</span></label></li>`).join("")}</ul>
      </section>

      ${evs.length ? `<section class="dlg-sec"><h3>Mappenberatung &amp; Termine</h3><ul class="ev-mini">${evs.map(e => `<li class="${e.date && isPast(e.endDate || e.date, e.time) ? "past" : ""}"><b>${e.date ? esc(dmy(e.date)) + (e.time ? " · " + esc(e.time) : "") : esc(e.recurring)}</b> ${esc(e.title)} <span class="muted">(${esc(e.mode)})</span>${e.registration ? `<br><small>${esc(e.registration)}</small>` : ""}</li>`).join("")}</ul></section>` : ""}

      <section class="dlg-sec cockpit-sec">
        <h3>Mein Cockpit</h3>
        <label class="field"><span>${esc(T("statusLabel"))}</span>
          <select data-status="${p.id}">${D.cockpitStatuses.map(s => `<option value="${s.id}"${s.id === my ? " selected" : ""}>${esc(s.label)}</option>`).join("")}</select></label>
        <label class="field"><span>${esc(T("noteLabel"))}</span>
          <textarea data-note="${p.id}" rows="4" placeholder="${esc(T("notePh"))}">${esc(S().notes[p.id] || "")}</textarea></label>
      </section>

      <section class="dlg-sec sources-sec">
        <h3>Offizielle Quellen</h3>
        <p class="small ${isStale(p) ? "stale-txt" : "muted"}">${esc(T("checked"))}: ${esc(dmy(p.lastVerified))}${isStale(p) ? " – " + esc(T("stale")) : ""}</p>
        <ul class="src-list">${p.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span class="src-badge">offiziell</span> ${esc(s.label)} ↗</a><small>${esc(new URL(s.url).hostname)} · geprüft ${esc(dmy(s.checked))}</small></li>`).join("")}</ul>
      </section>`;
    const dlg = $("#programDialog");
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    $("#dialogContent").scrollTop = 0; dlg.scrollTop = 0;
    $("#dlgTitle").setAttribute("tabindex", "-1"); $("#dlgTitle").focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, "", "#p=" + p.id);
  }
  function closeDialog() {
    const dlg = $("#programDialog");
    if (dlg.open) { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
  }

  /* ==========================================================================
     COCKPIT
     ========================================================================== */
  function renderCockpit() {
    const all = $("#cockpitAll").checked;
    const st = S().status;
    const order = D.cockpitStatuses.map(s => s.id);
    let ps = D.programs.filter(p => all || st[p.id] || S().fav[p.id] || S().notes[p.id]);
    ps.sort((a, b) => (order.indexOf(st[b.id] || "") - order.indexOf(st[a.id] || "")) || sortKey(a).localeCompare(sortKey(b)));
    const counts = {}; Object.values(st).forEach(s => { if (s) counts[s] = (counts[s] || 0) + 1; });
    $("#cockpitSummary").innerHTML = D.cockpitStatuses.filter(s => s.id).map(s => `<span class="cs${counts[s.id] ? " has" : ""}"><b>${counts[s.id] || 0}</b>${esc(s.label)}</span>`).join("");
    if (!ps.length) {
      $("#cockpitList").innerHTML = `<div class="empty">Noch nichts gemerkt. Öffne einen Studiengang und setze einen Status, einen ★ oder eine Notiz – oder <button type="button" class="text-btn" data-cockpit-all>zeige alle Studiengänge</button>.</div>`;
      return;
    }
    $("#cockpitList").innerHTML = `<div class="ck-table" role="table" aria-label="Bewerbungs-Cockpit">
      <div class="ck-row ck-headrow" role="row"><span role="columnheader">Studiengang</span><span role="columnheader">Frist</span><span role="columnheader">Status</span><span role="columnheader">Notiz</span></div>
      ${ps.map(p => {
        const s = deadlineState(p), note = S().notes[p.id] || "";
        return `<div class="ck-row" role="row">
          <span role="cell" class="ck-prog"><button type="button" class="fav-btn sm" data-fav="${p.id}" aria-pressed="${!!S().fav[p.id]}" aria-label="${esc(S().fav[p.id] ? T("favRemove") : T("favAdd"))}">${S().fav[p.id] ? "★" : "☆"}</button><button type="button" class="link" data-open="${p.id}"><b>${esc(p.course)}</b><small>${esc(p.universityShort)} · ${esc(cityName(p.city))}</small></button></span>
          <span role="cell" class="ck-dl"><span class="r-badge ${s}">${esc(STATE_LABEL(s))}</span><small>${esc(deadlineShort(p))}</small></span>
          <span role="cell"><label class="sr-only" for="st-${p.id}">${esc(T("statusLabel"))}</label><select id="st-${p.id}" data-status="${p.id}">${D.cockpitStatuses.map(x => `<option value="${x.id}"${x.id === (st[p.id] || "") ? " selected" : ""}>${esc(x.label)}</option>`).join("")}</select></span>
          <span role="cell" class="ck-note">${note ? esc(note.length > 90 ? note.slice(0, 90) + "…" : note) : `<button type="button" class="text-btn small" data-open="${p.id}">+ Notiz</button>`}</span>
        </div>`;
      }).join("")}</div>`;
  }

  /* ==========================================================================
     PORTFOLIO
     ========================================================================== */
  function renderPortfolio() {
    $("#strengthBars").innerHTML = Object.entries(D.strengths).map(([k, s]) => `<div class="bar"><span class="bar-l">${esc(s.label)}${CORE.includes(k) ? ' <i class="core" title="Kernpraxis">◆</i>' : ""}</span><span class="bar-v">${Math.round(s.v * 100)} %</span><span class="bar-t" aria-hidden="true"><b style="width:${Math.round(s.v * 100)}%"></b></span><small>${esc(s.note)}</small></div>`).join("") +
      `<p class="small muted mt">◆ = Kernpraxis. Der Portfolio-Match kombiniert, wie gut du die Inhalte eines Studiengangs abdeckst (65 %), mit der Frage, ob Textil/Kleidung dort im Zentrum steht (35 %). <button type="button" class="text-btn small" data-howmatch>Details</button></p>`;
    const cnt = {};
    D.programs.forEach(p => p.suggestedWorks.forEach(w => cnt[w] = (cnt[w] || 0) + 1));
    const ids = Object.keys(D.works).filter(id => cnt[id]).sort((a, b) => cnt[b] - cnt[a]);
    $("#workGallery").innerHTML = ids.map(id => `<figure><img src="./img/${id}.webp" alt="${esc(D.works[id].title)} – ${esc(D.works[id].tech)}" loading="lazy" width="180" height="230"><figcaption><b>${esc(D.works[id].title)}</b><small>${esc(D.works[id].year)} · ${esc(D.works[id].kind === "textil" ? "Textil" : "Malerei")} · in ${cnt[id]} Empfehlungen</small></figcaption></figure>`).join("");
  }

  /* ==========================================================================
     TERMINE
     ========================================================================== */
  function renderEvents() {
    const showPast = $("#evPast").checked, favOnly = $("#evFav").checked;
    let evs = D.events.filter(e => !favOnly || e.programIds.some(id => S().fav[id]));
    const dated = evs.filter(e => e.date).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const rec = evs.filter(e => !e.date);
    const pastOf = e => isPast(e.endDate || e.date, e.endTime || e.time);
    const list = dated.filter(e => showPast || !pastOf(e));
    let lastMonth = "";
    const html = list.map(e => {
      const mkey = e.date.slice(0, 7);
      const head = mkey !== lastMonth ? `<li class="ev-month">${esc(MONTHS[L()][Number(e.date.slice(5, 7)) - 1])} ${esc(e.date.slice(0, 4))}</li>` : "";
      lastMonth = mkey;
      const past = pastOf(e);
      return head + `<li class="ev${past ? " past" : ""}">
        <span class="ev-date"><b>${esc(e.date.slice(8, 10))}</b><small>${esc(weekday(e.date))}${e.endDate ? "–" + esc(dmy(e.endDate).slice(0, 5)) : ""}</small></span>
        <div class="ev-body">
          <b>${esc(e.title)}</b>
          <span>${esc(e.university)} · ${esc(cityName(e.city))}</span>
          <span class="ev-meta">${e.time ? esc(e.time) + (e.endTime ? "–" + esc(e.endTime) : "") + " Uhr · " : "Uhrzeit nicht angegeben · "}${esc(e.mode)}${e.place ? " · " + esc(e.place) : ""}</span>
          ${e.registration && !/^(–|keine Angabe)$/.test(e.registration) ? `<span class="ev-reg">${esc(e.registration)}</span>` : ""}
          ${e.note ? `<span class="ev-note">${esc(e.note)}</span>` : ""}
          <span class="ev-links"><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer"><span class="src-badge">offiziell</span> Quelle ↗</a>${e.programIds.map(id => `<button type="button" class="text-btn small" data-open="${id}">${esc(P(id).course)}</button>`).join("")}</span>
        </div>
        ${!past && e.exact ? `<button type="button" class="ics-btn" data-ics-ev="${e.id}" aria-label="${esc(T("ics"))}: ${esc(e.title)}" title="${esc(T("ics"))}">${CAL}</button>` : ""}
      </li>`;
    }).join("");
    $("#eventList").innerHTML = `<ol class="ev-list">${html || `<li class="muted">Keine Termine.</li>`}</ol>
      ${rec.length ? `<h3 class="h4 mt">Regelmäßig / nach Vereinbarung / noch offen</h3><ul class="ev-rec">${rec.map(e => `<li><b>${esc(e.university)}</b> · ${esc(e.title)}<br><span class="muted">${esc(e.recurring)} · ${esc(e.mode)}</span>${e.registration ? `<br><small>${esc(e.registration)}</small>` : ""}<br><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer"><span class="src-badge">offiziell</span> Quelle ↗</a></li>`).join("")}</ul>` : ""}`;
  }

  /* ==========================================================================
     UKRAINE, CHECKLISTE, GLOSSAR, QUELLEN
     ========================================================================== */
  function renderUkraine() {
    const U = D.ukraine;
    $("#uaIntro").textContent = U.intro;
    $("#uaSteps").innerHTML = U.steps.map(s => `<li><b>${esc(s.title)}</b><p>${esc(s.text)}</p></li>`).join("");
    const rows = D.programs.slice().sort((a, b) => a.university.localeCompare(b.university, "de") || a.course.localeCompare(b.course, "de"));
    $("#langTable").innerHTML = `<thead><tr><th scope="col">Studiengang</th><th scope="col">bei Bewerbung</th><th scope="col">bis Studienstart</th><th scope="col">Zeugnisprüfung</th></tr></thead><tbody>${rows.map(p => `<tr><th scope="row"><button type="button" class="link" data-open="${p.id}">${esc(p.universityShort)}<small>${esc(p.course)}</small></button></th><td>${esc(p.languageRequirements.application)}</td><td>${esc(p.languageRequirements.start)}</td><td>${esc({ "uni-assist": "uni-assist (VPD)", direkt: "direkt bei der Hochschule", hochschule: "Hochschule selbst", unklar: "bitte erfragen" }[p.internationalApplication.route])}</td></tr>`).join("")}</tbody>`;
    $("#uaSources").innerHTML = `<h3 class="h4">Offizielle Stellen</h3><ul class="src-list">${U.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><span class="src-badge">offiziell</span> ${esc(s.label)} ↗</a><small>${esc(new URL(s.url).hostname)} · geprüft ${esc(dmy(s.checked))}</small></li>`).join("")}</ul>`;
  }
  function renderChecklist() {
    const done = S().check; const ua = L() === "ua";
    const groups = [...new Set(D.checklist.map(c => c.group))];
    $("#checklist").innerHTML = groups.map(g => `<fieldset class="ck-group"><legend>${esc(g)}</legend>${D.checklist.filter(c => c.group === g).map(c => `<label class="ck-item${done[c.id] ? " done" : ""}"><input type="checkbox" data-check="${c.id}"${done[c.id] ? " checked" : ""}><span><b>${esc(c.title)}</b>${ua ? `<i lang="uk">${esc(c.ua)}</i>` : ""}<small>${esc(c.text)}</small></span></label>`).join("")}</fieldset>`).join("");
    const n = D.checklist.filter(c => done[c.id]).length;
    $("#checkProgress").innerHTML = `<span class="bar-t" aria-hidden="true"><b style="width:${Math.round(100 * n / D.checklist.length)}%"></b></span><span>${n} / ${D.checklist.length} erledigt</span>`;
  }
  function renderGlossary() {
    const ua = L() === "ua";
    $("#glossary").innerHTML = D.glossary.map(g => `<div class="gl"><dt>${esc(g.term)}</dt><dd>${esc(g.de)}${`<span class="gl-ua${ua ? " on" : ""}" lang="uk">${esc(g.ua)}</span>`}</dd></div>`).join("");
  }
  function renderSources() {
    $("#srcText").innerHTML = `Alle Angaben wurden am <b>${esc(dmy(D.researchDate))}</b> auf den offiziellen Seiten der Hochschulen geprüft. Fristen können sich ändern – vor jeder Abgabe die Quelle im Studiengang öffnen. Nach ${D.staleAfterDays} Tagen zeigt die Seite automatisch einen Prüf-Hinweis.`;
    $("#notIncluded").innerHTML = D.notIncluded.map(n => `<li><b>${esc(n.name)}:</b> ${esc(n.reason)}</li>`).join("");
  }
  function howMatch() {
    toastDialog(`<h2>Wie wird der Portfolio-Match berechnet?</h2>
      <p>Für jeden Studiengang ist festgelegt, wie wichtig ihm bestimmte Kriterien sind (0–3 Punkte). Für dein Portfolio ist geschätzt, wie stark jedes Kriterium heute sichtbar ist (0–100 %).</p>
      <ul><li><b>Abdeckung</b>: gewichteter Durchschnitt deiner Stärken über die Kriterien des Studiengangs.</li><li><b>Schwerpunkt</b>: Wie viel des Studiengangs dreht sich um deine Kernpraxis (Textil, Kleidung, Objekt, Handwerk)? Ab der Hälfte = 100 %.</li><li><b>Portfolio-Match</b> = 65 % Abdeckung + 35 % Schwerpunkt.</li></ul>
      <p><b>Wichtig:</b> Das ist keine Zulassungschance und keine Bewertung deiner Kunst. Hürden wie Vorpraktikum, Sprache oder Fristen stehen separat in den Hinweisen.</p>`);
  }
  function toastDialog(html) {
    lastOpener = document.activeElement;
    $("#dlgCrumb").textContent = "Portfolio-Match";
    $("#dialogContent").innerHTML = `<section class="dlg-sec info">${html}</section>`;
    const dlg = $("#programDialog"); if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }

  /* ==========================================================================
     EVENTS
     ========================================================================== */
  function rerenderAll() {
    applyStaticI18n();
    renderStats(); renderToday(); renderStaleBanner(); renderMap(); renderCityPanel(); renderRadar();
    renderFilters(); renderPrograms(); renderCockpit(); renderPortfolio(); renderEvents(); renderUkraine();
    renderChecklist(); renderGlossary(); renderSources();
    if (window.MusterUI) window.MusterUI.renderAll();
    if (window.KostenUI) window.KostenUI.render();
    if (window.StimmenUI) window.StimmenUI.render();
    if (window.Motion) window.Motion.render();
    if (window.TopPicks) window.TopPicks.render();
  }
  function refreshAfterStateChange() { renderStats(); renderRadar(); renderPrograms(); renderCockpit(); renderEvents(); }

  document.addEventListener("click", e => {
    const t = e.target;
    const city = t.closest(".pin"); if (city) { setCity(city.dataset.city); return; }
    const op = t.closest("[data-open]"); if (op) { e.preventDefault(); openProgram(op.dataset.open, op); if (op.dataset.muster) setTimeout(() => { const ms = $("#musterSec"); if (ms) ms.scrollIntoView({ block: "start" }); }, 60); return; }
    const fav = t.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav; const s = S(); if (s.fav[id]) delete s.fav[id]; else s.fav[id] = true; store.save();
      toast(s.fav[id] ? "★ " + T("favAdd") : T("favRemove"));
      refreshAfterStateChange();
      if ($("#programDialog").open && t.closest("#programDialog")) { const on = !!s.fav[id]; fav.setAttribute("aria-pressed", on); fav.textContent = on ? "★ " + T("favRemove") : "☆ " + T("favAdd"); }
      return;
    }
    const ics = t.closest("[data-ics]");
    if (ics) {
      const p = P(ics.dataset.ics); const ms = ics.dataset.ms ? p.milestones.find(m => m.date === ics.dataset.ms) : null;
      if (ms || (p.applicationDeadline && p.deadlineExact)) downloadICS([deadlineIcs(p, ms)], `frist-${p.id}${ms ? "-" + ms.date : ""}.ics`);
      return;
    }
    const icsEv = t.closest("[data-ics-ev]"); if (icsEv) { const ev = D.events.find(x => x.id === icsEv.dataset.icsEv); if (ev && ev.exact && ev.date) downloadICS([eventIcs(ev)], `termin-${ev.id}.ics`); return; }
    if (t.closest("#icsAllDeadlines")) {
      const evs = [];
      D.programs.forEach(p => {
        if (p.applicationDeadline && p.deadlineExact && !isPast(p.applicationDeadline, p.deadlineTime)) evs.push(deadlineIcs(p));
        (p.milestones || []).filter(m => m.radar && m.date && m.exact && !isPast(m.date)).forEach(m => evs.push(deadlineIcs(p, m)));
      });
      downloadICS(evs, "studium-2027-fristen.ics"); toast(`${evs.length} Fristen exportiert`); return;
    }
    if (t.closest("#icsAllEvents")) { const evs = D.events.filter(x => x.exact && x.date && !isPast(x.endDate || x.date, x.time)).map(eventIcs); downloadICS(evs, "studium-2027-termine.ics"); toast(`${evs.length} Termine exportiert`); return; }
    const cat = t.closest("[data-cat]"); if (cat) { filt.cat = cat.dataset.cat; renderFilters(); renderPrograms(); return; }
    const tg = t.closest("[data-toggle]"); if (tg) { const id = tg.dataset.toggle; filt.toggles.has(id) ? filt.toggles.delete(id) : filt.toggles.add(id); renderFilters(); renderPrograms(); return; }
    if (t.closest("[data-reset]")) { filt.cat = "all"; filt.toggles.clear(); filt.q = ""; $("#searchInput").value = ""; mapState.city = null; renderFilters(); renderMap(); renderCityPanel(); renderPrograms(); return; }
    if (t.closest("[data-clear-city]")) { mapState.city = null; renderMap(); renderCityPanel(); renderPrograms(); return; }
    if (t.closest("[data-close]")) { closeDialog(); return; }
    if (t.closest("[data-howmatch]")) { howMatch(); return; }
    if (t.closest("[data-cockpit-all]")) { $("#cockpitAll").checked = true; renderCockpit(); return; }
    const lb = t.closest(".lang-btn"); if (lb) { S().lang = lb.dataset.lang; store.save(); rerenderAll(); return; }
    if (t.closest("[data-tab-menu]")) { const nav = $("#mobileNav"), mbtn = $(".menu-btn"); const open = nav.hidden; nav.hidden = !open; mbtn.setAttribute("aria-expanded", String(open)); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const mb = t.closest(".menu-btn");
    if (mb) { const nav = $("#mobileNav"); const open = nav.hidden; nav.hidden = !open; mb.setAttribute("aria-expanded", String(open)); return; }
    if (t.closest("#mobileNav a")) { $("#mobileNav").hidden = true; $(".menu-btn").setAttribute("aria-expanded", "false"); }
  });
  // Tastatur für Kartenpunkte (role=button)
  document.addEventListener("keydown", e => {
    const pin = e.target.closest && e.target.closest(".pin");
    if (pin && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); const c = pin.dataset.city; setCity(c); const again = $(`.pin[data-city="${c}"]`); again && again.focus(); }
    if (e.key === "Escape" && !$("#mobileNav").hidden) { $("#mobileNav").hidden = true; $(".menu-btn").setAttribute("aria-expanded", "false"); $(".menu-btn").focus(); }
  });
  document.addEventListener("toggle", e => {
    const d = e.target; if (!d.matches || !d.matches("details[data-group]")) return;
    const s = S(); s.prefs.radarOpen = s.prefs.radarOpen || {}; s.prefs.radarOpen[d.dataset.group] = d.open; store.save();
  }, true);
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.matches("[data-status]")) { const s = S(); if (t.value) s.status[t.dataset.status] = t.value; else delete s.status[t.dataset.status]; store.save(); toast(T("saved")); refreshAfterStateChange(); if (window.Motion) { window.Motion.refreshProgress(); if (["abgeschickt", "einladung", "zusage"].includes(t.value)) window.Motion.celebrate(); } return; }
    if (t.matches("[data-req]")) { const s = S(); s.req[t.dataset.req] = s.req[t.dataset.req] || {}; if (t.checked) s.req[t.dataset.req][t.dataset.idx] = true; else delete s.req[t.dataset.req][t.dataset.idx]; store.save(); return; }
    if (t.matches("[data-check]")) { const s = S(); if (t.checked) s.check[t.dataset.check] = true; else delete s.check[t.dataset.check]; store.save(); if (window.Motion) { window.Motion.refreshProgress(); if (t.checked && D.checklist.every(c => s.check[c.id])) window.Motion.celebrate(); } renderChecklist(); $(`[data-check="${t.dataset.check}"]`).focus(); return; }
    if (t.id === "sortSelect") { filt.sort = t.value; renderPrograms(); return; }
    if (t.id === "radarFavOnly") { renderRadar(); return; }
    if (t.id === "evPast" || t.id === "evFav") { renderEvents(); return; }
    if (t.id === "cockpitAll") { renderCockpit(); return; }
    if (t.id === "importData" && t.files && t.files[0]) {
      const fr = new FileReader();
      fr.onload = () => { try { const d = JSON.parse(fr.result); if (!d || typeof d !== "object" || !("status" in d)) throw new Error(); store.replace(d); rerenderAll(); toast("Sicherung geladen"); } catch (err) { toast("Datei nicht lesbar"); } t.value = ""; };
      fr.readAsText(t.files[0]);
    }
  });
  let noteTimer;
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.matches("[data-note]")) { clearTimeout(noteTimer); noteTimer = setTimeout(() => { const s = S(); const v = t.value.trim(); if (v) s.notes[t.dataset.note] = t.value; else delete s.notes[t.dataset.note]; store.save(); toast(T("saved")); renderCockpit(); }, 450); }
    if (t.id === "searchInput") { filt.q = t.value.trim(); renderPrograms(); }
  });
  $("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(Object.assign({ exported: new Date().toISOString() }, S()), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `studium-2027-sicherung-${todayISO()}.json`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  const dlg = $("#programDialog");
  dlg.addEventListener("click", e => { if (e.target === dlg) closeDialog(); }); // Klick auf den Hintergrund
  dlg.addEventListener("close", () => {
    if (location.hash.startsWith("#p=") && history.replaceState) history.replaceState(null, "", location.pathname + location.search);
    let target = lastOpener && document.contains(lastOpener) ? lastOpener : null;
    if (!target && lastOpenId) target = $(`#card-${lastOpenId} [data-open]`) || $(`[data-open="${lastOpenId}"]`);
    if (target) target.focus({ preventScroll: true });
    lastOpenId = null;
  });

  // Karte bei Größenänderung neu layouten (Label-Größen in CSS-Pixeln konstant)
  let rT; const ro = window.ResizeObserver ? new ResizeObserver(() => { clearTimeout(rT); rT = setTimeout(renderMap, 120); }) : null;
  if (ro) ro.observe($("#mapStage")); else window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(renderMap, 150); });

  rerenderAll();
  initMapTip();
  // Deep-Link: #p=<id> öffnet direkt einen Studiengang
  const m = location.hash.match(/^#p=([\w-]+)/); if (m && P(m[1])) openProgram(m[1]);
  // Tageswechsel: Countdown einmal pro Stunde aktualisieren
  setInterval(() => { renderStats(); renderToday(); renderRadar(); }, 36e5);
})();
