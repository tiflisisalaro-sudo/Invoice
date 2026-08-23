import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/invoices";
import { InvoiceSheet } from "@/components/InvoiceSheet";

export default async function PrintPage({
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
      <p className="no-print muted" style={{ maxWidth: 860, margin: "0 auto 16px" }}>
        ბეჭდვისთვის გამოიყენეთ Ctrl+P — აირჩიეთ Save as PDF
      </p>
      <InvoiceSheet invoice={invoice} settings={settings} />
    </div>
  );
}
