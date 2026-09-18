/*
 * Service worker mínimo.
 *
 * Existe por dos razones: que Android ofrezca instalar la aplicación, y que si
 * alguien la abre sin señal vea una pantalla propia en vez del error del
 * navegador.
 *
 * Estrategia: SIEMPRE se pide primero a la red. La caché es solo la red de
 * seguridad. Es deliberado: un modelo financiero compartido no puede mostrar
 * números viejos porque el navegador guardó una copia.
 */
const CACHE = "puerto-tt-v1";

self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/", "/manifest.webmanifest"]).catch(() => {}))
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;   // Supabase y demás: sin tocar

  evento.respondWith(
    fetch(pedido)
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(CACHE).then((c) => c.put(pedido, copia)).catch(() => {});
        }
        return respuesta;
      })
      .catch(() => caches.match(pedido).then((guardada) => guardada || caches.match("/")))
  );
});
