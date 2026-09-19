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
      ayuda: `Toneladas que efectivamente mueve ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "TONELADAS TOTALES", valores: c.toneladasTotales, clave: true,
      formula: { op: "lineal", de: tn },
      ayuda: "El tamaño físico del negocio en el año." },

    ...UNIDADES.map((u) => ({
      etiqueta: `Facturación de ${CORTO[u]}`, valores: c.porUnidad[u].ingresosBrutos,
      ayuda: `Lo que factura ${NOMBRE_UNIDAD[u]}.`,
    })),
    { etiqueta: "FACTURACIÓN TOTAL", valores: c.ingresosBrutos, clave: true,
      formula: { op: "lineal", de: fact },
      ayuda: "Toda la plata que entra por vender servicios, antes de descontar nada." },

    { etiqueta: "Costos de operación (OPEX)", valores: c.opexTotal,
      ayuda: "Todo lo que cuesta operar el puerto: los costos propios de cada negocio más los compartidos." },
    { etiqueta: "Derecho de uso portuario", valores: c.canonTotal,
      ayuda: "Lo que los tres negocios le pagan al concedente por operar en el predio." },
    { etiqueta: "GANANCIA OPERATIVA (EBITDA)", valores: c.ebitda, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FACTURACIÓN TOTAL" },
        { fila: "Costos de operación (OPEX)", factor: -1 },
        { fila: "Derecho de uso portuario", factor: -1 },
      ] },
      ayuda: "Lo que gana el puerto operando, antes de la inversión y los impuestos. Es el número que mira un banco." },

    { etiqueta: "Depreciación de la inversión", valores: c.depreciacion,
      ayuda: "Desgaste contable de lo invertido. No es plata que sale de la caja, pero baja el impuesto." },
    { etiqueta: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", valores: c.ebit, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA OPERATIVA (EBITDA)" },
        { fila: "Depreciación de la inversión", factor: -1 },
      ] },
      ayuda: "Ganancia operativa menos depreciación. Sobre este número se calcula el impuesto." },

    { etiqueta: "Impuesto al cheque pagado (IDyCB)", valores: c.idycbPagado,
      ayuda: "Se paga cada vez que entra o sale plata de la cuenta. Acá se estima sobre los movimientos de la inversión." },
    { etiqueta: "Impuesto al cheque recuperado", valores: c.idycbRecuperado,
      ayuda: "La parte que se descuenta del impuesto a las ganancias. Dentro del RIGI se computa el 100%." },
    { etiqueta: "Tasa municipal de Timbúes (DREI)", valores: c.drei,
      ayuda: "Por mil sobre la facturación, con un mínimo mensual en pesos. Exenta durante los años del RIGI." },
    { etiqueta: "Tasa de edificación y movimiento de tierra", valores: c.tasaEdificacion,
      ayuda: "Tasa municipal sobre el monto de obra de cada año." },
    { etiqueta: "Impuesto a las Ganancias determinado", valores: c.impuestoDeterminado,
      formula: { op: "maxCero", de: [
        { fila: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", factor: o.tasaImpuesto / 100 },
      ] },
      ayuda: `Ganancia por la alícuota (${o.tasaImpuesto}%). Nunca negativo: si el año da pérdida, es cero.` },
    { etiqueta: "[Informativo] Ahorro por exención de Ingresos Brutos", valores: c.memoAhorroIIBB, memo: true,
      ayuda: "Lo que se habría pagado sin la exención. No es plata que entra: es plata que no se paga. No suma al flujo." },
    { etiqueta: "[Informativo] Ahorro por exención municipal", valores: c.memoAhorroMunicipal, memo: true,
      ayuda: "Mismo criterio que el anterior." },
    { etiqueta: "Impuesto al cheque tomado a cuenta", valores: c.ahorroDebCred,
      ayuda: "Nunca puede superar el impuesto determinado del año." },
    { etiqueta: "Impuesto a las Ganancias a pagar", valores: c.impuestoNeto,
      formula: { op: "maxCero", de: [
        { fila: "Impuesto a las Ganancias determinado" },
        { fila: "Impuesto al cheque tomado a cuenta", factor: -1 },
        { fila: "Impuesto al cheque recuperado", factor: -1 },
      ] },
      ayuda: "Lo que realmente se paga. Este sí sale de la caja." },
    { etiqueta: "[Informativo] IVA de las inversiones (CERTIVA)", valores: c.memoIVAInversiones, memo: true,
      ayuda: "Es crédito fiscal, no costo: se recupera. Tratarlo como costo es el error más común. No afecta el flujo." },
    { etiqueta: "GANANCIA DESPUÉS DE IMPUESTOS (NOPAT)", valores: c.nopat, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)" },
        { fila: "Impuesto a las Ganancias a pagar", factor: -1 },
      ] },
      ayuda: "Resultado operativo después del impuesto, sin considerar cómo se financia el proyecto." },

    ...UNIDADES.map((u) => ({
      etiqueta: `Inversión en ${CORTO[u]}`, valores: c.porUnidad[u].capexTotal,
      ayuda: `Lo que se invierte en ${NOMBRE_UNIDAD[u]} ese año.`,
    })),
    { etiqueta: "INVERSIÓN TOTAL DEL AÑO (CAPEX)", valores: c.capexTotal, clave: true,
      formula: { op: "lineal", de: inv },
      ayuda: "Toda la inversión del puerto ese año. La suma de la fila es la plata total a conseguir." },

    { etiqueta: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)", valores: c.fcff, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA DESPUÉS DE IMPUESTOS (NOPAT)" },
        { fila: "Depreciación de la inversión" },
        { fila: "INVERSIÓN TOTAL DEL AÑO (CAPEX)" },
        ...tasasDelFlujo,
      ] },
      ayuda: "La fila más importante del modelo: sobre ella se calcula el rendimiento del proyecto." },

    ...UNIDADES.map((u) => ({
      etiqueta: `   del cual, ${CORTO[u]}`, valores: c.fcffPorUnidad[u], memo: true,
      ayuda: `La parte del flujo libre que le corresponde a ${NOMBRE_UNIDAD[u]}. Las tres filas suman el flujo consolidado.`,
    })),

    { etiqueta: "Préstamo recibido", valores: c.deudaDesembolso,
      ayuda: "La plata que entra si se toma un préstamo." },
    { etiqueta: "Intereses del préstamo", valores: c.deudaIntereses,
      ayuda: "Lo que se paga por año por el préstamo." },
    { etiqueta: "Devolución del capital", valores: c.deudaAmortizacion,
      ayuda: "Devolución del capital prestado, en cuotas iguales." },
    { etiqueta: "Saldo de la deuda", valores: c.deudaSaldo,
      ayuda: "Cuánto se debe al final de cada año." },
    { etiqueta: "Ahorro de impuesto por los intereses", valores: c.escudoFiscal,
      ayuda: "Los intereses se descuentan de ganancias: ese ahorro es un beneficio de endeudarse." },
    { etiqueta: "FLUJO PARA LOS SOCIOS (FCFE)", valores: c.fcfe, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)" },
        { fila: "Préstamo recibido" },
        { fila: "Intereses del préstamo" },
        { fila: "Devolución del capital" },
        { fila: "Ahorro de impuesto por los intereses" },
      ] },
      ayuda: "Lo que queda después de pagarle al banco. Sin deuda, es igual al flujo del proyecto." },
    { etiqueta: "Cuota total del préstamo", valores: c.servicioDeuda,
      formula: { op: "lineal", de: [
        { fila: "Intereses del préstamo", factor: -1 },
        { fila: "Devolución del capital", factor: -1 },
      ] },
      ayuda: "Intereses más devolución de capital." },
    { etiqueta: "Veces que la ganancia cubre la cuota (DSCR)", valores: c.dscr, formato: "num",
      formula: { op: "division", de: ["GANANCIA OPERATIVA (EBITDA)", "Cuota total del préstamo"] },
      ayuda: "Cuántas veces alcanza la ganancia operativa para pagar la cuota. Los bancos suelen exigir 1,30." },

    { etiqueta: "Flujo del proyecto acumulado", valores: c.fcffAcumulado,
      formula: { op: "acumulado", de: "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)" },
      ayuda: "El año en que pasa a positivo es el de recupero de la inversión." },
    { etiqueta: "Flujo para los socios acumulado", valores: c.fcfeAcumulado,
      formula: { op: "acumulado", de: "FLUJO PARA LOS SOCIOS (FCFE)" },
      ayuda: "Lo mismo, desde el punto de vista de los socios." },
    { etiqueta: "OCUPACIÓN DEL MUELLE", valores: c.ocupacionMuelle, formato: "pct", clave: true,
      ayuda: "Si supera el umbral, el volumen prometido no entra físicamente: hay que construir más muelle o rechazar carga." },
  ];
}

export function filasUnidad(c: ResultadoConsolidado, u: Unidad, o: OpcionesFilas): Fila[] {
  const r = c.porUnidad[u];
  const TN = "Toneladas que realmente se mueven";
  const RUBROS: { precio: string; facturacion: string }[] = [
    { precio: "Precio por usar el muelle (USD/tn)", facturacion: "Facturación por uso de muelle" },
    { precio: "Precio de carga y descarga (USD/tn)", facturacion: "Facturación por carga y descarga" },
    { precio: "Precio de manipuleo (USD/tn)", facturacion: "Facturación por manipuleo" },
    { precio: "Precio de almacenaje (USD/tn)", facturacion: "Facturación por almacenaje" },
    { precio: "Precio de calada y otros derechos (USD/tn)", facturacion: "Facturación por calada y otros derechos" },
    { precio: "Otros ingresos por tonelada (USD/tn)", facturacion: "Otra facturación" },
  ];

  return [
    { etiqueta: "Toneladas posibles sin límite de instalaciones", valores: r.toneladasTeoricas,
      ayuda: "Lo que podría mover si la instalación no tuviera tope." },
    { etiqueta: "Toneladas que realmente se mueven", valores: r.toneladasEfectivas, clave: true,
      ayuda: "Las anteriores, recortadas por la capacidad de la instalación." },
    { etiqueta: "Qué proporción de la demanda entra", valores: r.factorUtilizacion, formato: "num",
      ayuda: "1,00 significa que entra todo. Menos de 1 significa que se rechaza carga por falta de capacidad." },

    { etiqueta: "Precio por usar el muelle (USD/tn)", valores: r.tarifaMuelle, formato: "num",
      ayuda: "Lo que se le cobra al cliente por usar el muelle." },
    { etiqueta: "Precio de carga y descarga (USD/tn)", valores: r.tarifaEstibaje, formato: "num",
      ayuda: "Cargar o descargar el buque." },
    { etiqueta: "Precio de manipuleo (USD/tn)", valores: r.tarifaManipuleo, formato: "num",
      ayuda: "Mover la mercadería dentro del predio." },
    { etiqueta: "Precio de almacenaje (USD/tn)", valores: r.tarifaAlmacenaje, formato: "num",
      ayuda: "Guardar la mercadería. Sale de los dólares por mes divididos por la rotación." },
    { etiqueta: "Precio de calada y otros derechos (USD/tn)", valores: r.tarifaCalada, formato: "num",
      ayuda: "Servicios adicionales sobre el buque." },
    { etiqueta: "Otros ingresos por tonelada (USD/tn)", valores: r.tarifaOtros, formato: "num",
      ayuda: "Conceptos que no entran en los cinco rubros anteriores." },
    { etiqueta: "PRECIO TOTAL POR TONELADA (USD/tn)", valores: r.tarifaTotal, formato: "num", clave: true,
      formula: { op: "lineal", de: RUBROS.map((x) => ({ fila: x.precio })) },
      ayuda: "El precio de venta de este negocio, sumando todos los servicios." },

    { etiqueta: "Facturación por uso de muelle", valores: r.ingresosMuelle,
      formula: { op: "producto", de: [TN, RUBROS[0].precio] },
      ayuda: "Toneladas por el precio de muelle." },
    { etiqueta: "Facturación por carga y descarga", valores: r.ingresosEstibaje,
      formula: { op: "producto", de: [TN, RUBROS[1].precio] },
      ayuda: "Toneladas por el precio de estibaje." },
    { etiqueta: "Facturación por manipuleo", valores: r.ingresosManipuleo,
      formula: { op: "producto", de: [TN, RUBROS[2].precio] },
      ayuda: "Toneladas por el precio de manipuleo." },
    { etiqueta: "Facturación por almacenaje", valores: r.ingresosAlmacenaje,
      formula: { op: "producto", de: [TN, RUBROS[3].precio] },
      ayuda: "Toneladas por el precio de almacenaje." },
    { etiqueta: "Facturación por calada y otros derechos", valores: r.ingresosCalada,
      formula: { op: "producto", de: [TN, RUBROS[4].precio] },
      ayuda: "Toneladas por el precio de calada." },
    { etiqueta: "Otra facturación", valores: r.ingresosOtros,
      formula: { op: "producto", de: [TN, RUBROS[5].precio] },
      ayuda: "Toneladas por otros ingresos." },
    { etiqueta: "FACTURACIÓN DEL NEGOCIO", valores: r.ingresosBrutos, clave: true,
      formula: { op: "lineal", de: RUBROS.map((x) => ({ fila: x.facturacion })) },
      ayuda: "Toda la facturación del año." },

    { etiqueta: "Costo fijo propio", valores: r.opexFijo,
      ayuda: "Lo que se paga todos los años sin importar el volumen." },
    { etiqueta: "Costo por tonelada (USD/tn)", valores: r.opexVariableUnitario, formato: "num",
      ayuda: "Cuánto cuesta operar cada tonelada adicional." },
    { etiqueta: "Costo variable total", valores: r.opexVariable,
      formula: { op: "producto", de: [TN, "Costo por tonelada (USD/tn)"] },
      ayuda: "Toneladas por el costo por tonelada." },
    { etiqueta: "Costo propio total", valores: r.opexDirecto,
      formula: { op: "lineal", de: [{ fila: "Costo fijo propio" }, { fila: "Costo variable total" }] },
      ayuda: "Todo lo que cuesta operar este negocio, sin contar lo compartido." },
    { etiqueta: "Parte de los costos compartidos", valores: r.opexComun,
      ayuda: "Lo que le toca de los gastos que sirven a los tres negocios." },
    { etiqueta: "Costo de operación total", valores: r.opexTotal,
      formula: { op: "lineal", de: [
        { fila: "Costo propio total" }, { fila: "Parte de los costos compartidos" },
      ] },
      ayuda: "Lo propio más la parte de lo compartido." },
    { etiqueta: "Derecho de uso portuario", valores: r.canonTotal,
      ayuda: "Lo que este negocio le paga al concedente por operar en el predio." },
    { etiqueta: "GANANCIA OPERATIVA (EBITDA)", valores: r.ebitda, clave: true,
      formula: { op: "lineal", de: [
        { fila: "FACTURACIÓN DEL NEGOCIO" },
        { fila: "Costo de operación total", factor: -1 },
        { fila: "Derecho de uso portuario", factor: -1 },
      ] },
      ayuda: "Lo que gana este negocio operando." },

    { etiqueta: "Inversión propia", valores: r.capexDirecto,
      ayuda: "La inversión que es exclusivamente de este negocio." },
    { etiqueta: "Parte de las obras compartidas", valores: r.capexComun,
      ayuda: "Lo que le toca de las obras que sirven a más de un negocio." },
    { etiqueta: "INVERSIÓN TOTAL DEL AÑO", valores: r.capexTotal, clave: true,
      formula: { op: "lineal", de: [
        { fila: "Inversión propia" }, { fila: "Parte de las obras compartidas" },
      ] },
      ayuda: "Toda la inversión que le corresponde ese año." },
    { etiqueta: "Inversión acumulada que se deprecia", valores: r.baseDepreciable,
      ayuda: "Lo invertido hasta ese año, menos lo que no se deprecia, como el terreno." },
    { etiqueta: "Depreciación del año", valores: r.depreciacion,
      ayuda: "Desgaste contable. No es plata que sale de la caja." },
    { etiqueta: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", valores: r.ebit, clave: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA OPERATIVA (EBITDA)" },
        { fila: "Depreciación del año", factor: -1 },
      ] },
      ayuda: "Ganancia operativa menos depreciación." },

    { etiqueta: "[Informativo] Impuesto si fuera una empresa aparte", valores: r.impuestoStandalone,
      memo: true,
      formula: { op: "maxCero", de: [
        { fila: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)", factor: o.tasaImpuesto / 100 },
      ] },
      ayuda: "Lo que pagaría este negocio por su cuenta. El impuesto real se calcula sobre el consolidado." },
    { etiqueta: "[Informativo] Ganancia después de ese impuesto", valores: r.nopatStandalone, memo: true,
      formula: { op: "lineal", de: [
        { fila: "GANANCIA DESPUÉS DE DEPRECIACIÓN (EBIT)" },
        { fila: "[Informativo] Impuesto si fuera una empresa aparte", factor: -1 },
      ] },
      ayuda: "También informativo." },
    { etiqueta: "FLUJO DE CAJA DEL NEGOCIO POR SEPARADO", valores: r.fcffStandalone, clave: true,
      formula: { op: "lineal", de: [
        { fila: "[Informativo] Ganancia después de ese impuesto" },
        { fila: "Depreciación del año" },
        { fila: "INVERSIÓN TOTAL DEL AÑO" },
      ] },
      ayuda: "El flujo de este negocio evaluado solo. Sobre él se calcula su rendimiento individual." },
    { etiqueta: "Flujo acumulado", valores: r.fcffAcumulado,
      formula: { op: "acumulado", de: "FLUJO DE CAJA DEL NEGOCIO POR SEPARADO" },
      ayuda: "Suma del flujo desde el principio." },

    { etiqueta: "Ocupación del muelle", valores: r.ocupacionMuelle, formato: "pct",
      ayuda: "Qué porcentaje del año de muelle ocupa este negocio." },
    { etiqueta: "Buques por año", valores: r.recaladas, formato: "num",
      ayuda: "Cuántos barcos representa ese volumen." },

    ...r.detalleFlujos.map((d) => ({
      etiqueta: `   · ${d.flujo.gate} ${d.flujo.carga} (${d.flujo.modo})`,
      valores: d.toneladas, memo: true,
      ayuda: "Toneladas proyectadas de este flujo comercial. Solo se usa cuando la facturación se calcula por flujos.",
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
