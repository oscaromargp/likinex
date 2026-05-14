'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent, ENTITY_COLORS, STATUS_COLORS } from '@/types';
import { formatDateInput, isToday, isUrgent } from '@/lib/utils';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function Calendar({ events, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Calendario</h2>
        </div>
        <div className="flex items-center gap-2">
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
            return <div key={`empty-${idx}`} className="h-20" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = getEventsForDay(day);
          const today = isToday(dateStr);
          const urgent = dayEvents.some(e => isUrgent(e.date));
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className={`
                h-20 p-1 rounded-lg transition-all relative flex flex-col items-start
                ${isSelected ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/30 hover:bg-slate-700/50 border border-transparent'}
              `}
            >
              <span className={`
                text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                ${today ? 'bg-emerald-500 text-white' : 'text-slate-400'}
              `}>
                {day}
              </span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {dayEvents.slice(0, 3).map((e, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      e.status === 'settled' ? 'bg-emerald-400' :
                      urgent ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-slate-500">+{dayEvents.length - 3}</span>
                )}
              </div>
            </button>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
                        {event.status === 'settled' ? 'Liquidado' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ENTITY_COLORS[event.entity]}`}>
                        {event.entity}
                      </span>
                      <span className="text-emerald-400 text-sm font-medium">
                        ${event.amount.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}