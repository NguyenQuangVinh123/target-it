import {
  endOfMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { Expense } from "./db";

export function sumExpensesInMonth(
  expenses: Expense[],
  ref: Date
): number {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);
  return expenses.reduce((sum, e) => {
    const d = parseISO(e.date);
    if (d >= start && d <= end) return sum + e.amount;
    return sum;
  }, 0);
}

/** Trung bình tổng chi của N tháng gần nhất (tính từ ref, gồm tháng hiện tại). */
export function avgMonthlyExpenseLastN(
  expenses: Expense[],
  n: number,
  ref: Date = new Date()
): number {
  if (n < 1) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += sumExpensesInMonth(expenses, subMonths(ref, i));
  }
  return total / n;
}

export interface TargetProjection {
  gap: number;
  netThisMonth: number;
  netVsAvgExpense: number;
  monthsThisMonth: number | null;
  monthsAvg: number | null;
  /** Số tiền cần tiết kiệm thêm mỗi tháng để đạt goal trong `horizonMonths` tháng (khi net <= 0). */
  extraPerMonthForHorizon: (horizonMonths: number) => number | null;
}

export function computeTargetProjection(
  monthlyIncome: number,
  expenseThisMonth: number,
  avgExpenseN: number,
  currentAmount: number,
  goalAmount: number
): TargetProjection {
  const gap = Math.max(0, goalAmount - currentAmount);
  const netThisMonth = monthlyIncome - expenseThisMonth;
  const netVsAvgExpense = monthlyIncome - avgExpenseN;

  const monthsForNet = (net: number): number | null => {
    if (gap <= 0) return 0;
    if (net <= 0) return null;
    return Math.ceil(gap / net);
  };

  /** Tiền cần dành riêng mỗi tháng (hướng mục tiêu) trong H tháng — làm tròn lên. */
  const extraPerMonthForHorizon = (horizonMonths: number): number | null => {
    if (horizonMonths < 1 || gap <= 0) return null;
    return Math.ceil(gap / horizonMonths);
  };

  return {
    gap,
    netThisMonth,
    netVsAvgExpense,
    monthsThisMonth: monthsForNet(netThisMonth),
    monthsAvg: monthsForNet(netVsAvgExpense),
    extraPerMonthForHorizon,
  };
}
