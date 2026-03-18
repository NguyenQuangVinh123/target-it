import Dexie, { type Table } from "dexie";

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Expense {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  amount: number;
  note: string;
  categoryId?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amountMonthly: number;
}

export interface SavingsTarget {
  id: string;
  currentAmount: number;
  goalAmount: number;
  label: string;
}

class TargetItDB extends Dexie {
  categories!: Table<Category, string>;
  expenses!: Table<Expense, string>;
  incomeSources!: Table<IncomeSource, string>;
  savingsTargets!: Table<SavingsTarget, string>;

  constructor() {
    super("targetit");
    this.version(1).stores({
      categories: "id, sortOrder",
      expenses: "id, date, categoryId",
      incomeSources: "id",
      savingsTargets: "id",
    });
  }
}

export const db = new TargetItDB();

export function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
