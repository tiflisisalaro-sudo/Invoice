# ტიფლისი — ონლაინ ინვოისი

რესტორან ტიფლისის ინვოისების სისტემა. ბაზა: **Supabase (PostgreSQL)**. კოდი: **GitHub**. ცოცხალი საიტი: **Vercel** (GitHub Pages-ზე Next.js სერვერი არ მუშაობს).

## 1. Supabase ბაზა

1. გახსენით [https://supabase.com/dashboard](https://supabase.com/dashboard) და შექმენით პროექტი (მაგ. `tiflisi-invoice`). დაელოდეთ, სანამ პროექტი მზად იქნება.
2. **SQL Editor → New query**. გახსენით ფაილი `supabase/sql-editor-setup.sql`, დააკოპირეთ მთლიანი ტექსტი, ჩასვით და დააჭირეთ **Run**.
   ეს შექმნის ცხრილებს, კომპანიის პარამეტრებს და 147 კერძს მენიუდან.
3. **Project Settings → Database → Connection string**:
   - **Transaction pooler** (პორტი `6543`) → `DATABASE_URL`
   - **Session / Direct** (პორტი `5432`) → `DIRECT_URL`
4. დააკოპირეთ `.env.example` → `.env.local` და ჩასვით სტრიქონები.
   `APP_PASSWORD` არასავალდებულოა: თუ ცარიელია, პირველ შესვლაზე საიტი პაროლის დაყენებას მოგთხოვთ.
   პაროლის შეცვლა შეიძლება **პარამეტრებიდან**.

```bash
npm install
npx prisma generate
npm run dev
```

გახსენით http://localhost:3000

თუ SQL უკვე გაუშვით Editor-ში, `npm run db:setup` აღარ გჭირდებათ.

არსებულ ბაზაზე პაროლის სვეტის დასამატებლად SQL Editor-ში გაუშვით:

```sql
ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
```

## 2. GitHub + Vercel

რეპო უნდა იყოს **private** (IBAN, ს/ნ და პაროლი არ უნდა იყოს საჯარო).

Vercel-ზე დაამატეთ იგივე ცვლადები:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_PASSWORD` (არასავალდებულო, სანამ პაროლს პარამეტრებში დააყენებთ)

შემდეგ: **Deploy**.
