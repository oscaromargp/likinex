'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function LandingContent() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: '📅', title: 'Calendario Interactivo', desc: 'Visualiza todos tus pagos en un calendario inteligente con recurrencias automáticas.' },
    { icon: '💳', title: 'Credit Card Engine', desc: 'Control de tarjetas: fechas de corte, pago, MSI y costo de oportunidad.' },
    { icon: '⚠️', title: 'Risk Tolerance', desc: 'Alertas inteligentes por criticidad: servicios críticos vs no críticos.' },
    { icon: '📊', title: 'Cash Flow Forecast', desc: 'Proyección de liquidez a 30 días con cálculo de runway.' },
    { icon: '🔔', title: 'Notificaciones WhatsApp', desc: 'Recordatorios automáticos vía WhatsApp con N8N.' },
    { icon: '📄', title: 'Reportes PDF', desc: 'Estados de cuenta bancarios listos para imprimir.' },
  ];

  const faqs = [
    { q: '¿Es gratis?', a: 'Sí, actualmente en versión demo gratuita. Próximamente planes premium.' },
    { q: '¿Puedo usarlo sin registro?', a: 'Sí, el modo demo te permite explorar todas las funciones sin crear cuenta.' },
    { q: '¿Mis datos están seguros?', a: 'Usamos Supabase con encriptación. Tus datos nunca se comparten con terceros.' },
    { q: '¿Soporta múltiples monedas?', a: 'Sí: MXN, USD, BTC, ETH, USDT con conversión automática.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <span className="text-xl font-bold">LikinEX</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Características</a>
            <a href="#demo" className="text-slate-400 hover:text-white transition-colors">Demo</a>
            <a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a>
            <Link href="/app?demo=true" className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
              Modo Demo
            </Link>
            <Link href="/app?demo=true" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
              Acceder
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-4">
            <a href="#features" className="block text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Características</a>
            <a href="#demo" className="block text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Demo</a>
            <a href="#faq" className="block text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <Link href="/app?demo=true" className="block px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-center">Modo Demo</Link>
            <Link href="/app?demo=true" className="block px-4 py-2 bg-blue-500 text-white rounded-lg text-center">Acceder</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6">
            <span>🚀</span> Segundo Cerebro Financiero
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Controla tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Liquidez</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Gestión inteligente de pagos, tarjetas de crédito y flujo de caja. 
            Alertas automáticas, reportes PDF y proyecciones a 30 días.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app?demo=true" className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all hover:scale-105">
              Probar Demo Gratis →
            </Link>
            <a href="#features" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700">
              Ver Características
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Características Principales</h2>
            <p className="text-slate-400 text-lg">Todo lo que necesitas para gestionar tu liquidez</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/30 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Vista Previa del Dashboard</h2>
            <p className="text-slate-400 text-lg">Interfaz limpia y funcional</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-slate-500">LikinEX Dashboard</span>
            </div>
            <div className="p-8 grid md:grid-cols-4 gap-4">
              {[
                { label: 'Comprometido', value: '$54,959', color: 'text-blue-400' },
                { label: 'Liquidado', value: '$928', color: 'text-emerald-400' },
                { label: 'Pendiente', value: '$54,031', color: 'text-amber-400' },
                { label: 'Disponible', value: '$928', color: 'text-cyan-400' },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-500 mb-1">{m.label}</p>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/app?demo=true" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all">
              Explorar Demo Interactivo →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-white">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para tomar el control?</h2>
          <p className="text-slate-400 text-lg mb-8">Únete a LikinEX y gestiona tu liquidez como un profesional.</p>
          <Link href="/app?demo=true" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all hover:scale-105">
            Comenzar Ahora Gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <span>💰</span>
            </div>
            <span className="font-semibold">LikinEX</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 LikinEX. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Términos</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return <LandingContent />;
}
