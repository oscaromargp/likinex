'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PRIMARY_RGB, screenshots } from '@/components/landing/landing-data';

function ScreenshotsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c === 0 ? screenshots.length - 1 : c - 1));
  };
  const next = () => {
    setDirection(1);
    setCurrent((c) => (c === screenshots.length - 1 ? 0 : c + 1));
  };

  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c === screenshots.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [inView]);

  const ss = screenshots[current];

  return (
    <section className="py-24 px-6" id="screenshots">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: `var(--primary)` }}>
            CAPTURAS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white leading-tight">
            Así funciona <span style={{ color: 'var(--primary)' }}>LikinEX</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A1A1AA' }}>
            Interfaz limpia, moderna y diseñada para la toma de decisiones.
          </p>
        </div>

        <div ref={ref} className="relative">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: `rgba(${PRIMARY_RGB}, 0.15)`,
              background: `rgba(${PRIMARY_RGB}, 0.03)`,
            }}
          >
            <img
              src={ss.src}
              alt={ss.label}
              className="w-full h-auto"
            />
          </motion.div>

          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white border transition-all duration-200 hover:scale-110 z-10"
            style={{
              background: 'rgba(0,0,0,0.6)',
              borderColor: `rgba(${PRIMARY_RGB}, 0.3)`,
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Anterior"
          >
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white border transition-all duration-200 hover:scale-110 z-10"
            style={{
              background: 'rgba(0,0,0,0.6)',
              borderColor: `rgba(${PRIMARY_RGB}, 0.3)`,
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Siguiente"
          >
            <ChevronDown size={20} className="-rotate-90" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-6">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '28px' : '8px',
                  height: '8px',
                  background: i === current
                    ? `linear-gradient(135deg, #2563EB, var(--primary))`
                    : `rgba(${PRIMARY_RGB}, 0.2)`,
                }}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-4">
            <p className="text-white font-semibold text-lg">{ss.label}</p>
            <p className="text-sm mt-1" style={{ color: '#A1A1AA' }}>{ss.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScreenshotsSection;
