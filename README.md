# ტიფლისი — ონლაინ ინვოისი

რესტორან ტიფლისის ინვოისების სისტემა. ბაზა: **Supabase (PostgreSQL)**. კოდი: **GitHub**. ცოცხალი საიტი: **Vercel** (GitHub Pages-ზე Next.js სერვერი არ მუშაობს).

## 1. Supabase ბაზა

1. გახსენით [https://supabase.com/dashboard](https://supabase.com/dashboard) და შექმენით პროექტი (მაგ. `tiflisi-invoice`).
2. **Project Settings → Database → Connection string**:
   - **Transaction pooler** (პორტი `6543`) → `DATABASE_URL`
   - **Session / Direct** (პორტი `5432`) → `DIRECT_URL`
3. დააკოპირეთ `.env.example` → `.env.local` და ჩასვით სტრიქონები.

```bash
npm install
npx prisma generate
npm run db:setup
npm run dev
```

გახსენით http://localhost:3000

პაროლი: `.env.local` → `APP_PASSWORD`

## 2. GitHub + Vercel

რეპო უნდა იყოს **private** (IBAN, ს/ნ და პაროლი არ უნდა იყოს საჯარო).

Vercel-ზე დაამატეთ იგივე ცვლადები:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_PASSWORD`

შემდეგ: **Deploy**.
