export interface PaymentRecord {
  amount: number;
  date: string;
  note?: string;
}

export interface CreditRecord {
  amount: number;
  date: string;
  note?: string;
}


export interface ManufacturerCredit {
  _id?: string;
  id?: number | string;
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string;
  paymentHistory?: { amount: number; date: string; note?: string }[];
  creditHistory?: { amount: number; date: string; note?: string }[];
}
