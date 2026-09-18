import Encabezado from "@/components/Encabezado";
import CargarEscenario from "@/components/CargarEscenario";

export const dynamic = "force-dynamic";

export default function PaginaEscenario({ params }: { params: { id: string } }) {
  return (
    <>
      <Encabezado />
      <CargarEscenario id={params.id} />
    </>
  );
}
