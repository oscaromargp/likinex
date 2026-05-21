'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar, FileText, Settings, Plus, Bell, LogOut, User, Users } from 'lucide-react';
import { Icon } from '@iconify/react';
import CalendarComponent from '@/components/Calendar';
import Ledger from '@/components/Ledger';
import SideDrawer from '@/components/SideDrawer';
import PDFReport from '@/components/PDFReport';
import MetricsCards from '@/components/MetricsCards';
import SettingsComponent from '@/components/Settings';
import CreditCardEngine from '@/components/CreditCardEngine';
import RiskToleranceEngine from '@/components/RiskToleranceEngine';
import CashFlowForecast from '@/components/CashFlowForecast';
import NotificationsPanel from '@/components/NotificationsPanel';
import Contacts from '@/components/Contacts';
import WeeklyPulse from '@/components/WeeklyPulse';
import AccountBalances from '@/components/AccountBalances';
import { Transaction, CalendarEvent, EntityConfig, DEFAULT_ENTITIES, Contact } from '@/types';
import { mockCreditCards } from '@/lib/mockData';
import { calculateMetrics, generateCalendarEvents } from '@/lib/userData';
import { getSmartAlerts } from '@/components/RiskToleranceEngine';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, type TransactionDB } from '@/hooks/useTransactions';
import { useEntities, useCreateEntity, useUpdateEntity, useDeleteEntity } from '@/hooks/useEntities';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { formatDate } from '@/lib/utils';

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
    type: db.type as Transaction['type'],
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
    type: tx.type || null,
    notes: tx.notes || null,
    follow_up: tx.follow_up || null,
    attachment_url: tx.attachment_url || null,
    price_change: tx.price_change || null,
  };
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact_cfe',
    name: 'CFE (Comisión Federal de Electricidad)',
    email: 'pagos@cfe.mx',
    phones: [{ number: '5511223344', type: 'trabajo', description: 'Atención a clientes' }],
    addresses: [{ address: 'Av. Paseo de la Reforma, CDMX', type: 'oficina' }],
    bank_accounts: [{ bank_name: 'BBVA Bancomer', account_number: '0123456789', clabe: '012180001234567892', is_primary: true }],
    payment_method_preferred: 'transfer',
    notes: 'Pago de electricidad bimestral. Variable.',
    digital_presence: { website: 'https://www.cfe.mx' },
    reputation_notes: [{ id: 'rep_cfe_1', date: new Date().toISOString(), type: 'neutral', note: 'Siempre facturan a tiempo.' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'contact_telmex',
    name: 'Telmex (Servicios de Internet)',
    email: 'factura@telmex.com',
    phones: [{ number: '8001232222', type: 'trabajo', description: 'Soporte Técnico' }],
    addresses: [{ address: 'Av. Marina Nacional, CDMX', type: 'oficina' }],
    bank_accounts: [{ bank_name: 'Santander', account_number: '987654321', clabe: '014180009876543210', is_primary: true }],
    payment_method_preferred: 'card',
    notes: 'Pago mensual de internet y telefonía. Fijo.',
    digital_presence: { website: 'https://telmex.com', facebook: 'https://facebook.com/telmex' },
    reputation_notes: [{ id: 'rep_telmex_1', date: new Date().toISOString(), type: 'negative', note: 'Tardaron 3 días en arreglar un problema de conexión el mes pasado.' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'contact_limpieza',
    name: 'Doña María (Servicio de Limpieza)',
    phones: [{ number: '5599887766', type: 'móvil', description: 'Personal' }],
    bank_accounts: [{ bank_name: 'BanCoppel', clabe: '137180004561237890', is_primary: true }],
    payment_method_preferred: 'cash',
    notes: 'Limpieza los días 15 y 30. Se paga en efectivo o transferencia.',
    reputation_notes: [{ id: 'rep_maria_1', date: new Date().toISOString(), type: 'positive', note: 'Muy confiable y puntual.' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'contact_renta',
    name: 'Arrendadora Centenario (Renta Oficina)',
    email: 'rentas@centenario.com',
    phones: [{ number: '5566778899', type: 'trabajo', description: 'Administración' }, { number: '5566778800', type: 'móvil', description: 'Urgencias' }],
    bank_accounts: [{ bank_name: 'Banorte', clabe: '072180002581473695', is_primary: true, alias: 'Cuenta Fiscal' }],
    payment_method_preferred: 'transfer',
    notes: 'Renta mensual de la oficina principal. Límite el día 5.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function DashboardContent() {
  const { user, signOut, isLoading: authLoading, isDemo } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'ledger' | 'settings' | 'contacts'>('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPDFReport, setShowPDFReport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [printFilters, setPrintFilters] = useState<{ dateRange: { start: string | null, end: string | null }, entity: string, category: string, status: string, type: string }>({ dateRange: { start: null, end: null }, entity: 'all', category: 'all', status: 'all', type: 'all' });
  const [showDropConfirm, setShowDropConfirm] = useState<{ eventId: string; oldDate: string; newDate: string; toleranceDays: number } | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | undefined>(undefined);

  // Estados locales para el modo Demo interactivo
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>([]);
  const [demoEntities, setDemoEntities] = useState<EntityConfig[]>([]);
  const [demoCategories, setDemoCategories] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

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

  // Inicializar estados de Demo desde localStorage o mockData
  useEffect(() => {
    if (isDemo) {
      const savedTx = localStorage.getItem('likinex_demo_transactions');
      if (savedTx) {
        try {
          setDemoTransactions(JSON.parse(savedTx));
        } catch (e) {
          const { userTransactions } = require('@/lib/userData');
          setDemoTransactions(userTransactions);
        }
      } else {
        const { userTransactions } = require('@/lib/userData');
        setDemoTransactions(userTransactions);
      }

      const savedEnt = localStorage.getItem('likinex_demo_entities');
      if (savedEnt) {
        try {
          setDemoEntities(JSON.parse(savedEnt));
        } catch (e) {
          setDemoEntities(DEFAULT_ENTITIES);
        }
      } else {
        setDemoEntities(DEFAULT_ENTITIES);
      }

      const savedCat = localStorage.getItem('likinex_demo_categories');
      if (savedCat) {
        try {
          setDemoCategories(JSON.parse(savedCat));
        } catch (e) {
          setDemoCategories([]);
        }
      } else {
        setDemoCategories([]);
      }
    }
  }, [isDemo]);

  // Load and save contacts locally
  useEffect(() => {
    const savedContacts = localStorage.getItem('likinex_contacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {
        setContacts(INITIAL_CONTACTS);
      }
    } else {
      setContacts(INITIAL_CONTACTS);
      localStorage.setItem('likinex_contacts', JSON.stringify(INITIAL_CONTACTS));
    }
  }, []);

  const updateContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('likinex_contacts', JSON.stringify(newContacts));
  };

  const handleAddContact = (contact: Contact) => {
    updateContacts([...contacts, contact]);
  };

  const handleUpdateContact = (updated: Contact) => {
    updateContacts(contacts.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteContact = (id: string) => {
    updateContacts(contacts.filter(c => c.id !== id));
  };

  const handleCreateTransactionForContact = (contact: Contact) => {
    const newTx: Transaction = {
      id: `new_${Date.now()}`,
      description: `Pago a ${contact.name}`,
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      entity: 'oscaromargp', // Default entity
      status: 'pending',
      recurrence: 'none',
      payment_method: contact.payment_method_preferred || 'transfer',
      contact_id: contact.id,
      payment_destination: contact.bank_clabe || contact.bank_account || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedTransaction(newTx);
    setIsDrawerOpen(true);
  };

  // Auxiliares para actualizar estados demo y guardarlos en localStorage
  const updateDemoTransactions = (newTx: Transaction[]) => {
    setDemoTransactions(newTx);
    localStorage.setItem('likinex_demo_transactions', JSON.stringify(newTx));
  };

  const updateDemoEntities = (newEnt: EntityConfig[]) => {
    setDemoEntities(newEnt);
    localStorage.setItem('likinex_demo_entities', JSON.stringify(newEnt));
  };

  const updateDemoCategories = (newCat: string[]) => {
    setDemoCategories(newCat);
    localStorage.setItem('likinex_demo_categories', JSON.stringify(newCat));
  };

  useEffect(() => {
    if (!authLoading && !user && !isDemo) {
      router.push(`/auth?from=/app`);
    }
  }, [user, authLoading, router, isDemo]);

  const transactions: Transaction[] = useMemo(() => {
    if (isDemo) {
      return demoTransactions;
    }
    return dbTransactions.map(mapDBToTransaction);
  }, [dbTransactions, isDemo, demoTransactions]);

  const entities: EntityConfig[] = useMemo(() => {
    if (isDemo) return demoEntities;
    return dbEntities.map(e => ({
      id: e.id,
      name: e.name,
      icon: e.icon,
      color: e.color,
      is_active: e.is_active,
    }));
  }, [dbEntities, isDemo, demoEntities]);

  const categories: string[] = useMemo(() => {
    if (isDemo) return demoCategories;
    return dbCategories.map(c => c.name);
  }, [dbCategories, isDemo, demoCategories]);

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

  const handleUpdateTransaction = async (updated: Transaction | Transaction[]) => {
    if (isDemo) {
      if (Array.isArray(updated)) {
        const finalTxs = updated.map((tx, idx) => ({
          ...tx,
          id: `local_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        updateDemoTransactions([...finalTxs, ...demoTransactions]);
        if (finalTxs.length > 0) {
          setSelectedTransaction(finalTxs[0]);
        }
      } else {
        if (updated.id.startsWith('new_')) {
          const finalTx: Transaction = {
            ...updated,
            id: `local_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          updateDemoTransactions([finalTx, ...demoTransactions]);
          setSelectedTransaction(finalTx);
        } else {
          const finalTx: Transaction = {
            ...updated,
            updated_at: new Date().toISOString(),
          };
          updateDemoTransactions(demoTransactions.map(t => t.id === updated.id ? finalTx : t));
          setSelectedTransaction(finalTx);
        }
      }
      return;
    }
    if (!user) return;

    if (Array.isArray(updated)) {
      for (const tx of updated) {
        await createTransaction.mutateAsync(mapTransactionToDB(tx, user.id));
      }
    } else {
      if (updated.id.startsWith('new_')) {
        await createTransaction.mutateAsync(mapTransactionToDB(updated, user.id));
      } else {
        await updateTransaction.mutateAsync({ id: updated.id, ...mapTransactionToDB(updated, user.id) });
        setSelectedTransaction(updated);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (isDemo) {
      updateDemoTransactions(demoTransactions.filter(t => t.id !== id));
      return;
    }
    if (!user) return;
    await deleteTransaction.mutateAsync({ id, userId: user.id });
  };

  const handleEventClick = (event: CalendarEvent) => {
    const transaction = transactions.find(t => t.id === event.id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDrawerOpen(true);
    }
  };

  const handleCreateNewTransaction = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTransaction: Transaction = {
      id: `new_${Date.now()}`,
      entity: entities[0]?.id || 'oscaromargp',
      description: '',
      amount: 0,
      due_date: todayStr,
      status: 'pending',
      type: 'expense',
      recurrence: 'none',
      tolerance_days: 2,
      payment_method: 'transfer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedTransaction(newTransaction);
    setIsDrawerOpen(true);
  };

  const handleDateDoubleClick = (date: string) => {
    const newTransaction: Transaction = {
      id: `new_${Date.now()}`,
      entity: entities[0]?.id || 'oscaromargp',
      description: '',
      amount: 0,
      due_date: date,
      status: 'pending',
      type: 'expense',
      recurrence: 'none',
      tolerance_days: 2,
      payment_method: 'transfer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSelectedTransaction(newTransaction);
    setIsDrawerOpen(true);
  };

  const handleEventDrop = async (eventId: string, newDate: string) => {
    if (eventId.includes('-proj-')) return;
    const tx = transactions.find(t => t.id === eventId);
    if (!tx) return;
    
    const oldDate = tx.due_date;
    const toleranceDays = tx.tolerance_days ?? 2;
    const oldDateObj = new Date(oldDate);
    const newDateObj = new Date(newDate);
    const diffDays = Math.round((newDateObj.getTime() - oldDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      setShowDropConfirm({ eventId, oldDate, newDate, toleranceDays });
      return;
    }
    
    const updated = {
      ...tx,
      due_date: newDate,
      updated_at: new Date().toISOString()
    };
    await handleUpdateTransaction(updated);
  };

  const confirmDropMove = async () => {
    if (!showDropConfirm) return;
    const tx = transactions.find(t => t.id === showDropConfirm.eventId);
    if (!tx) return;
    
    const updated = {
      ...tx,
      due_date: showDropConfirm.newDate,
      updated_at: new Date().toISOString()
    };
    await handleUpdateTransaction(updated);
    setShowDropConfirm(null);
  };

  const cancelDropMove = () => {
    setShowDropConfirm(null);
  };

  const handleImport = async (imported: Partial<Transaction>[]) => {
    if (isDemo) {
      const newTransactions = imported.map((t, idx) => ({
        ...t,
        id: `imported_${Date.now()}_${idx}_${Math.random()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Transaction));
      updateDemoTransactions([...newTransactions, ...demoTransactions]);
      return;
    }
    if (!user) return;
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

  const handlePrint = (dateRange: { start: string | null; end: string | null }, entity: any, category: string, status: any, type: string) => {
    setPrintFilters({ dateRange, entity, category, status, type });
    setShowPDFReport(true);
    setTimeout(() => {
      window.print();
      setShowPDFReport(false);
    }, 300);
  };

  const handleAddCategory = async (category: string) => {
    if (isDemo) {
      if (!demoCategories.includes(category)) {
        updateDemoCategories([...demoCategories, category]);
      }
      return;
    }
    if (!user) return;
    await createCategory.mutateAsync({
      user_id: user.id,
      name: category,
      icon: '📁',
      color: 'emerald',
      type: 'expense',
    });
  };

  const handleDeleteCategory = async (category: string) => {
    if (isDemo) {
      updateDemoCategories(demoCategories.filter(c => c !== category));
      return;
    }
    if (!user) return;
    const cat = dbCategories.find(c => c.name === category);
    if (cat) {
      await deleteCategory.mutateAsync({ id: cat.id, userId: user.id });
    }
  };

  const handleAddEntity = async (entity: Omit<EntityConfig, 'id'>) => {
    if (isDemo) {
      const newEnt: EntityConfig = {
        ...entity,
        id: `entity_${Date.now()}`,
      };
      updateDemoEntities([...demoEntities, newEnt]);
      return;
    }
    if (!user) return;
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
    if (isDemo) {
      updateDemoEntities(demoEntities.map(e => e.id === entity.id ? entity : e));
      return;
    }
    if (!user) return;
    await updateEntity.mutateAsync({
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      color: entity.color,
      is_active: entity.is_active,
    });
  };

  const handleDeleteEntity = async (id: string) => {
    if (isDemo) {
      updateDemoEntities(demoEntities.filter(e => e.id !== id));
      return;
    }
    if (!user) return;
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

  if (authLoading || (!isDemo && loadingTransactions) || (!user && !isDemo)) {
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
    { id: 'contacts', label: 'Contactos', icon: Users },
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
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors relative">
                <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {alertCount}
                  </span>
                )}
              </button>
              {activeView !== 'settings' && (
                <button 
                  onClick={handleCreateNewTransaction}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Transacción
                </button>
              )}
            </div>
          </header>

          {showNotifications && (
            <NotificationsPanel alerts={smartAlerts} onClose={() => setShowNotifications(false)} />
          )}

          <div className="p-8">
            {activeView === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Pulso Semanal + Saldos por Cuenta */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WeeklyPulse
                    transactions={transactions}
                    selectedEntity={selectedEntity}
                    entities={entities}
                  />
                  <AccountBalances
                    transactions={transactions}
                    entities={entities}
                    onEntitySelect={(id) => setSelectedEntity(selectedEntity === id ? undefined : id)}
                  />
                </div>

                {/* Métricas de Liquidez */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Métricas de Liquidez</h3>
                  <MetricsCards metrics={metrics} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Calendario</h3>
                    <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onDateDoubleClick={handleDateDoubleClick} onEventDrop={handleEventDrop} />
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
                <CalendarComponent events={calendarEvents} onEventClick={handleEventClick} onDateDoubleClick={handleDateDoubleClick} onEventDrop={handleEventDrop} />
              </motion.div>
            )}

            {activeView === 'ledger' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Ledger transactions={transactions} onRowClick={handleTransactionClick} onPrint={handlePrint} attachmentCounts={attachmentCounts} categories={categories} entities={entities} />
              </motion.div>
            )}

            {activeView === 'contacts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Contacts
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onUpdateContact={handleUpdateContact}
                  onDeleteContact={handleDeleteContact}
                  onCreateTransactionForContact={handleCreateTransactionForContact}
                />
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
        onDelete={handleDeleteTransaction}
        allTransactions={transactions}
        entities={entities}
        contacts={contacts}
        categories={categories}
      />

      <PDFReport
        transactions={transactions}
        dateRange={printFilters.dateRange}
        entityFilter={printFilters.entity}
        categoryFilter={printFilters.category}
        statusFilter={printFilters.status as any}
        typeFilter={printFilters.type as any}
        isVisible={showPDFReport}
      />

      {/* Modal de confirmación para reprogramar pagos */}
      <AnimatePresence>
        {showDropConfirm && (() => {
          const tx = transactions.find(t => t.id === showDropConfirm.eventId);
          if (!tx) return null;
          const oldDateObj = new Date(showDropConfirm.oldDate);
          const newDateObj = new Date(showDropConfirm.newDate);
          const diffDays = Math.round((newDateObj.getTime() - oldDateObj.getTime()) / (1000 * 60 * 60 * 24));
          const graceDays = showDropConfirm.toleranceDays;
          const exceedsGrace = diffDays > graceDays;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={cancelDropMove}
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
                      <span className="text-amber-400 font-medium">{formatDate(showDropConfirm.oldDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-slate-500">Nueva fecha:</span>
                      <span className="text-emerald-400 font-medium">{formatDate(showDropConfirm.newDate)}</span>
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
                          ? `Estás moviendo ${diffDays} días, pero solo tienes ${graceDays} día${graceDays !== 1 ? 's' : ''} de prórroga. ¿Realmente quieres pagar hasta el ${formatDate(showDropConfirm.newDate)}?`
                          : `Tienes ${graceDays} día${graceDays !== 1 ? 's' : ''} de prórroga. Este movimiento está dentro del período de gracia.`
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={confirmDropMove}
                    className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:check-circle" className="w-6 h-6 text-emerald-400" />
                      <p className="text-emerald-400 font-medium text-sm">Sí, reprogramar</p>
                    </div>
                  </button>

                  <button
                    onClick={cancelDropMove}
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
