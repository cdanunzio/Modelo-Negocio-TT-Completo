"use client";
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
} from "recharts";
import { ResultadoConsolidado } from "@/lib/model/types";
import { mm, pct, usd } from "@/lib/formato";

/** Paleta categórica validada (slots 1-3, all-pairs, modo claro). */
export const SERIE = { AGRO: "#2a78d6", FERT: "#eb6834", CARGAS: "#1baf7a" } as const;
const TINTA = "#52514e";
const REJILLA = "#e7e5e0";
const POSITIVO = "#1baf7a";
const NEGATIVO = "#e34948";

const ejeY = { tick: { fill: TINTA, fontSize: 11 }, axisLine: false, tickLine: false };
const ejeX = { tick: { fill: TINTA, fontSize: 11 }, axisLine: { stroke: REJILLA }, tickLine: false };

function Caja({ titulo, subtitulo, children, alto = 260 }: {
  titulo: string; subtitulo?: string; children: React.ReactNode; alto?: number;
}) {
  return (
    <section className="tarjeta p-4">
      <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
      {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}
      <div style={{ height: alto }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer>
      </div>
    </section>
  );
}

function tooltipUSD(valor: number, nombre: string) {
  return [mm(valor), nombre] as [string, string];
}

export function GraficoFlujo({ c }: { c: ResultadoConsolidado }) {
  const datos = c.anios.map((a, i) => ({ anio: a, fcff: c.fcff[i] }));
  return (
    <Caja titulo="Flujo de caja libre del proyecto (FCFF)"
          subtitulo="Barras rojas: años en que el proyecto consume plata. Verdes: años en que la genera.">
      <BarChart data={datos} margin={{ top: 6, right: 22, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey="anio" {...ejeX} interval={4} />
        <YAxis {...ejeY} tickFormatter={(v) => usd(v / 1e6, 0)} width={52}
               label={{ value: "USD MM", angle: -90, position: "insideLeft",
                        style: { fill: TINTA, fontSize: 11 } }} />
        <Tooltip formatter={(v) => tooltipUSD(Number(v), "FCFF")}
                 labelFormatter={(l) => `Año ${l}`}
                 contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e7e5e0" }} />
        <ReferenceLine y={0} stroke={TINTA} strokeWidth={1} />
        <Bar dataKey="fcff" radius={[4, 4, 0, 0]} maxBarSize={18}>
          {datos.map((d, i) => (
            <Cell key={i} fill={d.fcff >= 0 ? POSITIVO : NEGATIVO} />
          ))}
        </Bar>
      </BarChart>
    </Caja>
  );
}

export function GraficoAcumulado({ c }: { c: ResultadoConsolidado }) {
  const datos = c.anios.map((a, i) => ({ anio: a, acum: c.fcffAcumulado[i] }));
  const payback = c.anios.find((_, i) => c.fcffAcumulado[i] > 0);
  return (
    <Caja titulo="FCFF acumulado"
          subtitulo={payback ? `Cruza el cero en ${payback}: ahí se recupera toda la inversión.`
                             : "No recupera la inversión dentro del horizonte."}>
      <ComposedChart data={datos} margin={{ top: 6, right: 22, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey="anio" {...ejeX} interval={4} />
        <YAxis {...ejeY} tickFormatter={(v) => usd(v / 1e6, 0)} width={52}
               label={{ value: "USD MM", angle: -90, position: "insideLeft",
                        style: { fill: TINTA, fontSize: 11 } }} />
        <Tooltip formatter={(v) => tooltipUSD(Number(v), "Acumulado")}
                 labelFormatter={(l) => `Año ${l}`}
                 contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e7e5e0" }} />
        <ReferenceLine y={0} stroke={TINTA} strokeWidth={1} />
        {payback && <ReferenceLine x={payback} stroke={TINTA} strokeDasharray="4 3"
                                   label={{ value: "payback", position: "top",
                                            style: { fill: TINTA, fontSize: 10 } }} />}
        <Line type="monotone" dataKey="acum" stroke={SERIE.AGRO} strokeWidth={2} dot={false} />
      </ComposedChart>
    </Caja>
  );
}

export function GraficoIngresos({ c }: { c: ResultadoConsolidado }) {
  const datos = c.anios.map((a, i) => ({
    anio: a,
    AGRO: c.porUnidad.AGRO.ingresosBrutos[i],
    FERT: c.porUnidad.FERT.ingresosBrutos[i],
    CARGAS: c.porUnidad.CARGAS.ingresosBrutos[i],
  }));
  return (
    <Caja titulo="Ingresos brutos por unidad de negocio"
          subtitulo="Cuánto factura cada negocio por año, apilado.">
      <BarChart data={datos} margin={{ top: 6, right: 22, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey="anio" {...ejeX} interval={4} />
        <YAxis {...ejeY} tickFormatter={(v) => usd(v / 1e6, 0)} width={52}
               label={{ value: "USD MM", angle: -90, position: "insideLeft",
                        style: { fill: TINTA, fontSize: 11 } }} />
        <Tooltip formatter={(v, n) => tooltipUSD(Number(v), String(n))}
                 labelFormatter={(l) => `Año ${l}`}
                 contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e7e5e0" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: TINTA }} iconType="square" iconSize={9} />
        <Bar dataKey="AGRO" stackId="a" fill={SERIE.AGRO} maxBarSize={18}
             stroke="#fcfcfb" strokeWidth={2} />
        <Bar dataKey="FERT" stackId="a" fill={SERIE.FERT} maxBarSize={18}
             stroke="#fcfcfb" strokeWidth={2} />
        <Bar dataKey="CARGAS" stackId="a" fill={SERIE.CARGAS} radius={[4, 4, 0, 0]}
             maxBarSize={18} stroke="#fcfcfb" strokeWidth={2} />
      </BarChart>
    </Caja>
  );
}

export function GraficoOcupacion({ c, umbral }: { c: ResultadoConsolidado; umbral: number }) {
  const datos = c.anios.map((a, i) => ({
    anio: a,
    AGRO: c.porUnidad.AGRO.ocupacionMuelle[i],
    FERT: c.porUnidad.FERT.ocupacionMuelle[i],
    CARGAS: c.porUnidad.CARGAS.ocupacionMuelle[i],
  }));
  const maximo = Math.max(...c.ocupacionMuelle);
  return (
    <Caja titulo="Ocupación de muelle"
          subtitulo={`Máximo ${pct(maximo)} contra un umbral de ${pct(umbral / 100)}. ` +
                     (maximo > umbral / 100
                       ? "Por encima del umbral el volumen prometido no entra físicamente."
                       : "Dentro del umbral.")}>
      <AreaChart data={datos} margin={{ top: 6, right: 22, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey="anio" {...ejeX} interval={4} />
        <YAxis {...ejeY} tickFormatter={(v) => pct(Number(v), 0)} width={48} />
        <Tooltip formatter={(v, n) => [pct(Number(v)), String(n)]}
                 labelFormatter={(l) => `Año ${l}`}
                 contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e7e5e0" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: TINTA }} iconType="square" iconSize={9} />
        <ReferenceLine y={umbral / 100} stroke={NEGATIVO} strokeDasharray="5 3" strokeWidth={2}
          label={{ value: "umbral", position: "right", style: { fill: NEGATIVO, fontSize: 10 } }} />
        <Area type="monotone" dataKey="AGRO" stackId="1" stroke={SERIE.AGRO} strokeWidth={2}
              fill={SERIE.AGRO} fillOpacity={0.55} />
        <Area type="monotone" dataKey="FERT" stackId="1" stroke={SERIE.FERT} strokeWidth={2}
              fill={SERIE.FERT} fillOpacity={0.55} />
        <Area type="monotone" dataKey="CARGAS" stackId="1" stroke={SERIE.CARGAS} strokeWidth={2}
              fill={SERIE.CARGAS} fillOpacity={0.55} />
      </AreaChart>
    </Caja>
  );
}

export function GraficoEbitda({ c }: { c: ResultadoConsolidado }) {
  const datos = c.anios.map((a, i) => ({
    anio: a, ingresos: c.ingresosBrutos[i], ebitda: c.ebitda[i],
  }));
  return (
    <Caja titulo="Ingresos y EBITDA consolidados"
          subtitulo="La distancia entre las dos líneas es lo que cuesta operar el puerto.">
      <ComposedChart data={datos} margin={{ top: 6, right: 22, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={REJILLA} vertical={false} />
        <XAxis dataKey="anio" {...ejeX} interval={4} />
        <YAxis {...ejeY} tickFormatter={(v) => usd(v / 1e6, 0)} width={52}
               label={{ value: "USD MM", angle: -90, position: "insideLeft",
                        style: { fill: TINTA, fontSize: 11 } }} />
        <Tooltip formatter={(v, n) => tooltipUSD(Number(v), String(n) === "ingresos" ? "Ingresos" : "EBITDA")}
                 labelFormatter={(l) => `Año ${l}`}
                 contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #e7e5e0" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: TINTA }} iconType="plainline" iconSize={14}
                formatter={(v) => (v === "ingresos" ? "Ingresos brutos" : "EBITDA")} />
        <Line type="monotone" dataKey="ingresos" stroke={SERIE.AGRO} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ebitda" stroke={SERIE.FERT} strokeWidth={2} dot={false} />
      </ComposedChart>
    </Caja>
  );
}
