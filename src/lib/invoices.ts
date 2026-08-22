import { prisma } from "./db";
import { lineTotalTetri, vatIncludedTetri } from "./money";

export async function getSettings() {
  const s = await prisma.setting.findUnique({ where: { id: "default" } });
  if (!s) throw new Error("Settings missing. Run npm run db:setup");
  return s;
}

export type LineInput = { name: string; qty: number; unitTetri: number };

export function computeTotals(lines: LineInput[], vatRate: number) {
  const subtotalTetri = lines.reduce(
    (sum, l) => sum + lineTotalTetri(l.qty, l.unitTetri),
    0,
  );
  const vatTetri = vatIncludedTetri(subtotalTetri, vatRate);
  return { subtotalTetri, vatTetri, totalTetri: subtotalTetri };
}

export async function nextInvoiceNumber() {
  return prisma.$transaction(async (tx) => {
    const s = await tx.setting.findUniqueOrThrow({ where: { id: "default" } });
    const n = s.lastNumber + 1;
    await tx.setting.update({
      where: { id: "default" },
      data: { lastNumber: n },
    });
    return `${s.invoicePrefix}-${String(n).padStart(3, "0")}`;
  });
}
