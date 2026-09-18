import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { EscenarioFila } from "@/lib/escenarios";
import { fecha } from "@/lib/formato";
import Encabezado from "@/components/Encabezado";
import NuevoEscenario from "@/components/NuevoEscenario";

export const dynamic = "force-dynamic";

export default async function Inicio() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await sb
    .from("escenarios")
    .select("id,nombre,descripcion,version,es_base,publico,token_publico,actualizado_en,actualizado_por")
    .order("actualizado_en", { ascending: false });

  const escenarios = (data ?? []) as EscenarioFila[];

  return (
    <>
      <Encabezado email={user.email ?? ""} />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Escenarios</h1>
            <p className="mt-1 text-sm text-slate-600">
              Cada escenario es una variante del modelo. Todo lo que se edita queda guardado
              con su versión, quién lo cambió y cuándo.
            </p>
          </div>
          <NuevoEscenario />
        </div>

        {error && (
          <p className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            No se pudo leer la base: {error.message}. Revisá que el esquema SQL esté aplicado
            y las variables de entorno cargadas en Vercel.
          </p>
        )}

        {!error && escenarios.length === 0 && (
          <div className="tarjeta mt-6 p-8 text-center">
            <p className="text-slate-600">
              Todavía no hay escenarios. Creá el primero con el escenario base cargado.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {escenarios.map((e) => (
            <Link key={e.id} href={`/escenarios/${e.id}`}
              className="tarjeta block p-4 transition hover:border-puerto-500 hover:shadow">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-slate-900">{e.nombre}</h2>
                {e.es_base && <span className="chip bg-puerto-100 text-puerto-700">base</span>}
              </div>
              {e.descripcion && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.descripcion}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>v{e.version}</span>
                <span>{fecha(e.actualizado_en)}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
