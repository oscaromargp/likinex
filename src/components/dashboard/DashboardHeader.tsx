'use client';

import { Bell, Plus } from 'lucide-react';
import type { ViewType } from './DashboardSidebar';

interface DashboardHeaderProps {
  activeView: ViewType;
  entitySelector?: React.ReactNode;
  alertCount: number;
  onToggleNotifications: () => void;
  onNewTransaction: () => void;
}

export function DashboardHeader({ activeView, entitySelector, alertCount, onToggleNotifications, onNewTransaction }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-[var(--bg-secondary)]/50 backdrop-blur-xl border-b border-[var(--border-subtle)] px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] capitalize">{activeView}</h2>
        {entitySelector}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onToggleNotifications} className="p-2 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors relative">
          <Bell className="w-5 h-5 text-[var(--text-muted)]" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
              {alertCount}
            </span>
          )}
        </button>
        {activeView !== 'settings' && (
          <button
            onClick={onNewTransaction}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Transacción
          </button>
        )}
      </div>
    </header>
  );
}
