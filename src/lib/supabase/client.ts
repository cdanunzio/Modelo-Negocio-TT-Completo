import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase. La aplicación no tiene login: cualquiera con el link
 * puede leer y guardar. Lo que impide destrozar los datos son las políticas
 * de la base — no hay borrado, y el historial es inmutable.
 */
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_BASE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Si todavía no se cargaron las variables de entorno, el cliente se arma con
 * valores de relleno: nunca se usa (todo consumo pasa antes por `hayBaseDeDatos`)
 * y así la aplicación compila y abre igual, mostrando el cartel que explica qué falta.
 */
export const supabase = createClient(
  URL_BASE || "https://sin-configurar.supabase.co",
  CLAVE_BASE || "sin-configurar",
  { auth: { persistSession: false } }
);

export const hayBaseDeDatos = Boolean(URL_BASE && CLAVE_BASE);

/** Nombre de quien edita. Se guarda en el navegador, sin cuenta ni contraseña. */
const CLAVE_AUTOR = "puerto-tt.autor";

export function leerAutor(): string {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(CLAVE_AUTOR) ?? ""; } catch { return ""; }
}

export function guardarAutor(nombre: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CLAVE_AUTOR, nombre); } catch { /* modo privado */ }
}
