import Link from "next/link";
import { notFound } from "next/navigation";
import { duplicateInvoice, markInvoicePaid, voidInvoice } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/invoices";
import { InvoiceSheet } from "@/components/InvoiceSheet";
import { StatusBadge } from "@/components/StatusBadge";

export default async function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    }),
    getSettings(),
  ]);
  if (!invoice) notFound();

  return (
    <div>
      <div className="toolbar no-print">
        <Link className="btn" href={`/invoices/${invoice.id}/print`}>
          ბეჭდვა / PDF
        </Link>
        {invoice.status !== "void" && (
          <Link className="btn secondary" href={`/invoices/${invoice.id}/edit`}>
            რედაქტირება
          </Link>
        )}
        <form action={duplicateInvoice.bind(null, invoice.id)}>
          <button type="submit" className="secondary">დუბლირება</button>
        </form>
        {invoice.status === "issued" && (
          <form action={markInvoicePaid.bind(null, invoice.id)}>
            <button type="submit">მონიშნე გადახდილად</button>
          </form>
        )}
        {invoice.status !== "void" && (
          <form action={voidInvoice.bind(null, invoice.id)}>
            <button type="submit" className="secondary">გაუქმება</button>
          </form>
        )}
        <StatusBadge status={invoice.status} dueAt={invoice.dueAt} />
      </div>
      <InvoiceSheet invoice={invoice} settings={settings} />
    </div>
  );
}
