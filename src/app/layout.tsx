import type { Metadata, Viewport } from "next";
import "./globals.css";
import Acceso from "@/components/Acceso";
import RegistrarSW from "@/components/RegistrarSW";

export const metadata: Metadata = {
  title: "Modelo de Negocio - Terminal Portuaria Timbúes",
  description:
    "Simulador económico-financiero del puerto: agrograneles, fertilizantes y cargas generales.",
  manifest: "/manifest.webmanifest",
  applicationName: "Modelo TT",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Modelo TT",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#27500a",
  width: "device-width",
  initialScale: 1,
  // Que el usuario pueda agrandar: las tablas del modelo se leen mejor con zoom.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <RegistrarSW />
        <Acceso>{children}</Acceso>
      </body>
    </html>
  );
}
