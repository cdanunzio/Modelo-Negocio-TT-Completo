"use client";
import { Escenario, KPIs, ResultadoConsolidado, UNIDADES, NOMBRE_UNIDAD } from "@/lib/model/types";
import { tir } from "@/lib/model/engine";
import { mm, pct, usd, num } from "@/lib/formato";
import { GraficoFlujo, GraficoAcumulado, GraficoIngresos, GraficoOcupacion, GraficoEbitda, SERIE } from "../Graficos";
import { FichaCampo } from "./campos";
import { FICHAS } from "@/lib/fichas";

function Tile({ titulo, valor, nota, alerta }: {
  titulo: string; valor: string; nota?: string; alerta?: boolean;
}) {
  return (
    <div className={`tarjeta p-4 ${alerta ? "border-red-300 bg-red-50" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${alerta ? "text-red-700" : "text-slate-900"}`}>
        {valor}
      </p>
      {nota && <p className="mt-1 text-xs leading-snug text-slate-500">{nota}</p>}
    </div>
  );
}

export default function PanelResumen({ esc, c, k }: {
  esc: Escenario; c: ResultadoConsolidado; k: KPIs;
}) {
  const superaUmbral = k.ocupacionMaxima > esc.base.umbralOcupacion / 100;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile titulo="Rendimiento del proyecto (TIR)" valor={pct(k.tirProyecto, 2)}
              nota="Rendimiento anual en dólares sobre el flujo completo." />
        <Tile titulo="Inversión total (CAPEX)" valor={mm(k.capexTotal)}
              nota="El capital total a obtener para ejecutar la obra." />
        <Tile titulo="Año de recupero de la inversión"
              valor={k.paybackAnio ? String(k.paybackAnio) : "No recupera"}
              nota="Ejercicio en que el flujo acumulado se vuelve positivo (payback)." />
        <Tile titulo="Ocupación máx. de muelle" valor={pct(k.ocupacionMaxima)}
              alerta={superaUmbral}
              nota={superaUmbral
                ? `Supera el umbral de ${pct(esc.base.umbralOcupacion / 100)}: el volumen no entra físicamente.`
                : `Dentro del umbral de ${pct(esc.base.umbralOcupacion / 100)}.`} />
        <Tile titulo="Resultado operativo acumulado (EBITDA)" valor={mm(k.ebitdaAcumulado)}
              nota="Resultado operativo acumulado de todo el horizonte." />
        <Tile titulo="Margen operativo" valor={pct(k.margenEbitda)}
              nota="Porcentaje de la facturación que queda como resultado operativo." />
        <Tile titulo="Toneladas del año pico" valor={usd(k.toneladasMaximas)}
              nota="Volumen físico operado en el ejercicio de mayor actividad." />
        <Tile titulo="Rendimiento del accionista (TIR)"
              valor={esc.base.montoDeudaMM > 0 ? pct(k.tirAccionista, 2) : "Sin deuda"}
              nota={esc.base.montoDeudaMM > 0
                ? `La ganancia cubre la cuota ${num(k.dscrMinimo)} veces en el año más ajustado · los bancos suelen exigir 1,30`
                : "Cargar un monto de deuda en Parámetros generales para simularla."} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GraficoFlujo c={c} />
        <GraficoAcumulado c={c} />
        <GraficoIngresos c={c} />
        <GraficoOcupacion c={c} umbral={esc.base.umbralOcupacion} />
        <div className="lg:col-span-2"><GraficoEbitda c={c} /></div>
      </div>

      <section className="tarjeta overflow-hidden">
        <h3 className="seccion">Aporte de cada unidad de negocio</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">
                  Negocio<FichaCampo titulo="Unidad de negocio" ficha={FICHAS.resumenNegocio} />
                </th>
                <th className="th text-right">
                  Inversión<FichaCampo titulo="Inversión de la unidad" ficha={FICHAS.resumenInversion} />
                </th>
                <th className="th text-right">
                  Facturación ac.
                  <FichaCampo titulo="Facturación acumulada" ficha={FICHAS.resumenFacturacion} />
                </th>
                <th className="th text-right">
                  Resultado operativo ac.
                  <FichaCampo titulo="Resultado operativo acumulado" ficha={FICHAS.resumenResultado} />
                </th>
                <th className="th text-right">
                  Margen<FichaCampo titulo="Margen operativo" ficha={FICHAS.resumenMargen} />
                </th>
                <th className="th text-right">
                  Toneladas ac.
                  <FichaCampo titulo="Toneladas acumuladas" ficha={FICHAS.resumenToneladas} />
                </th>
                <th className="th text-right">
                  Tarifa media por tn
                  <FichaCampo titulo="Tarifa media por tonelada" ficha={FICHAS.resumenTarifaMedia} />
                </th>
                <th className="th text-right">
                  Ocup. máx.
                  <FichaCampo titulo="Ocupación máxima de muelle" ficha={FICHAS.resumenOcupacion} />
                </th>
                <th className="th text-right">
                  Rendimiento individual (TIR)
                  <FichaCampo titulo="Rendimiento individual (TIR)" ficha={FICHAS.resumenTIR} />
                </th>
                <th className="th text-right">
                  Aporte a la TIR del proyecto (puntos)
                  <FichaCampo titulo="Aporte a la TIR del proyecto" ficha={FICHAS.resumenAporte} />
                </th>
              </tr>
            </thead>
            <tbody>
              {UNIDADES.map((u) => {
                const r = c.porUnidad[u];
                const suma = (s: number[]) => s.reduce((a, v) => a + v, 0);
                const ing = suma(r.ingresosBrutos);
                const tn = suma(r.toneladasEfectivas);
                const tSin = tir(c.fcffSinUnidad[u]);
                const aporte = tSin !== null && k.tirProyecto !== null ? k.tirProyecto - tSin : null;
                return (
                  <tr key={u} className="border-t border-slate-100">
                    <td className="td font-medium">
                      <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm"
                            style={{ background: SERIE[u] }} />
                      {NOMBRE_UNIDAD[u]}
                    </td>
                    <td className="td text-right">{mm(-suma(r.capexTotal))}</td>
                    <td className="td text-right">{mm(ing)}</td>
                    <td className="td text-right">{mm(suma(r.ebitda))}</td>
                    <td className="td text-right">{pct(ing ? suma(r.ebitda) / ing : 0)}</td>
                    <td className="td text-right">{usd(tn)}</td>
                    <td className="td text-right">{num(tn ? ing / tn : 0)}</td>
                    <td className="td text-right">{pct(Math.max(...r.ocupacionMuelle))}</td>
                    <td className="td text-right">{pct(tir(r.fcffStandalone), 2)}</td>
                    <td className={`td text-right font-medium ${
                      aporte !== null && aporte < 0 ? "text-red-700" : "text-puerto-700"}`}>
                      {aporte !== null ? `${aporte >= 0 ? "+" : ""}${num(aporte * 100)} pts` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          La última columna compara el rendimiento del proyecto completo contra el del proyecto sin
          ese negocio. Es una aproximación: no considera la compensación de quebrantos entre
          negocios ni cómo se reasignarían los costos compartidos.
        </p>
      </section>
    </div>
  );
}
