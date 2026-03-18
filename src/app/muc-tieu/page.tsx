"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, genId } from "@/lib/db";
import { useState } from "react";

export default function TargetsPage() {
  const [label, setLabel] = useState("");
  const [currentStr, setCurrentStr] = useState("");
  const [goalStr, setGoalStr] = useState("");
  const rows = useLiveQuery(() => db.savingsTargets.toArray(), []) ?? [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const current = parseInt(currentStr.replace(/\D/g, ""), 10) || 0;
    const goal = parseInt(goalStr.replace(/\D/g, ""), 10) || 0;
    if (!label.trim() || goal <= 0) return;
    await db.savingsTargets.add({
      id: genId(),
      label: label.trim(),
      currentAmount: current,
      goalAmount: goal,
    });
    setLabel("");
    setCurrentStr("");
    setGoalStr("");
  }

  async function updateField(
    id: string,
    patch: Partial<{ currentAmount: number; goalAmount: number; label: string }>
  ) {
    await db.savingsTargets.update(id, patch);
  }

  async function remove(id: string) {
    await db.savingsTargets.delete(id);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-teal-300/85">
        <strong className="text-teal-100">Hiện có</strong> và{" "}
        <strong className="text-teal-100">mục tiêu</strong> tiết kiệm. Trang
        tổng quan dùng <strong>mục tiêu đầu tiên</strong> trong danh sách để dự
        báo.
      </p>

      <form
        onSubmit={add}
        className="space-y-3 rounded-2xl border border-teal-800/40 bg-teal-900/25 p-4"
      >
        <h2 className="text-sm font-medium text-teal-100">Thêm mục tiêu</h2>
        <label className="flex flex-col gap-1 text-xs text-teal-300/80">
          Tên mục tiêu
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="vd. Mua nhà"
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-teal-300/80">
            Đã có (VNĐ)
            <input
              type="text"
              inputMode="numeric"
              value={currentStr}
              onChange={(e) => setCurrentStr(e.target.value)}
              placeholder="0"
              className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-teal-300/80">
            Mục tiêu (VNĐ)
            <input
              type="text"
              inputMode="numeric"
              value={goalStr}
              onChange={(e) => setGoalStr(e.target.value)}
              className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white active:bg-teal-700"
        >
          Thêm mục tiêu
        </button>
      </form>

      <ul className="space-y-4">
        {rows.map((r, idx) => (
          <li
            key={r.id}
            className="rounded-2xl border border-teal-800/40 bg-teal-950/40 p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  defaultValue={r.label}
                  key={`l-${r.id}-${r.label}`}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== r.label) updateField(r.id, { label: v });
                  }}
                  className="mb-1 w-full rounded-lg border border-teal-700 bg-teal-950 px-2 py-2 font-medium text-teal-50"
                />
                {idx === 0 && (
                  <span className="inline-block rounded bg-teal-800/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-teal-200">
                    Dùng trên tổng quan
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-400"
              >
                Xóa
              </button>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-teal-500">Hiện có</dt>
                <dd>
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue={String(r.currentAmount)}
                    key={`c-${r.id}-${r.currentAmount}`}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      if (!Number.isNaN(v) && v >= 0 && v !== r.currentAmount) {
                        updateField(r.id, { currentAmount: v });
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-teal-700 bg-teal-950 px-2 py-2 text-teal-50 tabular-nums"
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-teal-500">Mục tiêu</dt>
                <dd>
                  <input
                    type="text"
                    inputMode="numeric"
                    defaultValue={String(r.goalAmount)}
                    key={`g-${r.id}-${r.goalAmount}`}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                      if (!Number.isNaN(v) && v > 0 && v !== r.goalAmount) {
                        updateField(r.id, { goalAmount: v });
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-teal-700 bg-teal-950 px-2 py-2 text-teal-50 tabular-nums"
                  />
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-teal-500">
              Công thức tổng quan: khoảng cách = mục tiêu − hiện có; số tháng ước
              tính ≈ khoảng cách ÷ dòng tiền ròng (khi ròng &gt; 0).
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
