'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, BarChart3, Calendar, CreditCard, Bell, FileText,
  Zap, TrendingUp, ShieldCheck, Smartphone, Globe, Check,
  Menu, X, ChevronDown, Star, Layers, Wallet, Target, ArrowUpRight,
  LayoutDashboard, MessageCircle, Heart, Code2, MessageSquare,
  Lightbulb, ExternalLink
} from 'lucide-react';

const PRIMARY_RGB = '59, 130, 246';

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let anim: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${PRIMARY_RGB}, ${p.a})`;
        ctx!.fill();
      });
      particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.06 * (1 - dist / 150)})`;
            ctx!.stroke();
          }
        }
      });
      anim = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function GlassCard({ className, children, ...props }: { className?: string; children: React.ReactNode; [key: string]: any }) {
  return (
    <div
      className={`backdrop-blur-xl border transition-all duration-500 ${className || ''}`}
      style={{
        background: `linear-gradient(135deg, rgba(${PRIMARY_RGB}, 0.08), rgba(${PRIMARY_RGB}, 0.03), rgba(${PRIMARY_RGB}, 0.08))`,
        borderColor: `rgba(${PRIMARY_RGB}, 0.15)`,
        borderRadius: '24px',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: `var(--primary)` }}>
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A1A1AA' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FadeInSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Calendar, title: 'Calendario Interactivo', desc: 'Visualiza todos tus pagos en un calendario inteligente con recurrencias automáticas y alertas.' },
  { icon: CreditCard, title: 'Credit Card Engine', desc: 'Controla fechas de corte, pago mínimo, MSI y costo de oportunidad de tus tarjetas.' },
  { icon: Target, title: 'Risk Tolerance', desc: 'Alertas inteligentes por criticidad: servicios críticos vs no críticos con colores automáticos.' },
  { icon: BarChart3, title: 'Cash Flow Forecast', desc: 'Proyección de liquidez a 30 días con cálculo de runway y métricas en tiempo real.' },
  { icon: Bell, title: 'Notificaciones WhatsApp', desc: 'Recordatorios automáticos vía WhatsApp con N8N para no perder ningún pago.' },
  { icon: FileText, title: 'Reportes PDF', desc: 'Estados de cuenta y reportes profesionales listos para descargar e imprimir.' },
];

const steps = [
  { icon: Wallet, title: 'Conecta', desc: 'Agrega tus cuentas bancarias, tarjetas de crédito y contactos en un solo lugar.' },
  { icon: Layers, title: 'Organiza', desc: 'Clasifica tus ingresos y egresos con categorías inteligentes y recurrencias automáticas.' },
  { icon: TrendingUp, title: 'Visualiza', desc: 'Mira tu flujo de caja, calendario de pagos y métricas en dashboards interactivos.' },
  { icon: ShieldCheck, title: 'Controla', desc: 'Recibe alertas, genera reportes y toma decisiones financieras informadas.' },
];

const comparisonRows = [
  { feature: 'Dashboard en tiempo real', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Calendario de pagos', likinex: true, excel: false, apps: true, papel: false },
  { feature: 'Proyección de liquidez', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Alertas automáticas', likinex: true, excel: false, apps: true, papel: false },
  { feature: 'Múltiples monedas', likinex: true, excel: true, apps: false, papel: false },
  { feature: 'Reportes PDF', likinex: true, excel: false, apps: false, papel: false },
  { feature: 'Modo offline', likinex: false, excel: true, apps: true, papel: true },
  { feature: 'Gratuito (beta)', likinex: true, excel: false, apps: false, papel: true },
];

const testimonials = [
  { name: 'Carlos M.', role: 'Freelancer', text: 'LikinEX me salvó de un cargo por atraso. La alerta de WhatsApp llegó justo cuando se me había olvidado el pago de la luz.', rating: 5 },
  { name: 'Ana G.', role: 'Contador Público', text: 'La proyección a 30 días me permite planificar mis gastos fijos sin tener que estar en Excel todo el día.', rating: 5 },
  { name: 'Roberto L.', role: 'Pequeño Empresario', text: 'Tener ingresos, egresos y tarjetas en un solo dashboard me ahorra 3 horas a la semana de organización manual.', rating: 5 },
];

const faqs = [
  { q: '¿Es gratis?', a: 'Sí, actualmente en versión beta gratuita. Próximamente planes premium con funciones avanzadas.' },
  { q: '¿Puedo usarlo sin registro?', a: 'Sí, el modo demo te permite explorar todas las funciones sin crear cuenta ni dar ningún dato.' },
  { q: '¿Mis datos están seguros?', a: 'Usamos Supabase con encriptación de extremo a extremo. Tus datos nunca se comparten con terceros.' },
  { q: '¿Soporta múltiples monedas?', a: 'Sí: MXN, USD, BTC, ETH, USDT y más con conversión automática en tiempo real.' },
  { q: '¿Funciona en mi celular?', a: 'Sí, está optimizado para móvil, tablet y escritorio. Puedes usarlo desde cualquier navegador.' },
  { q: '¿Puedo exportar sus datos?', a: 'Sí, puedes descargar reportes en PDF y exportar tu libro mayor en CSV.' },
];

const techStack = [
  { name: 'Next.js 16', desc: 'React framework con App Router y Server Actions', color: '#fff' },
  { name: 'Supabase', desc: 'Base de datos PostgreSQL, Auth y almacenamiento', color: '#3ECF8E' },
  { name: 'Tailwind CSS v4', desc: 'Estilos utilitarios con diseño responsive', color: '#06B6D4' },
  { name: 'TypeScript', desc: 'Tipado estático para código robusto', color: '#3178C6' },
  { name: 'D3.js', desc: 'Gráficas vectoriales interactivas (rosenCharts)', color: '#F9A03C' },
  { name: 'React Query', desc: 'Cache y sincronización de datos en tiempo real', color: '#FF4154' },
  { name: 'Framer Motion', desc: 'Animaciones fluidas y transiciones', color: '#0055FF' },
  { name: 'Lucide React', desc: 'Iconos vectoriales consistentes', color: '#fff' },
  { name: 'Vercel', desc: 'Hosting serverless con despliegue continuo', color: '#fff' },
];

const screenshots = [
  { src: '/images/dashboard-full.png', label: 'Dashboard Principal', desc: 'Métricas en tiempo real, flujo de caja y próximos pagos' },
  { src: '/images/calendar-view.png', label: 'Calendario de Pagos', desc: 'Visualización mensual con recurrencias y alertas' },
  { src: '/images/forecast-view.png', label: 'Proyección de Liquidez', desc: 'Cash flow forecast a 30 días con gráficas D3' },
  { src: '/images/ledger-view.png', label: 'Libro Mayor', desc: 'Registro completo de ingresos y egresos' },
  { src: '/images/credit-cards-view.png', label: 'Credit Card Engine', desc: 'Control de tarjetas, MSI y costo de oportunidad' },
];

const feedbackQuestions = [
  { q: '¿Qué función te gustaría que agregáramos?', icon: Lightbulb },
  { q: '¿Qué es lo que más te gusta de LikinEX?', icon: Heart },
  { q: '¿Hay algo que te parezca complicado?', icon: MessageSquare },
];

function Navbar({ scrolled, mobileOpen, setMobileOpen }: {
  scrolled: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b'
          : 'bg-transparent'
      }`}
      style={{
        borderColor: scrolled ? `rgba(${PRIMARY_RGB}, 0.1)` : 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, var(--primary), #6366f1)`,
            }}
          >
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Likin<span style={{ color: 'var(--primary)' }}>EX</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            ['Características', '#features'],
            ['Capturas', '#screenshots'],
            ['Tecnología', '#tech'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: '#A1A1AA' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
            >
              {label}
            </a>
          ))}
          <Link
            href="/app?demo=true"
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200"
            style={{
              color: 'var(--primary)',
              borderColor: `rgba(${PRIMARY_RGB}, 0.3)`,
              background: `rgba(${PRIMARY_RGB}, 0.08)`,
            }}
          >
            Modo Demo
          </Link>
          <Link
            href="/app"
            className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #2563EB, var(--primary), #60A5FA)`,
              boxShadow: `0 4px 20px rgba(${PRIMARY_RGB}, 0.4)`,
            }}
          >
            Acceder
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t bg-black/95 backdrop-blur-2xl px-6 py-6 space-y-4"
          style={{ borderColor: `rgba(${PRIMARY_RGB}, 0.1)` }}
        >
          <a href="#features" className="block text-slate-300 py-2" onClick={() => setMobileOpen(false)}>Características</a>
          <a href="#screenshots" className="block text-slate-300 py-2" onClick={() => setMobileOpen(false)}>Capturas</a>
          <a href="#tech" className="block text-slate-300 py-2" onClick={() => setMobileOpen(false)}>Tecnología</a>
          <a href="#faq" className="block text-slate-300 py-2" onClick={() => setMobileOpen(false)}>FAQ</a>
          <div className="flex gap-3 pt-2">
            <Link href="/app?demo=true" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium border"
              style={{ borderColor: `rgba(${PRIMARY_RGB}, 0.3)`, color: 'var(--primary)' }}
              onClick={() => setMobileOpen(false)}
            >
              Modo Demo
            </Link>
            <Link href="/app" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, #2563EB, var(--primary))` }}
              onClick={() => setMobileOpen(false)}
            >
              Acceder
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

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

function ComparisonSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }} id="comparison">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="COMPARATIVA"
            title="¿Por qué LikinEX?"
            subtitle="Olvida el estrés de las hojas de cálculo y las apps bancarias dispersas."
          />
        </FadeInSection>

        <FadeInSection>
          <div
            className="overflow-hidden rounded-3xl border"
            style={{
              borderColor: `rgba(${PRIMARY_RGB}, 0.1)`,
              background: `linear-gradient(135deg, rgba(${PRIMARY_RGB}, 0.03), transparent)`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid rgba(${PRIMARY_RGB}, 0.1)` }}>
                    <th className="text-left p-5 font-semibold text-white">Funcionalidad</th>
                    <th className="p-5 text-center font-semibold" style={{ color: 'var(--primary)' }}>
                      <span className="flex items-center justify-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
                        LikinEX
                      </span>
                    </th>
                    <th className="p-5 text-center font-medium" style={{ color: '#A1A1AA' }}>Excel</th>
                    <th className="p-5 text-center font-medium" style={{ color: '#A1A1AA' }}>Apps Bancarias</th>
                    <th className="p-5 text-center font-medium" style={{ color: '#A1A1AA' }}>Papel y Lápiz</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      style={{
                        borderBottom: i < comparisonRows.length - 1 ? `1px solid rgba(${PRIMARY_RGB}, 0.06)` : 'none',
                      }}
                    >
                      <td className="p-5 text-white font-medium">{row.feature}</td>
                      {[row.likinex, row.excel, row.apps, row.papel].map((val, j) => (
                        <td key={j} className="p-5 text-center">
                          {val ? (
                            <Check size={18} className="mx-auto" style={{ color: val && j === 0 ? 'var(--primary)' : '#22C55E' }} />
                          ) : (
                            <span className="text-red-500/40 text-lg">&mdash;</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="CARACTERÍSTICAS"
            title="Todo lo que necesitas para gestionar tu liquidez"
            subtitle="Herramientas profesionales diseñadas para simplificar tus finanzas personales y empresariales."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6 h-full group cursor-default">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `rgba(${PRIMARY_RGB}, 0.12)`,
                    color: 'var(--primary)',
                  }}
                >
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p style={{ color: '#A1A1AA' }} className="text-sm leading-relaxed">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }} id="how">
      <div className="max-w-5xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="CÓMO FUNCIONA"
            title="Empieza en 4 pasos"
            subtitle="Sin configuraciones complicadas. En minutos tendrás todo listo."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <GlassCard className="p-6 text-center h-full">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, rgba(${PRIMARY_RGB}, 0.15), rgba(${PRIMARY_RGB}, 0.05))`,
                    border: `1px solid rgba(${PRIMARY_RGB}, 0.2)`,
                    color: 'var(--primary)',
                  }}
                >
                  {i + 1}
                </div>
                <s.icon size={24} className="mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{s.desc}</p>
              </GlassCard>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 -right-3 z-10">
                  <ArrowRight size={20} style={{ color: `rgba(${PRIMARY_RGB}, 0.3)` }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScreenshotsSection() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" id="screenshots">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="CAPTURAS"
            title="Así funciona LikinEX"
            subtitle="Interfaz limpia, moderna y diseñada para la toma de decisiones."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {screenshots.map((ss, i) => (
            <motion.div
              key={ss.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
            >
              <div
                className="rounded-2xl overflow-hidden border transition-all duration-300 group-hover:border-blue-500/40 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                style={{
                  borderColor: selectedIdx === i ? `rgba(${PRIMARY_RGB}, 0.4)` : `rgba(${PRIMARY_RGB}, 0.1)`,
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ss.src}
                    alt={ss.label}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      selectedIdx === i ? 'scale-100' : 'scale-100 group-hover:scale-105'
                    }`}
                    style={{
                      filter: selectedIdx === i ? 'none' : undefined,
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-1">{ss.label}</h3>
                  <p className="text-xs" style={{ color: '#71717A' }}>{ss.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedIdx !== null && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedIdx(null)}
          >
            <div
              className="relative max-w-5xl w-full rounded-2xl overflow-hidden border"
              style={{ borderColor: `rgba(${PRIMARY_RGB}, 0.2)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={screenshots[selectedIdx].src}
                alt={screenshots[selectedIdx].label}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                <p className="text-white font-semibold">{screenshots[selectedIdx].label}</p>
                <p className="text-sm" style={{ color: '#A1A1AA' }}>{screenshots[selectedIdx].desc}</p>
              </div>
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl border"
                style={{ background: 'rgba(0,0,0,0.6)', borderColor: `rgba(${PRIMARY_RGB}, 0.3)` }}
                onClick={() => setSelectedIdx(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="DEMO"
            title="Vista previa del Dashboard"
            subtitle="Interfaz limpia, rápida y diseñada para la toma de decisiones."
          />
        </FadeInSection>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="overflow-hidden">
            <div
              className="flex items-center gap-2 px-5 py-3.5 border-b"
              style={{
                background: `rgba(${PRIMARY_RGB}, 0.05)`,
                borderColor: `rgba(${PRIMARY_RGB}, 0.1)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs font-mono" style={{ color: '#71717A' }}>
                likinex-dashboard &mdash; bash
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Comprometido', value: '$54,959', color: '#60A5FA' },
                  { label: 'Liquidado', value: '$928', color: '#34D399' },
                  { label: 'Pendiente', value: '$54,031', color: '#FBBF24' },
                  { label: 'Disponible', value: '$928', color: '#22D3EE' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-4 rounded-xl border"
                    style={{
                      background: `rgba(${PRIMARY_RGB}, 0.04)`,
                      borderColor: `rgba(${PRIMARY_RGB}, 0.08)`,
                    }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: '#71717A' }}>{m.label}</p>
                    <p className="text-xl md:text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div
                  className="rounded-xl p-5 border"
                  style={{
                    background: `rgba(${PRIMARY_RGB}, 0.03)`,
                    borderColor: `rgba(${PRIMARY_RGB}, 0.08)`,
                  }}
                >
                  <p className="text-sm font-semibold text-white mb-4">Flujo de Caja (7 días)</p>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 35, 80, 55, 70, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md transition-all duration-500"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, rgba(${PRIMARY_RGB}, 0.3), var(--primary))`,
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                        <span className="text-[10px]" style={{ color: '#52525B' }}>
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-5 border"
                  style={{
                    background: `rgba(${PRIMARY_RGB}, 0.03)`,
                    borderColor: `rgba(${PRIMARY_RGB}, 0.08)`,
                  }}
                >
                  <p className="text-sm font-semibold text-white mb-4">Próximos Pagos</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Renta', amount: '$15,000', date: 'May 25', urgent: true },
                      { name: 'Netflix', amount: '$239', date: 'May 27', urgent: false },
                      { name: 'Luz (CFE)', amount: '$850', date: 'Jun 5', urgent: false },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.urgent ? '#EF4444' : `rgba(${PRIMARY_RGB}, 0.5)` }} />
                          <div>
                            <p className="text-sm text-white">{p.name}</p>
                            <p className="text-xs" style={{ color: '#71717A' }}>{p.date}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium" style={{ color: p.urgent ? '#FCA5A5' : '#E4E4E7' }}>
                          {p.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link
            href="/app?demo=true"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #2563EB, var(--primary))`,
              color: 'white',
            }}
          >
            Explorar Demo Interactivo
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function TechStackSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" id="tech">
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="TRANSPARENCIA TECNOLÓGICA"
            title="Construido con tecnología moderna"
            subtitle="Stack 100% open source. Código disponible en GitHub."
          />
        </FadeInSection>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {techStack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div
                className="p-5 rounded-xl border text-center h-full transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: `rgba(${PRIMARY_RGB}, 0.1)`,
                  background: `rgba(${PRIMARY_RGB}, 0.03)`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-3"
                  style={{ background: t.color }}
                />
                <h3 className="text-sm font-semibold text-white mb-1">{t.name}</h3>
                <p className="text-[11px]" style={{ color: '#71717A' }}>{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <a
            href="https://github.com/oscaromargp/likinex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: `rgba(${PRIMARY_RGB}, 0.08)`,
              border: `1px solid rgba(${PRIMARY_RGB}, 0.25)`,
              color: '#E4E4E7',
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            Ver código en GitHub
            <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }}>
      <div className="max-w-5xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="TESTIMONIOS"
            title="Lo que dicen nuestros usuarios"
            subtitle="Personas reales, resultados reales."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-6 h-full">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-current" style={{ color: '#FBBF24' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#D4D4D8' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, var(--primary), #6366f1)`,
                    }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: '#71717A' }}>{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DigitalSovereigntySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${PRIMARY_RGB}, 0.06) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <FadeInSection>
          <SectionTitle
            label="DEPENDENCIA DIGITAL"
            title="Impulsa la dependencia digital"
            subtitle="Creemos en un ecosistema digital libre, transparente y construido con tecnología abierta."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 h-full">
              <Code2 size={32} className="mb-4" style={{ color: 'var(--primary)' }} />
              <h3 className="text-xl font-bold text-white mb-3">Código Abierto</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                Todo el código de LikinEX es público y auditable. Creemos en la transparencia como pilar fundamental
                de la confianza digital. No escondemos cómo funcionamos — mostramos cada línea.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GlassCard className="p-8 h-full">
              <Heart size={32} className="mb-4" style={{ color: 'var(--primary)' }} />
              <h3 className="text-xl font-bold text-white mb-3">Construido con ❤️</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                LikinEX nació como un proyecto personal para resolver un problema real. Hoy es una herramienta
                gratuita para cualquiera que quiera tomar el control de sus finanzas.
              </p>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Apoya el proyecto</h3>
            <p className="text-sm leading-relaxed mb-6 max-w-xl mx-auto" style={{ color: '#A1A1AA' }}>
              Si LikinEX te ha sido útil, puedes apoyar el desarrollo continuo con una donación en XRP.
              Cada contribución ayuda a mantener el servicio gratuito.
            </p>
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-mono text-sm mb-4"
              style={{
                background: `rgba(${PRIMARY_RGB}, 0.06)`,
                border: `1px solid rgba(${PRIMARY_RGB}, 0.15)`,
                color: '#D4D4D8',
              }}
            >
              <Wallet size={18} style={{ color: 'var(--primary)' }} />
              <span className="break-all">rEBV8fMkY4t3xDCkH8A7J6y9Z5nL2pQmWx</span>
            </div>
            <p className="text-xs" style={{ color: '#52525B' }}>
              XRP Ledger — Cualquier cantidad es bienvenida 🙏
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function FeedbackSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }}>
      <div className="max-w-4xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="TU OPINIÓN IMPORTA"
            title="¿Qué opinas de LikinEX?"
            subtitle="Tu feedback nos ayuda a mejorar. Comparte tus ideas, sugerencias o reportes."
          />
        </FadeInSection>

        <div ref={ref} className="grid md:grid-cols-3 gap-5 mb-8">
          {feedbackQuestions.map((fq, i) => (
            <motion.div
              key={fq.q}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <GlassCard className="p-6 text-center h-full">
                <fq.icon size={28} className="mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#D4D4D8' }}>
                  {fq.q}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href="https://github.com/oscaromargp/likinex/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #2563EB, var(--primary))`,
              color: 'white',
            }}
          >
            <MessageSquare size={20} />
            Dejar mi opinión en GitHub
            <ArrowUpRight size={18} />
          </a>
          <p className="mt-3 text-xs" style={{ color: '#52525B' }}>
            Puedes abrir un issue, sugerir una feature o reportar un bug
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="FAQ"
            title="Preguntas Frecuentes"
            subtitle="Todo lo que necesitas saber antes de empezar."
          />
        </FadeInSection>

        <div ref={ref} className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div
                className="rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: openIndex === i ? `rgba(${PRIMARY_RGB}, 0.3)` : `rgba(${PRIMARY_RGB}, 0.08)`,
                  background: openIndex === i
                    ? `linear-gradient(135deg, rgba(${PRIMARY_RGB}, 0.08), rgba(${PRIMARY_RGB}, 0.03))`
                    : `rgba(${PRIMARY_RGB}, 0.03)`,
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="flex items-center justify-between p-5">
                  <h3 className="text-white font-semibold text-sm md:text-base pr-4">{faq.q}</h3>
                  <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform duration-300"
                    style={{
                      color: `rgba(${PRIMARY_RGB}, 0.6)`,
                      transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                  />
                </div>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openIndex === i ? '200px' : '0',
                    opacity: openIndex === i ? 1 : 0,
                  }}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomDevCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${PRIMARY_RGB}, 0.1) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="p-10 md:p-16 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: `linear-gradient(135deg, rgba(${PRIMARY_RGB}, 0.15), rgba(${PRIMARY_RGB}, 0.05))`,
                border: `1px solid rgba(${PRIMARY_RGB}, 0.2)`,
              }}
            >
              <Globe size={32} style={{ color: 'var(--primary)' }} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Necesitas una app a medida?
            </h2>
            <p className="text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: '#A1A1AA' }}>
              ¿Tienes una idea para una aplicación financiera, un dashboard corporativo o una herramienta de automatización?
              Creamos soluciones web modernas y escalables para tu negocio.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
              {[
                { icon: Zap, title: 'Desarrollo Web', desc: 'Apps con Next.js, React, Tailwind y Supabase.' },
                { icon: Smartphone, title: 'Apps Móviles', desc: 'iOS y Android con Flutter o React Native.' },
                { icon: Globe, title: 'Automatización', desc: 'Workflows con n8n, APIs e integraciones.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-xl"
                  style={{
                    background: `rgba(${PRIMARY_RGB}, 0.05)`,
                    border: `1px solid rgba(${PRIMARY_RGB}, 0.08)`,
                  }}
                >
                  <Icon size={20} className="mb-2" style={{ color: 'var(--primary)' }} />
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-xs" style={{ color: '#71717A' }}>{desc}</p>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/526121077805"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, #2563EB, var(--primary), #60A5FA)`,
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 4s ease infinite, pulse-glow 3s ease-in-out infinite',
              }}
            >
              <MessageCircle size={22} />
              Hablemos de tu proyecto
              <ArrowUpRight size={20} />
            </a>

            <p className="mt-4 text-xs" style={{ color: '#52525B' }}>
              Sin compromiso. Te responderemos en menos de 24 horas.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer
      className="py-12 px-6 border-t"
      style={{ borderColor: `rgba(${PRIMARY_RGB}, 0.08)` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  background: `linear-gradient(135deg, var(--primary), #6366f1)`,
                }}
              >
                L
              </div>
              <span className="text-lg font-bold text-white">
                Likin<span style={{ color: 'var(--primary)' }}>EX</span>
              </span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#71717A' }}>
              Tu segundo cerebro financiero. Gestión inteligente de liquidez para personas y empresas.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#52525B' }}>Producto</p>
            <div className="space-y-2.5">
              {['Características', 'Demo', 'FAQ', 'GitHub'].map((l) => (
                <a key={l} href={l === 'GitHub' ? 'https://github.com/oscaromargp/likinex' : '#'}
                  className="block text-sm transition-colors duration-200" style={{ color: '#A1A1AA' }}
                  target={l === 'GitHub' ? '_blank' : undefined}
                  rel={l === 'GitHub' ? 'noopener noreferrer' : undefined}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#52525B' }}>Legal</p>
            <div className="space-y-2.5">
              {[
                ['Privacidad', '/legal/privacidad'],
                ['Términos', '/legal/terminos'],
                ['Cookies', '/legal/cookies'],
              ].map(([l, href]) => (
                <Link key={l} href={href} className="block text-sm transition-colors duration-200" style={{ color: '#A1A1AA' }}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col items-center gap-6 border-t"
          style={{ borderColor: `rgba(${PRIMARY_RGB}, 0.06)` }}
        >
          <div className="text-center max-w-xl">
            <p className="text-xs italic leading-relaxed" style={{ color: '#52525B' }}>
              &ldquo;Porque Dios es el que en vosotros produce así el querer como el hacer, por su buena voluntad.&rdquo;
            </p>
            <p className="text-xs mt-1 font-semibold" style={{ color: '#71717A' }}>
              &mdash; Filipenses 2:13
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <p className="text-xs" style={{ color: '#52525B' }}>
              &copy; {new Date().getFullYear()} LikinEX. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-xs" style={{ color: '#52525B' }}>
              <span>Hecho con ❤️ en México</span>
              <a
                href="https://github.com/oscaromargp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Particles />
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <HeroSection />
      <ComparisonSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ScreenshotsSection />
      <DashboardPreview />
      <TechStackSection />
      <TestimonialsSection />
      <DigitalSovereigntySection />
      <FeedbackSection />
      <FAQSection />
      <CustomDevCTA />
      <FooterSection />
    </div>
  );
}
