import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
}

/** Parse a date string safely at noon local time to avoid UTC offset shifting the day */
function parseDateSafe(date: string): Date {
  if (!date) return new Date();
  // If it's a plain YYYY-MM-DD, append T12:00:00 to stay in the right local day
  return date.length === 10 ? new Date(date + 'T12:00:00') : new Date(date);
}

export function formatDate(date: string): string {
  return parseDateSafe(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateInput(date: string): string {
  return parseDateSafe(date).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isToday(date: string): boolean {
  const today = new Date();
  const d = new Date(date);
  return d.toDateString() === today.toDateString();
}

export function isFuture(date: string): boolean {
  return new Date(date) > new Date();
}

export function isUrgent(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 && hours <= 72;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function calculateDaysLate(dueDate: string, paidDate?: string | null): number {
  if (!paidDate) return 0;
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const paid = new Date(paidDate);
  paid.setHours(0, 0, 0, 0);
  const diffMs = paid.getTime() - due.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getTransactionStatusFromPayments(
  amount: number,
  totalPaid: number
): 'pending' | 'partial' | 'settled' {
  if (totalPaid >= amount) return 'settled';
  if (totalPaid > 0) return 'partial';
  return 'pending';
}

export function getPeriodKey(date: Date): { month: number; year: number } {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}

export function generateRecurrenceDates(
  startDate: string,
  recurrence: string,
  count: number = 12
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    const next = new Date(start);
    switch (recurrence) {
      case 'weekly':
        next.setDate(next.getDate() + (i * 7));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + i);
        break;
      case 'bimonthly':
        next.setMonth(next.getMonth() + (i * 2));
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + (i * 3));
        break;
      case 'triennial':
        next.setFullYear(next.getFullYear() + (i * 3));
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + i);
        break;
      default:
        if (i === 0) dates.push(startDate);
        return dates;
    }
    dates.push(next.toISOString().split('T')[0]);
  }
  
  return dates;
}

export function isBudgetExceeded(spent: number, budget: number): boolean {
  return spent > budget;
}

export function getBudgetPercentage(spent: number, budget: number): number {
  if (budget === 0) return 0;
  return Math.round((spent / budget) * 100);
}