// Service Worker — Portfolio Laura Campschreur
// Serveert ontsleutelde bestanden vanuit de Cache API

const CACHE_NAME = 'portfolio-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Laat login-pagina, meta-bestand en chunks door naar het netwerk
    if (url.pathname.endsWith('/index.html') && !url.pathname.includes('/app/')) return;
    if (url.pathname.endsWith('.enc.json')) return;
    if (url.pathname.match(/\.enc\.\d+$/)) return;
    if (url.pathname.endsWith('/sw.js')) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            // Als het een /app/ pad is dat niet in cache zit → terug naar login
            if (url.pathname.includes('/app/')) {
                const scope = self.registration.scope;
                return new Response('', {
                    status: 302,
                    headers: { 'Location': scope }
                });
            }

            // Alle andere requests normaal doorlaten
            return fetch(event.request);
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            event.source.postMessage({ type: 'CACHE_CLEARED' });
        });
    }
});
