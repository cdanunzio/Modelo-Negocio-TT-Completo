import Link from "next/link";
import { GLOSARIO } from "@/lib/contenido";

export default function Glosario() {
  const grupos = Array.from(new Set(GLOSARIO.map((t) => t.grupo)));
  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-puerto-700">← Volver</Link>
      <h1 className="mt-2 text-3xl font-bold text-puerto-700">Glosario financiero</h1>
      <p className="mt-2 text-slate-600">
        Cada término del modelo explicado en lenguaje claro, con un ejemplo y su ubicación en la
        aplicación.
      </p>
      <div className="mt-8 space-y-10">
        {grupos.map((g) => (
          <section key={g}>
            <h2 className="mb-3 border-b border-puerto-200 pb-1 text-lg font-semibold text-slate-900">{g}</h2>
            <div className="space-y-4">
              {GLOSARIO.filter((t) => t.grupo === g).map((t) => (
                <article key={t.termino} className="tarjeta p-4">
                  <h3 className="font-semibold text-puerto-700">{t.termino}</h3>
                  <p className="mt-1 leading-relaxed text-slate-700">{t.queEs}</p>
                  <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-600">
                    <span className="font-medium">Ejemplo: </span>{t.ejemplo}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">Dónde se ve: </span>{t.donde}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
