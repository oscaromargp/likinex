import { describe, it, expect } from 'vitest';
import {
  mockCreditCardAccounts,
  mockMSITransactions,
  calculateNextCutOffDate,
  calculateNextPaymentDate,
  calculateCardMonthlyPayments,
} from '../creditCardData';

describe('calculateNextCutOffDate', () => {
  it('returns a future date string', () => {
    const result = calculateNextCutOffDate(15);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('calculateNextPaymentDate', () => {
  it('returns a future date string', () => {
    const result = calculateNextPaymentDate(20);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('calculateCardMonthlyPayments', () => {
  it('generates 3 months of payments per card', () => {
    const payments = calculateCardMonthlyPayments(mockCreditCardAccounts, mockMSITransactions);
    // 3 cards × 3 months = 9 payment entries
    expect(payments).toHaveLength(9);
  });

  it('includes MSI payment details', () => {
    const payments = calculateCardMonthlyPayments(mockCreditCardAccounts, mockMSITransactions);
    const nuPayments = payments.filter(p => p.card_id === 'card_nu');
    expect(nuPayments.length).toBeGreaterThan(0);
    expect(nuPayments[0].msi_payments.length).toBeGreaterThan(0);
  });

  it('includes min and total payment amounts', () => {
    const payments = calculateCardMonthlyPayments(mockCreditCardAccounts, mockMSITransactions);
    expect(payments[0].min_payment).toBeGreaterThan(0);
    expect(payments[0].total_payment).toBeGreaterThan(0);
  });
});

describe('mock data integrity', () => {
  it('has 3 credit card accounts', () => {
    expect(mockCreditCardAccounts).toHaveLength(3);
  });

  it('has 3 MSI transactions', () => {
    expect(mockMSITransactions).toHaveLength(3);
  });

  it('all MSI transactions reference valid cards', () => {
    const cardIds = new Set(mockCreditCardAccounts.map(c => c.id));
    mockMSITransactions.forEach(msi => {
      expect(cardIds.has(msi.card_id)).toBe(true);
    });
  });
});
