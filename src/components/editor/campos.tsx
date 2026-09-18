"use client";
import { ReactNode } from "react";

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

interface CampoProps {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  unidad?: string;
  ayuda?: ReactNode;
  decimales?: number;
  min?: number;
  soloLectura?: boolean;
}

export function CampoNumero({
  etiqueta, valor, onChange, unidad, ayuda, decimales = 2, min, soloLectura,
}: CampoProps) {
  return (
    <div className="grid grid-cols-[1fr,9rem,7rem] items-center gap-2 border-b border-slate-100 py-1.5">
      <label className="text-sm text-slate-700">
        {etiqueta}
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </label>
      <input
        type="number"
        step={decimales === 0 ? 1 : Math.pow(10, -decimales)}
        min={min}
        value={Number.isFinite(valor) ? valor : 0}
        readOnly={soloLectura}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={soloLectura ? "campo-ref" : "campo"}
      />
      <span className="text-xs text-slate-500">{unidad}</span>
    </div>
  );
}

export function CampoTexto({
  etiqueta, valor, onChange, ayuda,
}: { etiqueta: string; valor: string; onChange: (v: string) => void; ayuda?: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr,16rem] items-center gap-2 border-b border-slate-100 py-1.5">
      <label className="text-sm text-slate-700">
        {etiqueta}
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </label>
      <input value={valor} onChange={(e) => onChange(e.target.value)} className="campo campo-texto" />
    </div>
  );
}

export function CampoSwitch({
  etiqueta, valor, onChange, ayuda, textoSi = "Sí", textoNo = "No",
}: {
  etiqueta: string; valor: boolean; onChange: (v: boolean) => void;
  ayuda?: ReactNode; textoSi?: string; textoNo?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr,9rem,7rem] items-center gap-2 border-b border-slate-100 py-1.5">
      <label className="text-sm text-slate-700">
        {etiqueta}
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </label>
      <button type="button" onClick={() => onChange(!valor)}
        className={`rounded border px-2 py-1 text-sm font-medium ${
          valor ? "border-puerto-500 bg-puerto-100 text-puerto-700"
                : "border-slate-300 bg-white text-slate-500"}`}>
        {valor ? textoSi : textoNo}
      </button>
      <span />
    </div>
  );
}

export function CampoOpciones<T extends string | number>({
  etiqueta, valor, opciones, onChange, ayuda,
}: {
  etiqueta: string; valor: T; opciones: { valor: T; texto: string }[];
  onChange: (v: T) => void; ayuda?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr,16rem] items-center gap-2 border-b border-slate-100 py-1.5">
      <label className="text-sm text-slate-700">
        {etiqueta}
        {ayuda && <Ayuda>{ayuda}</Ayuda>}
      </label>
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
