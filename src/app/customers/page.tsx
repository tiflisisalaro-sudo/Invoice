import { deleteCustomer, saveCustomer } from "@/app/actions";
import { prisma } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1>მყიდველები</h1>
      <form action={saveCustomer} className="form-grid" style={{ marginBottom: 28 }}>
        <label>
          დასახელება
          <input name="name" required />
        </label>
        <label>
          ს/ნ
          <input name="taxId" />
        </label>
        <label>
          მისამართი
          <input name="address" />
        </label>
        <label>
          ტელეფონი
          <input name="phone" />
        </label>
        <label>
          საკონტაქტო პირი
          <input name="contact" />
        </label>
        <div style={{ alignSelf: "end" }}>
          <button type="submit">დამატება</button>
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th>დასახელება</th>
            <th>ს/ნ</th>
            <th>მისამართი</th>
            <th>ტელეფონი</th>
            <th>კონტაქტი</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td colSpan={6}>
                <form action={saveCustomer} className="row-actions">
                  <input type="hidden" name="id" value={c.id} />
                  <input name="name" defaultValue={c.name} required style={{ minWidth: 140 }} />
                  <input name="taxId" defaultValue={c.taxId} placeholder="ს/ნ" style={{ width: 110 }} />
                  <input name="address" defaultValue={c.address} placeholder="მისამართი" style={{ flex: 1 }} />
                  <input name="phone" defaultValue={c.phone} placeholder="ტელ." style={{ width: 120 }} />
                  <input name="contact" defaultValue={c.contact} placeholder="კონტაქტი" style={{ width: 120 }} />
                  <button type="submit">შენახვა</button>
                </form>
                <form action={deleteCustomer.bind(null, c.id)} style={{ marginTop: 6 }}>
                  <button className="ghost" type="submit">წაშლა</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
