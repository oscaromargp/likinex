'use client';

import { LayoutDashboard, Calendar, FileText, Settings, User, Users, LogOut, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewType = 'dashboard' | 'calendar' | 'ledger' | 'settings' | 'contacts' | 'cuenta';

interface DashboardSidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  user: { name?: string | null; email?: string | null } | null;
  isDemo: boolean;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar' as const, label: 'Calendario', icon: Calendar },
  { id: 'ledger' as const, label: 'Transacciones', icon: FileText },
  { id: 'cuenta' as const, label: 'Cuenta', icon: CreditCard },
  { id: 'contacts' as const, label: 'Contactos', icon: Users },
  { id: 'settings' as const, label: 'Configuración', icon: Settings },
];

export function DashboardSidebar({ activeView, onViewChange, user, isDemo, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-r border-[var(--border-subtle)] fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-lg">💰</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LikinEX</h1>
            <p className="text-xs text-slate-500">Orquestador de Liquidez</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 p-2 bg-[var(--bg-tertiary)]/30 rounded-lg">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDemo ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
            <User className={`w-4 h-4 ${isDemo ? 'text-blue-400' : 'text-emerald-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-primary)] text-sm font-medium truncate">{user?.name || user?.email}</p>
            <div className="flex items-center gap-2">
              <p className="text-[var(--text-muted)] text-xs truncate">{user?.email}</p>
              {isDemo && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">DEMO</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                activeView === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]/50 hover:text-[var(--text-primary)]'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
