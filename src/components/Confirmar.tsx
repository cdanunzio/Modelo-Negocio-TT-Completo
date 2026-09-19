"use client";
import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Ventana de confirmación para las acciones que no se pueden deshacer solas:
 * salir perdiendo cambios, archivar un escenario.
 *
 * Siempre dice qué se pierde exactamente, no un "¿está seguro?" genérico.
 */
export default function Confirmar({
  abierto, titulo, mensaje, textoConfirmar, textoCancelar = "Volver",
  peligro = false, onConfirmar, onCancelar, children,
}: {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  textoConfirmar: string;
  textoCancelar?: string;
  peligro?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => { if (e.key === "Escape") onCancelar(); };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto, onCancelar]);

  if (!abierto || typeof document === "undefined") return null;

  // Se monta al final del body: así queda por encima de los encabezados fijos
  // de las tablas, que crean su propio contexto de apilado.
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onCancelar}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
        <div className="mt-2 text-sm leading-relaxed text-slate-600">{mensaje}</div>
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancelar} className="btn-secundario">{textoCancelar}</button>
          <button
            onClick={onConfirmar}
            className={peligro
              ? "btn bg-red-700 text-white hover:bg-red-600"
              : "btn-primario"}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
