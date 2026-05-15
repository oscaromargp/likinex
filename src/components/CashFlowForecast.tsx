'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { Transaction, LiquidityMetrics } from '@/types';
import { formatCurrency, formatDateInput } from '@/lib/utils';
import { subDays, addDays, differenceInDays, parseISO } from 'date-fns';

interface CashFlowForecastProps {
  transactions: Transaction[];
  liquidity: LiquidityMetrics;
  daysAhead?: number;
}

export default function CashFlowForecast({ 
  transactions, 
  liquidity, 
  daysAhead = 30 
}: CashFlowForecastProps) {
  const today = new Date();

  const forecast = useMemo(() => {
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    
    const dailyBurnRate = pendingTransactions.reduce((sum, t) => {
      const daysUntilDue = differenceInDays(parseISO(t.due_date), today);
      if (daysUntilDue > 0 && daysUntilDue <= daysAhead) {
        return sum + (t.amount / daysUntilDue);
      }
      return sum;
    }, 0);

    const runwayDays = dailyBurnRate > 0 
      ? Math.floor(liquidity.available / dailyBurnRate)
      : Infinity;

    const forecastByDate: { date: string; balance: number; expenses: number }[] = [];
    let runningBalance = liquidity.available;

    for (let i = 0; i <= daysAhead; i++) {
      const date = addDays(today, i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayExpenses = pendingTransactions
        .filter(t => {
          const dueDate = parseISO(t.due_date);
          return differenceInDays(dueDate, today) === i;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      runningBalance -= dayExpenses;
      
      forecastByDate.push({
        date: dateStr,
        balance: runningBalance,
        expenses: dayExpenses
      });
    }

    const criticalDates = forecastByDate.filter(f => f.balance < 0);
    const lowBalanceThreshold = liquidity.available * 0.2;

    return {
      dailyBurnRate,
      runwayDays,
      forecastByDate,
      criticalDates,
      lowBalanceThreshold,
      totalPending: pendingTransactions.reduce((sum, t) => sum + t.amount, 0),
      avgDailyExpense: dailyBurnRate
    };
  }, [transactions, liquidity, today, daysAhead]);

  const getRunwayStatus = (days: number) => {
    if (days === Infinity) return { label: 'Sin riesgo', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (days <= 7) return { label: 'CRÍTICO', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (days <= 14) return { label: 'Advertencia', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (days <= 30) return { label: 'Precaución', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'Saludable', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  };

  const runwayStatus = getRunwayStatus(forecast.runwayDays);

  const minBalance = Math.min(...forecast.forecastByDate.map(f => f.balance));
  const minBalanceDate = forecast.forecastByDate.find(f => f.balance === minBalance)?.date;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${forecast.runwayDays <= 7 ? 'bg-red-500/20' : 'bg-cyan-500/20'}`}>
            <TrendingDown className={`w-5 h-5 ${forecast.runwayDays <= 7 ? 'text-red-400' : 'text-cyan-400'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Cash Flow Forecast</h3>
            <p className="text-sm text-slate-400">Liquidity Runway: {daysAhead} dias</p>
          </div>
        </div>
      </div>

      {forecast.runwayDays <= 14 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border ${
            forecast.runwayDays <= 7 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${forecast.runwayDays <= 7 ? 'text-red-400' : 'text-amber-400'}`} />
            <span className={`font-semibold ${
              forecast.runwayDays <= 7 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {forecast.runwayDays <= 7 
                ? 'CRÍTICO: Liquidez muy baja' 
                : 'Advertencia: Liquidez en decline'
              }
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Con el gasto actual, tienes <strong>{forecast.runwayDays === Infinity ? '∞' : forecast.runwayDays} dias</strong> de reserva restante.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-sm">Liquidez Disponible</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(liquidity.available)}</p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-slate-400 text-sm">Gasto Diario Prom.</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {forecast.avgDailyExpense > 0 ? formatCurrency(forecast.avgDailyExpense) : 'N/A'}
          </p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-sm">Runway (Dias)</span>
          </div>
          <p className={`text-2xl font-bold ${runwayStatus.color}`}>
            {forecast.runwayDays === Infinity ? '∞' : forecast.runwayDays}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${runwayStatus.bg} ${runwayStatus.color}`}>
            {runwayStatus.label}
          </span>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-sm">Pendiente ({daysAhead}d)</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(forecast.totalPending)}</p>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Proyección de Balance
          </h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span className="text-slate-400">Positivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span className="text-slate-400">Negativo</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {forecast.forecastByDate.filter((_, i) => i % 3 === 0).map((day, idx) => {
              const maxBalance = Math.max(...forecast.forecastByDate.map(f => f.balance), 1);
              const height = Math.max((day.balance / maxBalance) * 100, 5);
              const isNegative = day.balance < 0;
              
              return (
                <motion.div
                  key={day.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex-1 rounded-t-sm ${
                    isNegative ? 'bg-red-500/60' : 'bg-emerald-500/60'
                  }`}
                  title={`${formatDateInput(day.date)}: ${formatCurrency(day.balance)}`}
                />
              );
            })}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700" />
          <div 
            className="absolute bottom-0 left-0 h-px bg-amber-500/50 border border-dashed" 
            style={{ width: `${((forecast.lowBalanceThreshold / Math.max(...forecast.forecastByDate.map(f => f.balance), 1)) * 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Hoy</span>
          <span>+{Math.floor(daysAhead / 2)} dias</span>
          <span>+{daysAhead} dias</span>
        </div>
      </div>

      {minBalance < 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <h4 className="text-red-400 font-semibold mb-2">Fechas con Balance Negativo</h4>
          <div className="space-y-1">
            {forecast.criticalDates.slice(0, 5).map(critical => (
              <div key={critical.date} className="flex justify-between text-sm">
                <span className="text-slate-300">{formatDateInput(critical.date)}</span>
                <span className="text-red-400">{formatCurrency(critical.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}