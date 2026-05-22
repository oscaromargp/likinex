'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import CalendarComponent from '@/components/Calendar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EntitySelector } from '@/components/dashboard/EntitySelector';
import { DropConfirmModal } from '@/components/dashboard/DropConfirmModal';
import Ledger from '@/components/Ledger';
import SideDrawer from '@/components/SideDrawer';
import PDFReport from '@/components/PDFReport';
import MetricsCards from '@/components/MetricsCards';
import SettingsComponent from '@/components/Settings';
import CreditCardManager from '@/components/CreditCardManager';
import RiskToleranceEngine from '@/components/RiskToleranceEngine';
import CashFlowForecast from '@/components/CashFlowForecast';
import NotificationsPanel from '@/components/NotificationsPanel';
import Contacts from '@/components/Contacts';
import WeeklyPulse from '@/components/WeeklyPulse';
import AccountBalances from '@/components/AccountBalances';
import { Transaction, CalendarEvent, EntityConfig, DEFAULT_ENTITIES, Contact } from '@/types';
import { calculateMetrics, generateCalendarEvents, userTransactions } from '@/lib/userData';
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
    source_entity: db.source_entity || db.entity,
    destination_entity: db.destination_entity || undefined,
    description: db.description,
    amount: db.amount,
    due_date: db.due_date,
    paid_date: db.paid_date || undefined,
    status: db.status as Transaction['status'],
    recurrence: db.recurrence as Transaction['recurrence'],
    recurrence_day: db.recurrence_day || undefined,
    recurrence_days: db.recurrence_days || undefined,
    recurrence_days_of_month: db.recurrence_days_of_month || undefined,
    recurrence_end_date: db.recurrence_end_date || undefined,
    recurrence_count: db.recurrence_count || undefined,
    payment_method: db.payment_method as Transaction['payment_method'],
    category: db.category as Transaction['category'],
    type: db.type as Transaction['type'],
    notes: db.notes || undefined,
    follow_up: db.follow_up || undefined,
    attachment_url: db.attachment_url || undefined,
    price_change: db.price_change || undefined,
    tolerance_days: db.tolerance_days ?? undefined,
    contact_id: db.contact_id || undefined,
    payment_destination: db.payment_destination || undefined,
    deadline_date: db.deadline_date || undefined,
    late_justification: db.late_justification || undefined,
    created_at: db.created_at,
    updated_at: db.updated_at,
  };
}

function mapTransactionToDB(tx: Transaction, userId: string): Omit<TransactionDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    template_id: tx.template_id || null,
    entity: tx.entity,
    source_entity: tx.source_entity || tx.entity || null,
    destination_entity: tx.destination_entity || null,
    description: tx.description,
    amount: tx.amount,
    currency: 'MXN',
    due_date: tx.due_date,
    paid_date: tx.paid_date || null,
    status: tx.status,
    recurrence: tx.recurrence,
    recurrence_day: tx.recurrence_day || null,
    recurrence_days: tx.recurrence_days || null,
    recurrence_days_of_month: tx.recurrence_days_of_month || null,
    recurrence_end_date: tx.recurrence_end_date || null,
    recurrence_count: tx.recurrence_count || null,
    payment_method: tx.payment_method || null,
    category: tx.category || null,
    type: tx.type || null,
    notes: tx.notes || null,
    follow_up: tx.follow_up || null,
    attachment_url: tx.attachment_url || null,
    price_change: tx.price_change || null,
    tolerance_days: tx.tolerance_days ?? null,
    contact_id: tx.contact_id || null,
    payment_destination: tx.payment_destination || null,
    deadline_date: tx.deadline_date || null,
    late_justification: tx.late_justification || null,
    operation_type: (tx as any).operation_type || null,
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
          const parsed = JSON.parse(savedTx);
          setDemoTransactions(Array.isArray(parsed) ? parsed : userTransactions);
        } catch {
          setDemoTransactions(userTransactions);
        }
      } else {
        setDemoTransactions(userTransactions);
      }

      const savedEnt = localStorage.getItem('likinex_demo_entities');
      if (savedEnt) {
        try {
          const parsed = JSON.parse(savedEnt);
          setDemoEntities(Array.isArray(parsed) ? parsed : DEFAULT_ENTITIES);
        } catch {
          setDemoEntities(DEFAULT_ENTITIES);
        }
      } else {
        setDemoEntities(DEFAULT_ENTITIES);
      }

      const savedCat = localStorage.getItem('likinex_demo_categories');
      if (savedCat) {
        try {
          const parsed = JSON.parse(savedCat);
          setDemoCategories(Array.isArray(parsed) ? parsed : []);
        } catch {
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
    const primaryAccount = contact.bank_accounts?.find(a => a.is_primary) || contact.bank_accounts?.[0];
    const newTx: Transaction = {
      id: `new_${Date.now()}`,
      description: `Pago a ${contact.name}`,
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      entity: 'oscaromargp',
      status: 'pending',
      type: 'expense',
      recurrence: 'none',
      category: 'otro',
      payment_method: contact.payment_method_preferred || 'transfer',
      contact_id: contact.id,
      payment_destination: contact.bank_clabe || contact.bank_account || primaryAccount?.clabe || primaryAccount?.account_number || '',
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

  const filteredTransactions: Transaction[] = useMemo(() => {
    if (!selectedEntity) return transactions;
    return transactions.filter(t =>
      (t.source_entity && t.source_entity === selectedEntity) ||
      (t.destination_entity && t.destination_entity === selectedEntity)
    );
  }, [transactions, selectedEntity]);

  const entitySectionTransactions = selectedEntity ? filteredTransactions : transactions;

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

  const metrics = calculateMetrics(entitySectionTransactions);
  const calendarEvents = generateCalendarEvents(entitySectionTransactions);
  const smartAlerts = getSmartAlerts(entitySectionTransactions);
  const alertCount = smartAlerts.length;

  const attachmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entitySectionTransactions.forEach(t => {
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

    try {
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
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      const msg = err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Error desconocido');
      if (msg.toLowerCase().includes('column') || msg.includes('does not exist') || msg.includes('ambiguous')) {
        alert('Error: La base de datos necesita actualización. Ve a https://likinex.vercel.app/api/migrate?secret=likinex-migrate-2026');
      } else {
        alert('Error al guardar: ' + msg);
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
    if (event.id.includes('-proj-')) return;
    const transaction = transactions.find(t => t.id === event.id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsDrawerOpen(true);
    }
  };

  const handleCreateNewTransaction = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultEntity = entities[0]?.id || 'oscaromargp';
    const newTransaction: Transaction = {
      id: `new_${Date.now()}`,
      entity: defaultEntity,
      source_entity: defaultEntity,
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
    const defaultEntity = entities[0]?.id || 'oscaromargp';
    const newTransaction: Transaction = {
      id: `new_${Date.now()}`,
      entity: defaultEntity,
      source_entity: defaultEntity,
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
      setTimeout(() => setShowPDFReport(false), 500);
    }, 800);
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

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="flex">
        <DashboardSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          user={user}
          isDemo={isDemo}
          onLogout={handleLogout}
        />

        <main className="flex-1 ml-64">
          <DashboardHeader
            activeView={activeView}
            entitySelector={<EntitySelector entities={entities} selectedEntity={selectedEntity} onSelect={setSelectedEntity} />}
            alertCount={alertCount}
            onToggleNotifications={() => setShowNotifications(!showNotifications)}
            onNewTransaction={handleCreateNewTransaction}
          />

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
                    transactions={entitySectionTransactions}
                    selectedEntity={selectedEntity}
                    entities={entities}
                  />
                  <AccountBalances
                    transactions={entitySectionTransactions}
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
                        {entitySectionTransactions.slice(0, 5).map((t, idx) => (
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
                        transactions={entitySectionTransactions}
                        liquidity={metrics}
                        daysAhead={30}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                        <CreditCardManager />
                      </div>
                      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
                        <RiskToleranceEngine transactions={entitySectionTransactions} />
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
                <Ledger transactions={entitySectionTransactions} onRowClick={handleTransactionClick} onPrint={handlePrint} attachmentCounts={attachmentCounts} categories={categories} entities={entities} />
              </motion.div>
            )}

            {activeView === 'contacts' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Contacts
                  contacts={contacts}
                  transactions={transactions}
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

      <DropConfirmModal
        show={showDropConfirm !== null}
        dropInfo={showDropConfirm}
        transactions={transactions}
        formatDate={formatDate}
        onConfirm={confirmDropMove}
        onCancel={cancelDropMove}
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
