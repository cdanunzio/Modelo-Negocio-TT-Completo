"use client";
import { ReactNode, useEffect, useState } from "react";

/**
 * Ficha explicativa de un campo. Se abre como ventana: hay lugar para decir qué
 * es el dato, para qué se usa, cómo se carga y sobre qué resultado impacta, sin
 * el apuro de un globito que desaparece al mover el mouse.
 */
export interface Ficha {
  /** Qué es el dato, en una o dos frases y sin jerga. */
  que: string;
  /** Para qué sirve dentro del modelo. */
  paraQue?: string;
  /** Cómo se carga: unidad, formato, valores razonables. */
  caracteristica?: string;
  /** Qué resultados se mueven cuando este número cambia. */
  impacta?: string;
  /** Cómo se llama esto en la jerga financiera o portuaria. */
  termino?: string;
}

export function FichaCampo({ titulo, ficha }: { titulo: string; ficha: Ficha }) {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    if (!abierta) return;
    const cerrar = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierta(false); };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={`Qué es ${titulo}`}
        className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full
                   border border-slate-300 text-[10px] font-bold text-slate-500
                   hover:border-puerto-500 hover:bg-puerto-50 hover:text-puerto-700"
      >?</button>

      {abierta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setAbierta(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{titulo}</h4>
                {ficha.termino && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    En la jerga: {ficha.termino}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setAbierta(false)}
                className="text-xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Cerrar">×</button>
            </div>

            <dl className="space-y-3 px-5 py-4 text-sm leading-relaxed">
              <Parte rotulo="Qué es" texto={ficha.que} />
              <Parte rotulo="Para qué sirve" texto={ficha.paraQue} />
              <Parte rotulo="Cómo se carga" texto={ficha.caracteristica} />
              <Parte rotulo="Dónde impacta" texto={ficha.impacta} />
            </dl>
          </div>
        </div>
      )}
    </>
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

/** Globito corto, para aclaraciones sueltas que no justifican una ficha. */
export function Ayuda({ children }: { children: ReactNode }) {
  return (
    <span className="group relative ml-1 inline-flex">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full
                       border border-slate-300 text-[10px] font-bold text-slate-500">?</span>
      <span className="pointer-events-none absolute left-5 top-0 z-30 hidden w-80 rounded-md border
                       border-slate-300 bg-white p-2 text-xs leading-relaxed text-slate-700 shadow-lg
                       group-hover:block">
        {children}
      </span>
    </span>
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
