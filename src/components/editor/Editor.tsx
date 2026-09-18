"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, leerAutor, guardarAutor } from "@/lib/supabase/client";
import { Escenario, Unidad, UNIDADES } from "@/lib/model/types";
import { calcular, kpis } from "@/lib/model/engine";
import { diffEscenarios } from "@/lib/escenarios";
import { exportarExcel } from "@/lib/excel";
import PanelResumen from "./PanelResumen";
import PanelBase from "./PanelBase";
import PanelComunes from "./PanelComunes";
import PanelUnidad from "./PanelUnidad";
import PanelFlujo from "./PanelFlujo";
import PanelInversores from "./PanelInversores";
import PanelValidacion from "./PanelValidacion";

type Tab = "resumen" | "base" | "comunes" | Unidad | "flujo" | "inversores" | "validacion";

/**
 * Las solapas agrupadas por para qué sirven:
 *   Resumen  — la foto del proyecto en una pantalla.
 *   Cargar   — todo lo que escribe el usuario. Nada de acá se calcula solo.
 *   Resultar — lo que sale del cálculo. Acá no se toca nada.
 */
const GRUPOS: { titulo: string; nota: string; tabs: { id: Tab; texto: string }[] }[] = [
  {
    titulo: "Resumen",
    nota: "La foto del proyecto",
    tabs: [{ id: "resumen", texto: "Resumen" }],
  },
  {
    titulo: "Datos a cargar",
    nota: "Lo que completa el usuario",
    tabs: [
      { id: "base", texto: "Parámetros generales" },
      { id: "comunes", texto: "Costos compartidos" },
      { id: "AGRO", texto: "Agrograneles" },
      { id: "FERT", texto: "Fertilizantes" },
      { id: "CARGAS", texto: "Cargas generales" },
      { id: "inversores", texto: "Socios" },
    ],
  },
  {
    titulo: "Resultados",
    nota: "Lo que calcula el modelo",
    tabs: [
      { id: "flujo", texto: "Flujo de fondos" },
      { id: "validacion", texto: "Validación" },
    ],
  },
];

export default function Editor({
  id, nombre, version, datosIniciales, soloLectura = false,
}: {
  id: string; nombre: string; version: number;
  datosIniciales: Escenario; soloLectura?: boolean;
}) {
  const [esc, setEsc] = useState<Escenario>(datosIniciales);
  const [guardado, setGuardado] = useState<Escenario>(datosIniciales);
  const [ver, setVer] = useState(version);
  const [tab, setTab] = useState<Tab>("resumen");
  const [estado, setEstado] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [comentario, setComentario] = useState("");
  const [autor, setAutor] = useState("");
  const [exportando, setExportando] = useState(false);

  useEffect(() => { setAutor(leerAutor()); }, []);

  const calculo = useMemo(() => calcular(esc), [esc]);
  const k = useMemo(() => kpis(esc, calculo), [esc, calculo]);
  const cambios = useMemo(() => diffEscenarios(guardado, esc), [guardado, esc]);
  const haycambios = cambios.length > 0;

  function actualizar(fn: (borrador: Escenario) => void) {
    setEsc((prev) => {
      const copia: Escenario = JSON.parse(JSON.stringify(prev));
      fn(copia);
      return copia;
    });
  }

  async function guardar() {
    if (!haycambios) return;
    setGuardando(true);
    setEstado(null);
    try {
      guardarAutor(autor);
      const { data, error } = await supabase.rpc("guardar_escenario", {
        p_escenario_id: id,
        p_datos: esc,
        p_cambios: cambios.slice(0, 500),
        p_comentario: comentario || null,
        p_kpis: k,
        p_autor: autor || null,
      });
      if (error) throw error;
      setVer(Number(data));
      setGuardado(esc);
      setComentario("");
      setEstado(`Guardado como versión ${data}. ${cambios.length} campo${cambios.length === 1 ? "" : "s"} modificado${cambios.length === 1 ? "" : "s"}.`);
    } catch (e) {
      setEstado(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  async function descargarExcel() {
    setExportando(true);
    setEstado(null);
    try {
      await exportarExcel(esc, calculo, k, nombre);
    } catch (e) {
      setEstado(e instanceof Error ? e.message : "No se pudo generar el Excel");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-slate-500 hover:text-puerto-700">← Escenarios</Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900">{nombre}</h1>
            <span className="chip bg-slate-100 text-slate-600">v{ver}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Los valores cargados son preliminares hasta que los validen Comercial, Operaciones,
            Ingeniería e Impuestos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={descargarExcel} disabled={exportando} className="btn-secundario">
            {exportando ? "Generando…" : "Descargar Excel"}
          </button>
          {!soloLectura && (
            <>
            <Link href={`/escenarios/${id}/historial`} className="btn-secundario">Historial</Link>
            <input value={autor} onChange={(e) => setAutor(e.target.value)}
              placeholder="Tu nombre"
              title="Queda registrado en el historial. Se guarda en este navegador, no hace falta cuenta."
              className="w-32 rounded border border-slate-300 px-2 py-2 text-sm" />
            <input value={comentario} onChange={(e) => setComentario(e.target.value)}
              placeholder="Qué cambiaste (opcional)"
              className="w-52 rounded border border-slate-300 px-2 py-2 text-sm" />
            <button onClick={guardar} disabled={!haycambios || guardando} className="btn-primario">
              {guardando ? "Guardando..." : haycambios ? `Guardar (${cambios.length})` : "Sin cambios"}
            </button>
            </>
          )}
        </div>
      </div>

      {estado && (
        <p className="mt-3 rounded border border-puerto-200 bg-puerto-50 px-3 py-2 text-sm text-puerto-900">
          {estado}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-3 border-b border-slate-200 pb-3">
        {GRUPOS.map((g) => (
          <div key={g.titulo}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {g.titulo}
              <span className="ml-1.5 font-normal normal-case tracking-normal text-slate-400">
                · {g.nota}
              </span>
            </p>
            <div className="flex flex-wrap gap-1">
              {g.tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`rounded px-2.5 py-1.5 text-sm font-medium transition ${
                    tab === t.id ? "bg-puerto-700 text-white"
                                 : "text-slate-600 hover:bg-slate-100"}`}>
                  {t.texto}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {tab === "resumen" && <PanelResumen esc={esc} c={calculo} k={k} />}
        {tab === "base" && <PanelBase esc={esc} actualizar={actualizar} soloLectura={soloLectura} />}
        {tab === "comunes" && <PanelComunes esc={esc} actualizar={actualizar} soloLectura={soloLectura} />}
        {UNIDADES.includes(tab as Unidad) && (
          <PanelUnidad un={tab as Unidad} esc={esc} c={calculo}
                       actualizar={actualizar} soloLectura={soloLectura} />
        )}
        {tab === "flujo" && <PanelFlujo esc={esc} c={calculo} />}
        {tab === "inversores" && (
          <PanelInversores esc={esc} c={calculo} actualizar={actualizar} soloLectura={soloLectura} />
        )}
        {tab === "validacion" && <PanelValidacion esc={esc} c={calculo} k={k} />}
      </div>

      {haycambios && !soloLectura && (
        <div className="mt-8 tarjeta overflow-hidden">
          <h3 className="seccion">Cambios sin guardar ({cambios.length})</h3>
          <div className="max-h-60 overflow-auto p-3">
            <table className="w-full text-sm">
              <tbody>
                {cambios.slice(0, 60).map((cb, i) => (
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
            {cambios.length > 60 && (
              <p className="pt-2 text-xs text-slate-500">y {cambios.length - 60} más…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
