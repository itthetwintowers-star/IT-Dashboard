// IT Dashboard Service Worker v1.1
// วางไฟล์นี้ใน root ของ GitHub repo เดียวกับ index.html

const CACHE = 'it-dash-v1';
const SHELL = ['./', './index.html'];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([...SHELL, ...CDN]).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // GAS/Live data → network first
  if (e.request.url.includes('script.google.com') || 
      e.request.url.includes('googleapis.com/macros')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => new Response('[]', { headers: { 'Content-Type': 'application/json' }}))
    );
    return;
  }
  // Everything else → cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
