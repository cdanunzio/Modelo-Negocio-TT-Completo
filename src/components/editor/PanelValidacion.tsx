"use client";
import { Escenario, KPIs, ResultadoConsolidado, UNIDADES } from "@/lib/model/types";
import { num, pct, usd } from "@/lib/formato";

interface Chequeo {
  texto: string;
  ok: boolean;
  medido: string;
  detalle: string;
}

export default function PanelValidacion({ esc, c, k }: {
  esc: Escenario; c: ResultadoConsolidado; k: KPIs;
}) {
  const sumaPart = esc.inversores.reduce((a, i) => a + i.participacion, 0);
  const sumaRecibe = esc.inversores.reduce((a, i) => a + i.pctFeeRecibe, 0);
  const lineasMal = esc.comunes.filter(
    (x) => Math.abs(x.pctAGRO + x.pctFERT + x.pctCARGAS - 1) > 1e-4
  );
  const sumaCapexComun = UNIDADES.reduce((a, u) => a + (esc.asignacionCapexComun[u] ?? 0), 0);
  const difTn = c.anios.reduce(
    (a, _, i) => a + Math.abs(c.toneladasTotales[i] - UNIDADES.reduce((s, u) => s + c.porUnidad[u].toneladasEfectivas[i], 0)), 0);
  const difEbitda = c.anios.reduce(
    (a, _, i) => a + Math.abs(c.ebitda[i] - (c.ingresosBrutos[i] - c.opexTotal[i] - c.canonTotal[i])), 0);
  const impNegativo = Math.min(...c.impuestoNeto);
  const ahorroExcede = c.anios.some((_, i) => c.ahorroDebCred[i] > c.impuestoDeterminado[i] + 0.01);
  const idycbPagado = -c.idycbPagado.reduce((a, v) => a + v, 0);
  const idycbRecup = c.idycbRecuperado.reduce((a, v) => a + v, 0);
  const capacidadExcedida = UNIDADES.filter((u) => {
    const r = c.porUnidad[u];
    return esc.unidades[u].capacidadMax > 0 &&
      r.toneladasEfectivas.some((v) => v > esc.unidades[u].capacidadMax + 1);
  });
  const dreiSinTC = esc.base.dreiTipoCambio <= 0 || esc.base.dreiMinimoMensualARS <= 0;

  const chequeos: Chequeo[] = [
    { texto: "Participaciones de los socios suman 100%", ok: Math.abs(sumaPart - 1) < 1e-4,
      medido: pct(sumaPart), detalle: "Si no suman 100%, el reparto del flujo entre socios no cierra." },
    { texto: "El fee recibido suma 100%", ok: Math.abs(sumaRecibe - 1) < 1e-4,
      medido: pct(sumaRecibe), detalle: "Alguien tiene que cobrar el fee completo." },
    { texto: "Toneladas: el consolidado es la suma de las tres unidades", ok: difTn < 1,
      medido: usd(difTn, 2), detalle: "Diferencia acumulada de todos los años. Tiene que dar 0." },
    { texto: "EBITDA = Ingresos − OPEX − Canon", ok: difEbitda < 1,
      medido: usd(difEbitda, 2), detalle: "Chequeo de integridad del cálculo." },
    { texto: "El prorrateo de costos comunes suma 100% en cada línea", ok: lineasMal.length === 0,
      medido: lineasMal.length === 0 ? "todas OK" : `${lineasMal.length} línea(s)`,
      detalle: lineasMal.length ? "No cierran: " + lineasMal.map((l) => l.linea).join(", ")
                                : "Cada línea reparte exactamente el 100% de su costo." },
    { texto: "La asignación del CAPEX común suma 100%", ok: Math.abs(sumaCapexComun - 1) < 1e-4,
      medido: pct(sumaCapexComun), detalle: "Las obras compartidas tienen que repartirse enteras." },
    { texto: "Ocupación de muelle bajo el umbral", ok: k.ocupacionMaxima <= esc.base.umbralOcupacion / 100,
      medido: pct(k.ocupacionMaxima),
      detalle: `Umbral: ${pct(esc.base.umbralOcupacion / 100)}. Por encima, el volumen prometido no entra físicamente: hay que sumar sitios de atraque o rechazar carga.` },
    { texto: "El impuesto a las Ganancias nunca es negativo", ok: impNegativo >= 0,
      medido: usd(impNegativo), detalle: "Si el año da pérdida el impuesto es cero, nunca negativo." },
    { texto: "Los ahorros RIGI no superan el impuesto determinado", ok: !ahorroExcede,
      medido: ahorroExcede ? "hay excesos" : "OK",
      detalle: "No se puede computar más crédito que impuesto a pagar." },
    { texto: "El IDyCB recuperado no supera al pagado", ok: idycbRecup <= idycbPagado + 0.01,
      medido: `${usd(idycbRecup)} de ${usd(idycbPagado)}`,
      detalle: "No se puede recuperar más impuesto al cheque del que se pagó." },
    { texto: "Ninguna unidad supera su capacidad instalada", ok: capacidadExcedida.length === 0,
      medido: capacidadExcedida.length === 0 ? "OK" : capacidadExcedida.join(", "),
      detalle: "Las toneladas efectivas están topeadas por la capacidad máxima de cada unidad." },
    { texto: "El DREI está completo (tipo de cambio y mínimo mensual)", ok: !dreiSinTC,
      medido: dreiSinTC ? "faltan datos" : "completo",
      detalle: "Sin el tipo de cambio y el mínimo mensual, el DREI se calcula solo por alícuota y queda subestimado." },
  ];

  const ok = chequeos.filter((x) => x.ok).length;

  return (
    <div className="space-y-4">
      <div className={`tarjeta p-4 ${ok === chequeos.length ? "border-puerto-300 bg-puerto-50" : "border-amber-300 bg-amber-50"}`}>
        <p className="text-lg font-semibold">
          {ok} de {chequeos.length} chequeos en orden
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {ok === chequeos.length
            ? "El modelo cierra. Recordá que los valores cargados son preliminares hasta que los validen las áreas."
            : "Hay chequeos que no cierran. No presentes la TIR hasta resolverlos: una TIR sobre un modelo que no cierra es peor que no tener TIR."}
        </p>
      </div>

      <div className="tarjeta overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th">Chequeo</th>
              <th className="th text-right">Medido</th>
              <th className="th">Qué significa</th>
              <th className="th text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {chequeos.map((ch, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="td whitespace-normal font-medium text-slate-800">{ch.texto}</td>
                <td className="td text-right text-slate-600">{ch.medido}</td>
                <td className="td whitespace-normal text-xs text-slate-500">{ch.detalle}</td>
                <td className="td text-center">
                  <span className={`chip ${ch.ok ? "bg-puerto-100 text-puerto-700" : "bg-red-100 text-red-700"}`}>
                    {ch.ok ? "OK" : "REVISAR"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
