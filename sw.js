/* SENYAS service worker: keeps the app, the website and the hand-tracking files so SENYAS opens
   and works without a signal. Pages come from the network when online (updates show at once) and
   from the copy when offline. Bump VERSION after changing icons, the manifest or vendor files. */
var VERSION = "senyas-v1";
var PRECACHE = ["app/", "./", "privacy.html", "manifest.webmanifest", "favicon.ico", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(PRECACHE.map(function (u) { return new Request(u, { cache: "reload" }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("senyas-") === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function keep(cache, req, res) { return cache.put(req, res).catch(function () {}); }
function page(e) {
  var req = e.request, home = new URL(req.url).pathname.indexOf("/app/") !== -1 ? "app/" : "./";
  return fetch(req, { cache: "no-cache" }).then(function (res) {
    if (res.ok) { var copy = res.clone(); e.waitUntil(caches.open(VERSION).then(function (c) { return keep(c, req, copy); })); }
    return res;
  }).catch(function () {
    return caches.open(VERSION).then(function (c) { return c.match(req, { ignoreSearch: true }).then(function (hit) { return hit || c.match(home); }); }).then(function (hit) { return hit || Response.error(); });
  });
}
/* Files (icons, hand tracking): the saved copy at once, fetched and saved the first time. */
function asset(e) {
  var req = e.request;
  return caches.open(VERSION).then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) { if (res.ok || res.type === "opaque") keep(c, req, res.clone()); return res; });
    });
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || req.headers.get("range")) return;
  if (req.mode === "navigate") { e.respondWith(page(e)); return; }
  var u = new URL(req.url);
  if (u.origin === self.location.origin || u.hostname === "cdn.jsdelivr.net" || u.hostname === "storage.googleapis.com") e.respondWith(asset(e));
});
