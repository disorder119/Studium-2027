# Studium 2027 – Bewerbungsguide

Persönlicher Guide für Bewerbungen an Hochschulen (Textil, Mode, Kostüm/Bühne, Freie Kunst):
Fristen, Anforderungen, Ablauf, Checkliste – und je Studiengang eine **Musterbewerbung** als Raster.

## Inhalt
- **Fristen, Karte, Studiengänge, Cockpit** – 30 Studiengänge mit offiziellen Quellen (`data.js`)
- **Analyse** – Kunstprofessor-Einschätzung des Portfolios (PDF, 64 Seiten) mit Stärken, Lücken, Serien und Werkarchiv (`muster.js`)
- **Musterbewerbungen** – je Studiengang: welche Arbeiten in welcher Reihenfolge, was vorhanden ist (Bild), was als Montage entsteht und was noch neu erstellt werden muss (inkl. Aufwand in Tagen und Machbarkeit bis zur Frist)
- **Mappen-Editor** (`editor.html`) – A4-Seiten mit Bildern und Text, Galerie + eigene Uploads, Layouts, Texteditor, Autosave im Browser, Rückgängig, **PDF-Export** mit Größenlimit; „Aus Musterbewerbung“ baut die komplette Mappe vor
- **Kosten & Finanzierung** – zugeschnitten auf eine ukrainische Staatsbürgerin mit § 24 AufenthG: Studiengebühren (BW/Bayern), BAföG (heute und Entwurf 2027), Aufenthaltstitel, Sperrkonto, Krankenversicherung, uni-assist, Stipendien, Wohnen; Monatsbudget-Rechner und Bewerbungskosten. Jede Zahl mit Quelle und Stand (01.10.2026)
- **Stimmen** – Erfahrungen und Tipps aus öffentlichen Quellen (Hochschulen, StudyCheck, Foren, Berichte), mit Herkunft und Link; nichts erfunden
- **Dein Plan** – Motivation, nächster Schritt heute, Fristen-Zeitleiste, Fortschrittsring
- Fortschritt: wird automatisch im Browser gespeichert; „Willkommen zurück“; Komplett-Sicherung (Cockpit + Editor + Rechner); installierbar als App, offline nutzbar
- Mappenberatung & Termine, Ukraine (Zeugnis/Sprache), Checkliste, Glossar (DE/UA)

## Lokal starten
`./start.sh` (Mac/Linux) bzw. `start.bat` (Windows, Python nötig), dann http://localhost:8077 öffnen.

## Dateien
| Datei | Zweck |
|---|---|
| `index.html`, `styles.css` | Seite und Gestaltung |
| `app.js` | Logik (Filter, Karte, Cockpit, Dialoge) |
| `data.js` | Hochschuldaten, Fristen, Stärkenprofil |
| `muster.js` | Werkkatalog (61 Blätter), Analyse, 30 Musterbewerbungen |
| `muster-ui.js` | Darstellung von Analyse, Raster, Werkarchiv |
| `editor.html`, `editor.css`, `editor.js` | Mappen-Editor mit PDF-Export |
| `kosten.js`, `kosten-ui.js` | Kosten-Datensatz mit Quellen und Rechner |
| `stimmen.js`, `stimmen-ui.js` | Erfahrungen und Tipps mit Quellen |
| `motion.js`, `progress.js` | Animationen, Motivation, Sicherung |
| `sw.js`, `manifest.webmanifest` | Offline-Modus und App-Installation |
| `fonts/` | IM Fell English, EB Garamond (lokal, OFL) |
| `vendor/` | html2canvas, jsPDF (lokal, MIT-Lizenz) |
| `map-data.js` | Deutschlandkarte |
| `img/` | Werkbilder (aus Portfolio-PDF und Website) |

## Hinweise
- Die Musterbewerbung wählt aus vorhandenen Arbeiten, was zu den **veröffentlichten** Kriterien einer Hochschule passt. **Eine Zulassung kann niemand garantieren.**
- Fristen vor dem Absenden immer auf der Hochschulseite prüfen (Quellen im Studiengang).
- Haubus ist laut Website verkauft (nur als Foto/Druck verwenden); die Maße von „Yak“ weichen zwischen PDF und Website ab; Kerzberg ist im Foto um 90° gedreht – bitte prüfen.

- Editor: Der PDF-Export braucht einen Webserver (`start.sh`/`start.bat` oder GitHub Pages) – bei direktem Öffnen der Datei blockiert der Browser die Bilder. Galerie-Bilder haben Web-Auflösung (max. 640 px); für scharfen Druck eigene Originale hochladen.

## Datenschutz
Die Seite enthält personenbezogene Angaben (Name, Kontakt, Aufenthaltsstatus). Deshalb **nur in einem privaten Repository** oder privat hosten, nicht in ein öffentliches Repo legen. Die Seite setzt `noindex`.

## Quellen und Stand
Alle Kosten- und Rechtsangaben nennen Quelle und Stand (Recherche 01.10.2026). Das ist keine Rechts- oder Sozialberatung; verbindlich entscheiden Hochschule, Ausländerbehörde, BAföG-Amt und Krankenkasse.
