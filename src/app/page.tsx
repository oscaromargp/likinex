'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Star, Code2, Heart, Wallet,
  MessageSquare, Globe, Zap, Smartphone, MessageCircle
} from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeInSection from '@/components/ui/FadeInSection';
import Particles from '@/components/landing/Particles';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ScreenshotsSection from '@/components/landing/ScreenshotsSection';
import FAQSection from '@/components/landing/FAQAccordion';
import FooterSection from '@/components/landing/Footer';
import { PRIMARY_RGB, features, steps, comparisonRows, testimonials, techStack, feedbackQuestions } from '@/components/landing/landing-data';

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
              borderColor: `rgba(${PRIMARY_RGB}, 0.12)`,
              background: `rgba(${PRIMARY_RGB}, 0.02)`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `rgba(${PRIMARY_RGB}, 0.06)` }}>
                    <th className="text-left p-4 font-semibold text-white">Funcionalidad</th>
                    {['LikinEX', 'Excel', 'Apps Bancarias', 'Papel y Lápiz'].map((name, j) => (
                      <th
                        key={name}
                        className="p-4 text-center font-semibold"
                        style={{
                          color: j === 0 ? 'var(--primary)' : '#A1A1AA',
                          background: j === 0 ? `rgba(${PRIMARY_RGB}, 0.08)` : 'transparent',
                        }}
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      style={{
                        borderBottom: i < comparisonRows.length - 1 ? `1px solid rgba(${PRIMARY_RGB}, 0.06)` : 'none',
                        background: i % 2 === 0 ? `rgba(255,255,255,0.02)` : 'transparent',
                      }}
                    >
                      <td className="p-4 text-white font-medium">{row.feature}</td>
                      {[row.likinex, row.excel, row.apps, row.papel].map((val, j) => (
                        <td
                          key={j}
                          className="p-4 text-center"
                          style={{
                            background: j === 0 ? `rgba(${PRIMARY_RGB}, 0.04)` : 'transparent',
                          }}
                        >
                          {val ? (
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold"
                              style={{
                                background: j === 0
                                  ? `linear-gradient(135deg, #2563EB, var(--primary))`
                                  : '#22C55E',
                                boxShadow: j === 0 ? `0 0 12px rgba(${PRIMARY_RGB}, 0.4)` : 'none',
                              }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}
                            >
                              ✕
                            </span>
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

function DashboardPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" style={{ background: '#09090B' }}>
      <div className="max-w-6xl mx-auto">
        <FadeInSection>
          <SectionTitle
            label="DEMO"
            title="Dashboard en Tiempo Real"
            subtitle="Métricas, flujo de caja y calendario en un solo lugar."
          />
        </FadeInSection>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: `rgba(${PRIMARY_RGB}, 0.12)`,
            }}
          >
            <img
              src="/images/dashboard-full.png"
              alt="Dashboard Principal de LikinEX"
              className="w-full h-auto"
            />
          </div>
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-sm font-bold"
                  style={{
                    background: t.brandBg,
                    color: t.brandFg,
                  }}
                >
                  {t.icon}
                </div>
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
