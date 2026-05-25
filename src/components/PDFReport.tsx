'use client';

import { Transaction, Entity, TransactionStatus, ENTITY_LABELS, STATUS_LABELS, calculatePunctuality, CATEGORY_LABELS, isIncomeTransaction } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';

interface PDFReportProps {
  transactions: Transaction[];
  dateRange: { start: string | null; end: string | null };
  entityFilter: Entity | 'all';
  categoryFilter?: string | 'all';
  statusFilter?: TransactionStatus | 'all';
  typeFilter?: 'all' | 'income' | 'expense';
  isVisible: boolean;
}

export default function PDFReport({
  transactions,
  dateRange,
  entityFilter,
  categoryFilter = 'all',
  statusFilter = 'all',
  typeFilter = 'all',
  isVisible,
}: PDFReportProps) {
  if (!isVisible) return null;

  const filtered = transactions.filter(t => {
    if ((t as any).isProjection) return false;
    if (entityFilter !== 'all' && t.entity !== entityFilter) return false;
    if (dateRange.start && t.due_date < dateRange.start) return false;
    if (dateRange.end && t.due_date > dateRange.end) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all') {
      const txType = t.type || 'expense';
      if (txType !== typeFilter) return false;
    }
    return true;
  }).sort((a, b) => {
    const da = a.paid_date || a.due_date;
    const db = b.paid_date || b.due_date;
    return da.localeCompare(db);
  });

  const settledTxs = filtered.filter(t => t.status === 'settled');
  const pendingTxs = filtered.filter(t => t.status === 'pending');
  const partialTxs = filtered.filter(t => t.status === 'partial');
  const incomeTxs = filtered.filter(t => isIncomeTransaction(t));
  const expenseTxs = filtered.filter(t => !isIncomeTransaction(t));

  const totalPaid = settledTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalPending = pendingTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalPartial = partialTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = incomeTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const entityLabel = entityFilter === 'all' ? 'Todas las Entidades' : ENTITY_LABELS[entityFilter] || entityFilter;
  const dateLabel = dateRange.start && dateRange.end
    ? `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`
    : 'Todo el historial';

  const filterSummary = [
    entityFilter !== 'all' && `Entidad: ${entityLabel}`,
    categoryFilter !== 'all' && `Categoría: ${CATEGORY_LABELS[categoryFilter as keyof typeof CATEGORY_LABELS] || categoryFilter}`,
    statusFilter !== 'all' && `Estado: ${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS]}`,
    typeFilter !== 'all' && `Tipo: ${typeFilter === 'income' ? 'Ingresos' : 'Egresos'}`,
  ].filter(Boolean).join(' · ') || 'Sin filtros adicionales';

  const now = new Date();
  const reportId = `LKX-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-only, .print-only * { visibility: visible !important; }
          .print-only {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0 !important; margin: 0 !important;
          }
          .no-print { display: none !important; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>

      <div className="print-only">
        <div className="bg-white text-black p-6 max-w-[210mm] mx-auto font-sans text-sm">

          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-5 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">LikinEX</h1>
              <p className="text-gray-600 text-sm">Estado de Cuenta · Orquestador de Liquidez</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Generado</p>
              <p className="font-semibold">{formatDateTime(now.toISOString())}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">{reportId}</p>
            </div>
          </div>

          {/* Período y filtros */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 grid grid-cols-3 gap-3 text-xs">
            <div><span className="text-gray-500">Período:</span> <span className="font-medium">{dateLabel}</span></div>
            <div><span className="text-gray-500">Entidad:</span> <span className="font-medium">{entityLabel}</span></div>
            <div><span className="text-gray-500">Filtros:</span> <span className="font-medium">{filterSummary}</span></div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total Ingresos', value: totalIncome, count: incomeTxs.length, color: 'border-green-300 bg-green-50', text: 'text-green-800' },
              { label: 'Total Egresos', value: totalExpense, count: expenseTxs.length, color: 'border-red-300 bg-red-50', text: 'text-red-800' },
              { label: 'Liquidado', value: totalPaid, count: settledTxs.length, color: 'border-green-200 bg-green-50', text: 'text-green-700' },
              { label: 'Pendiente', value: totalPending + totalPartial, count: pendingTxs.length + partialTxs.length, color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
            ].map(m => (
              <div key={m.label} className={`border rounded-lg p-3 ${m.color}`}>
                <p className="text-xs text-gray-600">{m.label}</p>
                <p className={`text-lg font-bold ${m.text}`}>${m.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500">{m.count} mov.</p>
              </div>
            ))}
          </div>

          {/* Balance neto */}
          <div className={`border-2 rounded-lg p-3 mb-5 flex justify-between items-center ${netBalance >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
            <span className="font-semibold text-gray-700">Balance Neto del Período</span>
            <span className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          {/* Resumen por entidad */}
          {entityFilter === 'all' && (() => {
            const byEntity = Object.keys(ENTITY_LABELS).map(key => {
              const txs = filtered.filter(t => t.entity === key);
              if (txs.length === 0) return null;
              const inc = txs.filter(t => isIncomeTransaction(t)).reduce((s, t) => s + Math.abs(t.amount), 0);
              const exp = txs.filter(t => !isIncomeTransaction(t)).reduce((s, t) => s + Math.abs(t.amount), 0);
              return { key, label: ENTITY_LABELS[key], inc, exp, bal: inc - exp, count: txs.length };
            }).filter(Boolean);
            if (byEntity.length === 0) return null;
            return (
              <div className="mb-5">
                <h3 className="font-bold mb-2">Resumen por Entidad</h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left py-1.5 px-2 border border-gray-200">Entidad</th>
                      <th className="text-right py-1.5 px-2 border border-gray-200">Ingresos</th>
                      <th className="text-right py-1.5 px-2 border border-gray-200">Egresos</th>
                      <th className="text-right py-1.5 px-2 border border-gray-200">Balance</th>
                      <th className="text-center py-1.5 px-2 border border-gray-200">Mov.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byEntity.map(e => e && (
                      <tr key={e.key} className="border-b border-gray-200">
                        <td className="py-1.5 px-2 border border-gray-200 font-medium">{e.label}</td>
                        <td className="py-1.5 px-2 border border-gray-200 text-right text-green-700">${e.inc.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-1.5 px-2 border border-gray-200 text-right text-red-700">${e.exp.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className={`py-1.5 px-2 border border-gray-200 text-right font-semibold ${e.bal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {e.bal >= 0 ? '+' : ''}${e.bal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 px-2 border border-gray-200 text-center">{e.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Detalle de transacciones */}
          <div>
            <h3 className="font-bold mb-2">Detalle de Movimientos ({filtered.length})</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-400">
                  <th className="text-left py-1.5 px-2 border border-gray-200">Fecha Pago / Vence</th>
                  <th className="text-left py-1.5 px-2 border border-gray-200">Descripción · Referencia</th>
                  <th className="text-left py-1.5 px-2 border border-gray-200">Pagador → Receptor</th>
                  <th className="text-right py-1.5 px-2 border border-gray-200">Monto</th>
                  <th className="text-center py-1.5 px-2 border border-gray-200">Estado</th>
                  <th className="text-center py-1.5 px-2 border border-gray-200">Punt.</th>
                  <th className="text-left py-1.5 px-2 border border-gray-200">Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const punctuality = calculatePunctuality(t.due_date, t.paid_date);
                  const isIncome = isIncomeTransaction(t);
                  const attachmentUrl = t.attachment_url?.split(',')[0]?.trim();
                  const isBase64 = attachmentUrl?.startsWith('data:');
                  const payer = isIncome
                    ? (t.payment_destination || t.notes?.substring(0, 30) || '—')
                    : (ENTITY_LABELS[t.entity] || t.entity);
                  const receiver = isIncome
                    ? (ENTITY_LABELS[t.entity] || t.entity)
                    : (t.payment_destination || t.notes?.substring(0, 30) || '—');

                  return (
                    <tr key={t.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {/* Fechas */}
                      <td className="py-1.5 px-2 border border-gray-200 whitespace-nowrap">
                        {t.paid_date ? (
                          <>
                            <span className="text-green-700 font-medium">{formatDate(t.paid_date)}</span>
                            <br />
                            <span className="text-gray-400">Vence: {formatDate(t.due_date)}</span>
                          </>
                        ) : (
                          <span className={t.due_date < new Date().toISOString().split('T')[0] ? 'text-red-700 font-medium' : ''}>
                            {formatDate(t.due_date)}
                          </span>
                        )}
                      </td>
                      {/* Descripción */}
                      <td className="py-1.5 px-2 border border-gray-200">
                        <span className="font-medium">{t.description}</span>
                        {t.category && (
                          <span className="ml-1 text-gray-500">· {CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category}</span>
                        )}
                        {t.notes && (
                          <p className="text-gray-400 text-[10px] mt-0.5 truncate max-w-[140px]">{t.notes}</p>
                        )}
                      </td>
                      {/* Pagador → Receptor */}
                      <td className="py-1.5 px-2 border border-gray-200 text-xs">
                        <span className="font-medium">{payer}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span>{receiver}</span>
                      </td>
                      {/* Monto */}
                      <td className={`py-1.5 px-2 border border-gray-200 text-right font-semibold whitespace-nowrap ${isIncome ? 'text-green-700' : 'text-gray-800'}`}>
                        {isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      {/* Estado */}
                      <td className="py-1.5 px-2 border border-gray-200 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          t.status === 'settled' ? 'bg-green-100 text-green-800' :
                          t.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      {/* Puntualidad */}
                      <td className="py-1.5 px-2 border border-gray-200 text-center">
                        {punctuality ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            punctuality.level === 'on-time' ? 'bg-green-100 text-green-800' :
                            punctuality.level === 'slightly-late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {punctuality.label}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      {/* Comprobante */}
                      <td className="py-1.5 px-2 border border-gray-200 text-xs">
                        {attachmentUrl ? (
                          isBase64 ? (
                            <span className="text-blue-700 italic">Adjunto (imagen/PDF)</span>
                          ) : (
                            <a href={attachmentUrl} className="text-blue-700 underline break-all" target="_blank" rel="noreferrer">
                              {attachmentUrl.length > 40 ? attachmentUrl.substring(0, 40) + '…' : attachmentUrl}
                            </a>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black pt-3 mt-6 flex justify-between text-xs text-gray-500">
            <div>
              <p className="font-semibold">LikinEX — Estado de Cuenta</p>
              <p>Documento generado automáticamente · {reportId}</p>
            </div>
            <div className="text-right">
              <p>{now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-mono">{now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
