'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, Edit2, Trash2, DollarSign, Calendar,
  AlertTriangle, CheckCircle, Clock, ExternalLink, Image as ImageIcon,
  FileText, Upload, X, ChevronRight, Eye, TrendingUp, Wallet,
} from 'lucide-react';
import {
  useCreditCards,
  useCreateCreditCard,
  useUpdateCreditCard,
  useDeleteCreditCard,
  type CreditCardDB,
} from '@/hooks/useCreditCards';
import {
  useCardPayments,
  useCreateCardPayment,
  useDeleteCardPayment,
  type CardPaymentDB,
} from '@/hooks/useCardPayments';
import { formatCurrency } from '@/lib/utils';
import { mockCreditCardAccounts } from '@/lib/creditCardData';

// ── helpers ──────────────────────────────────────────────────────────────────

function daysUntil(day: number): number {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), day);
  if (thisMonth.getTime() > today.getTime()) {
    return Math.ceil((thisMonth.getTime() - today.getTime()) / 86400000);
  }
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
  return Math.ceil((nextMonth.getTime() - today.getTime()) / 86400000);
}

function urgencyColor(days: number): string {
  if (days <= 3) return 'text-red-400';
  if (days <= 7) return 'text-amber-400';
  return 'text-emerald-400';
}

function urgencyBg(days: number): string {
  if (days <= 3) return 'bg-red-500/20 border-red-500/40';
  if (days <= 7) return 'bg-amber-500/20 border-amber-500/40';
  return 'bg-emerald-500/20 border-emerald-500/40';
}

const BRAND_GRADIENTS: Record<string, string> = {
  visa: 'from-blue-700 to-indigo-900',
  mastercard: 'from-red-600 to-orange-700',
  amex: 'from-slate-600 to-slate-900',
  other: 'from-purple-700 to-purple-900',
};

const BRAND_LABELS: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  other: '----',
};

const COLOR_OPTIONS = [
  { value: 'purple', label: 'Morado', cls: 'from-purple-700 to-purple-900' },
  { value: 'blue', label: 'Azul', cls: 'from-blue-700 to-indigo-900' },
  { value: 'emerald', label: 'Esmeralda', cls: 'from-emerald-700 to-teal-900' },
  { value: 'rose', label: 'Rosa', cls: 'from-rose-600 to-pink-900' },
  { value: 'amber', label: 'Ámbar', cls: 'from-amber-600 to-orange-900' },
  { value: 'slate', label: 'Grafito', cls: 'from-slate-600 to-slate-900' },
];

function getCardGradient(card: CreditCardDB): string {
  const byBrand = BRAND_GRADIENTS[card.brand || 'other'];
  if (byBrand && card.brand !== 'other') return byBrand;
  const byColor = COLOR_OPTIONS.find(c => c.value === (card.color || 'purple'));
  return byColor ? byColor.cls : 'from-purple-700 to-purple-900';
}

// ── sub-components ────────────────────────────────────────────────────────────

function CardVisual({ card }: { card: CreditCardDB }) {
  const gradient = getCardGradient(card);
  const limit = card.credit_limit ?? 0;
  const utilPct = limit > 0
    ? Math.round((card.current_balance / limit) * 100)
    : 0;

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-xl overflow-hidden select-none`}
      style={{ minHeight: 180 }}>
      <div className="absolute inset-0 opacity-10"
        style={{ background: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
      <div className="relative flex justify-between items-start mb-4">
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider">{card.bank_name || card.name}</p>
          <p className="text-white font-semibold text-sm mt-0.5">{card.name}</p>
        </div>
        <span className="text-white font-black text-lg tracking-wider opacity-90">
          {BRAND_LABELS[card.brand || 'other']}
        </span>
      </div>
      <p className="text-white/70 text-lg tracking-[0.25em] font-mono mb-4">
        •••• •••• •••• {card.last4}
      </p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-white/50 text-xs">Saldo actual</p>
          <p className="text-white font-bold text-base">{formatCurrency(card.current_balance)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs">Límite</p>
          <p className="text-white/80 text-sm">{formatCurrency(limit)}</p>
        </div>
      </div>
      {limit > 0 && (
        <div className="mt-3">
          <div className="h-1 bg-white/20 rounded-full">
            <div
              className={`h-1 rounded-full transition-all ${utilPct > 80 ? 'bg-red-400' : utilPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(utilPct, 100)}%` }}
            />
          </div>
          <p className="text-white/50 text-xs mt-1 text-right">{utilPct}% utilizado</p>
        </div>
      )}
    </div>
  );
}

// ── types ─────────────────────────────────────────────────────────────────────

interface CardFormState {
  name: string;
  bank_name: string;
  last4: string;
  brand: string;
  entity: string;
  cut_off_day: number;
  payment_due_day: number;
  credit_limit: number;
  current_balance: number;
  interest_rate: number;
  color: string;
}

const EMPTY_FORM: CardFormState = {
  name: '',
  bank_name: '',
  last4: '',
  brand: 'visa',
  entity: '',
  cut_off_day: 1,
  payment_due_day: 20,
  credit_limit: 0,
  current_balance: 0,
  interest_rate: 0,
  color: 'purple',
};

interface PaymentFormState {
  card_id: string;
  amount: string;
  payment_date: string;
  payment_type: 'minimum' | 'partial' | 'full';
  proof_mode: 'link' | 'file';
  proof_url: string;
  proof_type: 'link' | 'image' | 'pdf' | null;
  reference: string;
  notes: string;
}

// ── main component ────────────────────────────────────────────────────────────

interface AccountManagerProps {
  userId: string | undefined;
  isDemo?: boolean;
}

export default function AccountManager({ userId, isDemo = false }: AccountManagerProps) {
  const { data: dbCards = [], isLoading: cardsLoading } = useCreditCards(isDemo ? undefined : userId);
  const { data: dbPayments = [], isLoading: paymentsLoading } = useCardPayments(isDemo ? undefined : userId);

  const createCard = useCreateCreditCard();
  const updateCard = useUpdateCreditCard();
  const deleteCard = useDeleteCreditCard();
  const createPayment = useCreateCardPayment();
  const deletePayment = useDeleteCardPayment();

  // Use mock data in demo mode
  const cards: CreditCardDB[] = useMemo(() => {
    if (isDemo) {
      return mockCreditCardAccounts.map(c => ({
        id: c.id,
        user_id: 'demo',
        entity: c.entity,
        name: c.name,
        last4: c.last4,
        bank_name: c.name.split(' ')[0],
        brand: 'visa',
        cut_off_day: c.cut_off_day ?? 1,
        payment_due_day: c.payment_due_day ?? 20,
        statement_day: c.cut_off_day ?? 1,
        due_day: c.payment_due_day ?? 20,
        credit_limit: c.credit_limit ?? 0,
        current_balance: c.current_balance,
        available_credit: c.available_credit ?? 0,
        minimum_payment: 0,
        has_msi: false,
        msi_total: 0,
        interest_rate: c.interest_rate,
        color: 'purple',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    return dbCards;
  }, [isDemo, dbCards]);

  const payments: CardPaymentDB[] = useMemo(() => {
    if (isDemo) return [];
    return dbPayments;
  }, [isDemo, dbPayments]);

  // UI state
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardDB | null>(null);
  const [cardForm, setCardForm] = useState<CardFormState>(EMPTY_FORM);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [payForm, setPayForm] = useState<PaymentFormState>({
    card_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: 'minimum',
    proof_mode: 'link',
    proof_url: '',
    proof_type: null,
    reference: '',
    notes: '',
  });

  // Computed totals
  const totalBalance = cards.reduce((s, c) => s + c.current_balance, 0);
  const totalLimit = cards.reduce((s, c) => s + (c.credit_limit ?? 0), 0);
  const totalUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const nextDueCard = cards
    .filter(c => c.is_active)
    .sort((a, b) => daysUntil(a.payment_due_day ?? 20) - daysUntil(b.payment_due_day ?? 20))[0];
  const nextDueDays = nextDueCard ? daysUntil(nextDueCard.payment_due_day ?? 20) : null;

  // ── card CRUD ────────────────────────────────────────────────────────────────

  function openAddCard() {
    setEditingCard(null);
    setCardForm(EMPTY_FORM);
    setShowCardModal(true);
  }

  function openEditCard(card: CreditCardDB) {
    setEditingCard(card);
    setCardForm({
      name: card.name,
      bank_name: card.bank_name || '',
      last4: card.last4,
      brand: card.brand || 'visa',
      entity: card.entity || '',
      cut_off_day: card.cut_off_day ?? (card as any).statement_day ?? 1,
      payment_due_day: card.payment_due_day ?? (card as any).due_day ?? 20,
      credit_limit: card.credit_limit ?? 0,
      current_balance: card.current_balance,
      interest_rate: card.interest_rate,
      color: card.color || 'purple',
    });
    setShowCardModal(true);
  }

  async function handleSaveCard() {
    if (!cardForm.name.trim() || !cardForm.last4.trim()) {
      alert('Nombre y últimos 4 dígitos son obligatorios');
      return;
    }
    if (cardForm.last4.length !== 4 || !/^\d{4}$/.test(cardForm.last4)) {
      alert('Los últimos 4 dígitos deben ser exactamente 4 números');
      return;
    }
    if (isDemo) { alert('En modo Demo no se pueden guardar cambios en la BD'); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: userId!,
        entity: cardForm.entity || 'personal',
        name: cardForm.name.trim(),
        bank_name: cardForm.bank_name.trim() || undefined,
        last4: cardForm.last4,
        brand: cardForm.brand,
        cut_off_day: cardForm.cut_off_day,
        payment_due_day: cardForm.payment_due_day,
        statement_day: cardForm.cut_off_day,
        due_day: cardForm.payment_due_day,
        credit_limit: cardForm.credit_limit,
        current_balance: cardForm.current_balance,
        available_credit: Math.max(0, cardForm.credit_limit - cardForm.current_balance),
        interest_rate: cardForm.interest_rate,
        color: cardForm.color,
        minimum_payment: 0,
        has_msi: false,
        msi_total: 0,
        is_active: true,
      };
      if (editingCard) {
        await updateCard.mutateAsync({ id: editingCard.id, ...payload });
      } else {
        await createCard.mutateAsync(payload as any);
      }
      setShowCardModal(false);
    } catch (err: any) {
      alert('Error al guardar: ' + (err?.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard(id: string) {
    if (isDemo) { alert('Modo Demo: no se puede eliminar'); return; }
    if (!confirm('¿Eliminar esta tarjeta y todos sus pagos registrados?')) return;
    setDeleting(id);
    try {
      await deleteCard.mutateAsync({ id, userId: userId! });
      if (selectedCard === id) setSelectedCard(null);
    } catch (err: any) {
      alert('Error al eliminar: ' + (err?.message || ''));
    } finally {
      setDeleting(null);
    }
  }

  // ── payment CRUD ──────────────────────────────────────────────────────────────

  function openPaymentModal(cardId?: string) {
    const card = cards.find(c => c.id === (cardId || selectedCard));
    setPayingCardId(cardId || selectedCard || cards[0]?.id || '');
    setPayForm({
      card_id: cardId || selectedCard || cards[0]?.id || '',
      amount: card ? String(card.minimum_payment || '') : '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_type: 'minimum',
      proof_mode: 'link',
      proof_url: '',
      proof_type: null,
      reference: '',
      notes: '',
    });
    setFilePreview(null);
    setShowPaymentModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) { alert('Solo se permiten imágenes o PDFs'); return; }
    if (file.size > 4 * 1024 * 1024) { alert('El archivo no debe superar 4MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPayForm(f => ({
        ...f,
        proof_url: base64,
        proof_type: isImage ? 'image' : 'pdf',
      }));
      setFilePreview(isImage ? base64 : null);
    };
    reader.readAsDataURL(file);
  }

  async function handleSavePayment() {
    if (!payForm.card_id) { alert('Selecciona una tarjeta'); return; }
    if (!payForm.amount || Number(payForm.amount) <= 0) { alert('El monto debe ser mayor a 0'); return; }
    if (isDemo) { alert('En modo Demo no se pueden guardar pagos'); return; }
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        user_id: userId!,
        card_id: payForm.card_id,
        amount: Number(payForm.amount),
        payment_date: payForm.payment_date,
        payment_type: payForm.payment_type,
        proof_url: payForm.proof_url || null,
        proof_type: payForm.proof_url
          ? (payForm.proof_mode === 'link' ? 'link' : payForm.proof_type)
          : null,
        reference: payForm.reference || null,
        notes: payForm.notes || null,
      });
      setShowPaymentModal(false);
    } catch (err: any) {
      alert('Error al registrar pago: ' + (err?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm('¿Eliminar este registro de pago?')) return;
    if (isDemo) return;
    try {
      await deletePayment.mutateAsync({ id: paymentId, userId: userId! });
    } catch (err: any) {
      alert('Error: ' + (err?.message || ''));
    }
  }

  // ── render ────────────────────────────────────────────────────────────────────

  const cardPaymentsFor = (cardId: string) =>
    payments.filter(p => p.card_id === cardId);

  const PAYMENT_TYPE_LABELS: Record<string, string> = {
    minimum: 'Mínimo',
    partial: 'Parcial',
    full: 'Total',
  };

  const PAYMENT_TYPE_COLORS: Record<string, string> = {
    minimum: 'bg-amber-500/20 text-amber-400',
    partial: 'bg-blue-500/20 text-blue-400',
    full: 'bg-emerald-500/20 text-emerald-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Cuenta</h2>
            <p className="text-slate-500 text-xs">Tarjetas de crédito y seguimiento de pagos</p>
          </div>
        </div>
        <button
          onClick={openAddCard}
          className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Tarjeta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Deuda Total',
            value: formatCurrency(totalBalance),
            icon: DollarSign,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Límite Total',
            value: formatCurrency(totalLimit),
            icon: Wallet,
            color: 'text-slate-400',
            bg: 'bg-slate-500/10',
          },
          {
            label: 'Utilización',
            value: `${totalUtilization}%`,
            icon: TrendingUp,
            color: totalUtilization > 80 ? 'text-red-400' : totalUtilization > 50 ? 'text-amber-400' : 'text-emerald-400',
            bg: totalUtilization > 80 ? 'bg-red-500/10' : totalUtilization > 50 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
          },
          {
            label: 'Próximo Pago',
            value: nextDueDays !== null ? `${nextDueDays} días` : '—',
            icon: Calendar,
            color: nextDueDays !== null ? urgencyColor(nextDueDays) : 'text-slate-400',
            bg: nextDueDays !== null ? (nextDueDays <= 3 ? 'bg-red-500/10' : nextDueDays <= 7 ? 'bg-amber-500/10' : 'bg-emerald-500/10') : 'bg-slate-500/10',
          },
        ].map((m) => (
          <div key={m.label} className={`${m.bg} border border-slate-800/50 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <p className="text-slate-500 text-xs">{m.label}</p>
            </div>
            <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      {cardsLoading ? (
        <div className="text-center text-slate-500 py-12">Cargando tarjetas...</div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium mb-1">Sin tarjetas registradas</p>
          <p className="text-slate-600 text-sm mb-4">Agrega tu primera tarjeta de crédito</p>
          <button onClick={openAddCard} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl text-sm transition-all">
            + Agregar tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map(card => {
            const coDays = daysUntil(card.cut_off_day ?? (card as any).statement_day ?? 1);
            const dueDays = daysUntil(card.payment_due_day ?? (card as any).due_day ?? 20);
            const cardPays = cardPaymentsFor(card.id);
            const isExpanded = showHistory === card.id;

            return (
              <div key={card.id} className="bg-slate-900/60 border border-slate-800/50 rounded-2xl overflow-hidden">
                <div className="p-4">
                  <CardVisual card={card} />
                </div>

                {/* Dates */}
                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                  <div className={`border rounded-lg px-3 py-2 ${urgencyBg(coDays)}`}>
                    <p className="text-slate-500 text-xs mb-0.5">Corte</p>
                    <p className={`font-semibold text-sm ${urgencyColor(coDays)}`}>día {card.cut_off_day ?? (card as any).statement_day}</p>
                    <p className={`text-xs ${urgencyColor(coDays)}`}>en {coDays} días</p>
                  </div>
                  <div className={`border rounded-lg px-3 py-2 ${urgencyBg(dueDays)}`}>
                    <p className="text-slate-500 text-xs mb-0.5">Pago límite</p>
                    <p className={`font-semibold text-sm ${urgencyColor(dueDays)}`}>día {card.payment_due_day ?? (card as any).due_day}</p>
                    <p className={`text-xs ${urgencyColor(dueDays)}`}>
                      {dueDays <= 0 ? '¡Vencido!' : `en ${dueDays} días`}
                    </p>
                  </div>
                </div>

                {/* Interest */}
                {card.interest_rate > 0 && (
                  <div className="px-4 pb-2">
                    <span className="text-slate-500 text-xs">Tasa anual: {card.interest_rate}%</span>
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => openPaymentModal(card.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Registrar Pago
                  </button>
                  <button
                    onClick={() => setShowHistory(isExpanded ? null : card.id)}
                    className="flex items-center justify-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700/50 px-3 py-2 rounded-lg text-sm transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {cardPays.length > 0 && (
                      <span className="bg-purple-500/30 text-purple-400 text-xs rounded-full px-1.5">{cardPays.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => openEditCard(card)}
                    className="flex items-center justify-center bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 border border-slate-700/50 p-2 rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deleting === card.id}
                    className="flex items-center justify-center bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/50 p-2 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Payment History */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800/50 overflow-hidden"
                    >
                      <div className="p-4">
                        <p className="text-slate-400 text-sm font-medium mb-3">Historial de Pagos</p>
                        {cardPays.length === 0 ? (
                          <p className="text-slate-600 text-xs text-center py-4">Sin pagos registrados</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {cardPays.map(pay => (
                              <div key={pay.id} className="flex items-start gap-3 bg-slate-800/40 rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_TYPE_COLORS[pay.payment_type]}`}>
                                      {PAYMENT_TYPE_LABELS[pay.payment_type]}
                                    </span>
                                    <span className="text-slate-500 text-xs">{pay.payment_date}</span>
                                  </div>
                                  <p className="text-white font-semibold text-sm">{formatCurrency(pay.amount)}</p>
                                  {pay.reference && <p className="text-slate-500 text-xs">Ref: {pay.reference}</p>}
                                  {pay.notes && <p className="text-slate-500 text-xs truncate">{pay.notes}</p>}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {pay.proof_url && (
                                    <button
                                      onClick={() => {
                                        if (pay.proof_type === 'link') {
                                          window.open(pay.proof_url!, '_blank');
                                        } else {
                                          const w = window.open('');
                                          if (w) {
                                            if (pay.proof_type === 'image') {
                                              w.document.write(`<img src="${pay.proof_url}" style="max-width:100%" />`);
                                            } else {
                                              w.document.write(`<embed src="${pay.proof_url}" width="100%" height="100%" />`);
                                            }
                                          }
                                        }
                                      }}
                                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                                      title="Ver comprobante"
                                    >
                                      {pay.proof_type === 'link' ? <ExternalLink className="w-3.5 h-3.5" /> :
                                       pay.proof_type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> :
                                       <FileText className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeletePayment(pay.id)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit Card Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="text-white font-bold">{editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h3>
                <button onClick={() => setShowCardModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview */}
                <CardVisual card={{
                  id: 'preview',
                  user_id: '',
                  entity: cardForm.entity,
                  name: cardForm.name || 'Nombre Tarjeta',
                  bank_name: cardForm.bank_name || undefined,
                  last4: cardForm.last4 || '0000',
                  brand: cardForm.brand,
                  cut_off_day: cardForm.cut_off_day,
                  payment_due_day: cardForm.payment_due_day,
                  statement_day: cardForm.cut_off_day,
                  due_day: cardForm.payment_due_day,
                  credit_limit: cardForm.credit_limit,
                  current_balance: cardForm.current_balance,
                  available_credit: Math.max(0, cardForm.credit_limit - cardForm.current_balance),
                  minimum_payment: 0,
                  has_msi: false,
                  msi_total: 0,
                  interest_rate: cardForm.interest_rate,
                  color: cardForm.color,
                  is_active: true,
                  created_at: '',
                  updated_at: '',
                } as CreditCardDB} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-slate-400 text-xs mb-1">Nombre / Apodo *</label>
                    <input
                      value={cardForm.name}
                      onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="ej. BBVA Oro"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Banco</label>
                    <input
                      value={cardForm.bank_name}
                      onChange={e => setCardForm(f => ({ ...f, bank_name: e.target.value }))}
                      placeholder="ej. BBVA"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Últimos 4 dígitos *</label>
                    <input
                      value={cardForm.last4}
                      onChange={e => setCardForm(f => ({ ...f, last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="0000"
                      maxLength={4}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Marca</label>
                    <select
                      value={cardForm.brand}
                      onChange={e => setCardForm(f => ({ ...f, brand: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="amex">American Express</option>
                      <option value="other">Otra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Color de tarjeta</label>
                    <select
                      value={cardForm.color}
                      onChange={e => setCardForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      {COLOR_OPTIONS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Día de corte</label>
                    <input
                      type="number" min={1} max={31}
                      value={cardForm.cut_off_day}
                      onChange={e => setCardForm(f => ({ ...f, cut_off_day: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Día límite pago</label>
                    <input
                      type="number" min={1} max={31}
                      value={cardForm.payment_due_day}
                      onChange={e => setCardForm(f => ({ ...f, payment_due_day: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Límite de crédito ($)</label>
                    <input
                      type="number" min={0} step={100}
                      value={cardForm.credit_limit}
                      onChange={e => setCardForm(f => ({ ...f, credit_limit: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Saldo actual ($)</label>
                    <input
                      type="number" min={0} step={0.01}
                      value={cardForm.current_balance}
                      onChange={e => setCardForm(f => ({ ...f, current_balance: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Tasa anual (%)</label>
                    <input
                      type="number" min={0} step={0.1}
                      value={cardForm.interest_rate}
                      onChange={e => setCardForm(f => ({ ...f, interest_rate: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-slate-800">
                <button onClick={() => setShowCardModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-medium transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCard}
                  disabled={saving}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : (editingCard ? 'Actualizar' : 'Agregar Tarjeta')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Register Payment Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="text-white font-bold">Registrar Pago</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Card Selector */}
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Tarjeta</label>
                  <select
                    value={payForm.card_id}
                    onChange={e => {
                      const card = cards.find(c => c.id === e.target.value);
                      setPayForm(f => ({
                        ...f,
                        card_id: e.target.value,
                        amount: card ? String(card.minimum_payment || '') : f.amount,
                      }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Seleccionar tarjeta...</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>•••• {c.last4} — {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Amount + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Monto ($)</label>
                    <input
                      type="number" min={0} step={0.01}
                      value={payForm.amount}
                      onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Tipo de pago</label>
                    <select
                      value={payForm.payment_type}
                      onChange={e => {
                        const type = e.target.value as 'minimum' | 'partial' | 'full';
                        const card = cards.find(c => c.id === payForm.card_id);
                        let amount = payForm.amount;
                        if (type === 'full' && card) amount = String(card.current_balance);
                        if (type === 'minimum' && card) amount = String(card.minimum_payment || '');
                        setPayForm(f => ({ ...f, payment_type: type, amount }));
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="minimum">Mínimo</option>
                      <option value="partial">Parcial</option>
                      <option value="full">Total</option>
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-slate-400 text-xs mb-1">Fecha de pago</label>
                  <input
                    type="date"
                    value={payForm.payment_date}
                    onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Proof */}
                <div>
                  <label className="block text-slate-400 text-xs mb-2">Comprobante</label>
                  <div className="flex gap-2 mb-3">
                    {(['link', 'file'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setPayForm(f => ({ ...f, proof_mode: mode, proof_url: '', proof_type: null }));
                          setFilePreview(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          payForm.proof_mode === mode
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {mode === 'link' ? '🔗 Link / URL' : '📎 Archivo (imagen / PDF)'}
                      </button>
                    ))}
                  </div>
                  {payForm.proof_mode === 'link' ? (
                    <input
                      type="url"
                      value={payForm.proof_url}
                      onChange={e => setPayForm(f => ({ ...f, proof_url: e.target.value, proof_type: 'link' }))}
                      placeholder="https://..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        ref={fileRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border border-dashed border-slate-600 hover:border-emerald-500/50 rounded-lg px-3 py-4 text-slate-400 hover:text-emerald-400 text-sm flex flex-col items-center gap-2 transition-all"
                      >
                        <Upload className="w-5 h-5" />
                        {payForm.proof_url ? 'Archivo cargado ✓' : 'Seleccionar imagen o PDF (máx. 4MB)'}
                      </button>
                      {filePreview && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
                          <img src={filePreview} alt="preview" className="w-full max-h-32 object-contain bg-slate-800" />
                        </div>
                      )}
                      {payForm.proof_url && !filePreview && (
                        <p className="text-emerald-400 text-xs mt-1 text-center">PDF listo para guardar</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reference + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Folio / Referencia</label>
                    <input
                      value={payForm.reference}
                      onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                      placeholder="Opcional"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Notas</label>
                    <input
                      value={payForm.notes}
                      onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Opcional"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-slate-800">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl py-2.5 text-sm font-medium transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={saving}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl py-2.5 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Registrar Pago'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
