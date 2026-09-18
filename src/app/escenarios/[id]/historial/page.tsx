import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { fecha, pct, mm } from "@/lib/formato";
import { Cambio } from "@/lib/escenarios";
import Encabezado from "@/components/Encabezado";

export const dynamic = "force-dynamic";

interface Version {
  id: number; version: number; comentario: string | null;
  cambios: Cambio[] | null; kpis: { tirProyecto?: number | null; capexTotal?: number } | null;
  creado_en: string;
}

export default async function Historial({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: esc } = await sb.from("escenarios").select("nombre").eq("id", params.id).single();
  if (!esc) notFound();

  const { data } = await sb
    .from("escenario_versiones")
    .select("id,version,comentario,cambios,kpis,creado_en")
    .eq("escenario_id", params.id)
    .order("version", { ascending: false });

  const versiones = (data ?? []) as Version[];

  return (
    <>
      <Encabezado email={user.email ?? ""} />
      <main className="mx-auto max-w-5xl p-6">
        <Link href={`/escenarios/${params.id}`} className="text-sm text-slate-500 hover:text-puerto-700">
          ← Volver al escenario
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Historial · {esc.nombre}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cada guardado queda registrado con los campos que cambiaron y los indicadores de esa
          versión. No se pisa ni se borra nada.
        </p>

        <div className="mt-6 space-y-3">
          {versiones.map((v) => (
            <article key={v.id} className="tarjeta p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">
                  Versión {v.version}
                  {v.comentario && <span className="ml-2 font-normal text-slate-600">— {v.comentario}</span>}
                </h2>
                <span className="text-xs text-slate-500">{fecha(v.creado_en)}</span>
              </div>

              {v.kpis && (
                <p className="mt-1 text-sm text-slate-600">
                  TIR {pct(v.kpis.tirProyecto ?? null, 2)} · CAPEX {mm(v.kpis.capexTotal ?? 0)}
                </p>
              )}

              {v.cambios && v.cambios.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-puerto-700">
                    {v.cambios.length} campo{v.cambios.length === 1 ? "" : "s"} modificado
                    {v.cambios.length === 1 ? "" : "s"}
                  </summary>
                  <table className="mt-2 w-full text-sm">
                    <tbody>
                      {v.cambios.slice(0, 80).map((cb, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-1 pr-3 text-slate-700">{cb.etiqueta}</td>
                          <td className="py-1 pr-3 text-right tabular-nums text-slate-400 line-through">
                            {String(cb.antes)}
                          </td>
                          <td className="py-1 text-right tabular-nums font-medium text-puerto-700">
                            {String(cb.despues)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}
            </article>
          ))}
          {versiones.length === 0 && (
            <p className="text-slate-500">Todavía no hay versiones guardadas.</p>
          )}
        </div>
      </main>
    </>
  );
}
