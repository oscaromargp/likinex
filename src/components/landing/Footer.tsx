'use client';
import Link from 'next/link';
import { PRIMARY_RGB } from '@/components/landing/landing-data';

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

export default FooterSection;
