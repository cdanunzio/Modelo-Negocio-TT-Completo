import Encabezado from "@/components/Encabezado";
import HistorialLista from "@/components/HistorialLista";

export const dynamic = "force-dynamic";

export default function Historial({ params }: { params: { id: string } }) {
  return (
    <>
      <Encabezado />
      <HistorialLista id={params.id} />
    </>
  );
}
