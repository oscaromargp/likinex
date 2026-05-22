'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, ChevronDown, LayoutDashboard, Calendar, TrendingUp, FileText } from 'lucide-react';
import { PRIMARY_RGB } from '@/components/landing/landing-data';

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 25%, rgba(${PRIMARY_RGB}, 0.12) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
          style={{
            background: `rgba(${PRIMARY_RGB}, 0.1)`,
            border: `1px solid rgba(${PRIMARY_RGB}, 0.25)`,
            color: '#60A5FA',
          }}
        >
          <Zap size={14} />
          Tu Segundo Cerebro Financiero
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-[-0.03em] mb-6"
        >
          <span className="text-white">Controla tu</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #60A5FA, var(--primary), #2563EB)',
            }}
          >
            Liquidez
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: '#A1A1AA' }}
        >
          Gestión inteligente de pagos, tarjetas de crédito y flujo de caja en un solo lugar.
          <br />
          Alertas automáticas, reportes PDF y proyecciones a 30 días.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/app?demo=true"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, #2563EB, var(--primary), #60A5FA)`,
              backgroundSize: '200% 200%',
              animation: 'pulse-glow 3s ease-in-out infinite, gradient-shift 4s ease infinite',
              boxShadow: `0 0 0 1px rgba(${PRIMARY_RGB}, 0.5), 0 4px 24px rgba(${PRIMARY_RGB}, 0.4)`,
            }}
          >
            Probar Demo Gratis
            <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'transparent',
              border: `1px solid rgba(${PRIMARY_RGB}, 0.3)`,
              color: '#E4E4E7',
            }}
          >
            Ver Características
            <ChevronDown size={18} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { label: 'Dashboard', icon: LayoutDashboard },
            { label: 'Calendario', icon: Calendar },
            { label: 'Proyecciones', icon: TrendingUp },
            { label: 'Reportes', icon: FileText },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 text-sm" style={{ color: '#71717A' }}>
              <Icon size={16} style={{ color: `rgba(${PRIMARY_RGB}, 0.6)` }} />
              {label}
            </div>
          ))}
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #000, transparent)',
        }}
      />
    </section>
  );
}

export default HeroSection;
