'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { EntityConfig, getEntityIcon } from '@/types';
import { cn } from '@/lib/utils';

interface EntitySelectorProps {
  entities: EntityConfig[];
  selectedEntity: string | undefined;
  onSelect: (entityId: string | undefined) => void;
}

export function EntitySelector({ entities, selectedEntity, onSelect }: EntitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = selectedEntity ? entities.find(e => e.id === selectedEntity) : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white hover:bg-slate-700/50 transition-colors"
      >
        <Building2 className="w-4 h-4 text-slate-400" />
        <span>{selected ? `${getEntityIcon(selected.id, entities)} ${selected.name}` : '📊 Consolidado'}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-56 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 py-1">
          <button
            onClick={() => { onSelect(undefined); setIsOpen(false); }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              !selectedEntity ? "text-emerald-400 bg-emerald-500/10" : "text-slate-300 hover:bg-slate-800/50"
            )}
          >
            <span>📊</span>
            <span>Consolidado</span>
          </button>
          <div className="border-t border-slate-700/50 my-1" />
          {entities.map(ent => (
            <button
              key={ent.id}
              onClick={() => { onSelect(ent.id); setIsOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                selectedEntity === ent.id ? "text-emerald-400 bg-emerald-500/10" : "text-slate-300 hover:bg-slate-800/50"
              )}
            >
              <span>{ent.icon}</span>
              <span>{ent.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
