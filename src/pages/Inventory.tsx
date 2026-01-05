import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/inventory/products`)
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.barcode}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
