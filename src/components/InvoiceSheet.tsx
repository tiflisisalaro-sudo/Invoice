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
          background: #fff;
          color: var(--inv-ink);
          max-width: 860px;
          margin: 0 auto;
          padding: 0;
          border: 1px solid var(--inv-line);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(12, 42, 48, 0.08);
        }
        .inv-accent {
          height: 8px;
          background: linear-gradient(90deg, #0c2a30 0%, #1b6d78 55%, #c4a574 100%);
        }
        .inv-pad { padding: 28px 32px 32px; }
        .inv-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 28px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--inv-line);
        }
        .inv-logo img { display: block; height: 92px; width: auto; }
        .inv-title { text-align: right; }
        .inv-kicker {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--inv-teal);
          font-weight: 700;
        }
        .inv-title h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: -0.03em;
          color: var(--inv-deep);
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
        }
        .inv-card h3 {
          margin: 0 0 12px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--inv-teal);
          border: 0;
        }
        .inv-field { display: grid; grid-template-columns: 92px 1fr; gap: 8px; margin: 0 0 7px; font-size: 13px; }
        .inv-k { color: var(--inv-muted); }
        .inv-v { color: var(--inv-ink); font-weight: 600; word-break: break-word; }
        .inv table {
          width: 100%;
          border-collapse: collapse;
          background: transparent;
        }
        .inv th, .inv td {
          font-size: 13px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--inv-line);
        }
        .inv thead th {
          background: var(--inv-deep);
          color: #eef7f7;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .inv thead th:first-child { border-radius: 8px 0 0 8px; }
        .inv thead th:last-child { border-radius: 0 8px 8px 0; }
        .inv tbody tr:last-child td { border-bottom: 0; }
        .inv .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .inv .idx { width: 42px; color: var(--inv-muted); }
        .inv .qty { width: 72px; }
        .inv .money { width: 110px; }
        .inv-bottom {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          margin-top: 22px;
          align-items: start;
        }
        .inv-words {
          background: var(--inv-teal-soft);
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 13px;
          line-height: 1.45;
        }
        .inv-words span { display: block; color: var(--inv-muted); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
        .inv-tot {
          background: #fff;
          border: 1px solid var(--inv-line);
          border-radius: 12px;
          overflow: hidden;
        }
        .inv-tot-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 16px;
          font-size: 13px;
        }
        .inv-tot-row + .inv-tot-row { border-top: 1px solid var(--inv-line); }
        .inv-tot-row.pay {
          background: var(--inv-deep);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          padding: 14px 16px;
        }
        .inv-pay {
          margin-top: 22px;
          border-top: 1px dashed var(--inv-line);
          padding-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .inv-iban {
          font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
          font-size: 14px;
          letter-spacing: 0.04em;
          background: #f3f7f7;
          padding: 8px 10px;
          border-radius: 8px;
          margin-top: 6px;
        }
        .inv-sign {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-top: 8px;
        }
        .inv-sign-box { min-width: 220px; }
        .inv-sign-line {
          margin-top: 36px;
          border-bottom: 1px solid var(--inv-ink);
          height: 1px;
        }
        .inv-sign-label { margin-top: 8px; font-size: 12px; color: var(--inv-muted); }
        .inv-foot {
          margin-top: 28px;
          font-size: 11px;
          color: var(--inv-muted);
          text-align: center;
        }
        @media print {
          .inv {
            border: 0;
            border-radius: 0;
            box-shadow: none;
            max-width: none;
          }
          .inv-accent { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .inv thead th, .inv-tot-row.pay, .inv-words, .inv-card {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        @media (max-width: 720px) {
          .inv-head, .inv-parties, .inv-bottom, .inv-pay, .inv-sign { grid-template-columns: 1fr; display: grid; }
          .inv-title, .inv-head { text-align: left; }
          .inv-pad { padding: 20px; }
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

        <div className="inv-bottom">
          <div className="inv-words">
            <span>სულ სიტყვიერად</span>
            {amountInWordsKa(invoice.totalTetri)}
          </div>
          <div className="inv-tot">
            <div className="inv-tot-row">
              <span>ჯამი</span>
              <strong>{formatGel(invoice.subtotalTetri)} ₾</strong>
            </div>
            <div className="inv-tot-row">
              <span>მ. შ. დღგ ({vatPct}%)</span>
              <strong>{formatGel(invoice.vatTetri)} ₾</strong>
            </div>
            <div className="inv-tot-row pay">
              <span>გადასახდელი</span>
              <span>{formatGel(invoice.totalTetri)} ₾</span>
            </div>
          </div>
        </div>

        <div className="inv-pay">
          <div>
            <h3 className="inv-kicker" style={{ textAlign: "left", marginBottom: 8 }}>
              ანგარიში
            </h3>
            <div className="inv-iban">{settings.iban}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--inv-muted)" }}>
              {settings.bank}
              {settings.swift ? ` · ${settings.swift}` : ""}
            </div>
          </div>
          <div className="inv-sign">
            <div className="inv-sign-box">
              <div className="inv-sign-line" />
              <div className="inv-sign-label">დირექტორი · {settings.director}</div>
            </div>
          </div>
        </div>
        <div className="inv-foot">{settings.brandName}</div>
      </div>
    </article>
  );
}
