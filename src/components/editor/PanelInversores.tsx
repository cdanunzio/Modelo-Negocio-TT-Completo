"use client";
import { Escenario, ResultadoConsolidado } from "@/lib/model/types";
import { tir } from "@/lib/model/engine";
import { usd, pct, mm } from "@/lib/formato";
import { Bloque } from "./campos";

interface Props {
  esc: Escenario; c: ResultadoConsolidado;
  actualizar: (fn: (b: Escenario) => void) => void; soloLectura?: boolean;
}

export default function PanelInversores({ esc, c, actualizar, soloLectura }: Props) {
  const { structuringFeeUSD: fee, anioCobroFee, costoEstructuracionARS, tipoCambioPromedio } = esc.base;
  const costoUSD = tipoCambioPromedio > 0 ? costoEstructuracionARS / tipoCambioPromedio : 0;

  const flujoDe = (i: number) =>
    c.anios.map((a, j) => {
      const inv = esc.inversores[i];
      const feeNeto =
        a === anioCobroFee
          ? (inv.pctFeeRecibe - inv.pctFeeDesembolsa) * fee - inv.pctFeeRecibe * costoUSD
          : 0;
      return inv.participacion * c.fcff[j] + feeNeto;
    });

  const sumaPart = esc.inversores.reduce((a, i) => a + i.participacion, 0);
  const sumaRecibe = esc.inversores.reduce((a, i) => a + i.pctFeeRecibe, 0);
  const sumaDesemb = esc.inversores.reduce((a, i) => a + i.pctFeeDesembolsa, 0);
  const flujos = esc.inversores.map((_, i) => flujoDe(i));
  const control = c.anios.map((a, j) => {
    const total = flujos.reduce((acc, f) => acc + f[j], 0);
    const feeSistema =
      a === anioCobroFee ? (sumaRecibe - sumaDesemb) * fee - sumaRecibe * costoUSD : 0;
    return total - (c.fcff[j] + feeSistema);
  });
  const controlOK = control.every((v) => Math.abs(v) < 1);

  return (
    <div className="space-y-4">
      <Bloque titulo="Estructura de inversores">
        <p className="mb-3 text-xs leading-relaxed text-slate-600">
          Cada socio aporta su participación del CAPEX y recibe esa misma participación del flujo
          positivo: es el esquema <em>pari passu</em>. El Structuring Fee se reparte aparte: una
          columna dice qué porcentaje <strong>cobra</strong> cada uno y la otra qué porcentaje{" "}
          <strong>desembolsa</strong>. Quien desembolsa queda por debajo de la TIR del proyecto;
          quien cobra, por encima.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">Inversor</th>
                <th className="th text-right">Participación</th>
                <th className="th text-right">% del fee que recibe</th>
                <th className="th text-right">% del fee que desembolsa</th>
                <th className="th text-right">Aportes</th>
                <th className="th text-right">Distribuciones</th>
                <th className="th text-right">Fee neto</th>
                <th className="th text-right">TIR</th>
              </tr>
            </thead>
            <tbody>
              {esc.inversores.map((inv, i) => {
                const f = flujos[i];
                const aportes = -f.filter((v) => v < 0).reduce((a, v) => a + v, 0);
                const distrib = f.filter((v) => v > 0).reduce((a, v) => a + v, 0);
                const feeNeto =
                  (inv.pctFeeRecibe - inv.pctFeeDesembolsa) * fee - inv.pctFeeRecibe * costoUSD;
                return (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="td">
                      <input value={inv.nombre} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => { d.inversores[i].nombre = e.target.value; })}
                        className="campo campo-texto w-44" />
                    </td>
                    {(["participacion", "pctFeeRecibe", "pctFeeDesembolsa"] as const).map((campo) => (
                      <td key={campo} className="td">
                        <input type="number" step={0.01} min={0} max={1} readOnly={soloLectura}
                          value={inv[campo]}
                          onChange={(e) => actualizar((d) => {
                            d.inversores[i][campo] = parseFloat(e.target.value) || 0; })}
                          className="campo w-24" />
                      </td>
                    ))}
                    <td className="td text-right">{mm(aportes)}</td>
                    <td className="td text-right">{mm(distrib)}</td>
                    <td className={`td text-right ${feeNeto < 0 ? "text-red-700" : "text-puerto-700"}`}>
                      {mm(feeNeto)}
                    </td>
                    <td className="td text-right font-semibold">{pct(tir(f), 2)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                <td className="td">TOTAL</td>
                <td className={`td text-right ${Math.abs(sumaPart - 1) < 1e-4 ? "" : "text-red-700"}`}>
                  {pct(sumaPart)}
                </td>
                <td className={`td text-right ${Math.abs(sumaRecibe - 1) < 1e-4 ? "" : "text-red-700"}`}>
                  {pct(sumaRecibe)}
                </td>
                <td className="td text-right">{pct(sumaDesemb)}</td>
                <td className="td text-right" colSpan={3} />
                <td className="td text-right">{pct(tir(c.fcff), 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <span className={Math.abs(sumaPart - 1) < 1e-4 ? "text-puerto-700" : "text-red-700"}>
            {Math.abs(sumaPart - 1) < 1e-4 ? "✓" : "✗"} Participaciones suman 100%
          </span>
          <span className={Math.abs(sumaRecibe - 1) < 1e-4 ? "text-puerto-700" : "text-red-700"}>
            {Math.abs(sumaRecibe - 1) < 1e-4 ? "✓" : "✗"} Fee recibido suma 100%
          </span>
          <span className={controlOK ? "text-puerto-700" : "text-red-700"}>
            {controlOK ? "✓" : "✗"} Control: la suma de los socios cierra contra el flujo del proyecto
          </span>
        </div>
      </Bloque>

      <Bloque titulo="Flujo de fondos por inversor (USD)">
        <div className="max-h-[50vh] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th sticky left-0 z-20 bg-puerto-100">Concepto</th>
                {c.anios.map((a) => <th key={a} className="th min-w-[6.5rem] text-right">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-slate-50">
                <td className="td sticky left-0 z-10 bg-slate-50 font-medium">FCFF del proyecto (100%)</td>
                {c.fcff.map((v, j) => (
                  <td key={j} className={`td text-right ${v < 0 ? "text-red-700" : ""}`}>{usd(v)}</td>
                ))}
              </tr>
              {esc.inversores.map((inv, i) => (
                <tr key={inv.id} className="border-t border-slate-100">
                  <td className="td sticky left-0 z-10 bg-white">{inv.nombre}</td>
                  {flujos[i].map((v, j) => (
                    <td key={j} className={`td text-right ${v < 0 ? "text-red-700" : "text-slate-600"}`}>
                      {usd(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                <td className="td sticky left-0 z-10 bg-puerto-50">Total inversores</td>
                {c.anios.map((_, j) => (
                  <td key={j} className="td text-right">
                    {usd(flujos.reduce((a, f) => a + f[j], 0))}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-100">
                <td className="td sticky left-0 z-10 bg-white italic text-slate-500">
                  Control (debe dar 0)
                </td>
                {control.map((v, j) => (
                  <td key={j} className={`td text-right italic ${
                    Math.abs(v) < 1 ? "text-slate-400" : "text-red-700"}`}>
                    {usd(v, 2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  );
}
