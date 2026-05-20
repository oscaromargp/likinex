'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MapPin, CreditCard, Copy, Check, Edit2, Trash2, X, Globe, User, Landmark, FileText, History, AlertTriangle, ShieldCheck, Mail, Link as LinkIcon, Building2, Tag, Image as ImageIcon, Camera, Hash } from 'lucide-react';
import { Icon } from '@iconify/react';
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

export default function Contacts({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onCreateTransactionForContact,
  transactions = []
}: ContactsProps) {
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info'|'banks'|'history'>('info');
  const [showReceipt, setShowReceipt] = useState<{ tx: Transaction; contact: Contact } | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [phones, setPhones] = useState<PhoneNumber[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reputationNotes, setReputationNotes] = useState<ReputationNote[]>([]);
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');

  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.notes?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = tagFilter ? c.tags?.includes(tagFilter) : true;
    return matchesSearch && matchesTag;
  });

  const getContactTransactions = (contactId: string) => {
    return transactions.filter(t => t.contact_id === contactId);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName(''); setEmail(''); setPreferredMethod('transfer'); setNotes('');
    setPhotoUrl(''); setTags([]); setNewTag('');
    setBankAccounts([]); setPhones([]); setAddresses([]); setReputationNotes([]);
    setWebsite(''); setFacebook('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setName(c.name); setEmail(c.email || ''); setPreferredMethod(c.payment_method_preferred || 'transfer');
    setNotes(c.notes || ''); setPhotoUrl((c as any).photo_url || '');
    setTags(c.tags || []); setNewTag('');
    
    const cBanks = c.bank_accounts || [];
    if (cBanks.length === 0 && (c.bank_name || c.bank_account || c.bank_clabe)) {
      cBanks.push({ bank_name: c.bank_name || 'Banco', account_number: c.bank_account, clabe: c.bank_clabe });
    }
    setBankAccounts(cBanks);

    const cPhones = c.phones || [];
    if (cPhones.length === 0 && c.phone) cPhones.push({ number: c.phone, type: 'móvil' });
    setPhones(cPhones);

    const cAddrs = c.addresses || [];
    if (cAddrs.length === 0 && c.address) cAddrs.push({ address: c.address, type: 'casa' });
    setAddresses(cAddrs);

    setReputationNotes(c.reputation_notes || []);
    setWebsite(c.digital_presence?.website || ''); setFacebook(c.digital_presence?.facebook || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contactData: Contact = {
      id: editingContact ? editingContact.id : `contact_${Date.now()}`,
      name, email: email || undefined,
      bank_accounts: bankAccounts, phones, addresses, reputation_notes: reputationNotes,
      digital_presence: { website, facebook },
      payment_method_preferred: preferredMethod,
      notes: notes || undefined,
      tags: tags,
      created_at: editingContact ? editingContact.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photo_url: photoUrl || undefined
    } as any;

    if (editingContact) { onUpdateContact(contactData); } else { onAddContact(contactData); }
    setIsFormOpen(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const addBankAccount = () => setBankAccounts([...bankAccounts, { bank_name: '', account_number: '', clabe: '' }]);
  const updateBankAccount = (idx: number, field: keyof BankAccount, val: string) => {
    const updated = [...bankAccounts]; updated[idx] = { ...updated[idx], [field]: val }; setBankAccounts(updated);
  };
  const removeBankAccount = (idx: number) => setBankAccounts(bankAccounts.filter((_, i) => i !== idx));

  const addPhone = () => setPhones([...phones, { number: '', type: 'móvil' }]);
  const updatePhone = (idx: number, field: keyof PhoneNumber, val: string) => {
    const updated = [...phones]; updated[idx] = { ...updated[idx], [field]: val }; setPhones(updated);
  };
  const removePhone = (idx: number) => setPhones(phones.filter((_, i) => i !== idx));

  const addAddress = () => setAddresses([...addresses, { address: '', type: 'oficina' }]);
  const updateAddress = (idx: number, field: keyof Address, val: string) => {
    const updated = [...addresses]; updated[idx] = { ...updated[idx], [field]: val }; setAddresses(updated);
  };
  const removeAddress = (idx: number) => setAddresses(addresses.filter((_, i) => i !== idx));

  const addReputation = () => setReputationNotes([{ id: `rep_${Date.now()}`, date: new Date().toISOString(), note: '', type: 'neutral' }, ...reputationNotes]);
  const updateReputation = (idx: number, field: keyof ReputationNote, val: string) => {
    const updated = [...reputationNotes]; updated[idx] = { ...updated[idx], [field]: val }; setReputationNotes(updated);
  };
  const removeReputation = (idx: number) => setReputationNotes(reputationNotes.filter((_, i) => i !== idx));

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Buscar contacto, etiqueta..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50" />
        </div>
        <button onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20">
          <Plus className="w-4 h-4" /> Nuevo Contacto
        </button>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setTagFilter(null)}
            className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", !tagFilter ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white")}>
            Todos
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", tagFilter === tag ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white")}>
              <Tag className="w-3 h-3" /> {tag}
            </button>
          ))}
        </div>
      )}

      {/* Contacts Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
            <User className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No se encontraron contactos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContacts.map(c => {
              const contactTxs = getContactTransactions(c.id);
              const allPhones = c.phones || (c.phone ? [{ number: c.phone, type: 'móvil' as const }] : []);
              const negativeReps = c.reputation_notes?.filter(r => r.type === 'negative').length || 0;
              const photoUrl = (c as any).photo_url;

              return (
                <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedContact(c)}
                  className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {photoUrl ? (
                        <img src={photoUrl} alt={c.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-700/50" />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-xl border border-slate-700/50">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {negativeReps > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-sm leading-tight truncate">{c.name}</h3>
                      {allPhones[0] && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500/70" /> {allPhones[0].number}
                        </p>
                      )}
                      {c.tags && c.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded-full">{tag}</span>
                          ))}
                          {c.tags.length > 3 && <span className="text-[10px] text-slate-500">+{c.tags.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">{contactTxs.length} operaciones</span>
                    <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalle →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Screen Contact Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedContact(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="fixed inset-4 sm:inset-8 bg-slate-900 border border-slate-700/50 rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-4">
                  {(selectedContact as any).photo_url ? (
                    <img src={(selectedContact as any).photo_url} alt={selectedContact.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/30" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-2xl border border-emerald-500/30">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedContact.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs rounded-full flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onCreateTransactionForContact && (
                    <button onClick={() => { onCreateTransactionForContact(selectedContact); setSelectedContact(null); }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Nuevo Pago
                    </button>
                  )}
                  <button onClick={() => { handleOpenEdit(selectedContact); setSelectedContact(null); }}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => { onDeleteContact(selectedContact.id); setSelectedContact(null); }}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedContact(null)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                {[
                  { id: 'info', label: 'Informacion', icon: User },
                  { id: 'banks', label: 'Cuentas Bancarias', icon: Landmark },
                  { id: 'history', label: 'Historial', icon: History }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={cn("flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                      activeTab === tab.id ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5" : "text-slate-400 hover:text-white")}>
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-500" /> Telefonos
                        </h4>
                        <div className="space-y-2">
                          {(selectedContact.phones || []).length === 0 ? <p className="text-xs text-slate-500">Sin telefonos</p> : null}
                          {(selectedContact.phones || []).map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                              <div>
                                <span className="text-white text-sm font-medium">{p.number}</span>
                                <span className="text-[10px] text-slate-500 ml-2 uppercase">{p.type}</span>
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
                          {(selectedContact.addresses || []).length === 0 ? <p className="text-xs text-slate-500">Sin direcciones</p> : null}
                          {(selectedContact.addresses || []).map((a, i) => (
                            <div key={i} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                              <span className="text-[10px] text-emerald-500/70 uppercase font-semibold">{a.type}</span>
                              <p className="text-white text-sm mt-1">{a.address}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-500" /> Presencia Digital
                        </h4>
                        <div className="space-y-2">
                          {selectedContact.email && (
                            <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-3 text-sm text-slate-300 hover:text-white bg-slate-950/30 p-3 rounded-lg transition-colors">
                              <Mail className="w-4 h-4 text-slate-400" /> {selectedContact.email}
                            </a>
                          )}
                          {selectedContact.digital_presence?.website && (
                            <a href={selectedContact.digital_presence.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-400 bg-slate-950/30 p-3 rounded-lg transition-colors">
                              <LinkIcon className="w-4 h-4" /> {selectedContact.digital_presence.website}
                            </a>
                          )}
                        </div>
                      </div>
                      {selectedContact.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-300 mb-2">Notas</h4>
                          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-300 italic">"{selectedContact.notes}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'banks' && (
                  <div className="space-y-4">
                    {(selectedContact.bank_accounts || []).length === 0 ? (
                      <div className="text-center py-10">
                        <Landmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">Sin cuentas bancarias.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(selectedContact.bank_accounts || []).map((b, i) => (
                          <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{b.bank_name || 'Banco'}</h5>
                                {b.alias && <p className="text-[10px] text-slate-500">{b.alias}</p>}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {b.account_number && (
                                <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                                  <span className="text-[11px] text-slate-500">CUENTA</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-sm">{b.account_number}</span>
                                    <button onClick={() => handleCopy(b.account_number!, `b-acc-${i}`)} className="text-slate-500 hover:text-emerald-400">
                                      {copiedId === `b-acc-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {b.clabe && (
                                <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg">
                                  <span className="text-[11px] text-slate-500">CLABE</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-sm">{b.clabe}</span>
                                    <button onClick={() => handleCopy(b.clabe!, `b-clb-${i}`)} className="text-slate-500 hover:text-emerald-400">
                                      {copiedId === `b-clb-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" /> Reputacion
                      </h4>
                      <div className="bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 space-y-3 max-h-[400px] overflow-y-auto">
                        {(selectedContact.reputation_notes || []).length === 0 ? <p className="text-sm text-slate-500 text-center py-8">Sin feedback</p> : null}
                        {(selectedContact.reputation_notes || []).map((note) => (
                          <div key={note.id} className={cn("p-3 rounded-xl border text-sm",
                            note.type === 'positive' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-100" :
                            note.type === 'negative' ? "bg-red-500/10 border-red-500/20 text-red-100" :
                            "bg-slate-800/50 border-slate-700/50 text-slate-300")}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] opacity-70 uppercase">{note.type === 'negative' ? 'Problema' : note.type === 'positive' ? 'Aprobado' : 'Nota'}</span>
                              <span className="text-[10px] opacity-70">{formatDate(note.date)}</span>
                            </div>
                            <p>{note.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-500" /> Operaciones
                      </h4>
                      <div className="bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 space-y-2 max-h-[400px] overflow-y-auto">
                        {getContactTransactions(selectedContact.id).length === 0 ? <p className="text-sm text-slate-500 text-center py-8">Sin operaciones</p> : null}
                        {getContactTransactions(selectedContact.id).sort((a,b)=> new Date(b.due_date).getTime() - new Date(a.due_date).getTime()).map(tx => (
                          <div key={tx.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-white font-medium truncate pr-2">{tx.description}</p>
                              <span className={cn('text-sm font-bold', isIncomeTransaction(tx) ? 'text-emerald-400' : 'text-slate-300')}>
                                {isIncomeTransaction(tx) ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold", 
                                tx.status === 'settled' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>{tx.status}</span>
                              <div className="flex gap-1.5">
                                {tx.status === 'settled' && selectedContact.phones && selectedContact.phones.length > 0 && (
                                  <button onClick={() => {
                                    const phone = selectedContact.phones![0].number.replace(/\D/g, '');
                                    const cep = generateCEP(tx.id, selectedContact.id);
                                    window.open(`https://wa.me/52${phone}?text=${encodeURIComponent(`✅ *Pago Confirmado*\n\n📋 ${tx.description}\n💰 ${formatCurrency(Math.abs(tx.amount))} MXN\n📅 ${formatDate(tx.paid_date || tx.due_date)}\n🔖 ${cep}`)}`, '_blank');
                                  }} className="text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center gap-1">
                                    <Icon icon="mdi:whatsapp" className="w-3 h-3" /> Enviar
                                  </button>
                                )}
                                {tx.status === 'settled' && (
                                  <button onClick={() => setShowReceipt({ tx, contact: selectedContact })} className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Ver</button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Screen Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-3xl bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Photo & Basic Info */}
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-2">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Preview" className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30" />
                      ) : (
                        <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-700">
                          <Camera className="w-8 h-8 text-slate-600" />
                        </div>
                      )}
                      <input type="text" placeholder="URL de foto" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
                        className="w-24 text-[10px] bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-center" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-slate-400 block mb-1.5">Nombre *</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Metodo de pago</label>
                        <select value={preferredMethod} onChange={e => setPreferredMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none">
                          <option value="transfer">Transferencia</option>
                          <option value="cash">Efectivo</option>
                          <option value="card">Tarjeta</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 flex items-center gap-2"><Tag className="w-4 h-4" /> Etiquetas</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full flex items-center gap-1">
                          {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Nueva etiqueta..." value={newTag} onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                      <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl">Agregar</button>
                    </div>
                  </div>

                  {/* Phones */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Phone className="w-4 h-4" /> Telefonos</h4>
                      <button type="button" onClick={addPhone} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Añadir</button>
                    </div>
                    <div className="space-y-2">
                      {phones.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                          <input type="text" placeholder="Numero" value={p.number} onChange={e => updatePhone(i, 'number', e.target.value)} className="flex-1 bg-transparent text-sm text-white outline-none" />
                          <select value={p.type} onChange={e => updatePhone(i, 'type', e.target.value)} className="bg-slate-800 text-xs text-white rounded px-2 py-1 outline-none">
                            <option value="móvil">Móvil</option>
                            <option value="casa">Casa</option>
                            <option value="trabajo">Trabajo</option>
                          </select>
                          <button type="button" onClick={() => removePhone(i)} className="text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank Accounts */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><Landmark className="w-4 h-4" /> Cuentas Bancarias</h4>
                      <button type="button" onClick={addBankAccount} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Añadir</button>
                    </div>
                    <div className="space-y-3">
                      {bankAccounts.map((b, i) => (
                        <div key={i} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 relative">
                          <button type="button" onClick={() => removeBankAccount(i)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                          <div className="grid grid-cols-3 gap-3 pr-8">
                            <input type="text" placeholder="Banco" value={b.bank_name} onChange={e => updateBankAccount(i, 'bank_name', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                            <input type="text" placeholder="Cuenta" value={b.account_number || ''} onChange={e => updateBankAccount(i, 'account_number', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none" />
                            <input type="text" placeholder="CLABE" value={b.clabe || ''} onChange={e => updateBankAccount(i, 'clabe', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Notas</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none resize-none" />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancelar</button>
                <button type="submit" form="contact-form" className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all">Guardar Contacto</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Viewer */}
      {showReceipt && <ReceiptReport transaction={showReceipt.tx} contact={showReceipt.contact} onClose={() => setShowReceipt(null)} />}
    </div>
  );
}
