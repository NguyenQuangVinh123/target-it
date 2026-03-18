"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  avgMonthlyExpenseLastN,
  computeTargetProjection,
  sumExpensesInMonth,
} from "@/lib/target-math";
import { formatVnd } from "@/lib/format";
import { addMonths, format } from "date-fns";
import { useMemo, useState } from "react";
import {
  EMPTY_EXPENSES,
  EMPTY_INCOMES,
  EMPTY_TARGETS,
} from "@/lib/empty";

const AVG_MONTHS_OPTIONS = [3, 6, 12] as const;

export default function DashboardPage() {
  const [avgN, setAvgN] = useState<(typeof AVG_MONTHS_OPTIONS)[number]>(3);
  const [horizon, setHorizon] = useState(12);

  const expensesQ = useLiveQuery(() => db.expenses.toArray(), []);
  const incomesQ = useLiveQuery(() => db.incomeSources.toArray(), []);
  const allTargetsQ = useLiveQuery(() => db.savingsTargets.toArray(), []);
  const expenses = expensesQ ?? EMPTY_EXPENSES;
  const incomes = incomesQ ?? EMPTY_INCOMES;
  const allTargets = allTargetsQ ?? EMPTY_TARGETS;
  const targetRow = allTargets[0];

  const monthlyIncome = useMemo(
    () => incomes.reduce((s, i) => s + i.amountMonthly, 0),
    [incomes]
  );
  const expenseThisMonth = useMemo(
    () => sumExpensesInMonth(expenses, new Date()),
    [expenses]
  );
  const avgExpense = useMemo(
    () => avgMonthlyExpenseLastN(expenses, avgN, new Date()),
    [expenses, avgN]
  );
  const netThisMonth = monthlyIncome - expenseThisMonth;
  const netVsAvgExpense = monthlyIncome - avgExpense;

  const proj = targetRow
    ? computeTargetProjection(
        monthlyIncome,
        expenseThisMonth,
        avgExpense,
        targetRow.currentAmount,
        targetRow.goalAmount
      )
    : null;

  const progress =
    targetRow && targetRow.goalAmount > 0
      ? Math.min(
          100,
          Math.round(
            (targetRow.currentAmount / targetRow.goalAmount) * 100
          )
        )
      : 0;

  const extra12 = proj?.extraPerMonthForHorizon(horizon) ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-teal-800/40 bg-teal-900/30 p-4">
        <h2 className="mb-3 text-sm font-medium text-teal-200/90">
          Dòng tiền tháng này
        </h2>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-teal-300/80">Tổng thu (tháng)</dt>
            <dd className="font-medium tabular-nums text-emerald-300">
              {formatVnd(monthlyIncome)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-teal-300/80">Chi tháng này</dt>
            <dd className="font-medium tabular-nums text-amber-200">
              {formatVnd(expenseThisMonth)}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-teal-800/30 pt-2">
            <dt className="text-teal-100">Ròng (thu − chi tháng)</dt>
            <dd
              className={`font-semibold tabular-nums ${
                netThisMonth >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {formatVnd(netThisMonth)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-teal-800/40 bg-teal-900/30 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-teal-200/90">
            So sánh với TB chi
          </h2>
          <label className="flex items-center gap-2 text-xs text-teal-300/90">
            <span>TB</span>
            <select
              value={avgN}
              onChange={(e) =>
                setAvgN(Number(e.target.value) as (typeof AVG_MONTHS_OPTIONS)[number])
              }
              className="rounded-lg border border-teal-700 bg-teal-950 px-2 py-1.5 text-teal-100"
            >
              {AVG_MONTHS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} tháng
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mb-2 text-xs text-teal-400/80">
          TB chi {avgN} tháng gần nhất:{" "}
          <strong className="text-teal-100">{formatVnd(avgExpense)}</strong>
          /tháng
        </p>
        <div className="flex justify-between gap-2 text-sm">
          <span className="text-teal-300/80">Ròng vs TB chi</span>
          <span
            className={`font-semibold tabular-nums ${
              netVsAvgExpense >= 0 ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {formatVnd(netVsAvgExpense)}
          </span>
        </div>
      </section>

      {targetRow && proj ? (
        <section className="rounded-2xl border border-teal-700/50 bg-gradient-to-b from-teal-900/50 to-teal-950/80 p-4">
          <h2 className="mb-1 text-sm font-medium text-teal-100">
            {targetRow.label}
          </h2>
          <p className="mb-3 text-xs text-teal-400">
            Còn thiếu:{" "}
            <strong className="text-amber-200">{formatVnd(proj.gap)}</strong>
          </p>
          <div
            className="mb-4 h-3 overflow-hidden rounded-full bg-teal-950"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ mục tiêu"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-teal-300/90">
            Đã có {formatVnd(targetRow.currentAmount)} /{" "}
            {formatVnd(targetRow.goalAmount)} ({progress}%)
          </p>

          <div className="mt-4 space-y-3 border-t border-teal-800/40 pt-4 text-sm">
            <h3 className="text-xs font-medium uppercase tracking-wide text-teal-400">
              Dự kiến đạt mục tiêu
            </h3>
            <div className="rounded-lg bg-teal-950/60 p-3">
              <p className="text-xs text-teal-400">Theo ròng tháng này</p>
              {proj.monthsThisMonth === 0 ? (
                <p className="mt-1 text-emerald-300">
                  Đã đạt hoặc vượt mục tiêu.
                </p>
              ) : proj.monthsThisMonth != null ? (
                <p className="mt-1 font-medium text-teal-50">
                  ~{proj.monthsThisMonth} tháng
                  <span className="ml-1 block text-xs font-normal text-teal-400/90">
                    (dự kiến ~{format(addMonths(new Date(), proj.monthsThisMonth), "MM/yyyy")})
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-red-300/90">
                  Chi ≥ thu theo tháng này — không đủ dòng tiền dư để gom vào mục
                  tiêu theo kịch bản hiện tại.
                </p>
              )}
            </div>
            <div className="rounded-lg bg-teal-950/60 p-3">
              <p className="text-xs text-teal-400">
                Theo ròng với TB chi {avgN} tháng
              </p>
              {proj.monthsAvg === 0 ? (
                <p className="mt-1 text-emerald-300">
                  Đã đạt hoặc vượt mục tiêu.
                </p>
              ) : proj.monthsAvg != null ? (
                <p className="mt-1 font-medium text-teal-50">
                  ~{proj.monthsAvg} tháng
                  <span className="ml-1 block text-xs font-normal text-teal-400/90">
                    (dự kiến ~{format(addMonths(new Date(), proj.monthsAvg), "MM/yyyy")})
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-red-300/90">
                  Với mức chi trung bình hiện tại, thu không đủ để tích lũy đều
                  đặn vào mục tiêu.
                </p>
              )}
            </div>
          </div>

          {(proj.netThisMonth <= 0 || proj.netVsAvgExpense <= 0) &&
            proj.gap > 0 && (
              <div className="mt-4 rounded-lg border border-amber-800/40 bg-amber-950/30 p-3 text-sm">
                <p className="mb-2 text-amber-200/90">
                  Gợi ý: nếu muốn đạt mục tiêu trong{" "}
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={horizon}
                      onChange={(e) =>
                        setHorizon(
                          Math.max(1, parseInt(e.target.value, 10) || 12)
                        )
                      }
                      className="w-14 rounded border border-amber-800/50 bg-teal-950 px-1 py-0.5 text-center text-teal-50"
                    />
                  </label>{" "}
                  tháng (chỉ hướng tiết kiệm), cần dành khoảng
                </p>
                {extra12 != null && (
                  <p className="text-lg font-semibold text-amber-100">
                    {formatVnd(extra12)} / tháng
                  </p>
                )}
                <p className="mt-2 text-xs text-amber-200/60">
                  Con số = khoảng cách mục tiêu ÷ số tháng; chưa bao gồm bù thâm
                  hụt chi tiêu hàng tháng.
                </p>
              </div>
            )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-teal-700/50 bg-teal-950/40 p-6 text-center">
          <p className="text-sm text-teal-200/90">
            Chưa có mục tiêu tiết kiệm. Vào tab{" "}
            <strong className="text-teal-100">Mục tiêu</strong> để thêm — dự báo
            sẽ hiển thị ở đây.
          </p>
        </section>
      )}
    </div>
  );
}
