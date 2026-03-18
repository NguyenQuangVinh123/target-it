/** Kiểu dùng chung client (khớp Prisma, date dạng YYYY-MM-DD). */
export type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Expense = {
  id: string;
  date: string;
  amount: number;
  note: string;
  categoryId?: string | null;
};

export type IncomeSource = {
  id: string;
  name: string;
  amountMonthly: number;
};

export type SavingsTarget = {
  id: string;
  currentAmount: number;
  goalAmount: number;
  label: string;
};
