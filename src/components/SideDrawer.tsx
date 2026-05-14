'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, FileText, Clock, CreditCard, Paperclip, Save } from 'lucide-react';
import { Transaction, TransactionStatus, PaymentMethod, ENTITY_LABELS, STATUS_LABELS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SideDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (transaction: Transaction) => void;
}

export default function SideDrawer({ transaction, isOpen, onClose, onUpdate }: SideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'followup' | 'attachments'>('details');
  const [formData, setFormData] = useState({
    notes: '',
    payment_method: '',
    follow_up: '',
    price_change: 0
  });

  if (!transaction) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...transaction,
        notes: formData.notes || transaction.notes,
        payment_method: formData.payment_method as PaymentMethod || transaction.payment_method,
        price_change: formData.price_change || undefined
      });
    }
    onClose();
  };

  const tabs = [
    { id: 'details', label: 'Detalles', icon: FileText },
    { id: 'payment', label: 'Pago', icon: CreditCard },
    { id: 'followup', label: 'Seguimiento', icon: Clock },
    { id: 'attachments', label: 'Adjuntos', icon: Paperclip }
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-emerald-500/20 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-white">Gestión de Transacción</h2>
                <p className="text-sm text-slate-400">{transaction.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex border-b border-slate-800/50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    activeTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Entidad</p>
                      <p className="text-white font-medium">{ENTITY_LABELS[transaction.entity]}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Estado</p>
                      <select
                        value={transaction.status}
                        onChange={e => onUpdate?.({ ...transaction, status: e.target.value as TransactionStatus })}
                        className="w-full bg-transparent text-white font-medium focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Monto</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Fecha Límite</p>
                      <p className="text-white font-medium">{formatDate(transaction.due_date)}</p>
                    </div>
                    {transaction.paid_date && (
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">Fecha de Pago</p>
                        <p className="text-white font-medium">{formatDate(transaction.paid_date)}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Notas</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Agregar notas..."
                      rows={4}
                      className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Método de Pago</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}
                      className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="transfer">Transferencia</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="check">Cheque</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Cambio de Precio (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        value={formData.price_change}
                        onChange={e => setFormData(f => ({ ...f, price_change: Number(e.target.value) }))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Precio original: {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'followup' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Recordatorio de Seguimiento</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="datetime-local"
                        value={formData.follow_up}
                        onChange={e => setFormData(f => ({ ...f, follow_up: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <h4 className="text-amber-400 font-medium mb-2">⚠️ Alerta de Urgencia</h4>
                    <p className="text-sm text-slate-400">
                      Las transacciones pendientes con menos de 72 horas se marcarán como urgentes automáticamente.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center">
                    <Paperclip className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-2">Arrastra archivos aquí o haz clic para subir</p>
                    <p className="text-slate-600 text-xs">PDF, PNG, JPG hasta 10MB</p>
                  </div>

                  {transaction.attachment_url && (
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-sm text-slate-400 mb-2">Archivo adjunto</p>
                      <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <FileText className="w-8 h-8 text-emerald-400" />
                        <div className="flex-1">
                          <p className="text-white text-sm">receipt.pdf</p>
                          <p className="text-slate-500 text-xs">245 KB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800/50">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}