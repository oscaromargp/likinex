'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, FileText, TrendingUp, Settings, Upload, Users, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Screenshots from '@/components/Screenshots';

export default function Landing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Fixed background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-500/5 to-transparent rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <span className="text-xl font-bold text-white">LikinEX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/app?tab=settings" className="text-slate-400 hover:text-white transition-colors">
              Configuración
            </Link>
            <Link href="/app" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Segundo Cerebro Financiero
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Controla tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Liquidez</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              El orquestador de liquidez para gestión de alta complejidad. 
              Calendario interactivo, métricas en tiempo real, importación masiva y cuentas privadas por usuario.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-105">
                <span>Comenzar Ahora</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800/50 transition-all">
                Ver Características
              </a>
            </div>
          </motion.div>

          {/* Quick Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { icon: Calendar, label: 'Calendario' },
              { icon: FileText, label: 'Libro Mayor' },
              { icon: TrendingUp, label: 'Métricas' },
              { icon: Upload, label: 'Importar CSV' }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section with Screenshots */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Qué puedes hacer con <span className="text-emerald-400">LikinEX</span>?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Descubre todas las funcionalidades que te帮助你 a controlar tus finanzas de manera eficiente.
            </p>
          </motion.div>

          <Screenshots />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-400 text-lg">En solo 3 pasos tendrás control total de tu liquidez</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Crea tu cuenta',
                description: 'Regístrate con tu email y contraseña. Cada usuario tiene sus propios datos privados y seguros.'
              },
              {
                step: '02',
                title: 'Carga tus pagos',
                description: 'Agrega transacciones manualmente o importa un archivo CSV con todos tus pagos recurrentes.'
              },
              {
                step: '03',
                title: 'Visualiza y controla',
                description: 'Consulta el calendario, revisa métricas en tiempo real y recibe alertas de pagos próximos.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl"
              >
                <span className="text-6xl font-bold text-emerald-500/20">{item.step}</span>
                <h3 className="text-xl font-bold text-white mt-4 mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Entity Segregation */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Segregación por Entidades</h2>
            <p className="text-slate-400 text-lg">Gestiona múltiples cuentas desde una sola plataforma</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'oscaromargp', color: 'emerald' },
              { name: 'centenario', color: 'indigo' },
              { name: 'tulum', color: 'pink' },
              { name: 'paypaps', color: 'blue' },
              { name: 'bnrecords', color: 'amber' },
              { name: 'pardesantos', color: 'cyan' },
              { name: 'zxyw', color: 'violet' }
            ].map((entity, i) => (
              <motion.div
                key={entity.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center`}
              >
                <div className={`w-12 h-12 rounded-full bg-${entity.color}-500/20 mx-auto mb-3 flex items-center justify-center`}>
                  <span className={`text-${entity.color}-400 font-bold`}>{entity.name.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-white text-sm font-medium">{entity.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 rounded-3xl"
          >
            <h2 className="text-4xl font-bold text-white mb-4">¿Listo para empezar?</h2>
            <p className="text-slate-400 text-lg mb-8">
              Crea tu cuenta gratis y toma el control de tu liquidez hoy mismo.
            </p>
            <Link href="/app" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-105">
              <Users className="w-5 h-5" />
              <span>Crear Mi Cuenta</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-500">
            © 2026 LikinEX. Todos los derechos reservados. 
            <span className="mx-2">•</span>
            <span className="text-slate-600">"Porque Dios es el que en vosotros produce así el querer como el hacer" - Filipenses 2:13</span>
          </p>
        </div>
      </footer>
    </div>
  );
}