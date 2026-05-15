import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "LikinEX - El Orquestador de Liquidez",
  description: "Segundo cerebro financiero para gestión de liquidez. Calendario interactivo, libro mayor y métricas en tiempo real.",
  keywords: ["finanzas", "liquidez", "gestión", "transacciones", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-full antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}