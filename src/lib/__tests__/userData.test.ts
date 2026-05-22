import { describe, it, expect } from 'vitest';
import { generateCalendarEvents } from '../userData';
import type { Transaction } from '@/types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];

describe('generateCalendarEvents with recurrence_days_of_month', () => {
  it('generates projections for semi_monthly with custom days', () => {
    const tx: Transaction = {
      id: 'test-1',
      entity: 'oscaromargp',
      source_entity: 'oscaromargp',
      description: 'Pension test',
      amount: 4000,
      due_date: fmt(new Date(today.getFullYear(), today.getMonth(), 5)),
      status: 'pending',
      recurrence: 'semi_monthly',
      recurrence_days_of_month: [5, 20],
      type: 'expense',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    const events = generateCalendarEvents([tx]);
    const projections = events.filter(e => !e.isInstance);
    expect(projections.length).toBeGreaterThan(0);
    // All projection dates should be >= due_date
    projections.forEach(p => {
      expect(new Date(p.date) >= new Date(tx.due_date)).toBe(true);
    });
  });

  it('respects recurrence_end_date limit', () => {
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const tx: Transaction = {
      id: 'test-2',
      entity: 'oscaromargp',
      source_entity: 'oscaromargp',
      description: 'Limited repetition',
      amount: 1000,
      due_date: fmt(today),
      status: 'pending',
      recurrence: 'monthly',
      recurrence_end_date: fmt(endDate),
      type: 'expense',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    const events = generateCalendarEvents([tx]);
    const projections = events.filter(e => !e.isInstance);
    projections.forEach(p => {
      expect(new Date(p.date) <= endDate).toBe(true);
    });
  });

  it('respects recurrence_count limit', () => {
    const tx: Transaction = {
      id: 'test-3',
      entity: 'oscaromargp',
      source_entity: 'oscaromargp',
      description: 'Count limited',
      amount: 500,
      due_date: fmt(today),
      status: 'pending',
      recurrence: 'monthly',
      recurrence_count: 3,
      type: 'expense',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };
    const events = generateCalendarEvents([tx]);
    const projections = events.filter(e => !e.isInstance);
    expect(projections.length).toBeLessThanOrEqual(3);
  });
});

describe('generateCalendarEvents entity metadata', () => {
  it('includes source_entity in calendar events from transaction', () => {
    const tx: Transaction = {
      id: 'test-ent',
      entity: 'bnrecords',
      source_entity: 'bnrecords',
      description: 'Hosting',
      amount: 500,
      due_date: fmt(today),
      status: 'pending',
      recurrence: 'none',
      type: 'expense',
      created_at: '2024-01-01',
    };
    const events = generateCalendarEvents([tx]);
    expect(events[0].entity).toBe('bnrecords');
  });
});
