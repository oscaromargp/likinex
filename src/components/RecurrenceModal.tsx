'use client';

import { motion } from 'framer-motion';
import { Calendar, Copy, RefreshCw, AlertCircle } from 'lucide-react';

interface RecurrenceModalProps {
  isOpen: boolean;
  description: string;
  oldDate: string;
  newDate: string;
  occurrenceCount: number;
  onUpdateThis: () => void;
  onUpdateAll: () => void;
  onCancel: () => void;
}

export default function RecurrenceModal({
  isOpen,
  description,
  oldDate,
  newDate,
  occurrenceCount,
  onUpdateThis,
  onUpdateAll,
  onCancel
}: RecurrenceModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transacción Recurrente</h3>
              <p className="text-sm text-slate-400">Esta es una serie de pagos</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <p className="text-white font-medium mb-2">{description}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Fecha anterior:</span>
              <span className="text-amber-400 font-medium">{formatDate(oldDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-slate-500">Nueva fecha:</span>
              <span className="text-emerald-400 font-medium">{formatDate(newDate)}</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Esta transacción tiene <strong>{occurrenceCount}</strong> ocurrencia{occurrenceCount !== 1 ? 's' : ''} futura{occurrenceCount !== 1 ? 's' : ''}. 
              ¿Deseas aplicar el cambio solo a esta o a todas las futuras?
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 gap-3">
          <button
            onClick={onUpdateThis}
            className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <Copy className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Solo esta transacción</p>
                <p className="text-sm text-slate-400">Las demás ocurrencias mantienen su fecha original</p>
              </div>
            </div>
          </button>

          <button
            onClick={onUpdateAll}
            className="w-full p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-emerald-400 font-medium">Todas las futuras ({occurrenceCount})</p>
                <p className="text-sm text-slate-400">Ajusta la fecha de todas las ocurrencias siguientes</p>
              </div>
            </div>
          </button>

          <button
            onClick={onCancel}
            className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors text-sm"
          >
            Cancelar y mantener fecha original
          </button>
        </div>
      </motion.div>
    </div>
  );
}