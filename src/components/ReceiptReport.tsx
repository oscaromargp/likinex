'use client';

import { useEffect } from 'react';
import { Transaction, Contact, ENTITY_LABELS, STATUS_LABELS, CATEGORY_LABELS, generateCEP, isIncomeTransaction, PaymentReceipt } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ShieldCheck, Download, Printer, X, Landmark, FileText, CheckCircle2 } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptReportProps {
  transaction: Transaction;
  contact?: Contact;
  receipts?: PaymentReceipt[];
  onClose: () => void;
}

export default function ReceiptReport({ transaction, contact, receipts = [], onClose }: ReceiptReportProps) {
  const isIncome = isIncomeTransaction(transaction);
  const amount = Math.abs(transaction.amount);
  const cep = generateCEP(transaction.id, contact?.id);
  const now = new Date();

  const payments = receipts.length > 0 ? receipts : [{
    id: `cep-${Date.now()}`,
    transaction_id: transaction.id,
    contact_id: contact?.id,
    cep,
    amount,
    paid_date: transaction.paid_date || now.toISOString(),
    method: transaction.payment_method || 'transfer',
    bank_id: '',
    reference: transaction.payment_destination,
    created_at: now.toISOString()
  }];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const isPartial = totalPaid < amount;
  const progressPercent = Math.min(100, Math.round((totalPaid / amount) * 100));

  // Prevenir scroll en body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #receipt-content, #receipt-content * { visibility: visible; }
            #receipt-content { position: absolute; left: 0; top: 0; width: 100%; height: 100%; box-shadow: none !important; border: none !important; }
            @page { margin: 15mm; size: A4; }
            .no-print { display: none !important; }
          }
        `}</style>
        
        {/* Backdrop for click outside */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 no-print" 
          onClick={onClose} 
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[210mm] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl shadow-2xl bg-white print:h-auto print:max-h-none print:overflow-visible"
        >
            {/* Header de controles (No imprimible) */}
            <div className="no-print sticky top-0 z-10 bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Comprobante Seguro
              </h3>
              <div className="flex gap-2">
                {contact && contact.phones && contact.phones.length > 0 && (
                  <button 
                    onClick={() => {
                      const phone = contact.phones![0].number.replace(/\D/g, '');
                      const message = encodeURIComponent(
                        `✅ *Pago Confirmado - LikinEX*\n\n` +
                        `📋 *Concepto:* ${transaction.description}\n` +
                        `💰 *Monto:* ${formatCurrency(Math.abs(transaction.amount))} MXN\n` +
                        `📅 *Fecha:* ${formatDate(transaction.paid_date || transaction.due_date)}\n` +
                        `🔖 *Folio:* ${cep}\n\n` +
                        `_Comprobante generado automáticamente por LikinEX_`
                      );
                      window.open(`https://wa.me/52${phone}?text=${message}`, '_blank');
                    }} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Icon icon="mdi:whatsapp" className="w-5 h-5" /> Enviar por WhatsApp
                  </button>
                )}
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

          {/* Contenido Imprimible */}
          <div id="receipt-content" className="bg-white text-slate-900 p-8 sm:p-12 relative overflow-hidden">
            {/* Elemento Decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none" />

            {/* Cabecera */}
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Landmark className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">LikinEX</h1>
                  <p className="text-sm font-medium text-emerald-600 uppercase tracking-widest">Comprobante de Operación</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Folio CEP</p>
                <p className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded-md text-slate-700">{cep}</p>
                <div className="mt-3">
                  <p className="text-xs text-slate-400 font-medium">Fecha de Emisión</p>
                  <p className="font-semibold text-sm text-slate-700">{now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} - {now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* Banner de Monto */}
            <div className={`rounded-2xl p-6 mb-8 flex justify-between items-center relative overflow-hidden shadow-sm border ${isIncome ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="relative z-10">
                <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${isIncome ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isIncome ? 'Recibo de Ingreso' : 'Comprobante de Egreso'}
                </p>
                <p className={`text-4xl font-extrabold tracking-tight ${isIncome ? 'text-emerald-700' : 'text-slate-900'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(amount)} <span className="text-lg text-slate-400 font-medium ml-1">MXN</span>
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${isPartial ? 'text-amber-500' : 'text-emerald-500'}`} />
                  <span className={`font-semibold ${isPartial ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isPartial ? 'Pago Parcial Liquidado' : 'Liquidado Exitosamente'}
                  </span>
                </div>
              </div>
              
              {/* Gráfica Circular Simple SVG */}
              <div className="relative w-24 h-24 z-10 hidden sm:block">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isPartial ? "text-amber-500" : "text-emerald-500"}
                    strokeWidth="3"
                    strokeDasharray={`${progressPercent}, 100`}
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-slate-700 leading-none">{progressPercent}%</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Pagado</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Detalles de la Transacción */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Información de la Operación</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs text-slate-500 font-medium">Concepto</dt>
                    <dd className="font-semibold text-slate-900">{transaction.description}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-slate-500 font-medium">Categoría</dt>
                      <dd className="font-semibold text-slate-900">{CATEGORY_LABELS[transaction.category as keyof typeof CATEGORY_LABELS] || transaction.category || 'General'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500 font-medium">Entidad Origen</dt>
                      <dd className="font-semibold text-slate-900">{ENTITY_LABELS[transaction.entity] || transaction.entity}</dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-slate-500 font-medium">Fecha Programada</dt>
                      <dd className="font-semibold text-slate-900">{formatDate(transaction.due_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500 font-medium">Fecha de Liquidación</dt>
                      <dd className="font-semibold text-slate-900">{transaction.paid_date ? formatDate(transaction.paid_date) : formatDate(now.toISOString())}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Beneficiario / Contacto */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
                  {isIncome ? 'Remitente / Cliente' : 'Destinatario / Beneficiario'}
                </h3>
                {contact ? (
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500 font-medium">Nombre / Razón Social</dt>
                      <dd className="font-semibold text-slate-900">{contact.name}</dd>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {contact.bank_name && (
                        <div>
                          <dt className="text-xs text-slate-500 font-medium">Institución Bancaria</dt>
                          <dd className="font-semibold text-slate-900">{contact.bank_name}</dd>
                        </div>
                      )}
                      {(contact.bank_clabe || contact.bank_account) && (
                        <div>
                          <dt className="text-xs text-slate-500 font-medium">{contact.bank_clabe ? 'CLABE' : 'Cuenta'}</dt>
                          <dd className="font-mono text-sm font-semibold text-slate-900">{contact.bank_clabe || contact.bank_account}</dd>
                        </div>
                      )}
                    </div>
                    {contact.phones && contact.phones.length > 0 && (
                      <div>
                        <dt className="text-xs text-slate-500 font-medium">Contacto</dt>
                        <dd className="font-semibold text-slate-900">{contact.phones[0].number}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="h-full flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500 text-center">Datos del beneficiario no proporcionados o no vinculados a un contacto.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Desglose de Parcialidades */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Desglose de Pagos y Parcialidades
              </h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100/50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Método</th>
                      <th className="px-4 py-3 font-semibold hidden sm:table-cell">Referencia</th>
                      <th className="px-4 py-3 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-medium">{formatDate(p.paid_date)}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{p.method}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs hidden sm:table-cell">{p.reference || p.cep.split('-').pop() || 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 text-right">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100/80 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="hidden sm:table-cell"></td>
                      <td className="px-4 py-3 text-right font-bold text-slate-600 text-xs uppercase tracking-wider">Total Amortizado:</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 text-base">{formatCurrency(totalPaid)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {isPartial && (
                <div className="mt-3 flex justify-end">
                  <p className="text-sm font-medium text-slate-500">
                    Monto Restante: <span className="font-bold text-amber-600 ml-1">{formatCurrency(amount - totalPaid)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Justificación o Notas (Si el pago fue fuera de límite) */}
            {(transaction.notes || transaction.late_justification) && (
              <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notas Operativas</h3>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  {transaction.late_justification ? `Justificación de Prórroga: ${transaction.late_justification}` : transaction.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-center text-xs text-slate-400">
              <div>
                <p className="font-bold text-slate-600">LikinEX - Advanced Liquidity Orchestrator</p>
                <p className="mt-1 text-slate-500">Documento electrónico generado automáticamente. No requiere firma autógrafa.</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{cep}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}