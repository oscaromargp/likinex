'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CalendarDays, DollarSign } from 'lucide-react';
import { Transaction, EntityConfig } from '@/types';
import { calcWeeklyPulse, fmtMXN, fmtShort } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';

interface WeeklyPulseProps {
  transactions: Transaction[];
  selectedEntity?: string;
  entities?: EntityConfig[];
}

export default function WeeklyPulse({ transactions, selectedEntity, entities }: WeeklyPulseProps) {
  const pulse = useMemo(() => {
    return calcWeeklyPulse(transactions, { accountId: selectedEntity });
  }, [transactions, selectedEntity]);

  const selectedEntityName = useMemo(() => {
    if (!selectedEntity || !entities) return 'Todas las cuentas';
    const ent = entities.find(e => e.id === selectedEntity);
    return ent ? `${ent.icon} ${ent.name}` : 'Todas las cuentas';
  }, [selectedEntity, entities]);

  const daysLeft = useMemo(() => {
    const end = new Date(pulse.weekEnd);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [pulse.weekEnd]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Pulso Semanal</h3>
            <p className="text-slate-500 text-xs">{selectedEntityName} • {daysLeft} días restantes</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDateShort(pulse.weekStart)} - {formatDateShort(pulse.weekEnd)}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Ingresos"
          value={pulse.income}
          delta={pulse.incomeDelta}
          color="emerald"
          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
        />
        <KPICard
          label="Egresos"
          value={pulse.expense}
          delta={pulse.expenseDelta}
          color="rose"
          icon={<ArrowDownRight className="w-3.5 h-3.5" />}
        />
        <KPICard
          label="Disponible"
          value={pulse.net}
          delta={pulse.netDelta}
          color={pulse.net >= 0 ? 'emerald' : 'rose'}
          icon={<DollarSign className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Upcoming */}
      {pulse.upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Próximos pagos</p>
          {pulse.upcoming.map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-1.5 border-t border-slate-800/50">
              <span className="text-xs text-slate-300 truncate flex-1">{tx.description}</span>
              <span className="text-xs text-rose-400 font-medium ml-2">{fmtMXN(tx.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function KPICard({ label, value, delta, color, icon }: {
  label: string;
  value: number;
  delta: number;
  color: 'emerald' | 'rose' | 'blue';
  icon: React.ReactNode;
}) {
  const colors = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', deltaPos: 'text-emerald-400', deltaNeg: 'text-rose-400' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', deltaPos: 'text-rose-400', deltaNeg: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', deltaPos: 'text-emerald-400', deltaNeg: 'text-rose-400' },
  };

  const c = colors[color];
  const isPositive = delta >= 0;
  const deltaLabel = label === 'Egresos'
    ? (isPositive ? `+${fmtShort(delta)} vs semana anterior` : `${fmtShort(delta)} vs semana anterior`)
    : (isPositive ? `+${fmtShort(delta)} vs semana anterior` : `${fmtShort(delta)} vs semana anterior`);

  return (
    <div className={cn('rounded-xl p-3', c.bg)}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={c.text}>{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={cn('text-lg font-bold', c.text)}>{fmtMXN(value)}</p>
      {delta !== 0 && (
        <div className={cn('flex items-center gap-0.5 text-xs mt-0.5', isPositive ? c.deltaPos : c.deltaNeg)}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{fmtShort(Math.abs(delta))}</span>
        </div>
      )}
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
