/* Service Worker: Offline-Nutzung und schneller Start. Stale-while-revalidate für alle Dateien der Seite. */
const V = "vh-studium-v11";
const CORE = ["./", "./index.html", "./editor.html", "./styles.css", "./editor.css", "./app.js", "./data.js", "./map-data.js", "./muster.js", "./kosten.js", "./stimmen.js", "./muster-ui.js", "./kosten-ui.js", "./stimmen-ui.js", "./vh.js", "./howto.js", "./mine.js", "./brief.js", "./top.js", "./motion.js", "./progress.js", "./editor.js", "./fonts/fonts.css", "./vendor/html2canvas.min.js", "./vendor/jspdf.umd.min.js", "./manifest.webmanifest", "./img/icon-192.png", "./img/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || (await c.match("./index.html"));
  }));
});
