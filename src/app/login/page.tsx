import { login, setInitialPassword } from "@/app/login-actions";
import { getPasswordState } from "@/lib/password";

const errors: Record<string, string> = {
  "1": "პაროლი არასწორია",
  short: "პაროლი უნდა იყოს მინიმუმ 4 სიმბოლო",
  mismatch: "პაროლები არ ემთხვევა",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const state = await getPasswordState();
  const message = error ? errors[error] : "";

  return (
    <div className="login-wrap">
      <div className="login-card">
        <img className="login-logo" src="/tiflisi-logo.png" alt="ტიფლისი" />
        {state.needsSetup ? (
          <>
            <h1>პაროლის დაყენება</h1>
            <p className="muted">პირველი შესვლა — დააყენეთ საიტის პაროლი</p>
            {message ? <p className="err">{message}</p> : null}
            <form action={setInitialPassword} className="stack">
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
                გაიმეორეთ პაროლი
                <input
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={4}
                />
              </label>
              <button type="submit">დაყენება</button>
            </form>
          </>
        ) : (
          <>
            <h1>შესვლა</h1>
            <p className="muted">რესტორანი ტიფლისი — ინვოისები</p>
            {message ? <p className="err">{message}</p> : null}
            <form action={login} className="stack">
              <label>
                პაროლი
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  autoFocus
                />
              </label>
              <button type="submit">შესვლა</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
