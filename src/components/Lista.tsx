"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hayBaseDeDatos, leerAutor } from "@/lib/supabase/client";
import { escenarioBase } from "@/lib/model/defaults";
import { calcular, kpis } from "@/lib/model/engine";
import { fecha, pct } from "@/lib/formato";

interface Fila {
  id: string; nombre: string; descripcion: string | null;
  version: number; autor: string | null; actualizado_en: string;
}

export default function Lista() {
  const router = useRouter();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    if (!hayBaseDeDatos) { setCargando(false); return; }
    const { data, error } = await supabase
      .from("escenarios")
      .select("id,nombre,descripcion,version,autor,actualizado_en")
      .order("actualizado_en", { ascending: false });
    if (error) setError(error.message);
    else setFilas((data ?? []) as Fila[]);
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function crear() {
    setCreando(true);
    setError(null);
    try {
      const datos = escenarioBase();
      const k = kpis(datos, calcular(datos));
      const autor = leerAutor() || null;
      const { data, error } = await supabase
        .from("escenarios")
        .insert({
          nombre: "Escenario " + new Date().toLocaleDateString("es-AR"),
          descripcion: "Creado a partir del escenario base. Valores preliminares: validar antes de presentar.",
          datos, autor,
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase.from("escenario_versiones").insert({
        escenario_id: data.id, version: 1, datos,
        comentario: "Creación del escenario", kpis: k, autor,
      });
      router.push(`/escenarios/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el escenario");
      setCreando(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escenarios</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Cada escenario es una variante del modelo. Cualquiera con el link puede editarlo y
            guardarlo: todo queda registrado con su versión, qué cambió y cuándo.
          </p>
        </div>
        {hayBaseDeDatos && (
          <button onClick={crear} disabled={creando} className="btn-primario">
            {creando ? "Creando…" : "Nuevo escenario"}
          </button>
        )}
      </div>

      {!hayBaseDeDatos && (
        <div className="tarjeta mt-6 border-amber-300 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Falta conectar la base de datos</h2>
          <p className="mt-1 text-sm text-amber-900">
            La aplicación está publicada pero todavía no puede guardar. Cargá las variables{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en Vercel
            y volvé a publicar. Está explicado en el README.
          </p>
          <Link href="/demo" className="btn-primario mt-4">Ver la demo mientras tanto</Link>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          No se pudo leer la base: {error}. Revisá que el esquema SQL esté aplicado.
        </p>
      )}

      {hayBaseDeDatos && cargando && <p className="mt-6 text-slate-500">Cargando…</p>}

      {hayBaseDeDatos && !cargando && filas.length === 0 && !error && (
        <div className="tarjeta mt-6 p-8 text-center">
          <p className="text-slate-600">
            Todavía no hay escenarios. Creá el primero: arranca con el escenario base cargado.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filas.map((e) => (
          <Link key={e.id} href={`/escenarios/${e.id}`}
            className="tarjeta block p-4 transition hover:border-puerto-500 hover:shadow">
            <h2 className="font-semibold text-slate-900">{e.nombre}</h2>
            {e.descripcion && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.descripcion}</p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>v{e.version}{e.autor ? ` · ${e.autor}` : ""}</span>
              <span>{fecha(e.actualizado_en)}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
