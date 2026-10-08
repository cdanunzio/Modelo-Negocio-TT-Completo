"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Ficha explicativa de un campo. Se abre como ventana: hay lugar para las
 * cuatro preguntas que se hace quien carga un dato —qué es, en qué unidad va,
 * cómo se ve un valor razonable y qué resultado mueve— sin el apuro de un
 * globito que desaparece al mover el mouse.
 */
export interface Ficha {
  /** Qué es el dato, en una o dos frases y sin jerga. */
  que: string;
  /** Tipo de dato y unidad: años, USD/tn, %, texto, Sí/No. */
  tipo: string;
  /** Un valor concreto, del escenario base o de referencia de la industria. */
  ejemplo?: string;
  /** Qué resultados se mueven cuando este dato cambia. */
  mueve: string;
  /** Cómo se llama esto en la jerga financiera o portuaria. */
  termino?: string;
  /** El dato contado con palabras de todos los días, para quien no es de finanzas. */
  simple?: string;
  /** Cómo entra en el cálculo, con números de ejemplo. */
  cuenta?: string;
  /** Qué área conoce o define el dato. */
  quien?: string;
  /** El error más común al cargarlo o al leerlo. */
  cuidado?: string;
}

/**
 * Ventana modal centrada.
 *
 * Se monta al final del `<body>` con un portal, no donde está el botón que la
 * abre. Es a propósito: los encabezados fijos de las tablas y las tarjetas con
 * recorte propio crean su propio contexto de apilado, y una ventana dibujada
 * adentro les queda por debajo aunque tenga más z-index. Montada en el body,
 * siempre aparece en primer plano. Cierra con Escape o con un clic afuera.
 */
export function Modal({
  titulo, subtitulo, onCerrar, children,
}: {
  titulo: string; subtitulo?: string; onCerrar: () => void; children: ReactNode;
}) {
  useEffect(() => {
    const cerrar = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [onCerrar]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-lg bg-white text-left shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <div>
            <h4 className="text-base font-semibold text-slate-900">{titulo}</h4>
            {subtitulo && <p className="mt-0.5 text-xs text-slate-500">{subtitulo}</p>}
          </div>
          <button type="button" onClick={onCerrar}
            className="text-xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Botón con signo de pregunta que abre la ventana.
 *
 * Es una ventana y no un globito flotante a propósito: dentro de una tabla
 * ancha, un globito se dibuja fuera de la pantalla y no hay forma de llegar
 * hasta él.
 */
function Ventana({
  titulo, subtitulo, etiquetaBoton, children,
}: {
  titulo: string; subtitulo?: string; etiquetaBoton?: string; children: ReactNode;
}) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setAbierta(true); }}
        aria-label={etiquetaBoton ?? `Qué es ${titulo}`}
        className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                   border border-slate-300 text-[11px] font-bold text-slate-500
                   hover:border-puerto-500 hover:bg-puerto-50 hover:text-puerto-700"
      >?</button>

      {abierta && (
        <Modal titulo={titulo} subtitulo={subtitulo} onCerrar={() => setAbierta(false)}>
          {children}
        </Modal>
      )}
    </>
  );
}

export function FichaCampo({ titulo, ficha }: { titulo: string; ficha: Ficha }) {
  return (
    <Ventana titulo={titulo} subtitulo={ficha.termino ? `En la jerga: ${ficha.termino}` : undefined}>
      <dl className="space-y-3 px-5 py-4 text-sm leading-relaxed">
        <Parte rotulo="Qué es" texto={ficha.que} />
        <Parte rotulo="En términos generales" texto={ficha.simple} />
        <Parte rotulo="Tipo de dato" texto={ficha.tipo} />
        <Parte rotulo="Ejemplo" texto={ficha.ejemplo} />
        <Parte rotulo="Cómo interviene en el cálculo" texto={ficha.cuenta} />
        <Parte rotulo="Qué mueve" texto={ficha.mueve} />
        <Parte rotulo="Área responsable" texto={ficha.quien} />
        {ficha.cuidado && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">A tener en cuenta</dt>
            <dd className="mt-0.5 text-amber-900">{ficha.cuidado}</dd>
          </div>
        )}
      </dl>
    </Ventana>
  );
}

function Parte({ rotulo, texto }: { rotulo: string; texto?: string }) {
  if (!texto) return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{rotulo}</dt>
      <dd className="mt-0.5 text-slate-700">{texto}</dd>
    </div>
  );
}

/**
 * Aclaración corta que no justifica una ficha completa. Antes era un globito
 * al pasar el mouse; ahora abre la misma ventana centrada, porque dentro de
 * una tabla ancha el globito quedaba fuera de la pantalla.
 */
export function Ayuda({ titulo = "Aclaración", children }: { titulo?: string; children: ReactNode }) {
  return (
    <Ventana titulo={titulo} etiquetaBoton="Ver la aclaración">
      <div className="px-5 py-4 text-sm leading-relaxed text-slate-700">{children}</div>
    </Ventana>
  );
}

/** Etiqueta de campo: el texto, y el signo de pregunta que abre la ficha. */
function Rotulo({ etiqueta, ficha, ayuda }: { etiqueta: string; ficha?: Ficha; ayuda?: ReactNode }) {
  return (
    <label className="flex items-start text-sm text-slate-700">
      <span>{etiqueta}</span>
      {ficha && <FichaCampo titulo={etiqueta} ficha={ficha} />}
      {!ficha && ayuda && <Ayuda>{ayuda}</Ayuda>}
    </label>
  );
}

interface CampoProps {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  unidad?: string;
  ayuda?: ReactNode;
  ficha?: Ficha;
  decimales?: number;
  min?: number;
  soloLectura?: boolean;
}

export function CampoNumero({
  etiqueta, valor, onChange, unidad, ayuda, ficha, decimales = 2, min, soloLectura,
}: CampoProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2 sm:grid sm:grid-cols-[1fr,9rem,7rem] sm:items-center sm:gap-2 sm:py-1.5">
      <Rotulo etiqueta={etiqueta} ficha={ficha} ayuda={ayuda} />
      <div className="flex items-center gap-2 sm:contents">
        <input
          type="number"
          step={decimales === 0 ? 1 : Math.pow(10, -decimales)}
          min={min}
          value={Number.isFinite(valor) ? valor : 0}
          readOnly={soloLectura}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={soloLectura ? "campo-ref" : "campo"}
        />
        <span className="shrink-0 text-xs text-slate-500">{unidad}</span>
      </div>
    </div>
  );
}

export function CampoTexto({
  etiqueta, valor, onChange, ayuda, ficha,
}: {
  etiqueta: string; valor: string; onChange: (v: string) => void;
  ayuda?: ReactNode; ficha?: Ficha;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2 sm:grid sm:grid-cols-[1fr,16rem] sm:items-center sm:gap-2 sm:py-1.5">
      <Rotulo etiqueta={etiqueta} ficha={ficha} ayuda={ayuda} />
      <input value={valor} onChange={(e) => onChange(e.target.value)} className="campo campo-texto" />
    </div>
  );
}

export function CampoSwitch({
  etiqueta, valor, onChange, ayuda, ficha, textoSi = "Sí", textoNo = "No",
}: {
  etiqueta: string; valor: boolean; onChange: (v: boolean) => void;
  ayuda?: ReactNode; ficha?: Ficha; textoSi?: string; textoNo?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2 sm:grid sm:grid-cols-[1fr,9rem,7rem] sm:items-center sm:gap-2 sm:py-1.5">
      <Rotulo etiqueta={etiqueta} ficha={ficha} ayuda={ayuda} />
      <div className="flex items-center gap-2 sm:contents">
        <button type="button" onClick={() => onChange(!valor)}
          className={`rounded border px-2 py-1 text-sm font-medium ${
            valor ? "border-puerto-500 bg-puerto-100 text-puerto-700"
                  : "border-slate-300 bg-white text-slate-500"}`}>
          {valor ? textoSi : textoNo}
        </button>
        <span />
      </div>
    </div>
  );
}

export function CampoOpciones<T extends string | number>({
  etiqueta, valor, opciones, onChange, ayuda, ficha,
}: {
  etiqueta: string; valor: T; opciones: { valor: T; texto: string }[];
  onChange: (v: T) => void; ayuda?: ReactNode; ficha?: Ficha;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2 sm:grid sm:grid-cols-[1fr,16rem] sm:items-center sm:gap-2 sm:py-1.5">
      <Rotulo etiqueta={etiqueta} ficha={ficha} ayuda={ayuda} />
      <div className="flex gap-1">
        {opciones.map((o) => (
          <button key={String(o.valor)} type="button" onClick={() => onChange(o.valor)}
            className={`flex-1 rounded border px-2 py-1 text-xs font-medium ${
              valor === o.valor ? "border-puerto-500 bg-puerto-100 text-puerto-700"
                                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="tarjeta overflow-hidden">
      <h3 className="seccion">{titulo}</h3>
      <div className="p-4">{children}</div>
    </section>
  );
}
