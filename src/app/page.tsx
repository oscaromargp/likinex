'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, FileText, Settings, Plus, Bell } from 'lucide-react';
import CalendarComponent from '@/components/Calendar';
import Ledger from '@/components/Ledger';
import SideDrawer from '@/components/SideDrawer';
import MetricsCards from '@/components/MetricsCards';
import { Transaction, CalendarEvent } from '@/types';
import { mockTransactions, mockTemplates, calculateMetrics, generateCalendarEvents } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'ledger'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const metrics = calculateMetrics(transactions);
  const calendarEvents = generateCalendarEvents(transactions, mockTemplates);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDrawerOpen(true);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleEventClick = (event: CalendarEvent) => {
    const transaction = transactions.find(t => t.id === event.id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDrawerOpen(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'ledger', label: 'Transacciones', icon: FileText }
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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configuración</span>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
                Nueva Transacción
              </button>
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
                    <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} />
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
                              <p className="text-emerald-400 font-semibold">
                                ${t.amount.toLocaleString('es-MX')}
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
              </motion.div>
            )}

            {activeView === 'calendar' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} />
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