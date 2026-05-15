export type Entity = 'oscaromargp' | 'centenario' | 'tulum' | 'paypaps' | 'bnrecords' | 'pardesantos' | 'zxyw';

export type RecurrenceType = 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly' | 'none';

export type TransactionStatus = 'pending' | 'settled' | 'cancelled';

export type PaymentMethod = 'transfer' | 'cash' | 'card' | 'check' | 'other';

export type Currency = 'MXN' | 'USD' | 'BTC' | 'ETH' | 'USDT';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MXN: '$',
  USD: '$',
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮'
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  MXN: 'Peso Mexicano',
  USD: 'Dólar estadounidense',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether'
};

export const EXCHANGE_RATES: Record<Currency, number> = {
  MXN: 1,
  USD: 17.15,
  BTC: 0.000027,
  ETH: 0.00041,
  USDT: 17.15
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const amountInMXN = from === 'MXN' ? amount : amount / EXCHANGE_RATES[from];
  return to === 'MXN' ? amountInMXN : amountInMXN * EXCHANGE_RATES[to];
}

export function formatCurrencyWithSymbol(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'BTC' || currency === 'ETH') {
    return `${symbol}${amount.toFixed(8)}`;
  }
  return `${symbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type Category = 
  | 'servicios' 
  | 'renta' 
  | 'servicio' 
  | 'suscription' 
  | 'telefonia' 
  | 'servicios_basicos' 
  | 'dominio' 
  | 'vps' 
  | 'limpieza' 
  | 'pension' 
  | 'tarjeta' 
  | 'otro';

export interface Transaction {
  id: string;
  template_id?: string;
  user_id?: string;
  entity: Entity;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: TransactionStatus;
  recurrence: RecurrenceType;
  recurrence_day?: number;
  payment_method?: PaymentMethod;
  category?: Category;
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
  yearly: 'Anual',
  none: 'Sin recurrencia'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  servicios: 'Servicios',
  renta: 'Renta',
  servicio: 'Servicio',
  suscription: 'Suscripción',
  telefonia: 'Telefonía',
  servicios_basicos: 'Servicios Básicos',
  dominio: 'Dominio',
  vps: 'VPS/Servidor',
  limpieza: 'Limpieza',
  pension: 'Pensión',
  tarjeta: 'Tarjeta de Crédito',
  otro: 'Otro'
};

export type ServiceCriticality = 'critical' | 'non_critical';

export interface ServiceTolerance {
  service_type: string;
  tolerance_days: number;
  criticality: ServiceCriticality;
}

export const DEFAULT_TOLERANCES: ServiceTolerance[] = [
  { service_type: ' CFE', tolerance_days: 2, criticality: 'critical' },
  { service_type: 'telefonia', tolerance_days: 3, criticality: 'critical' },
  { service_type: 'servicios_basicos', tolerance_days: 2, criticality: 'critical' },
  { service_type: 'renta', tolerance_days: 5, criticality: 'critical' },
  { service_type: 'suscription', tolerance_days: 7, criticality: 'non_critical' },
  { service_type: 'dominio', tolerance_days: 7, criticality: 'non_critical' },
  { service_type: 'vps', tolerance_days: 3, criticality: 'critical' },
  { service_type: 'tarjeta', tolerance_days: 3, criticality: 'non_critical' },
  { service_type: 'pension', tolerance_days: 1, criticality: 'critical' },
  { service_type: 'limpieza', tolerance_days: 2, criticality: 'non_critical' },
  { service_type: 'servicio', tolerance_days: 5, criticality: 'non_critical' },
  { service_type: 'otro', tolerance_days: 7, criticality: 'non_critical' }
];

export interface CreditCard {
  id: string;
  entity: string;
  name: string;
  last4: string;
  statement_date: number;
  due_date: number;
  current_balance: number;
  minimum_payment: number;
  has_msi: boolean;
  msi_total: number;
  interest_rate: number;
}

export interface CardAlert {
  card_id: string;
  type: 'statement_soon' | 'due_soon' | 'opportunity_cost' | 'msi_warning' | 'balance_high';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  days_until: number;
}

export interface CashFlowForecast {
  current_balance: number;
  daily_burn_rate: number;
  runway_days: number;
  forecast_by_date: { date: string; balance: number }[];
}

export interface NotificationConfig {
  whatsapp_enabled: boolean;
  phone_number: string;
  n8n_webhook: string;
  notify_days_before: number[];
  notify_critical_only: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}