'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function LandingContent() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDemo(params.get('demo') === 'true');
    if (params.get('demo') === 'true') {
      document.body.classList.add('demo-mode');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LikinEX</h1>
              <p className="text-sm text-slate-500">El Orquestador de Liquidez</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/app?demo=true">
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                Modo Demo
              </button>
            </Link>
            <Link href="/app">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                Acceder
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 text-center">
              Controla tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Liquidez</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto text-center mb-12">
              Segundo cerebro financiero para gestión de alta complejidad. 
              Calendario interactivo, métricas en tiempo real y control total.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Link href="/app?demo=true" className="group p-6 bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Probar Demo</h3>
                <p className="text-slate-400 text-sm">Explora sin registrarte</p>
              </Link>

              <a href="/landing/index.html" target="_blank" className="group p-6 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl hover:border-indigo-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ver Landing</h3>
                <p className="text-slate-400 text-sm">Página del producto</p>
              </a>

              <Link href="/app" className="group p-6 bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Iniciar Sesión</h3>
                <p className="text-slate-400 text-sm">Accede a tu cuenta</p>
              </Link>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Calendario Interactivo</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Libro Mayor</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Métricas Real-time</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Credit Card Engine</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Risk Tolerance</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">✓ Cash Flow Forecast</span>
            </div>
          </div>
        </main>

        <footer className="p-6 text-center text-slate-500 text-sm border-t border-slate-800/50">
          <p>© 2026 LikinEX - "Porque Dios es el que en vosotros produce así el querer como el hacer" - Filipenses 2:13</p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return <LandingContent />;
}