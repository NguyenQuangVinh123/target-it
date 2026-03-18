"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_CATEGORIES = [
  { name: "Ăn uống", sortOrder: 0 },
  { name: "Di chuyển", sortOrder: 1 },
  { name: "Hóa đơn & nhà cửa", sortOrder: 2 },
  { name: "Giải trí", sortOrder: 3 },
  { name: "Sức khỏe", sortOrder: 4 },
  { name: "Khác", sortOrder: 5 },
];

/** Gọi khi mở app: đảm bảo có danh mục + ít nhất một mục tiêu (idempotent). */
export async function ensureServerSeed(): Promise<void> {
  if ((await prisma.category.count()) === 0) {
    for (const c of DEFAULT_CATEGORIES) {
      await prisma.category.create({ data: c });
    }
  }
  if ((await prisma.savingsTarget.count()) === 0) {
    await prisma.savingsTarget.create({
      data: {
        label: "Mục tiêu tiết kiệm",
        currentAmount: 0,
        goalAmount: 50_000_000,
      },
    });
  }
  revalidatePath("/");
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function listExpenses() {
  return prisma.expense.findMany({ orderBy: { date: "desc" } });
}

export async function createExpense(data: {
  date: string;
  amount: number;
  note: string;
  categoryId?: string | null;
}) {
  await prisma.expense.create({
    data: {
      date: data.date,
      amount: Math.round(data.amount),
      note: data.note ?? "",
      categoryId: data.categoryId || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/chi-tieu");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/chi-tieu");
}

export async function listIncomeSources() {
  return prisma.incomeSource.findMany({ orderBy: { name: "asc" } });
}

export async function createIncomeSource(data: {
  name: string;
  amountMonthly: number;
}) {
  await prisma.incomeSource.create({
    data: {
      name: data.name.trim(),
      amountMonthly: Math.round(data.amountMonthly),
    },
  });
  revalidatePath("/");
  revalidatePath("/thu-nhap");
}

export async function updateIncomeSource(
  id: string,
  data: { name: string; amountMonthly: number }
) {
  await prisma.incomeSource.update({
    where: { id },
    data: {
      name: data.name.trim(),
      amountMonthly: Math.round(data.amountMonthly),
    },
  });
  revalidatePath("/");
  revalidatePath("/thu-nhap");
}

export async function deleteIncomeSource(id: string) {
  await prisma.incomeSource.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/thu-nhap");
}

export async function listSavingsTargets() {
  return prisma.savingsTarget.findMany({ orderBy: { id: "asc" } });
}

export async function createSavingsTarget(data: {
  label: string;
  currentAmount: number;
  goalAmount: number;
}) {
  await prisma.savingsTarget.create({
    data: {
      label: data.label.trim(),
      currentAmount: Math.round(data.currentAmount),
      goalAmount: Math.round(data.goalAmount),
    },
  });
  revalidatePath("/");
  revalidatePath("/muc-tieu");
}

export async function updateSavingsTarget(
  id: string,
  patch: Partial<{ label: string; currentAmount: number; goalAmount: number }>
) {
  const data: {
    label?: string;
    currentAmount?: number;
    goalAmount?: number;
  } = {};
  if (patch.label != null) data.label = patch.label.trim();
  if (patch.currentAmount != null)
    data.currentAmount = Math.round(patch.currentAmount);
  if (patch.goalAmount != null) data.goalAmount = Math.round(patch.goalAmount);
  if (Object.keys(data).length === 0) return;

  await prisma.savingsTarget.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/muc-tieu");
}

export async function deleteSavingsTarget(id: string) {
  await prisma.savingsTarget.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/muc-tieu");
}
