"use client";
import { useState } from "react";
import { Escenario, ResultadoConsolidado, Unidad, UNIDADES, NOMBRE_UNIDAD } from "@/lib/model/types";
import { tir } from "@/lib/model/engine";
import { usd, pct, num } from "@/lib/formato";
import { Fila, filasConsolidado, filasUnidad, OpcionesFilas } from "@/lib/filas";

type Vista = "consolidado" | Unidad;

const fmt = (v: number | null, f: Fila["formato"]) =>
  v === null ? "" : f === "pct" ? pct(v) : f === "num" ? num(v) : usd(v);

function Tabla({ anios, filas }: { anios: number[]; filas: Fila[] }) {
  // En el celular no hay mouse: el concepto se toca y se abre la explicación.
  const [abierta, setAbierta] = useState<Fila | null>(null);

  return (
    <div className="tarjeta overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="th sticky left-0 z-20 min-w-[13rem] bg-puerto-100 sm:min-w-[19rem]">
                Concepto
              </th>
              {anios.map((a) => (
                <th key={a} className="th min-w-[7.5rem] text-right sm:min-w-[6.5rem]">{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} className={`border-t border-slate-100 ${f.clave ? "bg-puerto-50" : ""}`}>
                <td className={`td sticky left-0 z-10 min-w-[13rem] max-w-[13rem] cursor-pointer whitespace-normal break-words leading-snug sm:max-w-[19rem] ${
                  f.clave ? "bg-puerto-50 font-semibold" : f.memo ? "bg-white italic text-slate-500" : "bg-white"}`}
                  title={f.ayuda}
                  onClick={() => setAbierta(f)}>
                  {f.etiqueta}
                </td>
                {f.valores.map((v, j) => (
                  <td key={j} className={`td whitespace-nowrap text-right tabular-nums ${
                    f.clave ? "font-semibold" : f.memo ? "italic text-slate-400" : "text-slate-600"} ${
                    typeof v === "number" && v < 0 ? "text-red-700" : ""}`}>
                    {fmt(v as number | null, f.formato)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {abierta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
             onClick={() => setAbierta(null)}>
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3">
              <h4 className="text-base font-semibold text-slate-900">{abierta.etiqueta}</h4>
              <button type="button" onClick={() => setAbierta(null)}
                className="text-xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Cerrar">×</button>
            </div>
            <p className="px-5 py-4 text-sm leading-relaxed text-slate-700">{abierta.ayuda}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanelFlujo({ esc, c }: { esc: Escenario; c: ResultadoConsolidado }) {
  const [vista, setVista] = useState<Vista>("consolidado");

  const opciones: OpcionesFilas = {
    tasaImpuesto: esc.base.rigiActivo ? esc.base.rigiTasaImpuesto : esc.base.tasaImpuestoGeneral,
    tasasEnFCFF: esc.base.tasasEnFCFF,
  };

  const esConsolidado = vista === "consolidado";
  const filas = esConsolidado
    ? filasConsolidado(c, opciones)
    : filasUnidad(c, vista as Unidad, opciones);

  // La TIR del flujo que se está mirando: el consolidado usa el flujo libre
  // del proyecto; cada negocio, su flujo evaluado por separado.
  const flujo = esConsolidado ? c.fcff : c.porUnidad[vista as Unidad].fcffStandalone;
  const rendimiento = tir(flujo);
  const rendimientoSocios = esc.base.montoDeudaMM > 0 ? tir(c.fcfe) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {(["consolidado", ...UNIDADES] as Vista[]).map((v) => (
          <button key={v} onClick={() => setVista(v)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              vista === v ? "bg-puerto-700 text-white" : "border border-slate-300 bg-white text-slate-600"}`}>
            {v === "consolidado" ? "Consolidado" : NOMBRE_UNIDAD[v as Unidad]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Tocá o hacé clic en el nombre de un concepto para ver qué hace esa fila.
        </p>
        <div className="flex flex-wrap gap-2">
          <Indicador
            rotulo={esConsolidado ? "Rendimiento del proyecto (TIR)" : "Rendimiento por separado (TIR)"}
            valor={pct(rendimiento, 2)}
            detalle={esConsolidado
              ? "Sobre el flujo de caja libre del proyecto."
              : `Sobre el flujo de ${NOMBRE_UNIDAD[vista as Unidad]} evaluado solo.`} />
          {esConsolidado && rendimientoSocios !== null && (
            <Indicador rotulo="Rendimiento de los socios (TIR del accionista)"
              valor={pct(rendimientoSocios, 2)}
              detalle="Sobre el flujo que queda después de pagarle al banco." />
          )}
        </div>
      </div>

      <Tabla anios={c.anios} filas={filas} />
    </div>
  );
}

function Indicador({ rotulo, valor, detalle }: { rotulo: string; valor: string; detalle: string }) {
  return (
    <div className="rounded-lg border border-puerto-200 bg-puerto-50 px-3 py-1.5" title={detalle}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-puerto-700">{rotulo}</p>
      <p className="text-lg font-bold tabular-nums leading-tight text-slate-900">{valor}</p>
    </div>
  );
}
