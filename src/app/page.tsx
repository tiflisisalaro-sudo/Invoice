import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatGel } from "@/lib/money";
import { startOfTodayUtcApprox } from "@/lib/dates";
import { StatusBadge } from "@/components/StatusBadge";

export default async function HomePage() {
  const today = startOfTodayUtcApprox();
  const [issued, paid, overdue, products, last] = await Promise.all([
    prisma.invoice.aggregate({
      where: { status: "issued" },
      _sum: { totalTetri: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "paid" },
      _sum: { totalTetri: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "issued", dueAt: { lt: today } },
      _sum: { totalTetri: true },
      _count: true,
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div>
      <h1>რესტორანი ტიფლისი</h1>
      <p className="muted">ონლაინ ინვოისები — მენიუ Excel-იდან არის ჩატვირთული</p>
      <div className="cards">
        <div className="card">
          <div className="muted">გასაცემი</div>
          <div className="val">{formatGel(issued._sum.totalTetri ?? 0)} ₾</div>
          <div className="muted">{issued._count} ინვოისი</div>
        </div>
        <div className="card">
          <div className="muted">ვადაგადაცილებული</div>
          <div className="val">{formatGel(overdue._sum.totalTetri ?? 0)} ₾</div>
          <div className="muted">{overdue._count} ინვოისი</div>
        </div>
        <div className="card">
          <div className="muted">გადახდილი</div>
          <div className="val">{formatGel(paid._sum.totalTetri ?? 0)} ₾</div>
          <div className="muted">{paid._count} ინვოისი</div>
        </div>
        <div className="card">
          <div className="muted">მენიუს პოზიციები</div>
          <div className="val">{products}</div>
        </div>
      </div>
      <div className="toolbar">
        <Link className="btn" href="/invoices/new">ახალი ინვოისი</Link>
        <Link className="btn secondary" href="/invoices">ყველა ინვოისი</Link>
      </div>
      <h2>ბოლო ინვოისები</h2>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>მყიდველი</th>
            <th>თანხა</th>
            <th>სტატუსი</th>
          </tr>
        </thead>
        <tbody>
          {last.map((inv) => (
            <tr key={inv.id}>
              <td>
                <Link href={`/invoices/${inv.id}`}>{inv.number}</Link>
              </td>
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
