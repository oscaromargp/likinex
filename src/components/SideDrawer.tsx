'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, FileText, Clock, CreditCard, Paperclip, Save, Upload, Trash2, Eye, Download, Image as ImageIcon, Edit3, Plus, History, Landmark, Check, Copy, User, Search, ChevronDown, Printer } from 'lucide-react';
import { Transaction, TransactionStatus, PaymentMethod, RecurrenceType, Contact, ENTITY_LABELS, STATUS_LABELS, Currency, CURRENCY_SYMBOLS, convertCurrency, calculatePunctuality, calculateConsecutiveOnTime, getScoreLabel, Attachment, EntityConfig, DEFAULT_ENTITIES, getEntityIcon, getEntityLabel, CATEGORY_LABELS, Category, BANKS_CATALOG, Bank, PAYMENT_ICONS, STATUS_ICONS, TYPE_ICONS, RECURRENCE_ICONS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import RecurrenceModal from './RecurrenceModal';
import ReceiptReport from './ReceiptReport';

const CURRENCIES: Currency[] = ['MXN', 'USD', 'BTC', 'ETH', 'USDT'];
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'transfer', label: 'Transferencia', icon: '🏦' },
  { value: 'cash', label: 'Efectivo', icon: '💵' },
  { value: 'card', label: 'Tarjeta', icon: '💳' },
  { value: 'check', label: 'Cheque', icon: '📝' },
  { value: 'other', label: 'Otro', icon: '📦' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; icon: string }[] = [
  { value: 'none', label: 'Sin recurrencia', icon: '➡️' },
  { value: 'weekly', label: 'Semanal', icon: '🔄' },
  { value: 'monthly', label: 'Mensual', icon: '📅' },
  { value: 'semi_monthly', label: 'Quincenal (1 y 15)', icon: '⚡' },
  { value: 'bimonthly', label: 'Bimestral', icon: '🗓️' },
  { value: 'quarterly', label: 'Trimestral', icon: '📆' },
  { value: 'yearly', label: 'Anual', icon: '🎆' },
  { value: 'triennial', label: 'Trienal', icon: '📅' }
];

const OPERATION_TYPE_LABELS: Record<string, string> = {
  service_fixed: '📋 Servicio Fijo',
  service_variable: '🔧 Servicio Variable',
  provider: '🏢 Proveedor',
  credit_card: '💳 Tarjeta de Crédito',
  payroll: '👥 Nómina',
  transfer: '🔄 Traspaso',
  other: '📦 Otro',
};

function getNextPaymentDate(dueDate: string, recurrence: string, recurrenceDays?: number[]): string {
  const base = new Date(dueDate + 'T12:00:00');
  const now = new Date();
  const day = recurrenceDays?.[0] || base.getDate();

  if (recurrence === 'monthly') {
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, day);
    }
    return next.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (recurrence === 'bimonthly') {
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 2, day);
    }
    return next.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (recurrence === 'quarterly') {
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next <= now) {
      next = new Date(now.getFullYear(), now.getMonth() + 3, day);
    }
    return next.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return base.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

interface SideDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Transaction | Transaction[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  allTransactions?: Transaction[];
  entities?: EntityConfig[];
  contacts?: Contact[];
  categories?: string[];
}

interface AttachmentWithPreview extends Attachment {
  previewUrl?: string;
  base64?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  recipient: string;
  date: string;
  notes: string;
}

export default function SideDrawer({
  transaction,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  allTransactions = [],
  entities = [],
  contacts = [],
  categories = []
}: SideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'execution'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCategory, setNewCategory] = useState<string | undefined>(undefined);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: 0,
    due_date: '',
    entity: '',
    category: '',
    notes: '',
    payment_method: '',
    price_change: 0,
    currency: 'MXN' as Currency,
    displayCurrency: 'MXN' as Currency,
    isMsi: false,
    msiMonths: 12,
    contact_id: '',
    payment_destination: '',
    recurrence: 'none' as RecurrenceType,
    recurrence_days: [1, 15] as number[],
    type: 'expense' as 'income' | 'expense',
    operation_type: 'other' as string,
    tolerance_days: 2 as number,
    bank_id: '' as string,
    deadline_date: '',
    late_justification: ''
  });
  
  const [attachments, setAttachments] = useState<AttachmentWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentWithPreview | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  
  const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({
    amount: 0,
    method: 'transfer',
    recipient: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState<{ newDate: string; originalDate: string } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transaction) {
      setEditForm({
        description: transaction.description || '',
        amount: transaction.amount || 0,
        due_date: transaction.due_date || '',
        entity: transaction.entity || '',
        category: transaction.category || '',
        notes: transaction.notes || '',
        payment_method: transaction.payment_method || '',
        price_change: transaction.price_change || 0,
        currency: 'MXN',
        displayCurrency: 'MXN',
        isMsi: false,
        msiMonths: 12,
        contact_id: transaction.contact_id || '',
        payment_destination: transaction.payment_destination || '',
        recurrence: transaction.recurrence || 'none',
        recurrence_days: (transaction as any).recurrence_days || [1, 15],
        type: transaction.type || 'expense',
        operation_type: (transaction as any).operation_type || 'other',
        tolerance_days: transaction.tolerance_days ?? 2,
        bank_id: (transaction as any).bank_id || '',
        deadline_date: transaction.deadline_date || '',
        late_justification: transaction.late_justification || ''
      });
      setIsEditing(transaction.id.startsWith('new_'));
      setShowDeleteConfirm(false);
      loadPaymentRecords();
    }
  }, [transaction?.id]);

  const loadPaymentRecords = () => {
    if (transaction) {
      const saved = localStorage.getItem(`likinex_payments_${transaction.id}`);
      if (saved) {
        setPaymentRecords(JSON.parse(saved));
      } else {
        setPaymentRecords([]);
      }
    }
  };

  const savePaymentRecords = (records: PaymentRecord[]) => {
    setPaymentRecords(records);
    if (transaction) {
      localStorage.setItem(`likinex_payments_${transaction.id}`, JSON.stringify(records));
    }
  };

  const addPaymentRecord = () => {
    if (!transaction) return;
    if (!newPayment.amount || !newPayment.recipient) return;
    const record: PaymentRecord = {
      id: `pay_${Date.now()}`,
      amount: newPayment.amount || 0,
      method: (newPayment.method as PaymentMethod) || 'transfer',
      recipient: newPayment.recipient || '',
      date: newPayment.date || new Date().toISOString().split('T')[0],
      notes: newPayment.notes || ''
    };
    const updated = [...paymentRecords, record];
    savePaymentRecords(updated);

    // Auto-settle & Partial status logic
    const totalPaid = updated.reduce((sum, r) => sum + r.amount, 0);
    const isSettled = transaction.amount > 0 ? (totalPaid >= transaction.amount) : (totalPaid > 0);
    const calculatedStatus: TransactionStatus = isSettled ? 'settled' : (totalPaid > 0 ? 'partial' : 'pending');

    if (onUpdate) {
      onUpdate({
        ...transaction,
        status: calculatedStatus,
        paid_date: isSettled ? record.date : undefined
      });
    }

    setNewPayment({
      amount: Math.max(0, transaction.amount - totalPaid),
      method: 'transfer',
      recipient: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const deletePaymentRecord = (id: string) => {
    if (!transaction) return;
    const updated = paymentRecords.filter(r => r.id !== id);
    savePaymentRecords(updated);

    // Auto-settle & Partial status logic
    const totalPaid = updated.reduce((sum, r) => sum + r.amount, 0);
    const isSettled = transaction.amount > 0 ? (totalPaid >= transaction.amount) : (totalPaid > 0);
    const calculatedStatus: TransactionStatus = isSettled ? 'settled' : (totalPaid > 0 ? 'partial' : 'pending');

    if (onUpdate) {
      onUpdate({
        ...transaction,
        status: calculatedStatus,
        paid_date: isSettled 
          ? (updated[updated.length - 1]?.date || new Date().toISOString().split('T')[0]) 
          : undefined
      });
    }
  };

  const convertAndDisplay = (amount: number, from: Currency, to: Currency) => {
    if (from === to) return amount;
    return convertCurrency(amount, from, to);
  };

  const loadAttachments = useCallback(() => {
    if (!transaction?.attachment_url) {
      setAttachments([]);
      return;
    }
    const savedAttachments = localStorage.getItem(`likinex_attachments_${transaction.id}`);
    if (savedAttachments) {
      setAttachments(JSON.parse(savedAttachments));
    } else {
      const urls = transaction.attachment_url.split(',').filter(Boolean);
      const defaultAttachments: AttachmentWithPreview[] = urls.map((url, i) => ({
        id: `default_${i}`,
        transaction_id: transaction.id,
        file_name: url.includes('base64') ? 'archivo_adjunto' : url.split('/').pop() || 'archivo',
        file_path: url,
        file_type: url.includes('base64') ? 'image/png' : 'application/pdf',
        file_size: 0,
        created_at: new Date().toISOString(),
        base64: url.includes('base64') ? url : undefined
      }));
      setAttachments(defaultAttachments);
    }
  }, [transaction?.id, transaction?.attachment_url]);

  useEffect(() => {
    if (activeTab === 'execution') {
      loadAttachments();
    }
  }, [activeTab, loadAttachments]);

  if (!transaction) return null;

  const punctuality = calculatePunctuality(transaction.due_date, transaction.paid_date);
  const consecutiveOnTime = transaction.template_id
    ? calculateConsecutiveOnTime(allTransactions, transaction.template_id)
    : 0;

const handleSave = () => {
    if (!editForm.description || editForm.description.trim() === '') {
      alert('La descripción es obligatoria');
      return;
    }
    if (editForm.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }
    if (!editForm.entity) {
      alert('Selecciona una entidad');
      return;
    }

    const totalPaid = paymentRecords.reduce((sum, r) => sum + r.amount, 0);
    const absAmount = Math.abs(editForm.amount);
    const isIncome = editForm.type === 'income';
    
    let calculatedStatus: TransactionStatus = 'pending';
    
    if (isIncome) {
      calculatedStatus = totalPaid > 0 ? 'settled' : 'pending';
    } else {
      if (absAmount > 0) {
        calculatedStatus = totalPaid >= absAmount ? 'settled' : (totalPaid > 0 ? 'partial' : 'pending');
      } else {
        calculatedStatus = 'pending';
      }
    }
    
    const attachmentUrls = attachments.map(a => a.base64 || a.file_path).join(',');
    const originalDate = transaction.due_date;
    const hasDateChanged = editForm.due_date !== originalDate;
    const isRecurring = transaction.template_id || (transaction.recurrence && transaction.recurrence !== 'none');

    if (onUpdate) {
      if (editForm.isMsi && transaction.id.startsWith('new_')) {
        const msiCount = editForm.msiMonths;
        const installmentAmount = Math.round((absAmount / msiCount) * 100) / 100;
        const installments: Transaction[] = [];
        
        for (let i = 0; i < msiCount; i++) {
          const installmentDate = new Date(editForm.due_date);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          const dateStr = installmentDate.toISOString().split('T')[0];
          
          installments.push({
            ...transaction,
            id: `new_${Date.now()}_msi_${i}`,
            description: `${editForm.description} [MSI ${i + 1}/${msiCount}]`,
            amount: installmentAmount,
            due_date: dateStr,
            entity: editForm.entity || transaction.entity,
            category: (editForm.category as Category) || undefined,
            notes: editForm.notes || undefined,
            payment_method: (editForm.payment_method as PaymentMethod) || 'card',
            price_change: editForm.price_change || undefined,
            attachment_url: attachmentUrls || undefined,
            status: 'pending',
            contact_id: editForm.contact_id || undefined,
            payment_destination: editForm.payment_destination || undefined,
            recurrence: 'none',
            type: editForm.type,
            deadline_date: editForm.deadline_date || undefined,
            late_justification: editForm.late_justification || undefined
          });
        }
        onUpdate(installments);
      } else if (hasDateChanged && isRecurring && !transaction.id.startsWith('new_')) {
        performUpdate(editForm.due_date, 'single', attachmentUrls, calculatedStatus, isIncome);
      } else {
        performUpdate(editForm.due_date, 'single', attachmentUrls, calculatedStatus, isIncome);
      }
    }
    setIsEditing(false);
  };

  const countFutureOccurrences = (
    tx: Transaction, 
    allTxs: Transaction[], 
    newDate: string
  ): number => {
    if (!tx.template_id) return 0;
    
    return allTxs.filter(t => 
      t.template_id === tx.template_id && 
      t.id !== tx.id &&
      new Date(t.due_date) > new Date(tx.due_date)
    ).length;
  };

  const findFutureOccurrences = (
    tx: Transaction, 
    allTxs: Transaction[]
  ): Transaction[] => {
    if (!tx.template_id) return [];
    return allTxs.filter(t => 
      t.template_id === tx.template_id && 
      t.id !== tx.id &&
      new Date(t.due_date) > new Date(tx.due_date)
    ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  const calculateNewDates = (
    tx: Transaction, 
    originalDate: string, 
    newDate: string
  ): string => {
    const orig = new Date(originalDate);
    const target = new Date(newDate);
    const diffTime = target.getTime() - orig.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const newDueDate = new Date(tx.due_date);
    newDueDate.setDate(newDueDate.getDate() + diffDays);
    return newDueDate.toISOString().split('T')[0];
  };

  const performUpdate = (
    dueDate: string,
    mode: 'single' | 'all',
    attachmentUrls: string,
    calculatedStatus: TransactionStatus,
    isIncome: boolean
  ) => {
    if (!onUpdate) return;

    if (mode === 'all' && transaction.template_id) {
      const futureTxs = findFutureOccurrences(transaction, allTransactions);
      const updatedTxs = futureTxs.map(t => ({
        ...t,
        due_date: calculateNewDates(t, transaction.due_date, dueDate),
        attachment_url: attachmentUrls || t.attachment_url,
        updated_at: new Date().toISOString()
      }));
      
      const mainTx = {
        ...transaction,
        description: editForm.description,
        amount: editForm.amount,
        due_date: dueDate,
        entity: editForm.entity || transaction.entity,
        category: (editForm.category as Category) || undefined,
        notes: editForm.notes || undefined,
        payment_method: (editForm.payment_method as PaymentMethod) || undefined,
        price_change: editForm.price_change || undefined,
        attachment_url: attachmentUrls || undefined,
        status: calculatedStatus,
        contact_id: editForm.contact_id || undefined,
        payment_destination: editForm.payment_destination || undefined,
        recurrence: editForm.recurrence || 'none',
        type: editForm.type,
        deadline_date: editForm.deadline_date || undefined,
        late_justification: editForm.late_justification || undefined,
        paid_date: calculatedStatus === 'settled' 
          ? (isIncome ? dueDate : paymentRecords[paymentRecords.length - 1]?.date || new Date().toISOString().split('T')[0]) 
          : undefined
      };
      onUpdate([mainTx, ...updatedTxs]);
    } else {
      onUpdate({
        ...transaction,
        description: editForm.description,
        amount: editForm.amount,
        due_date: dueDate,
        entity: editForm.entity || transaction.entity,
        category: (editForm.category as Category) || undefined,
        notes: editForm.notes || undefined,
        payment_method: (editForm.payment_method as PaymentMethod) || undefined,
        price_change: editForm.price_change || undefined,
        attachment_url: attachmentUrls || undefined,
        status: calculatedStatus,
        contact_id: editForm.contact_id || undefined,
        payment_destination: editForm.payment_destination || undefined,
        recurrence: editForm.recurrence || 'none',
        type: editForm.type,
        deadline_date: editForm.deadline_date || undefined,
        late_justification: editForm.late_justification || undefined,
        paid_date: calculatedStatus === 'settled' 
          ? (isIncome ? dueDate : paymentRecords[paymentRecords.length - 1]?.date || new Date().toISOString().split('T')[0]) 
          : undefined
      });
    }
  };

  const handleRecurrenceUpdateThis = () => {
    if (!pendingDateChange) return;
    const totalPaid = paymentRecords.reduce((sum, r) => sum + r.amount, 0);
    const absAmount = Math.abs(editForm.amount);
    const isIncome = editForm.type === 'income';
    
    let calculatedStatus: TransactionStatus = 'pending';
    if (isIncome) {
      calculatedStatus = 'settled';
    } else if (absAmount > 0) {
      calculatedStatus = totalPaid >= absAmount ? 'settled' : (totalPaid > 0 ? 'partial' : 'pending');
    } else {
      calculatedStatus = 'settled';
    }
    
    const attachmentUrls = attachments.map(a => a.base64 || a.file_path).join(',');
    performUpdate(pendingDateChange.newDate, 'single', attachmentUrls, calculatedStatus, isIncome);
    setShowRecurrenceModal(false);
    setPendingDateChange(null);
    setIsEditing(false);
  };

  const handleRecurrenceUpdateAll = () => {
    if (!pendingDateChange) return;
    const totalPaid = paymentRecords.reduce((sum, r) => sum + r.amount, 0);
    const absAmount = Math.abs(editForm.amount);
    const isIncome = editForm.type === 'income';
    
    let calculatedStatus: TransactionStatus = 'pending';
    if (isIncome) {
      calculatedStatus = 'settled';
    } else if (absAmount > 0) {
      calculatedStatus = totalPaid >= absAmount ? 'settled' : (totalPaid > 0 ? 'partial' : 'pending');
    } else {
      calculatedStatus = 'settled';
    }
    
    const attachmentUrls = attachments.map(a => a.base64 || a.file_path).join(',');
    performUpdate(pendingDateChange.newDate, 'all', attachmentUrls, calculatedStatus, isIncome);
    setShowRecurrenceModal(false);
    setPendingDateChange(null);
    setIsEditing(false);
  };

  const handleRecurrenceCancel = () => {
    if (pendingDateChange) {
      setEditForm(f => ({ ...f, due_date: pendingDateChange.originalDate }));
    }
    setShowRecurrenceModal(false);
    setPendingDateChange(null);
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newAttachment: AttachmentWithPreview = {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transaction_id: transaction.id,
        file_name: file.name,
        file_path: base64,
        file_type: file.type,
        file_size: file.size,
        created_at: new Date().toISOString(),
        base64,
        previewUrl: file.type.startsWith('image/') ? base64 : undefined
      };
      const updated = [...attachments, newAttachment];
      saveAttachments(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    Array.from(files).forEach(processFile);
  };

  const saveAttachments = (newAttachments: AttachmentWithPreview[]) => {
    setAttachments(newAttachments);
    localStorage.setItem(`likinex_attachments_${transaction.id}`, JSON.stringify(newAttachments));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const deleteAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id);
    saveAttachments(updated);
    if (previewAttachment?.id === id) {
      setPreviewAttachment(null);
    }
  };

  const downloadAttachment = (attachment: AttachmentWithPreview) => {
    if (attachment.base64) {
      const link = document.createElement('a');
      link.href = attachment.base64;
      link.download = attachment.file_name;
      link.click();
    }
  };

  const tabs = [
    { id: 'details', label: 'Detalles del Pago', icon: FileText },
    { id: 'execution', label: 'Abonos y Recibos', icon: DollarSign, count: paymentRecords.length + attachments.length }
  ] as const;

  const totalPaid = paymentRecords.reduce((sum, r) => sum + r.amount, 0);
  const remainingAmount = Math.max(0, transaction.amount - totalPaid);

  const selectedContact = contacts.find(c => c.id === editForm.contact_id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-emerald-500/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">
                    {isEditing ? 'Editar Operación' : 'Gestión de Operación'}
                  </h2>
                  {!transaction.id.startsWith('new_') && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Editar transacción"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descripción de la operación"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                ) : (
                  <p className="text-sm text-slate-400">{transaction.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors ml-4"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Consolidated 2 Tabs */}
            <div className="flex border-b border-slate-800/50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    activeTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {'count' in tab && tab.count > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {/* Tipo de Operación */}
                  <div className="p-3.5 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                    <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Tipo de Operación</p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {[
                          { value: 'service_fixed', label: '📋 Servicio Fijo', desc: 'Internet, luz, agua' },
                          { value: 'service_variable', label: '🔧 Servicio Variable', desc: 'Plomería, electricista' },
                          { value: 'provider', label: '🏢 Proveedor', desc: 'Insumos, materiales' },
                          { value: 'credit_card', label: '💳 Tarjeta Crédito', desc: 'Pago de TDC' },
                          { value: 'payroll', label: '👥 Nómina', desc: 'Pagos a empleados' },
                          { value: 'transfer', label: '🔄 Traspaso', desc: 'Entre cuentas' },
                          { value: 'other', label: '📦 Otro', desc: 'Gastos varios' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditForm(f => ({ ...f, operation_type: opt.value }))}
                            className={cn(
                              "py-2 px-2 rounded-lg text-xs font-semibold border transition-all text-left",
                              editForm.operation_type === opt.value
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-800/50 text-slate-400 border-transparent hover:text-white hover:bg-slate-700/50"
                            )}
                          >
                            <span className="block">{opt.label}</span>
                            <span className="block text-[9px] opacity-70 font-normal">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white">
                        {OPERATION_TYPE_LABELS[(transaction as any).operation_type as keyof typeof OPERATION_TYPE_LABELS] || (transaction as any).operation_type || 'Sin clasificar'}
                      </p>
                    )}
                  </div>

                  {/* Tipo de Movimiento: Entrada / Salida */}
                  <div className="p-3.5 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                    <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Tipo de Movimiento</p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setEditForm(f => ({ ...f, type: 'expense' }))}
                          className={cn(
                            "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5",
                            editForm.type === 'expense'
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-slate-800/50 text-slate-400 border-transparent hover:text-white"
                          )}
                        >
                          💸 Salida (Egreso)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm(f => ({ ...f, type: 'income' }))}
                          className={cn(
                            "py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5",
                            editForm.type === 'income'
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800/50 text-slate-400 border-transparent hover:text-white"
                          )}
                        >
                          💰 Entrada (Ingreso)
                        </button>
                      </div>
                    ) : (
                      <p className={cn(
                        "text-sm font-semibold flex items-center gap-1.5",
                        transaction.type === 'income' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {transaction.type === 'income' ? "💰 Entrada (Ingreso/Cobro)" : "💸 Salida (Egreso/Pago)"}
                      </p>
                    )}
                  </div>

                  {/* Entity and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Entidad</p>
                      {isEditing ? (
                        <select
                          value={editForm.entity}
                          onChange={e => setEditForm(f => ({ ...f, entity: e.target.value }))}
                          className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                        >
                          {DEFAULT_ENTITIES.map(ent => (
                            <option key={ent.id} value={ent.id} className="bg-slate-900 text-white">
                              {ent.icon} {ent.name}
                            </option>
                          ))}
                          {entities.filter(e => !DEFAULT_ENTITIES.find(de => de.id === e.id)).map(ent => (
                            <option key={ent.id} value={ent.id} className="bg-slate-900 text-white">
                              {ent.icon} {ent.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-white text-sm font-medium">
                          {getEntityIcon(transaction.entity, entities)} {getEntityLabel(transaction.entity, entities)}
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Categoría</p>
                      {isEditing ? (
                        <div className="flex flex-col space-y-1">
                          <select
                            value={editForm.category || '__default__'}
                            onChange={e => {
                              if (e.target.value === '__new__') {
                                setNewCategory('');
                                setEditForm(f => ({ ...f, category: '' }));
                              } else if (e.target.value === '__default__') {
                                setEditForm(f => ({ ...f, category: '' }));
                              } else {
                                setEditForm(f => ({ ...f, category: e.target.value }));
                              }
                            }}
                            className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                          >
                            <option value="__default__" className="bg-slate-900 text-white">Seleccionar categoría...</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-slate-900 text-white">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</option>
                            ))}
                            {Object.entries(CATEGORY_LABELS)
                              .filter(([key]) => !categories.includes(key) && key !== 'otro')
                              .map(([key, label]) => (
                                <option key={key} value={key} className="bg-slate-900 text-white">{label}</option>
                              ))}
                            <option value="otro" className="bg-slate-900 text-white">Otro</option>
                            <option value="__new__" className="bg-slate-900 text-emerald-400">+ Añadir nueva</option>
                          </select>
                          {newCategory !== undefined && newCategory === '' && (
                            <div className="flex items-center space-x-2 mt-1">
                              <input
                                type="text"
                                placeholder="Nueva categoría"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  if (newCategory.trim()) {
                                    setEditForm(f => ({ ...f, category: newCategory.trim() }));
                                    setNewCategory(undefined);
                                  }
                                }}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-xs text-white rounded"
                              >
                                ✔
                              </button>
                              <button
                                onClick={() => setNewCategory(undefined)}
                                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-white rounded"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-white text-sm font-medium">
                          {CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] || transaction.category || 'Sin categoría'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dates & Recurrence */}
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                      <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Periodicidad / Recurrencia</p>
                      {isEditing ? (
                        <select
                          value={editForm.recurrence}
                          onChange={e => setEditForm(f => ({ ...f, recurrence: e.target.value as RecurrenceType }))}
                          className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                        >
                          {RECURRENCE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value} className="bg-slate-900 text-white">
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-white text-sm font-medium">
                          🔄 {RECURRENCE_OPTIONS.find(o => o.value === transaction.recurrence)?.label || 'Sin recurrencia'}
                        </p>
                      )}
                      {editForm.recurrence === 'semi_monthly' && isEditing && (
                        <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                          <p className="text-[10px] text-slate-500 mb-2">Dias de vencimiento:</p>
                          <div className="flex gap-2">
                            {[1, 15].map(day => (
                              <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.recurrence_days?.includes(day) ?? true}
                                  onChange={e => {
                                    const days = e.target.checked
                                      ? [...(editForm.recurrence_days || []), day].sort()
                                      : (editForm.recurrence_days || []).filter(d => d !== day);
                                    setEditForm(f => ({ ...f, recurrence_days: days }));
                                  }}
                                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-xs text-white">{day === 1 ? 'Dia 1' : 'Dia 15'}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {editForm.recurrence !== 'none' ? (
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-[10px] text-indigo-400 mb-1 font-semibold uppercase tracking-wider">Fechas Automaticas</p>
                        <p className="text-xs text-indigo-300">
                          Las fechas se calculan automaticamente segun la recurrencia seleccionada.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Proxima fecha: <span className="text-white font-medium">{formatDate(editForm.due_date)}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                          <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Fecha de Pago</p>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.due_date}
                              onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value, deadline_date: f.deadline_date || e.target.value }))}
                              className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                            />
                          ) : (
                            <p className="text-white text-sm font-medium">{formatDate(transaction.due_date)}</p>
                          )}
                        </div>
                        <div className="p-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                          <p className="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Fecha Limite</p>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.deadline_date || editForm.due_date}
                              onChange={e => setEditForm(f => ({ ...f, deadline_date: e.target.value }))}
                              className="w-full bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                            />
                          ) : (
                            <p className="text-white text-sm font-medium">{transaction.deadline_date ? formatDate(transaction.deadline_date) : formatDate(transaction.due_date)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tolerance Days */}
                    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                      <label className="text-[10px] text-slate-500 block mb-1">Dias de tolerancia</label>
                      {isEditing ? (
                        <select
                          value={editForm.tolerance_days ?? 2}
                          onChange={e => setEditForm(f => ({ ...f, tolerance_days: parseInt(e.target.value) }))}
                          className="w-full bg-slate-800 p-2 rounded-lg text-sm text-white focus:outline-none"
                        >
                          {[0, 1, 2, 3, 5, 7, 10].map(d => (
                            <option key={d} value={d}>{d === 0 ? 'Sin tolerancia' : `${d} dia${d > 1 ? 's' : ''}`}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-slate-400">
                          {editForm.tolerance_days ?? 2} dia{editForm.tolerance_days !== 1 ? 's' : ''} de gracia
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact / Beneficiary Selection - Simplified */}
                  <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Beneficiario / Destino</p>

                    {isEditing ? (
                      <div className="space-y-3">
                        <select
                          value={editForm.contact_id}
                          onChange={e => {
                            const cid = e.target.value;
                            const contact = contacts.find(c => c.id === cid);
                            const firstAccount = contact?.bank_accounts?.[0];
                            setEditForm(f => ({
                              ...f,
                              contact_id: cid,
                              payment_method: contact?.payment_method_preferred || f.payment_method,
                              payment_destination: firstAccount 
                                ? `${firstAccount.bank_name} - ${firstAccount.clabe || firstAccount.account_number || ''}`
                                : contact 
                                  ? `${contact.bank_name || ''} - CLABE: ${contact.bank_clabe || contact.bank_account || ''}`.trim()
                                  : f.payment_destination,
                              bank_id: firstAccount?.id || ''
                            }));
                          }}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        >
                          <option value="">Sin contacto (manual)</option>
                          {contacts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>

                        {selectedContact && selectedContact.bank_accounts && selectedContact.bank_accounts.length > 1 && (
                          <select
                            value={editForm.bank_id}
                            onChange={e => {
                              const account = selectedContact.bank_accounts?.find(a => a.id === e.target.value);
                              setEditForm(f => ({
                                ...f,
                                bank_id: e.target.value,
                                payment_destination: account 
                                  ? `${account.bank_name} - ${account.clabe || account.account_number || ''}`
                                  : f.payment_destination
                              }));
                            }}
                            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            {selectedContact.bank_accounts.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.bank_name} - {a.clabe || a.account_number || ''}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        <input
                          type="text"
                          placeholder="CLABE, cuenta o tarjeta destino"
                          value={editForm.payment_destination}
                          onChange={e => setEditForm(f => ({ ...f, payment_destination: e.target.value }))}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-xs">Beneficiario</span>
                          <span className="text-white font-semibold text-xs">
                            {selectedContact ? selectedContact.name : 'Manual'}
                          </span>
                        </div>
                        {transaction.payment_destination && (
                          <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-xs">Destino</span>
                            <span className="text-white font-mono text-xs text-right max-w-[180px] break-words">
                              {transaction.payment_destination}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount and Display Currency */}
                  <div className="p-4 bg-slate-800/50 border border-slate-800/60 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Monto</p>
                      <select
                        value={editForm.displayCurrency}
                        onChange={e => setEditForm(f => ({ ...f, displayCurrency: e.target.value as Currency }))}
                        className="bg-slate-750 text-xs text-white px-2 py-1 rounded-lg border border-slate-700 cursor-pointer focus:outline-none"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                        ))}
                      </select>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-400">{CURRENCY_SYMBOLS[editForm.currency || 'MXN']}</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount}
                          onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-lg font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-baseline">
                          <p className="text-2xl font-black text-emerald-400">
                            {CURRENCY_SYMBOLS[editForm.displayCurrency]}{convertAndDisplay(transaction.amount, 'MXN', editForm.displayCurrency).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <span className={cn(
                            'text-xs font-semibold px-2 py-1 rounded-full border',
                            transaction.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            transaction.status === 'partial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          )}>
                            {STATUS_LABELS[transaction.status]}
                          </span>
                        </div>
                        {editForm.displayCurrency !== 'MXN' && (
                          <p className="text-xs text-slate-500 mt-1">≈ {formatCurrency(transaction.amount)} MXN</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Dynamic Fields Based on Operation Type */}
                  {isEditing && editForm.operation_type === 'service_fixed' && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-3">
                      <p className="text-[10px] text-indigo-400 uppercase font-semibold tracking-wider">⚙️ Configuración de Servicio Fijo</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Recurrencia</label>
                          <select
                            value={editForm.recurrence}
                            onChange={e => setEditForm(f => ({ ...f, recurrence: e.target.value as RecurrenceType }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="monthly">Mensual</option>
                            <option value="bimonthly">Bimestral</option>
                            <option value="quarterly">Trimestral</option>
                            <option value="yearly">Anual</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Día de pago</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={editForm.recurrence_days?.[0] || new Date(editForm.due_date).getDate()}
                            onChange={e => setEditForm(f => ({ ...f, recurrence_days: [Number(e.target.value)] }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            placeholder="Ej: 7"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-indigo-300/70">
                        📅 Próximo pago: {getNextPaymentDate(editForm.due_date, editForm.recurrence, editForm.recurrence_days)}
                      </p>
                    </div>
                  )}

                  {isEditing && editForm.operation_type === 'provider' && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                      <p className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider">🏢 Condiciones del Proveedor</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Días de crédito</label>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={editForm.tolerance_days}
                            onChange={e => setEditForm(f => ({ ...f, tolerance_days: Number(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            placeholder="Ej: 15"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Fecha límite de pago</label>
                          <input
                            type="date"
                            value={editForm.deadline_date || ''}
                            onChange={e => setEditForm(f => ({ ...f, deadline_date: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-amber-300/70">
                        💡 Puedes negociar plazos con proveedores. Define días de crédito y fecha límite.
                      </p>
                    </div>
                  )}

                  {isEditing && editForm.operation_type === 'credit_card' && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-3">
                      <p className="text-[10px] text-rose-400 uppercase font-semibold tracking-wider">💳 Configuración de Tarjeta de Crédito</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Día de corte</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Ej: 15"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Día de pago</label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            value={new Date(editForm.due_date).getDate()}
                            onChange={e => {
                              const d = new Date(editForm.due_date);
                              d.setDate(Number(e.target.value));
                              setEditForm(f => ({ ...f, due_date: d.toISOString().split('T')[0] }));
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="p-2 bg-rose-500/20 rounded-lg">
                        <p className="text-xs text-rose-300">
                          ⚠️ No uses la tarjeta después del día de corte. El pago debe hacerse antes del día de pago para evitar intereses.
                        </p>
                      </div>
                    </div>
                  )}

                  {isEditing && editForm.operation_type === 'payroll' && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                      <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">👥 Configuración de Nómina</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Frecuencia de pago</label>
                          <select
                            value={editForm.recurrence}
                            onChange={e => setEditForm(f => ({ ...f, recurrence: e.target.value as RecurrenceType }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="weekly">Semanal</option>
                            <option value="bimonthly">Quincenal</option>
                            <option value="monthly">Mensual</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Días de tolerancia</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editForm.tolerance_days}
                            onChange={e => setEditForm(f => ({ ...f, tolerance_days: Number(e.target.value) }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-blue-300/70">
                        💡 La nómina puede tener flexibilidad de 2-3 días. Define la tolerancia aquí.
                      </p>
                    </div>
                  )}

                  {isEditing && editForm.operation_type === 'transfer' && (
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-3">
                      <p className="text-[10px] text-cyan-400 uppercase font-semibold tracking-wider">🔄 Traspaso entre Cuentas</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cuenta origen</label>
                          <select
                            value={editForm.entity}
                            onChange={e => setEditForm(f => ({ ...f, entity: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            {DEFAULT_ENTITIES.map(ent => (
                              <option key={ent.id} value={ent.id}>{ent.icon} {ent.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Cuenta destino</label>
                          <select
                            value={editForm.payment_destination || ''}
                            onChange={e => setEditForm(f => ({ ...f, payment_destination: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="">Seleccionar...</option>
                            {DEFAULT_ENTITIES.filter(e => e.id !== editForm.entity).map(ent => (
                              <option key={ent.id} value={ent.id}>{ent.icon} {ent.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-cyan-300/70">
                        🔄 Los traspasos no afectan el balance total, solo mueven saldo entre cuentas.
                      </p>
                    </div>
                  )}

                  {/* MSI Checkbox */}
                  {isEditing && transaction.id.startsWith('new_') && (
                    <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 mb-1 font-semibold">Diferir a Meses sin Intereses (MSI)</p>
                          <p className="text-sm text-white">¿Es compra a MSI?</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={editForm.isMsi}
                          onChange={e => setEditForm(f => ({ ...f, isMsi: e.target.checked }))}
                          className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                      
                      {editForm.isMsi && (
                        <div className="mt-3 flex items-center gap-4 animate-fadeIn">
                          <div className="flex-1">
                            <label className="text-xs text-slate-400 block mb-1">Mensualidades</label>
                            <select
                              value={editForm.msiMonths}
                              onChange={e => setEditForm(f => ({ ...f, msiMonths: Number(e.target.value) }))}
                              className="w-full bg-slate-750 border border-slate-650 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            >
                              {[3, 6, 9, 12, 18, 24].map(months => (
                                <option key={months} value={months}>{months} meses</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 block mb-1">Cuota Mensual</p>
                            <p className="text-sm font-bold text-emerald-400">
                              MXN ${editForm.amount > 0 ? (editForm.amount / editForm.msiMonths).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method / Follow up & Price Change */}
                  <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Método de Pago</label>
                        {isEditing ? (
                          <>
                            <select
                              value={editForm.payment_method}
                              onChange={e => setEditForm(f => ({ ...f, payment_method: e.target.value }))}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            >
                              <option value="">Seleccionar metodo...</option>
                              <option value="transfer">Transferencia</option>
                              <option value="cash">Efectivo</option>
                              <option value="card">Tarjeta</option>
                              <option value="check">Cheque</option>
                              <option value="other">Otro</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Metodo de pago usado para la operacion. Si no es relevante, puedes dejarlo en &quot;Otro&quot;.</p>
                          </>
                        ) : (
                          <p className="text-white text-xs font-semibold">
                            {PAYMENT_METHODS.find(m => m.value === transaction.payment_method)?.icon || '📦'} {PAYMENT_METHODS.find(m => m.value === transaction.payment_method)?.label || 'Otro'}
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Cambio de Precio (MXN)</label>
                        <input
                          type="number"
                          placeholder="Monto de cambio"
                          value={editForm.price_change || ''}
                          onChange={e => setEditForm(f => ({ ...f, price_change: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1">Notas y Referencias</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Escribe notas relevantes de la transacción..."
                        rows={3}
                        className="w-full p-3 bg-slate-800/40 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                      />
                    ) : (
                      <p className="text-xs text-slate-300 bg-slate-950/20 p-3 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                        {transaction.notes || 'Sin notas adicionales.'}
                      </p>
                    )}
                  </div>
                  
                  {/* Late Justification (if late or editing) */}
                  {(isEditing || transaction.late_justification) && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                       <label className="text-[10px] text-amber-500 uppercase font-semibold tracking-wider block mb-1">Justificación de Pago Tardío</label>
                       {isEditing ? (
                         <textarea
                           value={editForm.late_justification}
                           onChange={e => setEditForm(f => ({ ...f, late_justification: e.target.value }))}
                           placeholder="Motivo de la prórroga o pago atrasado..."
                           rows={2}
                           className="w-full p-3 bg-slate-900/40 border border-amber-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                         />
                       ) : (
                         <p className="text-xs text-amber-400/80 bg-slate-950/20 p-3 rounded-xl border border-amber-500/20 whitespace-pre-wrap">
                           {transaction.late_justification}
                         </p>
                       )}
                    </div>
                  )}

                  {/* Punctuality Card */}
                  {punctuality && !isEditing && (
                    <div className="p-3 bg-slate-800/20 border border-slate-800/60 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Historial Puntual</span>
                      <span className="text-xs text-slate-300 font-semibold">
                        🏆 Score: {punctuality.score}/100 • {consecutiveOnTime} seguidos
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXECUTION (Abonos y Recibos) */}
              {activeTab === 'execution' && (
                <div className="space-y-6">
                  {/* Progress Bar Balance */}
                  <div className="p-4 bg-slate-800/40 border border-slate-800/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Presupuestado</span>
                      <span>Total Abonado</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-white">
                      <span className="text-slate-300">{formatCurrency(transaction.amount)}</span>
                      <span className={cn(transaction.status === 'settled' ? 'text-emerald-400' : 'text-blue-400')}>
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-950/50 h-2.5 rounded-full overflow-hidden border border-slate-800/40">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300",
                          transaction.status === 'settled' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}
                        style={{ 
                          width: `${Math.min(
                            100, 
                            transaction.amount > 0 ? (totalPaid / transaction.amount) * 100 : (paymentRecords.length > 0 ? 100 : 0)
                          )}%` 
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500">Restante</span>
                      <span className={cn(remainingAmount === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400 font-bold')}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Add Abono Form */}
                  {remainingAmount > 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                      <h4 className="text-blue-400 font-bold text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Plus className="w-4 h-4" />
                        Registrar Abono Parcial / Pago
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Monto a Abonar</label>
                            <input
                              type="number"
                              placeholder="Monto"
                              value={newPayment.amount || ''}
                              onChange={e => setNewPayment(p => ({ ...p, amount: Number(e.target.value) }))}
                              className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Quién Recibió / Ref</label>
                            <input
                              type="text"
                              placeholder="Ej. Cajero, Telmex, Banco"
                              value={newPayment.recipient || ''}
                              onChange={e => setNewPayment(p => ({ ...p, recipient: e.target.value }))}
                              className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Método</label>
                            <select
                              value={newPayment.method}
                              onChange={e => setNewPayment(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                              className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                            >
                              {PAYMENT_METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Fecha de Operación</label>
                            <input
                              type="date"
                              value={newPayment.date}
                              onChange={e => setNewPayment(p => ({ ...p, date: e.target.value }))}
                              className="w-full p-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={addPaymentRecord}
                          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Agregar Abono
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Registered Abonos */}
                  {paymentRecords.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lista de Abonos</h4>
                      <div className="space-y-2">
                        {paymentRecords.map((record) => (
                          <div key={record.id} className="p-3 bg-slate-850/60 rounded-xl border border-slate-800 flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-xs">
                                  {PAYMENT_METHODS.find(m => m.value === record.method)?.icon} {formatCurrency(record.amount)}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">• {formatDate(record.date)}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">👤 Destinatario: {record.recipient}</p>
                              {record.notes && (
                                <p className="text-[10px] text-slate-500 mt-0.5 bg-slate-900/30 px-2 py-0.5 rounded italic">
                                  "{record.notes}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deletePaymentRecord(record.id)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Receipt PDFs & Files Upload */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recibos y Comprobantes</h4>
                    
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer',
                        isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        className="hidden"
                        accept="image/*,application/pdf"
                      />
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs text-slate-400 font-medium">Arrastra recibos aquí o haz clic para subir</p>
                      <p className="text-[10px] text-slate-500 mt-1">PDF o Imágenes (Máx. 10MB)</p>
                    </div>

                    {/* Files list */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((attachment) => {
                          const FileIcon = getFileIcon(attachment.file_type);
                          return (
                            <motion.div
                              key={attachment.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between p-3 bg-slate-850/60 rounded-xl border border-slate-800"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-white font-medium truncate max-w-[180px]">{attachment.file_name}</p>
                                  {attachment.file_size > 0 && (
                                    <p className="text-[10px] text-slate-500">{formatFileSize(attachment.file_size)}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {attachment.previewUrl && (
                                  <button
                                    onClick={() => setPreviewAttachment(attachment)}
                                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => downloadAttachment(attachment)}
                                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteAttachment(attachment.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 border-t border-slate-800/50 flex flex-col gap-2 bg-slate-900">
              <div className="flex gap-2">
                {typeof onDelete === 'function' && !transaction.id.startsWith('new_') && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    title="Eliminar Transacción"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowReceipt(true)}
                      className="px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      title="Imprimir comprobante"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar Detalles
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Delete Confirmation Modal overlay */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-red-500/20 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl"
                  >
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">¿Eliminar transacción?</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Esta acción no se puede deshacer. Se eliminará permanentemente la transacción "{transaction.description}".
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold rounded-xl transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(transaction.id);
                          setShowDeleteConfirm(false);
                          onClose();
                        }}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-red-500/10"
                      >
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Image Preview Overlay */}
          <AnimatePresence>
            {previewAttachment && previewAttachment.previewUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewAttachment(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-3xl max-h-full"
                >
                  <button
                    onClick={() => setPreviewAttachment(null)}
                    className="absolute -top-10 right-0 p-2 text-white hover:text-emerald-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <img
                    src={previewAttachment.previewUrl}
                    alt={previewAttachment.file_name}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  />
                  <p className="text-white text-sm mt-3 text-center font-medium">{previewAttachment.file_name}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      {showRecurrenceModal && (
        <RecurrenceModal
          isOpen={showRecurrenceModal}
          description={editForm.description || transaction.description}
          oldDate={pendingDateChange?.originalDate || transaction.due_date}
          newDate={pendingDateChange?.newDate || editForm.due_date}
          occurrenceCount={countFutureOccurrences(transaction, allTransactions, editForm.due_date)}
          onUpdateThis={handleRecurrenceUpdateThis}
          onUpdateAll={handleRecurrenceUpdateAll}
          onCancel={handleRecurrenceCancel}
        />
      )}

      {showReceipt && (
        <ReceiptReport
          transaction={{ ...transaction, amount: Math.abs(transaction.amount), type: transaction.type || 'expense' } as any}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </AnimatePresence>
  );
}