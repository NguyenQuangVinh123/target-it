import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Ăn uống", sortOrder: 0 },
  { name: "Di chuyển", sortOrder: 1 },
  { name: "Hóa đơn & nhà cửa", sortOrder: 2 },
  { name: "Giải trí", sortOrder: 3 },
  { name: "Sức khỏe", sortOrder: 4 },
  { name: "Khác", sortOrder: 5 },
];

async function main() {
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    for (const c of DEFAULT_CATEGORIES) {
      await prisma.category.create({ data: c });
    }
    console.log("Seeded categories.");
  }

  const targetCount = await prisma.savingsTarget.count();
  if (targetCount === 0) {
    await prisma.savingsTarget.create({
      data: {
        label: "Mục tiêu tiết kiệm",
        currentAmount: 0,
        goalAmount: 50_000_000,
      },
    });
    console.log("Seeded default savings target.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
