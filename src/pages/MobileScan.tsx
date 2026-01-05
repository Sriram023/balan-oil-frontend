import { useState } from "react";

const MobileScan = () => {
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const handleScan = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/inventory/scan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode,
            quantity,
            type: "OUT",
            reason: "SALE",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("✅ Scan successful");
      setBarcode("");
      setQuantity(1);
    } catch (err: any) {
      setMessage(err.message || "❌ Scan failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📱 Mobile Barcode Scan</h2>

      <input
        placeholder="Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />

      <input
        type="number"
        value={quantity}
        min={1}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button onClick={handleScan}>Scan</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default MobileScan;
