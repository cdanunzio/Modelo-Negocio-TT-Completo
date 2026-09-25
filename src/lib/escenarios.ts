import { Escenario } from "./model/types";

export interface EscenarioFila {
  id: string;
  nombre: string;
  descripcion: string | null;
  version: number;
  es_base: boolean;
  publico: boolean;
  token_publico: string | null;
  actualizado_en: string;
  actualizado_por: string | null;
  perfil?: { nombre: string | null; email: string } | null;
}

export interface VersionFila {
  id: number;
  version: number;
  comentario: string | null;
  cambios: Cambio[] | null;
  kpis: Record<string, number | null> | null;
  creado_en: string;
  perfil?: { nombre: string | null; email: string } | null;
}

export interface Cambio {
  campo: string;
  etiqueta: string;
  antes: unknown;
  despues: unknown;
}

/** Compara dos escenarios y devuelve la lista de campos que cambiaron. */
export function diffEscenarios(antes: Escenario, despues: Escenario): Cambio[] {
  const cambios: Cambio[] = [];
  const visitar = (a: unknown, b: unknown, ruta: string) => {
    if (a === b) return;
    const sonObjetos =
      a && b && typeof a === "object" && typeof b === "object" &&
      !Array.isArray(a) && !Array.isArray(b);
    if (sonObjetos) {
      const claves = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
      claves.forEach((k) =>
        visitar((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k],
          ruta ? `${ruta}.${k}` : k)
      );
      return;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (JSON.stringify(a) === JSON.stringify(b)) return;
      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i++) visitar(a[i], b[i], `${ruta}[${i}]`);
      return;
    }
    cambios.push({ campo: ruta, etiqueta: etiquetar(ruta), antes: a, despues: b });
  };
  visitar(antes, despues, "");
  return cambios;
}

const DICCIONARIO: Record<string, string> = {
  "base.anioBase": "Año base del modelo",
  "base.horizonte": "Horizonte",
  "base.anioInicioOpProyecto": "Año de inicio de operación del proyecto",
  "base.tasaImpuestoGeneral": "Tasa de Ganancias general",
  "base.vidaUtilDepreciacion": "Vida útil de depreciación",
  "base.montoDeudaMM": "Monto de deuda",
  "base.tasaDeuda": "Tasa de deuda",
  "base.plazoDeuda": "Plazo de deuda",
  "base.diasOperativos": "Días operativos del año",
  "base.sitiosAtraque": "Sitios de atraque",
  "base.umbralOcupacion": "Umbral de ocupación de muelle",
  "base.tasasEnFCFF": "Incluir tasas e IDyCB en el FCFF",
  "base.rigiActivo": "RIGI activo",
  "base.rigiTasaImpuesto": "Tasa de Ganancias RIGI",
  "base.rigiAmortAcelerada": "Amortización acelerada RIGI",
  "base.rigiPctVidaUtil": "% de vida útil acelerada",
  "base.dreiTipoCambio": "Tipo de cambio para el DREI",
  "base.dreiMinimoMensualARS": "DREI mínimo mensual",
  "base.structuringFeeUSD": "Structuring Fee",
};

function etiquetar(ruta: string): string {
  if (DICCIONARIO[ruta]) return DICCIONARIO[ruta];
  const m = ruta.match(/^unidades\.(\w+)\.(\w+)(?:\[(\d+)\])?/);
  if (m) {
    const [, un, campo, idx] = m;
    const nombres: Record<string, string> = {
      capacidadMax: "Capacidad máxima", opexFijoMM: "OPEX fijo", opexVariable: "OPEX variable",
      anioInicioOp: "Año de inicio de operación", metodoTarifa: "Método de tarifa",
      volumenDuenio: "Volumen del titular", parcelaMedia: "Parcela media",
      rendimientoDia: "Rendimiento por día", capexAnual: "CAPEX anual",
      volumenManual: "Volumen manual", opexVarOverride: "OPEX variable por año",
      otrosIngresos: "Otros ingresos", topeVolumen: "Tope de volumen",
      obras: "Obras propias",
    };
    const etq = nombres[campo] ?? campo;
    return idx !== undefined ? `${un} · ${etq} (año ${idx})` : `${un} · ${etq}`;
  }
  if (ruta.startsWith("comunes")) return "Costos comunes · " + ruta.split(".").slice(-1)[0];
  if (ruta.startsWith("inversores")) {
    const partes = ruta.split(".");
    const ultimo = partes[partes.length - 1];
    if (partes.includes("participaciones")) {
      const nombreUn: Record<string, string> = {
        AGRO: "Agrograneles", FERT: "Fertilizantes y líquidos", CARGAS: "Cargas generales",
      };
      return `Socios · participación en ${nombreUn[ultimo] ?? ultimo}`;
    }
    const etq: Record<string, string> = {
      nombre: "nombre",
      pctFeeRecibe: "% de la comisión que cobra",
      pctFeeDesembolsa: "% de la comisión que desembolsa",
    };
    return "Socios · " + (etq[ultimo] ?? ultimo);
  }
  if (ruta.startsWith("capexComun")) return "CAPEX común " + ruta;
  if (ruta.startsWith("asignacionCapexComun")) return "Asignación de CAPEX común · " + ruta.split(".").pop();
  return ruta;
}
