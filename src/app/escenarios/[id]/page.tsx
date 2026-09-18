import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Escenario } from "@/lib/model/types";
import Encabezado from "@/components/Encabezado";
import Editor from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default async function PaginaEscenario({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await sb
    .from("escenarios")
    .select("id,nombre,descripcion,version,datos")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  return (
    <>
      <Encabezado email={user.email ?? ""} />
      <Editor id={data.id} nombre={data.nombre} version={data.version}
              datosIniciales={data.datos as Escenario} />
    </>
  );
}
