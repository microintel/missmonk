/* Missmonk service worker — caches static assets, fonts, icons and images
   so repeat visits fire far fewer network requests. */

const CACHE_VERSION  = 'missmonk-v1';
const STATIC_CACHE    = CACHE_VERSION + '-static';
const IMAGE_CACHE      = CACHE_VERSION + '-images';
const DATA_CACHE        = CACHE_VERSION + '-data';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {}) // don't block install if a CDN asset is briefly unreachable
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('missmonk-') && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isImageRequest(req, url) {
  return req.destination === 'image' ||
         /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname) ||
         url.hostname === 'covers.openlibrary.org';
}

function isFontOrIconAsset(url) {
  return url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com' ||
         url.hostname === 'cdn.jsdelivr.net';
}

function isDataRequest(url) {
  // curriculum JSON / OpenLibrary lookups — fine to serve slightly stale
  return url.pathname.endsWith('.json') || url.hostname === 'openlibrary.org';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1) Fonts & icon CDN assets: cache-first, they're versioned/immutable.
  if (isFontOrIconAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // 2) Images (book covers etc.): cache-first, refresh in background.
  if (isImageRequest(req, url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // 3) Curriculum / lookup JSON: stale-while-revalidate so the UI loads instantly
  //    from cache while a fresh copy is fetched in the background.
  if (isDataRequest(url)) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // 4) Everything else (app shell, navigations): network-first, cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.mode === 'navigate' || url.origin === self.location.origin)) {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
