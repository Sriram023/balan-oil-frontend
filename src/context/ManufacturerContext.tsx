import React, { createContext, useContext, useState, ReactNode } from "react";

/* ---------- Types ---------- */
interface PaymentRecord {
  amount: number;
  date: string;
  note?: string;
}

interface CreditRecord {
  amount: number;
  date: string;
  note?: string;
}

export interface ManufacturerCredit {
  _id: string;
  id: number;
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string;
  paymentHistory?: PaymentRecord[];
  creditHistory?: CreditRecord[];
}

/* ---------- Context Setup ---------- */
interface ManufacturerContextType {
  manufacturers: ManufacturerCredit[];
  setManufacturers: React.Dispatch<React.SetStateAction<ManufacturerCredit[]>>;
}

const ManufacturerContext = createContext<ManufacturerContextType | undefined>(
  undefined
);

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
    {
      id: 2,
      name: "Bharat Traders",
      creditGiven: 35000,
      paidAmount: 10000,
      balance: 25000,
      date: "2025-10-05T05:30:00.000Z",
      paymentHistory: [{ amount: 35000, date: "10/05/2025, 5:30:00 AM" }],
      creditHistory: [{ amount: 35000, date: "10/05/2025, 5:30:00 AM" }],
    },
    {
      id: 3,
      name: "Muyal Company",
      creditGiven: 28000,
      paidAmount: 15000,
      balance: 13000,
      date: "2025-10-10T05:30:00.000Z",
      paymentHistory: [{ amount: 15000, date: "10/10/2025, 5:30:00 AM" }],
      creditHistory: [{ amount: 28000, date: "10/10/2025, 5:30:00 AM" }],
    },
  ]);

  return (
    <ManufacturerContext.Provider value={{ manufacturers, setManufacturers }}>
      {children}
    </ManufacturerContext.Provider>
  );
};

/* ---------- Hook ---------- */
export const useManufacturers = () => {
  const context = useContext(ManufacturerContext);
  if (!context) {
    throw new Error("useManufacturers must be used within a ManufacturerProvider");
  }
  return context;
};
