export type Entity = 'oscaromargp' | 'centenario' | 'tulum' | 'paypaps' | 'bnrecords' | 'pardesantos' | 'zxyw';

export type RecurrenceType = 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'none';

export type TransactionStatus = 'pending' | 'settled' | 'cancelled';

export type PaymentMethod = 'transfer' | 'cash' | 'card' | 'check' | 'other';

export interface Transaction {
  id: string;
  template_id?: string;
  entity: Entity;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: TransactionStatus;
  recurrence: RecurrenceType;
  recurrence_day?: number;
  payment_method?: PaymentMethod;
  notes?: string;
  follow_up?: string;
  attachment_url?: string;
  price_change?: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionTemplate {
  id: string;
  entity: Entity;
  description: string;
  amount: number;
  recurrence: RecurrenceType;
  recurrence_day?: number;
  payment_method?: PaymentMethod;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface TransactionInstance {
  id: string;
  template_id: string;
  instance_date: string;
  paid_date?: string;
  amount: number;
  status: TransactionStatus;
  payment_method?: PaymentMethod;
  notes?: string;
  follow_up?: string;
  attachment_url?: string;
  price_change?: number;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface LiquidityMetrics {
  committed: number;
  settled: number;
  pending: number;
  available: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  amount: number;
  entity: Entity;
  status: TransactionStatus;
  isInstance: boolean;
}

export interface FilterState {
  entity: Entity | 'all';
  status: TransactionStatus | 'all';
  search: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export const ENTITY_LABELS: Record<Entity, string> = {
  oscaromargp: 'Oscaromargp',
  centenario: 'Centenario',
  tulum: 'Tulum',
  paypaps: 'Paypaps',
  bnrecords: 'BN Records',
  pardesantos: 'Pardesantos',
  zxyw: 'XYZW'
};

export const ENTITY_COLORS: Record<Entity, string> = {
  oscaromargp: 'bg-emerald-500/20 text-emerald-400',
  centenario: 'bg-indigo-500/20 text-indigo-400',
  tulum: 'bg-pink-500/20 text-pink-400',
  paypaps: 'bg-blue-500/20 text-blue-400',
  bnrecords: 'bg-amber-500/20 text-amber-400',
  pardesantos: 'bg-cyan-500/20 text-cyan-400',
  zxyw: 'bg-violet-500/20 text-violet-400'
};

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pendiente',
  settled: 'Liquidado',
  cancelled: 'Cancelado'
};

export const STATUS_COLORS: Record<TransactionStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  settled: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400'
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  triennial: 'Trienal',
  none: 'Sin recurrencia'
};