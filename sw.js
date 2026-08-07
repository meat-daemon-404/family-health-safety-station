/* 家庭健康与安全守护站 - Service Worker（离线可用） */
var CACHE = "hfs-v2-cache";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/common.js",
  "./js/storage.js",
  "./js/app-home.js",
  "./js/links.js",
  "./js/search.js",
  "./js/data-firstaid.js",
  "./js/data-medicine.js",
  "./js/data-psych.js",
  "./js/app-jijiu.js",
  "./js/app-yixiang.js",
  "./js/app-xinli.js",
  "./js/app-qingxu.js",
  "./js/app-yjqd.js",
  "./pages/jijiu.html",
  "./pages/xinli.html",
  "./pages/yixiang.html",
  "./pages/yjqd.html",
  "./pages/qingxu-jijiu.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var url = e.request.url;
  if (e.request.method !== "GET") return;
  if (new URL(url).origin !== self.location.origin) return; // 跨域（如 CloudBase SDK）直连
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
    })
  );
});
