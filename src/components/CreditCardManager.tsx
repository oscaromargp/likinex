'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import {
  CreditCardAccount,
  MSITransaction,
  CardMonthlyPayment,
} from '@/types';
import { mockCreditCardAccounts, mockMSITransactions, calculateNextCutOffDate, calculateNextPaymentDate, calculateCardMonthlyPayments } from '@/lib/creditCardData';
import { formatCurrency } from '@/lib/utils';

const brandColors: Record<string, string> = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-red-600 to-orange-600',
  amex: 'from-blue-700 to-indigo-900',
  other: 'from-slate-600 to-slate-800',
};

const tabColorMap: Record<string, string> = {
  resumen: 'text-purple-400 border-purple-400',
  msi: 'text-amber-400 border-amber-400',
  pagos: 'text-emerald-400 border-emerald-400',
};

const brandLabels: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  other: '---',
};

export default function CreditCardManager() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'msi' | 'pagos'>('resumen');
  const [selectedCard, setSelectedCard] = useState<string | 'all'>('all');

  const cards = mockCreditCardAccounts;
  const msis = mockMSITransactions;
  const payments = useMemo(() => calculateCardMonthlyPayments(cards, msis), [cards, msis]);

  const filteredCards = selectedCard === 'all' ? cards : cards.filter(c => c.id === selectedCard);
  const filteredMsis = selectedCard === 'all' ? msis : msis.filter(m => m.card_id === selectedCard);

  const totalDebt = cards.reduce((s, c) => s + c.current_balance, 0);
  const totalCredit = cards.reduce((s, c) => s + c.credit_limit, 0);
  const totalMSI = msis.reduce((s, m) => s + m.monthly_payment * m.remaining_months, 0);

  const daysUntil = (day: number): number => {
    const today = new Date().getDate();
    if (day >= today) return day - today;
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return lastDay - today + day;
  };

  const tabs = [
    { key: 'resumen' as const, label: 'Resumen', icon: 'CreditCard' },
    { key: 'msi' as const, label: 'MSI', icon: 'TrendingUp' },
    { key: 'pagos' as const, label: 'Pagos Proyectados', icon: 'Calendar' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">TDC Manager</h3>
        </div>
        <select
          value={selectedCard}
          onChange={e => setSelectedCard(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
        >
          <option value="all">Todas las tarjetas</option>
          {cards.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Deuda Total', value: totalDebt, icon: DollarSign, color: 'text-red-400' },
          { label: 'Línea Total', value: totalCredit, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'MSI Restante', value: totalMSI, icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-slate-400 text-sm">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{formatCurrency(stat.value)}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filteredCards.map((card, idx) => {
          const usagePct = Math.round((card.current_balance / card.credit_limit) * 100);
          const cutOffDate = calculateNextCutOffDate(card.cut_off_day);
          const paymentDate = calculateNextPaymentDate(card.payment_due_day);
          const daysToCut = daysUntil(card.cut_off_day);
          const daysToPay = daysUntil(card.payment_due_day);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative group"
            >
              <div className={`rounded-2xl p-5 bg-gradient-to-br ${brandColors[card.brand]} border border-white/10 shadow-xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.name}</p>
                    <p className="text-white/90 text-lg font-bold mt-1">**** {card.last4}</p>
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded text-white text-xs font-bold tracking-wider">
                    {brandLabels[card.brand]}
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Saldo actual</span>
                    <span className="text-white font-bold">{formatCurrency(card.current_balance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Límite</span>
                    <span className="text-white/80">{formatCurrency(card.credit_limit)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Disponible</span>
                    <span className="text-emerald-300 font-semibold">{formatCurrency(card.available_credit)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Uso</span>
                    <span className={usagePct > 80 ? 'text-red-300' : 'text-white/80'}>{usagePct}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        usagePct > 80 ? 'bg-red-400' : usagePct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Calendar className="w-3 h-3" />
                      Corte día {card.cut_off_day}
                    </div>
                    <p className="text-white/80 text-sm font-medium mt-0.5">
                      {daysToCut <= 0 ? 'Hoy' : `En ${daysToCut} días`}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-white/50 text-xs">
                      <Clock className="w-3 h-3" />
                      Pago día {card.payment_due_day}
                    </div>
                    <p className="text-white/80 text-sm font-medium mt-0.5">
                      {daysToPay <= 0 ? 'Hoy' : `En ${daysToPay} días`}
                    </p>
                  </div>
                </div>

                {usagePct > 80 && (
                  <div className="mt-3 flex items-center gap-1.5 bg-red-500/20 rounded-lg px-3 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
                    <span className="text-red-200 text-xs">Saldo cerca del límite</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? tabColorMap[tab.key].split(' ')[0] : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tdc-tab-indicator"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${tabColorMap[tab.key].split(' ')[1]}`}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'resumen' && (
              <motion.div
                key="resumen"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {filteredCards.map((card, idx) => {
                  const cardMsis = msis.filter(m => m.card_id === card.id);
                  const msiMonthly = cardMsis.reduce((s, m) => s + m.monthly_payment, 0);
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Tarjeta</p>
                          <p className="text-white font-medium">{card.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Saldo / Límite</p>
                          <p className="text-white">{formatCurrency(card.current_balance)} <span className="text-slate-500">/ {formatCurrency(card.credit_limit)}</span></p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">CAT Mensual</p>
                          <p className="text-white">{card.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">MSI Mensual</p>
                          <p className={msiMonthly > 0 ? 'text-amber-400' : 'text-slate-400'}>{msiMonthly > 0 ? formatCurrency(msiMonthly) : '---'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Disponible</p>
                          <p className={card.available_credit < card.credit_limit * 0.2 ? 'text-red-400' : 'text-emerald-400'}>
                            {formatCurrency(card.available_credit)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'msi' && (
              <motion.div
                key="msi"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {filteredMsis.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">No hay compras a MSI activas</p>
                ) : (
                  filteredMsis.map((msi, idx) => {
                    const card = cards.find(c => c.id === msi.card_id);
                    const progress = ((msi.total_months - msi.remaining_months) / msi.total_months) * 100;
                    return (
                      <motion.div
                        key={msi.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-medium">{msi.description}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{card?.name} · {formatCurrency(msi.monthly_payment)}/mes</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{formatCurrency(msi.total_amount)}</p>
                            <p className="text-slate-400 text-xs">{msi.remaining_months} de {msi.total_months} meses</p>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1.5">
                          <span className="text-slate-400">{Math.round(progress)}% pagado</span>
                          <span className="text-slate-400">{formatCurrency(msi.monthly_payment * msi.remaining_months)} restante</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === 'pagos' && (
              <motion.div
                key="pagos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {filteredCards.map(card => {
                  const cardPayments = payments.filter(p => p.card_id === card.id);
                  return (
                    <div key={card.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30">
                      <p className="text-white font-medium mb-3">{card.name}</p>
                      <div className="space-y-3">
                        {cardPayments.map((pm, idx) => {
                          const [y, m] = pm.month.split('-');
                          const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                          return (
                            <motion.div
                              key={pm.month}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className={`p-3 rounded-lg border ${
                                pm.is_due
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : 'bg-slate-700/20 border-slate-700/30'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {pm.is_due && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                                  <span className={`text-sm font-medium capitalize ${pm.is_due ? 'text-emerald-300' : 'text-slate-300'}`}>
                                    {monthName} {pm.is_due && '(próximo)'}
                                  </span>
                                </div>
                                <span className="text-white font-bold text-sm">{formatCurrency(pm.total_payment)}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                <div>
                                  Pago mínimo: <span className="text-white">{formatCurrency(pm.min_payment)}</span>
                                </div>
                                <div>
                                  Total a pagar: <span className="text-white">{formatCurrency(pm.total_payment)}</span>
                                </div>
                              </div>
                              {pm.msi_payments.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700/30">
                                  <p className="text-xs text-amber-400/80 mb-1.5">MSI incluidos:</p>
                                  {pm.msi_payments.map((msi, mi) => (
                                    <div key={mi} className="flex justify-between text-xs text-slate-400 py-0.5">
                                      <span>{msi.description}</span>
                                      <span className="text-white">{formatCurrency(msi.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
