/* ==========================================================================
   STUDIUM 2027 · Kosten, Finanzierung und alles drumherum
   --------------------------------------------------------------------------
   Perspektive: ukrainische Staatsbürgerin mit Aufenthaltserlaubnis nach
   § 24 AufenthG (vorübergehender Schutz), wohnhaft in Aschaffenburg.
   Recherche-Stand: 01.10.2026. Jede Zahl nennt Quelle und Stand.

   Regeln dieses Datensatzes:
   • status "sicher"  = in offiziellen oder behördlichen Quellen belegt
   • status "geplant" = Gesetzentwurf / angekündigt, noch NICHT beschlossen
   • status "klaeren" = hängt vom Einzelfall ab oder war nicht belegbar –
                         bei der genannten Stelle nachfragen
   • "Richtwert" / "Schätzung" ist kenntlich gemacht und keine Quelle.
   • Keine Rechts- oder Sozialberatung. Verbindlich entscheiden Hochschule,
     Ausländerbehörde, BAföG-Amt/Studierendenwerk und Krankenkasse.
   ========================================================================== */
(function () {
  const D = window.STUDY_DATA;
  const STAND = "01.10.2026";
  const L = (label, url) => ({ label, url });

  /* ---------------- Zahlen ---------------- */
  const ticket = { amount: 226.8, perMonth: 37.8, note: "Deutschlandsemesterticket ab Wintersemester 2026/27 (bisher 208,80 €); meist im Semesterbeitrag enthalten.", src: L("Leipziger Zeitung: Deutschland-Semesterticket 226,80 € ab WS 2026/27", "https://www.l-iz.de/wirtschaft/mobilitaet/2026/02/auch-fur-studis-wirds-teurer-deutschland-semesterticket-kostet-ab-nachsten-wintersemester-22680-euro-647322") };

  /** Semesterbeitrag je Hochschule – nur belegte Werte. Alles andere: Richtwert. */
  const semester = {
    "burg": { amount: 274.4, stand: "Stand 2025", src: L("BURG Halle (Angabe in den Studiengangsdaten)", "https://www.burg-halle.de/") },
    "weissensee": { amount: 376.8, stand: "laut Studiengangsdaten", src: L("weißensee kunsthochschule berlin", "https://kh-berlin.de/") },
    "htw": { amount: 375.3, stand: "WS 2026/27", src: L("HTW Berlin: Semesterbeitrag WS 2026/27", "https://www.htw-berlin.de/en/studies/study-organisation/semester-fee") },
    "haw": { amount: 397.0, stand: "WS 2026/27", src: L("HAW Hamburg: Studiengebühren, Lebenshaltung, Stipendien", "https://www.haw-hamburg.de/en/study/tuition-fees-living-expenses-and-scholarships/") },
    "hsbi": { amount: 338.05, stand: "SoSe 2026", src: L("HSBI Bielefeld: Semesterbeitrag", "https://www.hsbi.de/en/academics/semester-contribution") }
  };
  const semOf = p => {
    if (p.id.startsWith("burg-")) return semester.burg;
    if (p.id.startsWith("weissensee-")) return semester.weissensee;
    if (p.id.startsWith("haw-")) return semester.haw;
    if (p.id === "htw-modedesign") return semester.htw;
    if (p.id === "bielefeld-mode") return semester.hsbi;
    return null;
  };
  const semDefault = { amount: 330, lo: 275, hi: 400, note: "Richtwert aus den belegten Hochschulen (275–397 €, inklusive Semesterticket). Genauer Betrag steht im Studierendensekretariat." };

  /** WG-Zimmer pro Monat (warm): [von, bis, Grundlage, belegt?] */
  const rent = {
    berlin: [550, 650, "MLP-Studentenwohnreport 2025: Median-Spanne der großen Städte 532–620 €, Durchschnitt Berlin ca. 650 €", true],
    hamburg: [550, 620, "MLP 2025: Median-Spanne große Städte 532–620 €, Durchschnitt Hamburg ca. 610 €", true],
    muenchen: [700, 760, "MLP 2025: Median München 730 €, Durchschnitt ca. 760 € (teuerster Standort)", true],
    offenbach: [570, 670, "Nachbarstadt Frankfurt: Median 620 €, Durchschnitt ca. 670 € (MLP 2025); Offenbach oft etwas günstiger – Schätzung", false],
    stuttgart: [530, 620, "MLP 2025: Median-Spanne große Städte 532–620 €", true],
    nuernberg: [450, 600, "MLP 2025: an 32 von 38 Standorten liegt der WG-Median zwischen 400 und 600 €", true],
    hannover: [400, 550, "MLP 2025: Spanne 400–600 € (Einzelwert im Diagramm des Reports)", true],
    mainz: [450, 600, "MLP 2025: Spanne 400–600 €", true],
    bielefeld: [400, 520, "MLP 2025: Spanne 400–600 €", true],
    trier: [400, 520, "MLP 2025: Spanne 400–600 €", true],
    dresden: [350, 480, "MLP 2025: ostdeutsche Unistadt, günstig (Spanne 400–600 € gilt als Obergrenze der Mitte)", true],
    halle: [320, 430, "Orientierung MLP 2025: Jena 370 €, Magdeburg 346 €, Chemnitz 295 € – Schätzung für Halle", false],
    reutlingen: [450, 600, "Schätzung (Raum Tübingen/Stuttgart; MLP-Spanne 400–600 €)", false],
    pforzheim: [400, 550, "Schätzung (MLP-Spanne 400–600 €)", false],
    schneeberg: [220, 330, "Schätzung für ländlichen Raum; Chemnitz (295 €) als untere Orientierung", false],
    muenchberg: [250, 380, "Schätzung für ländlichen Raum (Hof); keine eigene Quelle", false]
  };
  const wohnheim = { amount: 305.52, note: "Durchschnittliche Warmmiete im Studierendenwerks-Wohnheim, Ende 2023; Wartelisten sind lang (Wintersemester 2024/25: ca. 34.500 Wartende bei 11 von 57 Studierendenwerken).", src: L("Deutsches Studierendenwerk: Mietkosten für Studierende", "https://www.studierendenwerke.de/presse/pressemitteilungen/pressemitteilung/mietkosten-fuer-studierende-eine-neue-form-der-sozialen-auslese") };

  const bafoeg = {
    now: { label: "heute geltendes Recht", grund: 475, wohn: 380, kv: 102, pv: 35, max: 992, from: "bis 31.03.2027" },
    s1: { label: "ab Sommersemester 2027 (Entwurf)", grund: 475, wohn: 440, kv: 121, pv: 39, max: 1075, from: "ab 01.04.2027" },
    s2: { label: "ab Wintersemester 2027/28 (Entwurf)", grund: 503, wohn: 440, kv: 121, pv: 39, max: 1103, from: "ab 01.08.2027" },
    src: L("studierenplus.de: BAföG-Reform 2027 (Kabinettsentwurf vom 12.08.2026)", "https://www.studierenplus.de/bafoeg/bafoeg-reform-2027"),
    note: "Die Beträge ab 2027 stammen aus einem Kabinettsentwurf (12.08.2026); Bundestag und Bundesrat müssen noch zustimmen. Höchstsatz gilt nur bei entsprechend niedrigem Einkommen der Eltern."
  };

  const defaults = { form: "wg", material: 80, kv: 150, grund: 475 };

  /* ---------------- Karten: „Was für dich gilt“ ---------------- */
  const cards = [
    {
      id: "gebuehren", tag: "Geld", status: "sicher", title: "Studiengebühren: fast nirgends – Sonderfall Baden-Württemberg und Bayern",
      text: "In 24 der 30 Studiengänge gibt es keine Studiengebühren, nur den Semesterbeitrag. In Baden-Württemberg (ABK Stuttgart, HS Reutlingen, HS Pforzheim) zahlen internationale Studierende aus Nicht-EU-Staaten 1.500 € pro Semester – Inhaber:innen einer Aufenthaltserlaubnis nach § 24 AufenthG sind davon befreit, solange der Titel gilt. In Bayern (AdBK München, HS Hof) erheben einzelne Hochschulen seit 2024/25 Gebühren für Nicht-EU-Studierende; ob § 24-Inhaber:innen dort befreit sind, ließ sich nicht belegen.",
      todo: ["Baden-Württemberg: Befreiung vor Semesterbeginn schriftlich beantragen (Auskunftsformular der Hochschule)", "Bayern (München, Hof): Gebührensatzung lesen oder per Mail fragen, ob § 24 befreit", "Befreiung gilt nur für die Laufzeit des Titels – Verlängerung im Blick behalten"],
      src: [L("Wissenschaftsministerium BW: Gebühren für internationale Studierende (FAQ)", "https://mwk.baden-wuerttemberg.de/de/hochschulen-studium/studieren-in-bw/studienfinanzierung/gebuehren-fuer-internationale-studierende-und-zweitstudium/faqs"), L("DHBW: Auskunftsformular § 5 Ausnahmen (Beispiel für den Antrag)", "https://www.dhbw.de/fileadmin/user_upload/Dokumente/Dokumente_fuer_Studieninteressierte/Vorlage_Auskunftsformular___5_Ausnahmen_v2_062026.pdf"), L("Koordinationsstelle Ukraine Bayern: Study in Bavaria 2026", "https://www.uni-regensburg.de/fileadmin/sub-websites/bayhost/user_upload/form_definitions/Koordinationsstelle_Ukraine/Infos_fuer_Studis/Study_in_Bavaria_DE__2026_.pdf")]
    },
    {
      id: "bafoeg", tag: "Geld", status: "sicher", title: "BAföG: Anspruch mit § 24 – das Bürgergeld wird durch BAföG ersetzt",
      text: "Mit einer Aufenthaltserlaubnis nach § 24 AufenthG besteht seit dem 1. Juni 2022 Anspruch auf BAföG zu denselben Bedingungen wie bei deutschen Studierenden: Vollzeitstudium an einer inländischen Hochschule, Zulassung und Einschreibung, eine Altersgrenze bei Studienbeginn (rund 45 Jahre – für dich ohne Bedeutung). Mit Studienbeginn entfällt das Bürgergeld, das BAföG tritt an die Stelle. Die Höhe hängt vom Einkommen der Eltern ab; für Eltern im Ausland gibt es Sonderregeln, die das BAföG-Amt prüft. BAföG ist zur Hälfte ein zinsloses Darlehen (Rückzahlung bei 10.010 € gedeckelt). Im Bachelor ist nach dem 4. Fachsemester ein Leistungsnachweis nötig.",
      todo: ["Beim Studierendenwerk der Zielstadt einen BAföG-Beratungstermin machen – mit Hinweis auf § 24 und Eltern im Ausland", "Antrag spätestens im Monat des Studienbeginns stellen: Förderung gibt es ab dem Antragsmonat, frühestens ab Studienbeginn. Ein formloser Antrag genügt zunächst, Geld fließt aber erst mit vollständigen Unterlagen", "Unterlagen sammeln: Aufenthaltstitel, Zulassung, Einkommensnachweise der Eltern (ggf. Auslandsunterlagen)"],
      src: [L("Deutsches Studierendenwerk: BAföG-FAQ (Stand 01/2026)", "https://www.studierendenwerke.de/fileadmin/user_upload/FAQ_BAfoeG_01-2026.pdf"), L("Studierendenwerk Hamburg: BAföG für Studierende aus der Ukraine (PDF)", "https://www.stwhh.de/fileadmin/user_upload/Internationales/__Downloads/Studierende_aus_dem_Ausland/Studierende_mit_Fluchthintergrund/BAfoeG_Studierende_Ukraine.pdf"), L("Deutsches Studierendenwerk: Aufenthalt und Sozialleistungen für Studierende aus der Ukraine", "https://www.studierendenwerke.de/fileadmin/user_upload/15032022_aufenthalt_und_sozialleistungen_fuer_studierende_aus_der_ukraine.pdf")]
    },
    {
      id: "bafoeg-hoehe", tag: "Geld", status: "geplant", title: "BAföG-Höhe zu deinem Studienstart: Erhöhung geplant, noch nicht beschlossen",
      text: "Heute gilt ein Höchstsatz von 992 € (Grundbedarf 475 €, Wohnpauschale 380 €, Zuschläge für Kranken- und Pflegeversicherung 137 €). Der Kabinettsentwurf vom 12.08.2026 sieht ab 01.04.2027 eine Wohnpauschale von 440 € (Höchstsatz ca. 1.075 €) und ab 01.08.2027 einen Grundbedarf von 503 € (Höchstsatz ca. 1.103 €) vor. Das ist ein Entwurf: Bundestag und Bundesrat müssen noch zustimmen.",
      todo: ["Im Kosten-Rechner beide Varianten ansehen", "Nicht mit dem Höchstsatz fest rechnen – er gilt nur bei niedrigem Elterneinkommen"],
      src: [L("studierenplus.de: BAföG-Reform 2027", "https://www.studierenplus.de/bafoeg/bafoeg-reform-2027"), L("Finanztip: BAföG", "https://finanztip.de/bafoeg/")]
    },
    {
      id: "aufenthalt", tag: "Aufenthalt", status: "klaeren", title: "Aufenthaltstitel: gültig bis 04.03.2027, EU-Schutz bis 04.03.2028 verlängert",
      text: "Aufenthaltserlaubnisse nach § 24, die am 01.02.2026 gültig waren, laufen automatisch bis 04.03.2027. Der EU-Rat hat den vorübergehenden Schutz am 30.07.2026 bis zum 04.03.2028 verlängert (Amtsblatt 04.08.2026). Wie Deutschland die Titel danach verlängert, lag zum Recherchestand nicht vor. Für die Einschreibung (Sommersemester 2027 oder Wintersemester 2027/28) brauchst du einen gültigen Nachweis. Wer mit § 24 studiert, braucht kein Studierendenvisum und keinen Wechsel des Titels.",
      todo: ["Bei der Ausländerbehörde Aschaffenburg regelmäßig auf Mitteilungen zur Verlängerung achten und rechtzeitig Termin buchen", "Vor einem Umzug zum Studienort die Ausländerbehörde fragen (Wohnsitz und Zuständigkeit)", "Kopie des Titels in jede Bewerbung und zur Immatrikulation mitnehmen"],
      src: [L("asyl.net: Verlängerung des vorübergehenden Schutzes im Amtsblatt", "https://www.asyl.net/view/verlaengerung-des-voruebergehenden-schutzes-fuer-personen-aus-der-ukraine-im-amtsblatt-erschienen"), L("migrando: Deutschland verlängert Aufenthaltserlaubnis bis 2027", "https://migrando.de/news/aufenthaltstitel/deutschland-verlaengert-aufenthaltserlaubnis-fuer-gefluechtete-aus-der-ukraine-bis-2027/"), L("Koordinationsstelle Ukraine Bayern: Leitfaden Studium und Bewerbung", "https://www.uni-regensburg.de/bayhost/laenderkompetenzen/koordinationsstelle-ukraine/studierende-und-schuelerinnen-schueler/hzb-und-bewerbung")]
    },
    {
      id: "sperrkonto", tag: "Aufenthalt", status: "sicher", title: "Kein Sperrkonto nötig",
      text: "Regulär müssen internationale Studierende ein Sperrkonto von 11.904 € nachweisen. Für Inhaber:innen eines Titels nach § 24 AufenthG entfällt dieser Nachweis.",
      todo: ["Trotzdem für die Einschreibung den Titel und die Meldebescheinigung bereithalten"],
      src: [L("Koordinationsstelle Ukraine Bayern: Study in Bavaria 2026", "https://www.uni-regensburg.de/fileadmin/sub-websites/bayhost/user_upload/form_definitions/Koordinationsstelle_Ukraine/Infos_fuer_Studis/Study_in_Bavaria_DE__2026_.pdf")]
    },
    {
      id: "buergergeld", tag: "Geld", status: "klaeren", title: "Bürgergeld und Rechtskreiswechsel: wann du eingereist bist, zählt",
      text: "Die Neuregelung, nach der Ukrainer:innen mit § 24 statt Bürgergeld Leistungen nach dem Asylbewerberleistungsgesetz bekommen, betrifft Personen, deren Titel erstmals nach dem 31.03.2025 erteilt wurde. Wer vorher eingereist ist und Bürgergeld bezieht, bleibt laut Berichten im bisherigen System. Mit Studienbeginn ersetzt in beiden Fällen in der Regel das BAföG die laufende Leistung.",
      todo: ["Beim Jobcenter und beim BAföG-Amt frühzeitig klären, ab wann Leistungen enden und BAföG beginnt (Lücken vermeiden)", "Beratung nutzen: Migrationsberatung für erwachsene Zugewanderte (MBE) oder Sozialberatung des Studierendenwerks"],
      src: [L("migrando: Bürgergeld-Aus für Ukrainer – Gesetz ab Juli 2026", "https://migrando.de/en/news/residence-permit/buergergeld-aus-fuer-ukrainer-tritt-das-gesetz-im-juli-2026-in-kraft/"), L("Deutsches Studierendenwerk: Drittstaatsangehörige Studierende (PDF)", "https://www.studierendenwerke.de/fileadmin/user_upload/20221115_drittstaatsangehoerige_studierende.pdf")]
    },
    {
      id: "kv", tag: "Alltag", status: "klaeren", title: "Krankenversicherung als Studentin",
      text: "Mit der Einschreibung wechselst du in der Regel in die studentische Krankenversicherung. Richtwert 2026: etwa 110–130 € Krankenversicherung (je nach Kasse und Zusatzbeitrag) plus rund 31–36 € Pflegeversicherung. Das BAföG enthält dafür heute einen Zuschlag von 137 € (geplant ab April 2027: 160 €). Die Beiträge sind bundesweit gesetzlich einheitlich berechnet, die Kassen unterscheiden sich im Zusatzbeitrag.",
      todo: ["Kassen vergleichen und Studierendentarif anfragen", "Die Versicherungsbescheinigung wird zur Immatrikulation verlangt"],
      src: [L("AOK: Kosten und Beitrag zur studentischen Krankenversicherung", "https://www.aok.de/pp/rechengroessen/kostenueberblick-studentischen-krankenversicherung/"), L("hkk: Gut im Studium 2026 (PDF)", "https://assets.hkk.de/fileadmin/dateien/allgemeines_uebergeordnet/broschueren-infoblaetter/vertriebspartner/260113_hkk_faltblatt_gut_im_studium_2026.pdf")]
    },
    {
      id: "uniassist", tag: "Zugang", status: "sicher", title: "uni-assist: 75 € für die erste, 30 € für jede weitere Bewerbung",
      text: "Vier deiner Studiengänge laufen über uni-assist (BURG Halle, UdK Berlin, HAW Hamburg, HS Hannover). uni-assist verlangt 75 € für die erste Bewerbung und 30 € für jede weitere im selben Semester. Einen Gebührenerlass für Geflüchtete gibt es seit 2020 nicht mehr; einzelne Hochschulen erstatten sie in eigenen Programmen (Beispiel: Die TU München erstattet die 75 € Teilnehmenden ihres Integrationsprogramms für Geflüchtete aus der Ukraine). Ob eine deiner Hochschulen so etwas anbietet, musst du dort erfragen.",
      todo: ["VPD früh beantragen (Bearbeitung meist 4–6 Wochen)", "Beim International Office jeder Hochschule fragen, ob die uni-assist-Gebühr für Geflüchtete erstattet wird"],
      src: [L("uni-assist: Gebühren", "https://www.uni-assist.de/en/how-to-apply/pay-all-fees/handling-fees/"), L("TU München: Integrationsprogramm für Geflüchtete aus der Ukraine (Beispiel für Erstattung)", "https://www.tum.de/en/studies/international-students/ukraine/integration-program")]
    },
    {
      id: "stipendien", tag: "Geld", status: "klaeren", title: "Stipendien: für Studienanfängerinnen gibt es wenig Ukraine-Spezifisches – trotzdem suchen",
      text: "Das DAAD-Programm „Zukunft Ukraine“, das 400 geflüchtete Studierende gefördert hat, ist im Juli 2025 ausgelaufen. Die 2026 laufenden DAAD-Sonderprogramme richten sich an Master-Studierende und Forschende, nicht an Bachelor-Bewerberinnen. Übrig bleiben vor allem hochschuleigene Programme: Zuletzt ausgeschrieben waren zum Beispiel Teil-Stipendien von 250 € pro Monat für höchstens 6 Monate (weißensee kunsthochschule, STIBET Ukraine, Sommersemester 2026) – solche Ausschreibungen wiederholen sich oft pro Semester. Dazu kommen allgemeine Stipendien-Datenbanken und die Härtefonds der Studierendenwerke.",
      todo: ["Beim International Office jeder Hochschule nach „Stipendium Ukraine / STIBET“ und „Härtefonds“ fragen", "Im Stipendienlotse des Bundes und bei mystipendium.de mit Filter „Kunst/Design“ und „Geflüchtete“ suchen", "Fristen im Kalender notieren – oft Frühjahr/Sommer für das Wintersemester"],
      src: [L("DAAD Journal 2025: Unterstützung für das ukrainische Hochschulsystem (Programmende Juli 2025)", "https://www.daad.de/de/der-daad/daad-journal/themen/2025/unterstuetzung-fuer-das-ukrainische-hochschulsystem/"), L("DAAD Stipendiendatenbank: Zukunft Ukraine, Forschungsstipendien (Master und Forschende)", "https://www2.daad.de/deutschland/stipendium/datenbank/de/21148-stipendiendatenbank/?detail=57650857"), L("weißensee: Ausschreibung Stipendien Ukraine STIBET 2026 (PDF)", "https://kh-berlin.de/fileadmin/user_upload/Ausschreibung_Stipendien_Ukraine_Stibet-2026.pdf"), L("Stipendienlotse (BMBF): Datenbank", "https://www.stipendienlotse.de/datenbank.php"), L("mystipendium.de", "https://www.mystipendium.de")]
    },
    {
      id: "wohnen", tag: "Alltag", status: "sicher", title: "Wohnen: Wohnheim ca. 305 €, WG ca. 300–750 € – je nach Stadt",
      text: "Im Studierendenwerks-Wohnheim zahlst du im Schnitt rund 305 € warm, aber die Wartelisten sind lang. Ein WG-Zimmer kostet laut MLP-Studentenwohnreport 2025 zwischen rund 300 € (ostdeutsche Städte) und rund 730 € (München, Median). Private Studierendenwohnheime kosten 800–950 €. Details je Stadt im Kosten-Rechner.",
      todo: ["Sofort nach der Zulassung beim Studierendenwerk bewerben – bei manchen schon vorher", "Nie Geld vorab überweisen und keine Wohnung ohne Besichtigung oder Vertrag zusagen"],
      src: [L("MLP Studentenwohnreport 2025 (PDF)", "https://www.kreditwesen.de/sites/default/files/content/inserts/2025/mlp-studentenwohnreport-2025.pdf"), L("Deutsches Studierendenwerk: Mietkosten für Studierende", "https://www.studierendenwerke.de/presse/pressemitteilungen/pressemitteilung/mietkosten-fuer-studierende-eine-neue-form-der-sozialen-auslese")]
    },
    {
      id: "semesterbeitrag", tag: "Alltag", status: "sicher", title: "Semesterbeitrag und Semesterticket",
      text: "Jedes Semester zahlst du einen Semesterbeitrag (Verwaltung, Studierendenwerk, Studierendenschaft, meist mit Semesterticket). Belegt sind 274,40 € (BURG), 338,05 € (Bielefeld), 375,30 € (HTW Berlin), 376,80 € (weißensee) und 397 € (HAW Hamburg). Das Deutschlandsemesterticket kostet ab Wintersemester 2026/27 226,80 € pro Semester (37,80 € im Monat).",
      todo: ["Beitrag fristgerecht zahlen – ohne Zahlung keine Immatrikulation", "Als BAföG-Empfängerin Befreiung vom Rundfunkbeitrag beantragen"],
      src: [L("HTW Berlin: Semesterbeitrag", "https://www.htw-berlin.de/en/studies/study-organisation/semester-fee"), L("HAW Hamburg: Gebühren und Lebenshaltung", "https://www.haw-hamburg.de/en/study/tuition-fees-living-expenses-and-scholarships/"), L("HSBI: Semesterbeitrag", "https://www.hsbi.de/en/academics/semester-contribution")]
    },
    {
      id: "sprache", tag: "Zugang", status: "klaeren", title: "Sprachnachweise kosten Geld – und Zeit",
      text: "Je nach Hochschule brauchst du B2 oder C1 Deutsch (Tabelle im Abschnitt „Zeugnis, Zugang, Sprache“). Preise des Goethe-Instituts in Deutschland 2026 (Gesamtprüfung, Erwachsene): Goethe-Zertifikat B2 289 €, C1 349 €; Kursteilnehmende des Goethe-Instituts bekommen 20 % Rabatt. Andere Anbieter (z. B. telc, TestDaF) und andere Länder haben andere Preise. Die HfBK Dresden erlaubt Bewerber:innen aus der Ukraine, den B2-Nachweis zu verschieben.",
      todo: ["Prüfungstermine früh buchen, sie sind oft ausgebucht", "Beim International Office nach Zuschüssen oder kostenlosen Sprachkursen für Geflüchtete fragen"],
      src: [L("Goethe-Institut Deutschland: Preise Deutschprüfungen", "https://www.goethe.de/ins/de/de/prf/pre.html"), L("HfBK Dresden: Internationale Bewerber:innen", "https://www.hfbk-dresden.de/en/studies/application/international-applicants")]
    },
    {
      id: "arbeiten", tag: "Geld", status: "sicher", title: "Arbeiten neben dem Studium",
      text: "Die Aufenthaltserlaubnis nach § 24 berechtigt zur Ausübung einer Erwerbstätigkeit. Eigenes Einkommen wird beim BAföG oberhalb eines Freibetrags angerechnet – vor dem Start eines Nebenjobs beim BAföG-Amt nach der aktuellen Grenze fragen.",
      todo: ["Nebenjob-Grenze beim BAföG-Amt erfragen, bevor du den Vertrag unterschreibst", "Werkstudierendenstellen und Hilfskraftstellen der Hochschule prüfen (kunstnah, flexibel)"],
      src: [L("Deutsches Studierendenwerk: Aufenthalt und Sozialleistungen für Studierende aus der Ukraine", "https://www.studierendenwerke.de/fileadmin/user_upload/15032022_aufenthalt_und_sozialleistungen_fuer_studierende_aus_der_ukraine.pdf")]
    },
    {
      id: "material", tag: "Alltag", status: "klaeren", title: "Material, Mappe und Praktikum – die versteckten Kosten",
      text: "Kunst- und Designstudium heißt Material: Stoffe, Farbe, Leinwand, Modellbau, Fotos, Druck. Eine verlässliche Zahl gibt es nicht; im Rechner ist ein eigener Schätzwert von 80 € pro Monat voreingestellt, den du anpassen kannst. Einmalig kommen Bewerbungskosten dazu (uni-assist, Prüfungsgebühren, Druck und Porto bei physischen Mappen wie Reutlingen, Hof, Schneeberg, München). Pflichtpraktika sind oft unbezahlt (BURG Design 3 Monate, Trier 12 Wochen, Dresden Kostümgestaltung 5 Monate).",
      todo: ["Materialbudget nach dem ersten Semester an die Realität anpassen", "Praktika früh planen: Zeit und Einkommen fehlen währenddessen"],
      src: [L("HfBK Dresden: Erfahrungen Studierender zu Bühnen- und Kostümbild (StudyCheck)", "https://www.studycheck.de/studium/buehnen-und-kostuembild/hfbk-dresden-4929")]
    }
  ];

  /* ---------------- Zeitleiste: von der Bewerbung zum ersten Semester ---------------- */
  const steps = [
    { when: "Jetzt – November 2026", title: "Bewerbungen priorisieren, VPD beantragen", text: "uni-assist-VPD braucht meist 4–6 Wochen (BURG, UdK, HAW, Hannover). Gebühren einplanen: 75 € für die erste, 30 € für jede weitere Bewerbung." },
    { when: "Bis zur Abgabe", title: "Aufenthaltstitel und Kopien bereit", text: "Titel nach § 24 (aktuell bis 04.03.2027), Pass, Meldebescheinigung, Übersetzungen des Zeugnisses." },
    { when: "Februar – Juni 2027", title: "Prüfungen und Gespräche", text: "Zugangsprüfungen je nach Hochschule; zu den Terminen siehe Abschnitt Termine." },
    { when: "Direkt nach der Zusage", title: "Wohnen und Geld sichern", text: "Wohnheimbewerbung beim Studierendenwerk, WG-Suche, BAföG-Antrag stellen (Förderung ab Antragsmonat, frühestens ab Studienbeginn; formloser Antrag genügt zunächst), Befreiung von Studiengebühren in Baden-Württemberg oder Bayern beantragen." },
    { when: "Vor der Einschreibung", title: "Versicherung, Beitrag, Nachweise", text: "Studentische Krankenversicherung, Zahlung des Semesterbeitrags, gültiger Aufenthaltsnachweis, Ummeldung und Ausländerbehörde am neuen Wohnort." },
    { when: "Semesterstart", title: "Alltag einrichten", text: "Semesterticket abholen, Rundfunkbeitrag-Befreiung beantragen, Bankkonto, Werkstätten-Einweisung, Mappenberatung der Professor:innen nutzen." }
  ];

  /* ---------------- Beratungsstellen ---------------- */
  const help = [
    ["Studierendenwerk (Sozialberatung, BAföG-Amt, Wohnen)", "Zuständig ist das Studierendenwerk der Hochschulstadt. Dort BAföG, Härtefonds, Wohnheim.", "https://www.studierendenwerke.de"],
    ["International Office der Hochschule", "Fragen zu Zulassung, Gebührenbefreiung, Stipendien für Geflüchtete.", ""],
    ["Migrationsberatung für erwachsene Zugewanderte (MBE)", "Kostenlose Beratung zu Aufenthalt, Leistungen und Studium.", ""],
    ["Ausländerbehörde (Aschaffenburg und Studienort)", "Verlängerung des Titels, Wohnsitz und Umzug.", ""],
    ["Jobcenter / BAföG-Amt", "Übergang von Bürgergeld zu BAföG ohne Lücke abstimmen.", ""]
  ];

  /* ---------------- Glossar und Checkliste ergänzen ---------------- */
  const gl = [
    { term: "§ 24 AufenthG", de: "Aufenthaltserlaubnis für vorübergehenden Schutz, z. B. für Geflüchtete aus der Ukraine. Sie erlaubt Arbeit und Studium.", ua: "Посвідка на проживання для тимчасового захисту, наприклад для біженців з України. Дозволяє працювати й навчатися." },
    { term: "BAföG", de: "Staatliche Ausbildungsförderung für Studierende. Zur Hälfte Zuschuss, zur Hälfte zinsloses Darlehen. Antrag beim Studierendenwerk.", ua: "Державна допомога студентам. Наполовину безповоротна, наполовину безвідсотковий кредит. Заява до Studierendenwerk." },
    { term: "Studierendenwerk", de: "Wirtschaftliche Einrichtung für Studierende: Mensa, Wohnheime, BAföG-Amt, Sozialberatung.", ua: "Заклад для студентів: їдальня, гуртожитки, відділ BAföG, соціальна консультація." },
    { term: "Semesterticket", de: "Fahrkarte für den Nahverkehr, im Semesterbeitrag enthalten. Das Deutschlandsemesterticket gilt bundesweit.", ua: "Проїзний на громадський транспорт, входить у семестровий внесок. Deutschlandsemesterticket діє по всій Німеччині." },
    { term: "Sperrkonto", de: "Konto mit Mindestbetrag (11.904 €), das internationale Studierende nachweisen müssen. Mit § 24 nicht nötig.", ua: "Заблокований рахунок із мінімальною сумою (11 904 €) для іноземних студентів. За § 24 не потрібен." },
    { term: "Fiktionsbescheinigung", de: "Vorläufiger Nachweis, dass ein Antrag auf Aufenthaltstitel gestellt wurde und der Aufenthalt weiter erlaubt ist.", ua: "Тимчасовий документ про те, що заяву на посвідку подано і перебування залишається законним." },
    { term: "Wohnheim", de: "Günstiges Zimmer vom Studierendenwerk (Ø ca. 305 € warm). Wartelisten sind lang – früh bewerben.", ua: "Дешева кімната від Studierendenwerk (в середньому ≈ 305 € з комуналкою). Черги довгі – подавайте заявку рано." },
    { term: "Rundfunkbeitrag", de: "Gebühr für öffentlich-rechtlichen Rundfunk. BAföG-Empfänger:innen können Befreiung beantragen.", ua: "Збір на суспільне мовлення. Одержувачі BAföG можуть подати заяву на звільнення." }
  ];
  const ck = [
    { id: "k-aufenthalt", group: "Finanzen und Aufenthalt", title: "Aufenthaltstitel § 24 prüfen und Kopie bereithalten", text: "Gültig bis 04.03.2027 – Verlängerung beobachten; für die Einschreibung nötig.", ua: "Перевірити посвідку за § 24 і мати копію" },
    { id: "k-bafoeg", group: "Finanzen und Aufenthalt", title: "BAföG-Beratung beim Studierendenwerk und Antrag vorbereiten", text: "Hinweis auf § 24 und Eltern im Ausland; Förderung ab Antragsmonat, frühestens ab Studienbeginn.", ua: "Консультація щодо BAföG у Studierendenwerk, підготувати заяву" },
    { id: "k-gebuehr", group: "Finanzen und Aufenthalt", title: "Befreiung von Studiengebühren klären (Baden-Württemberg, Bayern)", text: "Nur falls du dich dort bewirbst: Antrag vor Semesterbeginn.", ua: "З'ясувати звільнення від плати за навчання (BW, Bayern)" },
    { id: "k-uniassist", group: "Finanzen und Aufenthalt", title: "uni-assist-Gebühren einplanen (75 € / 30 €)", text: "Gilt für BURG, UdK, HAW und HS Hannover. Erstattung beim International Office erfragen.", ua: "Врахувати збори uni-assist (75 € / 30 €)" },
    { id: "k-stip", group: "Finanzen und Aufenthalt", title: "Stipendien recherchieren und Fristen notieren", text: "STIBET/DAAD Ukraine, Stipendienlotse, Härtefonds der Studierendenwerke.", ua: "Знайти стипендії та записати терміни" },
    { id: "k-wohnheim", group: "Nach der Zusage", title: "Wohnheim beim Studierendenwerk beantragen", text: "Wartelisten sind lang – sofort nach der Zusage, bei manchen schon früher.", ua: "Подати заявку на гуртожиток у Studierendenwerk" },
    { id: "k-kv", group: "Nach der Zusage", title: "Studentische Krankenversicherung wählen", text: "Bescheinigung wird zur Immatrikulation verlangt.", ua: "Обрати студентське медичне страхування" },
    { id: "k-umzug", group: "Nach der Zusage", title: "Ausländerbehörde: Umzug und Wohnsitz klären", text: "Vor dem Umzug fragen, danach ummelden.", ua: "Відомство у справах іноземців: переїзд і місце проживання" },
    { id: "k-budget", group: "Nach der Zusage", title: "Monatsbudget im Kosten-Rechner prüfen", text: "Miete, Versicherung, Beitrag, Material – gegen das BAföG gerechnet.", ua: "Перевірити місячний бюджет у калькуляторі витрат" }
  ];
  if (D && Array.isArray(D.glossary)) gl.forEach(g => { if (!D.glossary.some(x => x.term === g.term)) D.glossary.push(g); });
  if (D && Array.isArray(D.checklist)) ck.forEach(c => { if (!D.checklist.some(x => x.id === c.id)) D.checklist.push(c); });

  /* ---------------- Berechnungen ---------------- */
  const BW = ["abk-textildesign", "abk-buehne-kostuem", "reutlingen-ftd", "pforzheim-mode"];
  const BY = ["hof-textildesign", "muenchen-buehne-kostuem"];
  function tuition(p) {
    if (BW.includes(p.id)) return { cls: "ok", short: "§ 24: befreit (BW)", text: "Baden-Württemberg erhebt 1.500 € pro Semester von Nicht-EU-Studierenden – Inhaber:innen eines Titels nach § 24 sind befreit, solange der Titel gilt. Antrag vor Semesterbeginn stellen." };
    if (BY.includes(p.id)) return { cls: "tight", short: "Bayern: klären", text: "In Bayern erheben einzelne Hochschulen Gebühren für Nicht-EU-Studierende. Ob § 24-Inhaber:innen befreit sind, ließ sich nicht belegen – vor der Bewerbung bei der Hochschule schriftlich klären." };
    return { cls: "ok", short: "keine Studiengebühren", text: "Keine Studiengebühren (nur der Semesterbeitrag)." };
  }
  function applyFees(p) {
    const out = [];
    const m = /Bewerbungsgebühr (\d+) €/.exec(p.fees || "");
    if (m) out.push({ label: "Bewerbungsgebühr der Hochschule", amount: Number(m[1]) });
    if (p.internationalApplication && p.internationalApplication.route === "uni-assist") out.push({ label: "uni-assist (VPD): 75 € erste / 30 € weitere Bewerbung", amount: 75, uni: true });
    return out;
  }
  function budget(o) {
    const r = rent[o.city] || rent.berlin;
    const mid = Math.round((r[0] + r[1]) / 2);
    const miete = o.form === "wohnheim" ? Math.round(wohnheim.amount) : mid;
    const sem = o.sem != null ? o.sem : semDefault.amount;
    const lines = [
      { k: "Miete", v: miete, n: o.form === "wohnheim" ? "Wohnheim (Ø)" : `WG-Zimmer, Mitte der Spanne ${r[0]}–${r[1]} €` },
      { k: "Essen, Kleidung, Alltag", v: o.grund, n: "Grundbedarf-Richtwert wie im BAföG" },
      { k: "Kranken- und Pflegeversicherung", v: o.kv, n: "Richtwert studentische Versicherung" },
      { k: "Semesterbeitrag (pro Monat)", v: Math.round(sem / 6 * 10) / 10, n: `${sem.toFixed(2).replace(".", ",")} € pro Semester` },
      { k: "Material für das Studium", v: o.material, n: "eigene Schätzung" }
    ];
    const total = Math.round(lines.reduce((s, l) => s + l.v, 0));
    return { lines, total, rent: r, miete };
  }

  window.STUDY_KOSTEN = { stand: STAND, ticket, semester, semOf, semDefault, rent, wohnheim, bafoeg, defaults, cards, steps, help, tuition, applyFees, budget, BW, BY };
})();
