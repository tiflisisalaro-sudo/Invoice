import { formatGel } from "@/lib/money";
import { amountInWordsKa } from "@/lib/georgian-words";
import { formatYmd } from "@/lib/dates";
import type { Invoice, InvoiceLine, Setting } from "@prisma/client";

type Inv = Invoice & { lines: InvoiceLine[] };

export function InvoiceSheet({
  invoice,
  settings,
}: {
  invoice: Inv;
  settings: Setting;
}) {
  const date = formatYmd(invoice.issuedAt);
  const vatPct = Math.round(settings.vatRate * 100);
  return (
    <article className="sheet">
      <style>{`
        .sheet { background:#fff; padding:28px; max-width:900px; margin:0 auto; border:1px solid #ddd; }
        .sheet-head { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; margin-bottom:16px; }
        .sheet-logo { background:transparent; padding:0; }
        .sheet-logo img { display:block; height:88px; width:auto; }
        .sheet h1 { text-align:right; margin:0; }
        .sheet .en { text-align:right; letter-spacing:2px; color:#555; }
        .sheet .brand { text-align:right; font-weight:700; margin-bottom:8px; }
        .meta { text-align:right; margin-bottom:20px; }
        .cols { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:20px; }
        .cols h3 { margin:0 0 8px; font-size:14px; border-bottom:1px solid #ccc; }
        .sheet table { width:100%; }
        .sheet th, .sheet td { font-size:10px; }
        .tot { text-align:right; margin-top:12px; }
        .sign { margin-top:36px; }
        @media print {
          .sheet { border: none; }
        }
      `}</style>
      <div className="sheet-head">
        <div className="sheet-logo">
          <img src="/tiflisi-logo.png" alt='რესტორანი "ტიფლისი"' />
        </div>
        <div>
          <h1>ინვოისი</h1>
          <div className="en">INVOICE</div>
          <div className="brand">{settings.brandName}</div>
        </div>
      </div>
      <div className="meta">
        <div>ინვოისის №: <strong>{invoice.number}</strong></div>
        <div>თარიღი: {date}</div>
        {invoice.dueAt ? <div>გადახდის ვადა: {formatYmd(invoice.dueAt)}</div> : null}
      </div>
      <div className="cols">
        <div>
          <h3>გამყიდველი</h3>
          <div>დასახელება: {settings.companyName}</div>
          <div>ს/ნ: {settings.taxId}</div>
          <div>ბანკი: {settings.bank}</div>
          <div>ბანკის კოდი / SWIFT: {settings.swift}</div>
          <div>ანგარიში: {settings.iban}</div>
        </div>
        <div>
          <h3>მყიდველი</h3>
          <div>დასახელება: {invoice.customerName}</div>
          <div>ს/ნ: {invoice.customerTaxId}</div>
          <div>მისამართი: {invoice.customerAddr}</div>
          <div>ტელეფონი: {invoice.customerPhone}</div>
          <div>საკონტაქტო პირი: {invoice.customerContact}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>დასახელება</th>
            <th>რაოდ.</th>
            <th>ერთ. ფასი</th>
            <th>ჯამი</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((l, i) => (
            <tr key={l.id}>
              <td>{i + 1}</td>
              <td>{l.name}</td>
              <td>{l.qty}</td>
              <td>{formatGel(l.unitTetri)}</td>
              <td>{formatGel(l.totalTetri)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tot">
        <div>ჯამი (GEL): <strong>{formatGel(invoice.subtotalTetri)}</strong></div>
        <div>მ. შ. დღგ ({vatPct}%): <strong>{formatGel(invoice.vatTetri)}</strong></div>
        <div>სულ სიტყვიერად: {amountInWordsKa(invoice.totalTetri)}</div>
        <div>გადასახდელი თანხა: <strong>{formatGel(invoice.totalTetri)} ₾</strong></div>
      </div>
      <div className="sign">დირექტორი: {settings.director}</div>
    </article>
  );
}
