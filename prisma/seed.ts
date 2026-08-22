import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type MenuItem = { name: string; price: number };

async function main() {
  const raw = readFileSync(join(process.cwd(), "menu-seed.json"), "utf8");
  const items: MenuItem[] = JSON.parse(raw);

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: 'რესტორანი "ტიფლისი"',
      companyName: 'შპს "ტიფლისი"',
      taxId: "445575011",
      bank: "სს ტერა ბანკი",
      swift: "TBCBGE22  TEBAGE22",
      iban: "GE67KS0000000360207268",
      director: "ნუკრი შარაძე",
      vatRate: 0.18,
      invoicePrefix: "2026",
      lastNumber: 100,
    },
  });

  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({
      data: items.map((item, i) => ({
        name: item.name,
        priceTetri: Math.round(item.price * 100),
        sortOrder: i,
      })),
    });
  }

  console.log(`Ready. Menu items: ${await prisma.product.count()}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
