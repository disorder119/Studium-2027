/* ==========================================================================
   STUDIUM 2027 · Mappenberatung
   Je Studiengang drei Dinge: (1) Mustermappe, (2) echte Beispiele und offizielle
   Hinweise der Hochschulen, (3) Reviews von Studierenden mit Pro und Contra.
   Regeln:
   • Nur belegte Quellen. Bewertungen stammen von StudyCheck (Stand 01.10.2026) und
     sind in eigenen Worten wiedergegeben, mit Sternen, Anzahl und Jahr.
   • Wenige Bewertungen werden ausdrücklich als „wenige“ gekennzeichnet.
   • Fehlt etwas, steht das da. Es wird nichts ergänzt, was nicht gefunden wurde.
   ========================================================================== */
(() => {
  "use strict";
  const D = window.STUDY_DATA, M = window.STUDY_MUSTER;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s = "") => String(s).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  const lang = () => { try { return JSON.parse(localStorage.getItem("vh-studium-2027") || "{}").lang === "ua" ? "ua" : "de"; } catch (e) { return "de"; } };
  const STAND = "01.10.2026";
  const KEY = "vh-beratung";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } };
  const save = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ohne Speicher weiter */ } };

  /* ---------------------------------------------------------------- Quellen */
  const SC = {
    khb: "https://www.studycheck.de/hochschulen/kh-berlin",
    hfg: "https://www.studycheck.de/hochschulen/hfg-offenbach",
    dd: "https://www.studycheck.de/studium/buehnen-und-kostuembild/hfbk-dresden-4929",
    haw: "https://www.studycheck.de/hochschulen/haw-hamburg",
    udk: "https://www.studycheck.de/hochschulen/udk-berlin",
    hsh: "https://www.studycheck.de/hochschulen/hs-hannover",
    pf: "https://www.studycheck.de/hochschulen/hs-pforzheim",
    rt: "https://www.studycheck.de/hochschulen/hs-reutlingen",
    burg: "https://www.studycheck.de/hochschulen/kh-halle",
    htw: "https://www.studycheck.de/hochschulen/htw-berlin",
    abk: "https://www.studycheck.de/hochschulen/abk-stuttgart"
  };

  /* ---------------------------------------------------------------- Reviews
     rating = Sterne der Hochschule bzw. des Studiengangs (StudyCheck), n = Anzahl Bewertungen
     pro/con: [Aussage in eigenen Worten, Studiengang, Jahr]                                    */
  const REV = [
    { programs: ["weissensee-*"], uni: "weißensee kunsthochschule berlin", rating: "3,8 von 5", n: 31, rec: "94 % würden sie weiterempfehlen", url: SC.khb,
      scope: "Bewertet wird die ganze Hochschule. Die meisten Kommentare kommen aus Mode-Design und Produkt-Design.",
      pro: [["Die Atmosphäre ist offen, und experimentelles Denken wird ausdrücklich gefördert.", "Mode-Design", "2026"], ["Die Betreuung durch die Professor*innen ist persönlich und konstruktiv. Man findet dabei seine eigene Handschrift.", "Mode-Design", "2026"], ["Die Werkstätten sind sehr gut ausgestattet, von Textil über Siebdruck bis zu digitalen Werkzeugen.", "Mode-Design", "2026"], ["Man kommt flexibel in die Werkstätten, ohne lange Wartelisten. Die Stimmung zwischen Jahrgängen und Lehrenden ist familiär.", "Produkt-Design", "2026"]],
      con: [["Die digitale Ausstattung wird als nicht so gut beschrieben.", "Mode-Design", "2026"], ["Barrierefreiheit: Eine Rollstuhlfahrerin kam nicht in die oberen Etagen, Rampen waren teils zugestellt.", "Bildhauerei / Freie Kunst", "2026"]],
      you: "Für Textil, Mode und Bühne klingt das nach genau dem, was du suchst: gute Werkstätten und viel Raum für eigene Ideen. Wenn du viel am Computer arbeiten willst, ist die Ausstattung eher schwach." },
    { programs: ["hfg-offenbach-kunst"], uni: "HfG Offenbach", rating: "3,9 von 5", n: 47, rec: "100 % würden sie weiterempfehlen", url: SC.hfg,
      scope: "Bewertet wird die ganze Hochschule, Kommentare kommen aus Kunst (B.F.A.) und Design.",
      pro: [["Ein völlig freies Studium: Man lernt Selbstständigkeit und entwickelt eine kritische Haltung.", "Kunst B.F.A.", "2026"], ["Die Professorinnen unterrichten mit Leidenschaft, jede Veranstaltung ist anders, es gibt viele Exkursionen.", "Design B.A.", "2026"], ["Die Lehrenden sind per Du auf Augenhöhe und unterstützen aktiv. Das wird als Privileg beschrieben.", "Kunst B.F.A.", "2026"]],
      con: [["Man muss sich viel selbst organisieren. Die Organisation der Hochschule wird teils als anstrengend und unzuverlässig beschrieben.", "Kunst B.F.A.", "2026"], ["Digital ist die Hochschule mäßig aufgestellt. Ohne eigenes Gerät wird es schwierig, das Online-Portal gilt als nicht nutzerfreundlich.", "Kunst B.F.A.", "2026"]],
      you: "Freiheit ist hier das Hauptthema. Du arbeitest bisher sehr eigenständig, das passt. Wer feste Stundenpläne braucht, wird die freie Form anstrengend finden." },
    { programs: ["dresden-buehne-kostuem"], uni: "HfBK Dresden · Bühnen- und Kostümbild", rating: "3,8 von 5", n: 6, rec: "100 % würden es weiterempfehlen", url: SC.dd, few: true,
      scope: "Das sind nur 6 Bewertungen. Nimm sie als Stimmungsbild, nicht als Urteil.",
      pro: [["Die Dozent*innen sind politisch engagiert, solidarisch und herzlich. Interdisziplinäre Zusammenarbeit wird großgeschrieben.", "Bühnen- und Kostümbild", "2026"], ["Es gibt regelmäßig Kooperationen mit anderen Hochschulen.", "Bühnen- und Kostümbild", "2026"], ["Der Studiengang erlaubt viele künstlerische Ausdrucksformen, auch über klassisches Bühnenbild hinaus.", "Bühnen- und Kostümbild", "2026"], ["Laborbühne und Computerraum sind gut ausgestattet.", "Bühnen- und Kostümbild", "2026"]],
      con: [["Klassische Fertigkeiten wie Modellbau und Figurinenzeichnen werden nicht systematisch unterrichtet. Man muss sie sich selbst beschaffen.", "Bühnen- und Kostümbild", "2026"]],
      you: "Wenn du Figurinen und Modellbau richtig lernen willst, plane ein, dass du dir einen Teil selbst beibringst. Gerade das fehlt in deiner Mappe noch." },
    { programs: ["haw-*"], uni: "HAW Hamburg · Mode, Kostüm, Textil (B.A.)", rating: "3,4 von 5", n: 21, rec: "Die ganze HAW hat 3,7 von 5 bei 1.161 Bewertungen", url: SC.haw, few: true,
      scope: "Für den Bachelor Mode, Kostüm, Textil gibt es 21 Bewertungen. Konkrete Einzelkommentare sind nur wenige sichtbar.",
      pro: [["Kleine Lerngruppen sorgen für eine persönliche Atmosphäre.", "Mode, Kostüm, Textil (B.A.)", "2026"], ["Praktisches Arbeiten an Projekten ermöglicht Lernerfahrungen.", "Master Mode, Kostüm, Textil", "2026"]],
      con: [],
      you: "Hier haben wir keine konkreten Kritikpunkte gefunden, aber auch nur wenige Einzelstimmen. Die Note 3,4 ist die niedrigste unter deinen Favoriten. Frag bei Rundgängen und Infotagen nach." },
    { programs: ["udk-*"], uni: "UdK Berlin", rating: "3,8 von 5", n: 254, rec: "95 % würden sie weiterempfehlen", url: SC.udk,
      scope: "Das gilt für die ganze Universität. Zum Kostümbild gibt es nur 2 Bewertungen (2,2 von 5), zu Design (B.A.) 20 (3,7 von 5).",
      pro: [["Die Dozent*innen werden hoch bewertet (4,2 von 5), die Studieninhalte noch besser (4,4 von 5).", "ganze Hochschule", "2026"], ["Das vielfältige Angebot erlaubt individuelle gestalterische Experimente.", "Design B.A.", "2026"], ["Die Verkehrsanbindung wird sehr gelobt.", "ganze Hochschule", "2026"]],
      con: [["Die Organisation ist die Schwachstelle (3,0 von 5). Studierende berichten von chaotischen Verhältnissen.", "ganze Hochschule", "2026"], ["Durch Budgetkürzungen fehlen teils Material und Technik.", "ganze Hochschule", "2026"], ["Zwei Bewertungen sagen, der Studiengang Kostümbild sei mit zu wenig Ressourcen und schlecht organisiert.", "Kostümbild B.A.", "2026"]],
      you: "Inhaltlich und bei den Lehrenden sehr gut bewertet, bei der Organisation weniger. Zum Kostümbild gibt es zu wenige Stimmen für ein Urteil. Dort lohnt sich die Mappenberatung der Hochschule besonders." },
    { programs: ["hannover-*"], uni: "Hochschule Hannover · Fakultät III", rating: "4,0 von 5", n: 843, rec: "96 % würden sie weiterempfehlen", url: SC.hsh,
      scope: "Die Gesamtnote gilt für die ganze Hochschule. Szenografie, Kostüm, Experimentelle Gestaltung hat 4,0 von 5 bei 13 Bewertungen, Mode 3,7 von 5 bei 17.",
      pro: [["Eine Studentin hebt die 1-zu-1-Betreuung hervor, weil es so wenige Studierende gibt.", "Szenografie, Kostüm, Experimentelle Gestaltung", "2026"], ["Die Dozent*innen vermitteln fachlich kompetent und praxisnah.", "Mode", "2026"], ["Ein Student lobt tolle Projekte und das schöne Ambiente in der Fakultät.", "Produktdesign", "2026"]],
      con: [],
      you: "Zu SKE nur gute Stimmen, aber nur 13. Die enge Betreuung passt zu jemandem, die selbst viel mitbringt." },
    { programs: ["pforzheim-mode"], uni: "Hochschule Pforzheim · Mode (B.A.)", rating: "4,2 von 5", n: 16, rec: "Die ganze Hochschule hat 4,1 von 5 bei 749 Bewertungen", url: SC.pf,
      scope: "16 Bewertungen für den Studiengang Mode.",
      pro: [["Es gibt ein Mac-Labor, in dem man frei arbeiten und Drucker und Plotter nutzen kann.", "Mode B.A.", "Juli 2026"], ["Die Atmosphäre ist offen, angenehm und sicher.", "Mode B.A.", "Juni 2026"], ["Die Professor*innen sind sehr engagiert und bringen Kontakte und Fachwissen aus der Industrie mit.", "Mode B.A.", "Juni 2026"]],
      con: [],
      you: "Sehr gut bewertet, aber eher industrienah. Bei den Aufnahmen zählen Zeichnung und Mode, dein größtes Plus liegt woanders." },
    { programs: ["reutlingen-ftd"], uni: "Hochschule Reutlingen · Fashion and Textile Design (B.A.)", rating: "4,0 von 5", n: 19, rec: "", url: SC.rt, few: true,
      scope: "Für diesen Studiengang sind nur die Sterne sichtbar, keine einzelnen Texte. Allgemein loben Studierende die abwechslungsreiche Mischung und den praxisnahen Unterricht.",
      pro: [["Allgemein werden die abwechslungsreiche Mischung und der praxisnahe Unterricht gelobt.", "ganze Hochschule", "2026"]], con: [],
      you: "Gute Note, aber ohne Einzelstimmen können wir dir hier nichts Konkretes sagen." },
    { programs: ["burg-*"], uni: "BURG Halle", rating: "4,1 von 5", n: 56, rec: "96 % würden sie weiterempfehlen", url: SC.burg,
      scope: "Das gilt für die ganze Hochschule. Die meisten Kommentare stammen nicht aus Textil oder Mode.",
      pro: [["Die Werkstätten, Ateliers und PC-Pools gelten als modern und vielfältig (4,6 von 5).", "ganze Hochschule", "2026"], ["Der Austausch unter den Studierenden ist viel und sehr wertvoll.", "Kommunikationsdesign", "2026"], ["Die Dozent*innen sind hilfsbereit, wegen der kleinen Zahl ist der Umgang persönlich.", "Kunst Lehramt", "2026"], ["Man kann zwischen den Bereichen wechseln, das Feld ist breit.", "Kommunikationsdesign", "2026"]],
      con: [["Die Organisation ist manchmal etwas chaotisch (3,4 von 5).", "Kunst Lehramt", "2026"], ["Im Modedesign gibt es lange Nachtschichten, und digital funktioniert vieles nicht.", "Modedesign", "2026"]],
      you: "Für die BURG sprechen die Werkstätten und der Zusammenhalt. Die Aussage zu den Nachtschichten im Modedesign solltest du ernst nehmen, wenn du dort studieren willst." },
    { programs: ["htw-modedesign"], uni: "HTW Berlin · Modedesign (B.A.)", rating: "3,9 von 5", n: 48, rec: "", url: SC.htw,
      scope: "48 Bewertungen für den Bachelor Modedesign. Einzelne Kommentare sind nicht öffentlich auslesbar.",
      pro: [["Studierende schätzen, kreativ arbeiten zu können und dabei von erfahrenen Lehrenden unterstützt zu werden. Die praktische Ausrichtung wird gelobt.", "Modedesign B.A.", "2026"]], con: [],
      you: "Praxisnah und solide. Konkrete Kritik haben wir nicht gefunden." },
    { programs: ["abk-*"], uni: "ABK Stuttgart", rating: "3,8 von 5", n: 71, rec: "96 % würden sie weiterempfehlen", url: SC.abk, few: true,
      scope: "Das gilt für die ganze Akademie. Zu Textildesign gibt es 1 Bewertung, zu Bühnen- und Kostümbild 2.",
      pro: [["Freiraum, erfahrene Dozent*innen, kleine Klassen und gute technische Ausstattung werden genannt.", "ganze Hochschule", "2026"], ["In Bildende Kunst werden die vielen Freiheiten und die persönliche Entwicklung statt Auswendiglernen gelobt.", "Bildende Kunst", "2026"]],
      con: [["Die Organisation (2,9 von 5) und das digitale Studieren (3,1 von 5) werden am schlechtesten bewertet.", "ganze Hochschule", "2026"]],
      you: "Zu deinen Studiengängen dort gibt es fast keine Bewertungen. Nutze die Mappenberatung der ABK, bevor du dich entscheidest." }
  ];

  /* ---------------------------------------------------------------- Echte Beispiele und offizielle Hinweise */
  const DOCS = {
    khb: { kind: "Offizielle Hinweise", title: "weißensee: Tipps zur digitalen Mappe, Mode-Design", note: "Stand 2020/21. Zahlen und Fristen können abweichen, die Haltung der Kommission ist aber lehrreich.",
      url: "https://testomat.kh-berlin.de/uploads/tx_khberlin/tipps-infos-fu-r-die-bewerbung.pdf",
      points: ["Bewertet werden die Arbeiten, nicht ihre Präsentation. Kein Passepartout, keine Schnörkel, keine Clipart.", "Ein roter Faden oder ein Überthema ist nicht nötig.", "Die wichtigste Arbeit steht vorn, danach nach Wichtigkeit und Aktualität sortieren.", "Die Kommission kann keine Filme, Websites oder Links öffnen, auch kein Instagram. Alles muss im PDF sein.", "Zu jeder Arbeit steht auf einem Übersichtsblatt kurz: Titel, Material, Größe, Datum und Ort oder Kontext.", "Die Kommission will sehen, wofür du dich interessierst und wie du schon gestalterisch arbeitest."] },
    burg: { kind: "Offizielle Hinweise", title: "BURG Halle: „Come as you are!“, Mappe für Mode", note: "Stand Januar 2022, von der Studienrichtung Mode. Gilt als Haltung der BURG, auch für verwandte Bereiche.",
      url: "https://Burg-halle.de/media/documents/Design/Mode-Design/Mode/Richtlinien_Mappengestaltung_BA_2022_Januar.pdf",
      points: ["„Zeigt uns, was wir sehen sollen, nicht was wir sehen wollen.“ Es gibt keine Vorgaben zu Format, Inhalt oder Technik.", "Gedacht sind etwa 20 Seiten, dazu höchstens ein Skizzenbuch.", "Zeige Vielseitigkeit mit Material, Themen und Techniken: Zeichnung, Aquarell, Acryl, Tusche, Collage, Mischtechnik.", "Experimente und auch einige unfertige Arbeiten sind willkommen, sie zeigen, wie du Ideen entwickelst.", "Modeentwürfe und Modeillustrationen sind kein Aufnahmekriterium und sollten nicht den Hauptteil bilden.", "Baue die Mappe erzählerisch auf, mit starkem Anfang und Ende, mit Titeln und Kurzbeschreibungen. Bei 3D-Arbeiten Größe oder Maße angeben."] },
    burgZ: { kind: "Offizielle Hinweise", title: "BURG Halle: Informationen für Bewerber (Stand 12.02.2026)", note: "Hier steht die wichtigste Regel für deine Mappe: Arbeiten dürfen nicht älter als 2 Jahre sein.",
      url: "https://www.burg-halle.de/media/documents/Hochschule/Studium/Informationen_f%C3%BCr_Bewerber_zum_grundst%C3%A4ndigen_Studium-12.02.2026.pdf", points: [] },
    lara: { kind: "Echtes Beispiel, angenommen", title: "Lara: Mappe für Modedesign an der HAW Hamburg", note: "Ein Bericht des Mappenvorbereitungskurses. Lara wurde nach Mappe und Eignungsprüfung angenommen und schildert, wie ihre Mappe aussah.",
      url: "https://mappenvorbereitungskurs.de/story/news/lara-bewerbungsmappe-modedesign-haw-hamburg",
      points: ["In der Mappe: Zeichnungen mit Copic-Markern, Aquarell mit Bleistift, Silhouettenporträts mit schwarzer Farbe auf Zeitungspapier, digitale Entwürfe und ein selbst gestaltetes Magazin über Muster in der Mode.", "Ihre Lehre: das eigene Ding durchziehen und einfach drauflos zeichnen, statt jede Linie zu zerdenken.", "Wichtig für dich: Laras Mappe ist eine Modemappe aus Zeichnungen und Illustrationen. Deine hat andere Stärken, nämlich Malerei und getragene Stücke."] },
    wiki: { kind: "Allgemeiner Ratgeber", title: "Wikibooks: Die Bewerbung zum Design- und Kunststudium", note: "Ein offenes Handbuch mit Tipps zu Mappe, Eignungsprüfung und Praktikum, unabhängig von einer Hochschule.",
      url: "https://de.wikibooks.org/wiki/Die_Bewerbung_zum_Design-_und_Kunststudium", points: [] }
  };
  const docsFor = id => {
    const out = [];
    if (id.startsWith("weissensee-")) out.push(DOCS.khb);
    if (id.startsWith("burg-")) out.push(DOCS.burg, DOCS.burgZ);
    if (id.startsWith("haw-") && id !== "haw-x") out.push(DOCS.lara);
    out.push(DOCS.wiki);
    return out;
  };

  const matchProg = (patterns, id) => patterns.some(p => p.endsWith("*") ? id.startsWith(p.slice(0, -1)) : p === id);
  const revFor = id => REV.find(r => matchProg(r.programs, id));

  const TX = {
    de: { h: "Mappenberatung", pick: "Für welchen Studiengang?", t1: "Mustermappe", t2: "Beispiele und Hinweise", t3: "Reviews",
      build: "Diese Mappe im Editor bauen", open: "Alle Einzelheiten zu diesem Studiengang", noPlan: "Für diesen Studiengang gibt es noch keine Mustermappe.",
      exNone: "Dazu haben wir keine weiteren öffentlichen Beispiele gefunden.", rev: "Was Studierende sagen", pro: "Das gefällt", con: "Das gefällt weniger", you: "Für dich",
      noRev: "Zu diesem Studiengang haben wir keine eigenen Bewertungen gefunden.", src: "Quelle", stand: "Stand", fewH: "Nur wenige Bewertungen: eher ein Stimmungsbild als ein Urteil.",
      beratung: "Mappenberatung dieser Hochschule", noCon: "Keine konkreten Kritikpunkte gefunden.", compare: "Alle Hochschulen im Vergleich", stars: "Sterne", count: "Bewertungen",
      more: "Weitere Stimmen aus Foren und Berichten", mustHead: "So ist deine Mustermappe aufgebaut" },
    ua: { h: "Консультація щодо портфоліо", pick: "Для якої програми?", t1: "Зразок портфоліо", t2: "Приклади й поради", t3: "Відгуки",
      build: "Зібрати це портфоліо в редакторі", open: "Усе про цю програму", noPlan: "Для цієї програми ще немає зразка портфоліо.",
      exNone: "Інших публічних прикладів не знайдено.", rev: "Що кажуть студенти", pro: "Що подобається", con: "Що подобається менше", you: "Для тебе",
      noRev: "Власних відгуків про цю програму не знайдено.", src: "Джерело", stand: "Станом на", fewH: "Мало відгуків: це скоріше настрій, ніж вирок.",
      beratung: "Консультація щодо портфоліо в цьому виші", noCon: "Конкретної критики не знайдено.", compare: "Усі виші в порівнянні", stars: "зірок", count: "відгуків",
      more: "Інші голоси з форумів і розповідей", mustHead: "Як побудований твій зразок портфоліо" }
  };

  /* ---------------------------------------------------------------- Teile */
  function muster(p, t) {
    const pl = M && M.plans && M.plans[p.id];
    if (!pl) return `<p class="muted">${esc(t.noPlan)}</p>`;
    const rows = (window.Howto && window.Howto.mappe) ? window.Howto.mappe(p) : "";
    return `<div class="bt-muster">${rows}
      <p class="bt-act"><a class="btn primary sm" href="./editor.html#plan=${esc(p.id)}">${esc(t.build)}</a>
      <button type="button" class="btn ghost sm" data-open="${esc(p.id)}" data-muster="1">${esc(t.open)}</button></p>
      ${window.MusterUI ? window.MusterUI.section(p) : ""}</div>`;
  }
  function beispiele(p, t) {
    const docs = docsFor(p.id);
    const evs = (p.counselling || []).map(eid => D.events.find(e => e.id === eid)).filter(Boolean);
    return `<p class="bt-note">Vollständige angenommene Mappen veröffentlichen Hochschulen sehr selten. Das hier haben wir gefunden:</p>
      <div class="bt-docs">${docs.map(d => `<article class="bt-doc"><p class="bt-kind">${esc(d.kind)}</p><h4>${esc(d.title)}</h4><p class="small muted">${esc(d.note)}</p>
        ${d.points.length ? `<ul>${d.points.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <a class="text-btn" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">${esc(t.src)} öffnen ↗</a></article>`).join("")}</div>
      ${evs.length ? `<h4 class="bt-h">${esc(t.beratung)}</h4><ul class="bt-ev">${evs.map(e => `<li><b>${esc(e.title)}</b> · ${esc(e.date ? e.date.split("-").reverse().join(".") : (e.recurring || ""))}${e.time ? ", " + esc(e.time) + " Uhr" : ""}<br><span class="muted small">${esc(e.mode || "")}${e.registration ? " · " + esc(e.registration) : ""}</span></li>`).join("")}</ul>` : ""}`;
  }
  function reviews(p, t) {
    const r = revFor(p.id);
    const more = window.StimmenUI ? window.StimmenUI.block(p) : "";
    if (!r) return `<p class="bt-note">${esc(t.noRev)}</p>${more ? `<h4 class="bt-h">${esc(t.more)}</h4>${more}` : ""}`;
    const li = a => a.length ? `<ul>${a.map(([x, prog, y]) => `<li>${esc(x)}<small>${esc(prog)} · ${esc(y)}</small></li>`).join("")}</ul>` : "";
    return `<article class="bt-rev">
      <header><h4>${esc(r.uni)}</h4><p class="bt-rate"><b>${esc(r.rating)}</b> · ${r.n} ${esc(t.count)}${r.rec ? " · " + esc(r.rec) : ""}</p></header>
      ${r.few ? `<p class="bt-few">${esc(t.fewH)}</p>` : ""}
      <p class="small muted">${esc(r.scope)}</p>
      <div class="bt-cols">
        <div class="bt-pro"><h5>${esc(t.pro)}</h5>${li(r.pro)}</div>
        <div class="bt-con"><h5>${esc(t.con)}</h5>${r.con.length ? li(r.con) : `<p class="small muted">${esc(t.noCon)}</p>`}</div>
      </div>
      <p class="bt-you"><b>${esc(t.you)}:</b> ${esc(r.you)}</p>
      <p class="small muted">${esc(t.src)}: <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">StudyCheck ↗</a> · ${esc(t.stand)} ${STAND}. Bewertungen sind persönliche Eindrücke und in eigenen Worten wiedergegeben.</p>
    </article>${more ? `<h4 class="bt-h">${esc(t.more)}</h4>${more}` : ""}`;
  }
  function compare(t) {
    const rows = REV.map(r => ({ r, v: parseFloat(r.rating.replace(",", ".")) })).sort((a, b) => b.v - a.v);
    return `<details class="bt-compare"><summary>${esc(t.compare)}</summary><div class="table-wrap"><table class="lang-table"><thead><tr><th>Hochschule</th><th>${esc(t.stars)}</th><th>${esc(t.count)}</th></tr></thead><tbody>${rows.map(({ r }) => `<tr><td><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.uni)}</a>${r.few ? " <small class='muted'>(wenige)</small>" : ""}</td><td>${esc(r.rating)}</td><td>${r.n}</td></tr>`).join("")}</tbody></table></div>
      <p class="small muted">Die Sterne gelten für den genannten Studiengang oder die ganze Hochschule, siehe jeweils die Anmerkung. Quelle: StudyCheck, Stand ${STAND}.</p></details>`;
  }

  /* ---------------------------------------------------------------- Aufbau */
  function render() {
    const root = $("#beratungRoot"); if (!root || !D) return;
    const t = TX[lang()], st = load();
    const list = D.programs.filter(p => M.plans[p.id]).slice().sort((a, b) => (a.universityShort + a.course).localeCompare(b.universityShort + b.course, "de"));
    let id = st.prog && list.some(p => p.id === st.prog) ? st.prog : "udk-kostuembild";
    const p = list.find(x => x.id === id) || list[0];
    const tab = ["m", "b", "r"].includes(st.tab) ? st.tab : "m";
    const tabs = [["m", t.t1], ["b", t.t2], ["r", t.t3]];
    root.innerHTML = `
      <div class="bt-pick"><label for="btProg"><span>${esc(t.pick)}</span>
        <select id="btProg">${list.map(x => `<option value="${esc(x.id)}"${x.id === p.id ? " selected" : ""}>${esc(x.universityShort)} · ${esc(x.course)}</option>`).join("")}</select></label></div>
      <div class="bt-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" data-bt-tab="${k}" aria-selected="${k === tab}">${esc(l)}</button>`).join("")}</div>
      <div class="bt-body" id="btBody">${tab === "m" ? muster(p, t) : tab === "b" ? beispiele(p, t) : reviews(p, t)}</div>
      ${compare(t)}`;
  }

  document.addEventListener("change", e => { if (e.target.id === "btProg") { const s = load(); s.prog = e.target.value; save(s); render(); const el = $("#btProg"); if (el) el.focus(); } });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-bt-tab]"); if (!b) return;
    const s = load(); s.tab = b.dataset.btTab; save(s); render();
  });
  /* Direkt-Sprung aus einem Studiengang-Fenster */
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-bt-go]"); if (!g) return;
    const s = load(); s.prog = g.dataset.btGo; s.tab = g.dataset.btTab || "m"; save(s); render();
    const dlg = document.querySelector("dialog[open]"); if (dlg && dlg.close) dlg.close();
    const sec = document.getElementById("mappenberatung"); if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const start = () => render();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.Beratung = { render, revFor, REV };
})();
