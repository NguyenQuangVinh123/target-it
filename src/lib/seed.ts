import { db, genId } from "./db";

const DEFAULT_CATEGORIES = [
  { name: "Ăn uống", sortOrder: 0 },
  { name: "Di chuyển", sortOrder: 1 },
  { name: "Hóa đơn & nhà cửa", sortOrder: 2 },
  { name: "Giải trí", sortOrder: 3 },
  { name: "Sức khỏe", sortOrder: 4 },
  { name: "Khác", sortOrder: 5 },
];

/**
 * Chạy một lần khi DB trống: danh mục mặc định + một mục tiêu tiết kiệm mẫu.
 */
export async function ensureSeed(): Promise<void> {
  await db.transaction("rw", db.categories, db.savingsTargets, async () => {
    if ((await db.categories.count()) === 0) {
      for (const c of DEFAULT_CATEGORIES) {
        await db.categories.add({
          id: genId(),
          name: c.name,
          sortOrder: c.sortOrder,
        });
      }
    }
    if ((await db.savingsTargets.count()) === 0) {
      await db.savingsTargets.add({
        id: genId(),
        label: "Mục tiêu tiết kiệm",
        currentAmount: 0,
        goalAmount: 50_000_000,
      });
    }
  });
}
