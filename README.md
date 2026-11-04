# Contentwerke — Hyper-modern Onepager

Onepager für die **Contentwerke GmbH** – deine **Socialagentur ausm Osten**
(Altenburger Land / Schmolln). **Nicht** die Fremdseite 1:1 nachgebaut, sondern nur der
**Inhalt & die Sprüche** von content-werke.de übernommen und in eine **eigene,
hypermoderne Struktur** mit Effekten gegossen (dark-editorial, kinetische Typografie).

## Ansehen

**Weg 1:** `index.html` doppelklicken (Internet an – Libs & Spline per CDN).
**Weg 2 (empfohlen):**

```bash
node server.js
```
→ http://localhost:5178

## 🚀 Deploy auf Netlify

Das Projekt ist **Netlify-ready**. Website-Dateien landen per `build.js` in `dist/`
(≈ 9 MB) – ohne `node_modules` und ohne die 2 GB Foto-ZIPs im Ordner `Bilder/`.

**Variante A – Drag & Drop (am einfachsten):**
```bash
node build.js
```
Dann den erzeugten Ordner **`dist/`** auf **https://app.netlify.com/drop** ziehen. Fertig.

**Variante B – Git + Auto-Deploy (empfohlen für Updates):**
1. `git init && git add . && git commit -m "Contentwerke onepager"`
2. Repo zu GitHub pushen.
3. Auf Netlify „Add new site → Import from Git" wählen.
   `netlify.toml` erledigt den Rest (Build = `node build.js`, Publish = `dist`).

**Variante C – Netlify CLI:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

Enthalten: `netlify.toml` (Build + Cache-/Security-Header), `_headers`, `robots.txt`,
On-Brand-`404.html`, `.gitignore`. Nach dem ersten Deploy: eigene Domain in Netlify verbinden
und `og:image` in `index.html` auf die echte URL setzen (aktuell relativ).

## Struktur (eigene, moderne Architektur)

1. **Hero** – Video-Frame-Scrubbing + kinetische Typo („DEINE SOCIALAGENTUR"), HUD, Scramble-Tag.
2. **Marquee** – Endlos-Laufband der Leistungen (reagiert auf Scroll-Speed).
3. **Manifest** – „Du postest – aber es passiert nichts?" mit nummerierter Aufgabenliste.
4. **Stat-Sequenz** – gepinnte Vollbild-Zahlenshow (75 % / −40 % / ×3) mit Cross-Fade & Count-up.
5. **Leistungen** – **Sticky-Stacking-Karten** (Strategie · Social Media · Digitalisierung ·
   Employer Branding · Website), die beim Scrollen aufeinanderstapeln.
6. **Interactive 3D (Spline)** – interaktive Szene + Spotlight (aus dem React-Prompt in Vanilla).
7. **Story** – **horizontal gepinnte** Zeitleiste 2021–2026 mit Riesen-Jahreszahlen.
8. **Cases** – Logo-Marquee + Testimonial-Karten (EDO, David Jähler, Opitz, VR-Bank) mit Count-up-Kennzahlen.
9. **Team** – **Hover-Reveal-Roster**: Namensliste, Foto erscheint beim Hovern am Cursor (inkl. Lenny Börngen).
10. **Region** – animierte Karte „Verwurzelt in Mitteldeutschland" (Altenburg als Zentrale).
11. **FAQ** – Accordion.
12. **Kontakt** – kinetischer CTA + Footer/Impressum + Datenschutz-Modal.

## Effekte / Technik

- Lenis Smooth-Scroll · GSAP ScrollTrigger (Pins, Scrub) · eigener magnetischer Cursor ·
  Preloader · Split-Char-Intro · Scramble-Decode · Reveal-Masken · Scroll-Velocity-Marquees ·
  Film-Grain · Count-ups.
- Hero = Canvas-Frame-Scrubbing (240 JPGs aus `assets/video/hero.mp4`).
- Linke Schnellzugriff-Navigation mit Scrollspy.
- Dark-editorial: **Archivo** (fett) + **Space Mono** (Labels) + Inter, Akzent **Rot #ff2a39**.
- Reine Vanilla-Lösung, kein Build-Step. Responsiv (Mobile: Pins → statisch/Swipe).

## Sprüche übernommen

„Ausm Osten. Für den Osten." · „Du machst dein Business. Wir den Rest." · „Weniger reden.
Mehr machen." · „Kurze Wege. Direkte Kommunikation." · „Reden wir nicht drüber. Zeigen wir
lieber." · „Zielgerichtet. Wirksam." · „Gesehen. Gebucht."

## Spline

- Web-Component `spline-viewer` (unpkg) + Szene aus dem Prompt (`prod.spline.design/kZDDjO5HuC9GJUM2`).
  Eigene Szene: `url="…"` in `index.html` tauschen. Das „Built with Spline"-Badge lässt sich
  nur mit bezahltem Spline-Account entfernen.

## Echte Fotos & Logos (von content-werke.de übernommen)

Alle Medien wurden direkt von der Live-Seite (Onepage/onecdn) geladen und web-optimiert.

- **8 Team-Porträts** (Hover-Reveal, korrekt zugeordnet): Pascal, Linda, Luise, Christoph,
  Sascha, Paul, Lenny, Tammy → `assets/img/team/`.
- **Gruppenfoto** der Crew als Banner im Team-Bereich.
- **18 Kunden-/Partner-Logos** als Logo-Wall im Cases-Bereich (EDO, Opitz, VR-Bank, David
  Jähler, GTJ, Seyfarth, Schumann, IBB, Mauderer, AWA, LKS, Elektro Lehmann, Brinkmann,
  Schmöllner Heim, TUS, Physium, Wolf, TFT) → `assets/img/logos/`.
- **Einblicke/BTS-Strip**: Equipment-Flatlay, Instagram/Handy, Team-Arbeit, Schreibtisch
  → `assets/img/bts/`.
- **Kampagnen-Beispiel** „Podcast Summit" in der „Du postest?"-Sektion → `assets/img/post-podcast.jpg`.
- Rohdownloads liegen unter `_research/site-images/`; die eigenen Shooting-ZIPs unter `Bilder/`.

## KI-Assistent (unten rechts)

- Floating-Button „KI fragen" → Chat-Panel mit **wissensbasiertem Assistenten** zu
  Leistungen, Preisen, Ablauf, Team, Standort, Referenzen und Terminen (Intent-Matching +
  Quick-Replies + Tipp-Indikator). Läuft **komplett clientseitig, ohne API-Key**.
- Upgrade auf echtes GPT/Claude möglich, sobald ein kleiner Backend-Endpoint existiert
  (Key niemals im Frontend). Logik in `js/main.js` → `initAI`, Wissensbasis-Array `KB`.

## Performance

- Die Spline-3D-Szene wird **vorab geladen** (~1 Viewport früher, Szene per `prefetch`
  vorgewärmt) und blendet sanft ein → kein Pop-in. Entladen, sobald man weit weg scrollt
  → kein dauerhaftes WebGL-Rendern.

## Funktionen (Conversion, Recht, SEO)

- **Kontaktformular via Netlify Forms** (`name="kontakt"`, `data-netlify="true"`): landet
  automatisch in eurem Netlify-Dashboard + optional E-Mail-Benachrichtigung. Funktioniert
  **erst nach Deploy auf Netlify** (lokal zeigt es nur die Erfolgs-Animation). Fallback:
  `danke.html`. Spam-Schutz per Honeypot.
- **Echte Testimonial-Videos** (YouTube) als datensparsame Facades: laden erst per Klick,
  über `youtube-nocookie.com`. IDs in den Cases-Cards (`data-yt`).
- **Cookie-Consent + Meta-Pixel** (ID `876906785220745`): Pixel lädt **nur nach Zustimmung**.
  Auswahl gespeichert; „Cookie-Einstellungen" im Footer öffnet den Banner erneut.
- **Instagram/Reels-Sektion** + **„Für wen"-Sektion** (Zielgruppen).
- **Sticky „Termin sichern"-Leiste** auf Mobil (blendet in Hero/Kontakt aus).
- **Rechtstexte** als echte Seiten: `impressum.html` (echte Daten: HRB 522928, AG Jena,
  Pascal Zopora, HDI-Versicherung) und `datenschutz.html` (auf die tatsächlich genutzten
  Dienste zugeschnitten – **vor Livegang anwaltlich prüfen**).
- **SEO**: JSON-LD (ProfessionalService/LocalBusiness), `sitemap.xml`, `robots.txt`,
  Canonical, absolute OG-Tags, Favicon-Set (`apple-touch-icon`, PNG-Favicons).
- **Echte Social-Links** (IG/TikTok/YouTube/LinkedIn/Facebook) in Footer + Kontakt.

> Canonical/OG/JSON-LD/Sitemap verweisen auf `https://content-werke.de`. Nach dem Deploy
> ggf. auf die tatsächliche Domain anpassen.

## Platzhalter (noch ersetzen)

- Testimonial-Videos (Client-Videos), Kunden-Kennzahlen = Beispielwerte.
- Rollen/Namen im Team ggf. anpassen (Tammy-Rolle als Platzhalter).
- Echtes Logo (aktuell Text-Wortmarke), Social-Links (`#`).
- Vollständige Datenschutzerklärung (rechtlich prüfen).

## Struktur (Dateien)

```
contentwerke-3d/
├─ index.html · css/style.css · js/main.js
├─ server.js            # Mini-Static-Server (Port 5178)
├─ assets/video/hero.mp4 · assets/seq/f_001…240.jpg · assets/img/hero-poster.jpg
└─ _research/           # Recherche zu content-werke.de
```
