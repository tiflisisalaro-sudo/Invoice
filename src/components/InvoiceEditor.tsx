"use client";

import { useMemo, useState } from "react";
import { createInvoice, updateInvoice } from "@/app/actions";
import { formatGel } from "@/lib/money";
import { amountInWordsKa } from "@/lib/georgian-words";
import { todayYmd } from "@/lib/dates";

type Product = { id: string; name: string; priceTetri: number };
type Customer = {
  id: string;
  name: string;
  taxId: string;
  address: string;
  phone: string;
  contact: string;
};
type Line = { name: string; qty: number; unitTetri: number };

export type InvoiceInitial = {
  id: string;
  number: string;
  issuedAt: string;
  dueAt: string;
  customerId: string;
  customerName: string;
  customerTaxId: string;
  customerAddr: string;
  customerPhone: string;
  customerContact: string;
  lines: Line[];
};

export function InvoiceEditor({
  products,
  customers,
  vatRate,
  previewNumber,
  initial,
}: {
  products: Product[];
  customers: Customer[];
  vatRate: number;
  previewNumber: string;
  initial?: InvoiceInitial;
}) {
  const today = todayYmd();
  const [issuedAt, setIssuedAt] = useState(initial?.issuedAt || today);
  const [dueAt, setDueAt] = useState(initial?.dueAt || "");
  const [customerId, setCustomerId] = useState(initial?.customerId || "");
  const [buyer, setBuyer] = useState({
    name: initial?.customerName || "",
    taxId: initial?.customerTaxId || "",
    address: initial?.customerAddr || "",
    phone: initial?.customerPhone || "",
    contact: initial?.customerContact || "",
  });
  const [lines, setLines] = useState<Line[]>(
    initial?.lines.length
      ? initial.lines
      : [{ name: "", qty: 1, unitTetri: 0 }],
  );
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial);

  function pickCustomer(id: string) {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setBuyer({
      name: c.name,
      taxId: c.taxId,
      address: c.address,
      phone: c.phone,
      contact: c.contact,
    });
  }

  function addLine(p?: Product) {
    setLines((prev) => [
      ...prev.filter((l) => l.name || l.unitTetri),
      p
        ? { name: p.name, qty: 1, unitTetri: p.priceTetri }
        : { name: "", qty: 1, unitTetri: 0 },
    ]);
  }

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function removeLine(i: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + Math.round(l.qty * l.unitTetri), 0);
    const vat = Math.round(subtotal - subtotal / (1 + vatRate));
    return { subtotal, vat };
  }, [lines, vatRate]);

  const filtered = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q.toLowerCase()),
  );

  function payload() {
    return {
      customerId: customerId || undefined,
      customerName: buyer.name,
      customerTaxId: buyer.taxId,
      customerAddr: buyer.address,
      customerPhone: buyer.phone,
      customerContact: buyer.contact,
      issuedAt,
      dueAt: dueAt || undefined,
      lines,
    };
  }

  async function submit() {
    setBusy(true);
    try {
      if (initial) await updateInvoice(initial.id, payload());
      else await createInvoice(payload());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <span className="muted">
          {editing ? `ნომერი: ${previewNumber}` : `შემდეგი ნომერი: ${previewNumber}`}
        </span>
        <label>
          თარიღი
          <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
        </label>
        <label>
          გადახდის ვადა
          <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </label>
      </div>

      <div className="form-grid" style={{ marginBottom: 20 }}>
        <label>
          მყიდველი (შენახული)
          <select value={customerId} onChange={(e) => pickCustomer(e.target.value)}>
            <option value="">— ახალი / ხელით —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          დასახელება
          <input value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
        </label>
        <label>
          ს/ნ
          <input value={buyer.taxId} onChange={(e) => setBuyer({ ...buyer, taxId: e.target.value })} />
        </label>
        <label>
          მისამართი
          <input value={buyer.address} onChange={(e) => setBuyer({ ...buyer, address: e.target.value })} />
        </label>
        <label>
          ტელეფონი
          <input value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} />
        </label>
        <label>
          საკონტაქტო პირი
          <input value={buyer.contact} onChange={(e) => setBuyer({ ...buyer, contact: e.target.value })} />
        </label>
      </div>

      <h2>კერძები</h2>
      <div className="toolbar">
        <input
          placeholder="ძებნა მენიუში…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>
      <div style={{ maxHeight: 160, overflow: "auto", marginBottom: 16, border: "1px solid var(--line)", borderRadius: 8 }}>
        {filtered.slice(0, 40).map((p) => (
          <button
            key={p.id}
            type="button"
            className="ghost"
            style={{ margin: 4 }}
            onClick={() => addLine(p)}
          >
            {p.name} — {formatGel(p.priceTetri)}
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>დასახელება</th>
            <th>რაოდ.</th>
            <th>ერთ. ფასი</th>
            <th>ჯამი</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <input
                  value={l.name}
                  onChange={(e) => updateLine(i, { name: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={l.qty}
                  onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={(l.unitTetri / 100).toFixed(2)}
                  onChange={(e) =>
                    updateLine(i, { unitTetri: Math.round(Number(e.target.value) * 100) })
                  }
                  style={{ width: 100 }}
                />
              </td>
              <td>{formatGel(Math.round(l.qty * l.unitTetri))}</td>
              <td>
                <button type="button" className="ghost" onClick={() => removeLine(i)}>
                  წაშლა
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="toolbar">
        <button type="button" className="secondary" onClick={() => addLine()}>
          ცარიელი ხაზი
        </button>
      </div>

      <div className="card" style={{ maxWidth: 360, marginLeft: "auto" }}>
        <div>ჯამი (GEL): <strong>{formatGel(totals.subtotal)}</strong></div>
        <div>მ. შ. დღგ ({Math.round(vatRate * 100)}%): <strong>{formatGel(totals.vat)}</strong></div>
        <div>გადასახდელი: <strong>{formatGel(totals.subtotal)}</strong></div>
        <p className="muted">{amountInWordsKa(totals.subtotal)}</p>
      </div>

      <div className="toolbar">
        <button type="button" disabled={busy} onClick={submit}>
          {busy ? "ინახება…" : editing ? "ცვლილებების შენახვა" : "ინვოისის გამოცემა"}
        </button>
      </div>
    </div>
  );
}
