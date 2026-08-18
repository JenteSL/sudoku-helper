const CACHE = "sudoku-helper-v1";
// __PRECACHE__

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(
        PRECACHE.map(
          (url) => new Request(new URL(url, self.registration.scope), { cache: "reload" }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const keep = new Set([
        CACHE,
        ...keys
          .filter((name) => name !== CACHE && name.startsWith("sudoku-helper-"))
          .sort()
          .slice(-1),
      ]);
      await Promise.all(
        keys.filter((name) => !keep.has(name)).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
    cache.put(new URL("index.html", self.registration.scope), response.clone());
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match(new URL("index.html", self.registration.scope))) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
  }
  return response;
}
