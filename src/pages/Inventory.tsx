import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Product {
  _id: string;
  name: string;
  barcode: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Inventory load error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📦 Inventory</h1>

        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Product</th>
                <th className="border p-2">Barcode</th>
                <th className="border p-2">SKU</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Min</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.barcode}</td>
                  <td className="border p-2">{p.sku}</td>
                  <td className="border p-2">{p.stock}</td>
                  <td className="border p-2">{p.minStock}</td>
                  <td className="border p-2">
                    {p.stock <= p.minStock ? (
                      <span className="text-red-600 font-semibold">LOW</span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
