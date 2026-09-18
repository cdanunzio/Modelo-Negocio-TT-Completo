import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modelo de Negocio - Terminal Portuaria Timbúes",
  description:
    "Simulador económico-financiero del puerto: agrograneles, fertilizantes y cargas generales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
