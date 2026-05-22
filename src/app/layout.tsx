import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { QueryProvider } from "@/providers/QueryProvider";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata: Metadata = {
  metadataBase: new URL('https://likinex.vercel.app'),
  title: "LikinEX - El Orquestador de Liquidez",
  description: "Segundo cerebro financiero para gestión de liquidez. Calendario interactivo, libro mayor y métricas en tiempo real.",
  keywords: ["finanzas", "liquidez", "gestión", "transacciones", "dashboard", "contabilidad", "forecast", "flujo de caja", "tesorería", "fintech"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://likinex.vercel.app',
  },
  openGraph: {
    title: "LikinEX - El Orquestador de Liquidez",
    description: "Segundo cerebro financiero para gestión de liquidez. Calendario interactivo, libro mayor y métricas en tiempo real.",
    url: 'https://likinex.vercel.app',
    siteName: 'LikinEX',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <QueryProvider>
          <AuthProvider>
            <ThemeInitializer />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}