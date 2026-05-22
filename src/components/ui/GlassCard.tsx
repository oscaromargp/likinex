'use client';
import { PRIMARY_RGB } from '@/components/landing/landing-data';

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

export default GlassCard;
