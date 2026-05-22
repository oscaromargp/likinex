export interface TransactionBase {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  type?: string;
  entity?: string;
  category?: string;
  status?: string;
  isProjection?: boolean;
  payment_method?: string;
  notes?: string;
  attachment_url?: string;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface RunningBalanceEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  balance: number;
}

export interface PeriodSummary {
  period: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface WeeklyPulse {
  weekStart: string;
  weekEnd: string;
  income: number;
  expense: number;
  net: number;
  incomeDelta: number;
  expenseDelta: number;
  netDelta: number;
  count: number;
  upcoming: { id: string; description: string; amount: number; due_date: string }[];
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function currentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

export function previousWeekRange(): { start: string; end: string } {
  const { start } = currentWeekRange();
  const startDate = new Date(start);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] };
}

export function getTransactions(
  txs: TransactionBase[],
  options?: {
    accountId?: string;
    period?: string;
    weekStart?: string;
    weekEnd?: string;
    type?: 'income' | 'expense';
    excludeProjections?: boolean;
  }
): TransactionBase[] {
  let filtered = [...txs];

  if (options?.excludeProjections) {
    filtered = filtered.filter(t => !t.isProjection);
  }

  if (options?.accountId) {
    filtered = filtered.filter(t => t.entity === options.accountId);
  }

  if (options?.period) {
    filtered = filtered.filter(t => t.due_date.startsWith(options.period!));
  }

  if (options?.weekStart && options?.weekEnd) {
    filtered = filtered.filter(t => t.due_date >= options.weekStart! && t.due_date <= options.weekEnd!);
  }

  if (options?.type === 'income') {
    filtered = filtered.filter(t => {
      if (t.type) return t.type === 'income';
      return t.amount < 0;
    });
  } else if (options?.type === 'expense') {
    filtered = filtered.filter(t => {
      if (t.type) return t.type === 'expense';
      return t.amount > 0;
    });
  }

  return filtered.sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export function calcBalance(
  txs: TransactionBase[],
  options?: { accountId?: string; period?: string }
): AccountBalance {
  const filtered = getTransactions(txs, {
    accountId: options?.accountId,
    period: options?.period,
    excludeProjections: true,
  });

  let income = 0;
  let expense = 0;

  filtered.forEach(t => {
    const isIncome = t.type ? t.type === 'income' : t.amount < 0;
    const absAmount = Math.abs(t.amount);
    if (isIncome) {
      income += absAmount;
    } else {
      expense += absAmount;
    }
  });

  return {
    accountId: options?.accountId || 'all',
    accountName: options?.accountId || 'Todas las cuentas',
    income,
    expense,
    net: income - expense,
    count: filtered.length,
  };
}

export function buildRunningBalance(
  txs: TransactionBase[],
  options?: { accountId?: string; period?: string; initialBalance?: number }
): RunningBalanceEntry[] {
  const filtered = getTransactions(txs, {
    accountId: options?.accountId,
    period: options?.period,
    excludeProjections: true,
  });

  let balance = options?.initialBalance || 0;
  const entries: RunningBalanceEntry[] = [];

  filtered.forEach(t => {
    const isIncome = t.type ? t.type === 'income' : t.amount < 0;
    const absAmount = Math.abs(t.amount);
    balance += isIncome ? absAmount : -absAmount;

    entries.push({
      id: t.id,
      date: t.due_date,
      description: t.description,
      amount: isIncome ? absAmount : -absAmount,
      type: isIncome ? 'income' : 'expense',
      balance,
    });
  });

  return entries.reverse();
}

export function getAccountBalances(
  txs: TransactionBase[],
  entities: { id: string; name: string; icon: string }[],
  period?: string
): AccountBalance[] {
  const balances: AccountBalance[] = [];

  entities.forEach(ent => {
    const bal = calcBalance(txs, { accountId: ent.id, period });
    balances.push({
      ...bal,
      accountName: `${ent.icon} ${ent.name}`,
    });
  });

  return balances;
}

export function getPeriodSummaries(
  txs: TransactionBase[],
  months: number = 6,
  accountId?: string
): PeriodSummary[] {
  const now = new Date();
  const summaries: PeriodSummary[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bal = calcBalance(txs, { accountId, period });
    summaries.push({
      period,
      income: bal.income,
      expense: bal.expense,
      net: bal.net,
      count: bal.count,
    });
  }

  return summaries;
}

export function calcWeeklyPulse(
  txs: TransactionBase[],
  options?: { accountId?: string }
): WeeklyPulse {
  const currentWeek = currentWeekRange();
  const prevWeek = previousWeekRange();

  const currentTxs = getTransactions(txs, {
    accountId: options?.accountId,
    weekStart: currentWeek.start,
    weekEnd: currentWeek.end,
    excludeProjections: true,
  });

  const prevTxs = getTransactions(txs, {
    accountId: options?.accountId,
    weekStart: prevWeek.start,
    weekEnd: prevWeek.end,
    excludeProjections: true,
  });

  const currentBal = calcBalance(currentTxs);
  const prevBal = calcBalance(prevTxs);

  const upcoming = getTransactions(txs, {
    accountId: options?.accountId,
    weekStart: currentWeek.start,
    weekEnd: currentWeek.end,
    type: 'expense',
  })
    .filter(t => t.status === 'pending' && new Date(t.due_date) >= new Date())
    .slice(0, 5)
    .map(t => ({ id: t.id, description: t.description, amount: Math.abs(t.amount), due_date: t.due_date }));

  return {
    weekStart: currentWeek.start,
    weekEnd: currentWeek.end,
    income: currentBal.income,
    expense: currentBal.expense,
    net: currentBal.net,
    incomeDelta: currentBal.income - prevBal.income,
    expenseDelta: currentBal.expense - prevBal.expense,
    netDelta: currentBal.net - prevBal.net,
    count: currentBal.count,
    upcoming,
  };
}

export function fmtMXN(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1000000) return `${abs / 1000000}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K`;
  return abs.toFixed(0);
}
