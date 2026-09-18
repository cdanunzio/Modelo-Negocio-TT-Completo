/** @type {import('next').NextConfig} */

/*
 * La integración oficial de Supabase con Vercel carga las variables como
 * SUPABASE_URL y SUPABASE_ANON_KEY (sin el prefijo NEXT_PUBLIC_), y el navegador
 * solo puede leer las que llevan ese prefijo. Acá se hace el puente: si alguien
 * cargó las NEXT_PUBLIC_ a mano se usan esas; si no, se toman las de la
 * integración. Next las incrusta en el bundle durante el build.
 *
 * Solo se expone la clave anon, que es pública por diseño. La service_role
 * nunca se usa en este proyecto.
 */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  },
};

export default nextConfig;
