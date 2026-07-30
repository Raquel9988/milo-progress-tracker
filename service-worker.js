const CACHE_NAME = "settlepath-v31";
const APP_SHELL = [
    "./",
    "./index.html?v=31",
    "./styles.css?v=31",
    "./plans.js?v=31",
    "./script.js?v=31",
    "./supabase-config.js?v=31",
    "./manifest.webmanifest?v=31",
    "./icon-192.png",
    "./icon-512.png",
    "./SettlePath_Complete_Minute_by_Minute_Guide.pdf"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        return caches.match(request) || caches.match("./");
    }
}

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET") return;

    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (
        event.request.mode === "navigate" ||
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".css") ||
        url.pathname.endsWith(".html") ||
        url.pathname.endsWith("supabase-config.js")
    ) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
