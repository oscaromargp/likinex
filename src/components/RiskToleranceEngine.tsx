'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, Flame, CalendarClock, AlertCircle, TimerOff } from 'lucide-react';
import { Transaction, ServiceTolerance, DEFAULT_TOLERANCES, SmartAlert } from '@/types';
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

function calculateSmartAlert(transaction: Transaction, today: Date): SmartAlert | null {
  if (transaction.status !== 'pending') return null;

  const dueDate = new Date(transaction.due_date);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      transaction,
      type: 'overdue',
      label: 'Vencido',
      severity: 'error'
    };
  }

  if (diffDays === 0) {
    return {
      transaction,
      type: 'due_today',
      label: 'Vence hoy',
      severity: 'critical'
    };
  }

  if (diffDays <= 2) {
    return {
      transaction,
      type: 'upcoming',
      label: 'Pronto a vencer',
      severity: 'info'
    };
  }

  return null;
}

export function getSmartAlerts(transactions: Transaction[]): SmartAlert[] {
  const today = new Date();
  const alerts: SmartAlert[] = [];

  transactions.forEach(t => {
    const alert = calculateSmartAlert(t, today);
    if (alert) {
      alerts.push(alert);
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { error: 0, critical: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export default function RiskToleranceEngine({ transactions }: RiskToleranceEngineProps) {
  const today = new Date();

  const smartAlerts = useMemo(() => getSmartAlerts(transactions), [transactions]);

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
  const overdueCount = smartAlerts.filter(a => a.type === 'overdue').length;
  const dueTodayCount = smartAlerts.filter(a => a.type === 'due_today').length;
  const upcomingCount = smartAlerts.filter(a => a.type === 'upcoming').length;

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

      {smartAlerts.length > 0 && (
        <div className="space-y-2">
          {smartAlerts.map((alert, idx) => (
            <motion.div
              key={`smart-${alert.transaction.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'p-3 rounded-xl border flex items-center gap-3',
                alert.severity === 'error' ? 'bg-red-500/10 border-red-500/30' :
                alert.severity === 'critical' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              )}
            >
              {alert.type === 'overdue' ? (
                <TimerOff className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : alert.type === 'due_today' ? (
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              ) : (
                <CalendarClock className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{alert.transaction.description}</p>
                <p className="text-xs text-slate-400">
                  {alert.transaction.entity} • Vence: {formatDateInput(alert.transaction.due_date)}
                </p>
              </div>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full font-medium flex-shrink-0',
                alert.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                alert.severity === 'critical' ? 'bg-orange-500/20 text-orange-400' :
                'bg-blue-500/20 text-blue-400'
              )}>
                {alert.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`p-4 rounded-xl border ${overdueCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TimerOff className="w-4 h-4 text-red-400" />
            <span className="text-slate-400 text-sm">Vencidos</span>
          </div>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {overdueCount}
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${dueTodayCount > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400 text-sm">Vence hoy</span>
          </div>
          <p className={`text-2xl font-bold ${dueTodayCount > 0 ? 'text-orange-400' : 'text-slate-400'}`}>
            {dueTodayCount}
          </p>
        </div>

        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-sm">Pronto</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{upcomingCount}</p>
        </div>
        
        <div className={`p-4 rounded-xl border ${criticalCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-slate-400 text-sm">Críticos</span>
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