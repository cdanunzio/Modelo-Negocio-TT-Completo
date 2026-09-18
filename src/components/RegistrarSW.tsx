"use client";
import { useEffect } from "react";

/**
 * Registra el service worker, que es lo que permite instalar la aplicación en
 * el celular. Si el navegador no lo soporta o falla, no pasa nada: la
 * aplicación funciona igual, solo no se puede instalar.
 */
export default function RegistrarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;
    const alta = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") alta();
    else window.addEventListener("load", alta, { once: true });
  }, []);
  return null;
}
