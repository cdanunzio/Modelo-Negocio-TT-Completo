/**
 * Exportación a Excel: el modelo completo, escrito en fórmulas.
 *
 * El libro no es una foto de resultados. Los únicos números escritos son los
 * datos que alguien carga —toneladas, tarifas, costos, inversión, alícuotas—,
 * marcados en celeste. Todo lo demás (facturación, costos compartidos,
 * depreciación, impuestos con las reglas del RIGI, deuda, flujo, TIR) son
 * fórmulas que referencian esas celdas, así que se puede auditar el esquema
 * fila por fila y cambiar un dato para ver el efecto sin volver a la
 * aplicación.
 */
import {
  Escenario, ResultadoConsolidado, KPIs, UNIDADES, Unidad, NOMBRE_UNIDAD,
} from "./model/types";
import {
  Celda, Hoja, texto, numero, formula, titulo, columna, nombreHoja,
  FORMATO_MONEDA, FORMATO_DECIMAL, FORMATO_PCT, FORMATO_ENTERO, CELESTE,
} from "./excel/celdas";
import { hojaParametros, hojaComunes, ANCHO_PARAMETROS, ANCHO_COMUNES } from "./excel/entradas";
import { hojaUnidad, anchoUnidad } from "./excel/unidad";
import { hojaConsolidado } from "./excel/consolidado";

// ------------------------------------------------------------------ socios --

function hojaSocios(esc: Escenario, anios: number[], P: Hoja, F: Hoja): Hoja {
  const h = new Hoja("Socios");
  const n = anios.length;
  const primera = 1;
  const ultima = primera + n - 1;
  const cols = (j: number) => primera + j;
  const par = (clave: string) => P.externaFija(clave);

  h.agregar(titulo("Socios del proyecto", 7));
  h.agregar([
    texto("Socio", { fontWeight: "bold" }),
    ...UNIDADES.map((u) => texto(`% en ${NOMBRE_UNIDAD[u]}`, { fontWeight: "bold" })),
    texto("% de la comisión que cobra", { fontWeight: "bold" }),
    texto("% de la comisión que desembolsa", { fontWeight: "bold" }),
  ]);
  esc.inversores.forEach((inv, i) => {
    h.agregar([
      texto(inv.nombre, { backgroundColor: CELESTE }),
      ...UNIDADES.map((u) => numero(inv.participaciones[u] ?? 0, FORMATO_PCT, { backgroundColor: CELESTE })),
      numero(inv.pctFeeRecibe, FORMATO_PCT, { backgroundColor: CELESTE }),
      numero(inv.pctFeeDesembolsa, FORMATO_PCT, { backgroundColor: CELESTE }),
    ], `socio.${i}`);
  });
  const ultimoSocio = esc.inversores.length - 1;
  h.agregar([
    texto("TOTAL", { fontWeight: "bold" }),
    ...UNIDADES.map((u, k) =>
      esc.inversores.length
        ? formula(`SUM(${h.rangoVertical("socio.0", `socio.${ultimoSocio}`, 1 + k)})`, FORMATO_PCT,
            { fontWeight: "bold" })
        : numero(0, FORMATO_PCT)),
    ...[4, 5].map((c) =>
      esc.inversores.length
        ? formula(`SUM(${h.rangoVertical("socio.0", `socio.${ultimoSocio}`, c)})`, FORMATO_PCT,
            { fontWeight: "bold" })
        : numero(0, FORMATO_PCT)),
  ], "totalParticipaciones");

  h.blanco();
  h.agregar(titulo("Flujo de fondos por socio (USD) — todo fórmula", n + 2));
  h.agregar([
    texto("Concepto", { fontWeight: "bold" }),
    ...anios.map((a) => ({ value: a, type: Number, fontWeight: "bold", align: "right" } as Celda)),
    texto("Interpretación", { fontWeight: "bold" }),
  ], "anios");

  const anioRef = (j: number) => `${columna(cols(j))}$${h.fila("anios")}`;

  esc.inversores.forEach((inv, i) => {
    const d = (col: number) => `$${columna(col)}$${h.fila(`socio.${i}`)}`;
    h.agregar([
      texto(inv.nombre),
      ...anios.map((_, j) => {
        const delNegocio = UNIDADES
          .map((u, k) => `${d(1 + k)}*${F.externa(`fcffUnidad.${u}`, cols(j))}`)
          .join("+");
        const fee = `IF(${anioRef(j)}=${par("anioCobroFee")},` +
          `(${d(4)}-${d(5)})*${par("structuringFeeUSD")}-${d(4)}*${par("costoEstructuracionUSD")},0)`;
        return formula(`${delNegocio}+${fee}`, FORMATO_MONEDA);
      }),
      texto("Su porcentaje del flujo de cada unidad, más o menos lo que percibe o desembolsa de la comisión.",
        { wrap: true }),
    ], `flujoSocio.${i}`);
  });

  h.agregar([
    texto("Total socios", { fontWeight: "bold" }),
    ...anios.map((_, j) =>
      esc.inversores.length
        ? formula(
            `SUM(${columna(cols(j))}${h.fila("flujoSocio.0")}:${columna(cols(j))}${h.fila(`flujoSocio.${ultimoSocio}`)})`,
            FORMATO_MONEDA, { fontWeight: "bold" })
        : numero(0)),
    texto("Debe coincidir con el flujo del proyecto más la comisión neta del sistema.", { wrap: true }),
  ], "totalSocios");

  h.agregar([
    texto("Flujo libre del proyecto (100%)"),
    ...anios.map((_, j) => formula(F.externa("fcff", cols(j)), FORMATO_MONEDA)),
    texto("Sale de la hoja de flujo consolidado.", { wrap: true }),
  ], "fcffProyecto");

  h.agregar([
    texto("Control (debe dar 0)", { fontStyle: "italic" }),
    ...anios.map((_, j) => {
      const feeSistema = `IF(${anioRef(j)}=${par("anioCobroFee")},` +
        `(${h.ref("totalParticipaciones", 4)}-${h.ref("totalParticipaciones", 5)})*${par("structuringFeeUSD")}` +
        `-${h.ref("totalParticipaciones", 4)}*${par("costoEstructuracionUSD")},0)`;
      return formula(`${h.ref("totalSocios", cols(j))}-(${h.ref("fcffProyecto", cols(j))}+${feeSistema})`,
        FORMATO_MONEDA, { fontStyle: "italic" });
    }),
    texto("Si no da cero, los porcentajes no concilian con el flujo del proyecto.", { wrap: true }),
  ], "control");

  h.blanco();
  h.agregar([texto("Rendimiento de cada socio (TIR)", { fontWeight: "bold" })]);
  esc.inversores.forEach((inv, i) => {
    h.agregar([
      texto(inv.nombre),
      formula(`IFERROR(IRR(${h.rango(`flujoSocio.${i}`, primera, ultima)}),"")`, FORMATO_PCT),
      texto("Sobre su propio flujo: lo que aporta y lo que percibe.", { wrap: true }),
    ]);
  });

  return h;
}

// ----------------------------------------------------------------- resumen --

function hojaResumen(
  esc: Escenario, k: KPIs, anios: number[], F: Hoja, U: Record<Unidad, Hoja>
): Hoja {
  const h = new Hoja("Resumen");
  const primera = 1;
  const ultima = primera + anios.length - 1;

  const fila = (concepto: string, valor: Celda, nota: string) =>
    h.agregar([texto(concepto), valor, texto(nota, { wrap: true })]);

  h.agregar(titulo("Resumen del proyecto", 4));
  h.agregar([
    texto("Indicador", { fontWeight: "bold" }), texto("Valor", { fontWeight: "bold" }),
    texto("Interpretación", { fontWeight: "bold" }),
  ]);

  fila("Rendimiento del proyecto (TIR)",
    formula(F.externa("tirProyecto", 1), FORMATO_PCT),
    "Rendimiento anual en dólares sobre el flujo completo, sin considerar endeudamiento.");
  fila("Rendimiento del accionista (TIR)",
    formula(F.externa("tirSocios", 1), FORMATO_PCT),
    "Rendimiento después del servicio de deuda. Sin deuda cargada no se determina.");
  fila("Inversión total (CAPEX)",
    formula(`-SUM(${F.externaRango("capexTotal", primera, ultima)})`, FORMATO_MONEDA),
    "El capital total a obtener para ejecutar la obra.");
  fila("Año en que se recupera la inversión",
    formula(
      `IFERROR(INDEX(${F.externaRango("anios", primera, ultima)},` +
      `MATCH(TRUE,INDEX(${F.externaRango("fcffAcumulado", primera, ultima)}>0,0),0)),"No recupera")`,
      FORMATO_ENTERO),
    "Ejercicio en que el flujo acumulado se vuelve positivo.");
  fila("Resultado operativo acumulado (EBITDA)",
    formula(`SUM(${F.externaRango("ebitda", primera, ultima)})`, FORMATO_MONEDA),
    "Resultado operativo acumulado de todo el horizonte.");
  fila("Facturación acumulada",
    formula(`SUM(${F.externaRango("ingresosBrutos", primera, ultima)})`, FORMATO_MONEDA),
    "Facturación acumulada de todo el horizonte.");
  fila("Margen operativo",
    formula(
      `IF(SUM(${F.externaRango("ingresosBrutos", primera, ultima)})=0,0,` +
      `SUM(${F.externaRango("ebitda", primera, ultima)})/SUM(${F.externaRango("ingresosBrutos", primera, ultima)}))`,
      FORMATO_PCT),
    "Porcentaje de la facturación que queda como resultado operativo.");
  fila("Toneladas del año pico",
    formula(`MAX(${F.externaRango("toneladasTotales", primera, ultima)})`, FORMATO_MONEDA),
    "Volumen físico operado en el ejercicio de mayor actividad.");
  fila("Ocupación máxima del muelle",
    formula(`MAX(${F.externaRango("ocupacionMuelle", primera, ultima)})`, FORMATO_PCT),
    `Umbral de alerta cargado: ${esc.base.umbralOcupacion}%.`);
  fila("Cobertura mínima del servicio de deuda (DSCR)",
    formula(`IFERROR(MIN(${F.externaRango("dscr", primera, ultima)}),"")`, FORMATO_DECIMAL),
    "El ejercicio de menor cobertura del servicio de deuda. Las entidades financieras suelen exigir 1,30.");
  fila("Inversión por tonelada instalada",
    formula(
      `IF(MAX(${F.externaRango("toneladasTotales", primera, ultima)})=0,0,` +
      `-SUM(${F.externaRango("capexTotal", primera, ultima)})/MAX(${F.externaRango("toneladasTotales", primera, ultima)}))`,
      FORMATO_DECIMAL),
    "Dólares de obra por cada tonelada anual de capacidad instalada.");

  h.blanco();
  h.agregar(titulo("Rendimiento individual de cada unidad de negocio", 4));
  h.agregar([
    texto("Negocio", { fontWeight: "bold" }),
    texto("Rendimiento individual (TIR)", { fontWeight: "bold" }),
    texto("Inversión", { fontWeight: "bold" }),
    texto("Resultado operativo acumulado", { fontWeight: "bold" }),
  ]);
  UNIDADES.forEach((u) => {
    h.agregar([
      texto(NOMBRE_UNIDAD[u]),
      formula(U[u].externa("tir", 1), FORMATO_PCT),
      formula(`-SUM(${U[u].externaRango("capexTotal", primera, ultima)})`, FORMATO_MONEDA),
      formula(`SUM(${U[u].externaRango("ebitda", primera, ultima)})`, FORMATO_MONEDA),
    ]);
  });
  h.agregar([texto(
    "La TIR de cada unidad se determina sobre su propio flujo: la unidad evaluada en forma independiente, con su inversión, sus costos y la porción que le corresponde de los conceptos compartidos.",
    { wrap: true })]);

  h.blanco();
  h.agregar([texto(
    "Todas las celdas de cálculo de este libro son fórmulas. Los datos de entrada están identificados en celeste, en la hoja de Parámetros, en la de Costos compartidos y en el encabezado de cada unidad.",
    { wrap: true })]);
  h.agregar([texto(
    "Los valores son preliminares hasta que los validen Comercial, Operaciones, Ingeniería e Impuestos.",
    { wrap: true })]);

  // Los KPI que calculó la aplicación quedan como referencia de control.
  h.blanco();
  h.agregar(titulo("Control: lo que calculó la aplicación", 4));
  h.agregar([
    texto("Indicador", { fontWeight: "bold" }), texto("Valor de la aplicación", { fontWeight: "bold" }),
    texto("Permite contrastar el resultado de la aplicación con el de la planilla.", { wrap: true }),
  ]);
  h.agregar([texto("Rendimiento del proyecto (TIR)"), numero(k.tirProyecto, FORMATO_PCT)]);
  h.agregar([texto("Inversión total (CAPEX)"), numero(k.capexTotal, FORMATO_MONEDA)]);
  h.agregar([texto("Resultado operativo acumulado (EBITDA)"), numero(k.ebitdaAcumulado, FORMATO_MONEDA)]);
  h.agregar([texto("Ocupación máxima del muelle"), numero(k.ocupacionMaxima, FORMATO_PCT)]);

  return h;
}

// ------------------------------------------------------------------ armado --

/** Arma las hojas del libro. Separado para poder probarlo sin navegador. */
export function construirHojas(esc: Escenario, c: ResultadoConsolidado, k: KPIs) {
  const anios = c.anios;
  const parametros = hojaParametros(esc);
  const comunes = hojaComunes(esc, anios);

  const unidades = {} as Record<Unidad, Hoja>;
  UNIDADES.forEach((u) => {
    unidades[u] = hojaUnidad(u, { esc, anios, parametros, comunes });
  });

  const consolidado = hojaConsolidado({ esc, anios, parametros, unidades });
  const socios = hojaSocios(esc, anios, parametros, consolidado);
  const resumen = hojaResumen(esc, k, anios, consolidado, unidades);

  return [
    { sheet: resumen.nombre, data: resumen.filas,
      columns: [{ width: 46 }, { width: 24 }, { width: 70 }, { width: 28 }] },
    { sheet: parametros.nombre, data: parametros.filas, columns: ANCHO_PARAMETROS },
    { sheet: comunes.nombre, data: comunes.filas, columns: ANCHO_COMUNES },
    ...UNIDADES.map((u) => ({
      sheet: unidades[u].nombre,
      data: unidades[u].filas,
      columns: anchoUnidad(anios),
      stickyRowsCount: 2,
      stickyColumnsCount: 1,
    })),
    { sheet: consolidado.nombre, data: consolidado.filas,
      columns: anchoUnidad(anios), stickyRowsCount: 2, stickyColumnsCount: 1 },
    { sheet: socios.nombre, data: socios.filas,
      columns: [{ width: 30 }, ...anios.map(() => ({ width: 14 })), { width: 60 }] },
  ];
}

export async function exportarExcel(
  esc: Escenario, c: ResultadoConsolidado, k: KPIs, nombreEscenario: string
) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const archivo = writeXlsxFile(construirHojas(esc, c, k) as never);
  await archivo.toFile(`${limpiarNombre(nombreEscenario)}.xlsx`);
}

function limpiarNombre(n: string): string {
  const base = n.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "Modelo Puerto Timbues";
  const hoy = new Date().toISOString().slice(0, 10);
  return `${base} ${hoy}`;
}

export { nombreHoja };
