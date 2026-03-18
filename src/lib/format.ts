const fmt = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVnd(n: number): string {
  return fmt.format(Math.round(n));
}

export function inputMoneyToNumber(s: string): number {
  const cleaned = s.replace(/\D/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}
