'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, FileText, Settings, Plus, Bell, LogOut, User } from 'lucide-react';
import CalendarComponent from '@/components/Calendar';
import Ledger from '@/components/Ledger';
import SideDrawer from '@/components/SideDrawer';
import MetricsCards from '@/components/MetricsCards';
import SettingsComponent from '@/components/Settings';
import CreditCardEngine from '@/components/CreditCardEngine';
import RiskToleranceEngine from '@/components/RiskToleranceEngine';
import CashFlowForecast from '@/components/CashFlowForecast';
import { Transaction, CalendarEvent } from '@/types';
import { mockCreditCards } from '@/lib/mockData';
import { userTransactions, calculateMetrics, generateCalendarEvents } from '@/lib/userData';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

function DashboardContent() {
  const { user, logout, isLoading: authLoading, isDemo } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'ledger' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.push(`/auth?from=/app`);
    }
  }, [user, authLoading, router, isDemo]);

  useEffect(() => {
    if (user || isDemo) {
      const userKey = `likinex_transactions_${user?.id || 'demo'}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        setTransactions(userTransactions);
        localStorage.setItem(userKey, JSON.stringify(userTransactions));
      }

      const savedCategories = localStorage.getItem(`likinex_categories_${user?.id || 'demo'}`);
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    }
  }, [user, isDemo]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings') {
      setActiveView('settings');
    }
  }, [searchParams]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    if (user) {
      localStorage.setItem(`likinex_transactions_${user.id}`, JSON.stringify(newTransactions));
    }
  };

  const metrics = calculateMetrics(transactions);
  const calendarEvents = generateCalendarEvents(transactions);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    const newTransactions = transactions.map(t => t.id === updated.id ? updated : t);
    saveTransactions(newTransactions);
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

  const handleImport = (imported: Partial<Transaction>[]) => {
    const newTransactions = imported.map((t, i) => ({
      ...t,
      id: `imported_${Date.now()}_${i}`,
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Transaction));
    
    const all = [...transactions, ...newTransactions];
    saveTransactions(all);
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

  const handleAddCategory = (category: string) => {
    const newCategories = [...categories, category];
    setCategories(newCategories);
    if (user) {
      localStorage.setItem(`likinex_categories_${user.id}`, JSON.stringify(newCategories));
    }
  };

  const handleDeleteCategory = (category: string) => {
    const newCategories = categories.filter(c => c !== category);
    setCategories(newCategories);
    if (user) {
      localStorage.setItem(`likinex_categories_${user.id}`, JSON.stringify(newCategories));
    }
  };

  const handleLogout = () => {
    logout();
    if (isDemo) {
      router.push('/?demo=false');
    } else {
      router.push('/');
    }
  };

  if (authLoading || (!user && !isDemo)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <aside className="w-64 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 fixed left-0 top-0 flex flex-col">
          <div className="p-6 border-b border-slate-800/50">
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

          <div className="px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDemo ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                <User className={`w-4 h-4 ${isDemo ? 'text-blue-400' : 'text-emerald-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name || user?.email}</p>
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 text-xs truncate">{user?.email}</p>
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
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-800/50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64">
          <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white capitalize">{activeView}</h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                <Ledger transactions={transactions} onRowClick={handleTransactionClick} />
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
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}