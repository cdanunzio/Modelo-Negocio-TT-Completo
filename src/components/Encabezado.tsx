import Image from "next/image";
import { Salir } from "@/components/Acceso";
import EnlaceSeguro from "@/components/EnlaceSeguro";

export default function Encabezado() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <EnlaceSeguro href="/" className="flex items-center">
          <Image
            src="/logo-tt.png"
            alt="Terminal Timbúes"
            width={2046}
            height={687}
            priority
            className="h-8 w-auto"
          />
          <span className="sr-only">Modelo de negocio</span>
        </EnlaceSeguro>
        <nav className="flex items-center gap-4 text-sm">
          <EnlaceSeguro href="/demo" className="text-slate-600 hover:text-puerto-700">Demo</EnlaceSeguro>
          <EnlaceSeguro href="/manual" className="text-slate-600 hover:text-puerto-700">Manual</EnlaceSeguro>
          <EnlaceSeguro href="/glosario" className="text-slate-600 hover:text-puerto-700">Glosario</EnlaceSeguro>
          <Salir />
        </nav>
      </div>
    </header>
  );
}
