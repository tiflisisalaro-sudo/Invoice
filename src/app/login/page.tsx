import { login } from "@/app/login-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <img src="/tiflisi-logo.png" alt="ტიფლისი" className="login-logo" />
        <h1>შესვლა</h1>
        <p className="muted">რესტორანი ტიფლისი — ინვოისები</p>
        {error ? <p className="err">პაროლი არასწორია</p> : null}
        <form action={login} className="stack">
          <label>
            პაროლი
            <input name="password" type="password" autoFocus required />
          </label>
          <button type="submit">შესვლა</button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>
          საწყისი პაროლი: tiflisi (შეცვალეთ APP_PASSWORD)
        </p>
      </div>
    </div>
  );
}
