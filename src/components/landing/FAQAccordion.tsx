'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { PRIMARY_RGB, faqs } from '@/components/landing/landing-data';

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: `var(--primary)` }}>
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4 text-white leading-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A1A1AA' }}>
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

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

export default FAQSection;
