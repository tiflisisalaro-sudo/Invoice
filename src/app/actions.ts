"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeTotals, getSettings, nextInvoiceNumber } from "@/lib/invoices";
import { gelToTetri } from "@/lib/money";
import { parseYmd, todayYmd } from "@/lib/dates";

export async function saveCustomer(formData: FormData) {
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || "").trim(),
    taxId: String(formData.get("taxId") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    contact: String(formData.get("contact") || "").trim(),
  };
  if (!data.name) return;
  if (id) {
    await prisma.customer.update({ where: { id }, data });
  } else {
    await prisma.customer.create({ data });
  }
  revalidatePath("/customers");
  redirect("/customers");
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}

export async function saveProduct(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const price = Number(formData.get("price") || 0);
  if (!name) return;
  const priceTetri = gelToTetri(price);
  if (id) {
    await prisma.product.update({ where: { id }, data: { name, priceTetri } });
  } else {
    const last = await prisma.product.aggregate({ _max: { sortOrder: true } });
    await prisma.product.create({
      data: {
        name,
        priceTetri,
        sortOrder: (last._max.sortOrder ?? 0) + 1,
      },
    });
  }
  revalidatePath("/menu");
}

export async function toggleProduct(id: string, active: boolean) {
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/menu");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/menu");
}

export async function moveProduct(id: string, direction: "up" | "down") {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= products.length) return;
  const a = products[index];
  const b = products[swapWith];
  await prisma.$transaction([
    prisma.product.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.product.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);
  revalidatePath("/menu");
}

export async function saveSettings(formData: FormData) {
  await prisma.setting.update({
    where: { id: "default" },
    data: {
      brandName: String(formData.get("brandName") || ""),
      companyName: String(formData.get("companyName") || ""),
      taxId: String(formData.get("taxId") || ""),
      bank: String(formData.get("bank") || ""),
      swift: String(formData.get("swift") || ""),
      iban: String(formData.get("iban") || ""),
      director: String(formData.get("director") || ""),
      vatRate: Number(formData.get("vatRate") || 0.18),
      invoicePrefix: String(formData.get("invoicePrefix") || ""),
    },
  });
  revalidatePath("/settings");
}

export type InvoicePayload = {
  customerId?: string;
  customerName: string;
  customerTaxId: string;
  customerAddr: string;
  customerPhone: string;
  customerContact: string;
  issuedAt: string;
  dueAt?: string;
  lines: { name: string; qty: number; unitTetri: number }[];
};

export async function createInvoice(payload: InvoicePayload) {
  const settings = await getSettings();
  const lines = payload.lines.filter((l) => l.name && l.qty > 0);
  const totals = computeTotals(lines, settings.vatRate);
  const number = await nextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      number,
      issuedAt: parseYmd(payload.issuedAt || todayYmd()),
      dueAt: payload.dueAt ? parseYmd(payload.dueAt) : null,
      status: "issued",
      customerId: payload.customerId || null,
      customerName: payload.customerName,
      customerTaxId: payload.customerTaxId,
      customerAddr: payload.customerAddr,
      customerPhone: payload.customerPhone,
      customerContact: payload.customerContact,
      ...totals,
      lines: {
        create: lines.map((l, i) => ({
          name: l.name,
          qty: l.qty,
          unitTetri: l.unitTetri,
          totalTetri: Math.round(l.qty * l.unitTetri),
          sortOrder: i,
        })),
      },
    },
  });
  revalidatePath("/invoices");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, payload: InvoicePayload) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.status === "void") return;
  const settings = await getSettings();
  const lines = payload.lines.filter((l) => l.name && l.qty > 0);
  const totals = computeTotals(lines, settings.vatRate);
  await prisma.$transaction([
    prisma.invoiceLine.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        issuedAt: parseYmd(payload.issuedAt || todayYmd()),
        dueAt: payload.dueAt ? parseYmd(payload.dueAt) : null,
        customerId: payload.customerId || null,
        customerName: payload.customerName,
        customerTaxId: payload.customerTaxId,
        customerAddr: payload.customerAddr,
        customerPhone: payload.customerPhone,
        customerContact: payload.customerContact,
        ...totals,
        lines: {
          create: lines.map((l, i) => ({
            name: l.name,
            qty: l.qty,
            unitTetri: l.unitTetri,
            totalTetri: Math.round(l.qty * l.unitTetri),
            sortOrder: i,
          })),
        },
      },
    }),
  ]);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function markInvoicePaid(id: string) {
  await prisma.invoice.update({ where: { id }, data: { status: "paid" } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function voidInvoice(id: string) {
  await prisma.invoice.update({ where: { id }, data: { status: "void" } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function duplicateInvoice(id: string) {
  const src = await prisma.invoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!src) return;
  await createInvoice({
    customerId: src.customerId || undefined,
    customerName: src.customerName,
    customerTaxId: src.customerTaxId,
    customerAddr: src.customerAddr,
    customerPhone: src.customerPhone,
    customerContact: src.customerContact,
    issuedAt: todayYmd(),
    dueAt: undefined,
    lines: src.lines.map((l) => ({
      name: l.name,
      qty: l.qty,
      unitTetri: l.unitTetri,
    })),
  });
}
