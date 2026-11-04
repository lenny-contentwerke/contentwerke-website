// build.js — packt nur die Website-Dateien in dist/ (für Netlify).
// Kein npm-Paket nötig: nur Node-Bordmittel (fs). Läuft mit `node build.js`.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const ITEMS = ["index.html", "bewerbung.html", "404.html", "danke.html", "impressum.html", "datenschutz.html", "robots.txt", "sitemap.xml", "_headers", "_redirects", "css", "js", "assets"];

// Diese Pfade NICHT mitkopieren (nur Quellmaterial, zur Laufzeit nicht gebraucht):
const EXCLUDE = ["/assets/video", "/assets/frames", "/assets/seq_src"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const item of ITEMS) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(OUT, item), {
    recursive: true,
    filter: (s) => {
      const p = s.replace(/\\/g, "/");
      return !EXCLUDE.some((ex) => p.includes(ex));
    },
  });
  count++;
}

// Kurzer Report
function size(dir) {
  let bytes = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name);
    bytes += e.isDirectory() ? size(fp) : fs.statSync(fp).size;
  }
  return bytes;
}
console.log(`dist/ erstellt — ${count} Einträge, ~${(size(OUT) / 1048576).toFixed(1)} MB.`);
console.log("Deploy: 'netlify deploy --prod' ODER dist/ auf app.netlify.com/drop ziehen.");
