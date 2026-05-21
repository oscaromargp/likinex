import { Transaction, TransactionTemplate, LiquidityMetrics, CalendarEvent, Entity } from '@/types';

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const userTransactions: Transaction[] = [
  // Pagos Mensuales
  {
    id: 'usr-1',
    entity: 'zxyw',
    description: 'VPS N8N Entry (zxyw.site)',
    amount: 167.33,
    due_date: formatDate(new Date(currentYear, currentMonth, 1)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 1,
    payment_method: 'transfer',
    category: 'vps',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-2',
    entity: 'centenario',
    description: 'Servicio de Alberca',
    amount: 1800,
    due_date: formatDate(new Date(currentYear, currentMonth, 5)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 5,
    payment_method: 'cash',
    category: 'servicio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-3',
    entity: 'centenario',
    description: 'Limpieza General (Doña Maria de la Paz)',
    amount: 1000,
    due_date: formatDate(new Date(currentYear, currentMonth, 9)),
    status: 'pending',
    recurrence: 'weekly',
    recurrence_day: 5,
    payment_method: 'cash',
    category: 'limpieza',
    notes: 'Pago semanal los viernes',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-4',
    entity: 'oscaromargp',
    description: 'CFE Personal',
    amount: 800,
    due_date: formatDate(new Date(currentYear, currentMonth, 10)),
    status: 'pending',
    recurrence: 'bimonthly',
    recurrence_day: 10,
    payment_method: 'transfer',
    category: 'servicios_basicos',
    notes: 'Un mes sí y un mes no',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-5',
    entity: 'centenario',
    description: 'Telmex (6126881450)',
    amount: 725,
    due_date: formatDate(new Date(currentYear, currentMonth, 12)),
    paid_date: formatDate(new Date(currentYear, currentMonth, 12)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 12,
    payment_method: 'card',
    category: 'telefonia',
    created_at: '2024-01-01',
    updated_at: '2024-05-12'
  },
  {
    id: 'usr-6',
    entity: 'pardesantos',
    description: 'Plan Emprendedor (pardesantos.mx)',
    amount: 202.25,
    due_date: formatDate(new Date(currentYear, currentMonth, 13)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 13,
    payment_method: 'card',
    category: 'suscription',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-7',
    entity: 'paypaps',
    description: 'Telcel PayPaps (6242124001)',
    amount: 203,
    due_date: formatDate(new Date(currentYear, currentMonth, 14)),
    paid_date: formatDate(new Date(currentYear, currentMonth, 14)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 14,
    payment_method: 'card',
    category: 'telefonia',
    created_at: '2024-01-01',
    updated_at: '2024-05-14'
  },
  {
    id: 'usr-9',
    entity: 'paypaps',
    description: 'Google Workspace (paypaps.com)',
    amount: 841.67,
    due_date: formatDate(new Date(currentYear, currentMonth, 16)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 16,
    payment_method: 'card',
    category: 'suscription',
    notes: 'Estimado según último registro de marzo',
    created_at: '2024-03-01',
    updated_at: '2024-03-01'
  },
  {
    id: 'usr-10',
    entity: 'paypaps',
    description: 'Tarjeta Nu',
    amount: -63.88,
    due_date: formatDate(new Date(currentYear, currentMonth, 18)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 18,
    payment_method: 'card',
    category: 'tarjeta',
    notes: 'Monto para no generar intereses según estado de cuenta de mayo',
    created_at: '2024-05-01',
    updated_at: '2024-05-01'
  },
  {
    id: 'usr-11',
    entity: 'oscaromargp',
    description: 'Renta',
    amount: 7500,
    due_date: formatDate(new Date(currentYear, currentMonth, 24)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 24,
    payment_method: 'transfer',
    category: 'renta',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-12',
    entity: 'tulum',
    description: 'Telmex Tulum (9842317467)',
    amount: 899,
    due_date: formatDate(new Date(currentYear, currentMonth, 24)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 24,
    payment_method: 'card',
    category: 'telefonia',
    notes: 'Vencimiento 24 de mayo 2026',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-13',
    entity: 'oscaromargp',
    description: 'Google One (2 TB)',
    amount: 0,
    due_date: formatDate(new Date(currentYear, currentMonth, 28)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 28,
    payment_method: 'card',
    category: 'suscription',
    notes: 'Monto variable',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  // Pensión Alimenticia - Quincenal (días 1 y 15)
  {
    id: 'usr-14-pension-1',
    entity: 'oscaromargp',
    description: 'Pensión Alimenticia (1a Quincena)',
    amount: 4000,
    due_date: formatDate(new Date(currentYear, currentMonth, 1)),
    status: 'pending',
    recurrence: 'semi_monthly',
    recurrence_days: [1],
    tolerance_days: 2,
    payment_method: 'transfer',
    category: 'pension',
    type: 'expense',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-14-pension-2',
    entity: 'oscaromargp',
    description: 'Pensión Alimenticia (2a Quincena)',
    amount: 4000,
    due_date: formatDate(new Date(currentYear, currentMonth, 15)),
    status: 'pending',
    recurrence: 'semi_monthly',
    recurrence_days: [15],
    tolerance_days: 2,
    payment_method: 'transfer',
    category: 'pension',
    type: 'expense',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },

  // Pagos Trimestrales
  {
    id: 'usr-15',
    entity: 'oscaromargp',
    description: 'Gas (Trimestral)',
    amount: 1000,
    due_date: formatDate(new Date(currentYear, currentMonth + 2, 5)),
    status: 'pending',
    recurrence: 'quarterly',
    recurrence_day: 5,
    payment_method: 'transfer',
    category: 'servicios_basicos',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },

  // Pagos Variables - Propiedades
  {
    id: 'usr-16',
    entity: 'centenario',
    description: 'CFE Centenario (Servicio 006201005068)',
    amount: 7676,
    due_date: formatDate(new Date(currentYear, currentMonth + 1, 26)),
    status: 'pending',
    recurrence: 'bimonthly',
    recurrence_day: 26,
    payment_method: 'transfer',
    category: 'servicios_basicos',
    notes: 'Último pago con vencimiento 26 abril 2026',
    created_at: '2024-01-01',
    updated_at: '2024-04-26'
  },
  {
    id: 'usr-17',
    entity: 'tulum',
    description: 'CFE Tulum (Servicio 812260104181)',
    amount: 15444,
    due_date: formatDate(new Date(currentYear, currentMonth + 1, 4)),
    status: 'pending',
    recurrence: 'bimonthly',
    recurrence_day: 4,
    payment_method: 'transfer',
    category: 'servicios_basicos',
    notes: 'Último pago con vencimiento 04 mayo 2026',
    created_at: '2024-01-01',
    updated_at: '2024-05-04'
  },

  // Renovaciones Anuales y Especiales
  {
    id: 'usr-18',
    entity: 'paypaps',
    description: 'Dominio paypaps.com',
    amount: 349,
    due_date: '2026-10-18',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 18,
    payment_method: 'card',
    category: 'dominio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-19',
    entity: 'zxyw',
    description: 'Dominio 9stratex.com',
    amount: 425,
    due_date: '2027-02-26',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 26,
    payment_method: 'card',
    category: 'dominio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-20',
    entity: 'zxyw',
    description: 'Dominio zxyw.site',
    amount: 321,
    due_date: '2027-03-09',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 9,
    payment_method: 'card',
    category: 'dominio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-21',
    entity: 'bnrecords',
    description: 'Dominio bnrecords.com.mx',
    amount: 500,
    due_date: '2027-04-12',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 12,
    payment_method: 'card',
    category: 'dominio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-22',
    entity: 'pardesantos',
    description: 'Dominio pardesantos.mx',
    amount: 1150,
    due_date: '2027-04-20',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 20,
    payment_method: 'card',
    category: 'dominio',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-23',
    entity: 'bnrecords',
    description: 'Plan Emprendedor bnrecords.com.mx (Anual)',
    amount: 1734,
    due_date: '2027-05-12',
    status: 'pending',
    recurrence: 'yearly',
    recurrence_day: 12,
    payment_method: 'card',
    category: 'suscription',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-24',
    entity: 'paypaps',
    description: 'Plan Emprendedor paypaps.com (Trienal)',
    amount: 4158,
    due_date: '2028-11-18',
    status: 'pending',
    recurrence: 'triennial',
    recurrence_day: 18,
    payment_method: 'card',
    category: 'suscription',
    type: 'expense',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-inc-1',
    entity: 'tulum',
    description: 'Ingreso por Renta Vacacional Tulum',
    amount: 28000,
    due_date: formatDate(new Date(currentYear, currentMonth, 5)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 5,
    payment_method: 'transfer',
    category: 'renta',
    type: 'income',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-inc-2',
    entity: 'paypaps',
    description: 'Ventas Software Licencias SaaS',
    amount: 14200,
    due_date: formatDate(new Date(currentYear, currentMonth, 10)),
    status: 'pending',
    recurrence: 'monthly',
    recurrence_day: 10,
    payment_method: 'transfer',
    category: 'servicio',
    type: 'income',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 'usr-inc-3',
    entity: 'oscaromargp',
    description: 'Cobro de Consultoría Mensual',
    amount: 35000,
    due_date: formatDate(new Date(currentYear, currentMonth, 15)),
    status: 'settled',
    recurrence: 'monthly',
    recurrence_day: 15,
    payment_method: 'transfer',
    category: 'servicio',
    type: 'income',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

export const userTemplates: TransactionTemplate[] = [];

export const calculateMetrics = (transactions: Transaction[]): LiquidityMetrics => {
  const committed = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const settled = transactions.filter(t => t.status === 'settled').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const available = settled;

  return { committed, settled, pending, available };
};

export const generateCalendarEvents = (transactions: Transaction[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  transactions.forEach(t => {
    const txDate = new Date(t.due_date);
    txDate.setHours(0, 0, 0, 0);
    const isClose = txDate <= oneWeekFromNow;

    events.push({
      id: t.id,
      title: t.description,
      date: t.due_date,
      amount: t.amount,
      entity: t.entity,
      status: t.status,
      isInstance: true,
      isProjection: !isClose && t.status === 'pending'
    });

    if (t.recurrence !== 'none' && t.status === 'pending') {
      const projections = generateProjections(t, 24);
      projections.forEach((proj, idx) => {
        const projDate = new Date(proj.date);
        projDate.setHours(0, 0, 0, 0);
        const projIsClose = projDate <= oneWeekFromNow;
        
        events.push({
          id: `${t.id}-proj-${idx}`,
          title: t.description,
          date: proj.date,
          amount: t.amount,
          entity: t.entity,
          status: 'pending' as const,
          isInstance: false,
          isProjection: !projIsClose
        });
      });
    }
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

function generateProjections(transaction: Transaction, monthsAhead: number): { date: string }[] {
  const projections: { date: string }[] = [];
  const baseDate = new Date(transaction.due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const limitDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 0);

  if (baseDate >= limitDate) return projections;

  let currentDate = new Date(baseDate);

  switch (transaction.recurrence) {
    case 'weekly': {
      const targetDays = transaction.recurrence_days && transaction.recurrence_days.length > 0
        ? transaction.recurrence_days
        : [0];

      for (let d = 1; d <= monthsAhead * 7 + 7; d++) {
        const projDate = new Date(baseDate);
        projDate.setDate(projDate.getDate() + d);
        if (projDate > baseDate && projDate <= limitDate) {
          if (targetDays.includes(projDate.getDay())) {
            projections.push({ date: formatDate(projDate) });
          }
        }
      }
      break;
    }
    case 'monthly': {
      const targetDays = transaction.recurrence_days && transaction.recurrence_days.length > 0
        ? transaction.recurrence_days
        : [baseDate.getDate()];

      for (let m = 0; m <= monthsAhead + 1; m++) {
        const targetMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + m, 1);
        for (const day of targetDays) {
          const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
          const actualDay = Math.min(day, daysInMonth);
          const projDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), actualDay);
          if (projDate > baseDate && projDate <= limitDate) {
            projections.push({ date: formatDate(projDate) });
          }
        }
      }
      break;
    }
    case 'semi_monthly': {
      const targetDays = transaction.recurrence_days || [1, 15];
      const baseYear = now.getFullYear();
      const baseMonth = now.getMonth();
      
      for (let m = baseMonth; m <= baseMonth + monthsAhead; m++) {
        const year = baseYear + Math.floor(m / 12);
        const month = m % 12;
        
        for (const day of targetDays) {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const actualDay = Math.min(day, daysInMonth);
          const projDate = new Date(year, month, actualDay);
          
          if (projDate > now && projDate >= baseDate && projDate <= limitDate) {
            if (projDate.getTime() !== baseDate.getTime()) {
              projections.push({ date: formatDate(projDate) });
            }
          }
        }
      }
      break;
    }
    case 'bimonthly': {
      currentDate.setMonth(currentDate.getMonth() + 2);
      while (currentDate <= limitDate) {
        projections.push({ date: formatDate(currentDate) });
        currentDate.setMonth(currentDate.getMonth() + 2);
      }
      break;
    }
    case 'quarterly': {
      currentDate.setMonth(currentDate.getMonth() + 3);
      while (currentDate <= limitDate) {
        projections.push({ date: formatDate(currentDate) });
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
      break;
    }
    case 'triennial': {
      currentDate.setFullYear(currentDate.getFullYear() + 3);
      if (currentDate <= limitDate) {
        projections.push({ date: formatDate(currentDate) });
      }
      break;
    }
    case 'yearly': {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      while (currentDate <= limitDate) {
        projections.push({ date: formatDate(currentDate) });
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
      break;
    }
  }

  return projections;
}
