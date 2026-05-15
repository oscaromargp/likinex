'use client';

import { Transaction, Entity, TransactionStatus, ENTITY_LABELS, STATUS_LABELS, calculatePunctuality, getScoreLabel } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface PDFReportProps {
  transactions: Transaction[];
  dateRange: { start: string | null; end: string | null };
  entityFilter: Entity | 'all';
  isVisible: boolean;
}

export default function PDFReport({ transactions, dateRange, entityFilter, isVisible }: PDFReportProps) {
  if (!isVisible) return null;

  const filtered = transactions.filter(t => {
    if (entityFilter !== 'all' && t.entity !== entityFilter) return false;
    if (dateRange.start && new Date(t.due_date) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(t.due_date) > new Date(dateRange.end)) return false;
    return true;
  });

  const totalPaid = filtered.filter(t => t.status === 'settled').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = filtered.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const totalCancelled = filtered.filter(t => t.status === 'cancelled').reduce((sum, t) => sum + t.amount, 0);

  const entityLabel = entityFilter === 'all' ? 'Todas las entidades' : ENTITY_LABELS[entityFilter] || entityFilter;
  const dateLabel = dateRange.start && dateRange.end
    ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
    : 'Todo el historial';

  return (
    <div className="print-only hidden">
      <div className="p-8 font-sans">
        <div className="border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LikinEX</h1>
              <p className="text-sm text-gray-600">Orquestador de Liquidez</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Fecha de generación</p>
              <p className="font-semibold">{new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Estado de Cuenta</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Entidad:</span> <span className="font-medium">{entityLabel}</span>
            </div>
            <div>
              <span className="text-gray-600">Período:</span> <span className="font-medium">{dateLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">Total Pagado</p>
            <p className="text-2xl font-bold text-green-800">${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700">Total Pendiente</p>
            <p className="text-2xl font-bold text-amber-800">${totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">Total Cancelado</p>
            <p className="text-2xl font-bold text-red-800">${totalCancelled.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Fecha</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Descripción</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Entidad</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Monto</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Estado</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Puntualidad</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, idx) => {
              const punctuality = calculatePunctuality(t.due_date, t.paid_date);
              return (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="py-3 px-2 text-sm">{formatDate(t.due_date)}</td>
                  <td className="py-3 px-2 text-sm font-medium">{t.description}</td>
                  <td className="py-3 px-2 text-sm">{ENTITY_LABELS[t.entity] || t.entity}</td>
                  <td className="py-3 px-2 text-sm text-right font-semibold">${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      t.status === 'settled' ? 'bg-green-100 text-green-800' :
                      t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-center">
                    {punctuality ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        punctuality.level === 'on-time' ? 'bg-green-100 text-green-800' :
                        punctuality.level === 'slightly-late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {punctuality.label} ({punctuality.score}/100)
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

        <div className="border-t border-gray-300 pt-4 mt-12">
          <div className="flex justify-between text-sm text-gray-500">
            <span>LikinEX - Estado de Cuenta generado automáticamente</span>
            <span>Página 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
