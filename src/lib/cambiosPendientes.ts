/**
 * Un aviso compartido de "hay cambios sin guardar".
 *
 * El editor lo enciende cuando el escenario difiere de lo último guardado, y
 * los enlaces de navegación lo consultan antes de llevarse al usuario a otra
 * pantalla. Está acá, fuera de React, porque lo tienen que ver componentes que
 * no son hijos del editor — el encabezado, por ejemplo.
 */

let hayCambios = false;
const oyentes = new Set<(v: boolean) => void>();

export function marcarCambiosPendientes(valor: boolean) {
  if (hayCambios === valor) return;
  hayCambios = valor;
  oyentes.forEach((f) => f(valor));
}

export function hayCambiosPendientes(): boolean {
  return hayCambios;
}

export function escucharCambiosPendientes(f: (v: boolean) => void): () => void {
  oyentes.add(f);
  return () => { oyentes.delete(f); };
}
