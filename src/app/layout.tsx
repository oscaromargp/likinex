import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

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
    <html lang="es" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}