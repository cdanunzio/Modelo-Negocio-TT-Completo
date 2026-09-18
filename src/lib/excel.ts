import {
  Escenario, ResultadoConsolidado, KPIs, UNIDADES, Unidad, NOMBRE_UNIDAD,
} from "./model/types";
import { filasConsolidado, filasUnidad, Fila } from "./filas";
import { FICHAS } from "./fichas";

/**
 * Exportación a Excel: un archivo con una hoja por módulo.
 *
 * Los números van como números, no como texto, así que en Excel se pueden
 * sumar, graficar y usar en fórmulas. Las filas son las mismas que muestra la
 * pantalla, porque salen del mismo lugar (`filas.ts`).
 */

type Celda = {
  value?: string | number | null;
  type?: typeof String | typeof Number;
  fontWeight?: "bold";
  align?: "left" | "right" | "center";
  format?: string;
  backgroundColor?: string;
  color?: string;
  wrap?: boolean;
} | null;

const FORMATO_MONEDA = "#,##0";
const FORMATO_DECIMAL = "#,##0.000";
const FORMATO_PCT = "0.0%";
const VERDE = "#1B5E3F";

const titulo = (texto: string, ancho: number): Celda[] => [
  { value: texto, type: String, fontWeight: "bold", backgroundColor: VERDE, color: "#FFFFFF" },
  ...Array(Math.max(0, ancho - 1)).fill({ backgroundColor: VERDE } as Celda),
];

const vacia = (): Celda[] => [];

const texto = (v: string, opts: Partial<NonNullable<Celda>> = {}): Celda =>
  ({ value: v, type: String, ...opts });

const numero = (v: number | null | undefined, format = FORMATO_MONEDA): Celda =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : { value: Number(v), type: Number, format };

/** Una fila del flujo: el concepto y un valor por año. */
function filaDeFlujo(f: Fila): Celda[] {
  const formato =
    f.formato === "pct" ? FORMATO_PCT : f.formato === "num" ? FORMATO_DECIMAL : FORMATO_MONEDA;
  return [
    texto(f.etiqueta, f.clave ? { fontWeight: "bold" } : {}),
    ...f.valores.map((v) =>
      numero(v as number | null, formato) as Celda
    ),
    texto(f.ayuda, { wrap: true }),
  ];
}

function hojaFlujo(anios: number[], filas: Fila[]): Celda[][] {
  return [
    [
      texto("Concepto", { fontWeight: "bold" }),
      ...anios.map((a) => ({ value: a, type: Number, fontWeight: "bold", align: "right" } as Celda)),
      texto("Qué significa", { fontWeight: "bold" }),
    ],
    ...filas.map(filaDeFlujo),
  ];
}

function anchoFlujo(anios: number[]) {
  return [{ width: 46 }, ...anios.map(() => ({ width: 14 })), { width: 70 }];
}

// ------------------------------------------------------------------ hojas --

function hojaResumen(esc: Escenario, k: KPIs, c: ResultadoConsolidado): Celda[][] {
  const fila = (concepto: string, valor: Celda, nota: string): Celda[] =>
    [texto(concepto), valor, texto(nota, { wrap: true })];

  return [
    titulo("Resumen del proyecto", 3),
    vacia(),
    [texto("Indicador", { fontWeight: "bold" }), texto("Valor", { fontWeight: "bold" }),
     texto("Qué quiere decir", { fontWeight: "bold" })],
    fila("Rendimiento del proyecto (TIR)", numero(k.tirProyecto, FORMATO_PCT),
      "Rendimiento anual en dólares del flujo completo, sin considerar deuda."),
    fila("Rendimiento de los socios (TIR del accionista)", numero(k.tirAccionista, FORMATO_PCT),
      "Rendimiento después de pagarle al banco. Sin deuda cargada no se calcula."),
    fila("Inversión total (CAPEX)", numero(k.capexTotal),
      "Toda la plata que hay que conseguir para construirlo."),
    fila("Año en que se recupera la inversión", numero(k.paybackAnio, "0"),
      "Año en que el flujo acumulado pasa a positivo."),
    fila("Ganancia operativa acumulada (EBITDA)", numero(k.ebitdaAcumulado),
      "Suma de la ganancia operativa de todo el horizonte."),
    fila("Facturación acumulada", numero(k.ingresosAcumulados),
      "Suma de todo lo facturado en el horizonte."),
    fila("Margen operativo", numero(k.margenEbitda, FORMATO_PCT),
      "Qué porcentaje de lo facturado queda como ganancia operativa."),
    fila("Toneladas del mejor año", numero(k.toneladasMaximas),
      "Tamaño físico del negocio en su año pico."),
    fila("Ocupación máxima del muelle", numero(k.ocupacionMaxima, FORMATO_PCT),
      `Umbral de alerta cargado: ${esc.base.umbralOcupacion}%.`),
    fila("Veces que la ganancia cubre la cuota (DSCR mínimo)",
      numero(k.dscrMinimo, FORMATO_DECIMAL),
      "El año más ajustado para pagarle al banco. Los bancos suelen exigir 1,30."),
    fila("Inversión por tonelada instalada", numero(k.capexPorToneladaInstalada, FORMATO_DECIMAL),
      "Cuántos dólares de obra hacen falta por cada tonelada anual de capacidad."),
    vacia(),
    titulo("Rendimiento de cada negocio por separado", 3),
    [texto("Negocio", { fontWeight: "bold" }), texto("Inversión", { fontWeight: "bold" }),
     texto("Ganancia operativa acumulada", { fontWeight: "bold" })],
    ...UNIDADES.map((u) => [
      texto(NOMBRE_UNIDAD[u]),
      numero(-c.porUnidad[u].capexTotal.reduce((a, v) => a + v, 0)),
      numero(c.porUnidad[u].ebitda.reduce((a, v) => a + v, 0)),
    ]),
    vacia(),
    [texto(
      "Los valores son preliminares hasta que los validen Comercial, Operaciones, Ingeniería e Impuestos.",
      { wrap: true }
    )],
  ];
}

function hojaParametros(esc: Escenario): Celda[][] {
  const b = esc.base;
  const p = (concepto: string, valor: number | string, unidad: string, clave?: string): Celda[] => [
    texto(concepto),
    typeof valor === "number" ? numero(valor, FORMATO_DECIMAL) : texto(valor),
    texto(unidad),
    texto(clave && FICHAS[clave] ? FICHAS[clave].que : "", { wrap: true }),
  ];

  return [
    titulo("Parámetros generales", 4),
    vacia(),
    [texto("Dato", { fontWeight: "bold" }), texto("Valor", { fontWeight: "bold" }),
     texto("Unidad", { fontWeight: "bold" }), texto("Qué es", { fontWeight: "bold" })],

    titulo("Horizonte y calendario", 4),
    p("Año base del modelo", b.anioBase, "año", "anioBase"),
    p("Años que se proyectan", b.horizonte, "años", "horizonte"),
    p("Año de inicio de operación del proyecto", b.anioInicioOpProyecto, "año", "anioInicioOpProyecto"),

    titulo("Operación del puerto", 4),
    p("Días operativos del año", b.diasOperativos, "días", "diasOperativos"),
    p("Sitios de atraque disponibles", b.sitiosAtraque, "sitios", "sitiosAtraque"),
    p("Umbral de alerta de ocupación", b.umbralOcupacion, "%", "umbralOcupacion"),

    titulo("Impuestos del régimen general", 4),
    p("Impuesto a las Ganancias, régimen general", b.tasaImpuestoGeneral, "%", "tasaImpuestoGeneral"),
    p("Años en que se descuenta la inversión", b.vidaUtilDepreciacion, "años", "vidaUtilDepreciacion"),
    p("Tasas e impuesto al cheque restados del flujo", b.tasasEnFCFF ? "Sí" : "No", "", "tasasEnFCFF"),

    titulo("Financiamiento con deuda", 4),
    p("Monto de deuda", b.montoDeudaMM, "USD MM", "montoDeudaMM"),
    p("Tasa de interés", b.tasaDeuda, "% anual", "tasaDeuda"),
    p("Plazo de devolución", b.plazoDeuda, "años", "plazoDeuda"),

    titulo("Régimen de grandes inversiones (RIGI)", 4),
    p("RIGI aplicado", b.rigiActivo ? "Sí" : "No", "", "rigiActivo"),
    p("Año de inicio de los beneficios", b.rigiAnioInicio, "año", "rigiAnioInicio"),
    p("Impuesto a las Ganancias dentro del RIGI", b.rigiTasaImpuesto, "%", "rigiTasaImpuesto"),
    p("Amortización acelerada", b.rigiAmortAcelerada ? "Sí" : "No", "", "rigiAmortAcelerada"),
    p("% de vida útil al acelerar", b.rigiPctVidaUtil, "%", "rigiPctVidaUtil"),
    p("Años sin Ingresos Brutos", b.rigiIIBBAnios, "años", "rigiIIBBAnios"),
    p("Alícuota de Ingresos Brutos sin el régimen", b.rigiIIBBPct, "%", "rigiIIBBPct"),
    p("Años sin tasa municipal", b.rigiMunicipalAnios, "años", "rigiMunicipalAnios"),
    p("Tasa municipal post exención", b.rigiMunicipalPorMil, "por mil", "rigiMunicipalPorMil"),
    p("Impuesto al cheque a cuenta de Ganancias", b.rigiDebCredActivo ? "Sí" : "No", "", "rigiDebCredActivo"),
    p("% del impuesto al cheque computado", b.rigiDebCredPct, "%", "rigiDebCredPct"),
    p("IVA de inversiones informado (CERTIVA)", b.rigiCertivaActivo ? "Sí" : "No", "", "rigiCertivaActivo"),

    titulo("Otros impuestos y tasas", 4),
    p("Impuesto al cheque (IDyCB)", b.idycbAlicuota, "%", "idycbAlicuota"),
    p("Años para usar el crédito del impuesto al cheque", b.idycbPrescripcion, "años", "idycbPrescripcion"),
    p("Tipo de cambio para la tasa municipal", b.dreiTipoCambio, "ARS/USD", "dreiTipoCambio"),
    p("Tasa municipal mínima por mes", b.dreiMinimoMensualARS, "ARS", "dreiMinimoMensualARS"),
    p("Tasa de edificación, primeros 5 años", b.tasaEdifPrimeros5, "por mil", "tasaEdifPrimeros5"),
    p("Tasa de edificación, desde el año 6", b.tasaEdifPost5, "por mil", "tasaEdifPost5"),

    titulo("Armado de la operación", 4),
    p("Comisión de estructuración", b.structuringFeeUSD, "USD", "structuringFeeUSD"),
    p("Año en que se cobra la comisión", b.anioCobroFee, "año", "anioCobroFee"),
    p("Costo de armar la presentación al RIGI", b.costoEstructuracionARS, "ARS", "costoEstructuracionARS"),
    p("Tipo de cambio promedio", b.tipoCambioPromedio, "ARS/USD", "tipoCambioPromedio"),

    titulo("Puesta en marcha año por año", 4),
    [texto("Año", { fontWeight: "bold" }), texto("Factor", { fontWeight: "bold" })],
    ...b.rampUp.map((v, i) => [numero(b.anioBase + i, "0"), numero(v, FORMATO_DECIMAL)]),
  ];
}

function hojaComunes(esc: Escenario): Celda[][] {
  const total = esc.comunes.reduce((a, c) => a + c.montoAnual, 0);
  return [
    titulo("Costos compartidos entre los tres negocios", 6),
    vacia(),
    [texto("Línea de costo", { fontWeight: "bold" }), texto("Criterio de reparto", { fontWeight: "bold" }),
     texto("Costo por año (USD)", { fontWeight: "bold" }),
     texto("% Agrograneles", { fontWeight: "bold" }), texto("% Fertilizantes", { fontWeight: "bold" }),
     texto("% Cargas generales", { fontWeight: "bold" })],
    ...esc.comunes.map((c) => [
      texto(c.linea), texto(c.driver), numero(c.montoAnual),
      numero(c.pctAGRO, FORMATO_PCT), numero(c.pctFERT, FORMATO_PCT), numero(c.pctCARGAS, FORMATO_PCT),
    ]),
    [texto("TOTAL", { fontWeight: "bold" }), null, numero(total)],
    vacia(),
    titulo("Cómo se reparten las obras compartidas", 6),
    [texto("Negocio", { fontWeight: "bold" }), texto("% que le toca", { fontWeight: "bold" })],
    ...UNIDADES.map((u) => [
      texto(NOMBRE_UNIDAD[u]), numero(esc.asignacionCapexComun[u] ?? 0, FORMATO_PCT),
    ]),
    vacia(),
    titulo("Obras compartidas, año por año (USD MM)", 6),
    [texto("Año", { fontWeight: "bold" }), texto("Inversión", { fontWeight: "bold" })],
    ...esc.capexComun.map((v, i) => [
      numero(esc.base.anioBase + i, "0"), numero(v, FORMATO_DECIMAL),
    ]),
  ];
}

function hojaSocios(esc: Escenario, c: ResultadoConsolidado): Celda[][] {
  return [
    titulo("Socios del proyecto", 6),
    vacia(),
    [texto("Socio", { fontWeight: "bold" }),
     ...UNIDADES.map((u) => texto(`% en ${NOMBRE_UNIDAD[u]}`, { fontWeight: "bold" })),
     texto("% de la comisión que cobra", { fontWeight: "bold" }),
     texto("% de la comisión que desembolsa", { fontWeight: "bold" })],
    ...esc.inversores.map((inv) => [
      texto(inv.nombre),
      ...UNIDADES.map((u) => numero(inv.participaciones[u] ?? 0, FORMATO_PCT)),
      numero(inv.pctFeeRecibe, FORMATO_PCT),
      numero(inv.pctFeeDesembolsa, FORMATO_PCT),
    ]),
    vacia(),
    titulo("Flujo de caja libre repartido por negocio (USD)", 6),
    [texto("Negocio", { fontWeight: "bold" }),
     ...c.anios.map((a) => ({ value: a, type: Number, fontWeight: "bold" } as Celda))],
    ...UNIDADES.map((u) => [
      texto(NOMBRE_UNIDAD[u]),
      ...c.fcffPorUnidad[u].map((v) => numero(v)),
    ]),
    [texto("Consolidado", { fontWeight: "bold" }),
     ...c.fcff.map((v) => numero(v))],
  ];
}

// ---------------------------------------------------------------- armado --

/** Arma las hojas del libro. Separado para poder probarlo sin navegador. */
export function construirHojas(esc: Escenario, c: ResultadoConsolidado, k: KPIs) {
  const anchoAncho = [{ width: 46 }, { width: 18 }, { width: 14 }, { width: 70 }];

  const hojas = [
    { sheet: "Resumen", data: hojaResumen(esc, k, c),
      columns: [{ width: 46 }, { width: 20 }, { width: 70 }] },
    { sheet: "Parámetros", data: hojaParametros(esc), columns: anchoAncho },
    { sheet: "Costos compartidos", data: hojaComunes(esc),
      columns: [{ width: 40 }, { width: 30 }, { width: 18 }, { width: 16 }, { width: 16 }, { width: 18 }] },
    ...UNIDADES.map((u: Unidad) => ({
      sheet: nombreHoja(NOMBRE_UNIDAD[u]),
      data: hojaFlujo(c.anios, filasUnidad(c, u)),
      columns: anchoFlujo(c.anios),
      stickyRowsCount: 1,
      stickyColumnsCount: 1,
    })),
    { sheet: "Flujo consolidado", data: hojaFlujo(c.anios, filasConsolidado(c)),
      columns: anchoFlujo(c.anios), stickyRowsCount: 1, stickyColumnsCount: 1 },
    { sheet: "Socios", data: hojaSocios(esc, c),
      columns: [{ width: 28 }, ...c.anios.map(() => ({ width: 14 }))] },
  ];

  return hojas;
}

export async function exportarExcel(
  esc: Escenario, c: ResultadoConsolidado, k: KPIs, nombreEscenario: string
) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const archivo = writeXlsxFile(construirHojas(esc, c, k) as never);
  await archivo.toFile(`${limpiarNombre(nombreEscenario)}.xlsx`);
}

/** Excel no admite más de 31 caracteres ni : \ / ? * [ ] en el nombre de una hoja. */
function nombreHoja(n: string): string {
  return n.replace(/[:\\/?*[\]]/g, " ").slice(0, 31);
}

function limpiarNombre(n: string): string {
  const base = n.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "Modelo Puerto Timbues";
  const hoy = new Date().toISOString().slice(0, 10);
  return `${base} ${hoy}`;
}
