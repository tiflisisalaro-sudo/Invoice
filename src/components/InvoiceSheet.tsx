import { formatGel } from "@/lib/money";
import { amountInWordsKa } from "@/lib/georgian-words";
import { formatYmd } from "@/lib/dates";
import type { Invoice, InvoiceLine, Setting } from "@prisma/client";

type Inv = Invoice & { lines: InvoiceLine[] };

function text(value?: string | null) {
  const v = (value || "").trim();
  return v || "—";
}

function formatQty(qty: number) {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function Field({ label, value }: { label: string; value?: string | null }) {
  const v = (value || "").trim();
  if (!v) return null;
  return (
    <div className="inv-field">
      <span className="inv-k">{label}</span>
      <span className="inv-v">{v}</span>
    </div>
  );
}

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
    <article className="inv">
      <style>{`
        .inv {
          --inv-ink: #10282e;
          --inv-muted: #5b7479;
          --inv-line: #dce8ea;
          --inv-teal: #1b6d78;
          --inv-teal-soft: #e8f4f5;
          --inv-deep: #0c2a30;
          --inv-gold: #c4a574;
          background: #fff;
          color: var(--inv-ink);
          max-width: 860px;
          margin: 0 auto;
          padding: 0;
          border: 1px solid var(--inv-line);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(12, 42, 48, 0.08);
          container-type: inline-size;
          container-name: invoice;
        }
        .inv-accent {
          height: 7px;
          background: linear-gradient(90deg, #0c2a30 0%, #1b6d78 55%, var(--inv-gold) 100%);
        }
        .inv-pad { padding: 28px 32px 32px; }
        .inv-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--inv-line);
        }
        .inv-logo img { display: block; height: 92px; width: auto; }
        .inv-title { text-align: right; min-width: 0; }
        .inv-kicker {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--inv-teal);
          font-weight: 700;
        }
        .inv-sec {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--inv-teal);
        }
        .inv-title h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.03em;
          color: var(--inv-deep);
          line-height: 1.1;
        }
        .inv-no {
          margin-top: 10px;
          display: inline-block;
          background: var(--inv-teal-soft);
          color: var(--inv-teal);
          font-weight: 700;
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 999px;
        }
        .inv-dates {
          margin-top: 12px;
          font-size: 13px;
          color: var(--inv-muted);
          display: grid;
          gap: 3px;
        }
        .inv-dates strong { color: var(--inv-ink); font-weight: 600; }
        .inv-parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 22px 0 26px;
        }
        .inv-card {
          background: #f7fbfb;
          border: 1px solid var(--inv-line);
          border-radius: 12px;
          padding: 16px 18px;
          min-width: 0;
        }
        .inv-card h3 {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 700;
          color: var(--inv-teal);
          border: 0;
        }
        .inv-field { display: grid; grid-template-columns: 88px 1fr; gap: 8px; margin: 0 0 7px; font-size: 13px; }
        .inv-k { color: var(--inv-muted); }
        .inv-v { color: var(--inv-ink); font-weight: 600; word-break: break-word; }
        .inv-table-wrap { overflow-x: auto; }
        .inv table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: transparent;
        }
        .inv th, .inv td {
          font-size: 13px;
          padding: 11px 12px;
          border-bottom: 1px solid var(--inv-line);
        }
        .inv thead th {
          background: var(--inv-deep);
          color: #eef7f7;
          font-size: 11px;
          font-weight: 600;
          border-bottom: 0;
        }
        .inv thead th:first-child { border-radius: 10px 0 0 10px; }
        .inv thead th:last-child { border-radius: 0 10px 10px 0; }
        .inv tbody tr:nth-child(even) td { background: #f7fbfb; }
        .inv tbody tr:last-child td { border-bottom: 0; }
        .inv .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .inv .idx { width: 42px; color: var(--inv-muted); }
        .inv .qty { width: 72px; }
        .inv .money { width: 108px; }
        .inv-bottom {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(220px, 0.75fr);
          gap: 16px;
          margin-top: 22px;
          align-items: stretch;
        }
        .inv-words {
          background: var(--inv-teal-soft);
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
        }
        .inv-words span {
          display: block;
          color: var(--inv-muted);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .inv-tot {
          background: #fff;
          border: 1px solid var(--inv-line);
          border-radius: 12px;
          overflow: hidden;
          min-width: 0;
        }
        .inv-tot-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          padding: 10px 16px;
          font-size: 13px;
        }
        .inv-tot-row + .inv-tot-row { border-top: 1px solid var(--inv-line); }
        .inv-tot-row.pay {
          background: var(--inv-deep);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          padding: 14px 16px;
        }
        .inv-tot-row .amt { white-space: nowrap; font-variant-numeric: tabular-nums; }
        .inv-pay {
          margin-top: 22px;
          border-top: 1px dashed var(--inv-line);
          padding-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: end;
        }
        .inv-iban {
          font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
          font-size: 14px;
          letter-spacing: 0.03em;
          background: #f3f7f7;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid var(--inv-line);
          word-break: break-all;
        }
        .inv-bank { margin-top: 8px; font-size: 13px; color: var(--inv-muted); }
        .inv-sign {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .inv-sign-marks {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 10px;
        }
        .inv-sign-marks img {
          display: block;
          width: auto;
          object-fit: contain;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .inv-sign-img { height: 76px; }
        .inv-stamp-img { height: 82px; }
        .inv-sign-label { margin-top: 4px; font-size: 12px; color: var(--inv-muted); text-align: right; }
        .inv-foot {
          margin-top: 28px;
          font-size: 11px;
          color: var(--inv-muted);
          text-align: center;
        }
        @container invoice (max-width: 640px) {
          .inv-head { flex-direction: column; gap: 16px; }
          .inv-title { text-align: left; }
          .inv-parties, .inv-bottom, .inv-pay { grid-template-columns: 1fr; }
          .inv-sign { align-items: flex-start; }
          .inv-sign-marks, .inv-sign-label { justify-content: flex-start; text-align: left; }
          .inv-pad { padding: 20px; }
        }
        @media print {
          .inv {
            border: 0;
            border-radius: 0;
            box-shadow: none;
            max-width: none;
          }
          .inv-accent, .inv thead th, .inv-tot-row.pay, .inv-words, .inv-card, .inv-sign-marks img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="inv-accent" />
      <div className="inv-pad">
        <header className="inv-head">
          <div className="inv-logo">
            <img src="/tiflisi-logo.png" alt='რესტორანი "ტიფლისი"' />
          </div>
          <div className="inv-title">
            <p className="inv-kicker">Invoice</p>
            <h1>ინვოისი</h1>
            <div className="inv-no">№ {invoice.number}</div>
            <div className="inv-dates">
              <div>
                თარიღი: <strong>{date}</strong>
              </div>
              {invoice.dueAt ? (
                <div>
                  გადახდის ვადა: <strong>{formatYmd(invoice.dueAt)}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="inv-parties">
          <section className="inv-card">
            <h3>გამყიდველი</h3>
            <Field label="დასახელება" value={settings.companyName} />
            <Field label="ს/ნ" value={settings.taxId} />
            <Field label="ბანკი" value={settings.bank} />
            <Field label="SWIFT" value={settings.swift} />
          </section>
          <section className="inv-card">
            <h3>მყიდველი</h3>
            <Field label="დასახელება" value={text(invoice.customerName)} />
            <Field label="ს/ნ" value={invoice.customerTaxId} />
            <Field label="მისამართი" value={invoice.customerAddr} />
            <Field label="ტელეფონი" value={invoice.customerPhone} />
            <Field label="კონტაქტი" value={invoice.customerContact} />
          </section>
        </div>

        <div className="inv-table-wrap">
          <table>
            <thead>
              <tr>
                <th className="idx">№</th>
                <th>დასახელება</th>
                <th className="num qty">რაოდ.</th>
                <th className="num money">ერთ. ფასი</th>
                <th className="num money">ჯამი</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((l, i) => (
                <tr key={l.id}>
                  <td className="idx">{i + 1}</td>
                  <td>{l.name}</td>
                  <td className="num">{formatQty(l.qty)}</td>
                  <td className="num">{formatGel(l.unitTetri)}</td>
                  <td className="num">{formatGel(l.totalTetri)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="inv-bottom">
          <div className="inv-words">
            <span>სულ სიტყვიერად</span>
            {amountInWordsKa(invoice.totalTetri)}
          </div>
          <div className="inv-tot">
            <div className="inv-tot-row">
              <span>ჯამი</span>
              <strong className="amt">{formatGel(invoice.subtotalTetri)} ₾</strong>
            </div>
            <div className="inv-tot-row">
              <span>მ. შ. დღგ ({vatPct}%)</span>
              <strong className="amt">{formatGel(invoice.vatTetri)} ₾</strong>
            </div>
            <div className="inv-tot-row pay">
              <span>გადასახდელი</span>
              <span className="amt">{formatGel(invoice.totalTetri)} ₾</span>
            </div>
          </div>
        </div>

        <div className="inv-pay">
          <div>
            <h3 className="inv-sec">ანგარიში</h3>
            <div className="inv-iban">{settings.iban}</div>
            <div className="inv-bank">
              {settings.bank}
              {settings.swift ? ` · ${settings.swift}` : ""}
            </div>
          </div>
          <div className="inv-sign">
            <div className="inv-sign-marks">
              <img
                className="inv-sign-img"
                src="/director-signature.png"
                alt=""
              />
              <img
                className="inv-stamp-img"
                src="/tiflisi-stamp.png"
                alt='ბეჭედი რესტორანი "ტიფლისი"'
              />
            </div>
            <div className="inv-sign-label">დირექტორი · {settings.director}</div>
          </div>
        </div>
        <div className="inv-foot">{settings.brandName}</div>
      </div>
    </article>
  );
}
