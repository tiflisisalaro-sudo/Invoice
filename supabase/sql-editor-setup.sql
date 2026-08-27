-- ტიფლისი — ინვოისის ბაზა (Supabase SQL Editor)
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
  'რესტორანი "ტიფლისი"',
  'შპს "ტიფლისი"',
  '445575011',
  'სს ტერა ბანკი',
  'TBCBGE22  TEBAGE22',
  'GE67KS0000000360207268',
  'ნუკრი შარაძე',
  0.18,
  '2026',
  100
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Product" ("id", "name", "priceTetri", "active", "sortOrder")
SELECT * FROM (VALUES
  ('prod-001', 'ტრადიციული ქართული სალათი', 1400, true, 0),
  ('prod-002', 'ტრადიციული ქართული სალათი ნიგვზით', 1600, true, 1),
  ('prod-003', 'ქათმის სალათი', 1750, true, 2),
  ('prod-004', 'რუკოლა სალათი თაფლის სოუსით', 2000, true, 3),
  ('prod-005', 'ენის სალათი', 2000, true, 4),
  ('prod-006', 'ბერძნული სალათი', 2000, true, 5),
  ('prod-007', 'მწნილის ასორტი', 1200, true, 6),
  ('prod-008', 'სალათი კამეჩის ყველით და პესტო', 2500, true, 7),
  ('prod-009', 'ცეზარი ქათმით', 2450, true, 8),
  ('prod-010', 'კარამელიზირებული მსხლის სალათი ლურჯი ყველით და თაფლის სოუსით', 2800, true, 9),
  ('prod-011', 'მანგო ავოკადოს სალათი  ვეფხისებრი კრევეტებით და ტკბილ ცხარე სოუსით', 3700, true, 10),
  ('prod-012', 'ცეზარი კრევეტებით', 3950, true, 11),
  ('prod-013', 'შერეული ყველის ასორტი', 3250, true, 12),
  ('prod-014', 'ფხალის დაფა', 2200, true, 13),
  ('prod-015', 'ხრაშუნა პური პომიდვრით და ნივრით', 2000, true, 14),
  ('prod-016', 'მარილში გამოყვანილი ორაგული კრემ-ყველით', 4200, true, 15),
  ('prod-017', 'კომბოსტო ნიგვზით', 1600, true, 16),
  ('prod-018', 'მწვანილის ასორტი', 1200, true, 17),
  ('prod-019', 'იმერული ყველი', 1400, true, 18),
  ('prod-020', 'სულგუნი ყველი', 1600, true, 19),
  ('prod-021', 'ბადრიჯანი ნიგვზით', 1300, true, 20),
  ('prod-022', 'ხრაშუნა ბერძნული ტიროპიტა', 2200, true, 21),
  ('prod-023', 'მწვანე პომიდვრის მწნილი ნიგვზით', 1200, true, 22),
  ('prod-024', 'ქათმის ხრაშუნა ხვეულა (ბლინები)', 1850, true, 23),
  ('prod-025', 'ხორციანი ბლინები (4ცალი)', 1750, true, 24),
  ('prod-026', 'შემწვარი სულგუნი', 2200, true, 25),
  ('prod-027', 'აჯაფსანდალი', 1700, true, 26),
  ('prod-028', 'მინი ჩებურეკი', 1650, true, 27),
  ('prod-029', 'სოკოს კრემ სუპი', 1800, true, 28),
  ('prod-030', 'გოგრის კრემ სუპი', 1800, true, 29),
  ('prod-031', 'ტრადიციული ჩიხირთმა', 1900, true, 30),
  ('prod-032', 'თათარიახნი', 1900, true, 31),
  ('prod-033', 'სუპ-ხარჩო', 2000, true, 32),
  ('prod-034', 'ჩაქაფული ხბოს ხორცით', 3050, true, 33),
  ('prod-035', 'ჩაქაფული ბატკნის ხორცით', 3700, true, 34),
  ('prod-036', 'პილმენის წვნიანი', 1950, true, 35),
  ('prod-037', 'პიცა მარგარიტა', 2200, true, 36),
  ('prod-038', 'პიცა პეპერონი', 2500, true, 37),
  ('prod-039', 'პიცა ბოსტნეულის', 2000, true, 38),
  ('prod-040', 'პიცა მიქსი', 2800, true, 39),
  ('prod-041', 'ლაზური ხაჭაპური', 2800, true, 40),
  ('prod-042', 'ხაჭაპური შამფურზე', 2700, true, 41),
  ('prod-043', 'ლობიანი', 1600, true, 42),
  ('prod-044', 'ლობიანი რაჭული ლორით', 2600, true, 43),
  ('prod-045', 'აჭარული ხაჭაპური', 1900, true, 44),
  ('prod-046', 'ხაჭაპური იმერული', 1950, true, 45),
  ('prod-047', 'ხაჭაპური მეგრული', 2500, true, 46),
  ('prod-048', 'გურული ღვეზელი', 1900, true, 47),
  ('prod-049', 'კუბდარი', 3300, true, 48),
  ('prod-050', 'ელარჯი', 1650, true, 49),
  ('prod-051', 'მჭადი 1ც', 250, true, 50),
  ('prod-052', 'ჭვიშტარი', 1050, true, 51),
  ('prod-053', 'პურის ასორტი', 400, true, 52),
  ('prod-054', 'კეცზე მჭადი', 400, true, 53),
  ('prod-055', 'ტყემალი', 420, true, 54),
  ('prod-056', 'საწებელი', 420, true, 55),
  ('prod-057', 'არაჟანი', 400, true, 56),
  ('prod-058', 'ბაჟე', 1500, true, 57),
  ('prod-059', 'ხინკალი ქალაქური', 230, true, 58),
  ('prod-060', 'ხინკალი მთიულური', 230, true, 59),
  ('prod-061', 'ხინკალი საქონლის ხორცით', 250, true, 60),
  ('prod-062', 'ხინკალი სოკოთი', 250, true, 61),
  ('prod-063', 'ხინკალი ყველით', 300, true, 62),
  ('prod-064', 'ხინკალი კარტოფილით', 200, true, 63),
  ('prod-065', 'ხინკლუკა (15 ცალი)', 1500, true, 64),
  ('prod-066', 'ხინკლუკა ნაღების სოუსში (15 ცალი)', 2200, true, 65),
  ('prod-067', 'შემწვარი ხინკალი სოუსით (5ცალი)', 1850, true, 66),
  ('prod-068', 'ხინკალი სახლური', 320, true, 67),
  ('prod-069', 'ბატკნის ნეკნები რატატუით საფერავის სოუსით', 12000, true, 68),
  ('prod-070', 'შეფ ბურგერი დიდი', 4200, true, 69),
  ('prod-071', 'შეფ ბურგერი პატარა', 2800, true, 70),
  ('prod-072', 'მეგრული კუპატი', 2800, true, 71),
  ('prod-073', 'გახსნილი მეგრული კუპატი', 2800, true, 72),
  ('prod-074', 'ხბოს მწვადი', 3150, true, 73),
  ('prod-075', 'ხბოს ნეკნი აჯიკით', 3700, true, 74),
  ('prod-076', 'ღორის მწვადი', 2200, true, 75),
  ('prod-077', 'ღორის ნეკნის მწვადი', 2450, true, 76),
  ('prod-078', 'ღორის ჩალაღაჯი', 3750, true, 77),
  ('prod-079', 'ღორის სუკის მწვადი', 4750, true, 78),
  ('prod-080', 'ქათმის მწვადი', 1950, true, 79),
  ('prod-081', 'ჯოსპერში მომზადებული ბოსტნეული', 2400, true, 80),
  ('prod-082', 'ქაბაბი', 1850, true, 81),
  ('prod-083', 'ქათმის ქაბაბი', 1850, true, 82),
  ('prod-084', 'ცხვრის ქაბაბი', 2500, true, 83),
  ('prod-085', 'კარბონარა', 2800, true, 84),
  ('prod-086', 'ალ არაბიატა', 1850, true, 85),
  ('prod-087', 'რიზოტო ქათმით და პარმეზანით', 2800, true, 86),
  ('prod-088', 'რიზოტო კრევეტებით და პარმეზანით', 4700, true, 87),
  ('prod-089', 'ტრადიციული ტოლმა ნივრით და მაწვნით', 1800, true, 88),
  ('prod-090', 'ტოლმა სამარხვო', 1500, true, 89),
  ('prod-091', 'ტრადიციული წიწილა (შქმერული,)', 4600, true, 90),
  ('prod-092', 'ოსტრი', 2800, true, 91),
  ('prod-093', 'მოთუშული ხბოს ხორცი პომიდვრით', 3000, true, 92),
  ('prod-094', 'ხბოს გულ-ღვიძლის ყაურმა კახურად', 2650, true, 93),
  ('prod-095', 'ტრადიციული ხაშლამა ნივრის სოუსით', 3100, true, 94),
  ('prod-096', 'ლობიო ქოთანში', 1500, true, 95),
  ('prod-097', 'ლობიო ქოთანში ლორით', 1950, true, 96),
  ('prod-098', 'ოჯახური ღორის ხორცით', 2900, true, 97),
  ('prod-099', 'ოჯახური ხბოს ხორცით', 3100, true, 98),
  ('prod-100', 'ოჯახური სოკოთი სამარხვო', 1850, true, 99),
  ('prod-101', 'ხბოს ხორცო ბროწეულში', 3700, true, 100),
  ('prod-102', 'ქათმის გულ-ღვიძლი', 2500, true, 101),
  ('prod-103', 'კანჭი გამომცხვარი კარტოფილით ჯოსპერში', 12500, true, 102),
  ('prod-104', 'ქამა სოკო კეცზე', 1800, true, 103),
  ('prod-105', 'სოკოს ჩაშუშული', 1950, true, 104),
  ('prod-106', 'ქამა სოკო ყველის და ნივრის შიგთავსით', 2200, true, 105),
  ('prod-107', 'მეგრული ხარჩო', 3500, true, 106),
  ('prod-108', 'მეგრული ხარჩო სოკოთი სამარხვო', 3000, true, 107),
  ('prod-109', 'ჩაქონდრილი', 3500, true, 108),
  ('prod-110', 'ჟულიენი', 3000, true, 109),
  ('prod-111', 'სინორი', 3000, true, 110),
  ('prod-112', 'კალმახი', 2350, true, 111),
  ('prod-113', 'პანკოში შემწვარი კრევეტები', 4600, true, 112),
  ('prod-114', 'სიბასი ჯოსპერში მომზადებული ბოსტნეულით', 4500, true, 113),
  ('prod-115', 'დორადო ჯოსპერში მომზადებული ბოსტნეულით', 4500, true, 114),
  ('prod-116', 'ორაგულის ფილე ასპარაგუსით და ჰოლანდიური სოუსით', 6750, true, 115),
  ('prod-117', 'ქართული ზუთხი ფარშირებული ტყის სოკოთი და ნაღების სოუსით', 6550, true, 116),
  ('prod-118', 'შემწვარი ვეფხისებრი კრევეტები პომიდვრის სალსით და ღვინის სოუსით', 6500, true, 117),
  ('prod-119', 'მოთუშული მიდიები ღვინის სოუსში', 7000, true, 118),
  ('prod-120', 'კარტოფილი ფრი', 1000, true, 119),
  ('prod-121', 'ბრინჯი ბოსტნეულით', 1500, true, 120),
  ('prod-122', 'კარტოფილი მექსიკურად', 1500, true, 121),
  ('prod-123', 'კარტოფილი ოჯახურად', 1400, true, 122),
  ('prod-124', 'გამომცხვარი კარტოფილი', 1800, true, 123),
  ('prod-125', 'ნაყინის ასორტიმენტი', 1000, true, 124),
  ('prod-126', 'ქართული ჩირის და თხილის ასორტი', 3200, true, 125),
  ('prod-127', 'ხილის სალათი', 2000, true, 126),
  ('prod-128', 'ნაყინი ფორთოხლით ფორთოხალში', 2350, true, 127),
  ('prod-129', 'ფონდანტე', 1950, true, 128),
  ('prod-130', 'კამეჩის მაწონი კაკლის მურაბით', 1350, true, 129),
  ('prod-131', 'ფრანგული კრეპი', 1950, true, 130),
  ('prod-132', 'ხილის ასორტი', 3500, true, 131),
  ('prod-133', 'ნამცხვარი ნიგვზით', 400, true, 132),
  ('prod-134', 'ჩეხური ბაქლავა', 800, true, 133),
  ('prod-135', 'მედოკი', 1300, true, 134),
  ('prod-136', 'ღვინო ხვანჭკარა 1ლ', 8000, true, 135),
  ('prod-137', 'ღვინო ტვიში ნ/ტკბ 1ლ', 2500, true, 136),
  ('prod-138', 'წყალი', 400, true, 137),
  ('prod-139', 'ნაბეღლავი', 400, true, 138),
  ('prod-140', 'კოკა კოლა', 400, true, 139),
  ('prod-141', 'ლიმონათი', 400, true, 140),
  ('prod-142', 'ესპრესსო', 600, true, 141),
  ('prod-143', 'კაპუჩინო', 750, true, 142),
  ('prod-144', 'ამერიკანო', 650, true, 143),
  ('prod-145', 'თურქული ყავა', 400, true, 144),
  ('prod-146', 'შავი ჩაი', 600, true, 145),
  ('prod-147', 'მწვანე ჩაი', 600, true, 146)
) AS v("id", "name", "priceTetri", "active", "sortOrder")
WHERE NOT EXISTS (SELECT 1 FROM "Product" LIMIT 1);
