'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, Flame } from 'lucide-react';
import { Transaction, ServiceTolerance, DEFAULT_TOLERANCES } from '@/types';
import { formatDateInput, cn } from '@/lib/utils';

interface RiskToleranceEngineProps {
  transactions: Transaction[];
}

interface RiskAlert {
  transaction: Transaction;
  tolerance: ServiceTolerance;
  hours_remaining: number;
  severity: 'critical' | 'warning' | 'safe';
}

export default function RiskToleranceEngine({ transactions }: RiskToleranceEngineProps) {
  const today = new Date();

  const riskAlerts = useMemo(() => {
    const alerts: RiskAlert[] = [];
    const now = today.getTime();

    transactions.forEach(t => {
      if (t.status !== 'pending') return;

      const tolerance = DEFAULT_TOLERANCES.find(
        dt => dt.service_type === (t.category || 'otro')
      ) || { service_type: 'otro', tolerance_days: 7, criticality: 'non_critical' as const };

      const dueDate = new Date(t.due_date);
      const dueTime = dueDate.getTime();
      const hoursRemaining = (dueTime - now) / (1000 * 60 * 60);
      const daysRemaining = hoursRemaining / 24;

      let severity: 'critical' | 'warning' | 'safe';

      if (hoursRemaining <= 24) {
        severity = 'critical';
      } else if (daysRemaining <= tolerance.tolerance_days) {
        severity = 'warning';
      } else {
        severity = 'safe';
      }

      if (severity !== 'safe') {
        alerts.push({
          transaction: t,
          tolerance,
          hours_remaining: hoursRemaining,
          severity
        });
      }
    });

    return alerts.sort((a, b) => a.hours_remaining - b.hours_remaining);
  }, [transactions, today]);

  const criticalCount = riskAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = riskAlerts.filter(a => a.severity === 'warning').length;

  const criticalServices = riskAlerts.filter(a => a.tolerance.criticality === 'critical');
  const nonCriticalServices = riskAlerts.filter(a => a.tolerance.criticality === 'non_critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${criticalCount > 0 ? 'bg-red-500/20 animate-pulse' : 'bg-orange-500/20'}`}>
            <Shield className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-400' : 'text-orange-400'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Risk Tolerance Engine</h3>
            <p className="text-sm text-slate-400">Alertas basadas en buffers de tolerancia</p>
          </div>
        </div>
      </div>

      {criticalCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">CRÍTICO: {criticalCount} servicios en riesgo</span>
          </div>
          <p className="text-sm text-slate-300">
            Los siguientes pagos están a menos de 24 horas de su fecha límite.
            Incluye servicios críticos como CFE, Telmex y Renta.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${criticalCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-slate-400 text-sm">Criticos</span>
          </div>
          <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {criticalCount}
          </p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-sm">Advertencia</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
        </div>
        
        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-sm">En Tiempo</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {transactions.filter(t => t.status === 'pending').length - criticalCount - warningCount}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Servicios Críticos en Riesgo
        </h4>
        {criticalServices.length === 0 && nonCriticalServices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay alertas de riesgo. Todos los pagos están dentro del buffer de tolerancia.
          </div>
        ) : (
          <div className="space-y-2">
            {criticalServices.concat(nonCriticalServices).map((alert, idx) => (
              <motion.div
                key={`${alert.transaction.id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'p-4 rounded-xl border flex items-center justify-between',
                  alert.severity === 'critical' 
                    ? 'bg-red-500/10 border-red-500/30 animate-pulse' 
                    : 'bg-amber-500/10 border-amber-500/30'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    alert.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                  )} />
                  <div>
                    <p className="text-white font-medium">{alert.transaction.description}</p>
                    <p className="text-sm text-slate-400">
                      {alert.transaction.entity} • Vence: {formatDateInput(alert.transaction.due_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-bold',
                    alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                  )}>
                    {alert.hours_remaining < 0 
                      ? `${Math.abs(Math.round(alert.hours_remaining))}h atrasado`
                      : `${Math.round(alert.hours_remaining)}h restantes`
                    }
                  </p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    alert.tolerance.criticality === 'critical' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-slate-700 text-slate-400'
                  )}>
                    {alert.tolerance.criticality === 'critical' ? 'CRITICO' : 'NO CRITICO'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}