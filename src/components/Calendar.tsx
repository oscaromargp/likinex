'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid3X3, Eye, AlertTriangle, X, CheckCircle, ArrowRight } from 'lucide-react';
import { CalendarEvent, ENTITY_COLORS, STATUS_COLORS, ENTITY_LABELS } from '@/types';
import { formatDateInput, isToday, isUrgent, formatCurrency } from '@/lib/utils';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateDoubleClick?: (date: string) => void;
  onEventDrop?: (eventId: string, newDate: string) => void;
  onMoveToToday?: (eventId: string) => void;
  onMarkOverduePaid?: (eventId: string) => void;
}

type ViewMode = 'grid' | 'table';

export default function Calendar({ events, onEventClick, onDateDoubleClick, onEventDrop, onMoveToToday, onMarkOverduePaid }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showOverduePanel, setShowOverduePanel] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: string } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDayEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : [];

  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const projectionCount = events.filter(e => e.isProjection).length;
  const isFutureMonth = (() => {
    const now = new Date();
    return year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());
  })();

  const totalMonthAmount = monthEvents.reduce((sum, e) => sum + Math.abs(e.amount), 0);

  // Overdue: isInstance events that are pending and due_date < today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const overdueEvents = useMemo(() =>
    events.filter(e => e.isInstance && e.status === 'pending' && e.date < todayStr),
    [events, todayStr]
  );

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Calendario</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {isFutureMonth && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Proyeccion
                </span>
              )}
              {overdueEvents.length > 0 && (
                <button
                  onClick={() => setShowOverduePanel(v => !v)}
                  className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1 hover:bg-red-500/30 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {overdueEvents.length} vencido{overdueEvents.length > 1 ? 's' : ''}
                </button>
              )}
              <span className="text-xs text-slate-500">
                {monthEvents.length} eventos | {formatCurrency(totalMonthAmount)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-slate-700 mx-2" />
          
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-white font-semibold min-w-[140px] text-center capitalize">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Overdue Panel */}
      <AnimatePresence>
        {showOverduePanel && overdueEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Pagos vencidos sin registrar</span>
                </div>
                <button onClick={() => setShowOverduePanel(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {overdueEvents.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{e.title}</p>
                    <p className="text-[10px] text-red-400">
                      Venció: {new Date(e.date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{formatCurrency(e.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { onEventClick?.(e); setShowOverduePanel(false); }}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                      title="Abrir y registrar pago"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Registrar
                    </button>
                    <button
                      onClick={() => { onMoveToToday?.(e.id); }}
                      className="px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                      title="Mover vencimiento a hoy"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Mover a hoy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="h-24" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDay(day);
              const isCurrentDay = isToday(dateStr);
              const isSelected = selectedDate === dateStr;
              const hasProjections = dayEvents.some(e => e.isProjection);
              const hasOverdue = dayEvents.some(e => e.isInstance && e.status === 'pending' && e.date < todayStr);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  onDoubleClick={() => onDateDoubleClick?.(dateStr)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, date: dateStr });
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const eventId = e.dataTransfer.getData('text/plain');
                    if (eventId && onEventDrop) {
                      onEventDrop(eventId, dateStr);
                    }
                  }}
                  className={`
                    h-24 p-1.5 rounded-lg transition-all relative flex flex-col items-start cursor-pointer select-none overflow-hidden border
                    ${isSelected ? 'bg-emerald-500/10 border-emerald-500/40 shadow-inner' : hasOverdue ? 'bg-red-950/20 border-red-500/30 hover:bg-red-950/30' : 'bg-slate-800/30 hover:bg-slate-800/50 border-slate-800/40'}
                    ${hasProjections && !hasOverdue ? 'ring-1 ring-indigo-500/20' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1
                    ${isCurrentDay ? 'bg-emerald-500 text-white' : hasOverdue ? 'text-red-400' : 'text-slate-400'}
                  `}>
                    {day}
                  </span>
                  
                  <div className="flex flex-col gap-1 w-full overflow-hidden flex-1">
                    {dayEvents.slice(0, 2).map((e) => {
                      const urgent = isUrgent(e.date);
                      return (
                        <div
                          key={e.id}
                          draggable={true}
                          onDragStart={(ev) => {
                            ev.dataTransfer.setData('text/plain', e.id);
                            ev.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onEventClick?.(e);
                          }}
                          className={`
                            text-[9px] px-1 py-0.5 rounded truncate text-left border select-none transition-all hover:brightness-125 cursor-grab active:cursor-grabbing
                            ${e.isProjection
                              ? 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30 border-dashed'
                              : e.status === 'settled'
                                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/15'
                                : e.status === 'pending' && e.date < todayStr
                                  ? 'bg-red-900/50 text-red-300 border-red-500/40 animate-pulse'
                                  : urgent
                                    ? 'bg-red-950/30 text-red-400 border-red-500/25 animate-pulse'
                                    : 'bg-amber-950/30 text-amber-400 border-amber-500/25'
                            }
                          `}
                          title={`${e.title}: $${e.amount}${e.isProjection ? ' (proyección)' : ''}`}
                        >
                          {e.isProjection ? '◈ ' : ''}{e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-500 pl-1 font-medium">
                        +{dayEvents.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <h3 className="text-sm font-semibold text-slate-400 mb-3">
                  Eventos del {formatDateInput(selectedDate)}
                </h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No hay eventos en esta fecha</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDayEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className="w-full text-left p-3 rounded-lg bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">{event.title}</span>
                          <div className="flex items-center gap-1">
                            {event.isProjection && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                                Proyección
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
                              {event.status === 'settled' ? 'Liquidado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ENTITY_COLORS[event.entity]}`}>
                            {ENTITY_LABELS[event.entity]}
                          </span>
                          <span className="text-emerald-400 text-sm font-medium">
                            {formatCurrency(event.amount)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Descripción</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Entidad</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Monto</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {monthEvents.map((event, idx) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onEventClick?.(event)}
                  className={`border-b border-slate-800/30 hover:bg-slate-800/30 cursor-pointer transition-colors ${event.isProjection ? 'opacity-70' : ''}`}
                >
                  <td className="py-3 px-4">
                    <span className={`text-sm ${isToday(event.date) ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                      {formatDateInput(event.date)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{event.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${ENTITY_COLORS[event.entity]}`}>
                      {ENTITY_LABELS[event.entity]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-semibold">{formatCurrency(event.amount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {event.isProjection && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                          Proyección
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
                        {event.status === 'settled' ? 'Liquidado' : 'Pendiente'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {monthEvents.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay eventos en este mes
            </div>
          )}
        </div>
      )}

      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                onDateDoubleClick?.(contextMenu.date);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2"
            >
              <span>+</span> Nueva Transacción
            </button>
            <button
              onClick={() => {
                setSelectedDate(contextMenu.date);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-slate-700"
            >
              Ver detalles
            </button>
          </div>
        </>
      )}
    </div>
  );
}