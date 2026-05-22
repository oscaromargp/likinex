import { CreditCardAccount, MSITransaction, CardMonthlyPayment } from '@/types';

export const mockCreditCardAccounts: CreditCardAccount[] = [
  {
    id: 'card_nu',
    entity: 'oscaromargp',
    name: 'Nu México',
    last4: '2881',
    brand: 'visa',
    cut_off_day: 15,
    payment_due_day: 20,
    credit_limit: 15000,
    current_balance: 12500,
    available_credit: 2500,
    interest_rate: 3.5,
    is_active: true,
    color: 'purple',
    created_at: '2024-01-01',
    updated_at: '2026-05-01',
  },
  {
    id: 'card_hsbc',
    entity: 'oscaromargp',
    name: 'HSBC 2Now',
    last4: '4532',
    brand: 'visa',
    cut_off_day: 5,
    payment_due_day: 27,
    credit_limit: 30000,
    current_balance: 18500,
    available_credit: 11500,
    interest_rate: 4.2,
    is_active: true,
    color: 'red',
    created_at: '2024-01-01',
    updated_at: '2026-05-01',
  },
  {
    id: 'card_banorte',
    entity: 'paypaps',
    name: 'Banorte Oro',
    last4: '9012',
    brand: 'mastercard',
    cut_off_day: 10,
    payment_due_day: 25,
    credit_limit: 50000,
    current_balance: 32000,
    available_credit: 18000,
    interest_rate: 3.8,
    is_active: true,
    color: 'blue',
    created_at: '2024-01-01',
    updated_at: '2026-05-01',
  },
];

export const mockMSITransactions: MSITransaction[] = [
  {
    id: 'msi_1',
    card_id: 'card_nu',
    description: 'MacBook Pro 14"',
    total_amount: 42000,
    monthly_payment: 1750,
    total_months: 24,
    remaining_months: 18,
    start_date: '2025-02-01',
    category: 'electronica',
    created_at: '2025-02-01',
    updated_at: '2025-02-01',
  },
  {
    id: 'msi_2',
    card_id: 'card_hsbc',
    description: 'Monitor LG UltraFine',
    total_amount: 12000,
    monthly_payment: 1000,
    total_months: 12,
    remaining_months: 5,
    start_date: '2025-08-01',
    category: 'electronica',
    created_at: '2025-08-01',
    updated_at: '2025-08-01',
  },
  {
    id: 'msi_3',
    card_id: 'card_banorte',
    description: 'Muebles oficina',
    total_amount: 24000,
    monthly_payment: 2000,
    total_months: 12,
    remaining_months: 8,
    start_date: '2025-10-01',
    category: 'muebles',
    created_at: '2025-10-01',
    updated_at: '2025-10-01',
  },
];

export function calculateNextCutOffDate(cutOffDay: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const cutOff = new Date(year, month, cutOffDay);
  if (cutOff < now) cutOff.setMonth(cutOff.getMonth() + 1);
  return cutOff.toISOString().split('T')[0];
}

export function calculateNextPaymentDate(paymentDueDay: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const payment = new Date(year, month, paymentDueDay);
  if (payment < now) payment.setMonth(payment.getMonth() + 1);
  return payment.toISOString().split('T')[0];
}

export function calculateCardMonthlyPayments(cards: CreditCardAccount[], msis: MSITransaction[]): CardMonthlyPayment[] {
  const now = new Date();
  const payments: CardMonthlyPayment[] = [];

  cards.forEach(card => {
    const cardMsis = msis.filter(m => m.card_id === card.id);
    const msiPayments = cardMsis.map(m => ({
      description: m.description,
      amount: m.monthly_payment,
    }));

    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const is_due = i === 0;

      const activeMsis = cardMsis.filter(m => m.remaining_months > i);
      const msiTotal = activeMsis.reduce((sum, m) => sum + m.monthly_payment, 0);
      const minPayment = Math.round(card.current_balance * 0.05);
      const totalPayment = Math.round(card.current_balance * 0.15 + msiTotal);

      payments.push({
        card_id: card.id,
        month,
        card_name: card.name,
        min_payment: minPayment,
        total_payment: totalPayment,
        msi_payments: activeMsis.map(m => ({ description: m.description, amount: m.monthly_payment })),
        is_due,
      });
    }
  });

  return payments;
}
