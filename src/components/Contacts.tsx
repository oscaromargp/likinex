'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MapPin, CreditCard, Copy, Check, Edit2, Trash2, X, Globe, User, Landmark } from 'lucide-react';
import { Contact, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

interface ContactsProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onCreateTransactionForContact?: (contact: Contact) => void;
}

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  transfer: '🏦',
  cash: '💵',
  card: '💳',
  check: '📝',
  other: '📦'
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
  onCreateTransactionForContact
}: ContactsProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankClabe, setBankClabe] = useState('');
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.notes?.toLowerCase().includes(search.toLowerCase()) ||
    c.bank_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setBankName('');
    setBankAccount('');
    setBankClabe('');
    setPreferredMethod('transfer');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setBankName(c.bank_name || '');
    setBankAccount(c.bank_account || '');
    setBankClabe(c.bank_clabe || '');
    setPreferredMethod(c.payment_method_preferred || 'transfer');
    setNotes(c.notes || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contactData: Contact = {
      id: editingContact ? editingContact.id : `contact_${Date.now()}`,
      name,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      bank_name: bankName || undefined,
      bank_account: bankAccount || undefined,
      bank_clabe: bankClabe || undefined,
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

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar contacto o cuenta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contacto
        </button>
      </div>

      {/* Grid listing */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
          <p className="text-slate-500 text-sm">No se encontraron contactos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(c => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-lg border border-emerald-500/20">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm leading-tight">{c.name}</h3>
                      {c.notes && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{c.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(c.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-xs">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {c.payment_method_preferred && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-[14px]">{PAYMENT_METHOD_ICONS[c.payment_method_preferred]}</span>
                      <span>Método: {PAYMENT_METHOD_LABELS[c.payment_method_preferred]}</span>
                    </div>
                  )}
                </div>

                {/* Bank / CLABE accounts */}
                {(c.bank_name || c.bank_clabe || c.bank_account) && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
                      <Landmark className="w-3.5 h-3.5 text-emerald-500/70" />
                      <span>Datos de Cuenta / CLABE</span>
                    </div>
                    {c.bank_name && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Banco</span>
                        <span className="text-white font-medium">{c.bank_name}</span>
                      </div>
                    )}
                    {c.bank_account && (
                      <div className="flex justify-between items-center text-xs bg-slate-950/20 p-2 rounded-lg border border-slate-800/40">
                        <span className="text-slate-500">Cuenta</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-mono">{c.bank_account}</span>
                          <button
                            onClick={() => handleCopy(c.bank_account || '', `${c.id}-account`)}
                            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white"
                          >
                            {copiedId === `${c.id}-account` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {c.bank_clabe && (
                      <div className="flex justify-between items-center text-xs bg-slate-950/20 p-2 rounded-lg border border-slate-800/40">
                        <span className="text-slate-500">CLABE</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-mono">{c.bank_clabe}</span>
                          <button
                            onClick={() => handleCopy(c.bank_clabe || '', `${c.id}-clabe`)}
                            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-white"
                          >
                            {copiedId === `${c.id}-clabe` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {onCreateTransactionForContact && (
                <button
                  onClick={() => onCreateTransactionForContact(c)}
                  className="mt-5 w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-emerald-400 hover:text-emerald-300 rounded-xl transition-colors border border-emerald-500/10 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Programar Pago a este contacto
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Drawer / Modal overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">
                    {editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
                  </h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej. CFE Electricidad o Doña Maria"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5 font-medium">Teléfono</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="10 dígitos"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5 font-medium">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Dirección / Notas de ubicación</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Calle, Número, Colonia o Ubicación del servicio"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-4">
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" />
                      Datos Bancarios de Cobro / Pago
                    </p>
                    
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">Nombre del Banco</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="Ej. BBVA, Santander, Nu"
                        className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-medium">Número de Cuenta o Tarjeta</label>
                        <input
                          type="text"
                          value={bankAccount}
                          onChange={e => setBankAccount(e.target.value)}
                          placeholder="10 o 16 dígitos"
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-medium">CLABE Interbancaria</label>
                        <input
                          type="text"
                          value={bankClabe}
                          onChange={e => setBankClabe(e.target.value)}
                          placeholder="18 dígitos"
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Método de pago preferido</label>
                    <select
                      value={preferredMethod}
                      onChange={e => setPreferredMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                    >
                      <option value="transfer">Transferencia</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="check">Cheque</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Notas / Referencias del Beneficiario</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ej: Número de medidor, referencia de pago CFE, horario de cobro, etc."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-sm font-semibold text-white rounded-xl transition-colors shadow-lg shadow-emerald-500/10"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
