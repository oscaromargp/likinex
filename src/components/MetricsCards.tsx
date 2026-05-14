'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { LiquidityMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface MetricsCardsProps {
  metrics: LiquidityMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Comprometido',
      value: metrics.committed,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      description: 'Total de obligaciones'
    },
    {
      title: 'Liquidado',
      value: metrics.settled,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      description: 'Pagos completados'
    },
    {
      title: 'Pendiente',
      value: metrics.pending,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      description: 'Por pagar'
    },
    {
      title: 'Disponible',
      value: metrics.available,
      icon: TrendingDown,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      description: 'Flujo disponible'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">{card.title}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            {formatCurrency(card.value)}
          </p>
          <p className="text-slate-500 text-xs mt-2">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
}