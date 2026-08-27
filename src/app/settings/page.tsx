import { saveSettings } from "@/app/actions";
import { changePassword } from "@/app/login-actions";
import { getSettings } from "@/lib/invoices";
import { getPasswordState } from "@/lib/password";

const pwMessages: Record<string, { text: string; ok?: boolean }> = {
  ok: { text: "პაროლი შენახულია", ok: true },
  current: { text: "მიმდინარე პაროლი არასწორია" },
  short: { text: "ახალი პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო" },
  mismatch: { text: "ახალი პაროლები არ ემთხვევა" },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const [{ pw }, s, pwState] = await Promise.all([
    searchParams,
    getSettings(),
    getPasswordState(),
  ]);
  const notice = pw ? pwMessages[pw] : undefined;
  const lastInvoice = `${s.invoicePrefix}-${String(s.lastNumber).padStart(3, "0")}`;

  return (
    <div className="settings-page">
      <header className="settings-head">
        <div>
          <h1>პარამეტრები</h1>
          <p className="muted">ეს მონაცემები იბეჭდება ინვოისზე</p>
        </div>
        <div className="settings-meta">
          ბოლო გამოცემული ნომერი
          <strong>{lastInvoice}</strong>
        </div>
      </header>

      <div className="settings-layout">
        <form action={saveSettings} className="settings-main">
          <section className="card">
            <h2>კომპანია</h2>
            <div className="form-grid">
              <label>
                ბრენდი
                <input name="brandName" defaultValue={s.brandName} />
              </label>
              <label>
                იურიდიული დასახელება
                <input name="companyName" defaultValue={s.companyName} />
              </label>
              <label>
                ს/ნ
                <input name="taxId" defaultValue={s.taxId} />
              </label>
              <label>
                დირექტორი
                <input name="director" defaultValue={s.director} />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>ბანკი</h2>
            <div className="form-grid">
              <label>
                ბანკი
                <input name="bank" defaultValue={s.bank} />
              </label>
              <label>
                SWIFT
                <input name="swift" defaultValue={s.swift} />
              </label>
              <label className="settings-span-2">
                ანგარიში (IBAN)
                <input name="iban" defaultValue={s.iban} />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>ინვოისი</h2>
            <div className="form-grid">
              <label>
                დღგ (მაგ. 0.18)
                <input name="vatRate" type="number" step="0.01" defaultValue={s.vatRate} />
              </label>
              <label>
                ინვოისის პრეფიქსი (წელი)
                <input name="invoicePrefix" defaultValue={s.invoicePrefix} />
              </label>
            </div>
            <div className="settings-actions">
              <button type="submit">შენახვა</button>
            </div>
          </section>
        </form>

        <aside className="settings-side">
          <section className="card">
            <h2>საიტის პაროლი</h2>
            <p className="muted">
              {pwState.stored
                ? "შესვლის პაროლის შეცვლა. ძველი პაროლი აღარ იმუშავებს."
                : pwState.envSet
                  ? "ახლა პაროლი გარემოს ცვლადიდანაა. აქ დააყენეთ ახალი პაროლი, რომელიც ბაზაში შეინახება."
                  : "დააყენეთ პაროლი, რომ საიტზე მხოლოდ თქვენ შეხვიდეთ."}
            </p>
            {notice ? (
              <p className={notice.ok ? "ok-msg" : "err"}>{notice.text}</p>
            ) : null}
            <form action={changePassword} className="stack">
              {pwState.configured ? (
                <label>
                  მიმდინარე პაროლი
                  <input
                    name="current"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
              ) : null}
              <label>
                ახალი პაროლი
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={4}
                />
              </label>
              <label>
                გაიმეორეთ ახალი პაროლი
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={4}
                />
              </label>
              <button type="submit">
                {pwState.stored ? "პაროლის შეცვლა" : "პაროლის დაყენება"}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
