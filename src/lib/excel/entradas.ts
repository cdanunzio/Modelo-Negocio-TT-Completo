/**
 * Las dos hojas de datos de entrada: Parámetros y Costos compartidos.
 *
 * Son las únicas celdas del libro que llevan números escritos (más los datos
 * por año de cada negocio). Todo el resto del modelo las referencia, así que
 * cambiar acá una alícuota o un costo recalcula la planilla entera.
 */
import { Escenario, UNIDADES, NOMBRE_UNIDAD, Unidad } from "../model/types";
import { FICHAS } from "../fichas";
import {
  Celda, Hoja, texto, numero, formula, titulo, entrada,
  FORMATO_DECIMAL, FORMATO_PCT, FORMATO_MONEDA, CELESTE,
} from "./celdas";

export function hojaParametros(esc: Escenario): Hoja {
  const b = esc.base;
  const h = new Hoja("Parámetros");
  const nota = (clave?: string) => (clave && FICHAS[clave] ? FICHAS[clave].que : "");

  const p = (rotulo: string, valor: number | string | boolean, unidad: string, clave: string) => {
    h.agregar(entrada(rotulo, valor, unidad, nota(clave)), clave);
  };

  h.agregar(titulo("Parámetros generales", 4));
  h.agregar([
    texto("Dato", { fontWeight: "bold" }), texto("Valor", { fontWeight: "bold" }),
    texto("Unidad", { fontWeight: "bold" }), texto("Qué es", { fontWeight: "bold" }),
  ]);

  h.agregar(titulo("Horizonte y calendario", 4));
  p("Año base del modelo", b.anioBase, "año", "anioBase");
  p("Años que se proyectan", b.horizonte, "años", "horizonte");
  p("Año de inicio de operación del proyecto", b.anioInicioOpProyecto, "año", "anioInicioOpProyecto");

  h.agregar(titulo("Operación del puerto", 4));
  p("Días operativos del año", b.diasOperativos, "días", "diasOperativos");
  p("Sitios de atraque disponibles", b.sitiosAtraque, "sitios", "sitiosAtraque");
  p("Umbral de alerta de ocupación", b.umbralOcupacion, "%", "umbralOcupacion");

  h.agregar(titulo("Impuestos del régimen general", 4));
  p("Impuesto a las Ganancias, régimen general", b.tasaImpuestoGeneral, "%", "tasaImpuestoGeneral");
  p("Años en que se descuenta la inversión", b.vidaUtilDepreciacion, "años", "vidaUtilDepreciacion");
  p("Tasas e impuesto al cheque restados del flujo", b.tasasEnFCFF, "Sí / No", "tasasEnFCFF");

  h.agregar(titulo("Financiamiento con deuda", 4));
  p("Monto de deuda", b.montoDeudaMM, "USD MM", "montoDeudaMM");
  p("Tasa de interés", b.tasaDeuda, "% anual", "tasaDeuda");
  p("Plazo de devolución", b.plazoDeuda, "años", "plazoDeuda");

  h.agregar(titulo("Régimen de grandes inversiones (RIGI)", 4));
  p("RIGI aplicado", b.rigiActivo, "Sí / No", "rigiActivo");
  p("Año de inicio de los beneficios", b.rigiAnioInicio, "año", "rigiAnioInicio");
  p("Impuesto a las Ganancias dentro del RIGI", b.rigiTasaImpuesto, "%", "rigiTasaImpuesto");
  p("Amortización acelerada", b.rigiAmortAcelerada, "Sí / No", "rigiAmortAcelerada");
  p("% de vida útil al acelerar", b.rigiPctVidaUtil, "%", "rigiPctVidaUtil");
  p("Años sin Ingresos Brutos", b.rigiIIBBAnios, "años", "rigiIIBBAnios");
  p("Alícuota de Ingresos Brutos sin el régimen", b.rigiIIBBPct, "%", "rigiIIBBPct");
  p("Años sin tasa municipal", b.rigiMunicipalAnios, "años", "rigiMunicipalAnios");
  p("Tasa municipal post exención", b.rigiMunicipalPorMil, "por mil", "rigiMunicipalPorMil");
  p("Impuesto al cheque a cuenta de Ganancias", b.rigiDebCredActivo, "Sí / No", "rigiDebCredActivo");
  p("% del impuesto al cheque computado", b.rigiDebCredPct, "%", "rigiDebCredPct");
  p("IVA de inversiones informado (CERTIVA)", b.rigiCertivaActivo, "Sí / No", "rigiCertivaActivo");

  h.agregar([
    texto("Alícuota de Ganancias que aplica"),
    formula(`IF(${h.fijo("rigiActivo")}="Sí",${h.fijo("rigiTasaImpuesto")},${h.fijo("tasaImpuestoGeneral")})`,
      FORMATO_DECIMAL),
    texto("%"),
    texto("Calculada: la del RIGI si el régimen está aplicado, si no la general.", { wrap: true }),
  ], "tasaImpuestoVigente");

  h.agregar(titulo("Otros impuestos y tasas", 4));
  p("Impuesto al cheque (IDyCB)", b.idycbAlicuota, "%", "idycbAlicuota");
  p("Años para usar el crédito del impuesto al cheque", b.idycbPrescripcion, "años", "idycbPrescripcion");
  p("Tipo de cambio para la tasa municipal", b.dreiTipoCambio, "ARS/USD", "dreiTipoCambio");
  p("Tasa municipal mínima por mes", b.dreiMinimoMensualARS, "ARS", "dreiMinimoMensualARS");
  p("Tasa de edificación, primeros 5 años", b.tasaEdifPrimeros5, "por mil", "tasaEdifPrimeros5");
  p("Tasa de edificación, desde el año 6", b.tasaEdifPost5, "por mil", "tasaEdifPost5");

  h.agregar(titulo("Armado de la operación", 4));
  p("Comisión de estructuración", b.structuringFeeUSD, "USD", "structuringFeeUSD");
  p("Año en que se cobra la comisión", b.anioCobroFee, "año", "anioCobroFee");
  p("Costo de armar la presentación al RIGI", b.costoEstructuracionARS, "ARS", "costoEstructuracionARS");
  p("Tipo de cambio promedio", b.tipoCambioPromedio, "ARS/USD", "tipoCambioPromedio");
  h.agregar([
    texto("Costo de estructuración en dólares"),
    formula(`IF(${h.fijo("tipoCambioPromedio")}>0,${h.fijo("costoEstructuracionARS")}/${h.fijo("tipoCambioPromedio")},0)`,
      FORMATO_MONEDA),
    texto("USD"),
    texto("Calculado: el costo en pesos dividido por el tipo de cambio promedio.", { wrap: true }),
  ], "costoEstructuracionUSD");

  h.agregar(titulo("Curva de maduración por ejercicio", 4));
  h.agregar([
    texto("Año", { fontWeight: "bold" }), texto("Factor", { fontWeight: "bold" }),
    texto("", {}), texto("Afecta el volumen del ejercicio. 1 = plena capacidad.", { wrap: true }),
  ]);
  b.rampUp.forEach((v, i) => {
    h.agregar([
      numero(b.anioBase + i, "0"),
      numero(v, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
    ], i === 0 ? "rampUp" : undefined);
  });

  return h;
}

/**
 * Costos compartidos y obras compartidas. Además de los datos, calcula cuánto
 * le corresponde por año a cada negocio: esa celda es la que leen las hojas de cada
 * unidad, así que el reparto se ve una sola vez y en un solo lugar.
 */
export function hojaComunes(esc: Escenario, anios: number[]): Hoja {
  const h = new Hoja("Costos compartidos");
  const n = esc.comunes.length;

  h.agregar(titulo("Costos compartidos entre los tres negocios", 6));
  h.agregar([
    texto("Línea de costo", { fontWeight: "bold" }), texto("Criterio de reparto", { fontWeight: "bold" }),
    texto("Costo por año (USD)", { fontWeight: "bold" }),
    texto("% Agrograneles", { fontWeight: "bold" }), texto("% Fertilizantes", { fontWeight: "bold" }),
    texto("% Cargas generales", { fontWeight: "bold" }),
  ]);
  esc.comunes.forEach((c, i) => {
    h.agregar([
      texto(c.linea), texto(c.driver),
      numero(c.montoAnual, FORMATO_MONEDA, { backgroundColor: CELESTE }),
      numero(c.pctAGRO, FORMATO_PCT, { backgroundColor: CELESTE }),
      numero(c.pctFERT, FORMATO_PCT, { backgroundColor: CELESTE }),
      numero(c.pctCARGAS, FORMATO_PCT, { backgroundColor: CELESTE }),
    ], i === 0 ? "primerCosto" : i === n - 1 ? "ultimoCosto" : undefined);
  });
  if (n === 1) h.agregar([], "ultimoCosto"); // no debería pasar, pero deja el índice completo

  const montos = n > 0 ? h.rangoVertical("primerCosto", n === 1 ? "primerCosto" : "ultimoCosto", 2) : "";
  const colPct: Record<Unidad, number> = { AGRO: 3, FERT: 4, CARGAS: 5 };

  h.agregar([
    texto("TOTAL", { fontWeight: "bold" }),
    null,
    n > 0 ? formula(`SUM(${montos})`, FORMATO_MONEDA, { fontWeight: "bold" }) : numero(0),
  ], "totalCostos");

  h.blanco();
  h.agregar(titulo("Costos compartidos asignados a cada unidad, por ejercicio", 6));
  UNIDADES.forEach((u) => {
    const pcts = n > 0
      ? h.rangoVertical("primerCosto", n === 1 ? "primerCosto" : "ultimoCosto", colPct[u])
      : "";
    h.agregar([
      texto(NOMBRE_UNIDAD[u]),
      n > 0
        ? formula(`SUMPRODUCT(${montos},${pcts})`, FORMATO_MONEDA)
        : numero(0),
      texto("USD/año"),
      texto("Suma de cada línea de costo por el porcentaje que le corresponde a este negocio.", { wrap: true }),
    ], `opexComun.${u}`);
  });

  h.blanco();
  h.agregar(titulo("Cómo se reparten las obras compartidas", 6));
  h.agregar([texto("Negocio", { fontWeight: "bold" }), texto("% que le corresponde", { fontWeight: "bold" })]);
  UNIDADES.forEach((u) => {
    h.agregar([
      texto(NOMBRE_UNIDAD[u]),
      numero(esc.asignacionCapexComun[u] ?? 0, FORMATO_PCT, { backgroundColor: CELESTE }),
    ], `pctCapexComun.${u}`);
  });

  h.blanco();
  h.agregar(titulo("Obras compartidas, año por año (USD MM)", 6));
  h.agregar([
    texto("Año", { fontWeight: "bold" }), texto("Inversión", { fontWeight: "bold" }),
    texto("", {}), texto("Se reparte entre los negocios con los porcentajes de arriba.", { wrap: true }),
  ]);
  anios.forEach((a, i) => {
    h.agregar([
      numero(a, "0"),
      numero(esc.capexComun[i] ?? 0, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
    ], i === 0 ? "capexComun" : undefined);
  });

  return h;
}

/** Ancho de columnas de las hojas de entrada. */
export const ANCHO_PARAMETROS = [{ width: 46 }, { width: 18 }, { width: 14 }, { width: 70 }];
export const ANCHO_COMUNES = [
  { width: 40 }, { width: 30 }, { width: 18 }, { width: 16 }, { width: 16 }, { width: 18 },
];

export type { Celda };
