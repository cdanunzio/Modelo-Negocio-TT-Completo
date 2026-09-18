"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hayBaseDeDatos } from "@/lib/supabase/client";
import { Escenario } from "@/lib/model/types";
import { migrarEscenario } from "@/lib/model/migracion";
import Editor from "./editor/Editor";

interface Datos { id: string; nombre: string; version: number; datos: Escenario }

export default function CargarEscenario({ id }: { id: string }) {
  const [fila, setFila] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hayBaseDeDatos) { setError("La base de datos no está conectada."); return; }
    supabase
      .from("escenarios")
      .select("id,nombre,version,datos")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setFila(data as Datos);
      });
  }, [id]);

  if (error)
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          No se pudo abrir el escenario: {error}
        </p>
        <Link href="/" className="btn-secundario mt-4">Volver</Link>
      </main>
    );

  if (!fila) return <p className="p-6 text-slate-500">Cargando escenario…</p>;

  return <Editor id={fila.id} nombre={fila.nombre} version={fila.version} datosIniciales={migrarEscenario(fila.datos)} />;
}
