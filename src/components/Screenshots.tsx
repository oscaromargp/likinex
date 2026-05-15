'use client';

import { motion } from 'framer-motion';
import { Calendar, FileText, TrendingUp, Settings, Upload, Download, Users, Shield } from 'lucide-react';

export default function Screenshots() {
  const features = [
    {
      title: 'Calendario Interactivo',
      description: 'Visualiza todos tus pagos en un calendario mensual. Navega entre meses, ve los días con eventos y haz clic para ver los detalles. Vista de cuadrícula y tabla disponibles.',
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      points: [
        'Vista mensual con navegación',
        'Indicadores de estado por día',
        'Click para ver detalles completos',
        'Vista de tabla para lista detallada'
      ]
    },
    {
      title: 'Libro Mayor',
      description: 'Tabla avanzada con todas tus transacciones. Filtra por entidad, estado, busca por descripción y ordena por cualquier columna.',
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      points: [
        'Búsqueda en tiempo real',
        'Filtros por entidad y estado',
        'Ordenar por columna',
        'Estados: Pendiente, Liquidado, Cancelado'
      ]
    },
    {
      title: 'Métricas en Tiempo Real',
      description: 'Dashboard con 4 métricas clave: Comprometido (total), Liquidado (pagado), Pendiente (por pagar) y Disponible (flujo).',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      points: [
        'Monto Total Comprometido',
        'Monto ya Liquidado',
        'Monto Pendiente de pago',
        'Cálculo automático de disponible'
      ]
    },
    {
      title: 'Gestión de Transacciones',
      description: 'Doble click en cualquier transacción para abrir el drawer de gestión. Edita notas, cambia métodos de pago, agrega follow-ups y adjunta documentos.',
      icon: Settings,
      color: 'from-cyan-500 to-blue-500',
      points: [
        'Editar detalles de transacción',
        'Cambiar método de pago',
        'Establecer recordatorios',
        'Adjuntar PDFs y documentos'
      ]
    },
    {
      title: 'Importación Masiva',
      description: 'En la sección de configuración puedes importar/exportar plantillas CSV para cargar múltiples pagos de una sola vez.',
      icon: Upload,
      color: 'from-violet-500 to-purple-500',
      points: [
        'Importar pagos desde CSV',
        'Exportar plantilla vacía',
        'Exportar datos existentes',
        'Plantilla con formato guiada'
      ]
    },
    {
      title: 'Cuentas de Usuario',
      description: 'Cada usuario tiene su propia cuenta privada. Registrate, iniciá sesión y tus datos están seguros y separados de otros usuarios.',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      points: [
        'Registro de usuarios',
        'Inicio de sesión seguro',
        'Datos privados por usuario',
        'Perfil y configuración'
      ]
    }
  ];

  return (
    <div className="space-y-24 py-16">
      {features.map((feature, idx) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
        >
          <div className="flex-1">
            <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
            <p className="text-slate-400 text-lg mb-6">{feature.description}</p>
            <ul className="space-y-3">
              {feature.points.map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-slate-500 text-sm">{feature.title} - LikinEX</span>
              </div>
              <div className={`aspect-video rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-24 h-24 text-white/30" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}