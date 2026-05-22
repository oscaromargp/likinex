'use client';

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

export default SectionTitle;
