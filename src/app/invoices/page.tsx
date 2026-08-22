import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatGel } from "@/lib/money";
import { formatYmd, startOfTodayUtcApprox } from "@/lib/dates";
import { displayStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const invoices = await prisma.invoice.findMany({
    where: {
      AND: [
        status && status !== "overdue" ? { status } : {},
        status === "overdue"
          ? { status: "issued", dueAt: { lt: startOfTodayUtcApprox() } }
          : {},
        q
          ? {
              OR: [
                { number: { contains: q } },
                { customerName: { contains: q } },
                { customerTaxId: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>ინვოისები</h1>
      <form className="toolbar" method="get">
        <input name="q" defaultValue={q} placeholder="ნომერი, მყიდველი, ს/ნ…" />
        <select name="status" defaultValue={status}>
          <option value="">ყველა სტატუსი</option>
          <option value="issued">გამოცემული</option>
          <option value="overdue">ვადაგადაცილებული</option>
          <option value="paid">გადახდილი</option>
          <option value="void">გაუქმებული</option>
        </select>
        <button type="submit">ძებნა</button>
        <Link className="btn" href="/invoices/new">
          ახალი ინვოისი
        </Link>
      </form>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>თარიღი</th>
            <th>ვადა</th>
            <th>მყიდველი</th>
            <th>ჯამი</th>
            <th>სტატუსი</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>
                <Link href={`/invoices/${inv.id}`}>{inv.number}</Link>
              </td>
              <td>{formatYmd(inv.issuedAt)}</td>
              <td>{inv.dueAt ? formatYmd(inv.dueAt) : "—"}</td>
              <td>{inv.customerName || "—"}</td>
              <td>{formatGel(inv.totalTetri)} ₾</td>
              <td>
                <StatusBadge status={inv.status} dueAt={inv.dueAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
