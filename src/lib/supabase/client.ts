import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase. El acceso está cerrado con usuario y contraseña: la
 * sesión viaja en cada consulta y las políticas de la base rechazan cualquier
 * pedido sin sesión. La contraseña nunca está en el código de la página.
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
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

export const hayBaseDeDatos = Boolean(URL_BASE && CLAVE_BASE);

/**
 * Supabase identifica a las cuentas por correo. Acá se entra escribiendo
 * simplemente "TT", y este dominio interno completa el resto. No es una
 * casilla real ni se le manda nada.
 */
const DOMINIO_INTERNO = "@timbues.local";

export function correoDeUsuario(usuario: string): string {
  const u = usuario.trim().toLowerCase();
  return u.includes("@") ? u : u + DOMINIO_INTERNO;
}

/** Nombre de quien edita, para firmar cada versión. Se guarda en el navegador. */
const CLAVE_AUTOR = "puerto-tt.autor";

export function leerAutor(): string {
  if (typeof window === "undefined") return "";
  try { return window.localStorage.getItem(CLAVE_AUTOR) ?? ""; } catch { return ""; }
}

export function guardarAutor(nombre: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CLAVE_AUTOR, nombre); } catch { /* modo privado */ }
}

/**
 * Si quien está usando la aplicación figura en la lista de administradores.
 * La respuesta la da la base, no el navegador: el botón de archivar se muestra
 * en función de esto, pero quien realmente decide es la base.
 */
export async function esAdministrador(): Promise<boolean> {
  if (!hayBaseDeDatos) return false;
  const { data, error } = await supabase.rpc("es_administrador");
  if (error) return false;
  return data === true;
}
