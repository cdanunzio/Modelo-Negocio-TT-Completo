"use client";
import { useState, ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hayCambiosPendientes, marcarCambiosPendientes } from "@/lib/cambiosPendientes";
import Confirmar from "./Confirmar";

/**
 * Un enlace que, si hay cambios sin guardar, pregunta antes de irse.
 *
 * Reemplaza a `Link` en todo lo que saque al usuario del editor. Para el caso
 * de cerrar la pestaña o recargar, el aviso lo pone el propio navegador desde
 * el editor; acá se cubre la navegación dentro de la aplicación, que es la que
 * el navegador no puede interceptar.
 */
export default function EnlaceSeguro({
  href, className, children, onNavegar,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onNavegar?: () => void;
}) {
  const router = useRouter();
  const [preguntando, setPreguntando] = useState(false);

  function alHacerClic(e: MouseEvent<HTMLAnchorElement>) {
    if (!hayCambiosPendientes()) return;
    e.preventDefault();
    setPreguntando(true);
  }

  function salirIgual() {
    marcarCambiosPendientes(false);
    setPreguntando(false);
    onNavegar?.();
    router.push(href);
  }

  return (
    <>
      <Link href={href} className={className} onClick={alHacerClic}>
        {children}
      </Link>
      <Confirmar
        abierto={preguntando}
        titulo="Tenés cambios sin guardar"
        mensaje={
          <>
            Si salís ahora se pierden todos los cambios que hiciste desde el último guardado.
            Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Salir sin guardar"
        textoCancelar="Seguir editando"
        peligro
        onConfirmar={salirIgual}
        onCancelar={() => setPreguntando(false)}
      />
    </>
  );
}
