import Link from "next/link";
import { Salir } from "@/components/Acceso";

export default function Encabezado() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="font-semibold text-puerto-700">
          Terminal Portuaria Timbúes
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/demo" className="text-slate-600 hover:text-puerto-700">Demo</Link>
          <Link href="/manual" className="text-slate-600 hover:text-puerto-700">Manual</Link>
          <Link href="/glosario" className="text-slate-600 hover:text-puerto-700">Glosario</Link>
          <Salir />
        </nav>
      </div>
    </header>
  );
}
