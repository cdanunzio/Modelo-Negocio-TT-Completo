/**
 * Escenario base. TODOS los valores son PRELIMINARES: sirven para que la
 * aplicacion funcione, no para decidir. Hay que validarlos con Comercial,
 * Operaciones, Ingenieria, Control de Gestion e Impuestos.
 */
import { Escenario, Flujo, TarifasUnidad, Unidad, UnidadInput } from "./types";

const N = 31;
const ANIO_BASE = 2025;
const serieAnual = (pares: Record<number, number> = {}) =>
  Array.from({ length: N }, (_, i) => pares[ANIO_BASE + i] ?? 0);

const tarifasCero = (): TarifasUnidad => {
  const z = { embarque: 0, descarga: 0, calada: 0, usoMuelle: 0, habilitaciones: 0, fumigacionTransile: 0 };
  return { base: { ...z }, tramo1: { ...z }, tramo2: { ...z }, tramo3: { ...z }, tramo4: { ...z } };
};

const tarifasAgro = (): TarifasUnidad => ({
  base:   { embarque: 3.25, descarga: 3.25, calada: 2.8, usoMuelle: 0.5, habilitaciones: 0.1, fumigacionTransile: 0.1 },
  tramo1: { embarque: 2.5,  descarga: 2.5,  calada: 2.8, usoMuelle: 0.5, habilitaciones: 1.1, fumigacionTransile: 0.1 },
  tramo2: { embarque: 1.75, descarga: 1.75, calada: 2.8, usoMuelle: 0.5, habilitaciones: 1.1, fumigacionTransile: 0.1 },
  tramo3: { embarque: 1.25, descarga: 1.25, calada: 2.8, usoMuelle: 0.5, habilitaciones: 1.1, fumigacionTransile: 0.1 },
  tramo4: { embarque: 1,    descarga: 1,    calada: 2.8, usoMuelle: 0.5, habilitaciones: 1.1, fumigacionTransile: 0.1 },
});

const f = (
  id: string, gate: Flujo["gate"], carga: string, modo: Flujo["modo"], forma: Flujo["forma"],
  almacenaje: Flujo["almacenaje"], anioInicio: number, volAnio1: number, tasaCrecimiento: number,
  tope: number, m: number, e: number, h: number, a: number, cal: number
): Flujo => ({
  id, gate, carga, modo, forma, almacenaje, anioInicio, volAnio1, tasaCrecimiento, tope,
  tarifaMuelle: m, tarifaEstibaje: e, tarifaManipuleo: h, tarifaAlmacenaje: a, tarifaCalada: cal,
});

const FLUJOS: Record<Unidad, Flujo[]> = {
  AGRO: [
    f("agro-1", "outbound", "granos", "buque", "solido granel", "elevador", 2027, 2000000, 10, 3000000, 0.4255, 0.5, 8.5, 0.5, 2.8),
    f("agro-2", "inbound", "granos", "camion", "solido granel", "elevador", 2027, 2000000, 10, 3000000, 0, 3.25, 0, 0, 0),
    f("agro-3", "outbound", "granos", "barcaza", "solido granel", "elevador", 2028, 150000, 10, 400000, 0.1, 10, 8.5, 0.5, 0),
  ],
  FERT: [
    f("fert-1", "inbound", "fertilizantes", "buque", "solido granel", "warehouse", 2028, 700000, 20, 1500000, 0.666, 12, 7, 10, 0),
    f("fert-2", "inbound", "UAN", "buque", "liquido", "tanque", 2028, 45000, 5, 80000, 0.444, 3, 3, 16, 0),
    f("fert-3", "inbound", "aceite vegetal", "barcaza", "liquido", "tanque", 2028, 50000, 10, 100000, 0.444, 6, 3, 8, 0),
    f("fert-4", "outbound", "fertilizantes", "barcaza", "solido granel", "warehouse", 2028, 100000, 20, 250000, 0.1, 7, 4, 10, 0),
    f("fert-5", "outbound", "aceite vegetal", "buque", "liquido", "tanque", 2028, 140000, 15, 300000, 0.444, 3, 3, 8, 0),
    f("fert-6", "outbound", "SBO", "buque", "liquido", "tanque", 2028, 50000, 0, 50000, 0.444, 3, 3, 8, 0),
    f("fert-7", "tranship", "fertilizantes", "trasbordo", "solido granel", "directo", 2029, 100000, 10, 200000, 0.666, 8, 0, 0, 0),
  ],
  CARGAS: [
    f("carg-1", "inbound", "soda ash / baritina", "buque", "solido granel", "warehouse", 2028, 340000, 15, 700000, 0.666, 12, 7, 10, 0),
    f("carg-2", "inbound", "acero", "buque", "break bulk", "warehouse", 2028, 40000, 5, 60000, 0.666, 18, 4, 10, 0),
    f("carg-3", "inbound", "iron ore", "barcaza", "solido granel", "plazoleta", 2028, 500000, 25, 1200000, 0.05, 6, 2, 2, 0),
    f("carg-4", "outbound", "iron ore", "buque", "solido granel", "plazoleta", 2028, 500000, 25, 1200000, 0.4255, 5, 2, 2, 0),
    f("carg-5", "outbound", "acero", "barcaza", "break bulk", "warehouse", 2028, 20000, 5, 30000, 0.1, 15, 4, 10, 0),
    f("carg-6", "outbound", "subprod. vegetales", "buque", "solido granel", "warehouse", 2028, 50000, 15, 200000, 1, 3.8, 5, 10, 0),
    f("carg-7", "tranship", "bobinas de acero", "trasbordo", "break bulk", "directo", 2029, 20000, 5, 40000, 2.22, 8, 0, 0, 0),
  ],
};

const opexVarAgro = () => {
  const o: Record<number, number> = {};
  for (let a = 2033; a <= 2055; a++) o[a] = a === 2033 ? 1.42 : 1.32;
  return o;
};

const unidad = (p: Partial<UnidadInput> & Pick<UnidadInput, "metodoTarifa" | "anioInicioOp">): UnidadInput => ({
  capacidadMax: 0, takeOrPay: 0, capexNoDepreciable: 0, opexFijoMM: 0, opexInicialMM: 0,
  opexVariable: 0, otrosIngresos: 0, canonFijoActivo: false, canonFijoMM: 0,
  canonVariableActivo: false, canonVariable: 0, canonPctActivo: false, canonPct: 0,
  parcelaMedia: 0, rendimientoDia: 0, tiempoNoOperativo: 0, diasFijosRecalada: 0,
  volumenObjetivo: 0, incrementoAnual: 0, anioInicioIncremento: 2099, topeVolumen: 0,
  volumenDuenio: 0, limiteTramo1: 1500000, limiteTramo2: 2250000, limiteTramo3: 3000000,
  metodoCalada: 1, caladaPct: 0, valorCarga: 0,
  flujos: [], tarifas: tarifasCero(),
  capexAnual: serieAnual(), volumenManual: serieAnual(), opexVarOverride: serieAnual(),
  ...p,
});

export function escenarioBase(): Escenario {
  return {
    base: {
      anioBase: ANIO_BASE, horizonte: 30, anioInicioOpProyecto: 2027,
      tasaImpuestoGeneral: 35, vidaUtilDepreciacion: 30,
      montoDeudaMM: 0, tasaDeuda: 0, plazoDeuda: 0,
      diasOperativos: 308, sitiosAtraque: 3, umbralOcupacion: 70, tasasEnFCFF: true,
      rigiActivo: true, rigiAnioInicio: 2027, rigiTasaImpuesto: 25,
      rigiAmortAcelerada: true, rigiPctVidaUtil: 60,
      rigiIIBBAnios: 10, rigiIIBBPct: 5,
      rigiMunicipalAnios: 10, rigiMunicipalPorMil: 5.5,
      rigiDebCredActivo: true, rigiDebCredPct: 1.2, rigiCertivaActivo: true,
      idycbAlicuota: 1.2, idycbPrescripcion: 5,
      dreiTipoCambio: 0, dreiMinimoMensualARS: 0,
      tasaEdifPrimeros5: 3, tasaEdifPost5: 5,
      rampUp: new Array(N).fill(1),
      structuringFeeUSD: 10000000, anioCobroFee: ANIO_BASE,
      costoEstructuracionARS: 0, tipoCambioPromedio: 0,
    },
    comunes: [
      { id: "c1", linea: "Dragado de mantenimiento", driver: "Ocupación de muelle", montoAnual: 500000, pctAGRO: 0.6, pctFERT: 0.2, pctCARGAS: 0.2 },
      { id: "c2", linea: "Mantenimiento de muelle y amarres", driver: "Ocupación de muelle", montoAnual: 125000, pctAGRO: 0.6, pctFERT: 0.2, pctCARGAS: 0.2 },
      { id: "c3", linea: "Energía de áreas comunes", driver: "Toneladas", montoAnual: 200000, pctAGRO: 0.6, pctFERT: 0.25, pctCARGAS: 0.15 },
      { id: "c4", linea: "RRHH de estructura", driver: "% fijo", montoAnual: 400000, pctAGRO: 0.5, pctFERT: 0.3, pctCARGAS: 0.2 },
      { id: "c5", linea: "Seguros", driver: "% fijo", montoAnual: 150000, pctAGRO: 0.5, pctFERT: 0.3, pctCARGAS: 0.2 },
      { id: "c6", linea: "Vigilancia y subcontratos", driver: "% fijo", montoAnual: 250000, pctAGRO: 0.5, pctFERT: 0.3, pctCARGAS: 0.2 },
      { id: "c7", linea: "Accesos, gate y balanzas", driver: "Toneladas", montoAnual: 120000, pctAGRO: 0.6, pctFERT: 0.25, pctCARGAS: 0.15 },
      { id: "c8", linea: "IT y sistemas", driver: "% fijo", montoAnual: 80000, pctAGRO: 0.5, pctFERT: 0.3, pctCARGAS: 0.2 },
    ],
    capexComun: serieAnual(),
    asignacionCapexComun: { AGRO: 0.5, FERT: 0.25, CARGAS: 0.25 },
    unidades: {
      AGRO: unidad({
        metodoTarifa: 2, anioInicioOp: 2027, capacidadMax: 6000000,
        opexFijoMM: 0, opexInicialMM: 1.5, opexVariable: 1.58, otrosIngresos: 0.5,
        parcelaMedia: 27000, rendimientoDia: 20000, tiempoNoOperativo: 15, diasFijosRecalada: 0.5,
        volumenObjetivo: 300000, incrementoAnual: 300000, anioInicioIncremento: 2033,
        topeVolumen: 3000000, volumenDuenio: 2500000,
        metodoCalada: 2, caladaPct: 1.2, valorCarga: 233,
        flujos: FLUJOS.AGRO, tarifas: tarifasAgro(),
        capexAnual: serieAnual({ 2025: 18.81, 2026: 34.51, 2027: 36.76, 2028: 20.12, 2029: 5.5 }),
        volumenManual: serieAnual({ 2027: 300000, 2028: 700000, 2029: 1200000, 2030: 2000000, 2031: 2500000, 2032: 2500000 }),
        opexVarOverride: serieAnual(opexVarAgro()),
      }),
      FERT: unidad({
        metodoTarifa: 1, anioInicioOp: 2028, capacidadMax: 1000000,
        opexFijoMM: 4, opexInicialMM: 0.5, opexVariable: 2.5,
        parcelaMedia: 20000, rendimientoDia: 8000, tiempoNoOperativo: 20, diasFijosRecalada: 0.5,
        flujos: FLUJOS.FERT,
        capexAnual: serieAnual({ 2026: 8, 2027: 24, 2028: 20 }),
      }),
      CARGAS: unidad({
        metodoTarifa: 1, anioInicioOp: 2028, capacidadMax: 500000,
        opexFijoMM: 2, opexInicialMM: 0.3, opexVariable: 2,
        parcelaMedia: 15000, rendimientoDia: 5000, tiempoNoOperativo: 10, diasFijosRecalada: 0.5,
        flujos: FLUJOS.CARGAS,
        capexAnual: serieAnual({ 2027: 6, 2028: 8, 2029: 4 }),
      }),
    },
    inversores: [
      { id: "i1", nombre: "TyS", participacion: 0.55, pctFeeRecibe: 1, pctFeeDesembolsa: 0 },
      { id: "i2", nombre: "AFA", participacion: 0.15, pctFeeRecibe: 0, pctFeeDesembolsa: 1 / 3 },
      { id: "i3", nombre: "AMAGI", participacion: 0.15, pctFeeRecibe: 0, pctFeeDesembolsa: 1 / 3 },
      { id: "i4", nombre: "UNIÓN AGRÍCOLA", participacion: 0.15, pctFeeRecibe: 0, pctFeeDesembolsa: 1 / 3 },
    ],
  };
}
