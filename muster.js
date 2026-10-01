/* ==========================================================================
   STUDIUM 2027 · Werkkatalog, Kunstprofessor-Analyse und Musterbewerbungen
   --------------------------------------------------------------------------
   Grundlage: PORTFOLIO_INHALT_VVH.pdf (64 Seiten, Acryl 2023–25, Öl 2026,
   Textil 2025–26) – jedes Blatt wurde einzeln angesehen.

   WICHTIG – was dieser Datensatz ist und was nicht:
   • Die Analyse ist eine fachliche Einschätzung (Bildsprache, Handwerk,
     Dokumentation), keine Note und keine Zulassungsprognose.
   • Eine Musterbewerbung wählt aus den vorhandenen Arbeiten genau die aus,
     die zu den VERÖFFENTLICHTEN Kriterien der jeweiligen Hochschule passen
     (Anzahl, Format, Pflichtinhalte aus data.js). Zulassungen können weder
     diese Seite noch sonst jemand garantieren – Aufnahmeprüfungen sind
     Auswahlverfahren mit mehr Bewerbungen als Plätzen.
   • Slot-Arten: w = vorhandenes Werk · m = Montage aus Vorhandenem (wenige
     Stunden) · n = neu zu erstellen (Aufwand in Tagen) · d = Dokument.
   ========================================================================== */
(function () {
  const D = window.STUDY_DATA;

  /* ---------- Katalog: id → [Titel, Jahr, Technik, Maße, Serie, Wert★, Notiz] ----------
     Wert: 3 = Schlüsselblatt · 2 = stark · 1 = Ergänzung/Detail/Studie                  */
  const RAW = {
    /* Acryl – Silhouette und Fläche */
    "haubus": ["Haubus", "2024", "Acryl auf Leinwand", "78 × 118 cm", "acryl-fl", 3, "Körper als flache Elfenbeinform, nur Gesicht und Fuß sind modelliert (Blau). Die stärkste Formidee der Acrylgruppe: Kleidung wird zur Architektur – genau die Position, die Malerei und Textil verbindet. Laut Website verkauft: nur als Foto oder Druck verwendbar, nicht als Original."],
    "tanz": ["Tanz", "2024", "Acryl auf Leinwand", "150 × 220 cm", "acryl-fl", 3, "Größte Arbeit, schwebende verdrehte Körper mit weißen Ovalen als Leerformen; überzeugende Verkürzungen. Beweist, dass sie Figurengruppen im Großformat trägt."],
    "der-weisse-schuh": ["Der weiße Schuh", "2024", "Acryl auf Leinwand", "40 × 40 cm", "acryl-fl", 1, "Weiße Silhouette mit eingezeichneter Hand und Gesicht. Gutes Beispiel für „Fläche gegen Zeichnung“, die Form wirkt aber weniger zwingend als bei Haubus."],
    "schatten": ["Schatten", "2024", "Acryl auf Leinwand", "25 × 25 cm", "acryl-fl", 1, "Reine Silhouette einer Hockenden mit gestischen Fingern. Belegt Reduktion, ist aber kein Schlüsselblatt."],
    "der-blaue-schuh": ["Der blaue Schuh", "2023", "Acryl auf Leinwand", "29 × 29 cm", "acryl-fl", 2, "Schwarze Form auf hellem Grund, blaues Gesicht in Grimasse – der expressivste Moment der frühen Phase, mit klarer Bildidee."],
    "uims": ["Uims", "2024", "Acryl auf Leinwand", "29 × 29 cm", "acryl-fl", 2, "Hockende Figur mit flachem Hut, Blau-Weiß-Grau. Liest sich wie ein Kostümentwurf: Kleidung, Haltung und Hut sind zusammen gedacht."],
    "kopfbild-in-blau": ["Kopfbild in Blau", "2023", "Acryl auf Leinwand", "30 × 30 cm", "acryl-fl", 2, "Voll modellierter Kopf gegen eine flache Kreisform. Technisch sauber, die Palette ist eng."],
    "schrei": ["Schrei", "2024", "Acryl auf Leinwand", "24 × 30 cm", "acryl-fl", 2, "Zwei verzerrte Münder in einer roten Form: kraftvoll, thematisch aber eine Randposition. Zeigt Expression."],
    "rot": ["Rot", "2023", "Acryl auf Leinwand", "122 × 79 cm", "acryl-fl", 2, "Rote Silhouette, Gesicht in der Kapuzenöffnung, Ritzzeichnung in der Fläche. Erste klare Gewandfigur – Vorläufer der späteren Kostüme."],
    "dive": ["Dive", "2023", "Acryl auf Leinwand", "140 × 90 cm", "acryl-fl", 2, "Figur, die ins Bild hineinzustürzen scheint, halb Rot, halb Schwarz. Mutige Bildaufteilung im Hochformat."],
    "spiegel": ["Spiegel", "2024", "Acryl auf Leinwand", "30 × 30 cm", "acryl-fl", 2, "Zwei Köpfe in spitzen Kegeln, Schwarz-Weiß-Grau. Fast plakativ und grafisch stark – gute Brücke zu Zeichnung und Grafik."],
    /* Acryl – Grisaille 2025 */
    "yak": ["Yak", "2025", "Acryl auf Leinwand", "29 × 29 cm (PDF) / 70 × 90 cm (Website) – bitte prüfen", "acryl-gr", 2, "Maskenhaftes Gesicht über einem Bison: der Mensch-Tier-Hybrid in Reinform und die Schlüsselidee der Serie. Die Maße weichen zwischen PDF und Website ab – vor der Werkliste klären."],
    "yak-ii": ["Yak II", "2025", "Acryl auf Leinwand", "90 × 100 cm", "acryl-gr", 3, "Die stärkste Arbeit 2025: Eine Figur beugt sich unter das Tier, Körper und Fell verschmelzen. Fein modulierte Grauwerte, überzeugende Anatomie."],
    "river-in-the-middle-of-the-cave": ["River in the Middle of the Cave", "2025", "Acryl auf Leinwand", "90 × 100 cm", "acryl-gr", 2, "Zwei Figuren im Dämmerlicht, kühle Graustufen. Atmosphärisch, im Foto aber etwas flau."],
    "kerzberg": ["Kerzberg", "2024", "Acryl auf Leinwand", "150 × 180 cm", "acryl-gr", 3, "Großformatige Tischszene mit Kerzen und schwarzem Block, erzählerisch und dicht. Achtung: Im PDF und auf der Website ist das Foto um 90° gedreht – bewusst? Dann in der Werkliste vermerken, sonst korrigieren."],
    "the-shoemakers": ["The Shoemakers", "2025", "Acryl auf Leinwand", "100 × 90 cm", "acryl-gr", 3, "Vier Köpfe, ein Faden zwischen den Händen: dichte Gruppenkomposition, die Hände tragen die Erzählung. Eine der reifsten Arbeiten."],
    /* Öl 2026 */
    "liturgy": ["Liturgy", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 3, "Drei Gesichter unter einer durchgehenden schwarzen Hutlinie – Rhythmus, Strenge, Ruhe. Die Palette (Blau-Schwarz) ist sehr geschlossen."],
    "die-jagd": ["Die Jagd", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 3, "Türkisgrund, schwarze Masse, weißer Fleck am Bauch: die Flächenspannung der Acrylbilder, jetzt mit Ölmaterie. Die stärkste Komposition von 2026."],
    "yak-rider": ["Yak Rider", "2026", "Öl auf Leinwand", "30 × 40 cm", "oel", 2, "Kleine Tafel mit Rahmen: Figur mit Hut und Hörnern, Verbindung zur Yak-Serie. Der Rahmen wird zum Objekt."],
    "warten": ["Warten", "2026", "Öl auf Leinwand", "29 × 29 cm", "oel", 1, "Halbakt in Nachtblau, gestisch frei, aber Anatomie und Raum wirken unentschieden."],
    "joel": ["Joel", "2026", "Öl auf Leinwand", "20 × 20 cm", "oel", 1, "Kleines Porträt mit pastosem Auftrag und Hut-Motiv. Studiencharakter."],
    "selbstportraet": ["Selbstporträt", "2026", "Öl auf Leinwand", "25 × 31 cm", "oel", 2, "Direkter Blick, dunkles Kopftuch, ruhige Valeurs. Für Kunsthochschulen wichtig: Selbstverortung."],
    "holding-the-young-yak": ["Holding the Young Yak", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 2, "Dreiergruppe mit Tier im Arm. Idee stark, das Foto aber zu dunkel – die Hände gehen verloren. Neu fotografieren."],
    "hermits": ["Hermits", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 1, "Zwei Gesichter in Oliv-Gelb auf fast schwarzem Grund; fotografisch kaum lesbar. Neu fotografieren oder weglassen."],
    "group-portrait-of-monks": ["Group Portrait of Monks", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 3, "Das beste Ölgemälde: Hände, Hell-Dunkel, die Geste des Zeigenden. Klassisch gebaut (Altmeister-Anklang) und doch eigen."],
    "portrait-of-deacons": ["Portrait of Deacons", "2026", "Öl auf Leinwand", "48 × 59 cm", "oel", 2, "Doppelporträt im goldenen Rahmen, warmes Ocker/Orange. Der Rahmen ist Inszenierung."],
    "paladins": ["Paladins", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 3, "Drei Figuren, zwei Akte mit Hüten, Hände greifen ins Bild. Körperlich, kräftiges Inkarnat – zeigt Aktmalerei-Fähigkeit."],
    "portrait-of-deacons-ii": ["Portrait of Deacons II", "2026", "Öl auf Leinwand", "90 × 100 cm", "oel", 2, "Zwei Figuren mit langem Haar bzw. Schleiern, Orange gegen Dunkel, sprechende Hände."],
    "study-of-the-head": ["Study of the Head", "2026", "Öl auf Leinwand", "25 × 30 cm", "oel", 2, "Kopfstudie in warmen Erdtönen mit klarem Hell-Dunkel. Zeigt Beobachtung nach der Natur – im Konvolut selten."],
    /* Textil – Mäntel & Looks */
    "lituus-i": ["Lituus I — «Лігава»", "2026", "Handgenähter Umhang, Malerei, handgeformte Knöpfe", "", "tx-look", 3, "Umhang mit gemalten Figuren (Hornbläser, Trio mit Zylinderhüten) und Knopfreihe: Textil als Bildträger, der erzählt. Schlüsselstück für Kostümbild und Freie Kunst."],
    "lituus-i-2": ["Lituus I · Detail Figurengruppe", "2026", "Malerei auf Leinen, Knopfband", "", "tx-detail", 1, "Detail: Die Figurengruppe neben dem Knopfband zeigt die Zeichnung fast in Originalgröße."],
    "lituus-i-3": ["Lituus I · Detail Hornbläser", "2026", "Malerei auf Leinen, Knopfband", "", "tx-detail", 1, "Detail: Bewegung und Figur in wenigen Strichen."],
    "lituus-i-4": ["Lituus I · Detail Trio", "2026", "Malerei auf Leinen", "", "tx-detail", 1, "Detail: drei Figuren in Reihe – Rhythmus wie im Gruppenbildnis."],
    "weste-und-schuerze": ["Weste und Schürze", "2026", "Wolle, handgearbeitete Textilobjekte, Farbe auf Stoff", "", "tx-look", 3, "Schwarze Wollfigur mit weißen archäologischen Zeichnungen (Schwert, Fragmente) – streng und grafisch, der Stock als Requisit. Gute Silhouette; Foto vor Tuch etwas flau."],
    "dyki-bizony": ["Dyki Bizony", "2025", "Handgenähter Mantel, Tüllrock, gewachstes Garn, Malerei auf Textil", "", "tx-look", 3, "Mantel mit freihändigen Bisons, gefärbter Tüllrock, Stock: das vollständigste Outfit, ein Look, der als Kostüm funktioniert. Den Färbeprozess des Tülls sichtbar machen."],
    "dyki-hutdetail": ["Dyki Bizony · Hutdetail", "2025", "Handgenähter Hut, gewachstes Garn, Malerei auf Textil", "", "tx-detail", 1, "Hut mit Bison-Malerei auf Hutkörper – belegt Handwerk und Motiv im Detail."],
    "dyki-knopfdetail": ["Dyki Bizony · Knopfdetail", "2025", "Handgeformte Knöpfe, gewachstes Garn", "", "tx-detail", 1, "Zwei handgeformte Knöpfe mit „VVH“ – Autorschaft im Kleinsten."],
    "pipes": ["Pipes", "2026", "Handbearbeitete Weste, handgeformte Knöpfe, Malerei auf Textil", "", "tx-look", 3, "Mehrlagiger Look: Weste mit gezeichneten Kosakenpfeifen unter schwarzem Mantel mit Knopfleiste – ein vollständiger Auftritt."],
    "pipes-weste": ["Pipes · Weste", "2026", "Handgenähte Weste, handgeformte Knöpfe, Malerei auf Textil", "", "tx-look", 2, "Weste mit Pfeifenzeichnung und Label „VVH“: Zeichnung auf Textil als Handschrift."],
    "pipes-kopfbedeckung": ["Pipes · Kopfbedeckung", "2026", "Handgenähte Kopfbedeckung, handgeformte Knöpfe", "", "tx-obj", 2, "Kopfbedeckung mit Kinnband aus Knöpfen, Konstruktion klar erkennbar."],
    "pipes-getragen": ["Pipes · Getragene Ansicht", "2026", "Handgenähte Kopfbedeckung, handgeformte Knöpfe, Malerei auf Textil", "", "tx-look", 3, "Das stärkste Foto der Mappe: Profil, Pfeife in der Hand, Hut mit Knopfband – Kleidung als Figur, wie ein altes Porträt. Als Auftaktbild geeignet."],
    "vershnyky": ["«Вершники» / Vershnyky", "2026", "Handgenähter Mantel, Zeichnung auf Textil, ukrainische Kalligrafie, Rostfärbung des Tags", "", "tx-look", 3, "Leinenmantel mit Reiterzeichnungen, innen dunkles Futter mit Handschrift: Kleidung trägt Text."],
    "vershnyky-detail": ["«Вершники» · Detail", "2026", "Mantelinneres, Tag, ukrainische Kalligrafie, Rostfärbung", "", "tx-detail", 3, "Rostgefärbtes Tag und ukrainische Verse im Futter: die stärkste Verbindung aus Material, Schrift und Erinnerung – Kernbild für Textil und Freie Kunst."],
    "skythisches-gold": ["Skythisches Gold", "2026", "Baumwollmantel, handgenähter Baumwollhut", "", "tx-look", 3, "Schwarzer Baumwollmantel mit weißen Motiven skythischen Schmucks (Halsreif, Kamm), Stock, Hut: Archäologie als Dekor und Haltung."],
    "skythisches-gold-objekt": ["Skythisches Gold · Objektansicht", "2026", "Baumwollmantel, Malerei auf Textil", "", "tx-detail", 2, "Aufsicht: schwarzer Stoff mit hellem Futter – starker Hell-Dunkel-Kontrast."],
    "leinenmantel": ["Leinenmantel", "2026", "Handgenähter Leinenmantel, handgeformte Knöpfe, Farbe auf Stoff", "", "tx-look", 3, "Mantel mit archäologischen Gefäßen als Tuschezeichnung – wirkt museal, ruhige und überzeugende Silhouette."],
    "leinenmantel-objekt": ["Leinenmantel · Objektansicht", "2026", "Handgenähter Leinenmantel, Tinte auf Textil", "", "tx-detail", 2, "Mantel flach, innen weißes Futter mit Schrift – Handschrift außen und innen."],
    "bronzezeit": ["Bronzezeit", "2026", "Baumwollmantel und Hut, handgeformte Knöpfe, Malerei auf Textil", "", "tx-look", 3, "Spitzhut aus Leder und grauer Baumwollmantel mit weißen Malmotiven; als Büste vor Schwarz wie ein Porträt."],
    "bronzezeit-getragen": ["Bronzezeit · Getragene Ansicht", "2026", "Baumwollmantel und Hut, handgeformte Knöpfe, Malerei auf Textil", "", "tx-look", 3, "Ganzfigur mit Tüll-Überrock, Wagenrad-Motiv am Saum, Stock – theatrale Silhouette mit klarem Kostümcharakter."],
    "weste-aus-reinem-kaschmir": ["Weste aus reinem Kaschmir", "2026", "Kaschmir, Futter, handgeformte Knöpfe, Pigment und Farbe", "", "tx-look", 2, "Schwarze Weste mit handgeformten Knöpfen, im Futter Bison und Vers – leise und kostbar."],
    "dem-tier-auf-der-spur": ["«Переслідуючи звіра» / Dem Tier auf der Spur", "2026", "Handgenähtes Baumwollhemd, handgeformte Knöpfe, Farbe auf Stoff", "", "tx-look", 2, "Hemd mit Bison- und Jäger-Szene als Komposition, asymmetrischer Saum, gebrannte Knöpfe: Hier wird aus Zeichnung Bekleidung."],
    "trypillische-madonnen": ["Trypillische Madonnen", "2026", "Wollweste, Futter, altes Nähgarn, handgefertigte Knöpfe", "", "tx-look", 3, "Wollweste, Futter rostgefärbt mit Trypillja-Figurinen und alter Stickerei: Material (Rost), Zeichnung und Handarbeit in einem Objekt – sehr stark für Textil."],
    /* Textil – Kopfbedeckungen & Objekte */
    "pidsvichnyk-kerzenhalter": ["Pidsvichnyk / Kerzenhalter", "2026", "Leinenstoff, Pigment, Farbe, handgeformte Knöpfe", "", "tx-obj", 3, "Zylinder mit zwölf Knöpfen über einer Jacke mit Tierbildern – Hybrid aus Hut und Mantel, ohne Gesicht: eine Bühnenfigur."],
    "pidsvichnyk-objekt": ["Pidsvichnyk · Objektansicht", "2026", "Leinenstoff, Pigment, Farbe", "", "tx-obj", 2, "Der Zylinder als Skulptur: Pigmentzeichnung, Garn, gesticktes „VVH“."],
    "zylindrische-kopfbedeckung": ["Handgenähte zylindrische Kopfbedeckung", "2026", "Textilobjekt, handgeformte Knöpfe, Farbe auf Stoff", "", "tx-obj", 2, "Zylinder mit Knopfreihe auf Pappsockel, Leuchtfaden – Skulpturcharakter, stimmungsvolles Foto."],
    "strilez-hut": ["«Стрілець» / Strilez · Hut", "2026", "Handgeformter Hut, Bienenwachs, handmodellierte Knöpfe, Zeichnung auf Textil", "", "tx-obj", 2, "Leinenhut mit Bienenwachs und der Zeichnung eines Schützen – kleines Objekt mit Erzählung."],
    "kopfbedeckung-aus-leder": ["Kopfbedeckung aus Leder", "2026", "Leder, Textilbild, handgenähte Konstruktion", "", "tx-obj", 2, "Lederhut mit Innenbild (skythisches Motiv): außen hart, innen Zeichnung – Konstruktion mit Überraschung."],
    "handgenaehte-kopfbedeckungen": ["Handgenähte Kopfbedeckungen", "2026", "Leder, handgenähte Objekte", "", "tx-obj", 2, "Lederkopfbedeckung mit Knopfreihe am Kragen als Porträt – Form, Oberfläche und Naht bleiben als Spuren sichtbar."],
    /* Textil – Prozess */
    "prozess-knoepfe": ["Arbeitsprozess · Handgeformte Knöpfe", "2026", "Handgeformte Knöpfe, Tinte", "", "tx-prozess", 2, "20 Knöpfe in Reihen, jeweils mit Tinte und Metallnadel markiert – wirkt wie eine Typologie-Tafel. Das stärkste Prozessblatt und Basis einer Materialtafel."],
    "prozess-rueckenteil": ["Arbeitsprozess · Rückenteil", "2026", "Baumwolle, Rostoxidation, Einschreibung", "", "tx-prozess", 2, "Rückenteil an der Wand neben der Trägerin: Prozess und Mensch in einem Bild."],
    "prozess-futterdetail": ["Arbeitsprozess · Futterdetail", "2026", "Metallnadel, Pigment und Farbe", "", "tx-prozess", 2, "Handgeschriebene Verse auf rostgefärbtem Futter – sehr fotogen, sehr persönlich."]
  };

  const SERIES = {
    "acryl-fl": { label: "Acryl · Silhouette und Fläche", years: "2023–24", text: "Die Figur wird aus einer flachen Farbform geschnitten; nur Gesicht und Gliedmaßen sind modelliert. Kühle Palette (Blau, Weiß, Schwarz, Rot). Das ist die Formentscheidung, auf der ihre späteren Kostüme aufbauen: Silhouette zuerst.", risk: "Die kleinen Blätter (Schatten, Der weiße Schuh) wirken neben Haubus und Tanz wie Vorstufen. Maximal zwei davon zeigen." },
    "acryl-gr": { label: "Acryl · Grisaille und Hybridwesen", years: "2024–25", text: "Der Wechsel zur tonalen Malerei: Grauwerte, Maskengesichter, Mensch-Tier-Verschmelzung (Yak II) und dichte Gruppen (The Shoemakers, Kerzberg). Hier steckt ihre erzählerische Stärke.", risk: "Im Foto werden die Grautöne flau (River in the Middle of the Cave). Kerzberg ist gedreht. Beides vor dem Einreichen prüfen." },
    "oel": { label: "Öl · Gruppenbildnisse und Porträts", years: "2026", text: "Der reifste Block: Hell-Dunkel, Hände, Räume aus Tonwerten, Anklänge an altmeisterliche Gruppenbildnisse (Group Portrait of Monks, Paladins, Portrait of Deacons). Die breite schwarze Hutlinie verbindet alles mit ihrem Textil.", risk: "Mehrere Fotos sind zu dunkel (Hermits, Holding the Young Yak, Warten). Mit Tageslicht und manuell angehobener Belichtung neu fotografieren." },
    "tx-look": { label: "Textil · Mäntel und Looks", years: "2025–26", text: "Vollständig von Hand genähte, getragene Figuren mit archäologischer Zeichnung (Skythen, Trypillja, Bronzezeit, Kosakenpfeifen, Reiter). Sie funktionieren als Kostüm und als Bild.", risk: "Die Looks wurden nie nebeneinander gezeigt, und der Hintergrund wechselt von Foto zu Foto. Ein einheitliches Line-up beweist „Serie“ in einem Blick." },
    "tx-obj": { label: "Textil · Hüte und Objekte", years: "2026", text: "Hüte als Skulptur: Pidsvichnyk, Strilez, Leder, Zylinder. Die Hutform ist ihr Zeichen und taucht auch in der Malerei auf.", risk: "Die Objekte stehen einzeln. Als „Hutfamilie“ auf einer Seite werden sie zur Typologie – das lesen Jurys als Forschung." },
    "tx-prozess": { label: "Textil · Innenleben und Prozess", years: "2026", text: "Rostgefärbte Futter, Kalligrafie, Knöpfe als Typologie. Das Verborgene ist ihr stärkstes Material-Argument.", risk: "Nur drei Prozessblätter und keine Skizze, Figurine oder Schnittidee. Das ist die zweitgrößte Lücke nach der Zeichnung." }
  };

  /* In data.js eintragen, damit Galerie/Thumbs der App die neuen Werke kennen */
  const catalog = {};
  Object.entries(RAW).forEach(([id, r]) => {
    const kind = /^(acryl|oel)/.test(r[4]) ? "malerei" : "textil";
    catalog[id] = { id, title: r[0], year: r[1], tech: r[2], size: r[3], series: r[4], stars: r[5], note: r[6], kind, sold: id === "haubus" };
    if (!D.works[id]) D.works[id] = { title: r[0], kind, year: r[1], tech: r[2] };
  });

  /* ---------- Bausteine ---------- */
  /** Neu zu erstellen: [Titel, Anleitung, Tage] */
  const NEW = {
    figur: ["Figurenzeichnungen nach Modell", "Offene Aktsitzung oder Zeichenkurs: Kohle, Tusche oder Bleistift, ganze Figur mit Gewand und Hut (nicht nur Köpfe). 3–5 Blätter, mindestens DIN A3.", 3],
    natur: ["Naturstudien", "Pflanzen, Steine, Knochen, Stoffreste, genau beobachtet, Bleistift/Tusche, gern farbig. Geht am Küchentisch am Fenster.", 2],
    stoff: ["Objekt- und Stoffzeichnungen", "Hut, Knopf, Mantelkragen, Falten – Hell-Dunkel genau zeichnen. 3–4 Blätter nach dem echten Objekt.", 1],
    stilleben: ["Farbiges Stillleben oder Landschaft", "Ein Blatt oder eine kleine Tafel in Farbe nach der Natur, nicht nach Foto, ab Format A3.", 2],
    figurine: ["Figurine / Entwurf in Farbe", "Zu einem vorhandenen Stück oder einer Gestalt aus deinen Gemälden: Figurine in Farbe, Stoffproben, Notizen (2–3 Blätter).", 2],
    silhouetten: ["Silhouetten-Varianten", "Sechs Umriss-Varianten eines Mantels oder Huts nebeneinander. Zeigt Entwurfsdenken, auch mit Tusche auf Papier.", 1],
    toile: ["Schnitt- und Toile-Dokumentation", "Eines deiner Stücke: Fotos der Schnittteile, ein Probeteil (Toile), Innenverarbeitung, Ärmeleinsatz.", 2],
    material: ["Materialtafel (12–20 Proben)", "Wachs, Rost, Pigment, Färbung, Garn auf Stoffstreifen. Je Probe eine Notiz („was ist passiert?“), als eine Tafel fotografiert.", 3],
    skizzenbuch: ["Skizzenbuchseiten", "6–10 Seiten mit Datum: Museumsobjekte (Skythen, Trypillja, Bronzezeit), Bison, Reiter, Entwurfsgedanken – auch Rohes zeigen.", 3],
    prozess: ["Prozessseite „Idee → Fertig“", "Für ein Stück (empfohlen: Pipes): Referenz → Skizze → Material → Schnitt → Nähen → Detail → getragen. Eine bis zwei Doppelseiten.", 2],
    recherche: ["Recherche-/Referenzseite", "Museumsfoto (z. B. skythischer Schmuck) neben deiner Zeichnung und dem fertigen Detail, mit Quelle.", 1],
    buehne: ["Raumcollage / Mini-Bühnenmodell", "Figuren aus deinen Gemälden als Papierfiguren in einem Kartonraum im Maßstab 1:20. Drei Fotos und eine Skizze.", 3],
    szene: ["Szenische Fotoserie", "Ein Kostüm in Raum und Licht (Dämmerung, Kerzenlicht, Seitenlicht), drei Bilder, Figur mit Haltung.", 2],
    video: ["Kurzvideo (30–60 s)", "Die Stücke in Bewegung (Gehen, Drehen), ruhiges Seitenlicht. Handy reicht; keine Effekte.", 1],
    rapport: ["Musterentwicklung (Rapport)", "Aus einem Motiv (Bison, Reiter, Gefäß) ein Wiederholungsmuster in drei Farbvarianten, mit Stoffprobe.", 3]
  };
  /** Montage aus Vorhandenem: [Titel, Anleitung, Bild-IDs, Tage] */
  const MONT = {
    lineup: ["Line-up-Seite (5 Looks)", "Bronzezeit, Skythisches Gold, Dyki Bizony, Leinenmantel und Pipes nebeneinander: vorhandene getragene Fotos, gleicher Hintergrund, gleicher Maßstab.", ["bronzezeit-getragen", "skythisches-gold", "dyki-bizony", "leinenmantel", "pipes"], 0.5],
    hutfamilie: ["Hutfamilie (Typologie-Seite)", "Bronzezeit, Pidsvichnyk, Strilez, Leder, Zylinder und Dyki-Hut auf einer Seite – ein Objekt, sechs Varianten. Dazu der Hut aus Haubus oder Liturgy als Brücke zur Malerei.", ["bronzezeit-getragen", "pidsvichnyk-objekt", "strilez-hut", "kopfbedeckung-aus-leder", "zylindrische-kopfbedeckung", "dyki-hutdetail"], 0.5],
    bruecke: ["Brücke Bild ↔ Textil", "Doppelseite: Liturgy neben Bronzezeit – derselbe breite schwarze Hut einmal gemalt, einmal gebaut.", ["liturgy", "bronzezeit"], 0.25],
    pipesseq: ["Pipes-Sequenz", "Weste, Kopfbedeckung und getragene Ansicht auf einer Doppelseite: Entstehung in drei Bildern.", ["pipes-weste", "pipes-kopfbedeckung", "pipes-getragen"], 0.5],
    vershseq: ["Vershnyky: Mantel + Futter", "Mantel außen und Futter-Kalligrafie als Paar: Kleidung trägt Text.", ["vershnyky", "vershnyky-detail"], 0.25],
    lituusdet: ["Lituus I: Detail-Reihe", "Drei Detailaufnahmen der gemalten Figuren auf dem Umhang.", ["lituus-i-2", "lituus-i-3", "lituus-i-4"], 0.25]
  };
  /** Dokumente: [Titel, Anleitung, Tage] */
  const DOC = {
    werkliste: ["Werkliste (Titel, Jahr, Maße, Material)", "Eine Zeile je Arbeit – die Maße stehen in diesem Katalog bereit. Bei Kerzberg die Ausrichtung angeben.", 0.5],
    statement: ["Motivationsschreiben / Statement", "Eine Seite, drei Fragen: Warum Kleidung als Bildträger? Woher kommen Pfeife, Reiter, Bison, Hut? Was willst du hier lernen?", 1],
    cv: ["Lebenslauf (tabellarisch)", "Schule, Praktika, Ausstellungen, Sprachen, Kurse (Zeichnen).", 0.5],
    deckblatt: ["Deckblatt + Inhaltsverzeichnis", "Name, Studiengang, Kontakt; Inhaltsverzeichnis mit Kurzkommentar je Arbeit (2 Sätze).", 0.5],
    hausaufgabe: ["Hausaufgabe der Hochschule", "Thema kommt von der Hochschule. Plane mindestens 1 Woche; arbeite mit deinen Stärken (Material, Handschrift).", 5],
    nachhaltigkeit: ["Statement zur Nachhaltigkeit (max. 1 Seite A4)", "Nutze, was du schon tust: Rostfärbung, Wachs, Wolle/Leinen, Reste, Reparatur, Handarbeit statt Masse.", 0.5],
    vorstellungsvideo: ["Vorstellungsvideo (ca. 1 Minute)", "Du in zwei Sätzen, dann ein, zwei Stücke in Bewegung. Ruhig sprechen, Tageslicht.", 1],
    erklaerung: ["Mappenerklärung", "Eine Seite zu Idee, Material und Reihenfolge der Mappe.", 0.5]
  };

  const w = (id, note) => ({ k: "w", id, note });
  const m = (key, note) => ({ k: "m", key, note });
  const n = (key, note, crit) => ({ k: "n", key, note, crit: !!crit });
  const d = (key, note) => ({ k: "d", key, note });
  const S = (title, slots, hint, extra) => ({ title, slots, hint, extra: !!extra });

  /* ---------- Musterbewerbungen (30) ---------- */
  const plans = {};
  const P = (id, cfg) => { plans[id] = cfg; };

  P("haw-kostuemdesign", {
    fit: "sehr hoch", count: [20, 30],
    strategy: "20–30 Arbeiten, Mappe zählt 40 %. Zeige Figur und Kostüm in einem Bogen: Gemälde mit Figurengruppen, dann dieselbe Figur als getragenes Kostüm. Die zwei Entwurfsblätter fehlen noch – ohne sie fehlt der Beleg fürs Entwerfen. Die Prüfung am 02.–04.11. verlangt Malen, Zeichnen und Entwurf je 5 Stunden: parallel üben.",
    sections: [
      S("Auftakt: die Figur im Bild", [w("die-jagd", "Auftakt: stärkste Komposition"), w("group-portrait-of-monks", "Hände, Hell-Dunkel")]),
      S("Figur, Gewand, Gruppe (Malerei)", [w("paladins"), w("liturgy", "dieselbe Hutlinie wie im Textil"), w("haubus"), w("tanz", "Großformat"), w("the-shoemakers"), w("selbstportraet")]),
      S("Das Kostüm als Figur", [w("pipes-getragen"), w("bronzezeit-getragen"), w("skythisches-gold"), w("dyki-bizony"), w("weste-und-schuerze"), w("lituus-i")]),
      S("Hut, Detail, Material", [m("hutfamilie"), w("vershnyky-detail", "Rost + Schrift"), w("trypillische-madonnen")]),
      S("Prozess", [w("prozess-rueckenteil"), w("prozess-futterdetail")]),
      S("Entwurf (neu): Prüfungsfähigkeit zeigen", [n("figurine", "Kostümentwurf zu einer Figur aus „Group Portrait of Monks“: Farbe, Stoff, Standbild", true), n("figur", "Ein Blatt Figurenzeichnung mit Gewand", true)]),
      S("Schluss", [w("yak-ii", "starker Abgang: Hybridfigur"), w("kerzberg", "Szene, Ausrichtung prüfen")])
    ],
    docs: [d("werkliste")],
    tips: ["Frist 11.10.2026, 23:59: Die Mappe ist bis auf zwei neue Blätter fertig – diese Woche starten.", "Malen/Zeichnen/Entwurf in der Prüfung: je 5 Stunden vorher unter Zeitdruck üben, jeweils mit einer Figur und deren Kleidung.", "Dateien klein halten: gesamt 250 MB, Video möglich (Pipes-Sequenz in Bewegung)."]
  });

  P("haw-modedesign", {
    fit: "hoch", count: [20, 30],
    strategy: "Gleiche Frist und gleiches Portal wie Kostümdesign. Hier stehen Looks und Konstruktion vorn, die Malerei belegt Figur- und Körpergefühl. Silhouetten-Varianten und Figurine sind die entscheidenden neuen Blätter.",
    sections: [
      S("Auftakt", [w("pipes-getragen", "stärkstes Foto"), w("skythisches-gold")]),
      S("Looks", [w("bronzezeit-getragen"), w("dyki-bizony"), w("leinenmantel"), w("weste-und-schuerze"), w("lituus-i"), m("lineup", "5 Looks in einem Bild: Beweis für Serie")]),
      S("Konstruktion und Stoff", [w("pipes-weste"), w("dem-tier-auf-der-spur"), w("weste-aus-reinem-kaschmir"), w("vershnyky"), w("vershnyky-detail"), w("trypillische-madonnen"), w("prozess-rueckenteil"), w("prozess-knoepfe")]),
      S("Bildkompetenz (Malerei)", [w("haubus"), w("uims", "wirkt wie ein Entwurf"), w("group-portrait-of-monks"), w("paladins"), w("die-jagd")]),
      S("Entwurf (neu)", [n("figurine", "Zwei Figurinen zu vorhandenen Mänteln, mit Stoffmustern", true), n("silhouetten", "Sechs Silhouetten eines Mantels", true), n("toile", "Schnitt-/Toile-Fotos von Bronzezeit oder Pipes")])
    ],
    docs: [d("werkliste")],
    tips: ["Frist 11.10.2026: Alles Vorhandene reicht für 21 von 24 Blättern; die drei neuen Blätter sind 1–2 Tage Arbeit pro Blatt.", "Zeige in 24 Blättern die Spanne Gemälde → Detail → Look, nicht 24 Mäntel."]
  });

  P("udk-kostuembild", {
    fit: "sehr hoch", count: [20, 20],
    strategy: "Genau 20 Seiten PDF mit Titel, Jahr, Maßen – plus eine halbe Seite „Warum Kostümbild?“. Die Mappe erzählt Figuren: erst im Bild, dann als Kostüm, dann im Raum. Die drei neuen Seiten (Figurine, Szene, Prozess) sind der Unterschied zwischen „Künstlerin“ und „Kostümbildnerin“.",
    sections: [
      S("Figuren im Bild (Seite 1–8)", [w("die-jagd", "Seite 1: Auftakt"), w("group-portrait-of-monks"), w("liturgy"), w("paladins"), w("haubus"), w("tanz"), w("yak-ii"), w("the-shoemakers")]),
      S("Figuren als Kostüm (Seite 9–15)", [w("pipes-getragen"), w("bronzezeit-getragen"), w("skythisches-gold"), w("dyki-bizony"), w("lituus-i"), m("vershseq", "Seite 14: Mantel + Futter-Schrift"), m("hutfamilie", "Seite 15: Hut-Typologie")]),
      S("Kostümbild denken (neu, Seite 16–18)", [n("figurine", "Figurenkonzept: Wer trägt das, wann, warum – Figurine zu „Group Portrait of Monks“", true), n("szene", "Ein Kostüm im Raum bei Kerzenlicht", true), n("prozess", "Prozess „Pipes“ als Doppelseite")]),
      S("Schluss (Seite 19–20)", [w("kerzberg", "Szene mit Kerzen"), w("selbstportraet", "leiser Schluss")]),
      S("Optional (nicht als Seite gezählt)", [n("video", "1 Video bis 4 Min.: Stücke in Bewegung (MP4, max. 500 MB)")], "Zusatz zu den 20 Seiten", true)
    ],
    docs: [d("statement", "halbseitiges PDF: Warum möchtest du Kostümbild studieren?"), d("werkliste", "Titel, Jahr, Maße je Seite")],
    tips: ["Upload 15.10.–20.11.2026 über bemus.udk-berlin.de, maximal 150 MB.", "Praktikumsnachweis „falls zutreffend“: beim StudyGuide klären, ob Pflicht.", "Im Gespräch kommen Arbeitsproben, Motivation, Interessen – übe, drei Arbeiten in je zwei Sätzen zu erklären."]
  });

  P("weissensee-textil", {
    fit: "sehr hoch", count: [18, 24],
    strategy: "Hier ist Material das Thema: Die Mappe beginnt beim Futter und der Rostfarbe, nicht beim Mantel. Ihre stärksten Argumente sind das Verborgene (Rost, Schrift, Knöpfe als Typologie) und die Färbeprozesse. Die Materialtafel und die Recherche-Seite machen aus Einzelstücken Forschung.",
    sections: [
      S("Material zuerst", [w("trypillische-madonnen", "Auftakt: Rost + Zeichnung + alte Stickerei"), w("vershnyky"), w("vershnyky-detail", "Rost + Schrift"), w("prozess-futterdetail"), w("prozess-rueckenteil"), w("prozess-knoepfe", "Knöpfe als Typologie")]),
      S("Oberfläche und Farbe", [w("dyki-bizony", "Färbeprozess des Tülls"), w("dyki-hutdetail"), w("dyki-knopfdetail"), w("leinenmantel"), w("leinenmantel-objekt"), w("skythisches-gold"), w("skythisches-gold-objekt")]),
      S("Objekt", [m("hutfamilie"), w("pidsvichnyk-objekt"), w("strilez-hut", "Bienenwachs"), w("weste-aus-reinem-kaschmir")]),
      S("Haltung (Malerei, 2 Blätter)", [w("yak-ii"), w("die-jagd")]),
      S("Forschung sichtbar (neu)", [n("material", "Eine Materialtafel mit 12–20 Proben: Rost, Wachs, Pigment, Färbung", true), n("recherche", "Museumsfoto neben deiner Zeichnung: Trypillja-Figurine")])
    ],
    docs: [d("werkliste", "Übersichtsblatt: je Arbeit Titel, Medium, Größe, Datum, Kontext – kurz und stichwortartig")],
    tips: ["Weißensee-Tipps (für Mode-Design formuliert, Stand 2020/21): Die Kommission bewertet „die Arbeiten, nicht deren Präsentation“ – keine Passepartouts, Typografie, GIFs, Clipart; die wichtigste Arbeit eröffnet die Mappe; Videos, Websites, Instagram und externe Links lassen sich nicht öffnen. Aktuelle Vorgaben im Portal prüfen.", "Frist 05.01.2027, 12:00 Uhr. Danach Zugangsprüfung vor Ort (Ende Januar): Materialaufgaben + Gespräch.", "Zur Prüfung mitbringen: Materialtafel im Original und ein Stück aus dem Futter-Konvolut (Haptik überzeugt).", "Kein Vorpraktikum nötig."]
  });

  P("weissensee-mode", {
    fit: "hoch", count: [18, 24],
    strategy: "Mappe plus zusätzliche Hausaufgabe (Thema nach dem Anlegen der Bewerbung). Zeige Looks mit Haltung, Schnitt- und Materialdenken und die Entwurfsblätter, die bisher fehlen.",
    sections: [
      S("Auftakt", [w("pipes-getragen"), w("bronzezeit-getragen")]),
      S("Looks", [w("skythisches-gold"), w("dyki-bizony"), w("leinenmantel"), w("weste-und-schuerze"), m("lineup", "Serie auf einen Blick")]),
      S("Stoff und Detail", [w("pipes-weste"), w("vershnyky"), w("vershnyky-detail"), w("prozess-rueckenteil"), w("prozess-knoepfe"), w("dem-tier-auf-der-spur")]),
      S("Figur im Bild", [w("group-portrait-of-monks"), w("liturgy"), w("haubus"), w("paladins")]),
      S("Entwurf (neu)", [n("figurine", "Figurinen zu Mantel und Weste", true), n("silhouetten", "Sechs Silhouetten", true), n("toile", "Schnitt/Toile eines Stücks")])
    ],
    docs: [d("hausaufgabe"), d("werkliste", "Übersichtsblatt: je Arbeit Titel, Medium, Größe, Datum, Kontext – kurz und stichwortartig")],
    tips: ["Weißensee-Tipps (Mode-Design, Stand 2020/21): Die Kommission – Modedesigner:innen, Lehrende und Studierende – will sehen, wofür du dich interessierst und wie du schon arbeitest; ein „Roter Faden“ ist nicht nötig, die Arbeiten werden bewertet, nicht die Präsentation. Aktuelle Vorgaben im Portal prüfen.", "Frist 05.01.2027, 12:00 Uhr. Praktikum mindestens 6 Wochen – Nachweis darf bis Studienbeginn nachgereicht werden.", "Die Zugangsprüfung (Ende Januar) bespricht Mappe und Motivation: Statement im Kopf haben."]
  });

  P("weissensee-buehne", {
    fit: "hoch", count: [16, 24],
    strategy: "Weißensee will Bühnen- und Kostümbild als gestalteten Raum. Ihre Gruppenbilder sind schon szenisch (Kerzberg, Die Jagd) – es fehlt der Raum selbst. Die Mappe braucht deshalb ein Mini-Bühnenmodell oder eine Raumcollage und eine szenische Fotoserie.",
    sections: [
      S("Figuren, die Räume besetzen (Malerei)", [w("die-jagd"), w("group-portrait-of-monks"), w("liturgy"), w("kerzberg"), w("paladins"), w("the-shoemakers"), w("tanz"), w("holding-the-young-yak", "neu fotografieren (zu dunkel)")]),
      S("Kostüm als Auftritt", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pipes-getragen"), w("weste-und-schuerze"), w("pidsvichnyk-kerzenhalter"), w("strilez-hut")]),
      S("Hybrid und Tier", [w("yak-ii"), w("yak-rider")]),
      S("Raum (neu)", [n("buehne", "Raumcollage oder Mini-Modell aus Figuren deiner Gemälde", true), n("szene", "Szenische Fotoserie: Kostüm in Raum und Licht", true), n("figurine", "Figurine mit Bewegung")])
    ],
    docs: [d("statement", "kurze dramaturgische Notiz zu einer Figur"), d("werkliste", "Übersichtsblatt: je Arbeit Titel, Medium, Größe, Datum, Kontext")],
    tips: ["Frist 05.01.2027, 12:00 Uhr; Zugangsprüfung Ende Januar mit Aufgaben + Gespräch.", "Bereite im Gespräch eine Figur (z. B. Pidsvichnyk) mit Geschichte und Raum vor."]
  });

  P("weissensee-malerei", {
    fit: "hoch", count: [16, 24],
    strategy: "Hier zählt die Malerei: Die Mappe zeigt die Entwicklung 2023 → 2026, ein Konvolut statt Einzelblättern. Textil erscheint nur in zwei Arbeiten, als Verlängerung derselben Bildwelt. Die Vorstudien zu zwei Gemälden fehlen noch und würden den Weg zum Bild zeigen.",
    sections: [
      S("Auftakt", [w("die-jagd")]),
      S("Acryl 2023–25: Fläche und Figur", [w("haubus"), w("tanz"), w("der-blaue-schuh"), w("rot"), w("dive"), w("spiegel"), w("yak-ii"), w("river-in-the-middle-of-the-cave"), w("kerzberg"), w("the-shoemakers")]),
      S("Öl 2026", [w("liturgy"), w("group-portrait-of-monks"), w("paladins"), w("selbstportraet"), w("study-of-the-head", "Beobachtung nach der Natur"), w("holding-the-young-yak", "neu fotografieren"), w("portrait-of-deacons-ii")]),
      S("Brücke zum Textil (2)", [w("pidsvichnyk-kerzenhalter"), w("vershnyky")]),
      S("Vorstudien (neu)", [n("skizzenbuch", "Vorstudien zu Die Jagd und Yak II", true), n("figur", "Zeichnungen nach Modell")])
    ],
    docs: [d("werkliste", "Übersichtsblatt: je Arbeit Titel, Medium, Größe, Datum, Kontext")],
    tips: ["Frist 05.01.2027, 12:00 Uhr. Zugangsprüfung Ende Januar mit Aufgaben + Gespräch.", "Zeige die Reihe in zeitlicher Folge – die Entwicklung ist dein Argument."]
  });

  P("burg-textile-kuenste", {
    fit: "sehr hoch", count: [18, 20],
    strategy: "Bis zu 20 Arbeiten, keine Vorgaben zu Technik – gewünscht sind Skizzenbücher, Naturstudien, Raum und freie Arbeiten. Die BURG liest Textil als Kunst: Zeige die Verbindung zwischen Malerei und Textil ausdrücklich (derselbe Hut, gemalt und gebaut). Nur Arbeiten, die nicht älter als 2 Jahre sind.",
    sections: [
      S("Eine Bildwelt (Auftakt)", [w("group-portrait-of-monks"), m("bruecke", "Brücke: derselbe Hut gemalt und gebaut"), w("liturgy")]),
      S("Textil als Kunstwerk", [w("lituus-i"), w("skythisches-gold"), w("vershnyky"), w("vershnyky-detail"), w("dyki-bizony"), w("pipes-getragen"), w("trypillische-madonnen"), w("pidsvichnyk-kerzenhalter")]),
      S("Material und Prozess", [w("prozess-futterdetail"), w("prozess-knoepfe"), n("material", "Proben aus Wachs, Rost, Pigment, Färbung", true)]),
      S("Raum, Serie, Studie", [m("hutfamilie"), n("skizzenbuch", "Skizzenbuchseiten: woher Bison, Reiter, Madonna?", true), n("natur", "Naturstudien (Pflanzen, Stoffe)"), w("yak-ii"), w("die-jagd"), w("the-shoemakers")])
    ],
    docs: [d("werkliste")],
    tips: ["Wichtig: „Arbeitsproben, die nicht älter als 2 Jahre sind“ (BURG-Bewerberinfo, Stand 12.02.2026). Bei Abgabe Feb./März 2027 zählen also nur Arbeiten ab etwa Frühjahr 2025 – deshalb sind hier nur 2025–26er Werke gewählt.", "Mappe als PDF bis 50 MB; Frist Mitte Februar – Anfang März 2027 (genaues Datum noch nicht veröffentlicht).", "Aufnahmeprüfung 2027 digital und vor Ort; Termine nach der Mappensichtung."]
  });

  P("burg-textildesign", {
    fit: "hoch", count: [16, 22],
    strategy: "Textildesign an der BURG fragt nach Fläche, Muster und Material. Du hast Zeichnung auf Textil, Färbung, Rost – es fehlt die Musterentwicklung. Wichtig: 3 Monate Vorpraktikum in einem textilen Bereich sind Voraussetzung. Das sollte schon geplant sein.",
    sections: [
      S("Fläche und Muster", [w("leinenmantel"), w("leinenmantel-objekt"), w("dyki-bizony"), w("dyki-knopfdetail"), w("pipes-weste"), w("dem-tier-auf-der-spur"), w("weste-aus-reinem-kaschmir"), w("trypillische-madonnen"), w("vershnyky-detail")]),
      S("Prozess und Versuch", [w("prozess-rueckenteil"), w("prozess-futterdetail"), w("prozess-knoepfe"), n("material", "10–20 Stoffmuster mit Varianten", true), n("rapport", "Rapport aus Bison, Reiter oder Gefäß", true)]),
      S("Objekt", [w("pidsvichnyk-kerzenhalter"), w("strilez-hut"), m("hutfamilie")]),
      S("Farbe und Komposition", [w("die-jagd"), w("the-shoemakers")]),
      S("Zeichnung (neu)", [n("natur", "Natur- und Farbstudien zur Flächengestaltung"), n("skizzenbuch")])
    ],
    docs: [d("werkliste")],
    tips: ["Arbeitsproben dürfen laut BURG nicht älter als 2 Jahre sein (Stand 12.02.2026): hier nur 2025–26er Werke.", "Vorpraktikum 3 Monate in Textildruck, Weberei, Stickerei, Strickerei oder Textilatelier – früh anfragen.", "Lies die Richtlinien-PDF der Studienrichtung, bevor du die Mappe fixierst."]
  });

  P("burg-modedesign", {
    fit: "mittel", count: [16, 22],
    strategy: "Die BURG sagt ausdrücklich: „Zeigt uns was wir sehen sollen, nicht was wir sehen wollen“ – und Modeentwürfe oder -illustrationen sind kein Aufnahmekriterium und sollen nicht der Hauptteil sein. Gefragt ist Vielseitigkeit mit Zeichnung, Malerei, Fotografie, Skizzenbuch und Experimenten. Deine genähten Stücke sind der Beweis für Interesse an Mode; die Lücke ist die Zeichnung (bekleidete Figur, Naturstudie). Nur Arbeiten, die nicht älter als 2 Jahre sind. Entscheidend bleibt das Vorpraktikum: 3 Monate in Schneiderei, Näherei, Konfektion oder Theaterwerkstatt (oder Anrechnung auf Antrag).",
    sections: [
      S("Looks (Interesse an Mode sichtbar)", [w("pipes-getragen"), w("bronzezeit-getragen"), w("skythisches-gold"), w("dyki-bizony"), w("leinenmantel"), w("weste-und-schuerze"), m("lineup")]),
      S("Form, Farbe, Material", [w("pipes-weste"), w("vershnyky"), w("vershnyky-detail"), w("dem-tier-auf-der-spur"), w("prozess-rueckenteil"), w("prozess-knoepfe")]),
      S("Malerei 2025–26", [w("group-portrait-of-monks"), w("paladins"), w("die-jagd"), w("selbstportraet")]),
      S("Zeichnung und Skizzenbuch (neu, Vielseitigkeit zeigen)", [n("skizzenbuch", "Auszüge aus einem Skizzenbuch (max. eines pro Bewerbung)", true), n("figur", "Akt / bekleidete Figur: Proportionen, Technik, Bildaufbau", true), n("natur", "Naturstudien")])
    ],
    docs: [d("werkliste")],
    tips: ["Arbeitsproben dürfen laut BURG nicht älter als 2 Jahre sein: Haubus, Tanz, Rot u. a. (2023–24) bleiben deshalb draußen.", "Die BURG empfiehlt: nicht chronologisch, sondern erzählerisch aufbauen, wirkungsvoller Anfang und Ende, Titel und Kurzbeschreibungen; bei 3D-Arbeiten Größe angeben.", "Auch unfertige Arbeiten und Experimente sind ausdrücklich willkommen. Lies die „Richtlinien für die Mappengestaltung“ der Studienrichtung."]
  });

  P("udk-modedesign", {
    fit: "hoch", count: [20, 20],
    strategy: "Zweistufig: erst eine digitale Hausaufgabe (Thema kommt 5–6 Wochen nach der Frist), dann die physische Mappe zur Zugangsprüfung mit etwa 20 eigenen Arbeiten bis DIN A2. Große Gemälde bringst du als Fotodruck mit, kleine als Original, Textil als Foto plus ein, zwei Originale (Westen, Hüte).",
    sections: [
      S("Malerei (Drucke ≤ A2, kleine Originale)", [w("haubus", "Druck (Original verkauft)"), w("uims", "Original 29 × 29 cm"), w("group-portrait-of-monks", "Druck"), w("paladins", "Druck"), w("die-jagd", "Druck")]),
      S("Textil (Foto + Originale)", [w("pipes-getragen"), w("skythisches-gold"), w("bronzezeit-getragen"), w("dyki-bizony"), w("leinenmantel"), w("vershnyky-detail"), w("trypillische-madonnen", "Original: Weste mitbringen"), w("lituus-i")]),
      S("Prozess", [w("prozess-rueckenteil"), w("prozess-knoepfe")]),
      S("Mode-Beleg (neu)", [n("figurine", "Figurine in Farbe", true), n("silhouetten", "Silhouetten-Studien", true), n("toile", "Schnitt- und Toile-Blatt"), n("figur", "Figurenzeichnung"), n("skizzenbuch")])
    ],
    docs: [d("hausaufgabe", "digital, Thema per E-Mail ca. 5–6 Wochen nach Bewerbungsschluss")],
    tips: ["Mindestens 6 Wochen Praktikum in einem handwerklichen Betrieb (z. B. Schneiderei); Nachweis bis zur Immatrikulation.", "Mappe max. DIN A2, Unterlagen als einzelne PDFs je max. 5 MB."]
  });

  P("htw-modedesign", {
    fit: "hoch", count: [20, 20],
    strategy: "Deine 20 besten Arbeiten, Näharbeiten und Stoffmanipulationen sind ausdrücklich erwünscht – hier ist dein Textil im Vorteil. Dazu kommen Pflichtvideo, Hausaufgabe (ca. 10 Seiten) und ein Nachhaltigkeits-Statement. Das Statement fällt dir leicht: Rostfärbung, Wachs, Handarbeit.",
    sections: [
      S("Näharbeiten und Stoffmanipulation", [w("pipes-getragen"), w("pipes-weste"), w("skythisches-gold"), w("bronzezeit-getragen"), w("dyki-bizony"), w("leinenmantel"), w("dem-tier-auf-der-spur"), w("weste-aus-reinem-kaschmir"), w("vershnyky"), w("vershnyky-detail"), w("trypillische-madonnen"), w("prozess-knoepfe"), w("prozess-rueckenteil")]),
      S("Figur und Farbe", [w("haubus"), w("group-portrait-of-monks"), w("die-jagd")]),
      S("Entwurf (neu)", [n("figur", "Figurenzeichnung", true), n("figurine", "Figurine / Kollektionsentwurf", true), m("lineup", "Kollektion als Line-up"), n("material", "Stoffmanipulationen als Musterreihe")])
    ],
    docs: [d("vorstellungsvideo", "Pflicht, max. 150 MB"), d("hausaufgabe", "ca. 10 Seiten PDF mit Deckblatt und Erklärung"), d("nachhaltigkeit")],
    tips: ["Frist folgt mit dem Eignungstest; keine Voranmeldung nötig.", "Der Upload-Link kommt ca. 1 Woche nach Veröffentlichung der Aufgabe – Mappe bis dahin fertig."]
  });

  P("hannover-ske", {
    fit: "hoch", count: [15, 20],
    strategy: "„Szenografie – Kostüm – Experimentelle Gestaltung“ liest deine Mischung aus Malerei, Kostüm und Objekt gut. Im Portal werden studiengangsspezifische Arbeitsproben gestellt – der Rest ist dein Konvolut. Neu brauchst du Raum und Experiment.",
    sections: [
      S("Szenische Figuren (Malerei)", [w("die-jagd"), w("group-portrait-of-monks"), w("liturgy"), w("kerzberg"), w("paladins"), w("tanz")]),
      S("Kostüm und Objekt", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pidsvichnyk-kerzenhalter"), w("strilez-hut"), w("dyki-bizony"), m("hutfamilie")]),
      S("Experimentelle Gestaltung (neu)", [n("buehne", "Raumskizze oder Modell", true), n("szene", "Kostüm in Raum und Licht", true), n("video", "Objekte in Bewegung"), n("skizzenbuch")])
    ],
    docs: [],
    tips: ["Frist bis einschließlich 15.03.2027; 6-wöchiges Zugangspraktikum.", "Eintägige praktische Prüfung im Mai nach der Sichtung der Arbeitsproben."]
  });

  P("hannover-mode", {
    fit: "mittel", count: [8, 12],
    strategy: "Keine klassische Mappe, sondern eine Motivationsskizze: Fragen werden im Portal gestellt und schriftlich wie gestalterisch beantwortet. Wähle je Antwort ein Bild, das sie belegt. Dein Vorteil ist die klare Haltung – sie muss in Worten stehen.",
    sections: [
      S("Bildbelege (je Antwort ein Bild)", [w("pipes-getragen"), w("bronzezeit-getragen"), w("skythisches-gold"), w("dyki-bizony"), w("haubus"), w("group-portrait-of-monks"), m("lineup"), n("silhouetten", "Mode-Illustration / Kommunikation"), n("figurine")])
    ],
    docs: [d("statement", "Antworten auf die Portalfragen (Text)")],
    tips: ["Frist bis einschließlich 15.03.2027; Fragen erscheinen im Portal.", "Danach eintägige praktische Prüfung im Mai; 6 Wochen Zugangspraktikum."]
  });

  P("abk-textildesign", {
    fit: "sehr hoch", count: [18, 22],
    strategy: "Etwa 20 Arbeitsproben, ausdrücklich genannt werden freie Arbeiten, farbige Arbeiten, Zeichnungen, Naturstudien, Skizzen. Deine Malerei trägt den Farbanteil, das Textil den Materialanteil – die Lücke sind Naturstudien und Skizzen.",
    sections: [
      S("Farbe und freie Arbeit", [w("die-jagd"), w("yak-ii"), w("the-shoemakers"), w("tanz"), w("haubus"), w("liturgy"), w("group-portrait-of-monks")]),
      S("Textil", [w("vershnyky"), w("vershnyky-detail"), w("leinenmantel"), w("dyki-bizony"), w("trypillische-madonnen"), w("pidsvichnyk-kerzenhalter"), w("weste-aus-reinem-kaschmir"), w("prozess-futterdetail")]),
      S("Studien (neu)", [n("natur", "Naturstudien: Pflanzen, Steine, Stoffe", true), n("skizzenbuch", "Skizzen aus dem Skizzenbuch", true), n("stoff", "Stoff- und Objektzeichnungen"), n("material", "Textile Flächenexperimente"), m("hutfamilie")])
    ],
    docs: [],
    tips: ["Termin 2027 noch nicht veröffentlicht (2026: Aufnahmeprüfung 22.–26.06.). Die Mappenberatungen laufen von Oktober bis Februar – nutze einen Termin.", "Hausaufgabe kommt erst mit dem Bescheid über die bestandene Vorauswahl."]
  });

  P("abk-buehne-kostuem", {
    fit: "hoch", count: [18, 22],
    strategy: "Etwa 20 bildnerische Arbeitsproben mit Skizzen, Farbe, Naturstudien. Deine Gruppenbilder tragen schon szenisches Denken. Es fehlen Raum und Figurine.",
    sections: [
      S("Figuren und Szenen", [w("die-jagd"), w("group-portrait-of-monks"), w("kerzberg"), w("paladins"), w("tanz"), w("liturgy"), w("the-shoemakers"), w("yak-ii"), w("holding-the-young-yak")]),
      S("Kostüm", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pipes-getragen"), w("strilez-hut"), w("pidsvichnyk-kerzenhalter")]),
      S("Studien und Raum (neu)", [n("buehne", "Bühnenmodell oder Raumcollage", true), n("figurine", "Figurinen und Kostümvarianten", true), n("skizzenbuch"), n("video", "Kurzvideo als Link"), n("figur")])
    ],
    docs: [],
    tips: ["Termin 2027 noch nicht veröffentlicht. Mappenberatung Bühnen- und Kostümbild nach Vereinbarung.", "Nach der Vorauswahl folgen Hausaufgabe und Aufnahmeprüfung."]
  });

  P("reutlingen-ftd", {
    fit: "mittel", count: [15, 25],
    strategy: "Physische Mappe: 15–25 Originale, mindestens DIN A2, höchstens 80 × 100 cm, jede Arbeit mit lesbarem Namen. Ihre kleinen Gemälde ziehst du auf A2-Karton auf, die großen (90 × 100) gehen nur als Ausdruck – bei der Hochschule bestätigen. Textil als A2-Fotodruck; Skulpturen als Foto.",
    sections: [
      S("Malerei (kleine Originale)", [w("der-blaue-schuh"), w("uims"), w("spiegel"), w("kopfbild-in-blau"), w("yak"), w("yak-rider"), w("selbstportraet"), w("study-of-the-head")]),
      S("Malerei (große Arbeiten als Druck ≤ 80 × 100 cm)", [w("group-portrait-of-monks"), w("die-jagd"), w("yak-ii")]),
      S("Textil (A2-Fotodruck + 1–2 Originale)", [w("skythisches-gold"), w("dyki-bizony"), w("leinenmantel"), w("pipes-getragen"), w("vershnyky-detail"), w("trypillische-madonnen"), w("bronzezeit-getragen")]),
      S("Entwurf (neu)", [n("stoff", "Originalzeichnungen: Hut, Falten, Knopf", true), n("figurine", "Konkrete Kleidungsentwürfe"), n("skizzenbuch")])
    ],
    docs: [d("deckblatt", "Inhaltsverzeichnis"), d("statement", "Motivationsschreiben"), d("erklaerung", "Bewerberblatt „Feststellung künstlerische Eignung“")],
    tips: ["Frist 15.06.2027; ganztägige Eignungsprüfung nach der Abgabe (2026: 7. Juli).", "Die beste Reihenfolge fürs Auslegen: groß – klein – Textil – Skizzen."]
  });

  P("pforzheim-mode", {
    fit: "hoch", count: [15, 20],
    strategy: "Ein einziges PDF im Querformat (kein PDF-Portfolio), Dateiname NachnameVorname.pdf, mit Lebenslauf und Motivationsschreiben. Aufbau: 10–15 allgemeine handgefertigte Arbeiten, dazu 5 studiengangsbezogene Mode-Arbeiten (z. B. Illustration eines Kleidungsstücks). Dein Gemäldekonvolut deckt den allgemeinen Teil ab; die fünf Mode-Blätter bestehen aus zwei Foto-Looks und drei neuen Blättern.",
    sections: [
      S("Allgemeiner Teil (12 handgefertigte Arbeiten)", [w("die-jagd"), w("group-portrait-of-monks"), w("haubus"), w("tanz"), w("uims"), w("yak-ii"), w("the-shoemakers"), w("liturgy"), w("paladins"), w("selbstportraet"), w("spiegel"), w("kopfbild-in-blau")]),
      S("Studiengangsbezogen: 5 Mode-Arbeiten", [w("pipes-getragen"), w("skythisches-gold"), n("figurine", "Illustration eines Kleidungsstücks (Beispiel der Hochschule)", true), n("silhouetten", "Silhouette / Schnittidee", true), n("toile", "Material- oder Schnittblatt")])
    ],
    docs: [d("cv", "im selben PDF"), d("statement", "Motivationsschreiben im selben PDF")],
    tips: ["Max. 40 MB, ein PDF. Praktikum: 3 Monate extern oder 3 Wochen an der Fakultät (begrenzte Plätze).", "Künstlerische Eignungsprüfung 1–2 Tage vor Ort, ca. 14 Tage nach Bewerbungsschluss."]
  });

  P("trier-modedesign", {
    fit: "mittel", count: [15, 15],
    strategy: "Genau 15 Arbeiten – und die Hochschule schreibt Inhalte vor: figürliche Zeichnungen, Objektzeichnungen und Stofffalten, farbige Modeentwürfe oder -illustrationen, ein farbiges Stillleben oder eine Landschaft. Bis auf die Gemälde und Textilfotos hat dein Konvolut davon nichts. Das ist die größte Mappenarbeit aller 30 Bewerbungen, und die Frist ist am 13.11.2026.",
    sections: [
      S("Pflicht: figürliche Zeichnungen (neu)", [n("figur", "Figurenzeichnung A: stehende Figur mit Gewand", true), n("figur", "Figurenzeichnung B: sitzende Figur", true)]),
      S("Pflicht: Objektzeichnungen und Stofffalten (neu)", [n("stoff", "Hut und Falten – genau beobachtet", true), n("stoff", "Mantelkragen oder Knopf", true)]),
      S("Pflicht: farbige Modeentwürfe (neu)", [n("figurine", "Farbiger Entwurf A", true), n("figurine", "Farbiger Entwurf B", true)]),
      S("Pflicht: farbiges Stillleben oder Landschaft (neu)", [n("stilleben", "Stillleben nach Natur in Farbe", true)]),
      S("Vorhanden: farbige Arbeiten und genähte Teile (Wahlteil)", [w("haubus"), w("die-jagd"), w("group-portrait-of-monks"), w("uims"), w("pipes-getragen"), w("skythisches-gold"), w("leinenmantel"), w("dyki-bizony")])
    ],
    docs: [],
    tips: ["Frist 13.11.2026: Rechne mit ca. 10–12 Arbeitstagen für die neuen Blätter – diese Bewerbung nur starten, wenn du wirklich zeichnen willst.", "Max. 50 % digital erstellt – dein Konvolut ist komplett analog, das passt.", "12 Wochen Vorpraktikum; Mappenberatungen am 20.10. und 27.10.2026 nutzen."]
  });

  P("hfg-offenbach-kunst", {
    fit: "sehr hoch", count: [30, 34],
    strategy: "Mindestens 30 Arbeiten und Skizzen, „gern mehr“, ein PDF, keine Mustermappe, kein Thema. Hier hat deine ganze Bildwelt Platz: Zeige die Entwicklung der Malerei in Reihen und das Textil als Skulptur. Skizzen sind ausdrücklich erwünscht und ein Link-Video ist möglich.",
    sections: [
      S("Acryl 2023–25 (14)", [w("haubus"), w("tanz"), w("der-blaue-schuh"), w("rot"), w("dive"), w("schrei"), w("spiegel"), w("kopfbild-in-blau"), w("yak"), w("yak-ii"), w("river-in-the-middle-of-the-cave"), w("kerzberg"), w("the-shoemakers"), w("uims")]),
      S("Öl 2026 (7)", [w("die-jagd"), w("liturgy"), w("group-portrait-of-monks"), w("paladins"), w("selbstportraet"), w("portrait-of-deacons-ii"), w("study-of-the-head")]),
      S("Textil als Skulptur (7)", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pidsvichnyk-kerzenhalter"), w("vershnyky-detail"), w("trypillische-madonnen"), w("pipes-getragen")]),
      S("Skizzen und Zeitbasiertes (neu)", [n("skizzenbuch", "Skizzen und Studien – ausdrücklich erwünscht", true), n("video", "Link zu Vimeo/YouTube: Objekte am Körper"), m("hutfamilie")])
    ],
    docs: [d("statement", "Motivationsschreiben"), d("cv"), d("werkliste")],
    tips: ["Frist 01.–15.04.2027; Einladung ca. 3 Wochen später, Gespräche Ende Mai/Anfang Juni, Online-Eignungsprüfung Mitte Juni.", "Die Reihenfolge nach Gruppen (Acryl, Öl, Textil) ist hier kein Nachteil – aber lass zwei Textilarbeiten schon in der ersten Hälfte auftauchen."]
  });

  P("mainz-freie-kunst", {
    fit: "sehr hoch", count: [14, 20],
    strategy: "10–20 dokumentierte Arbeiten, je Arbeit Titel, Jahr, Maße, Material. Skizzenbuch bis 10 Seiten, zeitbasiert bis 10 Minuten aus bis zu 3 Arbeiten. Die Frist ist der 31.10.2026 – die Mappe steht bis auf Skizzenbuch und Video.",
    sections: [
      S("Malerei (8)", [w("die-jagd"), w("group-portrait-of-monks"), w("liturgy"), w("paladins"), w("yak-ii"), w("the-shoemakers"), w("haubus"), w("tanz")]),
      S("Textil als Bildträger und Skulptur (5)", [w("lituus-i"), w("bronzezeit-getragen"), w("pidsvichnyk-kerzenhalter"), w("vershnyky-detail"), w("skythisches-gold")]),
      S("Skizzenbuch und Zeitbasiertes (neu)", [n("skizzenbuch", "Bis 10 Seiten Skizzenbuch", true), n("video", "Kurzes Video (bis 10 Min. aus bis zu 3 Arbeiten)")])
    ],
    docs: [d("werkliste", "Pflicht: je Arbeit Titel, Jahr, Maße, Material"), d("statement", "Motivationsschreiben")],
    tips: ["Frist 31.10.2026; Mappe max. 12 MB (Bildteil).", "Prüfungsgespräch ca. 15 Minuten: übe, die Verbindung Malerei ↔ Textil in drei Sätzen zu sagen."]
  });

  P("nuernberg-freie-kunst", {
    fit: "hoch", count: [20, 26],
    strategy: "Mindestens 20 künstlerische Arbeiten digital, Vorauswahl über die Mappe, dann ein 10-minütiges Gespräch mit der Original-Mappe. Eine konzeptuelle Klammer fehlt: Entscheide dich für eine Frage (z. B. „Was bleibt an Kleidung?“) und zeige alles darunter.",
    sections: [
      S("Acryl 2023–25 (10)", [w("haubus"), w("tanz"), w("der-blaue-schuh"), w("rot"), w("dive"), w("spiegel"), w("yak-ii"), w("river-in-the-middle-of-the-cave"), w("kerzberg"), w("the-shoemakers")]),
      S("Öl 2026 (6)", [w("die-jagd"), w("liturgy"), w("group-portrait-of-monks"), w("paladins"), w("selbstportraet"), w("portrait-of-deacons-ii")]),
      S("Textil (5)", [w("lituus-i"), w("bronzezeit-getragen"), w("pidsvichnyk-kerzenhalter"), w("trypillische-madonnen"), w("vershnyky-detail")]),
      S("Raum und Skizze (neu)", [n("skizzenbuch"), n("video", "Zeitbasierte Arbeiten über das Upload-Portal (keine Links)"), n("buehne", "Installation: Hüte im Raum, drei Fotos")])
    ],
    docs: [],
    tips: ["Frist 15.04.2027. Zeitbasierte Arbeiten bitte über das eigene Upload-Portal der Hochschule hochladen, nicht verlinken.", "Zum Gespräch die Original-Mappe mitbringen."]
  });

  P("dresden-buehne-kostuem", {
    fit: "hoch", count: [15, 22],
    strategy: "Ein zusammengefügtes PDF mit vollständiger Werkliste (Maße, Material), eine unterschriebene Eigenständigkeitserklärung, danach digitale künstlerische Aufgabe (bis 8 Std.) und Abschlussgespräch. Für Bühnen- und Kostümbild braucht die Mappe Raum und Figurine.",
    sections: [
      S("Figuren und Szenen", [w("die-jagd"), w("group-portrait-of-monks"), w("liturgy"), w("kerzberg"), w("paladins"), w("tanz"), w("the-shoemakers")]),
      S("Kostüm", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pidsvichnyk-kerzenhalter"), w("strilez-hut"), w("dyki-bizony")]),
      S("Raum (neu)", [n("buehne", "Raumskizze oder Modell", true), n("figurine", "Figurinen", true), n("szene", "Szenische Fotos der Kostüme"), n("video")])
    ],
    docs: [d("werkliste", "Pflicht, mit Maßen und Material"), d("erklaerung", "unterschriebene Erklärung zur Eigenständigkeit")],
    tips: ["Frist 01.03.2027; PDF max. 30 MB (Bilder), 50 MB (Video/Ton optional).", "6 Wochen Vorpraktikum an einem Theater, bis zur Immatrikulation. Frühzeitig anfragen!"]
  });

  P("dresden-kostuemgestaltung", {
    fit: "mittel", count: [25, 30],
    strategy: "Mindestens 25 eigene Arbeiten, fachspezifisch dokumentiert (Fotos mit Maßen und Techniken). Dein Textil ist stark, aber die Hochschule fragt nach Schnitt, Konstruktion und Historischer Recherche, die in der Mappe fehlen. 5 Monate Vorpraktikum sind bei Immatrikulation nachzuweisen.",
    sections: [
      S("Kostüm-Dokumentation (12)", [w("skythisches-gold"), w("skythisches-gold-objekt"), w("bronzezeit-getragen"), w("leinenmantel"), w("leinenmantel-objekt"), w("dyki-bizony"), w("pipes-getragen"), w("pipes-weste"), w("weste-aus-reinem-kaschmir"), w("dem-tier-auf-der-spur"), w("vershnyky"), w("vershnyky-detail")]),
      S("Detail und Prozess (4)", [w("prozess-rueckenteil"), w("prozess-futterdetail"), w("prozess-knoepfe"), w("trypillische-madonnen")]),
      S("Malerei (6)", [w("group-portrait-of-monks"), w("paladins"), w("die-jagd"), w("haubus"), w("uims"), w("tanz")]),
      S("Fachlich nachlegen (neu)", [n("toile", "Schnitt- und Konstruktionsdokumentation", true), n("figurine", "Figurine", true), n("figurine", "Figurine mit Rückenansicht"), n("recherche", "Historische Schnittrecherche (Skythen/Trypillja)", true), n("figur")])
    ],
    docs: [d("werkliste")],
    tips: ["Frist 15.01.2027; Prüfung: Entwurfsaufgaben (2–8 Std.), Wissenstests, Gespräch; bestanden mit besser als 2,7.", "Das Vorpraktikum (5 Monate) ist die eigentliche Hürde – früh planen."]
  });

  P("dresden-bildende-kunst", {
    fit: "hoch", count: [25, 30],
    strategy: "25–30 Arbeiten als ein PDF plus Werkliste (Maße, Material). Die Prüfung ist eintägig praktisch (5–10 Std.) plus Gespräch. Zeichnung ist hier das, was die Mappe um Auffassungsgabe ergänzt – zwei neue Blätter reichen.",
    sections: [
      S("Acryl (12)", [w("haubus"), w("tanz"), w("der-blaue-schuh"), w("rot"), w("dive"), w("schrei"), w("spiegel"), w("yak"), w("yak-ii"), w("river-in-the-middle-of-the-cave"), w("kerzberg"), w("the-shoemakers")]),
      S("Öl (8)", [w("die-jagd"), w("liturgy"), w("group-portrait-of-monks"), w("paladins"), w("selbstportraet"), w("portrait-of-deacons"), w("portrait-of-deacons-ii"), w("study-of-the-head")]),
      S("Textil (5)", [w("lituus-i"), w("bronzezeit-getragen"), w("pidsvichnyk-kerzenhalter"), w("vershnyky-detail"), w("pipes-getragen")]),
      S("Studien (neu)", [n("figur", "Zeichnungen nach Modell", true), n("skizzenbuch", "Skizzenbuch")])
    ],
    docs: [d("werkliste", "mit Maßen und Material")],
    tips: ["Frist 15.01.2027; Bilder max. 30 MB, Video/Ton max. 50 MB.", "Zum Gespräch 3 Arbeiten wählen, die du im Detail erklären kannst."]
  });

  P("schneeberg-textil", {
    fit: "mittel", count: [18, 30],
    strategy: "Physische Mappe, höchstens 30 Arbeiten: Originale (Zeichnung, Malerei, Collage, Skizzen), 3D als Foto, bis zu zwei Originalmodelle. Naturstudien sind gefordert. Hier zählen deine kleinen Gemälde als Originale und zwei Hüte (Pidsvichnyk, Strilez) als Originalmodelle.",
    sections: [
      S("Pflicht: Naturstudien (neu)", [n("natur", "Naturstudie A", true), n("natur", "Naturstudie B", true), n("natur", "Naturstudie C", true)]),
      S("Zeichnung und Entwurf (neu)", [n("skizzenbuch"), n("stoff"), n("rapport", "Gestaltungsvorschlag zur Studienrichtung")]),
      S("Malerei (kleine Originale)", [w("der-blaue-schuh"), w("uims"), w("yak"), w("yak-rider"), w("spiegel"), w("kopfbild-in-blau"), w("selbstportraet"), w("study-of-the-head")]),
      S("Textil (Fotos + 2 Originalmodelle)", [w("pidsvichnyk-kerzenhalter", "Originalmodell: Hut"), w("strilez-hut", "Originalmodell: Hut"), w("vershnyky-detail"), w("trypillische-madonnen"), w("dyki-bizony"), w("leinenmantel"), w("weste-aus-reinem-kaschmir")])
    ],
    docs: [],
    tips: ["Handwerkliche Fähigkeiten sind erwünscht – das ist dein Vorteil. Kein Vorpraktikum.", "Termine laut Fakultätsseite (Antrag/Prüfung) frühzeitig erfragen."]
  });

  P("schneeberg-mode", {
    fit: "mittel", count: [18, 28],
    strategy: "Gleiche physische Mappe, für Mode besonders Figurenzeichnen und Naturstudien. Das ist deine Lücke; die Malerei ersetzt es nicht. Plane 8–10 Zeichnungen ein.",
    sections: [
      S("Pflicht: Naturstudien (neu)", [n("natur", "Naturstudie A", true), n("natur", "Naturstudie B", true)]),
      S("Figurenzeichnen (neu)", [n("figur", "Figurenzeichnung A", true), n("figur", "Figurenzeichnung B", true), n("figur", "Figurenzeichnung C", true)]),
      S("Entwürfe (neu)", [n("figurine", "Modeentwurf A"), n("figurine", "Modeentwurf B")]),
      S("Malerei (kleine Originale)", [w("uims"), w("der-blaue-schuh"), w("yak"), w("selbstportraet"), w("study-of-the-head"), w("spiegel")]),
      S("Textil (Fotos + 2 Originalmodelle)", [w("pipes-getragen"), w("skythisches-gold"), w("leinenmantel"), w("dyki-bizony"), w("dem-tier-auf-der-spur"), w("pidsvichnyk-kerzenhalter", "Originalmodell: Hut"), w("strilez-hut", "Originalmodell: Hut")])
    ],
    docs: [],
    tips: ["Kein Vorpraktikum. Termine laut Fakultätsseite erfragen.", "Figurenzeichnen wird für Mode besonders gewichtet – fange damit an."]
  });

  P("hof-textildesign", {
    fit: "mittel", count: [14, 16],
    strategy: "Etwa 15 Originale (keine Kopien von Zeichnungen), maximal DIN A1; gefragt sind Zeichnung, Farbe, Fotografie, Textiles ist optional. Deine kleinen Gemälde sind die „Farbe“, das Foto-Konvolut die „Fotografie“, die Zeichnung musst du ergänzen.",
    sections: [
      S("Zeichnung (neu)", [n("natur", "Naturstudie A", true), n("natur", "Naturstudie B"), n("stoff", "Stoffzeichnung A", true), n("stoff", "Stoffzeichnung B")]),
      S("Farbe (Originale)", [w("der-blaue-schuh"), w("uims"), w("kopfbild-in-blau"), w("spiegel"), w("yak"), w("yak-rider"), w("selbstportraet")]),
      S("Fotografie", [w("pipes-getragen"), w("pipes-weste")]),
      S("Textil (optional)", [w("vershnyky-detail"), w("trypillische-madonnen"), w("leinenmantel-objekt")])
    ],
    docs: [],
    tips: ["Termin 2027 noch nicht veröffentlicht. Mappenberatung nach Vereinbarung.", "Zeichnungen müssen Originale sein, keine Ausdrucke."]
  });

  P("bielefeld-mode", {
    fit: "hoch", count: [20, 20],
    strategy: "20 Arbeiten in einem PDF im Querformat, mit Inhaltsverzeichnis samt Kurzkommentaren und Fotos selbstgenähter Teile; dazu eine Pflicht-Hausaufgabe als eigenes PDF (Aufgabe 2 Wochen vor der Frist sichtbar). Deine genähten Teile sind genau das, was gefragt ist.",
    sections: [
      S("Selbstgenähte Teile (10)", [w("pipes-getragen"), w("skythisches-gold"), w("bronzezeit-getragen"), w("dyki-bizony"), w("leinenmantel"), w("weste-und-schuerze"), w("lituus-i"), w("vershnyky"), w("dem-tier-auf-der-spur"), w("pipes-weste")]),
      S("Detail und Prozess (3)", [w("prozess-knoepfe"), w("prozess-rueckenteil"), w("vershnyky-detail")]),
      S("Auseinandersetzung mit Mode (Malerei, 4)", [w("haubus"), w("uims"), w("group-portrait-of-monks"), w("paladins")]),
      S("Entwurf (neu)", [n("figurine", "Mode-Zeichnung"), n("silhouetten", "Silhouetten"), m("lineup", "Kollektionsidee")])
    ],
    docs: [d("deckblatt", "Inhaltsverzeichnis mit Kurzkommentaren"), d("hausaufgabe", "Pflicht, separates PDF")],
    tips: ["Registrierung bis 01.01.2027; Vorauswahl über die Mappe (Mitteilung 12.01.2027, 17 Uhr), dann digitale Eignungsprüfung am 13.01.2027.", "Kein Vorpraktikum genannt."]
  });

  P("muenchen-buehne-kostuem", {
    fit: "hoch", count: [12, 16],
    strategy: "Physische Mappe per Post: ungerahmt, keine Rollen, max. 90 × 90 × 90 cm, plus Mappenerklärung. Große Gemälde als Fotodruck, kleine Originale ohne Rahmen. Textil als Foto; ein, zwei kleine Originale (Hut) sind möglich. Raumidee fehlt noch.",
    sections: [
      S("Malerei (Drucke und kleine Originale)", [w("die-jagd", "Druck"), w("group-portrait-of-monks", "Druck"), w("kerzberg", "Druck"), w("paladins", "Druck"), w("the-shoemakers", "Druck"), w("yak-rider", "Original, Rahmen entfernen!")]),
      S("Kostüm und Objekt", [w("lituus-i"), w("bronzezeit-getragen"), w("skythisches-gold"), w("pidsvichnyk-kerzenhalter"), w("strilez-hut"), w("trypillische-madonnen")]),
      S("Raum (neu)", [n("buehne", "Raumidee: Modell oder Collage", true), n("szene", "Objekte in einer Situation (Fotos)", true)])
    ],
    docs: [d("erklaerung")],
    tips: ["Eingang bis 15.05.2027; Praktikumsnachweis (8 Wochen) laut Checkliste – beim Sekretariat klären, ob er für diese Klasse gilt.", "Nach der Mappenauswahl praktische und mündliche Prüfung."]
  });

  /* ---------- Auswertung je Plan ---------- */
  const DAYS = k => (NEW[k] ? NEW[k][2] : 0);
  function summarize(id) {
    const pl = plans[id];
    const out = { w: 0, m: 0, n: 0, d: 0, days: 0, crit: 0, total: 0, newKeys: [] };
    pl.sections.forEach(sec => sec.slots.forEach(sl => {
      const c = sec.extra ? 0 : 1;
      if (sl.k === "w") { out.w++; out.total += c; }
      else if (sl.k === "m") { out.m++; out.total += c; out.days += MONT[sl.key][3]; }
      else if (sl.k === "n") { out.n++; out.total += c; out.days += DAYS(sl.key); if (sl.crit) out.crit++; out.newKeys.push(sl.key); }
    }));
    (pl.docs || []).forEach(dc => { out.d++; out.days += DOC[dc.key][2]; });
    return out;
  }
  Object.keys(plans).forEach(id => { plans[id].sum = summarize(id); });

  /* ---------- Gesamtanalyse (Kunstprofessor) ---------- */
  const analysis = {
    verdict: "Veronika arbeitet an einer seltenen Verbindung: Ihre Malerei und ihre Kleidung sind keine zwei Portfolios, sondern ein Werk. Dieselben Figuren – die Maske, der breite schwarze Hut, das Tier – erscheinen als Öl auf Leinwand und als genähte, getragene Objekte. Handwerk (alles von Hand, Knöpfe selbst geformt), Material (Rost, Wachs, Pigment) und Quellen (Skythen, Trypillja, Bronzezeit, ukrainische Schrift) sind für ihr Stadium ungewöhnlich reif. Schwach ist nicht das Werk, sondern das, was die Mappe um das Werk herum noch nicht zeigt: Zeichnung, Entwurf, Prozess.",
    scores: [
      { label: "Bildsprache und Wiedererkennbarkeit", v: 5, note: "Hut, Maske, Tier, Schwarz: In einem Blick erkennbar." },
      { label: "Textile Handwerkskunst", v: 5, note: "Alles von Hand genäht, Knöpfe einzeln modelliert, Hüte frei geformt." },
      { label: "Malerische Qualität", v: 4, note: "Group Portrait of Monks und Paladins sind auf hohem Niveau; frühe Blätter und kleine Studien schwächer." },
      { label: "Konzept und Quellen", v: 4, note: "Archäologie, Schrift, Erinnerung – belegt durch Material. Ein Statement in Worten fehlt." },
      { label: "Material und Oberfläche", v: 4, note: "Rost, Wachs, Pigment, Tinte; als Versuchsreihe noch nicht gezeigt." },
      { label: "Dokumentation (Fotografie)", v: 3, note: "Hintergründe wechseln, einige Ölfotos zu dunkel, Kerzberg gedreht." },
      { label: "Entwurfsprozess", v: 2, note: "Drei Prozessblätter, aber keine Skizze, Figurine oder Schnittidee." },
      { label: "Serie / Kollektion", v: 2, note: "Sieben vollständige Looks existieren, sind aber nie gemeinsam gezeigt." },
      { label: "Zeichnung und Studien", v: 1, note: "Im gesamten Konvolut kein einziges Zeichenblatt oder keine Naturstudie." }
    ],
    strengths: [
      ["Eine Ikonografie, die man wiedererkennt", "Der breite Hut ist ihr Zeichen: in Haubus, Liturgy, Die Jagd und Portrait of Deacons gemalt, als Bronzezeit-, Pidsvichnyk- und Strilez-Hut gebaut. Jurys suchen genau diese Handschrift."],
      ["Figur als Fläche und als Form", "Die Acrylbilder trennen Fläche und Plastizität (flacher Körper, modelliertes Gesicht). Das ist eine Entscheidung, kein Zufall – und dieselbe Logik zeigt ihr Kostüm: Silhouette zuerst."],
      ["Mensch-Tier-Verwandlung mit Tiefe", "Yak, Yak II, Holding the Young Yak: Mensch und Tier verschmelzen. Ein Thema (Steppe, Ritual, Verwandlung), das nicht illustrativ bleibt."],
      ["Material, das etwas bedeutet", "Rostgefärbte Futter, Wachs, Tinte, altes Nähgarn. Das Futter trägt Handschrift, verborgen vor dem Betrachter. „Kleidung trägt Erinnerung“ ist durch das Material belegt, nicht nur behauptet."],
      ["Konsequentes Handwerk", "Alles handgenäht, Knöpfe einzeln modelliert (VVH als Signatur), Hüte frei geformt. Textil- und Modeprüfer sehen das sofort."],
      ["Malerische Entwicklung", "2023 flächig-expressiv → 2025 tonal-grau mit Hybridwesen → 2026 Öl mit Hell-Dunkel und Gruppenbildern. Group Portrait of Monks und Paladins zeigen Anatomie, Hände und Raum."]
    ],
    risks: [
      ["Keine Zeichnung", "Im gesamten Konvolut gibt es kein Zeichenblatt, keine Aktstudie, keine Naturstudie. Trier, Schneeberg, Hof, ABK Stuttgart, Reutlingen und die Prüfung der HAW verlangen das. Das ist die größte Lücke."],
      ["Entwurfsprozess fehlt", "Drei Prozessblätter (Knöpfe, Rückenteil, Futter), aber keine Skizze, Figurine oder Schnittidee. Mode- und Kostümjurys wollen sehen, wie ein Stück entsteht."],
      ["Kollektion nicht gezeigt", "Mindestens sieben vollständige Looks (Pipes, Bronzezeit, Skythisches Gold, Dyki Bizony, Leinenmantel, Vershnyky, Lituus I) – nie nebeneinander. Ein Line-up beweist „Serie“ in einem Blick."],
      ["Fotografie uneinheitlich", "Teils freigestellt auf Schwarz, teils vor Tuch oder Wand; einige Ölfotos viel zu dunkel (Hermits, Holding the Young Yak, Warten). In der Jury-Ansicht verschwinden Details."],
      ["Ausrichtung prüfen", "Kerzberg ist im PDF und auf der Website um 90° gedreht. Bewusst? Dann in der Werkliste vermerken; sonst korrigieren."],
      ["Texte nennen Technik, nicht die Frage", "Die Bildtexte nennen Material und Verfahren (gut), aber nie, warum Pfeife, Reiter, Bison. Ein Statement von drei Sätzen fehlt."],
      ["Schwächere Blätter verwässern", "Schatten, Warten, Der weiße Schuh und Hermits sind gut, aber nicht auf dem Niveau der Gruppe. In einer 15-Blatt-Mappe nicht zeigen."]
    ],
    jury: "In den ersten 60 Sekunden sieht eine Jury: Hut, Maske, Schwarz – sofort eine Handschrift. Dann Hände (Group Portrait of Monks, Paladins): sie kann malen. Dann den Mantel mit Pfeife auf dem Foto: sie kann nähen. Die offene Frage ist: Kann sie auch zeichnen und entwerfen? Genau darauf antworten die neuen Blätter in den Musterbewerbungen.",
    types: [
      ["Freie Kunst (HfG Offenbach, Mainz, Nürnberg, Dresden Bildende Kunst, Weißensee Malerei)", "Malerei und Textil als ein Werk zeigen, mit einem Statement. Weniger Details, mehr große Positionen; Skizzen als Nebenblatt."],
      ["Mode (HAW, Weißensee, UdK, HTW, BURG, Pforzheim, Trier, Bielefeld)", "Looks, Konstruktion, Figurinen, Line-up. Malerei als Beleg fürs Figurgefühl (2–5 Blätter)."],
      ["Textil / Material (Weißensee, ABK, BURG, Schneeberg, Hof)", "Rost, Wachs, Futter, Knöpfe, Färbetafeln. Malerei nur 1–3 Blätter."],
      ["Kostüm / Bühne (UdK, HAW, Dresden, ABK, München, Hannover SKE)", "Figuren in Räumen: Gruppenbilder plus Kostüm als Auftritt. Raum und Szene neu erstellen."]
    ],
    reshoot: ["hermits", "holding-the-young-yak", "warten", "river-in-the-middle-of-the-cave"],
    weak: ["schatten", "der-weisse-schuh", "warten", "hermits"]
  };

  window.STUDY_MUSTER = { catalog, series: SERIES, NEW, MONT, DOC, plans, analysis };
})();
