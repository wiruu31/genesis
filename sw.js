/* Genesis v2.1.0, sw.js
 * Strategi: jaringan dulu untuk berkas aplikasi (agar pembaruan cepat terlihat), cache sebagai cadangan offline.
 * Font Google: cache dulu lalu perbarui di latar (stale-while-revalidate) di cache terpisah, supaya font tetap tampil offline
 * setelah pernah dimuat sekali. Bila belum pernah dimuat, tampilan memakai font sistem.
 * Naikkan VERSI setiap rilis agar cache lama dibersihkan.
 */
const VERSI = 'genesis-v2.1.0';
const CACHE_FONT = 'genesis-font-v1';
const HOST_FONT = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const BERKAS = [
  './', 'genesis.html', 'genesis.css', 'genesis-hash.js', 'genesis-kunci.js', 'genesis-data.js',
  'genesis-konten-level0-1.js', 'genesis-konten-level2-3.js', 'genesis-konten-level4.js',
  'genesis-core.js', 'genesis-lab-logika.js', 'genesis-diagram.js', 'genesis-app.js',
  'manifest.webmanifest', 'genesis-ikon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSI).then((c) => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSI && k !== CACHE_FONT).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (HOST_FONT.includes(url.hostname)) {
    e.respondWith(caches.open(CACHE_FONT).then((c) => c.match(req).then((hit) => {
      const baru = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || baru;
    })));
    return;
  }

  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then((res) => {
      const salin = res.clone();
      caches.open(VERSI).then((c) => c.put(req, salin));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('genesis.html')))
  );
});
