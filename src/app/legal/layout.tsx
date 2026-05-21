import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: '#A1A1AA' }}>
          ← Volver a LikinEX
        </Link>
        <article
          className="prose prose-invert prose-sm md:prose-base max-w-none"
          style={{
            '--tw-prose-headings': '#fff',
            '--tw-prose-body': '#D4D4D8',
            '--tw-prose-bold': '#fff',
            '--tw-prose-links': '#3B82F6',
            '--tw-prose-quotes': '#E4E4E7',
            '--tw-prose-quote-borders': '#3B82F6',
          } as React.CSSProperties}
        >
          {children}
        </article>
      </div>
    </div>
  );
}
