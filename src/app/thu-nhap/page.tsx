"use client";

import {
  createIncomeSource,
  deleteIncomeSource,
  listIncomeSources,
  updateIncomeSource,
} from "@/actions/budget";
import { formatVnd } from "@/lib/format";
import { useCallback, useEffect, useState } from "react";
import type { IncomeSource } from "@/lib/types";

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

export default function IncomePage() {
  const [name, setName] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [rows, setRows] = useState<IncomeSource[]>([]);

  const load = useCallback(async () => {
    setRows(await listIncomeSources());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = rows.reduce((s, r) => s + r.amountMonthly, 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(digitsOnly(amountStr), 10) || 0;
    if (!name.trim() || amount <= 0) return;
    await createIncomeSource({ name: name.trim(), amountMonthly: amount });
    setName("");
    setAmountStr("");
    await load();
  }

  function startEdit(r: IncomeSource) {
    setEditingId(r.id);
    setEditName(r.name);
    setEditAmount(String(r.amountMonthly));
  }

  async function saveEdit() {
    if (!editingId) return;
    const amount = parseInt(digitsOnly(editAmount), 10) || 0;
    if (!editName.trim() || amount <= 0) return;
    await updateIncomeSource(editingId, {
      name: editName.trim(),
      amountMonthly: amount,
    });
    setEditingId(null);
    await load();
  }

  async function remove(id: string) {
    await deleteIncomeSource(id);
    if (editingId === id) setEditingId(null);
    await load();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-teal-300/85">
        Nguồn thu <strong className="text-teal-100">hàng tháng</strong> (lương,
        phụ cấp…). Tổng dùng cho bảng tổng quan.
      </p>
      <p className="text-sm">
        Tổng thu / tháng:{" "}
        <strong className="text-emerald-300">{formatVnd(total)}</strong>
      </p>

      <form
        onSubmit={add}
        className="space-y-3 rounded-2xl border border-teal-800/40 bg-teal-900/25 p-4"
      >
        <h2 className="text-sm font-medium text-teal-100">Thêm nguồn thu</h2>
        <label className="flex flex-col gap-1 text-xs text-teal-300/80">
          Tên
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="vd. Lương"
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 text-teal-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-teal-300/80">
          Số tiền / tháng (VNĐ)
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="vd. 15000000"
            value={amountStr}
            onChange={(e) => setAmountStr(digitsOnly(e.target.value))}
            className="rounded-xl border border-teal-700 bg-teal-950 px-3 py-2 font-medium tabular-nums text-teal-50"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white active:bg-teal-700"
        >
          Thêm
        </button>
      </form>

      <ul className="space-y-2">
        {rows.length === 0 && (
          <li className="rounded-xl border border-dashed border-teal-800/50 py-8 text-center text-sm text-teal-500">
            Chưa có nguồn thu. Thêm ít nhất một dòng để tính thu tháng.
          </li>
        )}
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-teal-800/30 bg-teal-950/50 p-3"
          >
            {editingId === r.id ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-teal-700 bg-teal-950 px-2 py-2 text-teal-50"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={editAmount}
                  onChange={(e) => setEditAmount(digitsOnly(e.target.value))}
                  className="w-full rounded-lg border border-teal-700 bg-teal-950 px-2 py-2 font-medium tabular-nums text-teal-50"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-teal-700 px-4 py-2 text-sm text-teal-200"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-teal-50">{r.name}</p>
                  <p className="text-sm text-emerald-300 tabular-nums">
                    {formatVnd(r.amountMonthly)}/tháng
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    className="rounded-lg px-3 py-2 text-xs text-teal-300 hover:bg-teal-900/50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/40"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
