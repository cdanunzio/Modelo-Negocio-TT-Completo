/**
 * Verificación del motor de cálculo.
 * Corre con: npm run check
 *
 * Contrasta los resultados contra los valores validados y corre los mismos
 * chequeos de integridad que muestra la aplicación.
 *
 * NOTA sobre la TIR: la planilla Excel daba 15,01%. La diferencia viene de una
 * corrección: cuando un año no tiene volumen manual cargado, la planilla volvía
 * al volumen objetivo inicial y las toneladas se desplomaban de un año al otro
 * (agrograneles caía de 2.500.000 en 2032 a 600.000 en 2033). Acá se arrastra el
 * último volumen manual y se le suma el incremento, que es la curva correcta.
 * Si algo de esto falla, el motor cambió y hay que revisar por qué.
 */
import { escenarioBase } from "../src/lib/model/defaults";
import { calcular, kpis, tir } from "../src/lib/model/engine";
import { UNIDADES } from "../src/lib/model/types";

const esc = escenarioBase();
const c = calcular(esc);
const k = kpis(esc, c);

const pct = (v: number | null) => (v === null ? "-" : (v * 100).toFixed(2) + "%");
const mm = (v: number) => (v / 1e6).toFixed(1) + " MM";
let fallas = 0;

function chequear(nombre: string, ok: boolean, detalle: string) {
  if (!ok) fallas++;
  console.log(`  ${ok ? "OK  " : "FALLA"} ${nombre.padEnd(42)} ${detalle}`);
}

console.log("\n=== CONTRASTE CONTRA LA PLANILLA VALIDADA ===");
chequear("TIR del proyecto", Math.abs((k.tirProyecto ?? 0) - 0.1655) < 0.002,
  `${pct(k.tirProyecto)} (esperado 16,55%)`);
chequear("CAPEX total", Math.abs(k.capexTotal - 185700000) < 1000,
  `${mm(k.capexTotal)} (esperado 185,7 MM)`);
chequear("Ocupación máxima de muelle", Math.abs(k.ocupacionMaxima - 0.5856) < 0.002,
  `${pct(k.ocupacionMaxima)} (esperado 58,56%)`);
chequear("Toneladas máximas", k.toneladasMaximas === 4500000,
  `${k.toneladasMaximas.toLocaleString("es-AR")} (esperado 4.500.000)`);
chequear("Payback", k.paybackAnio === 2034, `${k.paybackAnio} (esperado 2034)`);

console.log("\n=== INTEGRIDAD DEL CÁLCULO ===");
const n = c.anios.length;
let difTn = 0, difEbitda = 0;
for (let i = 0; i < n; i++) {
  difTn += Math.abs(c.toneladasTotales[i] - UNIDADES.reduce((a, u) => a + c.porUnidad[u].toneladasEfectivas[i], 0));
  difEbitda += Math.abs(c.ebitda[i] - (c.ingresosBrutos[i] - c.opexTotal[i] - c.canonTotal[i]));
}
chequear("Toneladas: consolidado = suma de unidades", difTn < 1, `diferencia ${difTn.toFixed(2)}`);
chequear("EBITDA = Ingresos - OPEX - Canon", difEbitda < 1, `diferencia ${difEbitda.toFixed(2)}`);
chequear("Impuesto a las Ganancias nunca negativo", Math.min(...c.impuestoNeto) >= 0,
  `mínimo ${Math.min(...c.impuestoNeto).toFixed(0)}`);
const pagado = -c.idycbPagado.reduce((a, v) => a + v, 0);
const recuperado = c.idycbRecuperado.reduce((a, v) => a + v, 0);
chequear("IDyCB recuperado <= pagado", recuperado <= pagado + 0.01,
  `${mm(recuperado)} de ${mm(pagado)}`);
chequear("Ocupación bajo el umbral", k.ocupacionMaxima <= esc.base.umbralOcupacion / 100,
  `${pct(k.ocupacionMaxima)} vs ${esc.base.umbralOcupacion}%`);
chequear("Los ahorros RIGI no superan el impuesto",
  !c.anios.some((_, i) => c.ahorroDebCred[i] > c.impuestoDeterminado[i] + 0.01), "");

console.log("\n=== APORTE DE CADA UNIDAD ===");
UNIDADES.forEach((u) => {
  const t = tir(c.fcffSinUnidad[u]);
  const aporte = t !== null && k.tirProyecto !== null ? ((k.tirProyecto - t) * 100).toFixed(2) : "-";
  console.log(`  ${u.padEnd(8)} TIR standalone ${pct(tir(c.porUnidad[u].fcffStandalone)).padStart(8)}` +
    `   aporte al proyecto ${aporte.padStart(7)} pts`);
});

console.log(fallas === 0
  ? "\nTodo en orden.\n"
  : `\n${fallas} chequeo(s) fallaron: revisar el motor antes de publicar.\n`);
process.exit(fallas === 0 ? 0 : 1);
