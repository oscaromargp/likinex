export type Entity = 'oscaromargp' | 'centenario' | 'tulum' | 'paypaps' | 'bnrecords' | 'pardesantos' | 'zxyw' | string;

export interface EntityConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export const DEFAULT_ENTITIES: EntityConfig[] = [
  { id: 'oscaromargp', name: 'Oscaromargp', icon: '💼', color: 'emerald', is_active: true },
  { id: 'centenario', name: 'Centenario', icon: '🏢', color: 'indigo', is_active: true },
  { id: 'tulum', name: 'Tulum', icon: '🏖️', color: 'pink', is_active: true },
  { id: 'paypaps', name: 'Paypaps', icon: '💻', color: 'blue', is_active: true },
  { id: 'bnrecords', name: 'BN Records', icon: '🎵', color: 'amber', is_active: true },
  { id: 'pardesantos', name: 'Pardesantos', icon: '🚗', color: 'cyan', is_active: true },
  { id: 'zxyw', name: 'XYZW', icon: '🏭', color: 'violet', is_active: true },
];

export const ENTITY_COLORS_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  indigo: 'bg-indigo-500/20 text-indigo-400',
  pink: 'bg-pink-500/20 text-pink-400',
  blue: 'bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/20 text-amber-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
  violet: 'bg-violet-500/20 text-violet-400',
  red: 'bg-red-500/20 text-red-400',
  green: 'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/20 text-orange-400',
  teal: 'bg-teal-500/20 text-teal-400',
  rose: 'bg-rose-500/20 text-rose-400',
  fuchsia: 'bg-fuchsia-500/20 text-fuchsia-400',
};

export const AVAILABLE_COLORS = [
  'emerald', 'indigo', 'pink', 'blue', 'amber', 'cyan', 'violet',
  'red', 'green', 'yellow', 'purple', 'orange', 'teal', 'rose', 'fuchsia',
];

export const COMMON_EMOJIS = ['💼', '🏢', '🏖️', '💻', '🎵', '🚗', '🏭', '🏠', '🏦', '💳', '📊', '🎯', '🔧', '📱', '🌐', '💡', '🚀', '⭐', '🔔', '📦'];

export type RecurrenceType = 'weekly' | 'monthly' | 'semi_monthly' | 'bimonthly' | 'quarterly' | 'triennial' | 'yearly' | 'none';

export type TransactionStatus = 'pending' | 'partial' | 'settled' | 'cancelled';

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
  deadline_date?: string;
  late_justification?: string;
  paid_date?: string;
  status: TransactionStatus;
  recurrence: RecurrenceType;
  recurrence_day?: number;
  recurrence_days?: number[];
  payment_method?: PaymentMethod;
  category?: Category;
  type?: 'income' | 'expense';
  notes?: string;
  follow_up?: string;
  attachment_url?: string;
  price_change?: number;
  contact_id?: string;
  payment_destination?: string;
  tolerance_days?: number;
  isProjection?: boolean;
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

export interface BankAccount {
  id?: string;
  bank_name: string;
  account_number?: string;
  clabe?: string;
  alias?: string;
  is_primary?: boolean;
}

export interface PhoneNumber {
  id?: string;
  number: string;
  type: 'casa' | 'trabajo' | 'móvil' | 'otro';
  description?: string;
}

export interface Address {
  id?: string;
  address: string;
  type: 'fiscal' | 'entrega' | 'oficina' | 'casa' | 'otro';
}

export interface DigitalPresence {
  website?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
}

export interface ReputationNote {
  id: string;
  date: string;
  note: string;
  type: 'positive' | 'negative' | 'neutral';
  author?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  bank_name?: string;
  bank_account?: string;
  bank_clabe?: string;
  
  bank_accounts?: BankAccount[];
  phones?: PhoneNumber[];
  addresses?: Address[];
  digital_presence?: DigitalPresence;
  reputation_notes?: ReputationNote[];
  reputation_score?: number;
  
  payment_method_preferred?: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // New fields
  tags?: string[];
  photo_url?: string;
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
  isProjection?: boolean;
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

export function getEntityLabel(entity: Entity, entities?: EntityConfig[]): string {
  const config = entities?.find(e => e.id === entity);
  if (config) return config.name;
  const defaults: Record<string, string> = {
    oscaromargp: 'Oscaromargp',
    centenario: 'Centenario',
    tulum: 'Tulum',
    paypaps: 'Paypaps',
    bnrecords: 'BN Records',
    pardesantos: 'Pardesantos',
    zxyw: 'XYZW'
  };
  return defaults[entity] || entity;
}

export function getEntityColor(entity: Entity, entities?: EntityConfig[]): string {
  const config = entities?.find(e => e.id === entity);
  if (config && ENTITY_COLORS_MAP[config.color]) {
    return ENTITY_COLORS_MAP[config.color];
  }
  const defaults: Record<string, string> = {
    oscaromargp: 'bg-emerald-500/20 text-emerald-400',
    centenario: 'bg-indigo-500/20 text-indigo-400',
    tulum: 'bg-pink-500/20 text-pink-400',
    paypaps: 'bg-blue-500/20 text-blue-400',
    bnrecords: 'bg-amber-500/20 text-amber-400',
    pardesantos: 'bg-cyan-500/20 text-cyan-400',
    zxyw: 'bg-violet-500/20 text-violet-400'
  };
  return defaults[entity] || 'bg-slate-500/20 text-slate-400';
}

export function getEntityIcon(entity: Entity, entities?: EntityConfig[]): string {
  const config = entities?.find(e => e.id === entity);
  if (config) return config.icon;
  const defaults: Record<string, string> = {
    oscaromargp: '💼',
    centenario: '🏢',
    tulum: '🏖️',
    paypaps: '💻',
    bnrecords: '🎵',
    pardesantos: '🚗',
    zxyw: '🏭'
  };
  return defaults[entity] || '📁';
}

export const ENTITY_LABELS: Record<string, string> = {
  oscaromargp: 'Oscaromargp',
  centenario: 'Centenario',
  tulum: 'Tulum',
  paypaps: 'Paypaps',
  bnrecords: 'BN Records',
  pardesantos: 'Pardesantos',
  zxyw: 'XYZW'
};

export const ENTITY_COLORS: Record<string, string> = {
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
  partial: 'Parcial',
  settled: 'Liquidado',
  cancelled: 'Cancelado'
};

export const STATUS_COLORS: Record<TransactionStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  partial: 'bg-blue-500/20 text-blue-400',
  settled: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400'
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  semi_monthly: 'Quincenal (1 y 15)',
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

export type SmartAlertType = 'upcoming' | 'due_today' | 'overdue';

export interface SmartAlert {
  transaction: Transaction;
  type: SmartAlertType;
  label: string;
  severity: 'info' | 'critical' | 'error' | 'warning';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface Bank {
  id: string;
  name: string;
  shortName: string;
  clabePrefix: string;
  logo?: string;
}

export const BANKS_CATALOG: Bank[] = [
  { id: 'bbva', name: 'BBVA México', shortName: 'BBVA', clabePrefix: '012', logo: '🏦' },
  { id: 'banorte', name: 'Banorte', shortName: 'Banorte', clabePrefix: '072', logo: '🔵' },
  { id: 'santander', name: 'Santander', shortName: 'Santander', clabePrefix: '014', logo: '⚫' },
  { id: 'citibanamex', name: 'Citibanamex', shortName: 'C@banamex', clabePrefix: '002', logo: '🏛️' },
  { id: 'hsbc', name: 'HSBC México', shortName: 'HSBC', clabePrefix: '021', logo: '🔴' },
  { id: 'scotiabank', name: 'Scotiabank Inverlat', shortName: 'Scotiabank', clabePrefix: '044', logo: '💙' },
  { id: 'bancomer', name: 'Bancomer', shortName: 'Bancomer', clabePrefix: '012', logo: '🏦' },
  { id: 'banregio', name: 'Banregio', shortName: 'Banregio', clabePrefix: '032', logo: '🟠' },
  { id: 'inbursa', name: 'Inbursa', shortName: 'Inbursa', clabePrefix: '036', logo: '🟡' },
  { id: 'azteca', name: 'Banco Azteca', shortName: 'Azteca', clabePrefix: '127', logo: '🟤' },
  { id: 'coppel', name: 'BanCoppel', shortName: 'Coppel', clabePrefix: '137', logo: '🛒' },
  { id: 'fondeadora', name: 'Fondeadora', shortName: 'Fondeadora', clabePrefix: '000', logo: '💚' },
  { id: 'nu', name: 'Nu México', shortName: 'Nu', clabePrefix: '000', logo: '💜' },
  { id: 'stori', name: 'Stori', shortName: 'Stori', clabePrefix: '000', logo: '💗' },
  { id: 'klar', name: 'Klar', shortName: 'Klar', clabePrefix: '000', logo: '💎' },
  { id: 'cash', name: 'Efectivo', shortName: 'Cash', clabePrefix: '', logo: '💵' },
  { id: 'other', name: 'Otro', shortName: 'Otro', clabePrefix: '', logo: '📋' },
];

export const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  transfer: '🏧',
  cash: '💵',
  card: '💳',
  check: '📝',
  other: '📦'
};

export const STATUS_ICONS: Record<TransactionStatus, string> = {
  pending: '⏳',
  partial: '🔄',
  settled: '✅',
  cancelled: '❌'
};

export interface PaymentReceipt {
  id: string;
  transaction_id: string;
  contact_id?: string;
  cep: string;
  amount: number;
  paid_date: string;
  method: PaymentMethod;
  bank_id?: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export function generateCEP(transactionId: string, contactId?: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const txCode = transactionId.substring(0, 4).toUpperCase();
  const contactCode = contactId ? contactId.substring(0, 3).toUpperCase() : 'XXX';
  return `CEP-${txCode}-${contactCode}-${timestamp}`;
}

export function isIncomeTransaction(tx: Transaction): boolean {
  return tx.type === 'income';
}

export function getTransactionAmount(tx: Transaction): { display: number; isIncome: boolean } {
  const amount = Math.abs(tx.amount);
  const isIncome = isIncomeTransaction(tx);
  return { display: amount, isIncome };
}

export const TYPE_ICONS: Record<'income' | 'expense', string> = {
  income: '📥',
  expense: '📤'
};

export const RECURRENCE_ICONS: Record<RecurrenceType, string> = {
  none: '➡️',
  weekly: '🔄',
  monthly: '📅',
  semi_monthly: '⚡',
  bimonthly: '🗓️',
  quarterly: '📆',
  triennial: '年度',
  yearly: '🎆'
};

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export type PunctualityLevel = 'on-time' | 'slightly-late' | 'very-late' | 'unpaid';

export interface PunctualityScore {
  score: number;
  level: PunctualityLevel;
  label: string;
  daysLate: number;
  consecutiveOnTime: number;
}

export function calculatePunctuality(dueDate: string, paidDate?: string): PunctualityScore | null {
  if (!paidDate) return null;

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const paid = new Date(paidDate);
  paid.setHours(0, 0, 0, 0);

  const diffMs = paid.getTime() - due.getTime();
  const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let score: number;
  let level: PunctualityLevel;
  let label: string;

  if (daysLate <= 0) {
    score = 100;
    level = 'on-time';
    label = 'Puntual';
  } else if (daysLate <= 2) {
    score = 70;
    level = 'slightly-late';
    label = '1-2 días';
  } else {
    score = 40;
    level = 'very-late';
    label = '3+ días';
  }

  return { score, level, label, daysLate, consecutiveOnTime: 0 };
}

export function calculateConsecutiveOnTime(transactions: Transaction[], templateId: string): number {
  const templateTx = transactions
    .filter(t => t.template_id === templateId && t.status === 'settled' && t.paid_date)
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

  let count = 0;
  for (const tx of templateTx) {
    const due = new Date(tx.due_date);
    due.setHours(0, 0, 0, 0);
    const paid = new Date(tx.paid_date!);
    paid.setHours(0, 0, 0, 0);
    if (paid <= due) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Bueno';
  if (score >= 50) return 'Regular';
  return 'Deficiente';
}