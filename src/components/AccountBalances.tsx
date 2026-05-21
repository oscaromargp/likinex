'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction, EntityConfig } from '@/types';
import { getAccountBalances, calcBalance, fmtMXN, currentPeriod } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';
import { DonutChart } from './charts/DonutChart';

interface AccountBalancesProps {
  transactions: Transaction[];
  entities: EntityConfig[];
  onEntitySelect?: (entityId: string) => void;
}

export default function AccountBalances({ transactions, entities, onEntitySelect }: AccountBalancesProps) {
  const [expanded, setExpanded] = useState(false);
  const period = currentPeriod();

  const balances = useMemo(() => {
    return getAccountBalances(transactions, entities, period);
  }, [transactions, entities, period]);

  const totalBal = useMemo(() => {
    return calcBalance(transactions, { period });
  }, [transactions, period]);

  const displayBalances = expanded ? balances : balances.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Saldos por Cuenta</h3>
            <p className="text-slate-500 text-xs">{getMonthName(period)}</p>
          </div>
        </div>
      </div>

      {/* Donut - Ingresos vs Egresos */}
      <div className="flex justify-center py-2">
        <DonutChart
          size="sm"
          data={[
            { name: 'Ingresos', value: totalBal.income, color: '#10b981' },
            { name: 'Egresos', value: totalBal.expense, color: '#ef4444' },
          ]}
          centerLabel="Disponible"
          centerValue={fmtMXN(totalBal.net)}
        />
      </div>

      {/* Total */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Ingresos</p>
          <p className="text-sm font-bold text-emerald-400">{fmtMXN(totalBal.income)}</p>
        </div>
        <div className="bg-rose-500/10 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Egresos</p>
          <p className="text-sm font-bold text-rose-400">{fmtMXN(totalBal.expense)}</p>
        </div>
        <div className={cn('rounded-xl p-3', totalBal.net >= 0 ? 'bg-blue-500/10' : 'bg-rose-500/10')}>
          <p className="text-xs text-slate-400 mb-0.5">Disponible</p>
          <p className={cn('text-sm font-bold', totalBal.net >= 0 ? 'text-blue-400' : 'text-rose-400')}>
            {fmtMXN(totalBal.net)}
          </p>
        </div>
      </div>

      {/* Account list */}
      <div className="space-y-1.5">
        {displayBalances.map(bal => (
          <button
            key={bal.accountId}
            onClick={() => onEntitySelect?.(bal.accountId)}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">{bal.accountName}</span>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {bal.income > 0 && (
                    <span className="text-xs text-emerald-400">+{fmtMXN(bal.income)}</span>
                  )}
                  {bal.expense > 0 && (
                    <span className="text-xs text-rose-400">-{fmtMXN(bal.expense)}</span>
                  )}
                </div>
              </div>
              <div className={cn(
                'text-xs font-bold min-w-[80px] text-right',
                bal.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {fmtMXN(bal.net)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {balances.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Ver {balances.length - 4} más <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </motion.div>
  );
}

function getMonthName(period: string): string {
  const [year, month] = period.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}
