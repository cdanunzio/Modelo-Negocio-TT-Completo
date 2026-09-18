/**
 * Motor de calculo. TypeScript puro, sin dependencias: se puede correr en el
 * navegador, en el servidor o en un test. Replica exactamente la logica que
 * estaba en las formulas del Excel.
 */
import {
  Escenario, Unidad, UNIDADES, UnidadInput, ResultadoUnidad,
  ResultadoConsolidado, KPIs, TarifaEscalonada, Flujo,
} from "./types";

const serie = (n: number, v = 0) => new Array<number>(n).fill(v);

/** Tasa interna de retorno por biseccion. Null si el flujo no cambia de signo. */
export function tir(flujos: number[]): number | null {
  const hayNeg = flujos.some((f) => f < 0);
  const hayPos = flujos.some((f) => f > 0);
  if (!hayNeg || !hayPos) return null;
  const van = (r: number) =>
    flujos.reduce((acc, f, i) => acc + f / Math.pow(1 + r, i), 0);
  let lo = -0.9999, hi = 10;
  let vLo = van(lo), vHi = van(hi);
  if (vLo * vHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const vMid = van(mid);
    if (Math.abs(vMid) < 1e-7) return mid;
    if (vLo * vMid < 0) { hi = mid; vHi = vMid; } else { lo = mid; vLo = vMid; }
  }
  return (lo + hi) / 2;
}

/** Suma de los seis conceptos de un tramo segun el rubro del flujo. */
function concepto(t: TarifaEscalonada, rubro: "muelle" | "estibaje" | "manipuleo" | "calada"): number {
  switch (rubro) {
    case "muelle": return t.usoMuelle;
    case "estibaje": return t.embarque + t.descarga;
    case "manipuleo": return t.habilitaciones + t.fumigacionTransile;
    case "calada": return t.calada;
  }
}

/**
 * Tarifa efectiva escalonada. El volumen que opera el dueno se valoriza por
 * tramos marginales; el excedente vuelve a tarifa base. Con volumenDuenio = 0
 * devuelve exactamente la tarifa base.
 */
function tarifaEscalonada(u: UnidadInput, toneladas: number, rubro: Parameters<typeof concepto>[1]): number {
  if (toneladas <= 0) return concepto(u.tarifas.base, rubro);
  const base = concepto(u.tarifas.base, rubro);
  const r1 = concepto(u.tarifas.tramo1, rubro);
  const r2 = concepto(u.tarifas.tramo2, rubro);
  const r3 = concepto(u.tarifas.tramo3, rubro);
  const r4 = concepto(u.tarifas.tramo4, rubro);
  const O = Math.min(toneladas, u.volumenDuenio);
  const { limiteTramo1: L1, limiteTramo2: L2, limiteTramo3: L3 } = u;
  const escalonado =
    Math.min(O, L1) * r1 +
    Math.min(Math.max(O - L1, 0), L2 - L1) * r2 +
    Math.min(Math.max(O - L2, 0), L3 - L2) * r3 +
    Math.max(O - L3, 0) * r4;
  const excedente = Math.max(0, toneladas - u.volumenDuenio) * base;
  return (escalonado + excedente) / toneladas;
}

/** Toneladas de un flujo comercial en un anio dado (metodo 1). */
function volumenFlujo(f: Flujo, u: UnidadInput, anio: number): number {
  const inicio = Math.max(f.anioInicio, u.anioInicioOp);
  if (anio < inicio) return 0;
  const proyectado = f.volAnio1 * Math.pow(1 + f.tasaCrecimiento / 100, anio - inicio);
  const tope = f.tope <= 0 ? Infinity : f.tope;
  return Math.min(tope, proyectado);
}

/**
 * Proyeccion clasica de volumen (metodo 2).
 *
 * Si el anio tiene volumen manual cargado, manda ese valor. Si no, se parte del
 * ultimo volumen manual cargado hasta ese anio - o del volumen objetivo si nunca
 * hubo uno - y se le suma el incremento anual, topeado.
 *
 * Arrastrar el ultimo manual es lo que evita el salto hacia atras: sin eso, el
 * primer anio sin carga manual volvia al volumen objetivo inicial y las
 * toneladas se desplomaban de un anio al otro.
 */
function volumenMetodo2(u: UnidadInput, anio: number, idx: number): number {
  if (anio < u.anioInicioOp) return 0;
  const manual = u.volumenManual[idx] ?? 0;
  if (manual > 0) return Math.max(u.takeOrPay, manual);

  let piso = u.volumenObjetivo;
  let idxPiso = -1;
  for (let j = idx - 1; j >= 0; j--) {
    if ((u.volumenManual[j] ?? 0) > 0) { piso = u.volumenManual[j]; idxPiso = j; break; }
  }
  const anioPiso = idxPiso >= 0 ? anio - (idx - idxPiso) : null;
  const desde = Math.max(u.anioInicioIncremento, anioPiso !== null ? anioPiso + 1 : u.anioInicioIncremento);
  const periodos = anio >= desde ? anio - desde + 1 : 0;

  const tope = u.topeVolumen <= 0 ? Infinity : u.topeVolumen;
  return Math.max(u.takeOrPay, Math.min(tope, piso + periodos * u.incrementoAnual));
}

export function calcularUnidad(
  esc: Escenario, un: Unidad, anios: number[]
): ResultadoUnidad {
  const u = esc.unidades[un];
  const n = anios.length;
  const b = esc.base;
  const r = {} as ResultadoUnidad;

  const campos: (keyof ResultadoUnidad)[] = [
    "toneladasTeoricas", "toneladasEfectivas", "factorUtilizacion",
    "tarifaMuelle", "tarifaEstibaje", "tarifaManipuleo", "tarifaAlmacenaje",
    "tarifaCalada", "tarifaOtros", "tarifaTotal",
    "ingresosMuelle", "ingresosEstibaje", "ingresosManipuleo", "ingresosAlmacenaje",
    "ingresosCalada", "ingresosOtros", "ingresosBrutos",
    "opexFijo", "opexVariableUnitario", "opexVariable", "opexDirecto", "opexComun", "opexTotal",
    "canonFijo", "canonVariable", "canonPct", "canonTotal", "ebitda",
    "capexDirecto", "capexComun", "capexTotal", "baseDepreciable", "depreciacion",
    "ebit", "impuestoStandalone", "nopatStandalone", "fcffStandalone", "fcffAcumulado",
    "ocupacionMuelle", "recaladas",
  ];
  campos.forEach((c) => { (r as any)[c] = serie(n); });
  r.detalleFlujos = u.flujos.map((f) => ({ flujo: f, toneladas: serie(n) }));

  const opexComunUnidad = esc.comunes.reduce((acc, c) => {
    const pct = un === "AGRO" ? c.pctAGRO : un === "FERT" ? c.pctFERT : c.pctCARGAS;
    return acc + c.montoAnual * pct;
  }, 0);
  const pctCapexComun = esc.asignacionCapexComun[un] ?? 0;
  const tasaImp = b.rigiActivo ? b.rigiTasaImpuesto : b.tasaImpuestoGeneral;

  let capexAcum = 0;

  anios.forEach((anio, i) => {
    // --- volumen ---
    u.flujos.forEach((f, k) => { r.detalleFlujos[k].toneladas[i] = volumenFlujo(f, u, anio); });
    const teoricasBase =
      u.metodoTarifa === 1
        ? r.detalleFlujos.reduce((acc, d) => acc + d.toneladas[i], 0)
        : volumenMetodo2(u, anio, i);
    r.toneladasTeoricas[i] = teoricasBase * (b.rampUp[i] ?? 1);
    r.toneladasEfectivas[i] =
      u.capacidadMax <= 0 ? r.toneladasTeoricas[i] : Math.min(u.capacidadMax, r.toneladasTeoricas[i]);
    r.factorUtilizacion[i] =
      r.toneladasTeoricas[i] === 0 ? 0 : r.toneladasEfectivas[i] / r.toneladasTeoricas[i];

    // --- tarifas unitarias ---
    const T = r.toneladasTeoricas[i];
    const mix = (sel: (f: Flujo) => number) =>
      T === 0 ? 0 : r.detalleFlujos.reduce((acc, d) => acc + d.toneladas[i] * sel(d.flujo), 0) / T;

    if (u.metodoTarifa === 1) {
      r.tarifaMuelle[i] = mix((f) => f.tarifaMuelle);
      r.tarifaEstibaje[i] = mix((f) => f.tarifaEstibaje);
      r.tarifaManipuleo[i] = mix((f) => f.tarifaManipuleo);
      r.tarifaAlmacenaje[i] = mix((f) => f.tarifaAlmacenaje);
      r.tarifaCalada[i] = mix((f) => f.tarifaCalada);
    } else {
      r.tarifaMuelle[i] = tarifaEscalonada(u, T, "muelle");
      r.tarifaEstibaje[i] = tarifaEscalonada(u, T, "estibaje");
      r.tarifaManipuleo[i] = tarifaEscalonada(u, T, "manipuleo");
      r.tarifaAlmacenaje[i] = 0;
      r.tarifaCalada[i] =
        u.metodoCalada === 2 ? (u.caladaPct / 100) * u.valorCarga : tarifaEscalonada(u, T, "calada");
    }
    r.tarifaOtros[i] = u.otrosIngresos;
    r.tarifaTotal[i] =
      r.tarifaMuelle[i] + r.tarifaEstibaje[i] + r.tarifaManipuleo[i] +
      r.tarifaAlmacenaje[i] + r.tarifaCalada[i] + r.tarifaOtros[i];

    // --- ingresos ---
    const E = r.toneladasEfectivas[i];
    r.ingresosMuelle[i] = E * r.tarifaMuelle[i];
    r.ingresosEstibaje[i] = E * r.tarifaEstibaje[i];
    r.ingresosManipuleo[i] = E * r.tarifaManipuleo[i];
    r.ingresosAlmacenaje[i] = E * r.tarifaAlmacenaje[i];
    r.ingresosCalada[i] = E * r.tarifaCalada[i];
    r.ingresosOtros[i] = E * r.tarifaOtros[i];
    r.ingresosBrutos[i] =
      r.ingresosMuelle[i] + r.ingresosEstibaje[i] + r.ingresosManipuleo[i] +
      r.ingresosAlmacenaje[i] + r.ingresosCalada[i] + r.ingresosOtros[i];

    // --- opex ---
    r.opexFijo[i] =
      (E > 0 ? u.opexFijoMM * 1e6 : 0) + (anio === u.anioInicioOp ? u.opexInicialMM * 1e6 : 0);
    const override = u.opexVarOverride[i] ?? 0;
    r.opexVariableUnitario[i] = override > 0 ? override : u.opexVariable;
    r.opexVariable[i] = E * r.opexVariableUnitario[i];
    r.opexDirecto[i] = r.opexFijo[i] + r.opexVariable[i];
    r.opexComun[i] = E > 0 ? opexComunUnidad : 0;
    r.opexTotal[i] = r.opexDirecto[i] + r.opexComun[i];

    // --- canon y ebitda ---
    r.canonFijo[i] = u.canonFijoActivo ? u.canonFijoMM * 1e6 : 0;
    r.canonVariable[i] = u.canonVariableActivo ? E * u.canonVariable : 0;
    r.canonPct[i] = u.canonPctActivo ? r.ingresosBrutos[i] * (u.canonPct / 100) : 0;
    r.canonTotal[i] = r.canonFijo[i] + r.canonVariable[i] + r.canonPct[i];
    r.ebitda[i] = r.ingresosBrutos[i] - r.opexTotal[i] - r.canonTotal[i];

    // --- capex y depreciacion ---
    r.capexDirecto[i] = -(u.capexAnual[i] ?? 0) * 1e6;
    r.capexComun[i] = -(esc.capexComun[i] ?? 0) * 1e6 * pctCapexComun;
    r.capexTotal[i] = r.capexDirecto[i] + r.capexComun[i];
    capexAcum += (u.capexAnual[i] ?? 0) + (esc.capexComun[i] ?? 0) * pctCapexComun;
    r.baseDepreciable[i] = Math.max(0, (capexAcum - u.capexNoDepreciable) * 1e6);

    const vida = b.vidaUtilDepreciacion;
    const vidaRigi = vida * (b.rigiPctVidaUtil / 100);
    if (anio < u.anioInicioOp) {
      r.depreciacion[i] = 0;
    } else if (b.rigiActivo && b.rigiAmortAcelerada) {
      r.depreciacion[i] = anio - u.anioInicioOp < vidaRigi ? r.baseDepreciable[i] / vidaRigi : 0;
    } else {
      r.depreciacion[i] = anio - u.anioInicioOp < vida ? r.baseDepreciable[i] / vida : 0;
    }
    r.ebit[i] = r.ebitda[i] - r.depreciacion[i];

    // --- standalone (informativo) ---
    r.impuestoStandalone[i] = Math.max(0, (r.ebit[i] * tasaImp) / 100);
    r.nopatStandalone[i] = r.ebit[i] - r.impuestoStandalone[i];
    r.fcffStandalone[i] = r.nopatStandalone[i] + r.depreciacion[i] + r.capexTotal[i];
    r.fcffAcumulado[i] = (i === 0 ? 0 : r.fcffAcumulado[i - 1]) + r.fcffStandalone[i];

    // --- muelle ---
    if (u.parcelaMedia <= 0 || u.rendimientoDia <= 0 || b.diasOperativos <= 0) {
      r.ocupacionMuelle[i] = 0;
      r.recaladas[i] = 0;
    } else {
      r.recaladas[i] = E / u.parcelaMedia;
      const estadia =
        u.parcelaMedia / (u.rendimientoDia * (1 - u.tiempoNoOperativo / 100)) + u.diasFijosRecalada;
      r.ocupacionMuelle[i] =
        (r.recaladas[i] * estadia) / b.diasOperativos / Math.max(1, b.sitiosAtraque);
    }
  });

  return r;
}

export function calcular(esc: Escenario): ResultadoConsolidado {
  const b = esc.base;
  const n = b.horizonte + 1;
  const anios = Array.from({ length: n }, (_, i) => b.anioBase + i);

  const porUnidad = {} as Record<Unidad, ResultadoUnidad>;
  UNIDADES.forEach((u) => { porUnidad[u] = calcularUnidad(esc, u, anios); });

  const c = { anios, porUnidad } as ResultadoConsolidado;
  const campos = [
    "toneladasTotales", "ingresosBrutos", "opexTotal", "canonTotal", "ebitda",
    "depreciacion", "ebit", "idycbPagado", "idycbRecuperado", "drei", "tasaEdificacion",
    "impuestoDeterminado", "memoAhorroIIBB", "memoAhorroMunicipal", "ahorroDebCred",
    "impuestoNeto", "memoIVAInversiones", "nopat", "capexTotal", "fcff",
    "deudaDesembolso", "deudaIntereses", "deudaAmortizacion", "deudaSaldo",
    "escudoFiscal", "fcfe", "servicioDeuda", "fcffAcumulado", "fcfeAcumulado",
    "ocupacionMuelle",
  ] as const;
  campos.forEach((k) => { (c as any)[k] = serie(n); });
  c.dscr = new Array(n).fill(null);

  const suma = (i: number, sel: (r: ResultadoUnidad) => number[]) =>
    UNIDADES.reduce((acc, u) => acc + sel(porUnidad[u])[i], 0);

  const tasaImp = b.rigiActivo ? b.rigiTasaImpuesto : b.tasaImpuestoGeneral;

  anios.forEach((anio, i) => {
    c.toneladasTotales[i] = suma(i, (r) => r.toneladasEfectivas);
    c.ingresosBrutos[i] = suma(i, (r) => r.ingresosBrutos);
    c.opexTotal[i] = suma(i, (r) => r.opexTotal);
    c.canonTotal[i] = suma(i, (r) => r.canonTotal);
    c.ebitda[i] = suma(i, (r) => r.ebitda);
    c.depreciacion[i] = suma(i, (r) => r.depreciacion);
    c.ebit[i] = c.ebitda[i] - c.depreciacion[i];
    c.capexTotal[i] = suma(i, (r) => r.capexTotal);
    c.ocupacionMuelle[i] = suma(i, (r) => r.ocupacionMuelle);

    c.idycbPagado[i] = c.capexTotal[i] < 0 ? (c.capexTotal[i] * b.idycbAlicuota) / 100 : 0;
    c.impuestoDeterminado[i] = Math.max(0, (c.ebit[i] * tasaImp) / 100);

    const dentroRigi = b.rigiActivo && anio >= b.rigiAnioInicio;
    c.memoAhorroIIBB[i] =
      dentroRigi && anio < b.rigiAnioInicio + b.rigiIIBBAnios
        ? c.ingresosBrutos[i] * (b.rigiIIBBPct / 100) : 0;
    c.memoAhorroMunicipal[i] =
      dentroRigi && anio < b.rigiAnioInicio + b.rigiMunicipalAnios
        ? c.ingresosBrutos[i] * (b.rigiMunicipalPorMil / 1000) : 0;
    c.ahorroDebCred[i] =
      dentroRigi && b.rigiDebCredActivo
        ? Math.min(c.ingresosBrutos[i] * (b.rigiDebCredPct / 100), c.impuestoDeterminado[i]) : 0;

    if (i === 0) {
      c.idycbRecuperado[i] = 0;
    } else {
      const pagadoAcum = -c.idycbPagado.slice(0, i + 1).reduce((a, v) => a + v, 0);
      const recupAcum = c.idycbRecuperado.slice(0, i).reduce((a, v) => a + v, 0);
      const disponible = Math.max(0, pagadoAcum - recupAcum);
      const cupo = Math.max(0, c.impuestoDeterminado[i] - c.ahorroDebCred[i]);
      c.idycbRecuperado[i] = Math.min(disponible, cupo);
    }
    c.impuestoNeto[i] = Math.max(
      0, c.impuestoDeterminado[i] - c.ahorroDebCred[i] - c.idycbRecuperado[i]
    );

    const exentoMunicipal =
      b.rigiActivo && anio - b.rigiAnioInicio >= 0 && anio - b.rigiAnioInicio < b.rigiMunicipalAnios;
    if (c.ingresosBrutos[i] <= 0 || exentoMunicipal) {
      c.drei[i] = 0;
    } else {
      const porAlicuota = (c.ingresosBrutos[i] * b.rigiMunicipalPorMil) / 1000;
      const minimo =
        b.dreiTipoCambio > 0 ? (b.dreiMinimoMensualARS * 12) / b.dreiTipoCambio : 0;
      c.drei[i] = -Math.max(porAlicuota, minimo);
    }
    c.tasaEdificacion[i] =
      c.capexTotal[i] < 0
        ? (c.capexTotal[i] * (anio - b.anioBase < 5 ? b.tasaEdifPrimeros5 : b.tasaEdifPost5)) / 1000
        : 0;
    c.memoIVAInversiones[i] = b.rigiCertivaActivo ? -c.capexTotal[i] * 0.21 : 0;

    c.nopat[i] = c.ebit[i] - c.impuestoNeto[i];
    const tasas = b.tasasEnFCFF ? c.idycbPagado[i] + c.drei[i] + c.tasaEdificacion[i] : 0;
    c.fcff[i] = c.nopat[i] + c.depreciacion[i] + c.capexTotal[i] + tasas;

    // --- deuda ---
    c.deudaDesembolso[i] = i === 0 ? b.montoDeudaMM * 1e6 : 0;
    if (i === 0) {
      c.deudaIntereses[i] = 0;
      c.deudaAmortizacion[i] = 0;
      c.deudaSaldo[i] = c.deudaDesembolso[i];
    } else {
      c.deudaIntereses[i] = (-c.deudaSaldo[i - 1] * b.tasaDeuda) / 100;
      c.deudaAmortizacion[i] =
        b.plazoDeuda > 0 && i <= b.plazoDeuda
          ? -Math.min(c.deudaSaldo[i - 1], (b.montoDeudaMM * 1e6) / b.plazoDeuda)
          : 0;
      c.deudaSaldo[i] = c.deudaSaldo[i - 1] + c.deudaDesembolso[i] + c.deudaAmortizacion[i];
    }
    c.escudoFiscal[i] = (-c.deudaIntereses[i] * tasaImp) / 100;
    c.fcfe[i] =
      c.fcff[i] + c.deudaDesembolso[i] + c.deudaIntereses[i] +
      c.deudaAmortizacion[i] + c.escudoFiscal[i];
    c.servicioDeuda[i] = -(c.deudaIntereses[i] + c.deudaAmortizacion[i]);
    c.dscr[i] = c.servicioDeuda[i] > 0 ? c.ebitda[i] / c.servicioDeuda[i] : null;

    c.fcffAcumulado[i] = (i === 0 ? 0 : c.fcffAcumulado[i - 1]) + c.fcff[i];
    c.fcfeAcumulado[i] = (i === 0 ? 0 : c.fcfeAcumulado[i - 1]) + c.fcfe[i];
  });

  c.fcffSinUnidad = {} as Record<Unidad, number[]>;
  UNIDADES.forEach((u) => {
    c.fcffSinUnidad[u] = c.fcff.map((v, i) => v - porUnidad[u].fcffStandalone[i]);
  });

  return c;
}

export function kpis(esc: Escenario, c: ResultadoConsolidado): KPIs {
  const capexTotal = -c.capexTotal.reduce((a, v) => a + v, 0);
  const idxPayback = c.fcffAcumulado.findIndex((v) => v > 0);
  const dscrValidos = c.dscr.filter((v): v is number => v !== null);
  const ebitdaAcum = c.ebitda.reduce((a, v) => a + v, 0);
  const ingresosAcum = c.ingresosBrutos.reduce((a, v) => a + v, 0);
  const tnMax = Math.max(...c.toneladasTotales);
  return {
    tirProyecto: tir(c.fcff),
    tirAccionista: esc.base.montoDeudaMM > 0 ? tir(c.fcfe) : null,
    capexTotal,
    paybackAnio: idxPayback >= 0 ? c.anios[idxPayback] : null,
    dscrMinimo: dscrValidos.length ? Math.min(...dscrValidos) : null,
    toneladasMaximas: tnMax,
    ocupacionMaxima: Math.max(...c.ocupacionMuelle),
    ebitdaAcumulado: ebitdaAcum,
    ingresosAcumulados: ingresosAcum,
    margenEbitda: ingresosAcum ? ebitdaAcum / ingresosAcum : 0,
    capexPorToneladaInstalada: tnMax ? capexTotal / tnMax : 0,
  };
}
