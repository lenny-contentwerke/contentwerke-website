// Minimal static file server for local preview
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = 5178;
const TYPES = { ".html":"text/html", ".css":"text/css", ".js":"application/javascript",
  ".json":"application/json", ".jpg":"image/jpeg", ".jpeg":"image/jpeg",
  ".png":"image/png", ".mp4":"video/mp4", ".svg":"image/svg+xml", ".ico":"image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("no"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log("Content Werke preview → http://localhost:" + PORT));
