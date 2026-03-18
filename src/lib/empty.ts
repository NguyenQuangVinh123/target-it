import type { Category, Expense, IncomeSource, SavingsTarget } from "./db";

/** Stable empty arrays for hooks deps when query is undefined. */
export const EMPTY_EXPENSES: Expense[] = [];
export const EMPTY_INCOMES: IncomeSource[] = [];
export const EMPTY_TARGETS: SavingsTarget[] = [];
export const EMPTY_CATEGORIES: Category[] = [];
