"use client";
import { Escenario, KPIs, ResultadoConsolidado, UNIDADES, Unidad, NOMBRE_UNIDAD } from "@/lib/model/types";
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
  const sumaPorUnidad = {} as Record<Unidad, number>;
  UNIDADES.forEach((u) => {
    sumaPorUnidad[u] = esc.inversores.reduce((a, inv) => a + (inv.participaciones?.[u] ?? 0), 0);
  });
  const unidadesDescuadradas = UNIDADES.filter((u) => Math.abs(sumaPorUnidad[u] - 1) > 1e-4);
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
    { texto: "Cada unidad distribuye el 100% entre sus socios",
      ok: unidadesDescuadradas.length === 0,
      medido: unidadesDescuadradas.length === 0
        ? "los tres OK"
        : UNIDADES.map((u) => `${NOMBRE_UNIDAD[u]}: ${pct(sumaPorUnidad[u])}`).join(" · "),
      detalle: "Si en una unidad las participaciones no totalizan 100%, la distribución del flujo entre socios no cuadra." },
    { texto: "La comisión de estructuración percibida totaliza 100%", ok: Math.abs(sumaRecibe - 1) < 1e-4,
      medido: pct(sumaRecibe), detalle: "La comisión debe quedar íntegramente asignada." },
    { texto: "Toneladas: el consolidado es la suma de las tres unidades", ok: difTn < 1,
      medido: usd(difTn, 2), detalle: "Diferencia acumulada de todos los ejercicios. Debe ser 0." },
    { texto: "Resultado operativo = facturación − costos − derecho de uso", ok: difEbitda < 1,
      medido: usd(difEbitda, 2), detalle: "Control de integridad del cálculo." },
    { texto: "El prorrateo de costos comunes totaliza 100% en cada línea", ok: lineasMal.length === 0,
      medido: lineasMal.length === 0 ? "todas OK" : `${lineasMal.length} línea(s)`,
      detalle: lineasMal.length ? "No cuadran: " + lineasMal.map((l) => l.linea).join(", ")
                                : "Cada línea distribuye exactamente el 100% de su costo." },
    { texto: "La distribución de las obras compartidas totaliza 100%", ok: Math.abs(sumaCapexComun - 1) < 1e-4,
      medido: pct(sumaCapexComun), detalle: "Las obras compartidas deben distribuirse en su totalidad." },
    { texto: "Ocupación de muelle bajo el umbral", ok: k.ocupacionMaxima <= esc.base.umbralOcupacion / 100,
      medido: pct(k.ocupacionMaxima),
      detalle: `Umbral: ${pct(esc.base.umbralOcupacion / 100)}. Por encima, el volumen prometido no entra físicamente: hay que sumar sitios de atraque o rechazar carga.` },
    { texto: "El impuesto a las Ganancias nunca es negativo", ok: impNegativo >= 0,
      medido: usd(impNegativo), detalle: "Si el ejercicio arroja quebranto el impuesto es cero, nunca negativo." },
    { texto: "Los ahorros RIGI no superan el impuesto determinado", ok: !ahorroExcede,
      medido: ahorroExcede ? "hay excesos" : "OK",
      detalle: "No puede computarse más crédito que impuesto determinado." },
    { texto: "El IDyCB recuperado no supera al pagado", ok: idycbRecup <= idycbPagado + 0.01,
      medido: `${usd(idycbRecup)} de ${usd(idycbPagado)}`,
      detalle: "No puede recuperarse más impuesto al cheque del efectivamente abonado." },
    { texto: "Ninguna unidad supera su capacidad instalada", ok: capacidadExcedida.length === 0,
      medido: capacidadExcedida.length === 0 ? "OK" : capacidadExcedida.join(", "),
      detalle: "Las toneladas efectivas están limitadas por la capacidad máxima de cada unidad." },
    { texto: "El DREI está completo (tipo de cambio y mínimo mensual)", ok: !dreiSinTC,
      medido: dreiSinTC ? "faltan datos" : "completo",
      detalle: "Sin el tipo de cambio y el importe mínimo mensual, el DREI se determina solo por alícuota y queda subestimado." },
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
            ? "El modelo es consistente. Los valores cargados siguen siendo preliminares hasta que los validen las áreas."
            : "Hay controles que no cierran. No corresponde exponer el rendimiento hasta resolverlos: una cifra calculada sobre un modelo inconsistente es peor que no tener cifra."}
        </p>
      </div>

      <div className="tarjeta overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th">Chequeo</th>
              <th className="th text-right">Medido</th>
              <th className="th">Alcance del control</th>
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
