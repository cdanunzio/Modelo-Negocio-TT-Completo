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

  function agregarLinea() {
    actualizar((d) => {
      d.comunes.push({
        id: "c" + Date.now().toString(36),
        linea: "Nueva línea de costo compartido",
        driver: "Tiempo de uso de muelle",
        montoAnual: 0,
        // Arranca repartido por partes iguales: es un punto de partida neutral
        // que ya suma 100% y no hace saltar la validación.
        pctAGRO: 1 / 3, pctFERT: 1 / 3, pctCARGAS: 1 / 3,
      });
    });
  }

  function quitarLinea(i: number) {
    actualizar((d) => { d.comunes.splice(i, 1); });
  }

  return (
    <div className="space-y-4">
      <Bloque titulo="Costos compartidos — erogaciones recurrentes">
        <p className="mb-3 text-xs leading-relaxed text-slate-600">
          Costos que se devengan <strong>todos los ejercicios</strong> y benefician a las tres
          unidades a la vez: vigilancia, administración, seguros del predio, dragado de
          mantenimiento. Deben distribuirse con algún criterio; de lo contrario ninguna unidad los absorbe.{" "}
          <strong>Criterio:</strong> todo lo que depende del muelle se distribuye por tiempo de
          uso, nunca por toneladas. Una tonelada de acero ocupa muy por encima de una de granos, y
          prorratear por tonelada haría que granos subsidie al resto.
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
                <th className="th text-right">% Fert. y líquidos</th>
                <th className="th text-right">% Cargas grales.</th>
                <th className="th text-right">Suma</th>
                {!soloLectura && <th className="th" />}
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
                    {!soloLectura && (
                      <td className="td text-right">
                        <button onClick={() => quitarLinea(i)}
                          className="text-xs text-slate-400 hover:text-red-700"
                          title="Eliminar esta línea">Eliminar</button>
                      </td>
                    )}
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
                {!soloLectura && <td className="td" />}
              </tr>
            </tbody>
          </table>
        </div>
        {!soloLectura && (
          <button onClick={agregarLinea} className="btn-secundario mt-3">
            + Agregar línea de gasto
          </button>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Lo que le corresponde a cada negocio se resta de su ganancia operativa. Cambiar estos porcentajes
          cambia la rentabilidad de cada negocio por separado, pero no la del proyecto consolidado.
        </p>
      </Bloque>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Obras compartidas — criterio de distribución de la inversión">
          <p className="mb-3 text-xs text-slate-600">
            Se trata de <strong>inversión</strong>, no de costo anual: la obra que beneficia a más de
            una unidad —muelle, dragado inicial, accesos, energía—. El monto se carga en el bloque contiguo; estos porcentajes
            determinan qué proporción de esa obra, y de su depreciación, absorbe cada unidad.
          </p>
          {UNIDADES.map((u) => (
            <div key={u} className="grid grid-cols-[1fr,8rem] items-center gap-2 border-b border-slate-100 py-1.5">
              <span className="flex items-center text-sm text-slate-700">
                % que le corresponde a {NOMBRE_UNIDAD[u]}
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
              {pct(sumaAsig)} {Math.abs(sumaAsig - 1) < 0.0001 ? "" : "— debe totalizar 100%"}
            </span>
          </div>
        </Bloque>

        <Bloque titulo="Obras compartidas — inversión por ejercicio">
          <p className="mb-3 text-xs text-slate-600">
            Monto de obra compartida que se desembolsa en cada ejercicio, en millones de dólares. Se
            eroga en el año en que se carga. Total:{" "}
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
