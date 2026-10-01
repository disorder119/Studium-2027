/* ==========================================================================
   STUDIUM 2027 · Stimmen: Erfahrungen und Tipps aus öffentlichen Quellen
   --------------------------------------------------------------------------
   WICHTIG – wie dieser Datensatz entstanden ist:
   • Nichts ist erfunden. Jede Aussage hat eine Quelle mit Link.
   • „hochschule“ = offizielle Hinweise der Hochschule. Wörtliche Zitate nur
     dort, wo der Originaltext (PDF) selbst gelesen wurde.
   • „studierende“ = anonyme StudyCheck-Bewertungen bzw. ein Erfahrungsbericht
     einer Absolventin – sinngemäß zusammengefasst, nicht wörtlich zitiert.
   • „forum“ = Beiträge von Bewerber:innen in einem Forum – Einzelstimmen, teils
     viele Jahre alt (Jahr steht dabei).
   • „kurs“ = Bericht auf der Seite eines kommerziellen Mappenkurs-Anbieters.
   • Recherche-Stand: 01.10.2026. Eindrücke sind subjektiv und können veraltet
     sein; Verbindliches steht in den Quellen der Hochschulen.
   ========================================================================== */
(function () {
  const S = {
    burgMode: { label: "BURG Halle: „Come as you are!“ – Hinweise zur Mappengestaltung Mode (Jan. 2022)", url: "https://Burg-halle.de/media/documents/Design/Mode-Design/Mode/Richtlinien_Mappengestaltung_BA_2022_Januar.pdf" },
    burgZentral: { label: "BURG Halle: Informationen für Bewerber (Stand 12.02.2026)", url: "https://www.burg-halle.de/media/documents/Hochschule/Studium/Informationen_f%C3%BCr_Bewerber_zum_grundst%C3%A4ndigen_Studium-12.02.2026.pdf" },
    khbTipps: { label: "weißensee: Tipps und Empfehlungen zur digitalen Mappe, Mode-Design (Stand 2020/21)", url: "https://testomat.kh-berlin.de/uploads/tx_khberlin/tipps-infos-fu-r-die-bewerbung.pdf" },
    studycheckKhb: { label: "StudyCheck: weißensee kunsthochschule berlin – Bewertungen", url: "https://www.studycheck.de/hochschulen/kh-berlin" },
    hawAufn: { label: "HAW Hamburg: Aufnahmeprüfungsordnung BA Design (22.02.2024, PDF)", url: "https://WWW.HAW-HAMBURG.DE/fileadmin/zentrale_PDF/DMI/Zulassungs-_und_Auswahlordnungen/Department_Design/AufnPO_BA_Design_HA_201_22-02-2024.pdf" },
    lara: { label: "Mappenvorbereitungskurs: Lara, Bewerbungsmappe Modedesign, HAW Hamburg", url: "https://mappenvorbereitungskurs.de/story/news/lara-bewerbungsmappe-modedesign-haw-hamburg" },
    udkForum: { label: "precore-Forum: „Kostümbild Mappe UDK abgelehnt“ (Dezember 2018)", url: "https://precore.net/forum/studienbewerber/mappenbesprechung/kost%C3%BCmbild-mappe-udk-abgelehnt" },
    studycheckHfg: { label: "StudyCheck: HfG Offenbach – 47 Bewertungen", url: "https://www.studycheck.de/hochschulen/hfg-offenbach" },
    hfgBewerben: { label: "HfG Offenbach: Bewerben und Studienberatung", url: "https://www.hfg-offenbach.de/de/pages/bewerben-an-der-hfg" },
    studycheckDd: { label: "StudyCheck: Bühnen- und Kostümbild, HfBK Dresden – 5 Bewertungen", url: "https://www.studycheck.de/studium/buehnen-und-kostuembild/hfbk-dresden-4929" },
    precoreMainz: { label: "precore-Forum: „Mappe Mainz Erfahrungen?“ (Beiträge von 2006)", url: "https://precore.net/forum/studienbewerber/pr%C3%BCfungen/mappe-mainz-erfahrungen" },
    jasmine: { label: "mode-studieren.de: Erfahrungsbericht Hochschule Hof, Diplom Textildesign (Jasmine, Abschluss 2010)", url: "https://www.mode-studieren.de/erfahrungsberichte/hochschule-hof-textildesign-diplom/" }
  };

  /* kind: hochschule | studierende | forum | kurs · group = Filter · programs: Ids, Präfixe mit * oder "*" für alle */
  const tips = [
    { id: "burg-1", group: "BURG Halle", kind: "hochschule", src: "burgMode", year: "2022", programs: ["burg-*"],
      quote: "Zeigt uns was wir sehen sollen, nicht was wir sehen wollen.",
      text: "Die BURG will keine Erwartungserfüllung, sondern dich: Themen, die dich anziehen, und Techniken, die du gut beherrschst, gehören in die Mappe.",
      fuerDich: "Deine Bildwelt (Hut, Maske, Tier) ist schon eigen. Ergänze Zeichnung, damit auch die Vielseitigkeit sichtbar wird." },
    { id: "burg-2", group: "BURG Halle", kind: "hochschule", src: "burgZentral", year: "2026", programs: ["burg-*"],
      quote: "nicht älter als 2 Jahre",
      text: "Verlangt sind etwa 20 Arbeitsproben, die nicht älter als 2 Jahre sind. Beispiele: Naturstudien, Fotografien, räumliche Studien, freie Arbeiten, Skizzenbuch-Auszüge.",
      fuerDich: "Bei Abgabe Feb./März 2027 fallen die Acrylbilder von 2023–24 (Haubus, Tanz, Rot, Dive u. a.) heraus. Die BURG-Musterbewerbungen nutzen deshalb nur Werke ab 2025." },
    { id: "burg-3", group: "BURG Halle", kind: "hochschule", src: "burgMode", year: "2022", programs: ["burg-modedesign"],
      quote: "sind kein Kriterium für die Aufnahme zum Studium",
      text: "Modeentwürfe und Modeillustrationen sind kein Aufnahmekriterium und sollen nicht der Hauptteil der Mappe sein. Gezeigt werden sollen Vielseitigkeit mit Zeichnung, Malerei, Collage, Fotografie, Flächengestaltung und Skizzenbuch; auch Experimente und einige unfertige Arbeiten sind willkommen.",
      fuerDich: "Statt Figurinen als Schwerpunkt: Akt und bekleidete Figur, Skizzenbuch, Naturstudien. Deine genähten Stücke zeigen das Interesse an Mode ohnehin." },
    { id: "burg-4", group: "BURG Halle", kind: "hochschule", src: "burgMode", year: "2022", programs: ["burg-*"],
      quote: "baue die Mappe erzählerisch auf",
      text: "Nicht zwangsläufig chronologisch sortieren, sondern erzählerisch: wirkungsvoller Anfang und Ende, Titel und Kurzbeschreibungen, bei 3D-Arbeiten Größe angeben.",
      fuerDich: "Die Hut-Brücke (Liturgy neben Bronzezeit) ist ein starker Anfang. Im Editor kannst du je Arbeit Titel und zwei Sätze ergänzen." },
    { id: "khb-1", group: "Weißensee", kind: "hochschule", src: "khbTipps", year: "2020/21", programs: ["weissensee-*"],
      quote: "Es werden die Arbeiten, nicht deren Präsentation bewertet.",
      text: "Auf dekorative Elemente wie Passepartouts, Typografie, GIFs oder Clipart soll verzichtet werden. Die Tipps sind für Mode-Design geschrieben; die aktuellen Vorgaben stehen im Bewerbungsportal.",
      fuerDich: "Halte die Seiten schlicht: Bild, Titel, Maße. Der Editor schaltet Seitenzahlen und Fußzeile für Weißensee-Mappen aus." },
    { id: "khb-2", group: "Weißensee", kind: "hochschule", src: "khbTipps", year: "2020/21", programs: ["weissensee-*"],
      quote: "Ihre wichtigste Arbeit sollte die Mappe eröffnen.",
      text: "Nach Wichtigkeit und Aktualität sortieren; bis zu 30 Bilder in einem PDF; ein „Roter Faden“ ist nicht nötig. Die Kommission kann keine Filme, Websites, Instagram oder externe Links öffnen.",
      fuerDich: "Beginne mit „Die Jagd“ oder „Group Portrait of Monks“ und lege keine Videos als Link in die Mappe." },
    { id: "khb-3", group: "Weißensee", kind: "hochschule", src: "khbTipps", year: "2020/21", programs: ["weissensee-mode", "weissensee-textil"],
      quote: "in welcher Art auch immer, erkennbar sein",
      text: "Die Kommission besteht aus Modedesigner:innen, Lehrenden und Studierenden. Sie will sehen, wofür du dich interessierst und wie du schon arbeitest; ein Interesse an Mode, Kleidung und Gestaltung soll erkennbar sein. Kurze stichwortartige Angaben je Arbeit (Titel, Medium, Größe, Datum, Kontext) auf einem Übersichtsblatt.",
      fuerDich: "Dein Interesse an Kleidung ist unübersehbar. Zeige zusätzlich, wie du arbeitest: Prozessblätter und Skizzen. Das Übersichtsblatt ist die Werkliste im Editor." },
    { id: "khb-4", group: "Weißensee", kind: "studierende", src: "studycheckKhb", year: "laufend", programs: ["weissensee-*"],
      text: "Sinngemäß aus den anonymen Bewertungen: Studierende des Mode-Designs loben, dass experimentelles Denken ausdrücklich gefördert wird und die Betreuung durch die Professor:innen persönlich und konstruktiv ist. Andere Studiengänge beschreiben eine familiäre Stimmung zwischen Jahrgängen und Dozierenden und viele verschiedene Werkstätten. Kritisch bewertet wird die digitale Ausstattung (im Schnitt 2,9 von 5).",
      fuerDich: "Experimentieren ist hier erwünscht – genau dein Rost-, Wachs- und Futter-Material." },
    { id: "haw-1", group: "HAW Hamburg", kind: "hochschule", src: "hawAufn", year: "2024", programs: ["haw-*"],
      text: "Laut Aufnahmeordnung besteht die Mappe aus mindestens 20 und höchstens 30 selbst geschaffenen Arbeiten, aus denen Beobachtungsgabe, Farbgefühl, Vorstellungskraft und Präsentationsfähigkeit hervorgehen. Ein Skizzenbuch zählt als eine Arbeit. Im Kostümdesign geht es um Figuren- und Charakterentwurf für szenische Medien wie Film, Theater, Performance.",
      fuerDich: "Malerei und Kostüm hast du; ergänze Zeichnung und Entwurf. Ein ganzes Skizzenbuch zählt nur als eine Arbeit, kostet dich aber wenig." },
    { id: "haw-2", group: "HAW Hamburg", kind: "kurs", src: "lara", year: "n. a.", programs: ["haw-modedesign", "haw-kostuemdesign"],
      text: "Sinngemäß aus dem Bericht einer Bewerberin (veröffentlicht von einem Mappenkurs-Anbieter): Sie zeigte verschiedene Techniken (Copics, Aquarell mit Bleistift), experimentierte mit ungewöhnlichen Materialien und entwickelte einen eigenen Stil statt vorhandene nachzuahmen. Ihr Rat: freier zeichnen und nicht jeden Strich zerdenken, offen für Einflüsse bleiben. Der Anbieter nennt die Aufnahmeprüfung eine der schwierigsten Deutschlands (im Schnitt nur etwa 1 von 20 Bewerber:innen) – keine offizielle Zahl.",
      fuerDich: "Dein eigener Stil ist ein Plus. Zeige neben Acryl und Öl zwei, drei weitere Techniken (Tusche, Aquarell) und streue deine Bewerbungen auf mehrere Hochschulen." },
    { id: "udk-1", group: "UdK Berlin", kind: "forum", src: "udkForum", year: "2018", programs: ["udk-kostuembild", "udk-modedesign"],
      text: "Sinngemäß aus einem Forumsthema (Einzelfall, Dezember 2018): Eine Bewerberin wurde mit ihrer Kostümbild-Mappe abgelehnt; nach ihrer Angabe wurden von etwa 40–50 Bewerber:innen nur 11 zur Prüfung eingeladen. Rückmeldungen anderer: der malerische Ansatz sei schön, die Aktzeichnungen aber nicht gut genug und der Stil einseitig (immer dieselbe Epoche, ähnliche Ballkleider). Empfohlen wurden vielfältigere, auch zeitgenössische Figuren.",
      fuerDich: "Figurenzeichnen nach Modell üben und verschiedene Charaktere zeigen. Deine Figuren sind schon sehr unterschiedlich (Paladins, Portrait of Deacons, Dyki Bizony, Bronzezeit) – nutze die Vielfalt." },
    { id: "hfg-1", group: "HfG Offenbach", kind: "studierende", src: "studycheckHfg", year: "laufend", programs: ["hfg-offenbach-kunst"],
      text: "Sinngemäß aus 47 anonymen Bewertungen (Ø 3,9 von 5): Studierende im B.F.A. Kunst schätzen die große Freiheit und dass Professor:innen helfen, wenn man sie anspricht. Kritisch genannt werden eine teils anstrengende und unzuverlässige Organisation, mäßige digitale Ausstattung und dass man viel Eigeninitiative braucht.",
      fuerDich: "Passt zu deiner Eigenständigkeit. Plane Eigeninitiative ein und nutze die Studien- und Mappenberatung." },
    { id: "hfg-2", group: "HfG Offenbach", kind: "hochschule", src: "hfgBewerben", year: "laufend", programs: ["hfg-offenbach-kunst"],
      text: "Die HfG bietet Studien- und Mappenberatung, bei der Lehrende und Studierende zur künstlerischen und gestalterischen Ebene der Aufnahme beraten. Der Termin steht im Abschnitt Termine (mittwochs 12 Uhr).",
      fuerDich: "Nimm drei Mappenblätter mit, auch die schwächeren: Genau dafür ist die Beratung da." },
    { id: "dd-1", group: "HfBK Dresden", kind: "studierende", src: "studycheckDd", year: "laufend", programs: ["dresden-buehne-kostuem"],
      text: "Sinngemäß aus fünf Bewertungen von Bühnen- und Kostümbild-Studierenden: Eine Studierende schreibt, Modellbau oder das Zeichnen von Figurinen lerne man nicht, außer man bringe es sich selbst bei. Andere loben viele künstlerische Freiheiten, Grundlagen im klassischen Modellbau neben Film, Performance, Bildhauerei und Sound sowie eine solidarische, herzliche Studierendenschaft. Ein reines Online-Studium sei nicht möglich.",
      fuerDich: "Übe schon vor dem Studium Figurinenzeichnen und einfachen Modellbau (Karton, 1:20). Die Musterbewerbung hat dafür einen Platz." },
    { id: "mz-1", group: "KH Mainz", kind: "forum", src: "precoreMainz", year: "2006", programs: ["mainz-freie-kunst"],
      text: "Sinngemäß aus Forumsbeiträgen von 2006 (sehr alt, nur als Stimmungsbild): Eine angenommene Mappe heißt nicht Zulassung – damals kamen etwa 30 Personen zur zweitägigen Prüfung, rund 10 wurden genommen. Bei der Mappenberatung sei man sehr genau gewesen (selbst bei Schatten in schnellen Skizzen). Geraten wurde, ein breites Spektrum zu zeigen (Naturstudien, Akt, Fotografie, Radierung, Malerei) und die Mappenberatung zu nutzen. Heutiger Ablauf: Mappe plus etwa 15-minütiges Prüfungsgespräch.",
      fuerDich: "Zeige neben Malerei und Textil auch Naturstudien oder Akt, und übe das Prüfungsgespräch: die Verbindung von Malerei und Textil in drei Sätzen." },
    { id: "hof-1", group: "HS Hof", kind: "studierende", src: "jasmine", year: "2010", programs: ["hof-textildesign"],
      text: "Sinngemäß aus dem Erfahrungsbericht einer Diplom-Absolventin (Abschluss 2010, Prüfung 2005): In die Mappe könne theoretisch alles; wichtig sei, wo man stark ist, und eigene Arbeiten statt dessen, was Kunstlehrer:innen erwarten. Zeichnerische Grundfähigkeiten seien nötig – in der Eignungsprüfung mussten zwei Gegenstände (hart und weich) perspektivisch zusammen gezeichnet werden. Das Studium sei praxisnah mit großem Maschinenpark, kleiner Gruppe (ca. 30) und enger Betreuung; der Standort sei sehr klein, dort kenne man bald alle.",
      fuerDich: "Übe eine Prüfungsaufgabe wie „zwei Gegenstände perspektivisch zeichnen“. Hof ist praxisnah und klein – bei einem Besuch prüfen, ob dir das gefällt. Der Bericht ist älter, Ablauf und Maschinenpark können sich geändert haben." },
    { id: "all-1", group: "Für alle", kind: "studierende", src: "jasmine", year: "2010", programs: ["*"],
      text: "Sinngemäß: Jede Hochschule setzt ihre Schwerpunkte anders. Die Absolventin rät, Hochschulen persönlich zu besuchen, Beratungstermine zu nutzen und mit Professor:innen zu sprechen; Online-Recherche helfe, aber der persönliche Kontakt sei entscheidend. Auch Wohnort und Lebensqualität sollten bei der Wahl zählen.",
      fuerDich: "Nutze die Mappenberatungs-Termine im Abschnitt Termine und frag dort gezielt nach Studierenden, die du sprechen kannst." }
  ];

  const kinds = {
    hochschule: { label: "Hochschule", note: "offizielle Hinweise, teils wörtlich zitiert", cls: "ok" },
    studierende: { label: "Studierende", note: "Bewertungen und Erfahrungsbericht, sinngemäß", cls: "f-good" },
    forum: { label: "Forum", note: "Einzelstimmen von Bewerber:innen, oft älter", cls: "tight" },
    kurs: { label: "Mappenkurs", note: "Bericht eines kommerziellen Anbieters", cls: "open" }
  };

  const ask = [
    "Wie viele Stunden Werkstattzugang hast du pro Woche – und gibt es Wartezeiten auf Maschinen?",
    "Was wird im Studium wirklich gelehrt (Zeichnen, Figurine, Schnitt, Modellbau) und was musst du dir selbst beibringen?",
    "Wie oft gibt es Feedback von den Professor:innen, und wie läuft die Betreuung?",
    "Was kostet dich ein Semester wirklich (Material, Fahrten, Miete) und woran hast du anfangs nicht gedacht?",
    "Wie lief die Aufnahmeprüfung konkret – und was hat dich überrascht?",
    "Welche Mappenfehler hast du bei anderen gesehen oder selbst gemacht?",
    "Wie ist die Stimmung unter den Studierenden – Konkurrenz oder Zusammenhalt?",
    "Wie schwer war die Wohnungssuche, und wie hast du es geschafft (Wohnheim, WG)?",
    "Hattest du Erfahrungen mit Geflüchteten-Status oder § 24 an dieser Hochschule (Gebühren, BAföG, Sprachnachweis)?",
    "Würdest du die Hochschule noch einmal wählen – und warum (nicht)?"
  ];
  const where = [
    ["Mappenberatung und Infotage", "Dort sitzen Lehrende und oft auch Studierende. Alle Termine stehen im Abschnitt Termine."],
    ["Jahresausstellungen und Rundgänge", "Abschlussarbeiten ansehen, mit Studierenden am Stand reden (z. B. Examensausstellung AdBK München, Diplomausstellung)."],
    ["Fachschaft und Studierendenvertretung", "Auf der Hochschulseite oder per E-Mail anfragen – sie vermitteln Kontakte und beantworten Fragen zum Alltag."],
    ["Social Media der Studiengänge", "Viele Studiengänge zeigen Studierendenarbeiten und beantworten Direktnachrichten."],
    ["Bewertungsportale und Foren", "StudyCheck, mode-studieren.de und Foren wie precore zeigen Stimmungsbilder. Vorsicht: anonym, subjektiv, oft älter – immer mit der Hochschule gegenprüfen."]
  ];

  const match = (t, p) => t.programs.some(x => x === "*" || (x.endsWith("*") ? p.id.startsWith(x.slice(0, -1)) : x === p.id));
  window.STUDY_STIMMEN = { stand: "01.10.2026", sources: S, tips, kinds, ask, where, match };
})();
