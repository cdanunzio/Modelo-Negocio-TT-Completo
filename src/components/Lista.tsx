"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hayBaseDeDatos, leerAutor, esAdministrador } from "@/lib/supabase/client";
import { fecha } from "@/lib/formato";
import Confirmar from "./Confirmar";

interface Fila {
  id: string; nombre: string; descripcion: string | null;
  version: number; autor: string | null; actualizado_en: string;
  archivado_en?: string | null; archivado_por?: string | null;
}

type Vista = "activos" | "archivados";

export default function Lista() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [vista, setVista] = useState<Vista>("activos");
  const [aArchivar, setAArchivar] = useState<Fila | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!hayBaseDeDatos) { setCargando(false); return; }
    setCargando(true);
    const columnas = "id,nombre,descripcion,version,autor,actualizado_en";
    // Las columnas de archivado las agrega un SQL aparte. Si todavía no se
    // corrió, la consulta completa falla: en ese caso se pide lo básico y la
    // aplicación sigue andando, solo sin la parte de archivar.
    const completa = await supabase
      .from("escenarios")
      .select(`${columnas},archivado_en,archivado_por`)
      .order("actualizado_en", { ascending: false });
    const resultado = completa.error
      ? await supabase
          .from("escenarios")
          .select(columnas)
          .order("actualizado_en", { ascending: false })
      : completa;
    if (resultado.error) setError(resultado.error.message);
    else { setFilas((resultado.data ?? []) as unknown as Fila[]); setError(null); }
    setCargando(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { esAdministrador().then(setAdmin); }, []);

  const activos = filas.filter((f) => !f.archivado_en);
  const archivados = filas.filter((f) => f.archivado_en);
  const mostradas = vista === "activos" ? activos : archivados;

  async function cambiarArchivado(f: Fila, archivar: boolean) {
    setAArchivar(null);
    const { error } = await supabase.rpc("archivar_escenario", {
      p_escenario_id: f.id,
      p_archivar: archivar,
      p_autor: leerAutor() || null,
    });
    if (error) setAviso(error.message);
    else {
      setAviso(archivar
        ? `"${f.nombre}" quedó archivado. No se borró: está en la pestaña Archivados y se puede restaurar.`
        : `"${f.nombre}" volvió a la lista.`);
      cargar();
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escenarios</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Cada escenario es una variante del modelo. Todo queda registrado con su versión, qué
            cambió y cuándo.
          </p>
        </div>
        {hayBaseDeDatos && (
          <Link href="/escenarios/nuevo" className="btn-primario">Nuevo escenario</Link>
        )}
      </div>

      {admin && archivados.length > 0 && (
        <div className="mt-5 flex gap-1">
          {([["activos", `Activos (${activos.length})`],
             ["archivados", `Archivados (${archivados.length})`]] as [Vista, string][]).map(
            ([v, texto]) => (
              <button key={v} onClick={() => setVista(v)}
                className={`rounded px-3 py-1.5 text-sm font-medium ${
                  vista === v ? "bg-puerto-700 text-white"
                              : "border border-slate-300 bg-white text-slate-600"}`}>
                {texto}
              </button>
            )
          )}
        </div>
      )}

      {aviso && (
        <p className="mt-5 rounded border border-puerto-200 bg-puerto-50 px-3 py-2 text-sm text-puerto-900">
          {aviso}
        </p>
      )}

      {!hayBaseDeDatos && (
        <div className="tarjeta mt-6 border-amber-300 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Falta conectar la base de datos</h2>
          <p className="mt-1 text-sm text-amber-900">
            La aplicación está publicada pero aún no puede registrar escenarios. Corresponde cargar las variables{" "}
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

      {hayBaseDeDatos && !cargando && mostradas.length === 0 && !error && (
        <div className="tarjeta mt-6 p-8 text-center">
          <p className="text-slate-600">
            {vista === "activos"
              ? "Todavía no hay escenarios. El primero se crea con el escenario base ya cargado."
              : "No hay escenarios archivados."}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mostradas.map((e) => (
          <div key={e.id} className="tarjeta flex flex-col p-4 transition hover:border-puerto-500">
            <Link href={`/escenarios/${e.id}`} className="block flex-1">
              <h2 className="font-semibold text-slate-900">{e.nombre}</h2>
              {e.descripcion && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.descripcion}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>v{e.version}{e.autor ? ` · ${e.autor}` : ""}</span>
                <span>{fecha(e.actualizado_en)}</span>
              </div>
            </Link>
            {admin && (
              <div className="mt-3 border-t border-slate-100 pt-2 text-right">
                {e.archivado_en ? (
                  <button onClick={() => cambiarArchivado(e, false)}
                    className="text-xs text-puerto-700 hover:underline">
                    Restaurar
                  </button>
                ) : (
                  <button onClick={() => setAArchivar(e)}
                    className="text-xs text-slate-400 hover:text-red-700">
                    Archivar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Confirmar
        abierto={aArchivar !== null}
        titulo={`Archivar "${aArchivar?.nombre ?? ""}"`}
        mensaje={
          <>
            Deja de figurar en la lista para todo el equipo. <strong>No se elimina</strong>: el
            escenario y sus {aArchivar?.version ?? 0} versiones quedan registrados y pueden
            restaurarse en cualquier momento desde la pestaña Archivados.
          </>
        }
        textoConfirmar="Archivar"
        peligro
        onConfirmar={() => aArchivar && cambiarArchivado(aArchivar, true)}
        onCancelar={() => setAArchivar(null)}
      />
    </main>
  );
}
