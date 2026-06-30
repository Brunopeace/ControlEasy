const CACHE_NAME = 'controleasy-v18';
const ASSETS = [
  './', // Garante o cache da página inicial no GitHub Pages
  'index.html',
  'manifest.json',
  'img/icon-192.png',
  'img/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];

// Instala o Service Worker e guarda os arquivos no Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos um laço para evitar que um único erro de CDN trave todo o cache
      return Promise.all(
        ASSETS.map(asset => {
          return cache.add(asset).catch(err => {
            console.error(`Falha ao cachear o arquivo: ${asset}`, err);
          });
        })
      );
    })
  );
});

// Ativa e remove caches antigos se houverem
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Serve os arquivos direto do cache quando estiver offline
self.addEventListener('fetch', (e) => {
  // Ignora requisições de CDNs com redirecionamento dinâmico (como unpkg @latest) no cache estático
  if (e.request.url.includes('unpkg.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
