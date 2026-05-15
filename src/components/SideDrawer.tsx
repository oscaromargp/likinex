'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, FileText, Clock, CreditCard, Paperclip, Save, Upload, Trash2, Eye, Download, Image as ImageIcon } from 'lucide-react';
import { Transaction, TransactionStatus, PaymentMethod, ENTITY_LABELS, STATUS_LABELS, Currency, CURRENCY_SYMBOLS, convertCurrency, calculatePunctuality, calculateConsecutiveOnTime, getScoreLabel, Attachment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const CURRENCIES: Currency[] = ['MXN', 'USD', 'BTC', 'ETH', 'USDT'];

interface SideDrawerProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (transaction: Transaction) => void;
  allTransactions?: Transaction[];
}

interface AttachmentWithPreview extends Attachment {
  previewUrl?: string;
  base64?: string;
}

export default function SideDrawer({ transaction, isOpen, onClose, onUpdate, allTransactions = [] }: SideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'followup' | 'attachments'>('details');
  const [formData, setFormData] = useState({
    notes: '',
    payment_method: '',
    follow_up: '',
    price_change: 0,
    currency: 'MXN' as Currency,
    displayCurrency: 'MXN' as Currency
  });
  const [attachments, setAttachments] = useState<AttachmentWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentWithPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertAndDisplay = (amount: number, from: Currency, to: Currency) => {
    if (from === to) return amount;
    return convertCurrency(amount, from, to);
  };

  if (!transaction) return null;

  const punctuality = calculatePunctuality(transaction.due_date, transaction.paid_date);
  const consecutiveOnTime = transaction.template_id
    ? calculateConsecutiveOnTime(allTransactions, transaction.template_id)
    : 0;

  const handleSave = () => {
    if (onUpdate) {
      const attachmentUrls = attachments.map(a => a.base64 || a.file_path).join(',');
      onUpdate({
        ...transaction,
        notes: formData.notes || transaction.notes,
        payment_method: formData.payment_method as PaymentMethod || transaction.payment_method,
        price_change: formData.price_change || undefined,
        attachment_url: attachmentUrls || transaction.attachment_url
      });
    }
    onClose();
  };

  const loadAttachments = useCallback(() => {
    if (transaction.attachment_url) {
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
    } else {
      setAttachments([]);
    }
  }, [transaction.id, transaction.attachment_url]);

  const saveAttachments = (newAttachments: AttachmentWithPreview[]) => {
    setAttachments(newAttachments);
    localStorage.setItem(`likinex_attachments_${transaction.id}`, JSON.stringify(newAttachments));
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type === 'application/pdf') return FileText;
    return FileText;
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
    { id: 'details', label: 'Detalles', icon: FileText },
    { id: 'payment', label: 'Pago', icon: CreditCard },
    { id: 'followup', label: 'Seguimiento', icon: Clock },
    { id: 'attachments', label: 'Adjuntos', icon: Paperclip, count: attachments.length }
  ] as const;

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
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
              <div>
                <h2 className="text-lg font-bold text-white">Gestión de Transacción</h2>
                <p className="text-sm text-slate-400">{transaction.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex border-b border-slate-800/50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'attachments') loadAttachments();
                  }}
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

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Entidad</p>
                      <p className="text-white font-medium">{ENTITY_LABELS[transaction.entity]}</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Estado</p>
                      <select
                        value={transaction.status}
                        onChange={e => onUpdate?.({ ...transaction, status: e.target.value as TransactionStatus })}
                        className="w-full bg-transparent text-white font-medium focus:outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">Monto</p>
                      <select
                        value={formData.displayCurrency}
                        onChange={e => setFormData(f => ({ ...f, displayCurrency: e.target.value as Currency }))}
                        className="bg-slate-700/50 text-xs text-white px-2 py-1 rounded-lg border border-slate-600"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                      {CURRENCY_SYMBOLS[formData.displayCurrency]}{convertAndDisplay(transaction.amount, 'MXN', formData.displayCurrency).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {formData.displayCurrency !== 'MXN' && (
                      <p className="text-xs text-slate-500 mt-1">≈ {formatCurrency(transaction.amount)} MXN</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Fecha Límite</p>
                      <p className="text-white font-medium">{formatDate(transaction.due_date)}</p>
                    </div>
                    {transaction.paid_date && (
                      <div className="p-4 bg-slate-800/50 rounded-xl">
                        <p className="text-xs text-slate-400 mb-1">Fecha de Pago</p>
                        <p className="text-white font-medium">{formatDate(transaction.paid_date)}</p>
                      </div>
                    )}
                  </div>

                  {punctuality && (
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 mb-2">Score de Puntualidad</p>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'text-3xl font-bold',
                          punctuality.level === 'on-time' ? 'text-emerald-400' :
                          punctuality.level === 'slightly-late' ? 'text-yellow-400' :
                          'text-red-400'
                        )}>
                          {punctuality.score}/100
                        </div>
                        <div>
                          <p className="text-white font-medium">{getScoreLabel(punctuality.score)}</p>
                          {consecutiveOnTime > 1 && (
                            <p className="text-xs text-emerald-400">{consecutiveOnTime} pagos consecutivos puntuales</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Notas</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Agregar notas..."
                      rows={4}
                      className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Método de Pago</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}
                      className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="transfer">Transferencia</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="check">Cheque</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Cambio de Precio (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="number"
                        value={formData.price_change}
                        onChange={e => setFormData(f => ({ ...f, price_change: Number(e.target.value) }))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Precio original: {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'followup' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Recordatorio de Seguimiento</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="datetime-local"
                        value={formData.follow_up}
                        onChange={e => setFormData(f => ({ ...f, follow_up: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <h4 className="text-amber-400 font-medium mb-2">⚠️ Alerta de Urgencia</h4>
                    <p className="text-sm text-slate-400">
                      Las transacciones pendientes con menos de 72 horas se marcarán como urgentes automáticamente.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-6">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                      isDragging
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700/50 hover:border-slate-600'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-2">
                      {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para subir'}
                    </p>
                    <p className="text-slate-600 text-xs">PDF, PNG, JPG hasta 10MB</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400 font-medium">
                        Archivos adjuntos ({attachments.length})
                      </p>
                      {attachments.map((attachment) => {
                        const FileIcon = getFileIcon(attachment.file_type);
                        const isImage = attachment.file_type.startsWith('image/');
                        return (
                          <motion.div
                            key={attachment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                          >
                            {isImage && attachment.previewUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden">
                                <img
                                  src={attachment.previewUrl}
                                  alt={attachment.file_name}
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileIcon className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">{attachment.file_name}</p>
                                <p className="text-slate-500 text-xs">
                                  {formatFileSize(attachment.file_size)} · {attachment.file_type.split('/')[1]?.toUpperCase()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {isImage && (
                                  <button
                                    onClick={() => setPreviewAttachment(attachment)}
                                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => downloadAttachment(attachment)}
                                  className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteAttachment(attachment.id)}
                                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800/50">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </motion.div>

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
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                  <p className="text-white text-sm mt-3 text-center">{previewAttachment.file_name}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}