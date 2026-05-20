'use client';

import { Transaction, Entity, TransactionStatus, ENTITY_LABELS, STATUS_LABELS, calculatePunctuality, CATEGORY_LABELS, isIncomeTransaction, generateCEP } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

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
  isVisible 
}: PDFReportProps) {
  if (!isVisible) return null;

  const filtered = transactions.filter(t => {
    if (entityFilter !== 'all' && t.entity !== entityFilter) return false;
    if (dateRange.start && new Date(t.due_date) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(t.due_date) > new Date(dateRange.end)) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all') {
      const txType = t.type || 'expense';
      if (txType !== typeFilter) return false;
    }
    return true;
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

  const entityLabel = entityFilter === 'all' ? 'Todas las Entidades' : ENTITY_LABELS[entityFilter] || entityFilter;
  const dateLabel = dateRange.start && dateRange.end
    ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
    : 'Todo el historial';

  const filterSummary = [
    entityFilter !== 'all' && `Entidad: ${entityLabel}`,
    categoryFilter !== 'all' && `Categoría: ${CATEGORY_LABELS[categoryFilter as keyof typeof CATEGORY_LABELS] || categoryFilter}`,
    statusFilter !== 'all' && `Estado: ${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS]}`,
    typeFilter !== 'all' && `Tipo: ${typeFilter === 'income' ? 'Ingresos' : 'Egresos'}`
  ].filter(Boolean).join(' | ') || 'Sin filtros adicionales';

  const netBalance = totalIncome - totalExpense;
  const now = new Date();
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-container, .report-container * { visibility: visible; }
          .report-container { position: absolute; left: 0; top: 0; width: 100%; background: white; color: black; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>
      
      <div className="print-only">
        <div className="report-container bg-white text-black p-6 max-w-[210mm] mx-auto font-sans">
          {/* Header del Estado de Cuenta */}
          <div className="border-b-2 border-black pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">LikinEX</h1>
                <p className="text-sm text-gray-600">Estado de Cuenta Bancario</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Fecha de Emisión</p>
                <p className="font-semibold">{now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-gray-500 mt-1">ID Reporte</p>
                <p className="font-mono text-sm">{reportId}</p>
              </div>
            </div>
          </div>

          {/* Resumen del Reporte */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Reporte: {entityLabel}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-600">Período:</span> <span className="font-medium">{dateLabel}</span>
              </div>
              <div>
                <span className="text-gray-600">Transacciones:</span> <span className="font-medium">{filtered.length}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Filtros:</span> <span className="font-medium">{filterSummary}</span>
              </div>
            </div>
          </div>

          {/* Resumen de Ingresos/Egresos y Balance */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-700">Total Ingresos</p>
                <p className="text-xl font-bold text-green-800">${totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-green-600">{incomeTxs.length} transactions</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">Total Egresos</p>
                <p className="text-xl font-bold text-red-800">${totalExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-red-600">{expenseTxs.length} transactions</p>
              </div>
            </div>
            <div className={`border-2 rounded-lg p-3 ${netBalance >= 0 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <p className="text-xs text-gray-600">Balance Neto</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
          </div>

          {/* Resumen de Estados */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700">Liquidado</p>
              <p className="text-xl font-bold text-green-800">${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-600">{settledTxs.length} pagos</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">Pendiente</p>
              <p className="text-xl font-bold text-amber-800">${totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-amber-600">{pendingTxs.length} pagos</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">Parcial</p>
              <p className="text-xl font-bold text-blue-800">${totalPartial.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-blue-600">{partialTxs.length} pagos</p>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-700">Total General</p>
              <p className="text-xl font-bold text-gray-800">${filtered.reduce((sum, t) => sum + Math.abs(t.amount), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Resumen por Entidad (si hay múltiples) */}
          {entityFilter === 'all' && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Resumen por Entidad</h3>
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="text-left py-2 px-3 text-xs font-semibold">Entidad</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold">Ingresos</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold">Egresos</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold">Balance</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold">Trans.</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(ENTITY_LABELS).map(entKey => {
                    const entTxs = filtered.filter(t => t.entity === entKey);
                    if (entTxs.length === 0) return null;
                    const entIncome = entTxs.filter(t => isIncomeTransaction(t)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    const entExpense = entTxs.filter(t => !isIncomeTransaction(t)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    const entBalance = entIncome - entExpense;
                    return (
                      <tr key={entKey} className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">{ENTITY_LABELS[entKey as keyof typeof ENTITY_LABELS]}</td>
                        <td className="py-2 px-3 text-right text-green-700">${entIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right text-red-700">${entExpense.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${entBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                          {entBalance >= 0 ? '+' : '-'}${Math.abs(entBalance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-center">{entTxs.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalle de Transacciones */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Detalle de Transacciones</h3>
            <table className="w-full mb-8 text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 px-2 text-xs font-semibold">Fecha</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold">Descripción</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold">Categoría</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold">Monto</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold">Estado</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold">Puntualidad</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => {
                  const punctuality = calculatePunctuality(t.due_date, t.paid_date);
                  const isIncome = isIncomeTransaction(t);
                  return (
                    <tr key={t.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-3 px-2">{formatDate(t.due_date)}</td>
                      <td className="py-3 px-2 font-medium">{t.description}</td>
                      <td className="py-3 px-2 text-gray-600">
                        {t.category ? CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category : '-'}
                      </td>
                      <td className={`py-3 px-2 text-right font-semibold ${isIncome ? 'text-green-700' : 'text-gray-800'}`}>
                        {isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        <span className={`ml-1 text-xs px-1 py-0.5 rounded ${isIncome ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                          {isIncome ? 'ING' : 'EGR'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          t.status === 'settled' ? 'bg-green-100 text-green-800' :
                          t.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {punctuality ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            punctuality.level === 'on-time' ? 'bg-green-100 text-green-800' :
                            punctuality.level === 'slightly-late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {punctuality.label}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black pt-4">
            <div className="flex justify-between text-xs text-gray-500">
              <div>
                <p className="font-semibold">LikinEX - Estado de Cuenta</p>
                <p>Documento generado automaticamente. ID: {reportId}</p>
              </div>
              <div className="text-right">
                <p>Pagina 1 de 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// This file intentionally has only one export
