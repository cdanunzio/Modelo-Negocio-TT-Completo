"use client";
import { useState } from "react";
import { Escenario, ResultadoConsolidado, Unidad, UNIDADES, NOMBRE_UNIDAD } from "@/lib/model/types";
import { usd, pct, num } from "@/lib/formato";
import { Fila, filasConsolidado, filasUnidad } from "@/lib/filas";

type Vista = "consolidado" | Unidad;

const fmt = (v: number | null, f: Fila["formato"]) =>
  v === null ? "" : f === "pct" ? pct(v) : f === "num" ? num(v) : usd(v);

function Tabla({ anios, filas }: { anios: number[]; filas: Fila[] }) {
  return (
    <div className="tarjeta overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="th sticky left-0 z-20 min-w-[19rem] bg-puerto-100">Concepto</th>
              {anios.map((a) => (
                <th key={a} className="th min-w-[6.5rem] text-right">{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i} className={`border-t border-slate-100 ${f.clave ? "bg-puerto-50" : ""}`}>
                <td className={`td sticky left-0 z-10 max-w-[19rem] truncate ${
                  f.clave ? "bg-puerto-50 font-semibold" : f.memo ? "bg-white italic text-slate-500" : "bg-white"}`}
                  title={f.ayuda}>
                  {f.etiqueta}
                </td>
                {f.valores.map((v, j) => (
                  <td key={j} className={`td text-right ${
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
    </div>
  );
}

export default function PanelFlujo({ esc, c }: { esc: Escenario; c: ResultadoConsolidado }) {
  const [vista, setVista] = useState<Vista>("consolidado");

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
      <p className="text-xs text-slate-500">
        Pasá el mouse sobre el nombre de un concepto para ver qué hace esa fila.
      </p>
      <Tabla anios={c.anios}
        filas={vista === "consolidado" ? filasConsolidado(c) : filasUnidad(c, vista as Unidad)} />
    </div>
  );
}
