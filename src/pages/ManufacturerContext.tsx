import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ManufacturerCredit } from "@/types/manufacturer";

/* /* ---------- Types ---------- */
/* interface PaymentRecord {
  amount: number;
  date: string;
  note?: string;
}

interface CreditRecord {
  amount: number;
  date: string;
  note?: string;
} */

/* export interface ManufacturerCredit {  */
/*   id: number;
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string;
  paymentHistory?: PaymentRecord[];
  creditHistory?: CreditRecord[];
}  */
 
/* interface ManufacturerContextType {
  manufacturers: ManufacturerCredit[];
  setManufacturers: React.Dispatch<React.SetStateAction<ManufacturerCredit[]>>;
} */

/* ---------- Context ---------- */
const ManufacturerContext = createContext<{
  manufacturers: ManufacturerCredit[];
  setManufacturers: React.Dispatch<React.SetStateAction<ManufacturerCredit[]>>;
} | undefined>(undefined);


/* ---------- Provider ---------- */
export const ManufacturerProvider = ({ children }: { children: ReactNode }) => {
  const [manufacturers, setManufacturers] = useState<ManufacturerCredit[]>([
    {
      id: 1,
      name: "Meenakshi Oil Traders",
      creditGiven: 50000,
      paidAmount: 31273,
      balance: 50000 - 31273,
      date: "2025-10-01T05:30:00.000Z",
      paymentHistory: [{ amount: 1273, date: "10/19/2025, 11:26:58 AM" }],
      creditHistory: [{ amount: 50000, date: "10/01/2025, 5:30:00 AM" }],
    },
  ]);
  

  /* ---------- Fetch from backend and merge ---------- */
  useEffect(() => {
  const fetchManufacturers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers`);
      const data = await res.json();

      const mapped = data.map((m: any) => ({
        _id: m._id,
        name: m.name,
        creditGiven: m.creditGiven,
        paidAmount: m.paidAmount,
        balance: m.creditGiven - m.paidAmount,
        paymentHistory: m.paymentHistory || [],
        creditHistory: m.creditHistory || [],
        products: m.products || [],
        date: m.createdAt || new Date().toISOString(),
      }));

      setManufacturers(mapped);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
    }
  };

  fetchManufacturers();
}, []);


  return (
    <ManufacturerContext.Provider value={{ manufacturers, setManufacturers }}>
      {children}
    </ManufacturerContext.Provider>
  );
};

/* ---------- Hook ---------- */
export const useManufacturers = () => {
  const context = useContext(ManufacturerContext);
  if (!context) throw new Error("useManufacturers must be used within a ManufacturerProvider");
  return context;
};
