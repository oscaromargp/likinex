'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { CreditCard as CreditCardType, CardAlert } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CreditCardEngineProps {
  cards: CreditCardType[];
  currentBalance: number;
}

export default function CreditCardEngine({ cards, currentBalance }: CreditCardEngineProps) {
  const [showAlerts, setShowAlerts] = useState(true);

  const today = new Date();
  const currentDay = today.getDate();

  const cardAlerts = useMemo(() => {
    const alerts: CardAlert[] = [];
    
    cards.forEach(card => {
      const daysUntilStatement = card.statement_date - currentDay;
      const daysUntilDue = card.due_date - currentDay;
      const balance = card.current_balance;
      
      if (daysUntilStatement <= 5 && daysUntilStatement > 0) {
        alerts.push({
          card_id: card.id,
          type: 'statement_soon',
          message: `Estado de cuenta proximo en ${daysUntilStatement} dias`,
          severity: daysUntilStatement <= 2 ? 'warning' : 'info',
          days_until: daysUntilStatement
        });
      }
      
      if (daysUntilDue <= 7 && daysUntilDue > 0) {
        const isTooEarly = daysUntilDue > 5;
        alerts.push({
          card_id: card.id,
          type: isTooEarly ? 'opportunity_cost' : 'due_soon',
          message: isTooEarly 
            ? `Puedes pagar hasta el ${card.due_date} para ganar intereses`
            : `Fecha de pago proxima en ${daysUntilDue} dias`,
          severity: isTooEarly ? 'info' : 'warning',
          days_until: daysUntilDue
        });
      }
      
      if (card.has_msi && card.msi_total > 0) {
        alerts.push({
          card_id: card.id,
          type: 'msi_warning',
          message: `Tienes ${formatCurrency(card.msi_total)} en MSI pendiente`,
          severity: 'warning',
          days_until: 0
        });
      }
      
      if (balance > currentBalance * 0.3) {
        alerts.push({
          card_id: card.id,
          type: 'balance_high',
          message: `Saldo alto: ${formatCurrency(balance)} (${Math.round(balance / currentBalance * 100)}% del disponible)`,
          severity: 'critical',
          days_until: 0
        });
      }
    });
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [cards, currentDay, currentBalance]);

  const totalDebt = cards.reduce((sum, c) => sum + c.current_balance, 0);
  const totalMSI = cards.reduce((sum, c) => sum + c.msi_total, 0);
  const opportunityCostDays = cardAlerts.filter(a => a.type === 'opportunity_cost').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Credit Card Engine</h3>
        </div>
        <button 
          onClick={() => setShowAlerts(!showAlerts)}
          className="text-sm text-slate-400 hover:text-white"
        >
          {showAlerts ? 'Ocultar' : 'Mostrar'} Alertas
        </button>
      </div>

      {showAlerts && cardAlerts.length > 0 && (
        <div className="space-y-2">
          {cardAlerts.map((alert, idx) => {
            const card = cards.find(c => c.id === alert.card_id);
            return (
              <motion.div
                key={`${alert.card_id}-${alert.type}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  alert.severity === 'critical' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : alert.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${
                  alert.severity === 'critical' ? 'text-red-400' : 
                  alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{card?.name}</p>
                  <p className={`text-xs ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'
                  }`}>{alert.message}</p>
                </div>
                {alert.days_until > 0 && (
                  <span className="text-xs text-slate-400">{alert.days_until}d</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span className="text-slate-400 text-sm">Deuda Total</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalDebt)}</p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 text-sm">MSI Pendiente</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalMSI)}</p>
        </div>
        
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400 text-sm">Dias de Oportunidad</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{opportunityCostDays}</p>
        </div>
      </div>

      <div className="bg-slate-800/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-700/50 text-xs text-slate-400 font-medium">
          <div>Tarjeta</div>
          <div>Saldo</div>
          <div>Corte</div>
          <div>Pago</div>
          <div>MSI</div>
        </div>
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800/30 hover:bg-slate-800/30"
          >
            <div className="text-white font-medium">{card.name}</div>
            <div className={card.current_balance > currentBalance * 0.3 ? 'text-red-400' : 'text-slate-300'}>
              {formatCurrency(card.current_balance)}
            </div>
            <div className="text-slate-400">Dia {card.statement_date}</div>
            <div className="text-slate-400">Dia {card.due_date}</div>
            <div className={card.msi_total > 0 ? 'text-amber-400' : 'text-slate-400'}>
              {card.msi_total > 0 ? formatCurrency(card.msi_total) : '-'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}