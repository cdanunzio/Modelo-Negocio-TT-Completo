"use client";
import { Escenario, ResultadoConsolidado, UNIDADES, Unidad, NOMBRE_UNIDAD } from "@/lib/model/types";
import { tir } from "@/lib/model/engine";
import { usd, pct, mm } from "@/lib/formato";
import { Bloque, Ayuda, FichaCampo } from "./campos";
import { FICHAS } from "@/lib/fichas";

interface Props {
  esc: Escenario; c: ResultadoConsolidado;
  actualizar: (fn: (b: Escenario) => void) => void; soloLectura?: boolean;
}

const CORTO: Record<Unidad, string> = {
  AGRO: "Agrograneles",
  FERT: "Fertilizantes",
  CARGAS: "Cargas grales.",
};

export default function PanelInversores({ esc, c, actualizar, soloLectura }: Props) {
  const { structuringFeeUSD: fee, anioCobroFee, costoEstructuracionARS, tipoCambioPromedio } = esc.base;
  const costoUSD = tipoCambioPromedio > 0 ? costoEstructuracionARS / tipoCambioPromedio : 0;

  /** Lo que le toca a un socio: su parte del flujo de cada negocio, más el fee. */
  const flujoDe = (i: number) =>
    c.anios.map((a, j) => {
      const inv = esc.inversores[i];
      const feeNeto =
        a === anioCobroFee
          ? (inv.pctFeeRecibe - inv.pctFeeDesembolsa) * fee - inv.pctFeeRecibe * costoUSD
          : 0;
      const delNegocio = UNIDADES.reduce(
        (acc, u) => acc + (inv.participaciones[u] ?? 0) * c.fcffPorUnidad[u][j], 0
      );
      return delNegocio + feeNeto;
    });

  const flujos = esc.inversores.map((_, i) => flujoDe(i));

  // Cuánto pesa cada negocio dentro de la inversión total: sirve para traducir
  // las participaciones por unidad a una participación del proyecto entero.
  const inversionPorUnidad = {} as Record<Unidad, number>;
  UNIDADES.forEach((u) => {
    inversionPorUnidad[u] = Math.abs(
      c.porUnidad[u].capexTotal.reduce((a, v) => a + v, 0)
    );
  });
  const inversionTotal = UNIDADES.reduce((a, u) => a + inversionPorUnidad[u], 0);
  const participacionProyecto = (i: number) =>
    inversionTotal > 0
      ? UNIDADES.reduce(
          (a, u) => a + (esc.inversores[i].participaciones[u] ?? 0) * inversionPorUnidad[u], 0
        ) / inversionTotal
      : 0;

  const sumaPorUnidad = {} as Record<Unidad, number>;
  UNIDADES.forEach((u) => {
    sumaPorUnidad[u] = esc.inversores.reduce((a, inv) => a + (inv.participaciones[u] ?? 0), 0);
  });
  const unidadesDescuadradas = UNIDADES.filter((u) => Math.abs(sumaPorUnidad[u] - 1) > 1e-4);

  const sumaRecibe = esc.inversores.reduce((a, i) => a + i.pctFeeRecibe, 0);
  const sumaDesemb = esc.inversores.reduce((a, i) => a + i.pctFeeDesembolsa, 0);

  const control = c.anios.map((a, j) => {
    const total = flujos.reduce((acc, f) => acc + f[j], 0);
    const feeSistema =
      a === anioCobroFee ? (sumaRecibe - sumaDesemb) * fee - sumaRecibe * costoUSD : 0;
    return total - (c.fcff[j] + feeSistema);
  });
  const controlOK = control.every((v) => Math.abs(v) < 1);

  function agregar() {
    actualizar((d) => {
      d.inversores.push({
        id: "i" + Date.now().toString(36),
        nombre: "Socio nuevo",
        participaciones: { AGRO: 0, FERT: 0, CARGAS: 0 },
        pctFeeRecibe: 0,
        pctFeeDesembolsa: 0,
      });
    });
  }

  function quitar(i: number) {
    actualizar((d) => { d.inversores.splice(i, 1); });
  }

  return (
    <div className="space-y-4">
      <Bloque titulo="Socios del proyecto">
        <p className="mb-3 max-w-4xl text-xs leading-relaxed text-slate-600">
          Cada socio puede estar en uno, en dos o en los tres negocios, y con un porcentaje
          distinto en cada uno. Aporta ese porcentaje de la inversión de ese negocio y recibe ese
          mismo porcentaje de lo que ese negocio genera: es el esquema{" "}
          <em>pari passu</em>. Dejar un negocio en 0% significa que ese socio no participa ahí.
        </p>
        <p className="mb-3 max-w-4xl text-xs leading-relaxed text-slate-600">
          La comisión de estructuración se reparte aparte: una columna dice qué porcentaje{" "}
          <strong>cobra</strong> cada uno y otra qué porcentaje <strong>desembolsa</strong>. Quien
          desembolsa queda por debajo del rendimiento del proyecto; quien cobra, por encima.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th">Socio</th>
                {UNIDADES.map((u) => (
                  <th key={u} className="th text-right" title={NOMBRE_UNIDAD[u]}>
                    % en {CORTO[u]}
                    <FichaCampo titulo={`Participación en ${NOMBRE_UNIDAD[u]}`}
                      ficha={FICHAS.participacionUnidad} />
                  </th>
                ))}
                <th className="th text-right">
                  % del proyecto
                  <Ayuda titulo="Participación en el proyecto">
                    Participación equivalente sobre el total invertido. No se carga: sale de pesar
                    cada negocio por su inversión y aplicar el porcentaje del socio en cada uno.
                  </Ayuda>
                </th>
                <th className="th text-right">
                  % de la comisión que cobra
                  <FichaCampo titulo="Comisión que cobra" ficha={FICHAS.pctFeeRecibe} />
                </th>
                <th className="th text-right">
                  % de la comisión que desembolsa
                  <FichaCampo titulo="Comisión que desembolsa" ficha={FICHAS.pctFeeDesembolsa} />
                </th>
                <th className="th text-right">Aportes</th>
                <th className="th text-right">Distribuciones</th>
                <th className="th text-right">
                  Rendimiento (TIR)
                  <Ayuda titulo="Rendimiento del socio (TIR)">
                    Tasa interna de retorno del flujo propio de ese socio: lo que aporta y lo que
                    recibe de cada negocio según su participación, más o menos la comisión de
                    estructuración que cobra o desembolsa.
                  </Ayuda>
                </th>
                {!soloLectura && <th className="th" />}
              </tr>
            </thead>
            <tbody>
              {esc.inversores.map((inv, i) => {
                const f = flujos[i];
                const aportes = -f.filter((v) => v < 0).reduce((a, v) => a + v, 0);
                const distrib = f.filter((v) => v > 0).reduce((a, v) => a + v, 0);
                return (
                  <tr key={inv.id} className="border-t border-slate-100">
                    <td className="td">
                      <input value={inv.nombre} readOnly={soloLectura}
                        onChange={(e) => actualizar((d) => { d.inversores[i].nombre = e.target.value; })}
                        className="campo campo-texto w-40" />
                    </td>
                    {UNIDADES.map((u) => (
                      <td key={u} className="td">
                        <input type="number" step={0.01} min={0} max={1} readOnly={soloLectura}
                          value={inv.participaciones[u] ?? 0}
                          onChange={(e) => actualizar((d) => {
                            d.inversores[i].participaciones[u] = parseFloat(e.target.value) || 0; })}
                          className={`w-20 ${(inv.participaciones[u] ?? 0) === 0 ? "campo opacity-60" : "campo"}`} />
                      </td>
                    ))}
                    <td className="td text-right text-slate-600">{pct(participacionProyecto(i))}</td>
                    {(["pctFeeRecibe", "pctFeeDesembolsa"] as const).map((campo) => (
                      <td key={campo} className="td">
                        <input type="number" step={0.01} min={0} max={1} readOnly={soloLectura}
                          value={inv[campo]}
                          onChange={(e) => actualizar((d) => {
                            d.inversores[i][campo] = parseFloat(e.target.value) || 0; })}
                          className="campo w-20" />
                      </td>
                    ))}
                    <td className="td text-right">{mm(aportes)}</td>
                    <td className="td text-right">{mm(distrib)}</td>
                    <td className="td text-right font-semibold">{pct(tir(f), 2)}</td>
                    {!soloLectura && (
                      <td className="td text-right">
                        <button onClick={() => quitar(i)}
                          className="text-xs text-slate-400 hover:text-red-700"
                          title="Quitar este socio">Quitar</button>
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                <td className="td">TOTAL</td>
                {UNIDADES.map((u) => (
                  <td key={u}
                    className={`td text-right ${Math.abs(sumaPorUnidad[u] - 1) < 1e-4 ? "" : "text-red-700"}`}>
                    {pct(sumaPorUnidad[u])}
                  </td>
                ))}
                <td className="td text-right">{pct(inversionTotal > 0 ? 1 : 0)}</td>
                <td className={`td text-right ${Math.abs(sumaRecibe - 1) < 1e-4 ? "" : "text-red-700"}`}>
                  {pct(sumaRecibe)}
                </td>
                <td className="td text-right">{pct(sumaDesemb)}</td>
                <td className="td" colSpan={2} />
                <td className="td text-right">{pct(tir(c.fcff), 2)}</td>
                {!soloLectura && <td className="td" />}
              </tr>
            </tbody>
          </table>
        </div>

        {!soloLectura && (
          <button onClick={agregar} className="btn-secundario mt-3">+ Agregar socio</button>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <span className={unidadesDescuadradas.length === 0 ? "text-puerto-700" : "text-red-700"}>
            {unidadesDescuadradas.length === 0 ? "✓" : "✗"} Cada negocio reparte el 100%
            {unidadesDescuadradas.length > 0 &&
              ` — revisar: ${unidadesDescuadradas.map((u) => CORTO[u]).join(", ")}`}
          </span>
          <span className={Math.abs(sumaRecibe - 1) < 1e-4 ? "text-puerto-700" : "text-red-700"}>
            {Math.abs(sumaRecibe - 1) < 1e-4 ? "✓" : "✗"} La comisión cobrada suma 100%
          </span>
          <span className={controlOK ? "text-puerto-700" : "text-red-700"}>
            {controlOK ? "✓" : "✗"} La suma de los socios cierra contra el flujo del proyecto
          </span>
        </div>
      </Bloque>

      <Bloque titulo="Flujo de fondos libre por negocio (USD)">
        <p className="mb-3 max-w-4xl text-xs leading-relaxed text-slate-600">
          El flujo del proyecto repartido entre los tres negocios. Cada uno se lleva lo suyo
          (facturación, costos, inversión) y lo que solo existe a nivel proyecto —el impuesto a
          las ganancias, las tasas— se prorratea. Las tres filas suman el flujo consolidado.
        </p>
        <div className="max-h-[40vh] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="th sticky left-0 z-20 bg-puerto-100">Negocio</th>
                {c.anios.map((a) => <th key={a} className="th min-w-[6.5rem] text-right">{a}</th>)}
              </tr>
            </thead>
            <tbody>
              {UNIDADES.map((u) => (
                <tr key={u} className="border-t border-slate-100">
                  <td className="td sticky left-0 z-10 bg-white">{NOMBRE_UNIDAD[u]}</td>
                  {c.fcffPorUnidad[u].map((v, j) => (
                    <td key={j} className={`td text-right ${v < 0 ? "text-red-700" : "text-slate-600"}`}>
                      {usd(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t-2 border-puerto-200 bg-puerto-50 font-semibold">
                <td className="td sticky left-0 z-10 bg-puerto-50">Consolidado</td>
                {c.fcff.map((v, j) => (
                  <td key={j} className={`td text-right ${v < 0 ? "text-red-700" : ""}`}>{usd(v)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Bloque>

      <Bloque titulo="Flujo de fondos por socio (USD)">
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
                <td className="td sticky left-0 z-10 bg-slate-50 font-medium">
                  Flujo libre del proyecto (100%)
                </td>
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
                <td className="td sticky left-0 z-10 bg-puerto-50">Total socios</td>
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
