"use client";
import { useState } from "react";
import { Escenario, ResultadoConsolidado, Unidad, UNIDADES, NOMBRE_UNIDAD } from "@/lib/model/types";
import { usd, pct, num } from "@/lib/formato";

type Vista = "consolidado" | Unidad;

interface Fila {
  etiqueta: string;
  valores: number[] | (number | null)[];
  formato?: "usd" | "pct" | "num" | "tn";
  clave?: boolean;
  memo?: boolean;
  ayuda: string;
}

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

  const filasConsolidado: Fila[] = [
    ...UNIDADES.map((u) => ({
      etiqueta: `Toneladas ${u}`, valores: c.porUnidad[u].toneladasEfectivas,
      ayuda: `Toneladas efectivas de ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "TONELADAS TOTALES", valores: c.toneladasTotales, clave: true,
      ayuda: "El tamaño físico del negocio en el año." },
    ...UNIDADES.map((u) => ({
      etiqueta: `Ingresos ${u}`, valores: c.porUnidad[u].ingresosBrutos,
      ayuda: `Facturación de ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "INGRESOS BRUTOS CONSOLIDADOS", valores: c.ingresosBrutos, clave: true,
      ayuda: "Toda la plata que entra por vender servicios, antes de descontar nada." },
    { etiqueta: "OPEX total consolidado", valores: c.opexTotal,
      ayuda: "Todo lo que cuesta operar el puerto: costos propios de cada unidad más los compartidos." },
    { etiqueta: "Canon total consolidado", valores: c.canonTotal,
      ayuda: "Alquileres o concesiones de las tres unidades." },
    { etiqueta: "EBITDA CONSOLIDADO", valores: c.ebitda, clave: true,
      ayuda: "Lo que gana el puerto operando, antes de la inversión y los impuestos. Es el número que mira un banco." },
    { etiqueta: "Depreciación consolidada", valores: c.depreciacion,
      ayuda: "Desgaste contable de la inversión. No es plata que sale." },
    { etiqueta: "EBIT CONSOLIDADO", valores: c.ebit, clave: true,
      ayuda: "EBITDA menos depreciación. Sobre este número se calcula el impuesto." },
    { etiqueta: "IDyCB pagado (impuesto al cheque)", valores: c.idycbPagado,
      ayuda: "Se paga cada vez que entra o sale plata de la cuenta. Acá se estima sobre los movimientos de la inversión." },
    { etiqueta: "IDyCB recuperado a cuenta de Ganancias", valores: c.idycbRecuperado,
      ayuda: "La parte que se descuenta del impuesto a las ganancias. Bajo RIGI se computa el 100%." },
    { etiqueta: "DREI (tasa municipal de Timbúes)", valores: c.drei,
      ayuda: "Por mil sobre la facturación, con un mínimo mensual en pesos. Exento durante los años del RIGI." },
    { etiqueta: "Tasa de edificación y mov. de tierra", valores: c.tasaEdificacion,
      ayuda: "Tasa municipal sobre el monto de obra de cada año." },
    { etiqueta: "Impuesto a las Ganancias determinado", valores: c.impuestoDeterminado,
      ayuda: "EBIT por la alícuota. Nunca negativo: si el año da pérdida, es cero." },
    { etiqueta: "[MEMO] Ahorro IIBB exento (Santa Fe)", valores: c.memoAhorroIIBB, memo: true,
      ayuda: "Lo que se habría pagado sin la exención. NO es plata que entra: es plata que no se paga. No suma al flujo." },
    { etiqueta: "[MEMO] Ahorro Impuesto Municipal exento", valores: c.memoAhorroMunicipal, memo: true,
      ayuda: "Mismo criterio que el anterior." },
    { etiqueta: "Ahorro Déb/Créd bancario computado", valores: c.ahorroDebCred,
      ayuda: "Nunca puede superar el impuesto determinado del año." },
    { etiqueta: "Impuesto a las Ganancias neto", valores: c.impuestoNeto,
      ayuda: "Lo que realmente se paga. Este sí sale de la caja." },
    { etiqueta: "[MEMO] IVA de inversiones (CERTIVA)", valores: c.memoIVAInversiones, memo: true,
      ayuda: "Es crédito fiscal, no costo: se recupera. Tratarlo como costo es el error más común. No afecta el flujo." },
    { etiqueta: "NOPAT CONSOLIDADO", valores: c.nopat, clave: true,
      ayuda: "Resultado operativo después del impuesto, sin considerar cómo se financia el proyecto." },
    ...UNIDADES.map((u) => ({
      etiqueta: `CAPEX ${u}`, valores: c.porUnidad[u].capexTotal,
      ayuda: `Inversión de ${NOMBRE_UNIDAD[u]} en el año.`,
    })),
    { etiqueta: "CAPEX CONSOLIDADO", valores: c.capexTotal, clave: true,
      ayuda: "Toda la inversión del puerto ese año. La suma de la fila es la plata total a conseguir." },
    { etiqueta: "FCFF CONSOLIDADO", valores: c.fcff, clave: true,
      ayuda: "El flujo de caja libre del proyecto. Sobre esta fila se calcula la TIR. Es la fila más importante del modelo." },
    { etiqueta: "Deuda — desembolso", valores: c.deudaDesembolso, ayuda: "La plata que entra si se toma un préstamo." },
    { etiqueta: "Intereses de deuda", valores: c.deudaIntereses, ayuda: "Lo que se paga por año por el préstamo." },
    { etiqueta: "Amortización de deuda", valores: c.deudaAmortizacion, ayuda: "Devolución del capital, en cuotas iguales." },
    { etiqueta: "Saldo de deuda", valores: c.deudaSaldo, ayuda: "Cuánto se debe al final de cada año." },
    { etiqueta: "Escudo fiscal de intereses", valores: c.escudoFiscal,
      ayuda: "Los intereses se descuentan de ganancias: ese ahorro es un beneficio de endeudarse." },
    { etiqueta: "FCFE CONSOLIDADO", valores: c.fcfe, clave: true,
      ayuda: "Lo que le queda al accionista después de pagarle al banco. Sin deuda, es igual al FCFF." },
    { etiqueta: "Servicio de deuda", valores: c.servicioDeuda, ayuda: "Intereses más amortización." },
    { etiqueta: "DSCR", valores: c.dscr, formato: "num",
      ayuda: "Cuántas veces alcanza el EBITDA para pagar la cuota. Los bancos suelen exigir 1,30." },
    { etiqueta: "FCFF acumulado", valores: c.fcffAcumulado,
      ayuda: "El año en que pasa a positivo es el payback." },
    { etiqueta: "FCFE acumulado", valores: c.fcfeAcumulado, ayuda: "Lo mismo, para el accionista." },
    { etiqueta: "OCUPACIÓN DE MUELLE CONSOLIDADA", valores: c.ocupacionMuelle, formato: "pct", clave: true,
      ayuda: "Si supera el umbral, el volumen prometido no entra físicamente: hay que construir más muelle o rechazar carga." },
  ];

  function filasUnidad(u: Unidad): Fila[] {
    const r = c.porUnidad[u];
    return [
      { etiqueta: "Toneladas teóricas", valores: r.toneladasTeoricas, ayuda: "Lo que podría mover si no hubiera límite de instalaciones." },
      { etiqueta: "Toneladas efectivas", valores: r.toneladasEfectivas, clave: true, ayuda: "Las que realmente se mueven, recortadas por la capacidad." },
      { etiqueta: "Factor de utilización", valores: r.factorUtilizacion, formato: "num", ayuda: "1,00 = entra todo. Menos de 1 = se rechaza demanda por falta de capacidad." },
      { etiqueta: "Tarifa muelle (USD/tn)", valores: r.tarifaMuelle, formato: "num", ayuda: "Lo que se cobra por usar el muelle." },
      { etiqueta: "Tarifa estibaje (USD/tn)", valores: r.tarifaEstibaje, formato: "num", ayuda: "Cargar o descargar el buque." },
      { etiqueta: "Tarifa manipuleo (USD/tn)", valores: r.tarifaManipuleo, formato: "num", ayuda: "Mover la mercadería dentro del predio." },
      { etiqueta: "Tarifa almacenaje (USD/tn)", valores: r.tarifaAlmacenaje, formato: "num", ayuda: "Guardar la mercadería. Sale de USD por mes dividido la rotación." },
      { etiqueta: "Tarifa calada y otros (USD/tn)", valores: r.tarifaCalada, formato: "num", ayuda: "Servicios adicionales." },
      { etiqueta: "Otros ingresos (USD/tn)", valores: r.tarifaOtros, formato: "num", ayuda: "Conceptos fuera de los cinco rubros." },
      { etiqueta: "Tarifa operativa total (USD/tn)", valores: r.tarifaTotal, formato: "num", clave: true, ayuda: "El precio de venta unitario del negocio." },
      { etiqueta: "Ingresos uso de muelle", valores: r.ingresosMuelle, ayuda: "Toneladas por tarifa de muelle." },
      { etiqueta: "Ingresos estibaje", valores: r.ingresosEstibaje, ayuda: "Toneladas por tarifa de estibaje." },
      { etiqueta: "Ingresos manipuleo", valores: r.ingresosManipuleo, ayuda: "Toneladas por tarifa de manipuleo." },
      { etiqueta: "Ingresos almacenaje", valores: r.ingresosAlmacenaje, ayuda: "Toneladas por tarifa de almacenaje." },
      { etiqueta: "Ingresos calada y otros derechos", valores: r.ingresosCalada, ayuda: "Toneladas por tarifa de calada." },
      { etiqueta: "Otros ingresos", valores: r.ingresosOtros, ayuda: "Toneladas por otros ingresos." },
      { etiqueta: "INGRESOS BRUTOS", valores: r.ingresosBrutos, clave: true, ayuda: "Toda la facturación del año." },
      { etiqueta: "OPEX fijo directo", valores: r.opexFijo, ayuda: "Lo que se paga todos los años sin importar el volumen." },
      { etiqueta: "OPEX variable (USD/tn)", valores: r.opexVariableUnitario, formato: "num", ayuda: "Cuánto cuesta operar cada tonelada adicional." },
      { etiqueta: "OPEX variable total", valores: r.opexVariable, ayuda: "Toneladas por el costo variable unitario." },
      { etiqueta: "OPEX directo total", valores: r.opexDirecto, ayuda: "Todo lo que cuesta operar esta unidad, sin lo compartido." },
      { etiqueta: "OPEX común asignado", valores: r.opexComun, ayuda: "La parte que le toca de los costos compartidos entre los tres negocios." },
      { etiqueta: "OPEX total", valores: r.opexTotal, ayuda: "Propio más la parte de lo compartido." },
      { etiqueta: "Canon total", valores: r.canonTotal, ayuda: "Alquiler o concesión por operar." },
      { etiqueta: "EBITDA", valores: r.ebitda, clave: true, ayuda: "Lo que gana el negocio operando." },
      { etiqueta: "CAPEX directo", valores: r.capexDirecto, ayuda: "La inversión propia de la unidad." },
      { etiqueta: "CAPEX común asignado", valores: r.capexComun, ayuda: "La parte que le toca de las obras compartidas." },
      { etiqueta: "CAPEX total", valores: r.capexTotal, clave: true, ayuda: "Toda la inversión que le corresponde ese año." },
      { etiqueta: "Base depreciable acumulada", valores: r.baseDepreciable, ayuda: "Inversión hecha hasta ese año, menos lo que no se deprecia." },
      { etiqueta: "Depreciación", valores: r.depreciacion, ayuda: "Desgaste contable. No es plata que sale." },
      { etiqueta: "EBIT", valores: r.ebit, clave: true, ayuda: "EBITDA menos depreciación." },
      { etiqueta: "Ganancias standalone [informativo]", valores: r.impuestoStandalone, memo: true, ayuda: "Lo que pagaría si fuera una empresa aparte. El impuesto real se calcula en el consolidado." },
      { etiqueta: "NOPAT standalone", valores: r.nopatStandalone, memo: true, ayuda: "También informativo." },
      { etiqueta: "FCFF standalone", valores: r.fcffStandalone, clave: true, ayuda: "El flujo de caja de esta unidad. Sobre él se calcula su TIR." },
      { etiqueta: "FCFF acumulado", valores: r.fcffAcumulado, ayuda: "Suma del flujo desde el principio." },
      { etiqueta: "Ocupación de muelle", valores: r.ocupacionMuelle, formato: "pct", ayuda: "Qué porcentaje del año ocupa el muelle esta unidad." },
      { etiqueta: "Recaladas equivalentes", valores: r.recaladas, formato: "num", ayuda: "Cuántos barcos por año representa ese volumen." },
      ...r.detalleFlujos.map((d) => ({
        etiqueta: `   · ${d.flujo.gate} ${d.flujo.carga} (${d.flujo.modo})`,
        valores: d.toneladas, memo: true,
        ayuda: "Toneladas proyectadas de este flujo comercial. Solo se usa con método de tarifa 1.",
      })),
    ];
  }

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
        filas={vista === "consolidado" ? filasConsolidado : filasUnidad(vista as Unidad)} />
    </div>
  );
}
