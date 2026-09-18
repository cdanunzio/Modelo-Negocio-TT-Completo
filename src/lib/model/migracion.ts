import { Escenario, Inversor, UNIDADES, Unidad } from "./types";

/**
 * Pone al día un escenario guardado con una versión anterior del modelo.
 *
 * Los escenarios viven en la base como JSON, así que un cambio en la estructura
 * dejaría ilegibles los que ya estaban guardados. Esta función los adapta al
 * abrirlos, sin tocar la base: recién cuando alguien guarda, el escenario queda
 * almacenado con la estructura nueva.
 */
export function migrarEscenario(datos: Escenario): Escenario {
  const esc: Escenario = JSON.parse(JSON.stringify(datos));

  // Antes cada inversor tenía un único porcentaje para todo el proyecto.
  // Ahora tiene uno por unidad de negocio: se replica el viejo en las tres.
  esc.inversores = (esc.inversores ?? []).map((inv) => {
    const viejo = inv as Inversor & { participacion?: number };
    if (viejo.participaciones && UNIDADES.every((u) => typeof viejo.participaciones[u] === "number")) {
      return inv;
    }
    const unico = typeof viejo.participacion === "number" ? viejo.participacion : 0;
    const participaciones = {} as Record<Unidad, number>;
    UNIDADES.forEach((u) => { participaciones[u] = viejo.participaciones?.[u] ?? unico; });
    const { participacion: _descartado, ...resto } = viejo;
    return { ...resto, participaciones } as Inversor;
  });

  return esc;
}
