import { describe, it, expect, vi } from 'vitest';
import { cn, formatCurrency, generateRecurrenceDates, isUrgent, calculateDaysLate } from '../../lib/utils';

describe('cn (className utility)', () => {
  it('merges tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-6');
    expect(result).toContain('px-6');
    expect(result).not.toContain('px-4');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).toContain('base');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatCurrency edge cases', () => {
  it('handles very large numbers', () => {
    const result = formatCurrency(999999999.99);
    expect(result).toContain('999');
  });

  it('handles decimal rounding', () => {
    const result = formatCurrency(10.999);
    expect(result).toContain('11');
  });
});

describe('generateRecurrenceDates edge cases', () => {
  it('handles triennial recurrence', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'triennial', 2);
    expect(dates[1]).toBe('2029-01-01');
  });

  it('generates correct count', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'weekly', 5);
    expect(dates).toHaveLength(5);
  });

  it('falls back to single date for unknown recurrence', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'unknown', 5);
    expect(dates).toHaveLength(1);
  });
});

describe('isUrgent edge cases', () => {
  it('returns true for exactly 72h (boundary inclusive)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T06:00:00'));
    const result = isUrgent('2026-05-24T06:00:00');
    vi.useRealTimers();
    expect(result).toBe(true);
  });
});

describe('calculateDaysLate edge cases', () => {
  it('handles same-day payment', () => {
    expect(calculateDaysLate('2026-05-10', '2026-05-10')).toBe(0);
  });

  it('handles month boundary crossing', () => {
    expect(calculateDaysLate('2026-01-31', '2026-02-01')).toBe(1);
  });
});
