'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MapPin, CreditCard, Copy, Check, Edit2, Trash2, X, Globe, User, Landmark, FileText, Printer, History, AlertTriangle, ShieldCheck, Mail, Link as LinkIcon, Building2 } from 'lucide-react';
import { Contact, PaymentMethod, Transaction, generateCEP, isIncomeTransaction, BankAccount, PhoneNumber, Address, ReputationNote } from '@/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import ReceiptReport from './ReceiptReport';

interface ContactsProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onCreateTransactionForContact?: (contact: Contact) => void;
  transactions?: Transaction[];
}

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, any> = {
  transfer: Landmark,
  cash: CreditCard,
  card: CreditCard,
  check: FileText,
  other: ShieldCheck
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  cash: 'Efectivo',
  card: 'Tarjeta',
  check: 'Cheque',
  other: 'Otro'
};

export default function Contacts({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onCreateTransactionForContact,
  transactions = []
}: ContactsProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info'|'banks'|'history'>('info');
  const [showReceipt, setShowReceipt] = useState<{ tx: Transaction; contact: Contact } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [phones, setPhones] = useState<PhoneNumber[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reputationNotes, setReputationNotes] = useState<ReputationNote[]>([]);
  
  // Website/socials
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const getContactTransactions = (contactId: string) => {
    return transactions.filter(t => t.contact_id === contactId);
  };

  const getContactPayments = (contactId: string) => {
    return transactions.filter(t => 
      t.contact_id === contactId && 
      (t.status === 'settled' || t.paid_date)
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setEmail('');
    setPreferredMethod('transfer');
    setNotes('');
    setBankAccounts([]);
    setPhones([]);
    setAddresses([]);
    setReputationNotes([]);
    setWebsite('');
    setFacebook('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setName(c.name);
    setEmail(c.email || '');
    setPreferredMethod(c.payment_method_preferred || 'transfer');
    setNotes(c.notes || '');
    
    // Migrate legacy fields to arrays if needed
    const cBanks = c.bank_accounts || [];
    if (cBanks.length === 0 && (c.bank_name || c.bank_account || c.bank_clabe)) {
      cBanks.push({ bank_name: c.bank_name || 'Banco', account_number: c.bank_account, clabe: c.bank_clabe });
    }
    setBankAccounts(cBanks);

    const cPhones = c.phones || [];
    if (cPhones.length === 0 && c.phone) {
      cPhones.push({ number: c.phone, type: 'móvil' });
    }
    setPhones(cPhones);

    const cAddrs = c.addresses || [];
    if (cAddrs.length === 0 && c.address) {
      cAddrs.push({ address: c.address, type: 'casa' });
    }
    setAddresses(cAddrs);

    setReputationNotes(c.reputation_notes || []);
    setWebsite(c.digital_presence?.website || '');
    setFacebook(c.digital_presence?.facebook || '');
    
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contactData: Contact = {
      id: editingContact ? editingContact.id : `contact_${Date.now()}`,
      name,
      email: email || undefined,
      bank_accounts: bankAccounts,
      phones: phones,
      addresses: addresses,
      reputation_notes: reputationNotes,
      digital_presence: { website, facebook },
      payment_method_preferred: preferredMethod,
      notes: notes || undefined,
      created_at: editingContact ? editingContact.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingContact) {
      onUpdateContact(contactData);
    } else {
      onAddContact(contactData);
    }
    setIsFormOpen(false);
  };

  const addBankAccount = () => setBankAccounts([...bankAccounts, { bank_name: '', account_number: '', clabe: '' }]);
  const updateBankAccount = (idx: number, field: keyof BankAccount, val: string) => {
    const updated = [...bankAccounts];
    updated[idx] = { ...updated[idx], [field]: val };
    setBankAccounts(updated);
  };
  const removeBankAccount = (idx: number) => setBankAccounts(bankAccounts.filter((_, i) => i !== idx));

  const addPhone = () => setPhones([...phones, { number: '', type: 'móvil' }]);
  const updatePhone = (idx: number, field: keyof PhoneNumber, val: string) => {
    const updated = [...phones];
    updated[idx] = { ...updated[idx], [field]: val };
    setPhones(updated);
  };
  const removePhone = (idx: number) => setPhones(phones.filter((_, i) => i !== idx));

  const addAddress = () => setAddresses([...addresses, { address: '', type: 'oficina' }]);
  const updateAddress = (idx: number, field: keyof Address, val: string) => {
    const updated = [...addresses];
    updated[idx] = { ...updated[idx], [field]: val };
    setAddresses(updated);
  };
  const removeAddress = (idx: number) => setAddresses(addresses.filter((_, i) => i !== idx));

  const addReputation = () => setReputationNotes([{ id: `rep_${Date.now()}`, date: new Date().toISOString(), note: '', type: 'neutral' }, ...reputationNotes]);
  const updateReputation = (idx: number, field: keyof ReputationNote, val: string) => {
    const updated = [...reputationNotes];
    updated[idx] = { ...updated[idx], [field]: val };
    setReputationNotes(updated);
  };
  const removeReputation = (idx: number) => setReputationNotes(reputationNotes.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar contacto o proveedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contacto
        </button>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
          <User className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No se encontraron contactos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(c => {
            const isExpanded = expandedContact === c.id;
            const contactTxs = getContactTransactions(c.id);
            const allPhones = c.phones || (c.phone ? [{ number: c.phone, type: 'móvil' as const }] : []);
            const allBanks = c.bank_accounts || (c.bank_name ? [{ bank_name: c.bank_name, account_number: c.bank_account, clabe: c.bank_clabe }] : []);
            const allAddrs = c.addresses || (c.address ? [{ address: c.address, type: 'casa' as const }] : []);
            
            const negativeReps = c.reputation_notes?.filter(r => r.type === 'negative').length || 0;

            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-slate-900/40 backdrop-blur-xl border rounded-2xl transition-all flex flex-col",
                  isExpanded ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5 col-span-full md:col-span-2 lg:col-span-3" : "border-slate-800/80 hover:border-slate-700/50"
                )}
              >
                {/* Header (Always Visible) */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-xl border border-slate-700/50 shadow-inner">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-base leading-tight">{c.name}</h3>
                        {negativeReps > 0 && (
                          <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium" title="Tiene reportes negativos">
                            <AlertTriangle className="w-3 h-3" />
                            Atención
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        {allPhones[0] && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500/70" />
                            {allPhones[0].number}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-500/70" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    {onCreateTransactionForContact && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCreateTransactionForContact(c); }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Pago
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedContact(isExpanded ? null : c.id)}
                      className={cn(
                        "px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5",
                        isExpanded ? "bg-slate-800 border-slate-700 text-white" : "bg-transparent border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      {isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-800 overflow-hidden"
                    >
                      <div className="p-5 flex flex-col lg:flex-row gap-6">
                        {/* Tabs Navigation */}
                        <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
                          {[
                            { id: 'info', label: 'Info. General', icon: User },
                            { id: 'banks', label: 'Cuentas Bancarias', icon: Landmark, badge: allBanks.length },
                            { id: 'history', label: 'Histórico & Feedback', icon: History, badge: contactTxs.length }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal",
                                activeTab === tab.id
                                  ? "bg-slate-800 text-white shadow-sm"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-emerald-400" : "text-slate-500")} />
                                {tab.label}
                              </div>
                              {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                  activeTab === tab.id ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                                )}>{tab.badge}</span>
                              )}
                            </button>
                          ))}
                          
                          <div className="lg:mt-auto pt-4 border-t border-slate-800/50 hidden lg:flex flex-col gap-2">
                            <button onClick={() => handleOpenEdit(c)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                              <Edit2 className="w-4 h-4" /> Editar Perfil
                            </button>
                            <button onClick={() => onDeleteContact(c.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 min-h-[300px]">
                          {activeTab === 'info' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-500" /> Teléfonos
                                  </h4>
                                  <div className="space-y-2">
                                    {allPhones.length === 0 ? <p className="text-xs text-slate-500">No hay teléfonos registrados</p> : null}
                                    {allPhones.map((p, i) => (
                                      <div key={i} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                                        <div className="flex flex-col">
                                          <span className="text-white text-sm font-medium">{p.number}</span>
                                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{p.type} {p.description ? `- ${p.description}` : ''}</span>
                                        </div>
                                        <button onClick={() => handleCopy(p.number, `p-${i}`)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded">
                                          {copiedId === `p-${i}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-rose-500" /> Direcciones
                                  </h4>
                                  <div className="space-y-2">
                                    {allAddrs.length === 0 ? <p className="text-xs text-slate-500">No hay direcciones registradas</p> : null}
                                    {allAddrs.map((a, i) => (
                                      <div key={i} className="flex flex-col gap-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                                        <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-semibold">{a.type}</span>
                                        <span className="text-white text-sm leading-relaxed">{a.address}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" /> Presencia Digital
                                  </h4>
                                  <div className="space-y-2">
                                    {(!c.digital_presence?.website && !c.digital_presence?.facebook && !c.email) && <p className="text-xs text-slate-500">Sin datos digitales</p>}
                                    {c.email && (
                                      <a href={`mailto:${c.email}`} className="flex items-center gap-3 text-sm text-slate-300 hover:text-white bg-slate-950/30 p-2 rounded-lg transition-colors">
                                        <Mail className="w-4 h-4 text-slate-400" /> {c.email}
                                      </a>
                                    )}
                                    {c.digital_presence?.website && (
                                      <a href={c.digital_presence.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-400 bg-slate-950/30 p-2 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4" /> {c.digital_presence.website}
                                      </a>
                                    )}
                                    {c.digital_presence?.facebook && (
                                      <a href={c.digital_presence.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-500 bg-slate-950/30 p-2 rounded-lg transition-colors">
                                        <Globe className="w-4 h-4" /> Facebook
                                      </a>
                                    )}
                                  </div>
                                </div>
                                
                                {c.notes && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Notas Generales</h4>
                                    <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-300 italic">
                                      "{c.notes}"
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {activeTab === 'banks' && (
                            <div className="space-y-4">
                              {allBanks.length === 0 ? (
                                <div className="text-center py-10">
                                  <Landmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                  <p className="text-sm text-slate-400">No hay cuentas bancarias registradas.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {allBanks.map((b, i) => (
                                    <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 relative overflow-hidden group">
                                      {b.is_primary && (
                                        <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                          PRINCIPAL
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                                          <Building2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <h5 className="text-white font-medium text-sm">{b.bank_name || 'Banco Desconocido'}</h5>
                                          {b.alias && <p className="text-[10px] text-slate-500">{b.alias}</p>}
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {b.account_number && (
                                          <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-[11px] text-slate-500 font-medium">CUENTA</span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-white font-mono text-sm tracking-wide">{b.account_number}</span>
                                              <button onClick={() => handleCopy(b.account_number!, `b-acc-${i}`)} className="text-slate-500 hover:text-emerald-400 transition-colors">
                                                {copiedId === `b-acc-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                        {b.clabe && (
                                          <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800/50">
                                            <span className="text-[11px] text-slate-500 font-medium">CLABE</span>
                                            <div className="flex items-center gap-2">
                                              <span className="text-white font-mono text-sm tracking-wide">{b.clabe}</span>
                                              <button onClick={() => handleCopy(b.clabe!, `b-clb-${i}`)} className="text-slate-500 hover:text-emerald-400 transition-colors">
                                                {copiedId === `b-clb-${i}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'history' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                              {/* Reputación / Feedback */}
                              <div className="flex flex-col h-full">
                                <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-amber-500" /> Reputación y Feedback
                                </h4>
                                <div className="flex-1 bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 overflow-y-auto">
                                  {c.reputation_notes && c.reputation_notes.length > 0 ? (
                                    <div className="space-y-3">
                                      {c.reputation_notes.map((note) => (
                                        <div key={note.id} className={cn(
                                          "p-3 rounded-xl border text-sm",
                                          note.type === 'positive' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-100" :
                                          note.type === 'negative' ? "bg-red-500/10 border-red-500/20 text-red-100" :
                                          "bg-slate-800/50 border-slate-700/50 text-slate-300"
                                        )}>
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] opacity-70 uppercase tracking-widest">{note.type === 'negative' ? 'Problema' : note.type === 'positive' ? 'Aprobado' : 'Nota'}</span>
                                            <span className="text-[10px] opacity-70">{formatDate(note.date)}</span>
                                          </div>
                                          <p className="leading-relaxed">{note.note}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                      Sin feedback registrado.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Histórico Transacciones */}
                              <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <History className="w-4 h-4 text-indigo-500" /> Historial de Operaciones
                                  </h4>
                                </div>
                                <div className="flex-1 bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 overflow-y-auto space-y-2">
                                  {contactTxs.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">Sin transacciones registradas.</div>
                                  ) : (
                                    contactTxs.sort((a,b)=> new Date(b.due_date).getTime() - new Date(a.due_date).getTime()).map(tx => (
                                      <div key={tx.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-sm text-white font-medium truncate pr-2">{tx.description}</p>
                                          <span className={cn('text-sm font-bold whitespace-nowrap', isIncomeTransaction(tx) ? 'text-emerald-400' : 'text-slate-300')}>
                                            {isIncomeTransaction(tx) ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                          <div className="flex gap-2 items-center text-[10px] text-slate-500">
                                            <span className={cn("px-1.5 py-0.5 rounded uppercase font-bold", 
                                              tx.status === 'settled' ? 'bg-emerald-500/20 text-emerald-400' :
                                              tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800'
                                            )}>{tx.status}</span>
                                            <span>{formatDate(tx.paid_date || tx.due_date)}</span>
                                          </div>
                                          {tx.status === 'settled' && (
                                            <button
                                              onClick={() => setShowReceipt({ tx, contact: c })}
                                              className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded"
                                            >
                                              <FileText className="w-3 h-3" /> Ver Comprobante
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Formulario (Side Drawer) */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  {editingContact ? 'Editar Perfil de Contacto' : 'Nuevo Contacto'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-8">
                  {/* Info Principal */}
                  <section>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" /> Información Principal
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 block mb-1.5 font-medium">Nombre completo / Razón Social *</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5 font-medium">Correo Electrónico (Principal)</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5 font-medium">Método de pago habitual</label>
                        <select value={preferredMethod} onChange={e => setPreferredMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none">
                          <option value="transfer">Transferencia</option>
                          <option value="cash">Efectivo</option>
                          <option value="card">Tarjeta</option>
                          <option value="check">Cheque</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-slate-800/50" />

                  {/* Teléfonos y Direcciones */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Teléfonos */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Teléfonos
                        </h4>
                        <button type="button" onClick={addPhone} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Añadir</button>
                      </div>
                      <div className="space-y-3">
                        {phones.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                            <div className="flex-1 space-y-2">
                              <input type="text" placeholder="Número (ej. 5512345678)" value={p.number} onChange={e => updatePhone(i, 'number', e.target.value)} className="w-full bg-transparent border-b border-slate-700 px-1 py-1 text-sm text-white focus:border-emerald-500 outline-none" />
                              <div className="flex gap-2">
                                <select value={p.type} onChange={e => updatePhone(i, 'type', e.target.value)} className="bg-slate-800 text-xs text-white rounded px-1 py-1 outline-none">
                                  <option value="móvil">Móvil</option>
                                  <option value="casa">Casa</option>
                                  <option value="trabajo">Trabajo</option>
                                  <option value="otro">Otro</option>
                                </select>
                                <input type="text" placeholder="Descripción (opcional)" value={p.description || ''} onChange={e => updatePhone(i, 'description', e.target.value)} className="w-full bg-transparent border-b border-slate-700 px-1 py-1 text-xs text-slate-400 focus:text-white outline-none" />
                              </div>
                            </div>
                            <button type="button" onClick={() => removePhone(i)} className="text-red-400/50 hover:text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Direcciones */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Direcciones
                        </h4>
                        <button type="button" onClick={addAddress} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Añadir</button>
                      </div>
                      <div className="space-y-3">
                        {addresses.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                            <div className="flex-1 space-y-2">
                              <textarea placeholder="Calle, número, colonia, CP, Ciudad..." value={a.address} onChange={e => updateAddress(i, 'address', e.target.value)} rows={2} className="w-full bg-transparent border-b border-slate-700 px-1 py-1 text-sm text-white focus:border-emerald-500 outline-none resize-none" />
                              <select value={a.type} onChange={e => updateAddress(i, 'type', e.target.value)} className="bg-slate-800 text-xs text-white rounded px-1 py-1 outline-none w-full">
                                <option value="oficina">Oficina</option>
                                <option value="fiscal">Fiscal</option>
                                <option value="entrega">Entrega</option>
                                <option value="casa">Casa</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>
                            <button type="button" onClick={() => removeAddress(i)} className="text-red-400/50 hover:text-red-400 p-1"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-slate-800/50" />

                  {/* Cuentas Bancarias */}
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Landmark className="w-4 h-4" /> Cuentas Bancarias
                      </h4>
                      <button type="button" onClick={addBankAccount} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Añadir Cuenta</button>
                    </div>
                    <div className="space-y-4">
                      {bankAccounts.map((b, i) => (
                        <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 relative">
                          <button type="button" onClick={() => removeBankAccount(i)} className="absolute top-4 right-4 text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                            <div>
                              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Banco</label>
                              <input type="text" placeholder="Ej. BBVA, Nu, Santander" value={b.bank_name} onChange={e => updateBankAccount(i, 'bank_name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Alias / Titular (Opcional)</label>
                              <input type="text" placeholder="Ej. Cuenta Fiscal, Esposa, etc." value={b.alias || ''} onChange={e => updateBankAccount(i, 'alias', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Número de Cuenta</label>
                              <input type="text" placeholder="10 o 16 dígitos" value={b.account_number || ''} onChange={e => updateBankAccount(i, 'account_number', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">CLABE Interbancaria</label>
                              <input type="text" placeholder="18 dígitos" value={b.clabe || ''} onChange={e => updateBankAccount(i, 'clabe', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  <div className="h-px bg-slate-800/50" />

                  {/* Feedback y Reputación */}
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Historial de Reputación / Notas
                      </h4>
                      <button type="button" onClick={addReputation} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5"/> Añadir Nota</button>
                    </div>
                    <div className="space-y-3">
                      {reputationNotes.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                          <select value={r.type} onChange={e => updateReputation(i, 'type', e.target.value)} className={cn("text-xs rounded-lg px-2 py-1.5 outline-none font-medium border", r.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : r.type === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-300 border-slate-700')}>
                            <option value="neutral">Neutral</option>
                            <option value="positive">Aprobado (+)</option>
                            <option value="negative">Problema (-)</option>
                          </select>
                          <textarea placeholder="Ej. Hubo retrasos en la entrega, Excelente servicio en 2024..." value={r.note} onChange={e => updateReputation(i, 'note', e.target.value)} rows={2} className="flex-1 bg-transparent border-b border-slate-700 px-2 py-1 text-sm text-white focus:border-emerald-500 outline-none resize-none" />
                          <button type="button" onClick={() => removeReputation(i)} className="text-red-400/50 hover:text-red-400 p-2"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  </section>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancelar</button>
                <button type="submit" form="contact-form" className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5">Guardar Contacto</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Visor de Recibo Premium */}
      {showReceipt && (
        <ReceiptReport
          transaction={showReceipt.tx}
          contact={showReceipt.contact}
          onClose={() => setShowReceipt(null)}
        />
      )}
    </div>
  );
}
