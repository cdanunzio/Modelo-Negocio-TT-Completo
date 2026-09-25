/**
 * Modelo de negocio - Terminal Portuaria Timbues.
 * Tipos del escenario. Un escenario es un objeto JSON serializable:
 * es lo que se guarda en Supabase y lo que se versiona.
 */

export const UNIDADES = ["AGRO", "FERT", "CARGAS"] as const;
export type Unidad = (typeof UNIDADES)[number];

export const NOMBRE_UNIDAD: Record<Unidad, string> = {
  AGRO: "Agrograneles",
  FERT: "Fertilizantes y líquidos",
  CARGAS: "Cargas generales y minerales",
};

/** Un flujo comercial: una carga que entra o sale, con sus cinco tarifas. */
export interface Flujo {
  id: string;
  gate: "inbound" | "outbound" | "tranship";
  carga: string;
  modo: "buque" | "barcaza" | "camion" | "trasbordo";
  forma: "solido granel" | "break bulk" | "liquido";
  almacenaje: "warehouse" | "plazoleta" | "tanque" | "elevador" | "directo";
  anioInicio: number;
  volAnio1: number;
  tasaCrecimiento: number; // % anual
  tope: number; // 0 = sin tope
  tarifaMuelle: number;
  tarifaEstibaje: number;
  tarifaManipuleo: number;
  tarifaAlmacenaje: number;
  tarifaCalada: number;
}

/** Tarifas escalonadas por volumen (método 2). Seis conceptos por tramo. */
export interface TarifaEscalonada {
  embarque: number;
  descarga: number;
  calada: number;
  usoMuelle: number;
  habilitaciones: number;
  fumigacionTransile: number;
}

export interface TarifasUnidad {
  base: TarifaEscalonada;
  tramo1: TarifaEscalonada;
  tramo2: TarifaEscalonada;
  tramo3: TarifaEscalonada;
  tramo4: TarifaEscalonada;
}

/**
 * Una obra propia de un negocio: el muelle de fertilizantes, un silo, una cinta.
 *
 * Es el detalle de la inversión directa. Se carga como lista para que quede
 * asentado qué compone la inversión de cada año en lugar de un único importe
 * sin respaldo. Una obra que se desembolsa en varios ejercicios se carga como
 * varios renglones, uno por año.
 */
export interface ObraUnidad {
  id: string;
  nombre: string;
  montoMM: number; // USD MM
  anio: number;
}

export interface UnidadInput {
  metodoTarifa: 1 | 2;
  anioInicioOp: number;
  capacidadMax: number; // 0 = sin tope
  takeOrPay: number;
  capexNoDepreciable: number; // USD MM
  opexFijoMM: number; // USD MM/año
  opexInicialMM: number; // USD MM por única vez
  opexVariable: number; // USD/tn
  otrosIngresos: number; // USD/tn
  canonFijoActivo: boolean;
  canonFijoMM: number;
  canonVariableActivo: boolean;
  canonVariable: number;
  canonPctActivo: boolean;
  canonPct: number;

  // ocupación de muelle
  parcelaMedia: number; // tn por recalada
  rendimientoDia: number; // tn/día
  tiempoNoOperativo: number; // %
  diasFijosRecalada: number;

  // método 2: proyección de volumen y tramos
  volumenObjetivo: number;
  incrementoAnual: number;
  anioInicioIncremento: number;
  topeVolumen: number;
  volumenDuenio: number;
  limiteTramo1: number;
  limiteTramo2: number;
  limiteTramo3: number;
  metodoCalada: 1 | 2;
  caladaPct: number;
  valorCarga: number;

  flujos: Flujo[];
  tarifas: TarifasUnidad;

  /**
   * Obras propias del negocio. Con la lista cargada, la inversión de cada año
   * sale de sumar las obras de ese año y `capexAnual` deja de editarse a mano.
   * Con la lista vacía manda `capexAnual`, que es como estaba antes.
   */
  obras: ObraUnidad[];

  /** series anuales, largo = horizonte */
  capexAnual: number[]; // USD MM
  volumenManual: number[]; // tn, 0 = usar proyección
  opexVarOverride: number[]; // USD/tn, 0 = usar el general
}

/**
 * La inversión directa de cada año de una unidad.
 *
 * Es el único lugar donde se decide si manda la lista de obras o el importe
 * cargado a mano. Lo usan el motor, la pantalla y la exportación a Excel, así
 * que los tres muestran siempre lo mismo.
 */
export function capexAnualDe(u: UnidadInput, anioBase: number, n: number): number[] {
  if (!u.obras?.length) {
    return Array.from({ length: n }, (_, i) => u.capexAnual[i] ?? 0);
  }
  const serie = new Array(n).fill(0);
  for (const o of u.obras) {
    const i = o.anio - anioBase;
    if (i >= 0 && i < n) serie[i] += o.montoMM;
  }
  return serie;
}

export interface CostoComun {
  id: string;
  linea: string;
  driver: string;
  montoAnual: number; // USD/año
  pctAGRO: number;
  pctFERT: number;
  pctCARGAS: number;
}

/**
 * Un socio del proyecto. Puede participar en una sola unidad de negocio o en
 * varias, y con un porcentaje distinto en cada una: es habitual que un socio
 * entre fuerte en agrograneles y con una participación menor en fertilizantes.
 * Los porcentajes se expresan en tanto por uno (0,55 = 55%).
 */
export interface Inversor {
  id: string;
  nombre: string;
  /** Participación en cada unidad de negocio. 0 = no participa. */
  participaciones: Record<Unidad, number>;
  pctFeeRecibe: number;
  pctFeeDesembolsa: number;
}

export interface BaseInput {
  anioBase: number;
  horizonte: number; // cantidad de columnas - 1
  anioInicioOpProyecto: number;
  tasaImpuestoGeneral: number; // %
  vidaUtilDepreciacion: number; // años
  montoDeudaMM: number;
  tasaDeuda: number; // %
  plazoDeuda: number; // años
  diasOperativos: number;
  sitiosAtraque: number;
  umbralOcupacion: number; // %
  tasasEnFCFF: boolean;

  // RIGI
  rigiActivo: boolean;
  rigiAnioInicio: number;
  rigiTasaImpuesto: number; // %
  rigiAmortAcelerada: boolean;
  rigiPctVidaUtil: number; // %
  rigiIIBBAnios: number;
  rigiIIBBPct: number; // %
  rigiMunicipalAnios: number;
  rigiMunicipalPorMil: number;
  rigiDebCredActivo: boolean;
  rigiDebCredPct: number; // %
  rigiCertivaActivo: boolean;

  // otros tributos
  idycbAlicuota: number; // %
  idycbPrescripcion: number; // años
  dreiTipoCambio: number; // ARS/USD
  dreiMinimoMensualARS: number;
  tasaEdifPrimeros5: number; // por mil
  tasaEdifPost5: number; // por mil

  rampUp: number[]; // factor por año

  // transacción
  structuringFeeUSD: number;
  anioCobroFee: number;
  costoEstructuracionARS: number;
  tipoCambioPromedio: number;
}

export interface Escenario {
  base: BaseInput;
  comunes: CostoComun[];
  capexComun: number[]; // USD MM por año
  asignacionCapexComun: Record<Unidad, number>;
  unidades: Record<Unidad, UnidadInput>;
  inversores: Inversor[];
}

/** Resultado del cálculo de una unidad: una serie por concepto. */
export interface ResultadoUnidad {
  toneladasTeoricas: number[];
  toneladasEfectivas: number[];
  factorUtilizacion: number[];
  tarifaMuelle: number[];
  tarifaEstibaje: number[];
  tarifaManipuleo: number[];
  tarifaAlmacenaje: number[];
  tarifaCalada: number[];
  tarifaOtros: number[];
  tarifaTotal: number[];
  ingresosMuelle: number[];
  ingresosEstibaje: number[];
  ingresosManipuleo: number[];
  ingresosAlmacenaje: number[];
  ingresosCalada: number[];
  ingresosOtros: number[];
  ingresosBrutos: number[];
  opexFijo: number[];
  opexVariableUnitario: number[];
  opexVariable: number[];
  opexDirecto: number[];
  opexComun: number[];
  opexTotal: number[];
  canonFijo: number[];
  canonVariable: number[];
  canonPct: number[];
  canonTotal: number[];
  ebitda: number[];
  capexDirecto: number[];
  capexComun: number[];
  capexTotal: number[];
  baseDepreciable: number[];
  depreciacion: number[];
  ebit: number[];
  impuestoStandalone: number[];
  nopatStandalone: number[];
  fcffStandalone: number[];
  fcffAcumulado: number[];
  ocupacionMuelle: number[];
  recaladas: number[];
  detalleFlujos: { flujo: Flujo; toneladas: number[] }[];
}

export interface ResultadoConsolidado {
  anios: number[];
  porUnidad: Record<Unidad, ResultadoUnidad>;
  toneladasTotales: number[];
  ingresosBrutos: number[];
  opexTotal: number[];
  canonTotal: number[];
  ebitda: number[];
  depreciacion: number[];
  ebit: number[];
  idycbPagado: number[];
  idycbRecuperado: number[];
  drei: number[];
  tasaEdificacion: number[];
  impuestoDeterminado: number[];
  memoAhorroIIBB: number[];
  memoAhorroMunicipal: number[];
  ahorroDebCred: number[];
  impuestoNeto: number[];
  memoIVAInversiones: number[];
  nopat: number[];
  capexTotal: number[];
  fcff: number[];
  deudaDesembolso: number[];
  deudaIntereses: number[];
  deudaAmortizacion: number[];
  deudaSaldo: number[];
  escudoFiscal: number[];
  fcfe: number[];
  servicioDeuda: number[];
  dscr: (number | null)[];
  fcffAcumulado: number[];
  fcfeAcumulado: number[];
  ocupacionMuelle: number[];
  fcffSinUnidad: Record<Unidad, number[]>;
  /**
   * El flujo de fondos libre consolidado repartido entre las unidades. Cada
   * unidad se lleva lo suyo (ingresos, costos, inversión) y los conceptos que
   * solo existen a nivel proyecto — el impuesto a las ganancias, las tasas — se
   * prorratean. La suma de las tres unidades da exactamente el flujo consolidado.
   * Es la base para determinar cuánto le corresponde a cada inversor.
   */
  fcffPorUnidad: Record<Unidad, number[]>;
}

export interface KPIs {
  tirProyecto: number | null;
  tirAccionista: number | null;
  capexTotal: number;
  paybackAnio: number | null;
  dscrMinimo: number | null;
  toneladasMaximas: number;
  ocupacionMaxima: number;
  ebitdaAcumulado: number;
  ingresosAcumulados: number;
  margenEbitda: number;
  capexPorToneladaInstalada: number;
}
