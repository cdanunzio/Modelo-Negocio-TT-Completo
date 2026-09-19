/**
 * Control del Excel exportado.
 *
 * Genera el libro, lo deja en un archivo y escribe al lado un JSON con lo que
 * calculó el motor para cada fila y cada año. Después `verificar-excel.py`
 * recalcula el libro con LibreOffice y compara celda por celda: si una fórmula
 * no reproduce el motor, el chequeo falla y se ve exactamente en qué hoja y en
 * qué año.
 *
 * Corre con: npm run check:excel
 */
import { writeFileSync } from "node:fs";
import writeXlsxFile from "write-excel-file/node";
import { escenarioBase } from "../src/lib/model/defaults";
import { calcular, kpis, tir } from "../src/lib/model/engine";
import { UNIDADES, NOMBRE_UNIDAD, Unidad } from "../src/lib/model/types";
import { construirHojas, nombreHoja } from "../src/lib/excel";

const salida = process.argv[2] ?? "/tmp/modelo.xlsx";
const esc = escenarioBase();
const c = calcular(esc);
const k = kpis(esc, c);
const hojas = construirHojas(esc, c, k);

/** Lo que debería dar cada fila del libro, según el motor. */
interface Esperado {
  hoja: string;
  concepto: string;
  valores: (number | null)[];
}

const esperado: Esperado[] = [];
const fila = (hoja: string, concepto: string, valores: (number | null)[]) =>
  esperado.push({ hoja, concepto, valores });

UNIDADES.forEach((u: Unidad) => {
  const h = nombreHoja(NOMBRE_UNIDAD[u]);
  const r = c.porUnidad[u];
  fila(h, "Toneladas posibles sin límite de instalaciones", r.toneladasTeoricas);
  fila(h, "Toneladas que realmente se mueven", r.toneladasEfectivas);
  fila(h, "Qué proporción de la demanda entra", r.factorUtilizacion);
  fila(h, "Precio por usar el muelle (USD/tn)", r.tarifaMuelle);
  fila(h, "Precio de carga y descarga (USD/tn)", r.tarifaEstibaje);
  fila(h, "Precio de manipuleo (USD/tn)", r.tarifaManipuleo);
  fila(h, "Precio de almacenaje (USD/tn)", r.tarifaAlmacenaje);
  fila(h, "Precio de calada y otros derechos (USD/tn)", r.tarifaCalada);
  fila(h, "PRECIO TOTAL POR TONELADA (USD/tn)", r.tarifaTotal);
  fila(h, "Facturación por uso de muelle", r.ingresosMuelle);
  fila(h, "Facturación por carga y descarga", r.ingresosEstibaje);
  fila(h, "Facturación por manipuleo", r.ingresosManipuleo);
  fila(h, "Facturación por almacenaje", r.ingresosAlmacenaje);
  fila(h, "Facturación por calada y otros derechos", r.ingresosCalada);
  fila(h, "Otra facturación", r.ingresosOtros);
  fila(h, "FACTURACIÓN DEL NEGOCIO", r.ingresosBrutos);
  fila(h, "Costo fijo propio", r.opexFijo);
  fila(h, "Costo por tonelada (USD/tn)", r.opexVariableUnitario);
  fila(h, "Costo variable total", r.opexVariable);
  fila(h, "Costo propio total", r.opexDirecto);
  fila(h, "Parte de los costos compartidos", r.opexComun);
  fila(h, "Costo de operación total", r.opexTotal);
  fila(h, "Derecho de uso portuario", r.canonTotal);
  fila(h, "GANANCIA OPERATIVA (EBITDA)", r.ebitda);
  fila(h, "Inversión propia", r.capexDirecto);
  fila(h, "Parte de las obras compartidas", r.capexComun);
  fila(h, "INVERSIÓN TOTAL DEL AÑO", r.capexTotal);
  fila(h, "Inversión acumulada que se deprecia", r.baseDepreciable);
  fila(h, "Depreciación del año", r.depreciacion);
  fila(h, "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", r.ebit);
  fila(h, "[Informativo] Impuesto si fuera una empresa aparte", r.impuestoStandalone);
  fila(h, "[Informativo] Ganancia después de ese impuesto", r.nopatStandalone);
  fila(h, "FLUJO DE CAJA DEL NEGOCIO POR SEPARADO", r.fcffStandalone);
  fila(h, "Flujo acumulado", r.fcffAcumulado);
  fila(h, "Buques por año", r.recaladas);
  fila(h, "Ocupación del muelle", r.ocupacionMuelle);
  fila(h, "RENDIMIENTO DEL NEGOCIO POR SEPARADO (TIR)", [tir(r.fcffStandalone)]);
});

const F = "Flujo consolidado";
fila(F, "TONELADAS TOTALES", c.toneladasTotales);
fila(F, "FACTURACIÓN TOTAL", c.ingresosBrutos);
fila(F, "Costos de operación (OPEX)", c.opexTotal);
fila(F, "Derecho de uso portuario", c.canonTotal);
fila(F, "GANANCIA OPERATIVA (EBITDA)", c.ebitda);
fila(F, "Depreciación de la inversión", c.depreciacion);
fila(F, "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", c.ebit);
fila(F, "INVERSIÓN TOTAL DEL AÑO (CAPEX)", c.capexTotal);
fila(F, "Impuesto al cheque pagado (IDyCB)", c.idycbPagado);
fila(F, "Impuesto a las Ganancias determinado", c.impuestoDeterminado);
fila(F, "[Informativo] Ahorro por exención de Ingresos Brutos", c.memoAhorroIIBB);
fila(F, "[Informativo] Ahorro por exención municipal", c.memoAhorroMunicipal);
fila(F, "Impuesto al cheque tomado a cuenta", c.ahorroDebCred);
fila(F, "Impuesto al cheque recuperado", c.idycbRecuperado);
fila(F, "Impuesto a las Ganancias a pagar", c.impuestoNeto);
fila(F, "Tasa municipal de Timbúes (DREI)", c.drei);
fila(F, "Tasa de edificación y movimiento de tierra", c.tasaEdificacion);
fila(F, "[Informativo] IVA de las inversiones (CERTIVA)", c.memoIVAInversiones);
fila(F, "GANANCIA DESPUÉS DE IMPUESTOS (NOPAT)", c.nopat);
fila(F, "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)", c.fcff);
fila(F, "Préstamo recibido", c.deudaDesembolso);
fila(F, "Intereses del préstamo", c.deudaIntereses);
fila(F, "Devolución del capital", c.deudaAmortizacion);
fila(F, "Saldo de la deuda", c.deudaSaldo);
fila(F, "Ahorro de impuesto por los intereses", c.escudoFiscal);
fila(F, "FLUJO PARA LOS SOCIOS (FCFE)", c.fcfe);
fila(F, "Cuota total del préstamo", c.servicioDeuda);
fila(F, "Flujo del proyecto acumulado", c.fcffAcumulado);
fila(F, "Flujo para los socios acumulado", c.fcfeAcumulado);
fila(F, "OCUPACIÓN DEL MUELLE", c.ocupacionMuelle);
fila(F, "RENDIMIENTO DEL PROYECTO (TIR)", [k.tirProyecto]);
UNIDADES.forEach((u: Unidad) => {
  const corto = u === "AGRO" ? "agrograneles" : u === "FERT" ? "fertilizantes" : "cargas generales";
  fila(F, `Toneladas de ${corto}`, c.porUnidad[u].toneladasEfectivas);
  fila(F, `Facturación de ${corto}`, c.porUnidad[u].ingresosBrutos);
  fila(F, `Inversión en ${corto}`, c.porUnidad[u].capexTotal);
  fila(F, `   del cual, ${corto}`, c.fcffPorUnidad[u]);
});

fila("Resumen", "Rendimiento del proyecto (TIR)", [k.tirProyecto]);
fila("Resumen", "Inversión total (CAPEX)", [k.capexTotal]);
fila("Resumen", "Ganancia operativa acumulada (EBITDA)", [k.ebitdaAcumulado]);
fila("Resumen", "Facturación acumulada", [k.ingresosAcumulados]);
fila("Resumen", "Margen operativo", [k.margenEbitda]);
fila("Resumen", "Toneladas del mejor año", [k.toneladasMaximas]);
fila("Resumen", "Ocupación máxima del muelle", [k.ocupacionMaxima]);
fila("Resumen", "Inversión por tonelada instalada", [k.capexPorToneladaInstalada]);
UNIDADES.forEach((u: Unidad) =>
  fila("Resumen", NOMBRE_UNIDAD[u], [tir(c.porUnidad[u].fcffStandalone)]));

writeFileSync(salida.replace(/\.xlsx$/, "") + ".esperado.json",
  JSON.stringify({ anios: c.anios, filas: esperado }, null, 1), "utf-8");

const libro = writeXlsxFile(hojas as never) as unknown as { toFile: (p: string) => Promise<void> };
libro.toFile(salida)
  .then(() => console.log(`Libro escrito en ${salida} (${esperado.length} filas a controlar).`))
  .catch((e: unknown) => { console.error("FALLO al escribir:", e); process.exit(1); });
