import { InvoiceEditor } from "@/components/InvoiceEditor";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/invoices";

export default async function NewInvoicePage() {
  const [products, customers, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    getSettings(),
  ]);
  const preview = `${settings.invoicePrefix}-${String(settings.lastNumber + 1).padStart(3, "0")}`;
  return (
    <div>
      <h1>ახალი ინვოისი</h1>
      <InvoiceEditor
        products={products}
        customers={customers}
        vatRate={settings.vatRate}
        previewNumber={preview}
      />
    </div>
  );
}
