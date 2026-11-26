const CACHE_NAME = 'milkcount-v16';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo-192.png',
  './logo-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Background Sync Listener
self.addEventListener('sync', event => {
  if (event.tag === 'milkcount-customer-sync') {
    event.waitUntil(Promise.resolve());
  }
});

// Periodic Background Sync Listener
self.addEventListener('periodicsync', event => {
  if (event.tag === 'milkcount-customer-periodic') {
    event.waitUntil(Promise.resolve());
  }
});

// Push Notifications Listener
self.addEventListener('push', event => {
  const title = 'MilkCount - పాల లెక్కలు';
  const options = {
    body: event.data ? event.data.text() : 'మీ పాల డెలివరీ అప్‌డేట్ వచ్చింది!',
    icon: './logo-192.png',
    badge: './logo-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// offline saport fetch cached
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co') || e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      });
    })
  );
});
