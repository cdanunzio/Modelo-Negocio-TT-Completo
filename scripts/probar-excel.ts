import writeXlsxFile from "write-excel-file/node";
import { escenarioBase } from "@/lib/model/defaults";
import { calcular, kpis } from "@/lib/model/engine";
import { construirHojas } from "@/lib/excel";

const esc = escenarioBase();
const c = calcular(esc);
const k = kpis(esc, c);
const hojas = construirHojas(esc, c, k);

console.log("Hojas:", hojas.map((h) => `${h.sheet} (${h.data.length} filas)`).join("\n       "));

const salida = writeXlsxFile(hojas as never) as unknown as {
  toFile: (p: string) => Promise<void>;
};
salida
  .toFile("/tmp/claude-0/-home-claude/edc0a1ea-0add-592d-a406-4a8723b92eab/scratchpad/prueba.xlsx")
  .then(() => console.log("\nArchivo escrito."))
  .catch((e: unknown) => { console.error("FALLO:", e); process.exit(1); });
