import Link from "next/link";
import { escenarioBase } from "@/lib/model/defaults";
import Editor from "@/components/editor/Editor";

export const metadata = { title: "Demo · Modelo Terminal Portuaria Timbúes" };

/**
 * Vista de demostración: corre el escenario base sin base de datos ni login.
 * Sirve para ver la aplicación funcionando antes de conectar Supabase.
 */
export default function Demo() {
  return (
    <>
      <header className="border-b border-amber-300 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-3">
          <div>
            <p className="font-semibold text-amber-900">Modo demostración</p>
            <p className="text-xs text-amber-800">
              Escenario base, sin base de datos: se puede navegar y recalcular, pero no guardar.
            </p>
          </div>
          <Link href="/" className="btn-primario">Ir a los escenarios</Link>
        </div>
      </header>
      <Editor id="demo" nombre="Escenario base (demostración)" version={1}
              datosIniciales={escenarioBase()} soloLectura />
    </>
  );
}
