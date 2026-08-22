import { notFound } from "next/navigation";
import { InvoiceEditor } from "@/components/InvoiceEditor";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/invoices";
import { formatYmd } from "@/lib/dates";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, products, customers, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    getSettings(),
  ]);
  if (!invoice) notFound();
  if (invoice.status === "void") {
    return (
      <div>
        <h1>რედაქტირება შეუძლებელია</h1>
        <p className="muted">გაუქმებული ინვოისი აღარ იცვლება.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>ინვოისის რედაქტირება {invoice.number}</h1>
      <InvoiceEditor
        products={products}
        customers={customers}
        vatRate={settings.vatRate}
        previewNumber={invoice.number}
        initial={{
          id: invoice.id,
          number: invoice.number,
          issuedAt: formatYmd(invoice.issuedAt),
          dueAt: invoice.dueAt ? formatYmd(invoice.dueAt) : "",
          customerId: invoice.customerId || "",
          customerName: invoice.customerName,
          customerTaxId: invoice.customerTaxId,
          customerAddr: invoice.customerAddr,
          customerPhone: invoice.customerPhone,
          customerContact: invoice.customerContact,
          lines: invoice.lines.map((l) => ({
            name: l.name,
            qty: l.qty,
            unitTetri: l.unitTetri,
          })),
        }}
      />
    </div>
  );
}
