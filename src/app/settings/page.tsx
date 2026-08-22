import { saveSettings } from "@/app/actions";
import { getSettings } from "@/lib/invoices";

export default async function SettingsPage() {
  const s = await getSettings();
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
    </div>
  );
}
