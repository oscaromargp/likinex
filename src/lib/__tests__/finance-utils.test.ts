import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  currentPeriod,
  currentWeekRange,
  previousWeekRange,
  getTransactions,
  calcBalance,
  buildRunningBalance,
  getAccountBalances,
  getPeriodSummaries,
  calcWeeklyPulse,
  fmtMXN,
  fmtShort,
  type TransactionBase,
} from '../finance-utils';

const sampleTxs: TransactionBase[] = [
  { id: '1', description: 'Ingreso nómina', amount: 15000, due_date: '2026-05-01', type: 'income', entity: 'cuenta1', status: 'settled' },
  { id: '2', description: 'Renta', amount: 8000, due_date: '2026-05-05', type: 'expense', entity: 'cuenta1', status: 'pending' },
  { id: '3', description: 'Comida', amount: 500, due_date: '2026-05-10', type: 'expense', entity: 'cuenta2', status: 'settled' },
  { id: '4', description: 'Freelance', amount: -3000, due_date: '2026-05-15', type: 'income', entity: 'cuenta1', status: 'pending', isProjection: true },
  { id: '5', description: 'Internet', amount: 799, due_date: '2026-06-01', type: 'expense', entity: 'cuenta1', status: 'pending' },
];

const entities = [
  { id: 'cuenta1', name: 'Principal', icon: '🏦' },
  { id: 'cuenta2', name: 'Secundaria', icon: '💳' },
];

describe('currentPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM format', () => {
    expect(currentPeriod()).toBe('2026-05');
  });

  it('pads month to 2 digits', () => {
    vi.setSystemTime(new Date('2026-01-15'));
    expect(currentPeriod()).toBe('2026-01');
  });
});

describe('currentWeekRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns week start on Monday', () => {
    const range = currentWeekRange();
    expect(range.start).toBe('2026-05-18');
    expect(range.end).toMatch(/2026-05-2\d/);
  });
});

describe('previousWeekRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns previous week start and end', () => {
    const range = previousWeekRange();
    expect(range.start).toBe('2026-05-11');
    expect(range.end).toBe('2026-05-17');
  });
});

describe('getTransactions', () => {
  it('returns all transactions sorted by date', () => {
    const result = getTransactions(sampleTxs);
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe('1');
    expect(result[4].id).toBe('5');
  });

  it('filters by account', () => {
    const result = getTransactions(sampleTxs, { accountId: 'cuenta2' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('filters by period', () => {
    const result = getTransactions(sampleTxs, { period: '2026-05' });
    expect(result).toHaveLength(4);
  });

  it('excludes projections', () => {
    const result = getTransactions(sampleTxs, { excludeProjections: true });
    expect(result).toHaveLength(4);
    expect(result.every(t => !t.isProjection)).toBe(true);
  });

  it('filters by week range', () => {
    const result = getTransactions(sampleTxs, { weekStart: '2026-05-01', weekEnd: '2026-05-07' });
    expect(result).toHaveLength(2);
  });

  it('filters by income type', () => {
    const income = getTransactions(sampleTxs, { type: 'income' });
    expect(income).toHaveLength(2);
  });

  it('filters by expense type', () => {
    const expenses = getTransactions(sampleTxs, { type: 'expense' });
    const allExpenses = expenses.every(t => t.type === 'expense');
    expect(allExpenses).toBe(true);
  });

  it('returns empty array for no matches', () => {
    const result = getTransactions(sampleTxs, { accountId: 'nonexistent' });
    expect(result).toHaveLength(0);
  });
});

describe('calcBalance', () => {
  it('calculates total income and expense', () => {
    const bal = calcBalance(sampleTxs);
    expect(bal.income).toBeGreaterThan(0);
    expect(bal.expense).toBeGreaterThan(0);
    expect(typeof bal.net).toBe('number');
    expect(bal.count).toBeGreaterThan(0);
  });

  it('calculates for specific account', () => {
    const bal = calcBalance(sampleTxs, { accountId: 'cuenta1' });
    expect(bal.accountId).toBe('cuenta1');
    expect(bal.income).toBe(15000);
    expect(bal.expense).toBe(8799);
  });

  it('handles empty transactions', () => {
    const bal = calcBalance([]);
    expect(bal.income).toBe(0);
    expect(bal.expense).toBe(0);
    expect(bal.net).toBe(0);
    expect(bal.count).toBe(0);
  });
});

describe('buildRunningBalance', () => {
  it('builds cumulative balance entries in reverse order', () => {
    const entries = buildRunningBalance(sampleTxs);
    expect(entries).toHaveLength(4);
    expect(entries[0].balance).toBeGreaterThan(0);
  });

  it('starts with initial balance when provided', () => {
    const entries = buildRunningBalance(sampleTxs, { initialBalance: 50000 });
    expect(entries[0].balance).toBeGreaterThan(50000);
  });
});

describe('getAccountBalances', () => {
  it('returns balance for each entity', () => {
    const balances = getAccountBalances(sampleTxs, entities);
    expect(balances).toHaveLength(2);
    expect(balances[0].accountId).toBe('cuenta1');
    expect(balances[1].accountId).toBe('cuenta2');
  });

  it('includes entity icon in name', () => {
    const balances = getAccountBalances(sampleTxs, entities);
    expect(balances[0].accountName).toContain('🏦');
  });
});

describe('getPeriodSummaries', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns requested number of months', () => {
    const summaries = getPeriodSummaries(sampleTxs, 3);
    expect(summaries).toHaveLength(3);
  });

  it('returns chronologically sorted periods', () => {
    const summaries = getPeriodSummaries(sampleTxs, 3);
    expect(summaries[0].period < summaries[1].period).toBe(true);
  });
});

describe('calcWeeklyPulse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns weekly pulse with correct shape', () => {
    const pulse = calcWeeklyPulse(sampleTxs);
    expect(pulse.weekStart).toBe('2026-05-18');
    expect(pulse.weekEnd).toMatch(/2026-05-2\d/);
    expect(typeof pulse.income).toBe('number');
    expect(typeof pulse.expense).toBe('number');
    expect(typeof pulse.netDelta).toBe('number');
  });
});

describe('fmtMXN', () => {
  it('formats positive amount', () => {
    expect(fmtMXN(1234.56)).toBe('$1,234.56');
  });

  it('formats negative amount with minus sign', () => {
    expect(fmtMXN(-500)).toBe('-$500.00');
  });

  it('formats zero', () => {
    expect(fmtMXN(0)).toBe('$0.00');
  });
});

describe('fmtShort', () => {
  it('formats thousands as K', () => {
    expect(fmtShort(1500)).toBe('1.5K');
  });

  it('formats millions as M', () => {
    expect(fmtShort(2000000)).toBe('2M');
  });

  it('returns plain number for small values', () => {
    expect(fmtShort(500)).toBe('500');
  });
});

describe('calcBalance type vs amount sign', () => {
  it('uses type field when present (expense with positive amount)', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Gas', amount: 500, due_date: '2026-05-01', type: 'expense', entity: 'x', status: 'pending' },
    ];
    const result = calcBalance(txs);
    expect(result.expense).toBe(500);
    expect(result.income).toBe(0);
  });

  it('uses type field when present (income with positive amount)', () => {
    const txs: TransactionBase[] = [
      { id: 'b', description: 'Sueldo', amount: 15000, due_date: '2026-05-01', type: 'income', entity: 'x', status: 'settled' },
    ];
    const result = calcBalance(txs);
    expect(result.income).toBe(15000);
    expect(result.expense).toBe(0);
  });

  it('prefers type over amount sign when conflict', () => {
    const txs: TransactionBase[] = [
      { id: 'c', description: 'Gasto con negativo', amount: -500, due_date: '2026-05-01', type: 'expense', entity: 'x', status: 'pending' },
    ];
    const result = calcBalance(txs);
    expect(result.expense).toBe(500);
    expect(result.income).toBe(0);
  });

  it('falls back to amount sign when no type (negative = income)', () => {
    const txs: TransactionBase[] = [
      { id: 'd', description: 'Sin tipo', amount: -3000, due_date: '2026-05-01', entity: 'x', status: 'pending' },
    ];
    const result = calcBalance(txs);
    expect(result.income).toBe(3000);
    expect(result.expense).toBe(0);
  });

  it('falls back to amount sign when no type (positive = expense)', () => {
    const txs: TransactionBase[] = [
      { id: 'e', description: 'Sin tipo', amount: 799, due_date: '2026-05-01', entity: 'x', status: 'pending' },
    ];
    const result = calcBalance(txs);
    expect(result.expense).toBe(799);
    expect(result.income).toBe(0);
  });
});

describe('buildRunningBalance type vs amount sign', () => {
  it('prefers type field over amount sign', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Gasto con negativo', amount: -500, due_date: '2026-05-01', type: 'expense', entity: 'x', status: 'pending' },
    ];
    const entries = buildRunningBalance(txs);
    expect(entries[0].type).toBe('expense');
    expect(entries[0].amount).toBe(-500);
  });
});

describe('getTransactions type vs amount sign', () => {
  it('filters expense by type field even with negative amount', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Gasto', amount: -500, due_date: '2026-05-01', type: 'expense', entity: 'x', status: 'pending' },
      { id: 'b', description: 'Ingreso', amount: 1000, due_date: '2026-05-01', type: 'income', entity: 'x', status: 'pending' },
    ];
    const expenses = getTransactions(txs, { type: 'expense' });
    expect(expenses).toHaveLength(1);
    expect(expenses[0].id).toBe('a');
  });

  it('filters income by type field', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Gasto', amount: -500, due_date: '2026-05-01', type: 'expense', entity: 'x', status: 'pending' },
      { id: 'b', description: 'Ingreso', amount: 1000, due_date: '2026-05-01', type: 'income', entity: 'x', status: 'pending' },
    ];
    const incomes = getTransactions(txs, { type: 'income' });
    expect(incomes).toHaveLength(1);
    expect(incomes[0].id).toBe('b');
  });

  it('falls back to amount sign when no type', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Sin tipo', amount: 500, due_date: '2026-05-01', entity: 'x', status: 'pending' },
    ];
    expect(getTransactions(txs, { type: 'expense' })).toHaveLength(1);
    expect(getTransactions(txs, { type: 'income' })).toHaveLength(0);
  });

  it('filters by accountId (entity) for source_entity-style data', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Gasto A', amount: 500, due_date: '2026-05-01', type: 'expense', entity: 'ent1' },
      { id: 'b', description: 'Gasto B', amount: 300, due_date: '2026-05-02', type: 'expense', entity: 'ent2' },
    ];
    const filtered = getTransactions(txs, { accountId: 'ent1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('a');
  });
});

describe('getAccountBalances per entity', () => {
  it('calculates balance per entity', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Ingreso', amount: 10000, due_date: '2026-05-01', type: 'income', entity: 'ent1' },
      { id: 'b', description: 'Gasto', amount: 3000, due_date: '2026-05-02', type: 'expense', entity: 'ent1' },
      { id: 'c', description: 'Gasto', amount: 2000, due_date: '2026-05-03', type: 'expense', entity: 'ent2' },
    ];
    const entities = [
      { id: 'ent1', name: 'Entity 1', icon: '🏦' },
      { id: 'ent2', name: 'Entity 2', icon: '💳' },
    ];
    const balances = getAccountBalances(txs, entities);
    expect(balances).toHaveLength(2);
    expect(balances[0].income).toBe(10000);
    expect(balances[0].expense).toBe(3000);
    expect(balances[0].net).toBe(7000);
    expect(balances[1].expense).toBe(2000);
    expect(balances[1].net).toBe(-2000);
  });
});

describe('weekly pulse with entity filter', () => {
  it('calculates weekly pulse filtered by account', () => {
    const txs: TransactionBase[] = [
      { id: 'a', description: 'Ingreso', amount: 5000, due_date: new Date().toISOString().split('T')[0], type: 'income', entity: 'ent1' },
      { id: 'b', description: 'Gasto', amount: 1000, due_date: new Date().toISOString().split('T')[0], type: 'expense', entity: 'ent1' },
      { id: 'c', description: 'Gasto otro', amount: 500, due_date: new Date().toISOString().split('T')[0], type: 'expense', entity: 'ent2' },
    ];
    const pulse = calcWeeklyPulse(txs, { accountId: 'ent1' });
    expect(pulse.income).toBe(5000);
    expect(pulse.expense).toBe(1000);
  });
});
