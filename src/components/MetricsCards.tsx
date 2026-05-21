'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { LiquidityMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FillableDonut } from './charts/FillableDonut';

interface MetricsCardsProps {
  metrics: LiquidityMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const total = Math.max(metrics.committed + metrics.available, 1);

  const cards = [
    {
      title: 'Comprometido',
      value: metrics.committed,
      max: total,
      icon: TrendingUp,
      color: 'text-indigo-400',
      gaugeColor: '#818cf8',
      bgColor: 'bg-indigo-500/20',
      description: 'Total de obligaciones'
    },
    {
      title: 'Liquidado',
      value: metrics.settled,
      max: total,
      icon: DollarSign,
      color: 'text-emerald-400',
      gaugeColor: '#34d399',
      bgColor: 'bg-emerald-500/20',
      description: 'Pagos completados'
    },
    {
      title: 'Pendiente',
      value: metrics.pending,
      max: total,
      icon: Clock,
      color: 'text-amber-400',
      gaugeColor: '#fbbf24',
      bgColor: 'bg-amber-500/20',
      description: 'Por pagar'
    },
    {
      title: 'Disponible',
      value: metrics.available,
      max: total,
      icon: TrendingDown,
      color: 'text-cyan-400',
      gaugeColor: '#22d3ee',
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
          <div className="flex items-center justify-center mb-2">
            <FillableDonut value={card.value} max={card.max} label={card.title} color={card.gaugeColor} />
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${card.color}`}>
              {formatCurrency(card.value)}
            </p>
            <p className="text-slate-500 text-xs mt-1">{card.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}