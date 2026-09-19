/**
 * Piezas comunes de la exportación a Excel.
 *
 * El libro que se exporta no es una foto de números: es el modelo entero
 * escrito en fórmulas. Sólo quedan como números los datos que alguien carga
 * (toneladas, tarifas, costos, inversión, alícuotas); todo lo demás se calcula
 * en la planilla, así que se puede auditar celda por celda y tocar un dato para
 * ver el efecto sin volver a la aplicación.
 *
 * Este archivo tiene lo mínimo para escribir celdas y, sobre todo, la clase
 * `Hoja`: lleva la cuenta de en qué fila quedó cada concepto para que las
 * fórmulas puedan referenciarlo sin números de fila escritos a mano.
 */

export type Celda = {
  value?: string | number | boolean | null;
  type?: typeof String | typeof Number | typeof Boolean | "Formula";
  fontWeight?: "bold";
  align?: "left" | "right" | "center";
  format?: string;
  backgroundColor?: string;
  color?: string;
  wrap?: boolean;
  fontStyle?: "italic";
} | null;

export const FORMATO_MONEDA = "#,##0";
export const FORMATO_DECIMAL = "#,##0.000";
export const FORMATO_PCT = "0.0%";
export const FORMATO_ENTERO = "0";
export const VERDE = "#1B5E3F";
export const CELESTE = "#E8F0FE";

export const texto = (v: string, opts: Partial<NonNullable<Celda>> = {}): Celda =>
  ({ value: v, type: String, ...opts });

export const numero = (
  v: number | null | undefined, format = FORMATO_MONEDA, opts: Partial<NonNullable<Celda>> = {}
): Celda =>
  v === null || v === undefined || !Number.isFinite(v)
    ? null
    : { value: Number(v), type: Number, format, ...opts };

/**
 * Celda con fórmula. Se guarda sin el signo igual: el formato xlsx almacena la
 * expresión pelada y Excel le pone el "=" al mostrarla.
 */
export const formula = (
  expresion: string, format = FORMATO_MONEDA, opts: Partial<NonNullable<Celda>> = {}
): Celda =>
  ({ value: expresion.replace(/^=/, ""), type: "Formula", format, ...opts });

export const vacia = (): Celda[] => [];

export const titulo = (t: string, ancho: number): Celda[] => [
  { value: t, type: String, fontWeight: "bold", backgroundColor: VERDE, color: "#FFFFFF" },
  ...Array(Math.max(0, ancho - 1)).fill({ backgroundColor: VERDE } as Celda),
];

/** A, B, ... Z, AA, AB: la letra de columna que usa Excel (0 = A). */
export function columna(indice: number): string {
  let n = indice;
  let letras = "";
  do {
    letras = String.fromCharCode(65 + (n % 26)) + letras;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letras;
}

/** Excel no admite más de 31 caracteres ni : \ / ? * [ ] en el nombre de una hoja. */
export function nombreHoja(n: string): string {
  return n.replace(/[:\\/?*[\]]/g, " ").slice(0, 31);
}

/**
 * Una hoja en construcción. Guarda las filas y, para cada concepto con clave,
 * en qué número de fila quedó: así una fórmula puede decir "la facturación de
 * este año" en vez de "B37" y no se rompe si mañana se agrega una fila arriba.
 */
export class Hoja {
  readonly filas: Celda[][] = [];
  private readonly indice = new Map<string, number>();

  constructor(readonly nombre: string) {}

  /** Agrega una fila y devuelve su número (base 1, como en Excel). */
  agregar(celdas: Celda[], clave?: string): number {
    this.filas.push(celdas);
    const n = this.filas.length;
    if (clave) {
      if (this.indice.has(clave)) throw new Error(`clave repetida "${clave}" en ${this.nombre}`);
      this.indice.set(clave, n);
    }
    return n;
  }

  /**
   * Aparta el número de fila antes de escribirla. Hace falta para las filas
   * que se referencian a sí mismas, como los acumulados: la fórmula del año
   * necesita saber en qué fila está el año anterior.
   */
  reservar(clave: string): number {
    if (this.indice.has(clave)) throw new Error(`clave repetida "${clave}" en ${this.nombre}`);
    const n = this.filas.length + 1;
    this.indice.set(clave, n);
    return n;
  }

  /**
   * Aparta varias filas consecutivas. Sirve para los bloques que se miran
   * entre sí, como el cuadro de marcha de la deuda: los intereses dependen del
   * saldo del año anterior y el saldo, de los intereses del mismo año.
   */
  reservarBloque(claves: string[]) {
    let n = this.filas.length;
    for (const clave of claves) {
      if (this.indice.has(clave)) throw new Error(`clave repetida "${clave}" en ${this.nombre}`);
      this.indice.set(clave, ++n);
    }
  }

  /** Escribe una fila que ya tenía su número apartado con `reservar`. */
  escribirReservada(clave: string, celdas: Celda[]) {
    this.filas.push(celdas);
    if (this.indice.get(clave) !== this.filas.length) {
      throw new Error(`la fila "${clave}" no quedó donde se había reservado en ${this.nombre}`);
    }
  }

  blanco() { this.filas.push([]); }

  tiene(clave: string): boolean { return this.indice.has(clave); }

  fila(clave: string): number {
    const f = this.indice.get(clave);
    if (!f) throw new Error(`no existe la fila "${clave}" en la hoja ${this.nombre}`);
    return f;
  }

  /** Referencia relativa dentro de la hoja: B12. */
  ref(clave: string, col: number): string {
    return `${columna(col)}${this.fila(clave)}`;
  }

  /** Referencia con fila y columna fijas: $B$12. Para los datos de entrada. */
  fijo(clave: string, col = 1): string {
    return `$${columna(col)}$${this.fila(clave)}`;
  }

  /** Rango horizontal de una fila: B12:AF12. */
  rango(clave: string, desde: number, hasta: number): string {
    const f = this.fila(clave);
    return `${columna(desde)}${f}:${columna(hasta)}${f}`;
  }

  /** Rango vertical de una columna entre dos claves: $F$8:$F$14. */
  rangoVertical(claveDesde: string, claveHasta: string, col: number): string {
    const c = columna(col);
    return `$${c}$${this.fila(claveDesde)}:$${c}$${this.fila(claveHasta)}`;
  }

  /** Referencia desde otra hoja: 'Agrograneles'!B12. */
  externa(clave: string, col: number): string {
    return `'${this.nombre}'!${this.ref(clave, col)}`;
  }

  externaFija(clave: string, col = 1): string {
    return `'${this.nombre}'!${this.fijo(clave, col)}`;
  }

  externaRango(clave: string, desde: number, hasta: number): string {
    return `'${this.nombre}'!${this.rango(clave, desde, hasta)}`;
  }
}

/** Fila de dato de entrada: rótulo, valor y explicación. */
export function entrada(
  rotulo: string, valor: number | string | boolean, unidad: string, nota = ""
): Celda[] {
  const celda: Celda =
    typeof valor === "number"
      ? numero(valor, Number.isInteger(valor) && Math.abs(valor) < 10000 ? FORMATO_ENTERO : FORMATO_DECIMAL,
          { backgroundColor: CELESTE })
      : texto(typeof valor === "boolean" ? (valor ? "Sí" : "No") : valor, { backgroundColor: CELESTE });
  return [texto(rotulo), celda, texto(unidad), texto(nota, { wrap: true })];
}
