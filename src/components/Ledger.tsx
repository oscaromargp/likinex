'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, Printer, Paperclip, Eye, EyeOff, Calendar } from 'lucide-react';
import { Icon } from '@iconify/react';
import { 
  Transaction, 
  Entity, 
  TransactionStatus, 
  FilterState, 
  ENTITY_LABELS, 
  ENTITY_COLORS, 
  STATUS_LABELS, 
  STATUS_COLORS, 
  CATEGORY_LABELS,
  CATEGORY_LABELS as CATEGORIES,
  RecurrenceType,
  EntityConfig,
  getEntityLabel,
  getEntityColor,
  calculatePunctuality, 
  calculateConsecutiveOnTime 
} from '@/types';
import { formatCurrency, formatDate, isUrgent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface LedgerProps {
  transactions: Transaction[];
  onRowClick?: (transaction: Transaction) => void;
  onPrint?: (
    dateRange: { start: string | null; end: string | null },
    entity: Entity | 'all',
    category: string | 'all',
    status: TransactionStatus | 'all',
    type: 'all' | 'income' | 'expense'
  ) => void;
  attachmentCounts?: Record<string, number>;
  categories?: string[];
  entities?: EntityConfig[];
}

type SortField = 'description' | 'entity' | 'amount' | 'due_date' | 'status';
type SortDirection = 'asc' | 'desc';

const formatDateStr = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function Ledger({ transactions, onRowClick, onPrint, attachmentCounts = {}, categories: customCategories = [], entities = [] }: LedgerProps) {
  const [filters, setFilters] = useState<FilterState>({
    entity: 'all',
    status: 'all',
    search: '',
    dateRange: { start: null, end: null }
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [monthsAhead, setMonthsAhead] = useState<number>(12);
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'future' | 'today'>('all');

  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [printDateFrom, setPrintDateFrom] = useState('');
  const [printDateTo, setPrintDateTo] = useState('');

  const allCategories = useMemo(() => {
    const defaults = Object.keys(CATEGORIES);
    const merged = [...new Set([...defaults, ...customCategories])];
    return merged;
  }, [customCategories]);

  const allEntities = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; label: string }[] = [];
    for (const [id, label] of Object.entries(ENTITY_LABELS)) {
      seen.add(id);
      result.push({ id, label });
    }
    for (const e of entities) {
      if (e.is_active && !seen.has(e.id)) {
        seen.add(e.id);
        result.push({ id: e.id, label: e.name });
      }
    }
    return result;
  }, [entities]);

  const generateVirtualProjections = (txs: Transaction[]): Transaction[] => {
    const projected: Transaction[] = [];
    const now = new Date();
    const limitDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead + 1, 0);

    txs.forEach(t => {
      if (t.recurrence && t.recurrence !== 'none' && t.status === 'pending') {
        let currentDate = new Date(t.due_date);
        currentDate.setHours(12, 0, 0, 0);

        const addDays = (date: Date, days: number) => {
          const d = new Date(date);
          d.setDate(d.getDate() + days);
          return d;
        };
        const addMonths = (date: Date, months: number) => {
          const d = new Date(date);
          d.setMonth(d.getMonth() + months);
          return d;
        };

        let step = 1;
        while (true) {
          if (t.recurrence === 'weekly') {
            currentDate = addDays(currentDate, 7);
          } else if (t.recurrence === 'monthly') {
            currentDate = addMonths(currentDate, 1);
          } else if (t.recurrence === 'semi_monthly') {
            const currentDay = currentDate.getDate();
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            
            if (currentDay < 15) {
              currentDate = addDays(currentDate, 15 - currentDay);
            } else {
              const nextMonth = addMonths(currentDate, 1);
              const firstDayOfNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
              currentDate = firstDayOfNextMonth;
            }
          } else if (t.recurrence === 'bimonthly') {
            currentDate = addMonths(currentDate, 2);
          } else if (t.recurrence === 'quarterly') {
            currentDate = addMonths(currentDate, 3);
          } else if (t.recurrence === 'yearly') {
            currentDate = addMonths(currentDate, 12);
          } else {
            break;
          }

          if (currentDate > limitDate) break;

          const dateStr = formatDateStr(currentDate);
          
          projected.push({
            ...t,
            id: `${t.id}-proj-${step}`,
            due_date: dateStr,
            status: 'pending',
            description: `${t.description} (${formatDate(dateStr)})`,
            isProjection: true
          } as any);
          step++;
          
          if (step > 24) break;
        }
      }
    });

    return projected;
  };

  const allTxs = useMemo(() => {
    if (!showProjections) return transactions;
    const projected = generateVirtualProjections(transactions);
    return [...transactions, ...projected];
  }, [transactions, showProjections, monthsAhead]);

  const filteredAndSorted = useMemo(() => {
    let result = [...allTxs];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeFilter === 'past') {
      result = result.filter(t => new Date(t.due_date) < today && !t.isProjection);
    } else if (timeFilter === 'future') {
      result = result.filter(t => new Date(t.due_date) >= today);
    } else if (timeFilter === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      result = result.filter(t => t.due_date === todayStr);
    }

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

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => {
        const type = t.type || 'expense';
        return type === typeFilter;
      });
    }

    if (printDateFrom) {
      result = result.filter(t => t.due_date >= printDateFrom);
    }
    if (printDateTo) {
      result = result.filter(t => t.due_date <= printDateTo);
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
  }, [allTxs, filters, categoryFilter, typeFilter, timeFilter, sortField, sortDirection, printDateFrom, printDateTo]);

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
      filters.entity,
      categoryFilter,
      filters.status,
      typeFilter
    );
  };

  const isIncomeTx = (tx: Transaction) => tx.type === 'income';

  const getTypeLabel = (tx: Transaction) => {
    return isIncomeTx(tx) ? 'ingreso' : 'egreso';
  };

  const getTypeAmountColor = (tx: Transaction) => {
    return isIncomeTx(tx) ? 'text-emerald-400' : 'text-slate-300';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-600" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-emerald-400" />
      : <ChevronDown className="w-4 h-4 text-emerald-400" />;
  };

  const pendingCount = filteredAndSorted.filter(t => t.status === 'pending' && !t.isProjection).length;
  const settledCount = filteredAndSorted.filter(t => t.status === 'settled' && !t.isProjection).length;
  const projectionCount = filteredAndSorted.filter(t => t.isProjection).length;

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{pendingCount} Pendientes</span>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">{settledCount} Liquidados</span>
              {showProjections && projectionCount > 0 && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{projectionCount} Proyecciones</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="relative md:col-span-2">
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
              {allEntities.map(ent => (
                <option key={ent.id} value={ent.id}>{ent.label}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="all">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            >
              <option value="all">Ingresos y Egresos</option>
              <option value="income">Solo Ingresos</option>
              <option value="expense">Solo Egresos</option>
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

            <select
              value={monthsAhead}
              onChange={e => setMonthsAhead(Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              title="Meses a proyectar"
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
            </select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtros rápidos de tiempo */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setTimeFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  timeFilter === 'all' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Icon icon="mdi:calendar-multiple" className="w-3.5 h-3.5 inline mr-1" />
                Todas
              </button>
              <button
                onClick={() => setTimeFilter('past')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  timeFilter === 'past' 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Icon icon="mdi:history" className="w-3.5 h-3.5 inline mr-1" />
                Pasadas
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  timeFilter === 'today' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Icon icon="mdi:calendar-today" className="w-3.5 h-3.5 inline mr-1" />
                Hoy
              </button>
              <button
                onClick={() => setTimeFilter('future')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  timeFilter === 'future' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <Icon icon="mdi:calendar-arrow-right" className="w-3.5 h-3.5 inline mr-1" />
                Futuras
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-400">Rango de fechas:</span>
              <input
                type="date"
                value={printDateFrom}
                onChange={e => setPrintDateFrom(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <span className="text-slate-500">a</span>
              <input
                type="date"
                value={printDateTo}
                onChange={e => setPrintDateTo(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <button
              onClick={() => setShowProjections(!showProjections)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors',
                showProjections 
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
              )}
            >
              {showProjections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showProjections ? 'Ocultar' : 'Mostrar'} Proyecciones
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-xl text-indigo-400 font-medium transition-colors ml-auto"
            >
              <Printer className="w-4 h-4" />
              Imprimir Reporte
            </button>
          </div>
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
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Categoría
                </span>
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
              const categoryLabel = transaction.category && CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] 
                ? CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS]
                : (transaction.category || '-');
              const entityLabel = getEntityLabel(transaction.entity, entities);
              const entityColor = getEntityColor(transaction.entity, entities);
              
              return (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => {
                    if (transaction.isProjection) return;
                    onRowClick?.(transaction)
                  }}
                  className={cn(
                    'border-b border-slate-800/30 transition-colors',
                    transaction.isProjection ? 'opacity-60 cursor-default' : 'hover:bg-slate-800/30 cursor-pointer',
                    urgent && 'bg-red-500/5',
                    transaction.isProjection && 'bg-blue-500/5'
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {urgent && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {transaction.isProjection && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" title="Proyección" />
                      )}
                      <div>
                        <span className="text-white font-medium block">{transaction.description}</span>
                        {transaction.isProjection && (
                          <span className="text-xs text-blue-400">Proyección</span>
                        )}
                      </div>
                      {attachmentCounts[transaction.id] > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          <Paperclip className="w-3 h-3" />
                          {attachmentCounts[transaction.id]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn('text-xs px-2 py-1 rounded-full', entityColor)}>
                      {entityLabel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {categoryLabel}
                    </span>
                  </td>
                   <td className="p-4">
                    <span className={cn('font-semibold', getTypeAmountColor(transaction))}>
                      {isIncomeTx(transaction) ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <span className={cn(
                      'text-xs ml-1 px-1 py-0.5 rounded',
                      isIncomeTx(transaction) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    )}>
                      {isIncomeTx(transaction) ? 'ING' : 'EGR'}
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

      <div className="p-4 bg-slate-800/30 border-t border-slate-800/50">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{filteredAndSorted.length} transacciones mostradas</span>
          <span>Total: {formatCurrency(filteredAndSorted.reduce((sum, t) => sum + Math.abs(t.amount), 0))}</span>
        </div>
      </div>
    </div>
  );
}