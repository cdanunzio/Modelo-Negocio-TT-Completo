import Encabezado from "@/components/Encabezado";
import Editor from "@/components/editor/Editor";
import { escenarioBase } from "@/lib/model/defaults";

export const metadata = { title: "Escenario nuevo · Modelo Terminal Portuaria Timbúes" };

/**
 * Un escenario que todavía no existe en la base. Se puede recorrer y editar
 * entero, pero no queda registrado hasta que se guarda: así nadie llena la
 * lista de escenarios vacíos creados por error.
 */
export default function Nuevo() {
  const hoy = new Date().toLocaleDateString("es-AR");
  return (
    <>
      <Encabezado />
      <Editor
        id="nuevo"
        nombre={`Escenario ${hoy}`}
        version={1}
        datosIniciales={escenarioBase()}
        borrador
      />
    </>
  );
}
