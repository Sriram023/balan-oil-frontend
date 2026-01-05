import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

const API_BASE = "https://balan-oil-erp.onrender.com"; // 🔴 change if needed

export default function MobileScan() {
  const [scanned, setScanned] = useState<string>("");
  const [status, setStatus] = useState<string>("Idle");
  const lastScanRef = useRef<string>("");

  // 🔔 Beep sound
  const playBeep = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        // 🚫 prevent duplicate scan
        if (decodedText === lastScanRef.current) return;

        lastScanRef.current = decodedText;
        setScanned(decodedText);
        setStatus("📡 Sending to server...");
        playBeep();

        try {
          await axios.post(`${API_BASE}/api/inventory/scan`, {
            barcode: decodedText,
            quantity: 1,
            type: "OUT",       // change to IN if needed
            reason: "SALE",
          });

          setStatus("✅ Stock updated successfully");

          // Allow next scan after 2 seconds
          setTimeout(() => {
            lastScanRef.current = "";
          }, 2000);

        } catch (err: any) {
          console.error(err);
          setStatus("❌ Backend error");
          lastScanRef.current = "";
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>📱 Mobile Barcode Scan</h2>

      <div id="reader" style={{ width: "100%" }} />

      <p><b>Scanned:</b> {scanned || "—"}</p>
      <p><b>Status:</b> {status}</p>
    </div>
  );
}
