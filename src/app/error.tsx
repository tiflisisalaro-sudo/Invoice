"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <h1>ბაზასთან კავშირი ვერ მოხერხდა</h1>
      <p className="muted">
        საიტი ვერ უკავშირდება Supabase-ს — Vercel-ში შეამოწმეთ DATABASE_URL-ის
        პაროლი და გააკეთეთ Redeploy.
      </p>
      <p style={{ marginTop: 16 }}>
        <button type="button" onClick={() => reset()}>
          თავიდან ცდა
        </button>
      </p>
    </div>
  );
}
