// ClinicSync Service Worker
// Enables PWA installability — minimal caching (app lives on GAS server)
//
// ── IMPORTANT: Update CACHE_NAME for each environment ─────────────────────
//    Format: csync-<client-slug>-<env>-v<version>
//    The Setup Wizard generates the exact value for you (Step 6 result).
//    Examples:
//      DEV                    → csync-dev-v1
//      QA                     → csync-qa-v1
//      Mann Clinic  PROD      → csync-mann-clinic-prod-v1
//      Sunshine Hospital PROD → csync-sunshine-hospital-prod-v1
//    Bump version (v1 → v2) whenever you update PWA shell files
//    so all browsers pick up the new version and discard the old cache.
// ──────────────────────────────────────────────────────────────────────────
const CACHE_NAME = 'csync-dev-v1';   // ← change per environment

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install — cache the PWA shell files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — serve shell from cache, everything else from network
self.addEventListener('fetch', function(event) {
  // Only cache our own shell files — let GAS requests go straight to network
  var url = event.request.url;
  var isShell = SHELL_FILES.some(function(f) { return url.endsWith(f.replace('./', '')); });

  if (isShell) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request);
      })
    );
  }
  // All other requests (GAS API calls etc.) go directly to network — no caching
});
