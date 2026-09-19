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
import {
  filasConsolidado, filasUnidad, recalcularConFormula, OpcionesFilas,
} from "../src/lib/filas";

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
let difReparto = 0;
for (let i = 0; i < n; i++) {
  difReparto += Math.abs(c.fcff[i] - UNIDADES.reduce((a, u) => a + c.fcffPorUnidad[u][i], 0));
}
chequear("El flujo repartido entre negocios suma el consolidado", difReparto < 1,
  `diferencia ${difReparto.toFixed(2)}`);
const partes = UNIDADES.map((u) =>
  esc.inversores.reduce((a, inv) => a + (inv.participaciones[u] ?? 0), 0));
chequear("Cada negocio reparte el 100% entre socios",
  partes.every((p) => Math.abs(p - 1) < 1e-4),
  partes.map((p, j) => `${UNIDADES[j]} ${pct(p)}`).join(" · "));

// Las filas derivadas se exportan al Excel como fórmula. Acá se comprueba que
// esa fórmula, aplicada sobre las mismas filas, da lo mismo que el motor: si
// alguien cambia el cálculo y no la fórmula, este chequeo lo marca.
const opciones: OpcionesFilas = {
  tasaImpuesto: esc.base.rigiActivo ? esc.base.rigiTasaImpuesto : esc.base.tasaImpuestoGeneral,
  tasasEnFCFF: esc.base.tasasEnFCFF,
};
const hojas = [
  { nombre: "Consolidado", filas: filasConsolidado(c, opciones) },
  ...UNIDADES.map((u) => ({ nombre: u, filas: filasUnidad(c, u, opciones) })),
];
let conFormula = 0;
const rotas: string[] = [];
for (const hoja of hojas) {
  for (const f of hoja.filas) {
    if (!f.formula) continue;
    conFormula++;
    const rec = recalcularConFormula(hoja.filas, f);
    if (!rec) { rotas.push(`${hoja.nombre}: ${f.etiqueta} (referencia inexistente)`); continue; }
    const escala = Math.max(1, ...f.valores.map((v) => Math.abs((v as number) ?? 0)));
    const peor = Math.max(...f.valores.map((v, i) =>
      Math.abs(((v as number) ?? 0) - (rec[i] ?? 0))));
    if (peor > escala * 1e-9 + 1e-6) {
      rotas.push(`${hoja.nombre}: ${f.etiqueta} (difiere ${peor.toFixed(2)})`);
    }
  }
}
chequear("Las fórmulas del Excel reproducen el motor", rotas.length === 0,
  rotas.length === 0 ? `${conFormula} filas con fórmula` : rotas.slice(0, 3).join(" | "));

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
