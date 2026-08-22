"use client";

import {
  deleteProduct,
  moveProduct,
  saveProduct,
  toggleProduct,
} from "@/app/actions";
import { formatGel } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  priceTetri: number;
  active: boolean;
};

export function MenuTable({ products }: { products: Product[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 90 }}>რიგი</th>
          <th>დასახელება</th>
          <th style={{ width: 120 }}>ფასი ₾</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {products.map((p, i) => (
          <tr key={p.id} style={{ opacity: p.active ? 1 : 0.45 }}>
            <td>
              <div className="row-actions">
                <form action={moveProduct.bind(null, p.id, "up")}>
                  <button
                    className="ghost icon"
                    type="submit"
                    disabled={i === 0}
                    title="მაღლა"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveProduct.bind(null, p.id, "down")}>
                  <button
                    className="ghost icon"
                    type="submit"
                    disabled={i === products.length - 1}
                    title="დაბლა"
                  >
                    ↓
                  </button>
                </form>
              </div>
            </td>
            <td colSpan={3}>
              <form action={saveProduct} className="row-actions">
                <input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} required style={{ flex: 1, minWidth: 180 }} />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={formatGel(p.priceTetri)}
                  required
                  style={{ width: 110 }}
                />
                <button type="submit">შენახვა</button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => toggleProduct(p.id, !p.active)}
                >
                  {p.active ? "გამორთვა" : "ჩართვა"}
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={async () => {
                    if (confirm(`წაიშალოს „${p.name}"?`)) {
                      await deleteProduct(p.id);
                    }
                  }}
                >
                  წაშლა
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
