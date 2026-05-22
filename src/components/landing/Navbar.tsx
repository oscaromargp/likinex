'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { PRIMARY_RGB } from '@/components/landing/landing-data';

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

export default Navbar;
