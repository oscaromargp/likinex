'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, FileText, Settings, Plus, Bell, LogOut, User } from 'lucide-react';
import CalendarComponent from '@/components/Calendar';
import Ledger from '@/components/Ledger';
import SideDrawer from '@/components/SideDrawer';
import PDFReport from '@/components/PDFReport';
import MetricsCards from '@/components/MetricsCards';
import SettingsComponent from '@/components/Settings';
import CreditCardEngine from '@/components/CreditCardEngine';
import RiskToleranceEngine from '@/components/RiskToleranceEngine';
import CashFlowForecast from '@/components/CashFlowForecast';
import { Transaction, CalendarEvent, EntityConfig, DEFAULT_ENTITIES } from '@/types';
import { mockCreditCards } from '@/lib/mockData';
import { calculateMetrics, generateCalendarEvents } from '@/lib/userData';
import { getSmartAlerts } from '@/components/RiskToleranceEngine';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, type TransactionDB } from '@/hooks/useTransactions';
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/hooks/useEntities';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';

function mapDBToTransaction(db: TransactionDB): Transaction {
  return {
    id: db.id,
    template_id: db.template_id || undefined,
    user_id: db.user_id,
    entity: db.entity,
    description: db.description,
    amount: db.amount,
    due_date: db.due_date,
    paid_date: db.paid_date || undefined,
    status: db.status as Transaction['status'],
    recurrence: db.recurrence as Transaction['recurrence'],
    recurrence_day: db.recurrence_day || undefined,
    payment_method: db.payment_method as Transaction['payment_method'],
    category: db.category as Transaction['category'],
    notes: db.notes || undefined,
    follow_up: db.follow_up || undefined,
    attachment_url: db.attachment_url || undefined,
    price_change: db.price_change || undefined,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}

function mapTransactionToDB(tx: Transaction, userId: string): Omit<TransactionDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    template_id: tx.template_id || null,
    entity: tx.entity,
    description: tx.description,
    amount: tx.amount,
    currency: 'MXN',
    due_date: tx.due_date,
    paid_date: tx.paid_date || null,
    status: tx.status,
    recurrence: tx.recurrence,
    recurrence_day: tx.recurrence_day || null,
    payment_method: tx.payment_method || null,
    category: tx.category || null,
    notes: tx.notes || null,
    follow_up: tx.follow_up || null,
    attachment_url: tx.attachment_url || null,
    price_change: tx.price_change || null,
  };
}

function DashboardContent() {
  const { user, signOut, isLoading: authLoading, isDemo } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'ledger' | 'settings'>('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPDFReport, setShowPDFReport] = useState(false);
  const [printFilters, setPrintFilters] = useState({ dateRange: { start: null as string | null, end: null as string | null }, entity: 'all' as any });

  const { data: dbTransactions = [], isLoading: loadingTransactions } = useTransactions(user?.id);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const { data: dbEntities = [] } = useEntities(user?.id);
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const { data: dbCategories = [] } = useCategories(user?.id);
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.push(`/auth?from=/app`);
    }
  }, [user, authLoading, router, isDemo]);

  const transactions: Transaction[] = useMemo(() => {
    if (isDemo) {
      const { userTransactions } = require('@/lib/userData');
      return userTransactions;
    }
    return dbTransactions.map(mapDBToTransaction);
  }, [dbTransactions, isDemo]);

  const entities: EntityConfig[] = useMemo(() => {
    if (isDemo) return DEFAULT_ENTITIES;
    return dbEntities.map(e => ({
      id: e.id,
      name: e.name,
      icon: e.icon,
      color: e.color,
      is_active: e.is_active,
    }));
  }, [dbEntities, isDemo]);

  const categories: string[] = useMemo(() => {
    if (isDemo) return [];
    return dbCategories.map(c => c.name);
  }, [dbCategories, isDemo]);

  const metrics = calculateMetrics(transactions);
  const calendarEvents = generateCalendarEvents(transactions);
  const smartAlerts = getSmartAlerts(transactions);
  const alertCount = smartAlerts.length;

  const attachmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.attachment_url) {
        const saved = localStorage.getItem(`likinex_attachments_${t.id}`);
        if (saved) {
          counts[t.id] = JSON.parse(saved).length;
        } else {
          counts[t.id] = t.attachment_url.split(',').filter(Boolean).length;
        }
      }
    });
    return counts;
  }, [transactions]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    if (isDemo) return;
    if (!user) return;

    if (updated.id.startsWith('new_')) {
      await createTransaction.mutateAsync(mapTransactionToDB(updated, user.id));
    } else {
      await updateTransaction.mutateAsync({ id: updated.id, ...mapTransactionToDB(updated, user.id) });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    const transaction = transactions.find(t => t.id === event.id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDrawerOpen(true);
    }
  };

  const handleDateDoubleClick = (date: string) => {
    const newTransaction: Transaction = {
      id: `new_${Date.now()}`,
      entity: 'oscaromargp',
      description: 'Nueva transacción',
      amount: 0,
      due_date: date,
      status: 'pending',
      recurrence: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedTransaction(newTransaction);
    setIsDrawerOpen(true);
  };

  const handleImport = async (imported: Partial<Transaction>[]) => {
    if (isDemo || !user) return;
    const newTransactions = imported.map((t) => ({
      ...t,
      id: `imported_${Date.now()}_${Math.random()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Transaction));

    for (const tx of newTransactions) {
      await createTransaction.mutateAsync(mapTransactionToDB(tx, user.id));
    }
  };

  const handleExport = () => {
    const headers = ['entity,description,amount,due_date,recurrence,status,notes'];
    transactions.forEach(t => {
      headers.push(`${t.entity},"${t.description}",${t.amount},${t.due_date},${t.recurrence},${t.status},"${t.notes || ''}"`);
    });

    const csv = headers.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `likinex_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (dateRange: { start: string | null; end: string | null }, entity: any) => {
    setPrintFilters({ dateRange, entity });
    setShowPDFReport(true);
    setTimeout(() => {
      window.print();
      setShowPDFReport(false);
    }, 300);
  };

  const handleAddCategory = async (category: string) => {
    if (isDemo || !user) return;
    await createCategory.mutateAsync({
      user_id: user.id,
      name: category,
      icon: '📁',
      color: 'emerald',
      type: 'expense',
    });
  };

  const handleDeleteCategory = async (category: string) => {
    if (isDemo || !user) return;
    const cat = dbCategories.find(c => c.name === category);
    if (cat) {
      await deleteCategory.mutateAsync({ id: cat.id, userId: user.id });
    }
  };

  const handleAddEntity = async (entity: Omit<EntityConfig, 'id'>) => {
    if (isDemo || !user) return;
    await createEntity.mutateAsync({
      user_id: user.id,
      name: entity.name,
      icon: entity.icon,
      color: entity.color,
      type: 'personal',
      is_active: true,
    });
  };

  const handleUpdateEntity = async (entity: EntityConfig) => {
    if (isDemo || !user) return;
    await updateEntity.mutateAsync({
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      color: entity.color,
      is_active: entity.is_active,
    });
  };

  const handleDeleteEntity = async (id: string) => {
    if (isDemo || !user) return;
    await deleteEntity.mutateAsync({ id, userId: user.id });
  };

  const handleLogout = async () => {
    await signOut();
    if (isDemo) {
      router.push('/?demo=false');
    } else {
      router.push('/');
    }
  };

  if (authLoading || loadingTransactions || (!user && !isDemo)) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'ledger', label: 'Transacciones', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="flex">
        <aside className="w-64 h-screen bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-r border-[var(--border-subtle)] fixed left-0 top-0 flex flex-col">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-lg">💰</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">LikinEX</h1>
                <p className="text-xs text-slate-500">Orquestador de Liquidez</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 p-2 bg-[var(--bg-tertiary)]/30 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDemo ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                <User className={`w-4 h-4 ${isDemo ? 'text-blue-400' : 'text-emerald-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] text-sm font-medium truncate">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[var(--text-muted)] text-xs truncate">{user?.email}</p>
                  {isDemo && (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">DEMO</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    activeView === item.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64">
          <header className="h-16 bg-[var(--bg-secondary)]/50 backdrop-blur-xl border-b border-[var(--border-subtle)] px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] capitalize">{activeView}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors relative">
                <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {alertCount}
                  </span>
                )}
              </button>
              {activeView !== 'settings' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  Nueva Transacción
                </button>
              )}
            </div>
          </header>

          <div className="p-8">
            {activeView === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Métricas de Liquidez</h3>
                  <MetricsCards metrics={metrics} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Calendario</h3>
                    <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onDateDoubleClick={handleDateDoubleClick} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Transacciones Recientes</h3>
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden">
                      <div className="divide-y divide-slate-800/30">
                        {transactions.slice(0, 5).map((t, idx) => (
                          <motion.button
                            key={t.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handleTransactionClick(t)}
                            className="w-full p-4 text-left hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                          >
                            <div>
                              <p className="text-white font-medium">{t.description}</p>
                              <p className="text-slate-500 text-sm">{t.entity}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {t.amount < 0 ? '-' : ''}${Math.abs(t.amount).toLocaleString('es-MX')}
                              </p>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full',
                                t.status === 'settled' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              )}>
                                {t.status === 'settled' ? 'Liquidado' : 'Pendiente'}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                    <CashFlowForecast
                      transactions={transactions}
                      liquidity={metrics}
                      daysAhead={30}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                      <CreditCardEngine
                        cards={mockCreditCards}
                        currentBalance={metrics.available}
                      />
                    </div>
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                      <RiskToleranceEngine transactions={transactions} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'calendar' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onDateDoubleClick={handleDateDoubleClick} />
              </motion.div>
            )}

            {activeView === 'ledger' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Ledger transactions={transactions} onRowClick={handleTransactionClick} onPrint={handlePrint} attachmentCounts={attachmentCounts} />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SettingsComponent
                  transactions={transactions}
                  onImport={handleImport}
                  onExport={handleExport}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                  onDeleteCategory={handleDeleteCategory}
                  entities={entities}
                  onAddEntity={handleAddEntity}
                  onUpdateEntity={handleUpdateEntity}
                  onDeleteEntity={handleDeleteEntity}
                />
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <SideDrawer
        transaction={selectedTransaction}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleUpdateTransaction}
        allTransactions={transactions}
      />

      <PDFReport
        transactions={transactions}
        dateRange={printFilters.dateRange}
        entityFilter={printFilters.entity}
        isVisible={showPDFReport}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
