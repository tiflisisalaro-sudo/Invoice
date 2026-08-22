import { saveProduct } from "@/app/actions";
import { MenuTable } from "@/components/MenuTable";
import { prisma } from "@/lib/db";

export default async function MenuPage() {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1>მენიუ</h1>
      <p className="muted">
        შეცვალეთ დასახელება ან ფასი და დააჭირეთ შენახვას. ისრებით გადაადგილეთ რიგი.
      </p>
      <form action={saveProduct} className="toolbar">
        <input name="name" placeholder="დასახელება" required />
        <input name="price" type="number" step="0.01" placeholder="ფასი ₾" required />
        <button type="submit">დამატება</button>
      </form>
      <MenuTable products={products} />
    </div>
  );
}
