import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Escenario } from "@/lib/model/types";
import Editor from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default async function Compartido({ params }: { params: { token: string } }) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await sb.rpc("escenario_publico", { p_token: params.token });
  const fila = Array.isArray(data) ? data[0] : null;
  if (error || !fila) notFound();

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <p className="font-semibold text-puerto-700">Terminal Portuaria Timbúes</p>
          <p className="text-xs text-slate-500">Vista de solo lectura · no se puede editar ni guardar</p>
        </div>
      </header>
      <Editor id={fila.id} nombre={fila.nombre} version={fila.version}
              datosIniciales={fila.datos as Escenario} soloLectura />
    </>
  );
}
