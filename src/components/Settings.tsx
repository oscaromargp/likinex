'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Plus, Trash2, FileText, Check, AlertCircle, Moon, Sun, Monitor, FileSpreadsheet, Eye, Table } from 'lucide-react';
import { Transaction, Entity, RecurrenceType, CATEGORY_LABELS, ENTITY_LABELS, EntityConfig, DEFAULT_ENTITIES, ENTITY_COLORS_MAP, AVAILABLE_COLORS, COMMON_EMOJIS, STATUS_LABELS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Theme, useTheme } from '@/hooks/useTheme';

interface SettingsProps {
  transactions: Transaction[];
  onImport: (transactions: Partial<Transaction>[]) => void;
  onExport: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  entities: EntityConfig[];
  onAddEntity: (entity: Omit<EntityConfig, 'id'>) => void;
  onUpdateEntity: (entity: EntityConfig) => void;
  onDeleteEntity: (id: string) => void;
}

const TEMPLATE_CSV = `entity,description,amount,due_date,status,recurrence,category,type,notes,bank
oscaromargp,Pensión Alimenticia 1a Quincena,4000,2026-06-01,pending,semi_monthly,pension,expense,Pago puntual favor,banorte
oscaromargp,Pensión Alimenticia 2a Quincena,4000,2026-06-15,pending,semi_monthly,pension,expense,Pago puntual favor,banorte
tulum,Renta Vacacional Tulum,28000,2026-06-05,settled,monthly,renta,income,Depósito mensual,-6500
oscaromargp,Renta Oficina Principal,7500,2026-06-24,pending,monthly,renta,expense,Transferir a Bancomer,bancomer`;

const TEMPLATE_COLUMNS = [
  { name: 'entity', desc: 'Identificador de la entidad', example: 'oscaromargp, tulum, paypaps' },
  { name: 'description', desc: 'Descripción del pago', example: 'Renta, CFE, Pensión' },
  { name: 'amount', desc: 'Monto (positivo=egreso, negativo=ingreso)', example: '4000 o -28000' },
  { name: 'due_date', desc: 'Fecha de vencimiento (YYYY-MM-DD)', example: '2026-06-15' },
  { name: 'status', desc: 'Estado: pending, settled, partial, cancelled', example: 'pending' },
  { name: 'recurrence', desc: 'Recurrencia: none, weekly, monthly, semi_monthly, bimonthly, quarterly, yearly', example: 'monthly' },
  { name: 'category', desc: 'Categoría: pension, renta, telefonia, etc.', example: 'pension' },
  { name: 'type', desc: 'Tipo: income o expense', example: 'expense' },
  { name: 'notes', desc: 'Notas opcionales', example: 'Pago puntual' },
  { name: 'bank', desc: 'Banco destino (opcional)', example: 'banorte, bbva' },
];

export default function Settings({ 
  transactions, 
  onImport, 
  onExport, 
  categories, 
  onAddCategory,
  onDeleteCategory,
  entities,
  onAddEntity,
  onUpdateEntity,
  onDeleteEntity
}: SettingsProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [newCategory, setNewCategory] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityIcon, setNewEntityIcon] = useState('💼');
  const [newEntityColor, setNewEntityColor] = useState('emerald');
  const [editingEntity, setEditingEntity] = useState<EntityConfig | null>(null);
  const [showTemplateGuide, setShowTemplateGuide] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);

  const themeOptions: { id: Theme; label: string; icon: typeof Moon; description: string }[] = [
    { id: 'dark', label: 'Oscuro', icon: Moon, description: 'Tema oscuro' },
    { id: 'light', label: 'Claro', icon: Sun, description: 'Tema claro' },
    { id: 'system', label: 'Sistema', icon: Monitor, description: 'Según el sistema' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        
        if (lines.length < 2) {
          setImportStatus({ type: 'error', message: 'El archivo debe tener encabezados y al menos una fila de datos.' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const importedTransactions: Partial<Transaction>[] = [];
        const previewRows: string[][] = [headers];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
          
          if (values.length >= headers.length) {
            previewRows.push(values);
          }
          
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          
          if (row.description && row.amount) {
            const amount = parseFloat(row.amount) || 0;
            importedTransactions.push({
              entity: (row.entity as Entity) || 'oscaromargp',
              description: row.description,
              amount: amount,
              due_date: row.due_date || new Date().toISOString().split('T')[0],
              status: (row.status as Transaction['status']) || 'pending',
              recurrence: (row.recurrence as RecurrenceType) || 'none',
              category: (row.category as any) || undefined,
              type: (row.type as 'income' | 'expense') || (amount < 0 ? 'income' : 'expense'),
              notes: row.notes || '',
              payment_destination: row.bank || undefined,
            });
          }
        }
        
        setPreviewData(previewRows.slice(0, 6));
        
        if (importedTransactions.length > 0) {
          onImport(importedTransactions);
          setImportStatus({ type: 'success', message: `Se importaron ${importedTransactions.length} transacciones exitosamente` });
        } else {
          setImportStatus({ type: 'error', message: 'No se encontraron transacciones válidas. Revisa el formato.' });
        }
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Error al procesar el archivo. Asegúrate de que el formato CSV sea correcto.' });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = (withExamples: boolean = true) => {
    const template = withExamples ? TEMPLATE_CSV : 'entity,description,amount,due_date,status,recurrence,category,type,notes,bank';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = withExamples ? 'plantilla_likinex_ejemplos.csv' : 'plantilla_likinex_vacia.csv';
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

      {/* Theme Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Moon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Tema de la Aplicación</h4>
            <p className="text-sm text-slate-400">Personaliza la apariencia de la interfaz</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-6 h-6 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500">{option.description}</span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-slate-800/50 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Tema activo</span>
            <span className="text-emerald-400 font-medium capitalize">
              {resolvedTheme === 'light' ? 'Claro' : 'Oscuro'}
            </span>
          </div>
        </div>
      </motion.div>

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
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Seleccionar Archivo CSV
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadTemplate(true)}
                className="py-2.5 px-3 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Con Ejemplos
              </button>
              <button
                onClick={() => downloadTemplate(false)}
                className="py-2.5 px-3 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Vacía
              </button>
            </div>
            
            <button
              onClick={() => setShowTemplateGuide(!showTemplateGuide)}
              className="w-full py-2.5 px-4 border border-slate-700 text-slate-400 hover:bg-slate-800/50 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showTemplateGuide ? 'Ocultar' : 'Ver'} Guía de Plantilla
            </button>
          </div>

          {showTemplateGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            >
              <h5 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Table className="w-4 h-4" />
                Columnas de la Plantilla
              </h5>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {TEMPLATE_COLUMNS.map((col, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 bg-slate-900/50 rounded-lg">
                    <code className="text-blue-400 text-xs font-mono min-w-[100px]">{col.name}</code>
                    <div className="flex-1">
                      <p className="text-slate-300 text-xs">{col.desc}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Ej: {col.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {previewData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            >
              <h5 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Vista Previa ({previewData.length - 1} registros)
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {previewData[0].map((h, i) => (
                        <th key={i} className="text-left p-2 text-slate-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(1).map((row, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        {row.map((cell, j) => (
                          <td key={j} className="p-2 text-slate-300 truncate max-w-[100px]">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

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

      {/* Entity Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🏢</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">Gestión de Entidades</h4>
            <p className="text-sm text-slate-400">Administra las entidades con iconos y colores personalizados</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Nombre</label>
            <input
              type="text"
              value={editingEntity ? editingEntity.name : newEntityName}
              onChange={(e) => editingEntity ? setEditingEntity({...editingEntity, name: e.target.value}) : setNewEntityName(e.target.value)}
              placeholder="Nombre de la entidad..."
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Icono</label>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 flex items-center gap-2"
              >
                <span className="text-xl">{editingEntity ? editingEntity.icon : newEntityIcon}</span>
                <span className="text-slate-500 text-sm">Seleccionar</span>
              </button>
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-xl grid grid-cols-5 gap-2 z-10 shadow-xl">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        if (editingEntity) {
                          setEditingEntity({...editingEntity, icon: emoji});
                        } else {
                          setNewEntityIcon(emoji);
                        }
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl hover:bg-slate-700 p-2 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => editingEntity ? setEditingEntity({...editingEntity, color}) : setNewEntityColor(color)}
                className={`w-8 h-8 rounded-lg ${ENTITY_COLORS_MAP[color]} border-2 ${(editingEntity ? editingEntity.color : newEntityColor) === color ? 'border-white' : 'border-transparent'} transition-all`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {editingEntity ? (
            <>
              <button
                onClick={() => {
                  if (editingEntity.name.trim()) {
                    onUpdateEntity(editingEntity);
                    setEditingEntity(null);
                  }
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
              >
                Actualizar
              </button>
              <button
                onClick={() => setEditingEntity(null)}
                className="px-6 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (newEntityName.trim()) {
                  onAddEntity({
                    name: newEntityName.trim(),
                    icon: newEntityIcon,
                    color: newEntityColor,
                    is_active: true,
                  });
                  setNewEntityName('');
                  setNewEntityIcon('💼');
                  setNewEntityColor('emerald');
                }
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              Agregar Entidad
            </button>
          )}
        </div>

        <div className="space-y-3">
          {entities.map((entity) => (
            <div
              key={entity.id}
              className={`flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border ${entity.is_active ? 'border-slate-700/50' : 'border-slate-700/30 opacity-60'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${ENTITY_COLORS_MAP[entity.color] || 'bg-slate-500/20'} rounded-lg flex items-center justify-center`}>
                  <span className="text-xl">{entity.icon}</span>
                </div>
                <div>
                  <span className="text-white font-medium">{entity.name}</span>
                  <p className="text-slate-500 text-xs">{entity.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateEntity({...entity, is_active: !entity.is_active})}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${entity.is_active ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                  {entity.is_active ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => setEditingEntity(entity)}
                  className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                {!DEFAULT_ENTITIES.some(d => d.id === entity.id) && (
                  <button
                    onClick={() => onDeleteEntity(entity.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
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