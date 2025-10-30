// src/context/CustomerContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

/* ---------- Types ---------- */

export interface PaymentRecord {
  amount: number;
  date: string; // localized string for display
  note?: string;
}

export interface CreditRecord {
  amount: number;
  date: string; // localized string for display
  note?: string;
}

export interface CustomerCredit {
  _id: string;
  id: number;
  name: string;
  product?: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string; // created/first entry date (ISO or yyyy-mm-dd)
  paymentHistory?: PaymentRecord[];
  creditHistory?: CreditRecord[];
}

/* ---------- Context Setup ---------- */

interface CustomerContextType {
  customers: CustomerCredit[];
  setCustomers: React.Dispatch<React.SetStateAction<CustomerCredit[]>>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<CustomerCredit[]>([
    {
      id: 1,
      name: "Raja Nei Store",
      product: "Sunflower Oil - 1L",
      creditGiven: 25000,
      paidAmount: 15000,
      balance: 10000,
      date: "2025-10-12",
      paymentHistory: [{ amount: 15000, date: "10/12/2025, 10:00:00 AM" }],
      creditHistory: [{ amount: 25000, date: "10/12/2025, 9:00:00 AM" }],
    },
    {
      id: 2,
      name: "Surya Oil Mart",
      product: "Gingelly Oil Tin 15L",
      creditGiven: 1800000,
      paidAmount: 100000,
      balance: 800000,
      date: "2025-10-14",
      paymentHistory: [{ amount: 18000, date: "10/14/2025, 10:00:00 AM" }],
      creditHistory: [{ amount: 18000, date: "10/14/2025, 9:00:00 AM" }],
    },
  ]);

  return (
    <CustomerContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};

/* ---------- Hook ---------- */

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
};
