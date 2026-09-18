"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { escenarioBase } from "@/lib/model/defaults";
import { calcular, kpis } from "@/lib/model/engine";

export default function NuevoEscenario() {
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function crear() {
    setCreando(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const { data: { user } } = await sb.auth.getUser();
      const datos = escenarioBase();
      const k = kpis(datos, calcular(datos));
      const { data, error } = await sb
        .from("escenarios")
        .insert({
          nombre: "Escenario " + new Date().toLocaleDateString("es-AR"),
          descripcion: "Creado a partir del escenario base. Valores preliminares: validar antes de presentar.",
          datos, creado_por: user?.id, actualizado_por: user?.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      await sb.from("escenario_versiones").insert({
        escenario_id: data.id, version: 1, datos,
        comentario: "Creación del escenario", kpis: k, creado_por: user?.id,
      });
      router.push(`/escenarios/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear");
      setCreando(false);
    }
  }

  return (
    <div>
      <button onClick={crear} disabled={creando} className="btn-primario">
        {creando ? "Creando..." : "Nuevo escenario"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
