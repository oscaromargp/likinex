'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, Printer, Paperclip } from 'lucide-react';
import { Transaction, Entity, TransactionStatus, FilterState, ENTITY_LABELS, ENTITY_COLORS, STATUS_LABELS, STATUS_COLORS, calculatePunctuality, calculateConsecutiveOnTime } from '@/types';
import { formatCurrency, formatDate, isUrgent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LedgerProps {
  transactions: Transaction[];
  onRowClick?: (transaction: Transaction) => void;
  onPrint?: (dateRange: { start: string | null; end: string | null }, entity: Entity | 'all') => void;
  attachmentCounts?: Record<string, number>;
}

type SortField = 'description' | 'entity' | 'amount' | 'due_date' | 'status';
type SortDirection = 'asc' | 'desc';

export default function Ledger({ transactions, onRowClick, onPrint, attachmentCounts = {} }: LedgerProps) {
  const [filters, setFilters] = useState<FilterState>({
    entity: 'all',
    status: 'all',
    search: '',
    dateRange: { start: null, end: null }
  });
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [printDateFrom, setPrintDateFrom] = useState('');
  const [printDateTo, setPrintDateTo] = useState('');

  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(search) ||
        t.entity.toLowerCase().includes(search)
      );
    }

    if (filters.entity !== 'all') {
      result = result.filter(t => t.entity === filters.entity);
    }

    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'amount') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactions, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePrint = () => {
    onPrint?.(
      { start: printDateFrom || null, end: printDateTo || null },
      filters.entity
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-600" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-emerald-400" />
      : <ChevronDown className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-indigo-400" />
            </div>
            Libro Mayor
          </h2>
          <span className="text-slate-400 text-sm">
            {filteredAndSorted.length} de {transactions.length} transacciones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <select
            value={filters.entity}
            onChange={e => setFilters(f => ({ ...f, entity: e.target.value as Entity | 'all' }))}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="all">Todas las entidades</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value as TransactionStatus | 'all' }))}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={printDateFrom}
              onChange={e => setPrintDateFrom(e.target.value)}
              placeholder="Desde"
              className="flex-1 px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <input
              type="date"
              value={printDateTo}
              onChange={e => setPrintDateTo(e.target.value)}
              placeholder="Hasta"
              className="flex-1 px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-indigo-400 font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800/50">
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Descripción <SortIcon field="description" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('entity')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Entidad <SortIcon field="entity" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Monto <SortIcon field="amount" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('due_date')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Fecha Límite <SortIcon field="due_date" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                  Estado <SortIcon field="status" />
                </button>
              </th>
              <th className="text-left p-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Puntualidad
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((transaction, idx) => {
              const urgent = transaction.status === 'pending' && isUrgent(transaction.due_date);
              const punctuality = calculatePunctuality(transaction.due_date, transaction.paid_date);
              const consecutiveOnTime = transaction.template_id
                ? calculateConsecutiveOnTime(transactions, transaction.template_id)
                : 0;
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onRowClick?.(transaction)}
                  className={cn(
                    'border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer',
                    urgent && 'bg-red-500/5'
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {urgent && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      <span className="text-white font-medium">{transaction.description}</span>
                      {attachmentCounts[transaction.id] > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          <Paperclip className="w-3 h-3" />
                          {attachmentCounts[transaction.id]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-xs px-2 py-1 rounded-full', ENTITY_COLORS[transaction.entity])}>
                      {ENTITY_LABELS[transaction.entity]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-semibold">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-sm', urgent ? 'text-red-400 font-medium' : 'text-slate-400')}>
                      {formatDate(transaction.due_date)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-xs px-2 py-1 rounded-full', STATUS_COLORS[transaction.status])}>
                      {STATUS_LABELS[transaction.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    {punctuality ? (
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full inline-block w-fit',
                          punctuality.level === 'on-time' ? 'bg-emerald-500/20 text-emerald-400' :
                          punctuality.level === 'slightly-late' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        )}>
                          {punctuality.level === 'on-time' ? '🟢' : punctuality.level === 'slightly-late' ? '🟡' : '🔴'} {punctuality.label}
                        </span>
                        {consecutiveOnTime > 1 && (
                          <span className="text-xs text-slate-500">
                            {consecutiveOnTime} pagos puntuales
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">N/A</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500">No se encontraron transacciones</p>
        </div>
      )}
    </div>
  );
}