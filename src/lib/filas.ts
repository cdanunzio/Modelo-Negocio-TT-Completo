import { ResultadoConsolidado, Unidad, UNIDADES, NOMBRE_UNIDAD } from "./model/types";

/**
 * Las filas del flujo de fondos, definidas una sola vez.
 *
 * Las usa la pantalla de Flujo de fondos y también la exportación a Excel, así
 * que el Excel y la pantalla siempre dicen exactamente lo mismo.
 */
export interface Fila {
  etiqueta: string;
  valores: number[] | (number | null)[];
  formato?: "usd" | "pct" | "num";
  /** Fila de resultado, se destaca. */
  clave?: boolean;
  /** Fila informativa: no forma parte del flujo de caja. */
  memo?: boolean;
  ayuda: string;
  /**
   * Cómo se deriva esta fila de las otras. La pantalla no la usa: sirve para
   * que el Excel exporte la fórmula en vez del número, y para que el control
   * del modelo verifique que la fórmula reproduce lo que calcula el motor.
   */
  formula?: Formula;
}

/** Un término de una combinación lineal: una fila por un coeficiente. */
export interface Termino {
  fila: string;
  factor?: number;
}

export type Formula =
  /** Suma de filas con signo: EBITDA = facturación − costos − derecho de uso. */
  | { op: "lineal"; de: Termino[] }
  /** Igual que la lineal, pero nunca negativa: el impuesto no puede dar menos de cero. */
  | { op: "maxCero"; de: Termino[] }
  /** Fila por fila, celda a celda: toneladas × precio. */
  | { op: "producto"; de: [string, string] }
  /** División celda a celda, vacía si el divisor no es positivo. */
  | { op: "division"; de: [string, string] }
  /** Acumulado horizontal de otra fila. */
  | { op: "acumulado"; de: string };

/** Datos del escenario que hacen falta para escribir las fórmulas. */
export interface OpcionesFilas {
  /** Alícuota del impuesto a las ganancias que aplica, en %. */
  tasaImpuesto: number;
  /** Si las tasas y el impuesto al cheque se restan del flujo libre. */
  tasasEnFCFF: boolean;
}

const CORTO: Record<Unidad, string> = {
  AGRO: "agrograneles",
  FERT: "fertilizantes",
  CARGAS: "cargas generales",
};

export function filasConsolidado(c: ResultadoConsolidado, o: OpcionesFilas): Fila[] {
  const tn = UNIDADES.map((u) => ({ fila: `Toneladas de ${CORTO[u]}` }));
  const fact = UNIDADES.map((u) => ({ fila: `Facturación de ${CORTO[u]}` }));
  const inv = UNIDADES.map((u) => ({ fila: `Inversión en ${CORTO[u]}` }));
  const tasasDelFlujo: Termino[] = o.tasasEnFCFF
    ? [
        { fila: "Impuesto al cheque pagado (IDyCB)" },
        { fila: "Tasa municipal de Timbúes (DREI)" },
        { fila: "Tasa de edificación y movimiento de tierra" },
      ]
    : [];

  return [
    ...UNIDADES.map((u) => ({
      etiqueta: `Toneladas de ${CORTO[u]}`, valores: c.porUnidad[u].toneladasEfectivas,
      ayuda: `Toneladas que efectivamente opera ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "TONELADAS TOTALES", valores: c.toneladasTotales, clave: true,
      formula: { op: "lineal", de: tn },
      ayuda: "El volumen físico operado por la terminal en el ejercicio." },

    ...UNIDADES.map((u) => ({
      etiqueta: `Facturación de ${CORTO[u]}`, valores: c.porUnidad[u].ingresosBrutos,
      ayuda: `Facturación de ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "FACTURACIÓN TOTAL", valores: c.ingresosBrutos, clave: true,
      formula: { op: "lineal", de: fact },
      ayuda: "El total de ingresos por la prestación de servicios, antes de deducir concepto alguno." },

    { etiqueta: "Costos operativos (OPEX)", valores: c.opexTotal,
      ayuda: "El costo total de operar la terminal: los costos directos de cada unidad más los compartidos." },
    { etiqueta: "Derecho de uso portuario", valores: c.canonTotal,
      ayuda: "El canon que las tres unidades abonan al concedente por operar en el predio." },
    { etiqueta: "GANANCIA OPERATIVA (EBITDA)", valores: c.ebitda, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FACTURACIÓN TOTAL" },
        { fila: "Costos operativos (OPEX)", factor: -1 },
        { fila: "Derecho de uso portuario", factor: -1 },
      ] },
      ayuda: "El resultado que genera la operación, antes de la inversión y los impuestos. Es el indicador que evalúa una entidad financiera." },

    { etiqueta: "Depreciación de la inversión", valores: c.depreciacion,
      ayuda: "Imputación contable del desgaste de lo invertido. No constituye una erogación, pero reduce la base imponible." },
    { etiqueta: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", valores: c.ebit, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA OPERATIVA (EBITDA)" },
        { fila: "Depreciación de la inversión", factor: -1 },
      ] },
      ayuda: "Resultado operativo menos depreciación. Sobre este importe se determina el impuesto." },

    { etiqueta: "Impuesto al cheque pagado (IDyCB)", valores: c.idycbPagado,
      ayuda: "Grava cada acreditación y cada débito de la cuenta. Se estima sobre los movimientos de la inversión." },
    { etiqueta: "Impuesto al cheque recuperado", valores: c.idycbRecuperado,
      ayuda: "La porción computable a cuenta del impuesto a las ganancias. Dentro del RIGI se computa el 100%." },
    { etiqueta: "Tasa municipal de Timbúes (DREI)", valores: c.drei,
      ayuda: "Por mil sobre la facturación, con un importe mínimo mensual en pesos. Exenta durante la vigencia del RIGI." },
    { etiqueta: "Tasa de edificación y movimiento de tierra", valores: c.tasaEdificacion,
      ayuda: "Tasa municipal sobre el monto de obra de cada ejercicio." },
    { etiqueta: "Impuesto a las Ganancias determinado", valores: c.impuestoDeterminado,
      formula: { op: "maxCero", de: [
        { fila: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", factor: o.tasaImpuesto / 100 },
      ] },
      ayuda: `Base imponible por la alícuota (${o.tasaImpuesto}%). Nunca negativo: si el ejercicio arroja quebranto, es cero.` },
    { etiqueta: "[Informativo] Ahorro por exención de Ingresos Brutos", valores: c.memoAhorroIIBB, memo: true,
      ayuda: "El importe que se habría abonado sin la exención. No constituye un ingreso: es un concepto que no se eroga. No integra el flujo." },
    { etiqueta: "[Informativo] Ahorro por exención municipal", valores: c.memoAhorroMunicipal, memo: true,
      ayuda: "Se aplica el mismo criterio que en el renglón anterior." },
    { etiqueta: "Impuesto al cheque computado a cuenta", valores: c.ahorroDebCred,
      ayuda: "Nunca puede exceder el impuesto determinado del ejercicio." },
    { etiqueta: "Impuesto a las Ganancias a pagar", valores: c.impuestoNeto,
      formula: { op: "maxCero", de: [
        { fila: "Impuesto a las Ganancias determinado" },
        { fila: "Impuesto al cheque computado a cuenta", factor: -1 },
        { fila: "Impuesto al cheque recuperado", factor: -1 },
      ] },
      ayuda: "El importe que efectivamente se abona. Este sí constituye una erogación." },
    { etiqueta: "[Informativo] IVA de las inversiones (CERTIVA)", valores: c.memoIVAInversiones, memo: true,
      ayuda: "Constituye crédito fiscal, no costo: se recupera. Computarlo como costo es el error más frecuente. No afecta el flujo." },
    { etiqueta: "RESULTADO OPERATIVO DESPUÉS DE IMPUESTOS (NOPAT)", valores: c.nopat, clave: true,
      formula: { op: "lineal", de: [
        { fila: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)" },
        { fila: "Impuesto a las Ganancias a pagar", factor: -1 },
      ] },
      ayuda: "Resultado operativo después del impuesto, con independencia de la estructura de financiamiento." },

    ...UNIDADES.map((u) => ({
      etiqueta: `Inversión en ${CORTO[u]}`, valores: c.porUnidad[u].capexTotal,
      ayuda: `Inversión asignada a ${NOMBRE_UNIDAD[u]} en ese ejercicio.`,
    })),
    { etiqueta: "INVERSIÓN TOTAL DEL AÑO (CAPEX)", valores: c.capexTotal, clave: true,
      formula: { op: "lineal", de: inv },
      ayuda: "La inversión total de la terminal en ese ejercicio. La suma de la fila es el capital total a obtener." },

    { etiqueta: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)", valores: c.fcff, clave: true,
      formula: { op: "lineal", de: [
        { fila: "RESULTADO OPERATIVO DESPUÉS DE IMPUESTOS (NOPAT)" },
        { fila: "Depreciación de la inversión" },
        { fila: "INVERSIÓN TOTAL DEL AÑO (CAPEX)" },
        ...tasasDelFlujo,
      ] },
      ayuda: "La fila central del modelo: sobre ella se determina el rendimiento del proyecto." },

    ...UNIDADES.map((u) => ({
      etiqueta: `   Flujo que corresponde a ${CORTO[u]}`, valores: c.fcffPorUnidad[u], memo: true,
      ayuda: `La porción del flujo libre que corresponde a ${NOMBRE_UNIDAD[u]}. Las tres filas totalizan el flujo consolidado.`,
    })),

    { etiqueta: "Desembolso del préstamo", valores: c.deudaDesembolso,
      ayuda: "Los fondos que ingresan al tomarse el préstamo." },
    { etiqueta: "Intereses del préstamo", valores: c.deudaIntereses,
      ayuda: "Los intereses devengados por el préstamo en cada ejercicio." },
    { etiqueta: "Amortización del capital", valores: c.deudaAmortizacion,
      ayuda: "Amortización del capital prestado, en cuotas iguales." },
    { etiqueta: "Saldo de la deuda", valores: c.deudaSaldo,
      ayuda: "El saldo adeudado al cierre de cada ejercicio." },
    { etiqueta: "Escudo fiscal de los intereses", valores: c.escudoFiscal,
      ayuda: "Los intereses son deducibles del impuesto a las ganancias: ese ahorro es el beneficio fiscal del endeudamiento." },
    { etiqueta: "FLUJO PARA LOS ACCIONISTAS (FCFE)", valores: c.fcfe, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)" },
        { fila: "Desembolso del préstamo" },
        { fila: "Intereses del préstamo" },
        { fila: "Amortización del capital" },
        { fila: "Escudo fiscal de los intereses" },
      ] },
      ayuda: "El remanente después de atender el servicio de deuda. Sin endeudamiento, coincide con el flujo del proyecto." },
    { etiqueta: "Servicio de la deuda (capital + intereses)", valores: c.servicioDeuda,
      formula: { op: "lineal", de: [
        { fila: "Intereses del préstamo", factor: -1 },
        { fila: "Amortización del capital", factor: -1 },
      ] },
      ayuda: "Intereses más amortización de capital." },
    { etiqueta: "Cobertura del servicio de deuda (DSCR)", valores: c.dscr, formato: "num",
      formula: { op: "division", de: ["GANANCIA OPERATIVA (EBITDA)", "Servicio de la deuda (capital + intereses)"] },
      ayuda: "Cuántas veces el resultado operativo cubre el servicio de deuda. Las entidades financieras suelen exigir 1,30." },

    { etiqueta: "Flujo del proyecto acumulado", valores: c.fcffAcumulado,
      formula: { op: "acumulado", de: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)" },
      ayuda: "El ejercicio en que se vuelve positivo es el de recupero de la inversión." },
    { etiqueta: "Flujo para los accionistas acumulado", valores: c.fcfeAcumulado,
      formula: { op: "acumulado", de: "FLUJO PARA LOS ACCIONISTAS (FCFE)" },
      ayuda: "El mismo cálculo, desde la perspectiva de los accionistas." },
    { etiqueta: "OCUPACIÓN DEL MUELLE", valores: c.ocupacionMuelle, formato: "pct", clave: true,
      ayuda: "Si supera el umbral, el volumen comprometido no resulta físicamente absorbible: corresponde ampliar el muelle o rechazar carga." },
  ];
}

export function filasUnidad(c: ResultadoConsolidado, u: Unidad, o: OpcionesFilas): Fila[] {
  const r = c.porUnidad[u];
  const TN = "Toneladas efectivamente operadas";
  const RUBROS: { precio: string; facturacion: string }[] = [
    { precio: "Tarifa de uso de muelle (USD/tn)", facturacion: "Facturación por uso de muelle" },
    { precio: "Tarifa de carga y descarga (USD/tn)", facturacion: "Facturación por carga y descarga" },
    { precio: "Tarifa de manipuleo (USD/tn)", facturacion: "Facturación por manipuleo" },
    { precio: "Tarifa de almacenaje (USD/tn)", facturacion: "Facturación por almacenaje" },
    { precio: "Tarifa de calada y otros derechos (USD/tn)", facturacion: "Facturación por calada y otros derechos" },
    { precio: "Otros ingresos por tonelada (USD/tn)", facturacion: "Facturación por otros conceptos" },
  ];

  return [
    { etiqueta: "Toneladas potenciales sin restricción de capacidad", valores: r.toneladasTeoricas,
      ayuda: "El volumen que podría operarse si la instalación no tuviera límite de capacidad." },
    { etiqueta: "Toneladas efectivamente operadas", valores: r.toneladasEfectivas, clave: true,
      ayuda: "Las anteriores, limitadas por la capacidad de la instalación." },
    { etiqueta: "Proporción de la demanda atendida", valores: r.factorUtilizacion, formato: "num",
      ayuda: "1,00 indica que se atiende la totalidad de la demanda. Un valor menor implica rechazo de carga por falta de capacidad." },

    { etiqueta: "Tarifa de uso de muelle (USD/tn)", valores: r.tarifaMuelle, formato: "num",
      ayuda: "La tarifa que se factura al cliente por el uso del muelle." },
    { etiqueta: "Tarifa de carga y descarga (USD/tn)", valores: r.tarifaEstibaje, formato: "num",
      ayuda: "La operación de carga o descarga del buque." },
    { etiqueta: "Tarifa de manipuleo (USD/tn)", valores: r.tarifaManipuleo, formato: "num",
      ayuda: "El movimiento de la mercadería dentro del predio." },
    { etiqueta: "Tarifa de almacenaje (USD/tn)", valores: r.tarifaAlmacenaje, formato: "num",
      ayuda: "El almacenamiento de la mercadería. Resulta de los dólares por mes divididos por la rotación." },
    { etiqueta: "Tarifa de calada y otros derechos (USD/tn)", valores: r.tarifaCalada, formato: "num",
      ayuda: "Servicios adicionales prestados al buque." },
    { etiqueta: "Otros ingresos por tonelada (USD/tn)", valores: r.tarifaOtros, formato: "num",
      ayuda: "Conceptos no comprendidos en los cinco rubros anteriores." },
    { etiqueta: "TARIFA TOTAL POR TONELADA (USD/tn)", valores: r.tarifaTotal, formato: "num", clave: true,
      formula: { op: "lineal", de: RUBROS.map((x) => ({ fila: x.precio })) },
      ayuda: "La tarifa de venta de esta unidad, considerando todos los servicios." },

    { etiqueta: "Facturación por uso de muelle", valores: r.ingresosMuelle,
      formula: { op: "producto", de: [TN, RUBROS[0].precio] },
      ayuda: "Toneladas por la tarifa de muelle." },
    { etiqueta: "Facturación por carga y descarga", valores: r.ingresosEstibaje,
      formula: { op: "producto", de: [TN, RUBROS[1].precio] },
      ayuda: "Toneladas por la tarifa de estibaje." },
    { etiqueta: "Facturación por manipuleo", valores: r.ingresosManipuleo,
      formula: { op: "producto", de: [TN, RUBROS[2].precio] },
      ayuda: "Toneladas por la tarifa de manipuleo." },
    { etiqueta: "Facturación por almacenaje", valores: r.ingresosAlmacenaje,
      formula: { op: "producto", de: [TN, RUBROS[3].precio] },
      ayuda: "Toneladas por la tarifa de almacenaje." },
    { etiqueta: "Facturación por calada y otros derechos", valores: r.ingresosCalada,
      formula: { op: "producto", de: [TN, RUBROS[4].precio] },
      ayuda: "Toneladas por la tarifa de calada." },
    { etiqueta: "Facturación por otros conceptos", valores: r.ingresosOtros,
      formula: { op: "producto", de: [TN, RUBROS[5].precio] },
      ayuda: "Toneladas por los otros ingresos unitarios." },
    { etiqueta: "FACTURACIÓN DE LA UNIDAD", valores: r.ingresosBrutos, clave: true,
      formula: { op: "lineal", de: RUBROS.map((x) => ({ fila: x.facturacion })) },
      ayuda: "La facturación total del ejercicio." },

    { etiqueta: "Costo fijo directo", valores: r.opexFijo,
      ayuda: "El costo que se devenga en todos los ejercicios, cualquiera sea el volumen." },
    { etiqueta: "Costo variable unitario (USD/tn)", valores: r.opexVariableUnitario, formato: "num",
      ayuda: "El costo de operar cada tonelada adicional." },
    { etiqueta: "Costo variable total", valores: r.opexVariable,
      formula: { op: "producto", de: [TN, "Costo variable unitario (USD/tn)"] },
      ayuda: "Toneladas por el costo variable unitario." },
    { etiqueta: "Costo directo total", valores: r.opexDirecto,
      formula: { op: "lineal", de: [{ fila: "Costo fijo directo" }, { fila: "Costo variable total" }] },
      ayuda: "El costo total de operar esta unidad, sin considerar los conceptos compartidos." },
    { etiqueta: "Costos compartidos asignados", valores: r.opexComun,
      ayuda: "La porción que le corresponde de los costos que benefician a las tres unidades." },
    { etiqueta: "Costo operativo total", valores: r.opexTotal,
      formula: { op: "lineal", de: [
        { fila: "Costo directo total" }, { fila: "Costos compartidos asignados" },
      ] },
      ayuda: "El costo directo más la porción asignada de los costos compartidos." },
    { etiqueta: "Derecho de uso portuario", valores: r.canonTotal,
      ayuda: "El canon que esta unidad abona al concedente por operar en el predio." },
    { etiqueta: "GANANCIA OPERATIVA (EBITDA)", valores: r.ebitda, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FACTURACIÓN DE LA UNIDAD" },
        { fila: "Costo operativo total", factor: -1 },
        { fila: "Derecho de uso portuario", factor: -1 },
      ] },
      ayuda: "El resultado que genera esta unidad con su operación." },

    { etiqueta: "Inversión directa", valores: r.capexDirecto,
      ayuda: "La inversión atribuible exclusivamente a esta unidad." },
    { etiqueta: "Obras compartidas asignadas", valores: r.capexComun,
      ayuda: "La porción que le corresponde de las obras que benefician a más de una unidad." },
    { etiqueta: "INVERSIÓN TOTAL DEL AÑO", valores: r.capexTotal, clave: true,
      formula: { op: "lineal", de: [
        { fila: "Inversión directa" }, { fila: "Obras compartidas asignadas" },
      ] },
      ayuda: "La inversión total que le corresponde en ese ejercicio." },
    { etiqueta: "Base depreciable acumulada", valores: r.baseDepreciable,
      ayuda: "La inversión acumulada hasta ese ejercicio, neta de los bienes no depreciables como el terreno." },
    { etiqueta: "Depreciación del año", valores: r.depreciacion,
      ayuda: "Imputación contable del desgaste. No constituye una erogación." },
    { etiqueta: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", valores: r.ebit, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA OPERATIVA (EBITDA)" },
        { fila: "Depreciación del año", factor: -1 },
      ] },
      ayuda: "Resultado operativo menos depreciación." },

    { etiqueta: "[Informativo] Impuesto como sociedad independiente", valores: r.impuestoStandalone,
      memo: true,
      formula: { op: "maxCero", de: [
        { fila: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)", factor: o.tasaImpuesto / 100 },
      ] },
      ayuda: "El impuesto que tributaría esta unidad en forma autónoma. El impuesto efectivo se determina sobre el consolidado." },
    { etiqueta: "[Informativo] Resultado después de ese impuesto", valores: r.nopatStandalone, memo: true,
      formula: { op: "lineal", de: [
        { fila: "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)" },
        { fila: "[Informativo] Impuesto como sociedad independiente", factor: -1 },
      ] },
      ayuda: "También de carácter informativo." },
    { etiqueta: "FLUJO DE CAJA DE LA UNIDAD (EVALUACIÓN INDEPENDIENTE)", valores: r.fcffStandalone, clave: true,
      formula: { op: "lineal", de: [
        { fila: "[Informativo] Resultado después de ese impuesto" },
        { fila: "Depreciación del año" },
        { fila: "INVERSIÓN TOTAL DEL AÑO" },
      ] },
      ayuda: "El flujo de esta unidad evaluada en forma independiente. Sobre él se determina su rendimiento individual." },
    { etiqueta: "Flujo acumulado", valores: r.fcffAcumulado,
      formula: { op: "acumulado", de: "FLUJO DE CAJA DE LA UNIDAD (EVALUACIÓN INDEPENDIENTE)" },
      ayuda: "Suma del flujo desde el primer ejercicio." },

    { etiqueta: "Ocupación del muelle", valores: r.ocupacionMuelle, formato: "pct",
      ayuda: "El porcentaje del año de muelle que ocupa esta unidad." },
    { etiqueta: "Recaladas por año", valores: r.recaladas, formato: "num",
      ayuda: "La cantidad de recaladas que representa ese volumen." },

    ...r.detalleFlujos.map((d) => ({
      etiqueta: `   · ${d.flujo.gate} ${d.flujo.carga} (${d.flujo.modo})`,
      valores: d.toneladas, memo: true,
      ayuda: "Toneladas proyectadas de esta corriente comercial. Solo se aplica cuando la facturación se determina por flujos.",
    })),
  ];
}

/**
 * Recalcula una fila aplicando su fórmula sobre las otras filas.
 *
 * No se usa en pantalla: lo usa el control del modelo para verificar que la
 * fórmula que se exporta al Excel da exactamente lo mismo que calculó el
 * motor. Si alguna vez dejan de coincidir, el chequeo automático lo marca.
 */
export function recalcularConFormula(filas: Fila[], f: Fila): (number | null)[] | null {
  if (!f.formula) return null;
  const buscar = (etiqueta: string): (number | null)[] | null => {
    const fila = filas.find((x) => x.etiqueta === etiqueta);
    return fila ? (fila.valores as (number | null)[]) : null;
  };
  const n = f.valores.length;
  const salida: (number | null)[] = new Array(n).fill(null);
  const fo = f.formula;

  if (fo.op === "lineal" || fo.op === "maxCero") {
    const series = fo.de.map((t) => ({ v: buscar(t.fila), factor: t.factor ?? 1 }));
    if (series.some((s) => s.v === null)) return null;
    for (let i = 0; i < n; i++) {
      let acum = 0;
      for (const s of series) acum += (s.v![i] ?? 0) * s.factor;
      salida[i] = fo.op === "maxCero" ? Math.max(0, acum) : acum;
    }
    return salida;
  }

  if (fo.op === "producto" || fo.op === "division") {
    const a = buscar(fo.de[0]);
    const b = buscar(fo.de[1]);
    if (!a || !b) return null;
    for (let i = 0; i < n; i++) {
      const x = a[i] ?? 0;
      const y = b[i] ?? 0;
      salida[i] = fo.op === "producto" ? x * y : y > 0 ? x / y : null;
    }
    return salida;
  }

  const base = buscar(fo.de);
  if (!base) return null;
  let acum = 0;
  for (let i = 0; i < n; i++) {
    acum += base[i] ?? 0;
    salida[i] = acum;
  }
  return salida;
}
