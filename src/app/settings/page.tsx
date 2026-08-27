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

  return (
    <div>
      <h1>პარამეტრები</h1>
      <p className="muted">
        ბოლო გამოცემული ნომერი: {s.invoicePrefix}-{String(s.lastNumber).padStart(3, "0")}
      </p>
      <form action={saveSettings} className="stack">
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
          ბანკი
          <input name="bank" defaultValue={s.bank} />
        </label>
        <label>
          SWIFT
          <input name="swift" defaultValue={s.swift} />
        </label>
        <label>
          ანგარიში
          <input name="iban" defaultValue={s.iban} />
        </label>
        <label>
          დირექტორი
          <input name="director" defaultValue={s.director} />
        </label>
        <label>
          დღგ (მაგ. 0.18)
          <input name="vatRate" type="number" step="0.01" defaultValue={s.vatRate} />
        </label>
        <label>
          ინვოისის პრეფიქსი (წელი)
          <input name="invoicePrefix" defaultValue={s.invoicePrefix} />
        </label>
        <button type="submit">შენახვა</button>
      </form>

      <div className="card settings-sec">
        <h2>საიტის პაროლი</h2>
        <p className="muted">
          {pwState.stored
            ? "აქ შეგიძლიათ შეცვალოთ შესვლის პაროლი."
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
      </div>
    </div>
  );
}
