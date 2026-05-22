'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Transaction } from '@/types';

interface DropInfo {
  eventId: string;
  oldDate: string;
  newDate: string;
  toleranceDays: number;
}

interface DropConfirmModalProps {
  show: boolean;
  dropInfo: DropInfo | null;
  transactions: Transaction[];
  formatDate: (date: string) => string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DropConfirmModal({ show, dropInfo, transactions, formatDate, onConfirm, onCancel }: DropConfirmModalProps) {
  return (
    <AnimatePresence>
      {show && dropInfo && (() => {
        const tx = transactions.find(t => t.id === dropInfo.eventId);
        if (!tx) return null;
        const oldDateObj = new Date(dropInfo.oldDate);
        const newDateObj = new Date(dropInfo.newDate);
        const diffDays = Math.round((newDateObj.getTime() - oldDateObj.getTime()) / (1000 * 60 * 60 * 24));
        const graceDays = dropInfo.toleranceDays;
        const exceedsGrace = diffDays > graceDays;

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Icon icon="mdi:calendar-clock" className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reprogramar Pago</h3>
                    <p className="text-sm text-slate-400">Mover fecha de vencimiento</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <p className="text-white font-medium mb-2">{tx.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Fecha actual:</span>
                    <span className="text-amber-400 font-medium">{formatDate(dropInfo.oldDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-slate-500">Nueva fecha:</span>
                    <span className="text-emerald-400 font-medium">{formatDate(dropInfo.newDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-slate-500">Días de diferencia:</span>
                    <span className="text-white font-medium">{diffDays} día{diffDays !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {graceDays > 0 && (
                  <div className={`rounded-xl p-3 flex items-start gap-2 ${exceedsGrace ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                    <Icon icon={exceedsGrace ? "mdi:alert-circle" : "mdi:information"} className={`w-5 h-5 flex-shrink-0 mt-0.5 ${exceedsGrace ? 'text-red-400' : 'text-blue-400'}`} />
                    <p className={`text-sm ${exceedsGrace ? 'text-red-300' : 'text-blue-300'}`}>
                      {exceedsGrace
                        ? `Estás moviendo ${diffDays} días, pero solo tienes ${graceDays} día${graceDays !== 1 ? 's' : ''} de prórroga. ¿Realmente quieres pagar hasta el ${formatDate(dropInfo.newDate)}?`
                        : `Tienes ${graceDays} día${graceDays !== 1 ? 's' : ''} de prórroga. Este movimiento está dentro del período de gracia.`
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 grid grid-cols-2 gap-3">
                <button
                  onClick={onConfirm}
                  className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon icon="mdi:check-circle" className="w-6 h-6 text-emerald-400" />
                    <p className="text-emerald-400 font-medium text-sm">Sí, reprogramar</p>
                  </div>
                </button>

                <button
                  onClick={onCancel}
                  className="p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all group"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon icon="mdi:cancel" className="w-6 h-6 text-slate-400" />
                    <p className="text-slate-400 font-medium text-sm">Cancelar</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
