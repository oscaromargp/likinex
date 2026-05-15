'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Plus, Trash2, FileText, Check, AlertCircle } from 'lucide-react';
import { Transaction, Entity, RecurrenceType, CATEGORY_LABELS, ENTITY_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SettingsProps {
  transactions: Transaction[];
  onImport: (transactions: Partial<Transaction>[]) => void;
  onExport: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export default function Settings({ 
  transactions, 
  onImport, 
  onExport, 
  categories, 
  onAddCategory,
  onDeleteCategory 
}: SettingsProps) {
  const [newCategory, setNewCategory] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const importedTransactions: Partial<Transaction>[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          
          if (row.description && row.amount) {
            importedTransactions.push({
              entity: (row.entity as Entity) || 'oscaromargp',
              description: row.description,
              amount: parseFloat(row.amount) || 0,
              due_date: row.due_date || new Date().toISOString().split('T')[0],
              status: (row.status as Transaction['status']) || 'pending',
              recurrence: (row.recurrence as RecurrenceType) || 'monthly',
              notes: row.notes || ''
            });
          }
        }
        
        onImport(importedTransactions);
        setImportStatus({ type: 'success', message: `Se importaron ${importedTransactions.length} transacciones exitosamente` });
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Error al procesar el archivo. Asegúrate de que el formato sea correcto.' });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = 'entity,description,amount,due_date,recurrence,status,notes\noscaromargp,Ejemplo de pago,1000.00,2026-06-15,monthly,pending,Notas opcionales';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_likinex.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const defaultCategories = [
    'servicios', 'renta', 'servicio', 'suscription', 'telefonia', 
    'servicios_basicos', 'dominio', 'vps', 'limpieza', 'pension', 'tarjeta', 'otro'
  ];

  const allCategories = [...new Set([...defaultCategories, ...categories])];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Configuración</h3>
        <p className="text-slate-400">Administra tus datos, importa/exporta plantillas y gestiona categorías.</p>
      </div>

      {/* Import/Export Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Importar Pagos</h4>
              <p className="text-sm text-slate-400">Carga pagos desde un archivo CSV</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              Seleccionar Archivo CSV
            </button>
            
            <button
              onClick={downloadTemplate}
              className="w-full py-3 px-4 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Plantilla
            </button>
          </div>

          {importStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                importStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {importStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm">{importStatus.message}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Exportar Datos</h4>
              <p className="text-sm text-slate-400">Descarga todas tus transacciones</p>
            </div>
          </div>
          
          <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Transacciones totales</span>
              <span className="text-white font-semibold">{transactions.length}</span>
            </div>
          </div>
          
          <button
            onClick={onExport}
            className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar a CSV
          </button>
        </motion.div>
      </div>

      {/* Categories Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Gestión de Categorías</h4>
            <p className="text-sm text-slate-400">Agrega o elimina categorías personalizadas</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nueva categoría..."
            className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCategory.trim()) {
                onAddCategory(newCategory.trim());
                setNewCategory('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newCategory.trim()) {
                onAddCategory(newCategory.trim());
                setNewCategory('');
              }
            }}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            Agregar
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allCategories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
            >
              <span className="text-slate-300 text-sm">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
              </span>
              {!defaultCategories.includes(category) && (
                <button
                  onClick={() => onDeleteCategory(category)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
      >
        <h4 className="text-lg font-semibold text-white mb-4">Información de Datos</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-400">Total de transacciones</span>
            <span className="text-white font-medium">{transactions.length}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
            <span className="text-slate-400">Monto total comprometido</span>
            <span className="text-emerald-400 font-medium">
              {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Pendiente de pago</span>
            <span className="text-amber-400 font-medium">
              {formatCurrency(transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}