"use client";
import { Escenario, UNIDADES } from "@/lib/model/types";
import { usd, pct, mm } from "@/lib/formato";
import { Bloque, FichaCampo } from "./campos";
import { FICHAS } from "@/lib/fichas";
import { NOMBRE_UNIDAD } from "@/lib/model/types";

interface Props {
  esc: Escenario;
  actualizar: (fn: (b: Escenario) => void) => void;
  soloLectura?: boolean;
}

export default function PanelComunes({ esc, actualizar, soloLectura }: Props) {
  const total = esc.comunes.reduce((a, c) => a + c.montoAnual, 0);
  const porUnidad = {
    AGRO: esc.comunes.reduce((a, c) => a + c.montoAnual * c.pctAGRO, 0),
    FERT: esc.comunes.reduce((a, c) => a + c.montoAnual * c.pctFERT, 0),
    CARGAS: esc.comunes.reduce((a, c) => a + c.montoAnual * c.pctCARGAS, 0),
  };
  const sumaAsig = UNIDADES.reduce((a, u) => a + (esc.asignacionCapexComun[u] ?? 0), 0);

  return (
    <div className="space-y-4">
      <Bloque titulo="Costos compartidos entre los tres negocios">
        <p className="mb-3 text-xs leading-relaxed text-slate-600">
          Gastos que sirven a los tres negocios a la vez. Hay que repartirlos con algún criterio,
          porque si no ninguno se hace cargo. <strong>Regla:</strong> todo lo que depende del muelle
          se reparte por ocupación, nunca por toneladas. Una tonelada de acero ocupa mucho más
          muelle que una de granos, y repartir por tonelada haría que los granos terminen
          subsidiando al resto.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">
                  Línea de costo
                  <FichaCampo titulo="Línea de costo" ficha={FICHAS.costoComunLinea} />
                </th>
                <th className="th">
                  Criterio de reparto
                  <FichaCampo titulo="Criterio de reparto" ficha={FICHAS.costoComunDriver} />
                </th>
                <th className="th text-right">
                  Costo por año (USD)
                  <FichaCampo titulo="Costo por año" ficha={FICHAS.costoComunMonto} />
                </th>
                <th className="th text-right">% Agrograneles</th>
                <th className="th text-right">% Fertilizantes</th>
                <th className="th text-right">% Cargas grales.</th>
                <th className="th text-right">Suma</th>
              </tr>
            </thead>
            <tbody>
              {esc.comunes.map((c, i) => {
                const suma = c.pctAGRO + c.pctFERT + c.pctCARGAS;
                const ok = Math.abs(suma - 1) < 0.0001;
                return (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="td">
                      <input value={c.linea} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => { d.comunes[i].linea = e.target.value; })}
                        className="campo campo-texto w-56" />
                    </td>
                    <td className="td">
                      <input value={c.driver} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => { d.comunes[i].driver = e.target.value; })}
                        className="campo campo-texto w-44" />
                    </td>
                    <td className="td">
                      <input type="number" value={c.montoAnual} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => {
                          d.comunes[i].montoAnual = parseFloat(e.target.value) || 0; })}
                        className="campo w-32" />
                    </td>
                    {(["pctAGRO", "pctFERT", "pctCARGAS"] as const).map((campo) => (
                      <td key={campo} className="td">
                        <input type="number" step={0.05} min={0} max={1} value={c[campo]}
                          readOnly={soloLectura}
                          onChange={(e) => actualizar((d) => {
                            d.comunes[i][campo] = parseFloat(e.target.value) || 0; })}
                          className="campo w-20" />
                      </td>
                    ))}
                    <td className={`td text-right font-medium ${ok ? "text-puerto-700" : "text-red-700"}`}>
                      {pct(suma)}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                <td className="td" colSpan={2}>TOTAL</td>
                <td className="td text-right">{usd(total)}</td>
                <td className="td text-right">{usd(porUnidad.AGRO)}</td>
                <td className="td text-right">{usd(porUnidad.FERT)}</td>
                <td className="td text-right">{usd(porUnidad.CARGAS)}</td>
                <td className="td" />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Lo que le toca a cada negocio se resta de su ganancia operativa. Cambiar estos porcentajes
          cambia la rentabilidad de cada negocio por separado, pero no la del proyecto consolidado.
        </p>
      </Bloque>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Cómo se reparten las obras compartidas">
          <p className="mb-3 text-xs text-slate-600">
            Obras que sirven a más de un negocio: muelle, dragado, accesos, energía. Entran en la
            inversión y en la depreciación de cada uno según estos porcentajes.
          </p>
          {UNIDADES.map((u) => (
            <div key={u} className="grid grid-cols-[1fr,8rem] items-center gap-2 border-b border-slate-100 py-1.5">
              <span className="flex items-center text-sm text-slate-700">
                % que le toca a {NOMBRE_UNIDAD[u]}
                <FichaCampo titulo="Reparto de las obras compartidas"
                  ficha={FICHAS.asignacionCapexComun} />
              </span>
              <input type="number" step={0.05} min={0} max={1} readOnly={soloLectura}
                value={esc.asignacionCapexComun[u] ?? 0}
                onChange={(e) => actualizar((d) => {
                  d.asignacionCapexComun[u] = parseFloat(e.target.value) || 0; })}
                className="campo" />
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">Suma</span>
            <span className={Math.abs(sumaAsig - 1) < 0.0001 ? "font-medium text-puerto-700" : "font-medium text-red-700"}>
              {pct(sumaAsig)} {Math.abs(sumaAsig - 1) < 0.0001 ? "" : "— tiene que dar 100%"}
            </span>
          </div>
        </Bloque>

        <Bloque titulo="Obras compartidas, año por año">
          <p className="mb-3 text-xs text-slate-600">
            Cuánta plata de obra compartida se desembolsa cada año, en millones de dólares. Sale de
            la caja en el año en que se carga. Total:{" "}
            <strong>{mm(esc.capexComun.reduce((a, v) => a + v, 0) * 1e6)}</strong>
          </p>
          <div className="grid max-h-80 grid-cols-2 gap-x-4 overflow-auto sm:grid-cols-3">
            {esc.capexComun.map((v, i) => (
              <label key={i} className="flex items-center gap-2 py-1 text-sm">
                <span className="w-12 text-slate-500 tabular-nums">{esc.base.anioBase + i}</span>
                <input type="number" step={0.1} min={0} value={v} readOnly={soloLectura}
                  onChange={(e) => actualizar((d) => {
                    d.capexComun[i] = parseFloat(e.target.value) || 0; })}
                  className="campo w-20" />
              </label>
            ))}
          </div>
        </Bloque>
      </div>
    </div>
  );
}
