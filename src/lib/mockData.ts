import { Transaction, TransactionTemplate, LiquidityMetrics, CalendarEvent, Entity } from '@/types';

const today = new Date();

export const mockTemplates: TransactionTemplate[] = [
  {
    id: 'tpl-1',
    entity: 'oscaromargp',
    description: 'CFE Electricidad',
    amount: 2450,
    recurrence: 'bimonthly',
    recurrence_day: 15,
    payment_method: 'transfer',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-2',
    entity: 'centenario',
    description: 'Telmex Internet',
    amount: 899,
    recurrence: 'monthly',
    recurrence_day: 20,
    payment_method: 'card',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-3',
    entity: 'tulum',
    description: 'Gas Natural',
    amount: 1200,
    recurrence: 'quarterly',
    recurrence_day: 1,
    payment_method: 'transfer',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-4',
    entity: 'paypaps',
    description: 'Dominios Web',
    amount: 450,
    recurrence: 'triennial',
    recurrence_day: 1,
    payment_method: 'card',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-5',
    entity: 'bnrecords',
    description: 'Hosting VPS',
    amount: 350,
    recurrence: 'monthly',
    recurrence_day: 10,
    payment_method: 'transfer',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-6',
    entity: 'oscaromargp',
    description: 'Agua Potable',
    amount: 450,
    recurrence: 'monthly',
    recurrence_day: 25,
    payment_method: 'transfer',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: 'tpl-7',
    entity: 'pardesantos',
    description: 'Seguro Vehicular',
    amount: 3500,
    recurrence: 'monthly',
    recurrence_day: 5,
    payment_method: 'transfer',
    is_active: true,
    created_at: '2024-01-01'
  }
];

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    template_id: 'tpl-1',
    entity: 'oscaromargp',
    description: 'CFE Electricidad - Febrero',
    amount: 2450,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 14)),
    status: 'settled',
    recurrence: 'bimonthly',
    recurrence_day: 15,
    payment_method: 'transfer',
    created_at: '2024-01-01',
    updated_at: '2024-02-14'
  },
  {
    id: 'txn-2',
    template_id: 'tpl-2',
    entity: 'centenario',
    description: 'Telmex Internet - Mayo',
    amount: 899,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 20)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 20,
    payment_method: 'card',
    created_at: '2024-01-01',
    updated_at: '2024-05-01'
  },
  {
    id: 'txn-3',
    template_id: 'tpl-3',
    entity: 'tulum',
    description: 'Gas Natural - Q2',
    amount: 1200,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 28)),
    status: 'settled',
    recurrence: 'quarterly',
    recurrence_day: 1,
    payment_method: 'transfer',
    created_at: '2024-01-01',
    updated_at: '2024-04-28'
  },
  {
    id: 'txn-4',
    template_id: 'tpl-4',
    entity: 'paypaps',
    description: 'Dominios .com',
    amount: 450,
    due_date: formatDate(new Date(today.getFullYear() + 1, 0, 1)),
    status: 'pending',
    recurrence: 'triennial',
    recurrence_day: 1,
    payment_method: 'card',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'txn-5',
    template_id: 'tpl-5',
    entity: 'bnrecords',
    description: 'VPS DigitalOcean',
    amount: 350,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 10)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 10,
    payment_method: 'transfer',
    created_at: '2024-01-01',
    updated_at: '2024-05-09'
  },
  {
    id: 'txn-6',
    entity: 'zxyw',
    description: 'Servicios Contables',
    amount: 2500,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 30)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 29)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 30,
    payment_method: 'transfer',
    created_at: '2024-04-01',
    updated_at: '2024-04-29'
  },
  {
    id: 'txn-7',
    entity: 'pardesantos',
    description: 'Seguro Auto - Mayo',
    amount: 3500,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 5,
    payment_method: 'transfer',
    created_at: '2024-01-01',
    updated_at: '2024-05-01'
  },
  {
    id: 'txn-8',
    entity: 'oscaromargp',
    description: 'Mantenimiento HVAC',
    amount: 4500,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 15)),
    status: 'pending',
    recurrence: 'quarterly',
    recurrence_day: 15,
    payment_method: 'transfer',
    notes: 'Revisión sistema de climatización',
    created_at: '2024-03-01',
    updated_at: '2024-03-01'
  },
  {
    id: 'txn-9',
    entity: 'centenario',
    description: 'Licencia Adobe CC',
    amount: 1599,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 22)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 21)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 22,
    payment_method: 'card',
    created_at: '2023-01-01',
    updated_at: '2024-03-21'
  },
  {
    id: 'txn-10',
    entity: 'tulum',
    description: 'Limpieza Oficina',
    amount: 1200,
    due_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    paid_date: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 1,
    payment_method: 'cash',
    created_at: '2024-01-01',
    updated_at: '2024-05-01'
  }
];

export const calculateMetrics = (transactions: Transaction[]): LiquidityMetrics => {
  const committed = transactions.reduce((sum, t) => sum + t.amount, 0);
  const settled = transactions.filter(t => t.status === 'settled').reduce((sum, t) => sum + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const available = settled;

  return { committed, settled, pending, available };
};

export const generateCalendarEvents = (transactions: Transaction[], templates: TransactionTemplate[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  transactions.forEach(t => {
    events.push({
      id: t.id,
      title: t.description,
      date: t.due_date,
      amount: t.amount,
      entity: t.entity,
      status: t.status,
      isInstance: true
    });
  });

  templates.filter(t => t.is_active).forEach(t => {
    const nextDate = getNextRecurrenceDate(t.recurrence, t.recurrence_day);
    if (nextDate) {
      const exists = events.some(e => e.date === formatDate(nextDate) && e.title.includes(t.description));
      if (!exists) {
        events.push({
          id: `template-${t.id}`,
          title: `${t.description} (Próximo)`,
          date: formatDate(nextDate),
          amount: t.amount,
          entity: t.entity,
          status: 'pending',
          isInstance: false
        });
      }
    }
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

function getNextRecurrenceDate(recurrence: string, day?: number): Date | null {
  const now = new Date();
  const targetDay = day || now.getDate();

  switch (recurrence) {
    case 'weekly': {
      const next = new Date(now);
      next.setDate(next.getDate() + (5 - next.getDay() + 7) % 7);
      return next;
    }
    case 'monthly': {
      const next = new Date(now.getFullYear(), now.getMonth(), targetDay);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      return next;
    }
    case 'bimonthly': {
      const next = new Date(now.getFullYear(), now.getMonth(), targetDay);
      if (next <= now) next.setMonth(next.getMonth() + 2);
      return next;
    }
    case 'quarterly': {
      const next = new Date(now.getFullYear(), now.getMonth(), targetDay);
      if (next <= now) next.setMonth(next.getMonth() + 3);
      return next;
    }
    case 'triennial': {
      const next = new Date(now.getFullYear() + 1, now.getMonth(), targetDay);
      return next;
    }
    default:
      return null;
  }
}