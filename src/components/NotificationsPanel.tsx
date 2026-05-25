'use client';

import { motion } from 'framer-motion';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle, TrendingUp, TrendingDown, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { Transaction } from '@/types';

interface SmartAlert {
  transaction: Transaction;
  type: string;
  label: string;
  severity: 'error' | 'critical' | 'info' | 'warning';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface NotificationsPanelProps {
  alerts: SmartAlert[];
  onClose: () => void;
  onAlertClick?: (transaction: Transaction) => void;
}

const priorityConfig = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  high: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  medium: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  low: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
};

const typeIcons = {
  cashflow_warning: TrendingDown,
  cashflow_positive: TrendingUp,
  payment_due: Calendar,
  card_payment_due: CreditCard,
  cashflow_alert: DollarSign,
  overdue: AlertTriangle,
  liquidity: TrendingUp,
};

export default function NotificationsPanel({ alerts, onClose, onAlertClick }: NotificationsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 right-8 w-96 max-h-[70vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl z-50"
    >
      <div className="sticky top-0 bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 flex items-center justify-between rounded-t-2xl">
        <h3 className="text-white font-semibold">Alertas y Notificaciones</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400">No hay alertas pendientes</p>
            <p className="text-slate-500 text-sm mt-1">Todo está bajo control</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const config = priorityConfig[alert.priority as keyof typeof priorityConfig] || priorityConfig.medium;
            const Icon = typeIcons[alert.type as keyof typeof typeIcons] || Info;

            const isClickable = !!alert.transaction && !!onAlertClick;

            return (
              <motion.div
                key={`${alert.type}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  if (isClickable) {
                    onAlertClick!(alert.transaction);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl ${config.bg} border ${config.border} transition-all
                  ${isClickable ? 'cursor-pointer hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-medium ${config.color}`}>{alert.title}</p>
                      {isClickable && (
                        <span className="text-[10px] text-slate-500 shrink-0">Abrir →</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                    {alert.transaction && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-800 rounded">{alert.transaction.description}</span>
                        <span className={alert.transaction.amount < 0 ? 'text-red-400' : 'text-emerald-400'}>
                          ${Math.abs(alert.transaction.amount).toLocaleString('es-MX')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-0 bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 px-4 py-3 rounded-b-2xl">
        <p className="text-slate-500 text-xs text-center">
          {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} • Basado en transacciones activas
        </p>
      </div>
    </motion.div>
  );
}