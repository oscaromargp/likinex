import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateInput,
  isToday,
  isFuture,
  isUrgent,
  getDaysInMonth,
  getFirstDayOfMonth,
  calculateDaysLate,
  getTransactionStatusFromPayments,
  getPeriodKey,
  generateRecurrenceDates,
  isBudgetExceeded,
  getBudgetPercentage,
} from '../utils';

describe('formatCurrency', () => {
  it('formats positive amount in MXN', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234');
    expect(result).toContain('56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formats negative amount', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('-');
  });

  it('formats large numbers with commas', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1,000,000');
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2026-05-21');
    expect(result).toContain('may');
    expect(result).toContain('2026');
  });

  it('handles valid dates', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('ene');
  });
});

describe('formatDateInput', () => {
  it('returns abbreviated format', () => {
    const result = formatDateInput('2026-05-21');
    expect(typeof result).toBe('string');
    expect(result.length).toBeLessThan(30);
  });
});

describe('isToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for a past date', () => {
    expect(isToday('2025-01-01')).toBe(false);
  });
});

describe('isFuture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for future date', () => {
    expect(isFuture('2026-06-01')).toBe(true);
  });

  it('returns false for past date', () => {
    expect(isFuture('2026-05-01')).toBe(false);
  });

  it('returns false for today', () => {
    expect(isFuture('2026-05-21')).toBe(false);
  });
});

describe('isUrgent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T06:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for due within 72 hours', () => {
    expect(isUrgent('2026-05-22T06:00:00')).toBe(true);
  });

  it('returns false for due beyond 72 hours', () => {
    expect(isUrgent('2026-06-01')).toBe(false);
  });

  it('returns false for past date', () => {
    expect(isUrgent('2026-05-01')).toBe(false);
  });
});

describe('getDaysInMonth', () => {
  it('returns 31 for January', () => {
    expect(getDaysInMonth(2026, 0)).toBe(31);
  });

  it('returns 28 for February in non-leap year', () => {
    expect(getDaysInMonth(2025, 1)).toBe(28);
  });

  it('returns 29 for February in leap year', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });

  it('returns 30 for April', () => {
    expect(getDaysInMonth(2026, 3)).toBe(30);
  });
});

describe('getFirstDayOfMonth', () => {
  it('is between 0 (Sun) and 6 (Sat)', () => {
    const day = getFirstDayOfMonth(2026, 4);
    expect(day).toBeGreaterThanOrEqual(0);
    expect(day).toBeLessThanOrEqual(6);
  });

  it('Jan 2024 starts on Monday', () => {
    expect(getFirstDayOfMonth(2024, 0)).toBe(1);
  });
});

describe('calculateDaysLate', () => {
  it('returns 0 when no paidDate', () => {
    expect(calculateDaysLate('2026-05-01', null)).toBe(0);
  });

  it('returns positive days when paid late', () => {
    expect(calculateDaysLate('2026-05-01', '2026-05-05')).toBe(4);
  });

  it('returns negative days when paid early', () => {
    expect(calculateDaysLate('2026-05-10', '2026-05-05')).toBe(-5);
  });

  it('returns 0 when paid on due date', () => {
    expect(calculateDaysLate('2026-05-10', '2026-05-10')).toBe(0);
  });
});

describe('getTransactionStatusFromPayments', () => {
  it('returns settled when fully paid', () => {
    expect(getTransactionStatusFromPayments(1000, 1000)).toBe('settled');
  });

  it('returns settled when overpaid', () => {
    expect(getTransactionStatusFromPayments(1000, 1200)).toBe('settled');
  });

  it('returns partial when partially paid', () => {
    expect(getTransactionStatusFromPayments(1000, 500)).toBe('partial');
  });

  it('returns pending when nothing paid', () => {
    expect(getTransactionStatusFromPayments(1000, 0)).toBe('pending');
  });
});

describe('getPeriodKey', () => {
  it('returns month and year from date', () => {
    const result = getPeriodKey(new Date('2026-05-21'));
    expect(result).toEqual({ month: 5, year: 2026 });
  });

  it('handles January correctly', () => {
    const result = getPeriodKey(new Date('2026-01-15'));
    expect(result).toEqual({ month: 1, year: 2026 });
  });

  it('handles December correctly', () => {
    const result = getPeriodKey(new Date('2026-12-31'));
    expect(result).toEqual({ month: 12, year: 2026 });
  });
});

describe('generateRecurrenceDates', () => {
  it('generates weekly dates', () => {
    const dates = generateRecurrenceDates('2026-05-01', 'weekly', 3);
    expect(dates).toHaveLength(3);
    expect(dates[0]).toBe('2026-05-01');
    expect(dates[1]).toBe('2026-05-08');
    expect(dates[2]).toBe('2026-05-15');
  });

  it('generates monthly dates', () => {
    const dates = generateRecurrenceDates('2026-01-15', 'monthly', 2);
    expect(dates).toHaveLength(2);
    expect(dates[0]).toBe('2026-01-15');
    expect(dates[1]).toBe('2026-02-15');
  });

  it('generates quarterly dates', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'quarterly', 2);
    expect(dates[0]).toBe('2026-01-01');
    expect(dates[1]).toBe('2026-04-01');
  });

  it('generates yearly dates', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'yearly', 2);
    expect(dates).toHaveLength(2);
    expect(dates[0]).toBe('2026-01-01');
    expect(dates[1]).toBe('2027-01-01');
  });

  it('defaults to 12 occurrences', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'monthly');
    expect(dates).toHaveLength(12);
  });

  it('only returns start date for unknown recurrence', () => {
    const dates = generateRecurrenceDates('2026-01-15', 'unknown-type', 5);
    expect(dates).toHaveLength(1);
    expect(dates[0]).toBe('2026-01-15');
  });
});

describe('isBudgetExceeded', () => {
  it('returns true when spent exceeds budget', () => {
    expect(isBudgetExceeded(600, 500)).toBe(true);
  });

  it('returns false when spent equals budget', () => {
    expect(isBudgetExceeded(500, 500)).toBe(false);
  });

  it('returns false when spent is under budget', () => {
    expect(isBudgetExceeded(400, 500)).toBe(false);
  });
});

describe('getBudgetPercentage', () => {
  it('returns correct percentage', () => {
    expect(getBudgetPercentage(250, 500)).toBe(50);
  });

  it('returns 0 when budget is 0', () => {
    expect(getBudgetPercentage(100, 0)).toBe(0);
  });

  it('returns 100 when spent equals budget', () => {
    expect(getBudgetPercentage(500, 500)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    expect(getBudgetPercentage(333, 1000)).toBe(33);
  });
});
