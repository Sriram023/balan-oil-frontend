import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const MobileScan = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: "environment" }, // 🔥 back camera
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          setScanning(false);
          await html5QrCode.stop();

          setMessage(`Scanned: ${decodedText}`);

          // 🔁 Send to backend
          await axios.post(`${API_BASE}/inventory/scan`, {
            barcode: decodedText,
            quantity: 1,
            type: "OUT",
            reason: "SALE",
          });

          alert("✅ Stock updated!");
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      console.error(err);
      alert("Camera permission denied or error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📱 Mobile Barcode Scan</h2>

      {!scanning && (
        <button onClick={startScan} style={{ padding: 12 }}>
          Start Camera Scan
        </button>
      )}

      <div
        id="reader"
        style={{ width: "100%", maxWidth: 400, marginTop: 20 }}
      />

      {message && <p>{message}</p>}
    </div>
  );
};

export default MobileScan;
