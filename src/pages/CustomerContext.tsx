// src/context/CustomerContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Customer {
  _id?: string;
  id?: number | string;
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string;
  paymentHistory?: { amount: number; date: string; note?: string }[];
  creditHistory?: { amount: number; date: string; note?: string }[];
  products?: { name: string; quantity: number; rate: number; total: number; date: string }[];
}

interface CustomerContextType {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/customers`);
        const data = await res.json();

        const mapped = data.map((c: any, i: number) => ({
          _id: c._id,
          id: i + 1,
          name: c.name,
          creditGiven: c.creditGiven,
          paidAmount: c.paidAmount,
          balance: c.creditGiven - c.paidAmount,
          paymentHistory: c.paymentHistory || [],
          creditHistory: c.creditHistory || [],
          products: c.products || [],
          date: c.createdAt || new Date().toISOString(),
        }));

        setCustomers(mapped);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <CustomerContext.Provider value={{ customers, setCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomers must be used within a CustomerProvider");
  return context;
};
