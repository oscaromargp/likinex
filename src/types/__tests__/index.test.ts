import { describe, it, expect } from 'vitest';
import {
  calculatePunctuality,
  getScoreLabel,
  isIncomeTransaction,
  getTransactionAmount,
  generateCEP,
  type Transaction,
} from '../../types';

const mockTx = (partial: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  user_id: 'u1',
  entity: 'test',
  description: 'Test',
  amount: 100,
  currency: 'MXN',
  due_date: '2026-05-01',
  status: 'pending',
  type: 'expense',
  recurrence: 'none',
  created_at: '2026-01-01',
  ...partial,
});

describe('calculatePunctuality', () => {
  it('returns null when no paidDate', () => {
    expect(calculatePunctuality('2026-05-01')).toBeNull();
  });

  it('returns on-time when paid before due', () => {
    const result = calculatePunctuality('2026-05-10', '2026-05-08');
    expect(result?.level).toBe('on-time');
    expect(result?.score).toBe(100);
  });

  it('returns on-time when paid on due date', () => {
    const result = calculatePunctuality('2026-05-10', '2026-05-10');
    expect(result?.level).toBe('on-time');
  });

  it('returns slightly-late for 1-2 days delay', () => {
    const result = calculatePunctuality('2026-05-10', '2026-05-12');
    expect(result?.level).toBe('slightly-late');
    expect(result?.score).toBe(70);
  });

  it('returns very-late for 3+ days delay', () => {
    const result = calculatePunctuality('2026-05-10', '2026-05-15');
    expect(result?.level).toBe('very-late');
    expect(result?.score).toBe(40);
  });
});

describe('getScoreLabel', () => {
  it('returns Excelente for 90+', () => {
    expect(getScoreLabel(95)).toBe('Excelente');
  });

  it('returns Bueno for 70-89', () => {
    expect(getScoreLabel(75)).toBe('Bueno');
  });

  it('returns Regular for 50-69', () => {
    expect(getScoreLabel(60)).toBe('Regular');
  });

  it('returns Deficiente for < 50', () => {
    expect(getScoreLabel(30)).toBe('Deficiente');
  });
});

describe('isIncomeTransaction', () => {
  it('returns true for income type', () => {
    expect(isIncomeTransaction(mockTx({ type: 'income' }))).toBe(true);
  });

  it('returns false for expense type', () => {
    expect(isIncomeTransaction(mockTx({ type: 'expense' }))).toBe(false);
  });
});

describe('getTransactionAmount', () => {
  it('returns positive display amount for income', () => {
    const result = getTransactionAmount(mockTx({ type: 'income', amount: -5000 }));
    expect(result.display).toBe(5000);
    expect(result.isIncome).toBe(true);
  });

  it('returns positive display amount for expense', () => {
    const result = getTransactionAmount(mockTx({ type: 'expense', amount: 1000 }));
    expect(result.display).toBe(1000);
    expect(result.isIncome).toBe(false);
  });
});

describe('generateCEP', () => {
  it('returns CEP code with correct prefix', () => {
    const result = generateCEP('abc12345');
    expect(result).toMatch(/^CEP-/);
  });

  it('includes contact code when provided', () => {
    const result = generateCEP('abc12345', 'contact01');
    expect(result).toContain('CON');
  });
});
