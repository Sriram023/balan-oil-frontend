import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

export default function InventoryHistory() {
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/inventory/transactions`)
      .then(res => res.json())
      .then(setTxns);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory History</h1>

      {txns.map(t => (
        <div key={t._id}>
          {t.type} | {t.barcode} | {t.quantity}
        </div>
      ))}
    </div>
  );
}
