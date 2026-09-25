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

/**
 * Con `--con-obras` la inversión de cada unidad se carga como lista de obras en
 * lugar de un importe por año. El resultado tiene que ser exactamente el mismo:
 * si cambia algo, es que el SUMIF de la planilla o el motor no coinciden.
 */
const conObras = process.argv.includes("--con-obras");
const esc = escenarioBase();
if (conObras) {
  UNIDADES.forEach((u: Unidad) => {
    const unidad = esc.unidades[u];
    unidad.obras = unidad.capexAnual
      .map((montoMM, i) => ({ montoMM, anio: esc.base.anioBase + i }))
      .filter((x) => x.montoMM > 0)
      .map((x) => ({ id: `${u}-${x.anio}`, nombre: `Obra ${x.anio}`, ...x }));
  });
}
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
  fila(h, "Toneladas potenciales sin restricción de capacidad", r.toneladasTeoricas);
  fila(h, "Toneladas efectivamente operadas", r.toneladasEfectivas);
  fila(h, "Proporción de la demanda atendida", r.factorUtilizacion);
  fila(h, "Tarifa de uso de muelle (USD/tn)", r.tarifaMuelle);
  fila(h, "Tarifa de carga y descarga (USD/tn)", r.tarifaEstibaje);
  fila(h, "Tarifa de manipuleo (USD/tn)", r.tarifaManipuleo);
  fila(h, "Tarifa de almacenaje (USD/tn)", r.tarifaAlmacenaje);
  fila(h, "Tarifa de calada y otros derechos (USD/tn)", r.tarifaCalada);
  fila(h, "TARIFA TOTAL POR TONELADA (USD/tn)", r.tarifaTotal);
  fila(h, "Facturación por uso de muelle", r.ingresosMuelle);
  fila(h, "Facturación por carga y descarga", r.ingresosEstibaje);
  fila(h, "Facturación por manipuleo", r.ingresosManipuleo);
  fila(h, "Facturación por almacenaje", r.ingresosAlmacenaje);
  fila(h, "Facturación por calada y otros derechos", r.ingresosCalada);
  fila(h, "Facturación por otros conceptos", r.ingresosOtros);
  fila(h, "FACTURACIÓN DE LA UNIDAD", r.ingresosBrutos);
  fila(h, "Costo fijo directo", r.opexFijo);
  fila(h, "Costo variable unitario (USD/tn)", r.opexVariableUnitario);
  fila(h, "Costo variable total", r.opexVariable);
  fila(h, "Costo directo total", r.opexDirecto);
  fila(h, "Costos compartidos asignados", r.opexComun);
  fila(h, "Costo operativo total", r.opexTotal);
  fila(h, "Derecho de uso portuario", r.canonTotal);
  fila(h, "GANANCIA OPERATIVA (EBITDA)", r.ebitda);
  fila(h, "Inversión directa", r.capexDirecto);
  fila(h, "Obras compartidas asignadas", r.capexComun);
  fila(h, "INVERSIÓN TOTAL DEL AÑO", r.capexTotal);
  fila(h, "Base depreciable acumulada", r.baseDepreciable);
  fila(h, "Depreciación del año", r.depreciacion);
  fila(h, "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", r.ebit);
  fila(h, "[Informativo] Impuesto como sociedad independiente", r.impuestoStandalone);
  fila(h, "[Informativo] Resultado después de ese impuesto", r.nopatStandalone);
  fila(h, "FLUJO DE CAJA DE LA UNIDAD (EVALUACIÓN INDEPENDIENTE)", r.fcffStandalone);
  fila(h, "Flujo acumulado", r.fcffAcumulado);
  fila(h, "Recaladas por año", r.recaladas);
  fila(h, "Ocupación del muelle", r.ocupacionMuelle);
  fila(h, "RENDIMIENTO DE LA UNIDAD EN FORMA INDEPENDIENTE (TIR)", [tir(r.fcffStandalone)]);
});

const F = "Flujo consolidado";
fila(F, "TONELADAS TOTALES", c.toneladasTotales);
fila(F, "FACTURACIÓN TOTAL", c.ingresosBrutos);
fila(F, "Costos operativos (OPEX)", c.opexTotal);
fila(F, "Derecho de uso portuario", c.canonTotal);
fila(F, "GANANCIA OPERATIVA (EBITDA)", c.ebitda);
fila(F, "Depreciación de la inversión", c.depreciacion);
fila(F, "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", c.ebit);
fila(F, "INVERSIÓN TOTAL DEL AÑO (CAPEX)", c.capexTotal);
fila(F, "Impuesto al cheque pagado (IDyCB)", c.idycbPagado);
fila(F, "Impuesto a las Ganancias determinado", c.impuestoDeterminado);
fila(F, "[Informativo] Ahorro por exención de Ingresos Brutos", c.memoAhorroIIBB);
fila(F, "[Informativo] Ahorro por exención municipal", c.memoAhorroMunicipal);
fila(F, "Impuesto al cheque computado a cuenta", c.ahorroDebCred);
fila(F, "Impuesto al cheque recuperado", c.idycbRecuperado);
fila(F, "Impuesto a las Ganancias a pagar", c.impuestoNeto);
fila(F, "Tasa municipal de Timbúes (DREI)", c.drei);
fila(F, "Tasa de edificación y movimiento de tierra", c.tasaEdificacion);
fila(F, "[Informativo] IVA de las inversiones (CERTIVA)", c.memoIVAInversiones);
fila(F, "RESULTADO OPERATIVO DESPUÉS DE IMPUESTOS (NOPAT)", c.nopat);
fila(F, "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)", c.fcff);
fila(F, "Desembolso del préstamo", c.deudaDesembolso);
fila(F, "Intereses del préstamo", c.deudaIntereses);
fila(F, "Amortización del capital", c.deudaAmortizacion);
fila(F, "Saldo de la deuda", c.deudaSaldo);
fila(F, "Escudo fiscal de los intereses", c.escudoFiscal);
fila(F, "FLUJO PARA LOS ACCIONISTAS (FCFE)", c.fcfe);
fila(F, "Servicio de la deuda (capital + intereses)", c.servicioDeuda);
fila(F, "Flujo del proyecto acumulado", c.fcffAcumulado);
fila(F, "Flujo para los accionistas acumulado", c.fcfeAcumulado);
fila(F, "OCUPACIÓN DEL MUELLE", c.ocupacionMuelle);
fila(F, "RENDIMIENTO DEL PROYECTO (TIR)", [k.tirProyecto]);
UNIDADES.forEach((u: Unidad) => {
  const corto = u === "AGRO" ? "agrograneles" : u === "FERT" ? "fertilizantes y líquidos" : "cargas generales";
  fila(F, `Toneladas de ${corto}`, c.porUnidad[u].toneladasEfectivas);
  fila(F, `Facturación de ${corto}`, c.porUnidad[u].ingresosBrutos);
  fila(F, `Inversión en ${corto}`, c.porUnidad[u].capexTotal);
  fila(F, `   Flujo que corresponde a ${corto}`, c.fcffPorUnidad[u]);
});

fila("Resumen", "Rendimiento del proyecto (TIR)", [k.tirProyecto]);
fila("Resumen", "Inversión total (CAPEX)", [k.capexTotal]);
fila("Resumen", "Resultado operativo acumulado (EBITDA)", [k.ebitdaAcumulado]);
fila("Resumen", "Facturación acumulada", [k.ingresosAcumulados]);
fila("Resumen", "Margen operativo", [k.margenEbitda]);
fila("Resumen", "Toneladas del año pico", [k.toneladasMaximas]);
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
