/**
 * El flujo consolidado, también entero en fórmulas.
 *
 * Cada fila referencia a las hojas de los tres negocios o a la de Parámetros.
 * Están los impuestos con sus reglas (RIGI, impuesto al cheque con su crédito,
 * tasa municipal con el mínimo en pesos), la deuda con su cuadro de marcha y el
 * reparto del flujo entre los negocios.
 */
import { Escenario, Unidad, UNIDADES, NOMBRE_UNIDAD } from "../model/types";
import {
  Celda, Hoja, texto, formula, titulo, columna,
  FORMATO_MONEDA, FORMATO_DECIMAL, FORMATO_PCT,
} from "./celdas";

const CORTO: Record<Unidad, string> = {
  AGRO: "agrograneles",
  FERT: "fertilizantes",
  CARGAS: "cargas generales",
};

export interface ContextoConsolidado {
  esc: Escenario;
  anios: number[];
  parametros: Hoja;
  unidades: Record<Unidad, Hoja>;
}

export function hojaConsolidado(ctx: ContextoConsolidado): Hoja {
  const { anios, parametros: P, unidades: U } = ctx;
  const h = new Hoja("Flujo consolidado");
  const n = anios.length;
  const primera = 1;
  const ultima = primera + n - 1;
  const colAyuda = ultima + 1;
  const cols = (j: number) => primera + j;

  const par = (clave: string) => P.externaFija(clave);
  const uni = (u: Unidad, clave: string, j: number) => U[u].externa(clave, cols(j));
  const en = (clave: string, j: number) => h.ref(clave, cols(j));
  const anioRef = (j: number) => `${columna(cols(j))}$${h.fila("anios")}`;

  const calculo = (
    clave: string, rotulo: string, exp: (j: number) => string,
    o: { formato?: string; clave_?: boolean; memo?: boolean; ayuda?: string } = {}
  ) => {
    const estilo = o.clave_ ? { fontWeight: "bold" as const } : {};
    // Igual que en las hojas de negocio: primero se aparta la fila, porque los
    // acumulados, el saldo de la deuda y el crédito del impuesto al cheque
    // miran la columna anterior de su propia fila.
    if (!h.tiene(clave)) h.reservar(clave);
    h.escribirReservada(clave, [
      texto(rotulo, { ...estilo, ...(o.memo ? { fontStyle: "italic" as const } : {}) }),
      ...anios.map((_, j) => formula(exp(j), o.formato ?? FORMATO_MONEDA, estilo)),
      texto(o.ayuda ?? "", { wrap: true }),
    ]);
  };

  const sumaUnidades = (clave: string) => (j: number) =>
    UNIDADES.map((u) => uni(u, clave, j)).join("+");

  h.agregar(titulo("Flujo de fondos consolidado — modelo en fórmulas", colAyuda + 1));
  h.agregar([
    texto("Concepto", { fontWeight: "bold" }),
    ...anios.map((a) => ({ value: a, type: Number, fontWeight: "bold", align: "right" } as Celda)),
    texto("Qué significa", { fontWeight: "bold" }),
  ], "anios");

  // --- volumen y facturación ---
  UNIDADES.forEach((u) =>
    calculo(`toneladas.${u}`, `Toneladas de ${CORTO[u]}`, (j) => uni(u, "toneladasEfectivas", j),
      { ayuda: `Sale de la hoja de ${NOMBRE_UNIDAD[u]}.` }));
  calculo("toneladasTotales", "TONELADAS TOTALES",
    (j) => UNIDADES.map((u) => en(`toneladas.${u}`, j)).join("+"),
    { clave_: true, ayuda: "El volumen físico operado por la terminal en el ejercicio." });

  UNIDADES.forEach((u) =>
    calculo(`facturacion.${u}`, `Facturación de ${CORTO[u]}`, (j) => uni(u, "ingresosBrutos", j),
      { ayuda: `Sale de la hoja de ${NOMBRE_UNIDAD[u]}.` }));
  calculo("ingresosBrutos", "FACTURACIÓN TOTAL",
    (j) => UNIDADES.map((u) => en(`facturacion.${u}`, j)).join("+"),
    { clave_: true, ayuda: "El total de ingresos por la prestación de servicios, antes de deducir concepto alguno." });

  // --- resultado operativo ---
  calculo("opexTotal", "Costos operativos (OPEX)", sumaUnidades("opexTotal"),
    { ayuda: "Los costos propios de cada negocio más los compartidos." });
  calculo("canonTotal", "Derecho de uso portuario", sumaUnidades("canonTotal"),
    { ayuda: "El canon que las tres unidades abonan al concedente por operar en el predio." });
  calculo("ebitda", "GANANCIA OPERATIVA (EBITDA)",
    (j) => `${en("ingresosBrutos", j)}-${en("opexTotal", j)}-${en("canonTotal", j)}`,
    { clave_: true, ayuda: "Lo que gana el puerto operando. Es el número que mira un banco." });
  calculo("depreciacion", "Depreciación de la inversión", sumaUnidades("depreciacion"),
    { ayuda: "Desgaste contable de lo invertido. No sale de la caja, pero baja el impuesto." });
  calculo("ebit", "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)",
    (j) => `${en("ebitda", j)}-${en("depreciacion", j)}`,
    { clave_: true, ayuda: "Sobre este número se calcula el impuesto." });

  // --- inversión ---
  UNIDADES.forEach((u) =>
    calculo(`inversion.${u}`, `Inversión en ${CORTO[u]}`, (j) => uni(u, "capexTotal", j),
      { ayuda: `Inversión asignada a ${NOMBRE_UNIDAD[u]} en ese ejercicio.` }));
  calculo("capexTotal", "INVERSIÓN TOTAL DEL AÑO (CAPEX)",
    (j) => UNIDADES.map((u) => en(`inversion.${u}`, j)).join("+"),
    { clave_: true, ayuda: "Toda la inversión del puerto ese año." });

  // --- impuestos y tasas ---
  calculo("idycbPagado", "Impuesto al cheque pagado (IDyCB)",
    (j) => `IF(${en("capexTotal", j)}<0,${en("capexTotal", j)}*${par("idycbAlicuota")}/100,0)`,
    { ayuda: "Se estima sobre los movimientos de la inversión." });

  calculo("impuestoDeterminado", "Impuesto a las Ganancias determinado",
    (j) => `MAX(0,${en("ebit", j)}*${par("tasaImpuestoVigente")}/100)`,
    { ayuda: "Ganancia por la alícuota vigente. Nunca negativo." });

  const dentroRigi = (j: number) =>
    `AND(${par("rigiActivo")}="Sí",${anioRef(j)}>=${par("rigiAnioInicio")})`;

  calculo("memoAhorroIIBB", "[Informativo] Ahorro por exención de Ingresos Brutos",
    (j) => `IF(AND(${dentroRigi(j)},${anioRef(j)}<${par("rigiAnioInicio")}+${par("rigiIIBBAnios")}),` +
           `${en("ingresosBrutos", j)}*${par("rigiIIBBPct")}/100,0)`,
    { memo: true, ayuda: "Lo que se habría pagado sin la exención. No suma al flujo." });

  calculo("memoAhorroMunicipal", "[Informativo] Ahorro por exención municipal",
    (j) => `IF(AND(${dentroRigi(j)},${anioRef(j)}<${par("rigiAnioInicio")}+${par("rigiMunicipalAnios")}),` +
           `${en("ingresosBrutos", j)}*${par("rigiMunicipalPorMil")}/1000,0)`,
    { memo: true, ayuda: "Se aplica el mismo criterio que en el renglón anterior." });

  calculo("ahorroDebCred", "Impuesto al cheque computado a cuenta",
    (j) => `IF(AND(${dentroRigi(j)},${par("rigiDebCredActivo")}="Sí"),` +
           `MIN(${en("ingresosBrutos", j)}*${par("rigiDebCredPct")}/100,${en("impuestoDeterminado", j)}),0)`,
    { ayuda: "Nunca puede exceder el impuesto determinado del ejercicio." });

  calculo("idycbRecuperado", "Impuesto al cheque recuperado",
    (j) => {
      if (j === 0) return "0";
      const pagadoAcum = `-SUM(${h.rango("idycbPagado", primera, cols(j))})`;
      const recupAcum = `SUM(${h.rango("idycbRecuperado", primera, cols(j) - 1)})`;
      const disponible = `MAX(0,${pagadoAcum}-${recupAcum})`;
      const cupo = `MAX(0,${en("impuestoDeterminado", j)}-${en("ahorroDebCred", j)})`;
      return `MIN(${disponible},${cupo})`;
    },
    { ayuda: "El crédito acumulado que todavía queda, hasta donde alcance el impuesto del año." });

  calculo("impuestoNeto", "Impuesto a las Ganancias a pagar",
    (j) => `MAX(0,${en("impuestoDeterminado", j)}-${en("ahorroDebCred", j)}-${en("idycbRecuperado", j)})`,
    { ayuda: "El importe que efectivamente se abona. Este sí constituye una erogación." });

  const exentoMunicipal = (j: number) =>
    `AND(${par("rigiActivo")}="Sí",${anioRef(j)}-${par("rigiAnioInicio")}>=0,` +
    `${anioRef(j)}-${par("rigiAnioInicio")}<${par("rigiMunicipalAnios")})`;

  calculo("drei", "Tasa municipal de Timbúes (DREI)",
    (j) => `IF(OR(${en("ingresosBrutos", j)}<=0,${exentoMunicipal(j)}),0,` +
           `-MAX(${en("ingresosBrutos", j)}*${par("rigiMunicipalPorMil")}/1000,` +
           `IF(${par("dreiTipoCambio")}>0,${par("dreiMinimoMensualARS")}*12/${par("dreiTipoCambio")},0)))`,
    { ayuda: "Por mil sobre la facturación, con un mínimo mensual en pesos. Exenta durante el RIGI." });

  calculo("tasaEdificacion", "Tasa de edificación y movimiento de tierra",
    (j) => `IF(${en("capexTotal", j)}<0,${en("capexTotal", j)}*` +
           `IF(${anioRef(j)}-${par("anioBase")}<5,${par("tasaEdifPrimeros5")},${par("tasaEdifPost5")})/1000,0)`,
    { ayuda: "Tasa municipal sobre el monto de obra de cada ejercicio." });

  calculo("memoIVAInversiones", "[Informativo] IVA de las inversiones (CERTIVA)",
    (j) => `IF(${par("rigiCertivaActivo")}="Sí",-${en("capexTotal", j)}*0.21,0)`,
    { memo: true, ayuda: "Es crédito fiscal, no costo: se recupera. No afecta el flujo." });

  calculo("nopat", "RESULTADO OPERATIVO DESPUÉS DE IMPUESTOS (NOPAT)",
    (j) => `${en("ebit", j)}-${en("impuestoNeto", j)}`,
    { clave_: true, ayuda: "Resultado operativo después del impuesto, sin considerar la deuda." });

  const tasasDelFlujo = (j: number) =>
    `IF(${par("tasasEnFCFF")}="Sí",${en("idycbPagado", j)}+${en("drei", j)}+${en("tasaEdificacion", j)},0)`;

  calculo("fcff", "FLUJO DE CAJA LIBRE DEL PROYECTO (FCFF)",
    (j) => `${en("nopat", j)}+${en("depreciacion", j)}+${en("capexTotal", j)}+${tasasDelFlujo(j)}`,
    { clave_: true, ayuda: "La fila más importante: sobre ella se calcula el rendimiento del proyecto." });

  // --- reparto del flujo entre los negocios ---
  UNIDADES.forEach((u) =>
    calculo(`pesoEbit.${u}`, `   peso de ${CORTO[u]} en el resultado (auxiliar)`,
      (j) => `MAX(0,${uni(u, "ebit", j)})`, { memo: true }));
  calculo("pesoEbitTotal", "   suma de los pesos por resultado (auxiliar)",
    (j) => UNIDADES.map((u) => en(`pesoEbit.${u}`, j)).join("+"), { memo: true });

  UNIDADES.forEach((u) =>
    calculo(`pesoCapex.${u}`, `   peso de ${CORTO[u]} en la inversión (auxiliar)`,
      (j) => `ABS(${uni(u, "capexTotal", j)})`, { memo: true }));
  calculo("pesoCapexTotal", "   suma de los pesos por inversión (auxiliar)",
    (j) => UNIDADES.map((u) => en(`pesoCapex.${u}`, j)).join("+"), { memo: true });

  UNIDADES.forEach((u) =>
    calculo(`fcffUnidad.${u}`, `   del cual, ${CORTO[u]}`,
      (j) => {
        const impuesto = `IF(${en("pesoEbitTotal", j)}=0,${en("impuestoNeto", j)}/3,` +
          `${en("impuestoNeto", j)}*${en(`pesoEbit.${u}`, j)}/${en("pesoEbitTotal", j)})`;
        const obra = `IF(${en("pesoCapexTotal", j)}=0,(${en("idycbPagado", j)}+${en("tasaEdificacion", j)})/3,` +
          `(${en("idycbPagado", j)}+${en("tasaEdificacion", j)})*${en(`pesoCapex.${u}`, j)}/${en("pesoCapexTotal", j)})`;
        const municipal = `IF(${en("ingresosBrutos", j)}=0,${en("drei", j)}/3,` +
          `${en("drei", j)}*${en(`facturacion.${u}`, j)}/${en("ingresosBrutos", j)})`;
        return `${uni(u, "ebit", j)}-${impuesto}+${uni(u, "depreciacion", j)}+${uni(u, "capexTotal", j)}` +
               `+IF(${par("tasasEnFCFF")}="Sí",${obra}+${municipal},0)`;
      },
      { memo: true,
        ayuda: `La parte del flujo libre que le corresponde a ${NOMBRE_UNIDAD[u]}: el impuesto se reparte por resultado, las tasas de obra por inversión y la municipal por facturación.` }));

  // --- deuda ---
  // El cuadro de marcha se mira a sí mismo, así que las cuatro filas se
  // apartan juntas antes de escribirlas.
  h.reservarBloque(["deudaDesembolso", "deudaIntereses", "deudaAmortizacion", "deudaSaldo"]);
  calculo("deudaDesembolso", "Desembolso del préstamo",
    (j) => j === 0 ? `${par("montoDeudaMM")}*1000000` : "0",
    { ayuda: "Los fondos que ingresan al tomarse el préstamo." });

  calculo("deudaIntereses", "Intereses del préstamo",
    (j) => j === 0 ? "0" : `-${en("deudaSaldo", j - 1)}*${par("tasaDeuda")}/100`,
    { ayuda: "Sobre el saldo que quedaba al cierre del año anterior." });

  calculo("deudaAmortizacion", "Amortización del capital",
    (j) => j === 0
      ? "0"
      : `IF(AND(${par("plazoDeuda")}>0,${j}<=${par("plazoDeuda")}),` +
        `-MIN(${en("deudaSaldo", j - 1)},${par("montoDeudaMM")}*1000000/${par("plazoDeuda")}),0)`,
    { ayuda: "Cuotas iguales de capital, hasta cancelar." });

  calculo("deudaSaldo", "Saldo de la deuda",
    (j) => j === 0
      ? en("deudaDesembolso", j)
      : `${en("deudaSaldo", j - 1)}+${en("deudaDesembolso", j)}+${en("deudaAmortizacion", j)}`,
    { ayuda: "El saldo adeudado al cierre de cada ejercicio." });

  calculo("escudoFiscal", "Escudo fiscal de los intereses",
    (j) => `-${en("deudaIntereses", j)}*${par("tasaImpuestoVigente")}/100`,
    { ayuda: "Los intereses son deducibles del impuesto a las ganancias: ese ahorro es el beneficio fiscal del endeudamiento." });

  calculo("fcfe", "FLUJO PARA LOS ACCIONISTAS (FCFE)",
    (j) => `${en("fcff", j)}+${en("deudaDesembolso", j)}+${en("deudaIntereses", j)}` +
           `+${en("deudaAmortizacion", j)}+${en("escudoFiscal", j)}`,
    { clave_: true, ayuda: "Lo que queda después de pagarle al banco. Sin deuda, es igual al del proyecto." });

  calculo("servicioDeuda", "Servicio de la deuda (capital + intereses)",
    (j) => `-${en("deudaIntereses", j)}-${en("deudaAmortizacion", j)}`,
    { ayuda: "Intereses más amortización de capital." });

  calculo("dscr", "Cobertura del servicio de deuda (DSCR)",
    (j) => `IF(${en("servicioDeuda", j)}>0,${en("ebitda", j)}/${en("servicioDeuda", j)},"")`,
    { formato: FORMATO_DECIMAL, ayuda: "Los bancos suelen exigir 1,30." });

  calculo("fcffAcumulado", "Flujo del proyecto acumulado",
    (j) => j === 0 ? en("fcff", j) : `${en("fcffAcumulado", j - 1)}+${en("fcff", j)}`,
    { ayuda: "El ejercicio en que se vuelve positivo es el de recupero de la inversión." });

  calculo("fcfeAcumulado", "Flujo para los accionistas acumulado",
    (j) => j === 0 ? en("fcfe", j) : `${en("fcfeAcumulado", j - 1)}+${en("fcfe", j)}`,
    { ayuda: "El mismo cálculo, desde la perspectiva de los accionistas." });

  calculo("ocupacionMuelle", "OCUPACIÓN DEL MUELLE", sumaUnidades("ocupacionMuelle"),
    { formato: FORMATO_PCT, clave_: true,
      ayuda: "Si supera el umbral, el volumen prometido no entra físicamente." });

  h.blanco();
  h.agregar([
    texto("RENDIMIENTO DEL PROYECTO (TIR)", { fontWeight: "bold" }),
    formula(`IFERROR(IRR(${h.rango("fcff", primera, ultima)}),"")`, FORMATO_PCT, { fontWeight: "bold" }),
    ...Array(Math.max(0, n - 1)).fill(null),
    texto("La calcula Excel sobre el flujo libre del proyecto.", { wrap: true }),
  ], "tirProyecto");
  h.agregar([
    texto("RENDIMIENTO DE LOS SOCIOS (TIR del accionista)", { fontWeight: "bold" }),
    formula(`IF(${par("montoDeudaMM")}<=0,"",IFERROR(IRR(${h.rango("fcfe", primera, ultima)}),""))`,
      FORMATO_PCT, { fontWeight: "bold" }),
    ...Array(Math.max(0, n - 1)).fill(null),
    texto("Sobre el flujo que queda después de pagarle al banco. Sin deuda cargada no se calcula.",
      { wrap: true }),
  ], "tirSocios");

  return h;
}
