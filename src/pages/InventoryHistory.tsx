import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Transaction {
  _id: string;
  barcode: string;
  type: "IN" | "OUT" | "ADJUST";
  reason: string;
  quantity: number;
  createdAt: string;
}

const InventoryHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory/transactions`)
      .then(res => res.json())
      .then(setTransactions)
      .catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🧾 Inventory History</h1>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Barcode</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td className="border p-2">{tx.barcode}</td>
                <td className="border p-2">{tx.type}</td>
                <td className="border p-2">{tx.reason}</td>
                <td className="border p-2">{tx.quantity}</td>
                <td className="border p-2">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default InventoryHistory;
