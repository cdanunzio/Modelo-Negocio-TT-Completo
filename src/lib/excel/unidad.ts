/**
 * La hoja de un negocio, con el modelo escrito en fórmulas.
 *
 * Arriba van los datos que se cargan (celdas celestes); abajo, el cálculo año
 * por año. Ninguna celda del cálculo lleva un número escrito: todas salen de
 * las de arriba, de la hoja de Parámetros o de la de Costos compartidos. Por
 * eso se puede cambiar una tarifa o una tonelada y ver moverse el flujo, la
 * ocupación del muelle y la TIR sin volver a la aplicación.
 */
import { Escenario, Unidad, NOMBRE_UNIDAD, TarifaEscalonada } from "../model/types";
import {
  Celda, Hoja, texto, numero, formula, titulo, columna,
  FORMATO_MONEDA, FORMATO_DECIMAL, FORMATO_PCT, FORMATO_ENTERO, CELESTE, nombreHoja,
} from "./celdas";

const INFINITO = "1E+15";

/** Suma los conceptos de un tramo según el rubro, igual que el motor. */
function concepto(t: TarifaEscalonada, rubro: "muelle" | "estibaje" | "manipuleo" | "calada"): number {
  switch (rubro) {
    case "muelle": return t.usoMuelle;
    case "estibaje": return t.embarque + t.descarga;
    case "manipuleo": return t.habilitaciones + t.fumigacionTransile;
    case "calada": return t.calada;
  }
}

const RUBROS = ["muelle", "estibaje", "manipuleo", "calada"] as const;
const NOMBRE_RUBRO: Record<(typeof RUBROS)[number], string> = {
  muelle: "Uso de muelle",
  estibaje: "Carga y descarga",
  manipuleo: "Manipuleo",
  calada: "Calada y otros derechos",
};

export interface ContextoUnidad {
  esc: Escenario;
  anios: number[];
  parametros: Hoja;
  comunes: Hoja;
}

export function hojaUnidad(u: Unidad, ctx: ContextoUnidad): Hoja {
  const { esc, anios, parametros: P, comunes: C } = ctx;
  const un = esc.unidades[u];
  const h = new Hoja(nombreHoja(NOMBRE_UNIDAD[u]));
  const n = anios.length;
  const primera = 1;                 // columna B
  const ultima = primera + n - 1;
  const colAyuda = ultima + 1;
  const cols = (j: number) => primera + j;

  // Atajos de referencia.
  const par = (clave: string) => P.externaFija(clave);
  const com = (clave: string) => C.externaFija(clave);
  const dato = (clave: string) => h.fijo(clave);
  const en = (clave: string, j: number) => h.ref(clave, cols(j));
  const anioRef = (j: number) => `${columna(cols(j))}$${h.fila("anios")}`;

  /** Fila de cálculo: una fórmula por año. */
  const calculo = (
    clave: string, rotulo: string, exp: (j: number) => string,
    opciones: { formato?: string; clave_?: boolean; memo?: boolean; ayuda?: string } = {}
  ) => {
    const fmt = opciones.formato ?? FORMATO_MONEDA;
    const estilo = opciones.clave_ ? { fontWeight: "bold" as const } : {};
    // Se aparta el número de fila antes de armar las fórmulas: las filas
    // acumuladas se referencian a sí mismas en la columna anterior.
    if (!h.tiene(clave)) h.reservar(clave);
    h.escribirReservada(clave, [
      texto(rotulo, { ...estilo, ...(opciones.memo ? { fontStyle: "italic" as const } : {}) }),
      ...anios.map((_, j) => formula(exp(j), fmt, estilo)),
      texto(opciones.ayuda ?? "", { wrap: true }),
    ]);
  };

  /** Fila de datos por año: números que se cargan. */
  const serieEntrada = (clave: string, rotulo: string, valores: number[], fmt: string, ayuda: string) => {
    h.agregar([
      texto(rotulo),
      ...anios.map((_, j) => numero(valores[j] ?? 0, fmt, { backgroundColor: CELESTE })),
      texto(ayuda, { wrap: true }),
    ], clave);
  };

  /** Dato suelto: rótulo, valor en la columna B, unidad en la C. */
  const valor = (clave: string, rotulo: string, v: number | boolean, unidad: string, ayuda = "") => {
    h.agregar([
      texto(rotulo),
      typeof v === "boolean"
        ? texto(v ? "Sí" : "No", { backgroundColor: CELESTE })
        : numero(v, Number.isInteger(v) && Math.abs(v) < 100000 ? FORMATO_ENTERO : FORMATO_DECIMAL,
            { backgroundColor: CELESTE }),
      texto(unidad),
      texto(ayuda, { wrap: true }),
    ], clave);
  };

  // ------------------------------------------------------------------ años --
  h.agregar(titulo(`${NOMBRE_UNIDAD[u]} — modelo en fórmulas`, colAyuda + 1));
  h.agregar([
    texto("Concepto", { fontWeight: "bold" }),
    ...anios.map((a) => ({ value: a, type: Number, fontWeight: "bold", align: "right" } as Celda)),
    texto("Qué significa", { fontWeight: "bold" }),
  ], "anios");

  // -------------------------------------------------------------- entradas --
  h.blanco();
  h.agregar(titulo("DATOS QUE SE CARGAN (celdas celestes)", colAyuda + 1));
  valor("anioInicioOp", "Año de inicio de operación", un.anioInicioOp, "año");
  valor("capacidadMax", "Capacidad máxima de la instalación", un.capacidadMax, "tn/año",
    "0 significa sin tope físico.");
  valor("takeOrPay", "Volumen mínimo asegurado (take or pay)", un.takeOrPay, "tn/año");
  valor("otrosIngresos", "Otros ingresos por tonelada", un.otrosIngresos, "USD/tn");
  valor("opexFijoMM", "Costo fijo anual", un.opexFijoMM, "USD MM/año");
  valor("opexInicialMM", "Costo de puesta en marcha, por única vez", un.opexInicialMM, "USD MM");
  valor("opexVariable", "Costo por tonelada", un.opexVariable, "USD/tn");
  valor("canonFijoActivo", "Derecho de uso fijo aplicado", un.canonFijoActivo, "Sí / No");
  valor("canonFijoMM", "Derecho de uso fijo", un.canonFijoMM, "USD MM/año");
  valor("canonVariableActivo", "Derecho de uso por tonelada aplicado", un.canonVariableActivo, "Sí / No");
  valor("canonVariable", "Derecho de uso por tonelada", un.canonVariable, "USD/tn");
  valor("canonPctActivo", "Derecho de uso sobre facturación aplicado", un.canonPctActivo, "Sí / No");
  valor("canonPct", "Derecho de uso sobre facturación", un.canonPct, "%");
  valor("capexNoDepreciable", "Parte de la inversión que no se deprecia", un.capexNoDepreciable, "USD MM",
    "Por ejemplo el terreno.");
  valor("parcelaMedia", "Parcela media por buque", un.parcelaMedia, "tn");
  valor("rendimientoDia", "Rendimiento de carga o descarga", un.rendimientoDia, "tn/día");
  valor("tiempoNoOperativo", "Tiempo no operativo", un.tiempoNoOperativo, "%");
  valor("diasFijosRecalada", "Días fijos por recalada", un.diasFijosRecalada, "días");

  if (un.metodoTarifa === 2) {
    valor("volumenObjetivo", "Volumen objetivo del primer año", un.volumenObjetivo, "tn");
    valor("incrementoAnual", "Incremento anual del volumen", un.incrementoAnual, "tn");
    valor("anioInicioIncremento", "Año de inicio del incremento", un.anioInicioIncremento, "año");
    valor("topeVolumen", "Tope de volumen", un.topeVolumen, "tn", "0 significa sin tope.");
    valor("volumenDuenio", "Volumen que opera el titular", un.volumenDuenio, "tn",
      "Ese volumen se valoriza por tramos; el excedente vuelve a tarifa base.");
    valor("limiteTramo1", "Límite del tramo 1", un.limiteTramo1, "tn");
    valor("limiteTramo2", "Límite del tramo 2", un.limiteTramo2, "tn");
    valor("limiteTramo3", "Límite del tramo 3", un.limiteTramo3, "tn");
    valor("metodoCalada", "Método de la calada", un.metodoCalada, "1 = por tramos, 2 = % del valor");
    valor("caladaPct", "Calada como % del valor de la carga", un.caladaPct, "%");
    valor("valorCarga", "Valor de la carga", un.valorCarga, "USD/tn");
  }

  // Estadía del buque: sale de los datos de arriba y la usa la ocupación.
  h.agregar([
    texto("Estadía por buque (calculada)"),
    formula(
      `IF(OR(${dato("parcelaMedia")}<=0,${dato("rendimientoDia")}<=0),0,` +
      `${dato("parcelaMedia")}/(${dato("rendimientoDia")}*(1-${dato("tiempoNoOperativo")}/100))` +
      `+${dato("diasFijosRecalada")})`, FORMATO_DECIMAL),
    texto("días"),
    texto("Cuánto tarda un buque: la parcela dividida por el rendimiento neto, más los días fijos.",
      { wrap: true }),
  ], "estadia");

  // Tarifas por tramos (método 2) o tabla de flujos comerciales (método 1).
  if (un.metodoTarifa === 2) {
    h.blanco();
    h.agregar(titulo("Tarifas por tramos (USD/tn)", colAyuda + 1));
    h.agregar([
      texto("Rubro", { fontWeight: "bold" }), texto("Base", { fontWeight: "bold" }),
      texto("Tramo 1", { fontWeight: "bold" }), texto("Tramo 2", { fontWeight: "bold" }),
      texto("Tramo 3", { fontWeight: "bold" }), texto("Tramo 4", { fontWeight: "bold" }),
    ]);
    RUBROS.forEach((r) => {
      h.agregar([
        texto(NOMBRE_RUBRO[r]),
        numero(concepto(un.tarifas.base, r), FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(concepto(un.tarifas.tramo1, r), FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(concepto(un.tarifas.tramo2, r), FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(concepto(un.tarifas.tramo3, r), FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(concepto(un.tarifas.tramo4, r), FORMATO_DECIMAL, { backgroundColor: CELESTE }),
      ], `tarifa.${r}`);
    });
  } else {
    h.blanco();
    h.agregar(titulo("Flujos comerciales", colAyuda + 1));
    h.agregar([
      texto("Flujo", { fontWeight: "bold" }),
      texto("Volumen año 1 (tn)", { fontWeight: "bold" }),
      texto("Crecimiento (%)", { fontWeight: "bold" }),
      texto("Tope (tn)", { fontWeight: "bold" }),
      texto("Año de inicio", { fontWeight: "bold" }),
      texto("Muelle", { fontWeight: "bold" }), texto("Estibaje", { fontWeight: "bold" }),
      texto("Manipuleo", { fontWeight: "bold" }), texto("Almacenaje", { fontWeight: "bold" }),
      texto("Calada", { fontWeight: "bold" }),
    ]);
    un.flujos.forEach((f, k) => {
      h.agregar([
        texto(`${f.gate} ${f.carga} (${f.modo})`),
        numero(f.volAnio1, FORMATO_MONEDA, { backgroundColor: CELESTE }),
        numero(f.tasaCrecimiento, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(f.tope, FORMATO_MONEDA, { backgroundColor: CELESTE }),
        numero(f.anioInicio, FORMATO_ENTERO, { backgroundColor: CELESTE }),
        numero(f.tarifaMuelle, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(f.tarifaEstibaje, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(f.tarifaManipuleo, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(f.tarifaAlmacenaje, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
        numero(f.tarifaCalada, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
      ], `flujoDato.${k}`);
    });
  }

  // Datos por año.
  h.blanco();
  h.agregar(titulo("DATOS POR AÑO", colAyuda + 1));
  if (un.metodoTarifa === 2) {
    serieEntrada("volumenManual", "Volumen cargado a mano (tn)", un.volumenManual, FORMATO_MONEDA,
      "Si el año tiene un volumen cargado, manda ese valor. En 0, se usa la proyección.");
  }
  // Obra propia: con la lista cargada, la inversión del año es la suma de las
  // obras de ese ejercicio, así que en la planilla también queda como fórmula y
  // se puede rastrear de dónde sale cada peso.
  if (un.obras.length) {
    h.blanco();
    h.agregar(titulo("Obras propias del negocio", colAyuda + 1));
    h.agregar([
      texto("Obra", { fontWeight: "bold" }),
      texto("Año", { fontWeight: "bold" }),
      texto("USD MM", { fontWeight: "bold" }),
    ]);
    const primeraObra = h.agregar([
      texto(un.obras[0].nombre, { backgroundColor: CELESTE }),
      numero(un.obras[0].anio, FORMATO_ENTERO, { backgroundColor: CELESTE }),
      numero(un.obras[0].montoMM, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
    ]);
    let ultimaObra = primeraObra;
    un.obras.slice(1).forEach((o) => {
      ultimaObra = h.agregar([
        texto(o.nombre, { backgroundColor: CELESTE }),
        numero(o.anio, FORMATO_ENTERO, { backgroundColor: CELESTE }),
        numero(o.montoMM, FORMATO_DECIMAL, { backgroundColor: CELESTE }),
      ]);
    });
    const anios_ = `$B$${primeraObra}:$B$${ultimaObra}`;
    const montos = `$C$${primeraObra}:$C$${ultimaObra}`;
    h.agregar([
      texto("Total de obras propias", { fontWeight: "bold" }),
      texto(""),
      formula(`SUM(${montos})`, FORMATO_DECIMAL, { fontWeight: "bold" }),
    ]);
    h.blanco();
    calculo("capexAnual", "Inversión del año (USD MM)",
      (j) => `SUMIF(${anios_},${anioRef(j)},${montos})`,
      { formato: FORMATO_DECIMAL, ayuda: "Suma de las obras propias de ese ejercicio." });
  } else {
    serieEntrada("capexAnual", "Inversión del año (USD MM)", un.capexAnual, FORMATO_DECIMAL,
      "Obra propia de este negocio.");
  }
  serieEntrada("opexVarOverride", "Costo por tonelada del año (USD/tn)", un.opexVarOverride, FORMATO_DECIMAL,
    "0 significa usar el costo por tonelada general.");

  // --------------------------------------------------------------- cálculo --
  h.blanco();
  h.agregar(titulo("CÁLCULO — todas las celdas son fórmulas", colAyuda + 1));

  if (un.metodoTarifa === 2) {
    calculo("pisoManual", "Último volumen cargado a mano (auxiliar)",
      (j) => j === 0
        ? dato("volumenObjetivo")
        : `IFERROR(LOOKUP(2,1/(${h.rango("volumenManual", primera, cols(j) - 1)}>0),` +
          `${h.rango("volumenManual", primera, cols(j) - 1)}),${dato("volumenObjetivo")})`,
      { formato: FORMATO_MONEDA, memo: true,
        ayuda: "Desde qué volumen se sigue proyectando: el último cargado a mano o el objetivo." });

    calculo("anioPiso", "Año de ese volumen (auxiliar)",
      (j) => j === 0
        ? `""`
        : `IFERROR(LOOKUP(2,1/(${h.rango("volumenManual", primera, cols(j) - 1)}>0),` +
          `${h.rango("anios", primera, cols(j) - 1)}),"")`,
      { formato: FORMATO_ENTERO, memo: true, ayuda: "Sirve para contar desde cuándo se incrementa." });

    calculo("desdeIncremento", "Desde qué año se incrementa (auxiliar)",
      (j) => `MAX(${dato("anioInicioIncremento")},IF(${en("anioPiso", j)}="",` +
             `${dato("anioInicioIncremento")},${en("anioPiso", j)}+1))`,
      { formato: FORMATO_ENTERO, memo: true });

    calculo("periodos", "Años de incremento acumulados (auxiliar)",
      (j) => `IF(${anioRef(j)}>=${en("desdeIncremento", j)},${anioRef(j)}-${en("desdeIncremento", j)}+1,0)`,
      { formato: FORMATO_ENTERO, memo: true });

    calculo("volumenBase", "Volumen proyectado antes de la puesta en marcha",
      (j) => `IF(${anioRef(j)}<${dato("anioInicioOp")},0,` +
             `IF(${en("volumenManual", j)}>0,MAX(${dato("takeOrPay")},${en("volumenManual", j)}),` +
             `MAX(${dato("takeOrPay")},MIN(IF(${dato("topeVolumen")}<=0,${INFINITO},${dato("topeVolumen")}),` +
             `${en("pisoManual", j)}+${en("periodos", j)}*${dato("incrementoAnual")}))))`,
      { ayuda: "El volumen cargado a mano, o el último conocido más el incremento anual, con tope y take or pay." });
  } else {
    un.flujos.forEach((f, k) => {
      const d = (col: number) => `$${columna(col)}$${h.fila(`flujoDato.${k}`)}`;
      const inicio = `MAX(${d(4)},${dato("anioInicioOp")})`;
      calculo(`flujoTn.${k}`, `   · ${f.gate} ${f.carga} (${f.modo})`,
        (j) => `IF(${anioRef(j)}<${inicio},0,MIN(IF(${d(3)}<=0,${INFINITO},${d(3)}),` +
               `${d(1)}*(1+${d(2)}/100)^(${anioRef(j)}-${inicio})))`,
        { memo: true, ayuda: "Volumen del flujo: el del primer año creciendo a su tasa, con tope." });
    });
    const primerFlujo = `flujoTn.0`;
    const ultimoFlujo = `flujoTn.${un.flujos.length - 1}`;
    calculo("volumenBase", "Volumen de los flujos comerciales",
      (j) => un.flujos.length
        ? `SUM(${columna(cols(j))}${h.fila(primerFlujo)}:${columna(cols(j))}${h.fila(ultimoFlujo)})`
        : "0",
      { ayuda: "Suma de todos los flujos comerciales del año." });
  }

  calculo("rampUp", "Factor de maduración",
    (j) => `'${P.nombre}'!$B$${P.fila("rampUp") + j}`,
    { formato: FORMATO_DECIMAL, memo: true, ayuda: "Sale de la hoja de Parámetros." });

  calculo("toneladasTeoricas", "Toneladas potenciales sin restricción de capacidad",
    (j) => `${en("volumenBase", j)}*${en("rampUp", j)}`,
    { ayuda: "El volumen que podría operarse si la instalación no tuviera límite de capacidad." });

  calculo("toneladasEfectivas", "Toneladas efectivamente operadas",
    (j) => `IF(${dato("capacidadMax")}<=0,${en("toneladasTeoricas", j)},` +
           `MIN(${dato("capacidadMax")},${en("toneladasTeoricas", j)}))`,
    { clave_: true, ayuda: "Las anteriores, limitadas por la capacidad de la instalación." });

  calculo("factorUtilizacion", "Proporción de la demanda atendida",
    (j) => `IF(${en("toneladasTeoricas", j)}=0,0,${en("toneladasEfectivas", j)}/${en("toneladasTeoricas", j)})`,
    { formato: FORMATO_DECIMAL,
      ayuda: "1,00 significa que entra todo. Menos de 1 significa que se rechaza carga." });

  // --- tarifas ---
  if (un.metodoTarifa === 2) {
    calculo("volumenDuenioAnio", "Volumen del titular valorizado por tramos (auxiliar)",
      (j) => `MIN(${en("toneladasTeoricas", j)},${dato("volumenDuenio")})`,
      { memo: true });
  }

  const tarifaEscalonada = (rubro: (typeof RUBROS)[number], j: number) => {
    const f = h.fila(`tarifa.${rubro}`);
    const base = `$B$${f}`, r1 = `$C$${f}`, r2 = `$D$${f}`, r3 = `$E$${f}`, r4 = `$F$${f}`;
    const T = en("toneladasTeoricas", j);
    const O = en("volumenDuenioAnio", j);
    const L1 = dato("limiteTramo1"), L2 = dato("limiteTramo2"), L3 = dato("limiteTramo3");
    const escalonado =
      `MIN(${O},${L1})*${r1}+MIN(MAX(${O}-${L1},0),${L2}-${L1})*${r2}` +
      `+MIN(MAX(${O}-${L2},0),${L3}-${L2})*${r3}+MAX(${O}-${L3},0)*${r4}`;
    const excedente = `MAX(0,${T}-${dato("volumenDuenio")})*${base}`;
    return `IF(${T}<=0,${base},(${escalonado}+${excedente})/${T})`;
  };

  const mezclaFlujos = (columnaTarifa: number, j: number) => {
    if (!un.flujos.length) return "0";
    const desde = h.fila("flujoTn.0");
    const hasta = h.fila(`flujoTn.${un.flujos.length - 1}`);
    const tn = `${columna(cols(j))}${desde}:${columna(cols(j))}${hasta}`;
    const tar = `$${columna(columnaTarifa)}$${h.fila("flujoDato.0")}:` +
                `$${columna(columnaTarifa)}$${h.fila(`flujoDato.${un.flujos.length - 1}`)}`;
    return `IF(${en("toneladasTeoricas", j)}=0,0,SUMPRODUCT(${tn},${tar})/${en("toneladasTeoricas", j)})`;
  };

  const tarifas: { clave: string; rotulo: string; exp: (j: number) => string; ayuda: string }[] =
    un.metodoTarifa === 2
      ? [
          { clave: "tarifaMuelle", rotulo: "Tarifa de uso de muelle (USD/tn)",
            exp: (j) => tarifaEscalonada("muelle", j),
            ayuda: "Tarifa efectiva: el volumen del titular se valoriza por tramos y el excedente a tarifa base." },
          { clave: "tarifaEstibaje", rotulo: "Tarifa de carga y descarga (USD/tn)",
            exp: (j) => tarifaEscalonada("estibaje", j), ayuda: "Embarque más descarga, por tramos." },
          { clave: "tarifaManipuleo", rotulo: "Tarifa de manipuleo (USD/tn)",
            exp: (j) => tarifaEscalonada("manipuleo", j), ayuda: "Habilitaciones más fumigación y transile." },
          { clave: "tarifaAlmacenaje", rotulo: "Tarifa de almacenaje (USD/tn)",
            exp: () => "0", ayuda: "En este método el almacenaje no se factura por separado." },
          { clave: "tarifaCalada", rotulo: "Tarifa de calada y otros derechos (USD/tn)",
            exp: (j) => `IF(${dato("metodoCalada")}=2,${dato("caladaPct")}/100*${dato("valorCarga")},` +
                        `${tarifaEscalonada("calada", j)})`,
            ayuda: "Según el método elegido: un porcentaje del valor de la carga, o la tarifa por tramos." },
        ]
      : [
          { clave: "tarifaMuelle", rotulo: "Tarifa de uso de muelle (USD/tn)",
            exp: (j) => mezclaFlujos(5, j),
            ayuda: "Promedio de los flujos del año, pesado por las toneladas de cada uno." },
          { clave: "tarifaEstibaje", rotulo: "Tarifa de carga y descarga (USD/tn)",
            exp: (j) => mezclaFlujos(6, j), ayuda: "Mismo criterio." },
          { clave: "tarifaManipuleo", rotulo: "Tarifa de manipuleo (USD/tn)",
            exp: (j) => mezclaFlujos(7, j), ayuda: "Mismo criterio." },
          { clave: "tarifaAlmacenaje", rotulo: "Tarifa de almacenaje (USD/tn)",
            exp: (j) => mezclaFlujos(8, j), ayuda: "Mismo criterio." },
          { clave: "tarifaCalada", rotulo: "Tarifa de calada y otros derechos (USD/tn)",
            exp: (j) => mezclaFlujos(9, j), ayuda: "Mismo criterio." },
        ];

  tarifas.forEach((t) =>
    calculo(t.clave, t.rotulo, t.exp, { formato: FORMATO_DECIMAL, ayuda: t.ayuda }));

  calculo("tarifaOtros", "Otros ingresos por tonelada (USD/tn)",
    () => dato("otrosIngresos"), { formato: FORMATO_DECIMAL, ayuda: "Conceptos fuera de los cinco rubros." });

  calculo("tarifaTotal", "TARIFA TOTAL POR TONELADA (USD/tn)",
    (j) => ["tarifaMuelle", "tarifaEstibaje", "tarifaManipuleo", "tarifaAlmacenaje", "tarifaCalada", "tarifaOtros"]
      .map((k) => en(k, j)).join("+"),
    { formato: FORMATO_DECIMAL, clave_: true, ayuda: "El precio de venta de este negocio, con todos los servicios." });

  // --- facturación ---
  const rubrosIngreso: [string, string, string][] = [
    ["ingresosMuelle", "Facturación por uso de muelle", "tarifaMuelle"],
    ["ingresosEstibaje", "Facturación por carga y descarga", "tarifaEstibaje"],
    ["ingresosManipuleo", "Facturación por manipuleo", "tarifaManipuleo"],
    ["ingresosAlmacenaje", "Facturación por almacenaje", "tarifaAlmacenaje"],
    ["ingresosCalada", "Facturación por calada y otros derechos", "tarifaCalada"],
    ["ingresosOtros", "Facturación por otros conceptos", "tarifaOtros"],
  ];
  rubrosIngreso.forEach(([clave, rotulo, tarifa]) =>
    calculo(clave, rotulo, (j) => `${en("toneladasEfectivas", j)}*${en(tarifa, j)}`,
      { ayuda: "Toneladas por el precio del rubro." }));

  calculo("ingresosBrutos", "FACTURACIÓN DE LA UNIDAD",
    (j) => rubrosIngreso.map(([k]) => en(k, j)).join("+"),
    { clave_: true, ayuda: "La facturación total del ejercicio." });

  // --- costos ---
  calculo("opexFijo", "Costo fijo directo",
    (j) => `IF(${en("toneladasEfectivas", j)}>0,${dato("opexFijoMM")}*1000000,0)` +
           `+IF(${anioRef(j)}=${dato("anioInicioOp")},${dato("opexInicialMM")}*1000000,0)`,
    { ayuda: "Se paga desde que hay operación, más el costo de puesta en marcha el primer año." });

  calculo("opexVariableUnitario", "Costo variable unitario (USD/tn)",
    (j) => `IF(${en("opexVarOverride", j)}>0,${en("opexVarOverride", j)},${dato("opexVariable")})`,
    { formato: FORMATO_DECIMAL, ayuda: "El del año si está cargado; si no, el general." });

  calculo("opexVariableTotal", "Costo variable total",
    (j) => `${en("toneladasEfectivas", j)}*${en("opexVariableUnitario", j)}`,
    { ayuda: "Toneladas por el costo variable unitario." });

  calculo("opexDirecto", "Costo directo total",
    (j) => `${en("opexFijo", j)}+${en("opexVariableTotal", j)}`,
    { ayuda: "Lo que cuesta operar este negocio sin contar lo compartido." });

  calculo("opexComun", "Costos compartidos asignados",
    (j) => `IF(${en("toneladasEfectivas", j)}>0,${com(`opexComun.${u}`)},0)`,
    { ayuda: "La porción que le corresponde de los costos que benefician a las tres unidades." });

  calculo("opexTotal", "Costo operativo total",
    (j) => `${en("opexDirecto", j)}+${en("opexComun", j)}`,
    { ayuda: "El costo directo más la porción asignada de los costos compartidos." });

  calculo("canonFijo", "Derecho de uso fijo",
    () => `IF(${dato("canonFijoActivo")}="Sí",${dato("canonFijoMM")}*1000000,0)`,
    { ayuda: "Monto fijo anual, si está aplicado." });
  calculo("canonVariableTotal", "Derecho de uso por tonelada",
    (j) => `IF(${dato("canonVariableActivo")}="Sí",${en("toneladasEfectivas", j)}*${dato("canonVariable")},0)`,
    { ayuda: "Por tonelada movida, si está aplicado." });
  calculo("canonPctTotal", "Derecho de uso sobre facturación",
    (j) => `IF(${dato("canonPctActivo")}="Sí",${en("ingresosBrutos", j)}*${dato("canonPct")}/100,0)`,
    { ayuda: "Porcentaje de lo facturado, si está aplicado." });
  calculo("canonTotal", "Derecho de uso portuario",
    (j) => `${en("canonFijo", j)}+${en("canonVariableTotal", j)}+${en("canonPctTotal", j)}`,
    { ayuda: "El canon que esta unidad abona al concedente por operar en el predio." });

  calculo("ebitda", "GANANCIA OPERATIVA (EBITDA)",
    (j) => `${en("ingresosBrutos", j)}-${en("opexTotal", j)}-${en("canonTotal", j)}`,
    { clave_: true, ayuda: "El resultado que genera esta unidad con su operación." });

  // --- inversión y depreciación ---
  calculo("capexDirecto", "Inversión directa",
    (j) => `-${en("capexAnual", j)}*1000000`,
    { ayuda: "La inversión atribuible exclusivamente a esta unidad." });

  calculo("capexComun", "Obras compartidas asignadas",
    (j) => `-'${C.nombre}'!$B$${C.fila("capexComun") + j}*1000000*${com(`pctCapexComun.${u}`)}`,
    { ayuda: "La porción que le corresponde de las obras que benefician a más de una unidad." });

  calculo("capexTotal", "INVERSIÓN TOTAL DEL AÑO",
    (j) => `${en("capexDirecto", j)}+${en("capexComun", j)}`,
    { clave_: true, ayuda: "La inversión total que le corresponde en ese ejercicio." });

  calculo("capexAcumuladoMM", "Inversión acumulada (USD MM, auxiliar)",
    (j) => {
      const propio = `${en("capexAnual", j)}+'${C.nombre}'!$B$${C.fila("capexComun") + j}*${com(`pctCapexComun.${u}`)}`;
      return j === 0 ? propio : `${en("capexAcumuladoMM", j - 1)}+${propio}`;
    },
    { formato: FORMATO_DECIMAL, memo: true });

  calculo("baseDepreciable", "Base depreciable acumulada",
    (j) => `MAX(0,(${en("capexAcumuladoMM", j)}-${dato("capexNoDepreciable")})*1000000)`,
    { ayuda: "La inversión acumulada hasta ese ejercicio, neta de los bienes no depreciables como el terreno." });

  const vida = par("vidaUtilDepreciacion");
  const vidaRigi = `${vida}*${par("rigiPctVidaUtil")}/100`;
  calculo("depreciacion", "Depreciación del año",
    (j) => `IF(${anioRef(j)}<${dato("anioInicioOp")},0,` +
           `IF(AND(${par("rigiActivo")}="Sí",${par("rigiAmortAcelerada")}="Sí"),` +
           `IF(${anioRef(j)}-${dato("anioInicioOp")}<${vidaRigi},${en("baseDepreciable", j)}/(${vidaRigi}),0),` +
           `IF(${anioRef(j)}-${dato("anioInicioOp")}<${vida},${en("baseDepreciable", j)}/${vida},0)))`,
    { ayuda: "Desgaste contable. Con amortización acelerada del RIGI se reparte en menos años." });

  calculo("ebit", "RESULTADO ANTES DE INTERESES E IMPUESTOS (EBIT)",
    (j) => `${en("ebitda", j)}-${en("depreciacion", j)}`,
    { clave_: true, ayuda: "Resultado operativo menos depreciación." });

  calculo("impuestoStandalone", "[Informativo] Impuesto como sociedad independiente",
    (j) => `MAX(0,${en("ebit", j)}*${par("tasaImpuestoVigente")}/100)`,
    { memo: true, ayuda: "Lo que pagaría por su cuenta. El impuesto real se calcula sobre el consolidado." });

  calculo("nopatStandalone", "[Informativo] Resultado después de ese impuesto",
    (j) => `${en("ebit", j)}-${en("impuestoStandalone", j)}`, { memo: true, ayuda: "También de carácter informativo." });

  calculo("fcffStandalone", "FLUJO DE CAJA DE LA UNIDAD (EVALUACIÓN INDEPENDIENTE)",
    (j) => `${en("nopatStandalone", j)}+${en("depreciacion", j)}+${en("capexTotal", j)}`,
    { clave_: true, ayuda: "El flujo de este negocio evaluado solo. Sobre él se calcula su rendimiento." });

  calculo("fcffAcumulado", "Flujo acumulado",
    (j) => j === 0 ? en("fcffStandalone", j) : `${en("fcffAcumulado", j - 1)}+${en("fcffStandalone", j)}`,
    { ayuda: "Suma del flujo desde el primer ejercicio." });

  // --- muelle ---
  const sinMuelle = `OR(${dato("parcelaMedia")}<=0,${dato("rendimientoDia")}<=0,${par("diasOperativos")}<=0)`;
  calculo("recaladas", "Recaladas por año",
    (j) => `IF(${sinMuelle},0,${en("toneladasEfectivas", j)}/${dato("parcelaMedia")})`,
    { formato: FORMATO_DECIMAL, ayuda: "La cantidad de recaladas que representa ese volumen." });

  calculo("ocupacionMuelle", "Ocupación del muelle",
    (j) => `IF(${sinMuelle},0,${en("recaladas", j)}*${dato("estadia")}/${par("diasOperativos")}` +
           `/MAX(1,${par("sitiosAtraque")}))`,
    { formato: FORMATO_PCT, ayuda: "El porcentaje del año de muelle que ocupa esta unidad." });

  // --- rendimiento ---
  h.blanco();
  h.agregar([
    texto("RENDIMIENTO DE LA UNIDAD EN FORMA INDEPENDIENTE (TIR)", { fontWeight: "bold" }),
    formula(`IFERROR(IRR(${h.rango("fcffStandalone", primera, ultima)}),"")`, FORMATO_PCT,
      { fontWeight: "bold" }),
    ...Array(Math.max(0, n - 1)).fill(null),
    texto("La calcula Excel sobre la fila del flujo del negocio. Si cambia un dato, se recalcula.",
      { wrap: true }),
  ], "tir");

  return h;
}

export function anchoUnidad(anios: number[]) {
  return [{ width: 46 }, ...anios.map(() => ({ width: 14 })), { width: 70 }];
}
