import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const items = JSON.parse(readFileSync(join(root, "menu-seed.json"), "utf8"));

function sqlStr(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

const productRows = items
  .map((item, i) => {
    const id = `prod-${String(i + 1).padStart(3, "0")}`;
    const tetri = Math.round(item.price * 100);
    return `  (${sqlStr(id)}, ${sqlStr(item.name)}, ${tetri}, true, ${i})`;
  })
  .join(",\n");

const sql = `-- ტიფლისი — ინვოისის ბაზა (Supabase SQL Editor)
-- გაუშვით ერთხელ: Dashboard → SQL Editor → New query → Paste → Run
-- უსაფრთხოა ხელახლა გაშვება: არსებული ცხრილები/მონაცემები არ იშლება.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "swift" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.18,
    "invoicePrefix" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "contact" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceTetri" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'issued',
    "customerId" TEXT,
    "customerName" TEXT NOT NULL DEFAULT '',
    "customerTaxId" TEXT NOT NULL DEFAULT '',
    "customerAddr" TEXT NOT NULL DEFAULT '',
    "customerPhone" TEXT NOT NULL DEFAULT '',
    "customerContact" TEXT NOT NULL DEFAULT '',
    "subtotalTetri" INTEGER NOT NULL DEFAULT 0,
    "vatTetri" INTEGER NOT NULL DEFAULT 0,
    "totalTetri" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitTetri" INTEGER NOT NULL,
    "totalTetri" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_number_key" ON "Invoice"("number");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_customerId_fkey'
  ) THEN
    ALTER TABLE "Invoice"
      ADD CONSTRAINT "Invoice_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceLine_invoiceId_fkey'
  ) THEN
    ALTER TABLE "InvoiceLine"
      ADD CONSTRAINT "InvoiceLine_invoiceId_fkey"
      FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';

-- Prisma აპი ბაზას postgres მომხმარებლით უკავშირდება.
-- RLS ჩართულია, რომ anon/authenticated გასაღებით ცხრილები საჯაროდ არ იკითხებოდეს.
ALTER TABLE "Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceLine" ENABLE ROW LEVEL SECURITY;

INSERT INTO "Setting" (
  "id", "brandName", "companyName", "taxId", "bank", "swift", "iban",
  "director", "vatRate", "invoicePrefix", "lastNumber"
) VALUES (
  'default',
  ${sqlStr('რესტორანი "ტიფლისი"')},
  ${sqlStr('შპს "ტიფლისი"')},
  '445575011',
  ${sqlStr("სს ტერა ბანკი")},
  'TBCBGE22  TEBAGE22',
  'GE67KS0000000360207268',
  ${sqlStr("ნუკრი შარაძე")},
  0.18,
  '2026',
  100
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Product" ("id", "name", "priceTetri", "active", "sortOrder")
SELECT * FROM (VALUES
${productRows}
) AS v("id", "name", "priceTetri", "active", "sortOrder")
WHERE NOT EXISTS (SELECT 1 FROM "Product" LIMIT 1);
`;

const outDir = join(root, "supabase");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "sql-editor-setup.sql");
writeFileSync(outFile, sql, "utf8");
console.log(`Wrote ${outFile} (${items.length} products)`);
