"use client";

import {
  createExpense,
  deleteExpense,
  listCategories,
  listExpenses,
} from "@/actions/budget";
import { formatVnd } from "@/lib/format";
import {
  endOfMonth,
  format,
  isWithinInterval,
  parse,
  parseISO,
  startOfMonth,
} from "date-fns";
import { vi } from "date-fns/locale";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_CATEGORIES, EMPTY_EXPENSES } from "@/lib/empty";
import type { Category, Expense } from "@/lib/types";

function monthValue(d: Date) {
  return format(d, "yyyy-MM");
}

function todayISODate() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function ExpensesPage() {
  const [monthStr, setMonthStr] = useState(monthValue(new Date()));
  const [date, setDate] = useState(todayISODate);
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ex, setEx] = useState<Expense[]>(EMPTY_EXPENSES);
  const [cats, setCats] = useState<Category[]>(EMPTY_CATEGORIES);

  const load = useCallback(async () => {
    const [e, c] = await Promise.all([listExpenses(), listCategories()]);
    setEx(e);
    setCats(c);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthStart = useMemo(
    () => startOfMonth(parse(monthStr, "yyyy-MM", new Date())),
    [monthStr]
  );
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);

  const inMonth = useMemo(() => {
    return ex.filter((e) =>
      isWithinInterval(parseISO(e.date), {
        start: monthStart,
        end: monthEnd,
      })
    );
  }, [ex, monthStart, monthEnd]);

  const byDay = useMemo(() => {
    const map = new Map<string, Expense[]>();
    const sorted = [...inMonth].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    for (const e of sorted) {
      const k = e.date;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [inMonth]);

  const catName = (id?: string | null) =>
    cats.find((c) => c.id === id)?.name ?? "—";

  async function addExpenseForm(ev: React.FormEvent) {
    ev.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, ""), 10) || 0;
    if (amount <= 0) return;
    await createExpense({
      date,
      amount,
      note: note.trim(),
      categoryId: categoryId || null,
    });
    setAmountStr("");
    setNote("");
    await load();
  }

  async function remove(id: string) {
    await deleteExpense(id);
    await load();
  }

  const monthTotal = inMonth.reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1 text-xs text-teal-300/90">
          Tháng xem
          <input
            type="month"
            value={monthStr}
            onChange={(ev) => setMonthStr(ev.target.value)}
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-base text-teal-50"
          />
        </label>
        <p className="text-sm text-teal-200/80">
          Tổng tháng:{" "}
          <strong className="text-amber-200">{formatVnd(monthTotal)}</strong>
        </p>
      </div>

      <form
        onSubmit={addExpenseForm}
        className="space-y-3 rounded-2xl border border-teal-800/40 bg-teal-900/25 p-4"
      >
        <h2 className="text-sm font-medium text-teal-100">Thêm khoản chi</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-teal-300/80">
            Ngày
            <input
              type="date"
              required
              value={date}
              onChange={(ev) => setDate(ev.target.value)}
              className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-teal-300/80">
            Số tiền (VNĐ)
            <input
              type="text"
              inputMode="numeric"
              placeholder="vd. 150000"
              value={amountStr}
              onChange={(ev) => setAmountStr(ev.target.value)}
              className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-teal-300/80">
          Danh mục
          <select
            value={categoryId}
            onChange={(ev) => setCategoryId(ev.target.value)}
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
          >
            <option value="">— Không chọn —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-teal-300/80">
          Ghi chú
          <input
            type="text"
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
            placeholder="Tùy chọn"
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-teal-600 py-3 text-sm font-medium text-white active:bg-teal-700 sm:w-auto sm:px-8"
        >
          Lưu chi tiêu
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-medium text-teal-200/90">
          Theo ngày trong tháng
        </h2>
        {byDay.size === 0 ? (
          <p className="rounded-xl border border-dashed border-teal-800/50 py-8 text-center text-sm text-teal-500">
            Chưa có chi tiêu trong tháng này.
          </p>
        ) : (
          <ul className="space-y-4">
            {[...byDay.entries()].map(([day, rows]) => (
              <li key={day}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-teal-500">
                  {format(parseISO(day), "EEEE, d MMMM", { locale: vi })}
                </p>
                <ul className="space-y-2">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-teal-800/30 bg-teal-950/50 px-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-amber-100 tabular-nums">
                          {formatVnd(row.amount)}
                        </p>
                        <p className="text-xs text-teal-400">
                          {catName(row.categoryId)}
                          {row.note ? ` · ${row.note}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="shrink-0 rounded-lg px-3 py-1 text-xs text-red-400 hover:bg-red-950/50"
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
