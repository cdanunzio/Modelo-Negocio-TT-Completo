import Link from "next/link";
import { MANUAL } from "@/lib/contenido";

export default function Manual() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-puerto-700">← Volver</Link>
      <h1 className="mt-2 text-3xl font-bold text-puerto-700">Manual del modelo</h1>
      <p className="mt-2 text-slate-600">
        Escrito para que lo pueda leer alguien que no trabaja en finanzas. Si aparece una palabra
        que no conocés, está explicada en el <Link href="/glosario" className="text-puerto-700 underline">glosario</Link>.
      </p>
      <div className="mt-8 space-y-8">
        {MANUAL.map((s) => (
          <section key={s.titulo}>
            <h2 className="border-b border-puerto-200 pb-1 text-xl font-semibold text-slate-900">
              {s.titulo}
            </h2>
            <div className="mt-3 space-y-3">
              {s.parrafos.map((p, i) => (
                <p key={i} className="leading-relaxed text-slate-700">{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Los valores que trae el escenario base son preliminares: sirven para que la aplicación
        funcione y se pueda ver la mecánica, no para decidir.
      </p>
    </main>
  );
}
