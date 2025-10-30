import { useState, Fragment, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Printer } from "lucide-react";
import { useCustomers } from "@/context/CustomerContext";

/* ---------- Types ---------- */
interface Transaction {
  amount: number;
  date: string;
  note?: string;
}

interface Customer {
  id?: number;
  _id?: string;
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  paymentHistory?: Transaction[];
  creditHistory?: Transaction[];
  date: string;
}

const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const normalize = (s: string) => s.trim().toLowerCase();
const isValidNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;

const CustomerCredit = () => {
  const { customers, setCustomers } = useCustomers();
  const [formData, setFormData] = useState({ name: "", creditGiven: "", paidAmount: "", date: "" });

  /* ---------- Load from backend ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        const mapped = data.map((d: any, i: number) => ({
          id: i + 1,
          _id: d._id,
          name: d.name ?? "Unnamed",
          creditGiven: d.creditGiven ?? 0,
          paidAmount: d.paidAmount ?? 0,
          balance: (d.creditGiven ?? 0) - (d.paidAmount ?? 0),
          paymentHistory: d.paymentHistory ?? [],
          creditHistory: d.creditHistory ?? [],
          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        }));
        setCustomers(mapped);
      } catch (err) {
        console.error("Load customers error:", err);
        toast({ title: "Load failed", description: "Couldn't load customers from backend", variant: "destructive" });
      }
    };
    load();
  }, [setCustomers]);

  /* ---------- Handlers ---------- */
  const handleCreditUpdate = async (_id: string | number, credit: number) => {
    if (!isValidNumber(credit) || !_id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${_id}/add-credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: credit }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      const mapped = {
        ...updated,
        balance: updated.creditGiven - updated.paidAmount,
        date: updated.createdAt ? new Date(updated.createdAt).toLocaleDateString() : "-",
      };
      setCustomers(prev => prev.map(m => (m._id === _id ? mapped : m)));
      toast({ title: "Credit Updated", description: `₹${credit} added successfully.` });
    } catch {
      toast({ title: "Error", description: "Failed to update credit.", variant: "destructive" });
    }
  };

  const handlePaymentUpdate = async (_id: string | number, payment: number) => {
    if (!isValidNumber(payment) || !_id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/customers/${_id}/add-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payment }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      const mapped = {
        ...updated,
        balance: updated.creditGiven - updated.paidAmount,
        date: updated.createdAt ? new Date(updated.createdAt).toLocaleDateString() : "-",
      };
      setCustomers(prev => prev.map(m => (m._id === _id ? mapped : m)));
      toast({ title: "Payment Updated", description: `₹${payment} recorded successfully.` });
    } catch {
      toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
    }
  };

  /* ---------- Add new customer ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const credit = parseFloat(formData.creditGiven) || 0;
    const paid = parseFloat(formData.paidAmount) || 0;

    const existing = customers.find(c => normalize(c.name) === normalize(formData.name));
    if (existing) {
      if (credit > 0) handleCreditUpdate(existing._id || existing.id!, credit);
      if (paid > 0) handlePaymentUpdate(existing._id || existing.id!, paid);
      setFormData({ name: "", creditGiven: "", paidAmount: "", date: "" });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          creditGiven: credit,
          paidAmount: paid,
          date: formData.date || new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to save customer");

      const saved = await res.json();
      const mapped: Customer = {
        id: Date.now(),
        _id: saved._id,
        name: saved.name,
        creditGiven: saved.creditGiven,
        paidAmount: saved.paidAmount,
        balance: saved.creditGiven - saved.paidAmount,
        date: saved.createdAt ? new Date(saved.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        creditHistory: saved.creditHistory ?? [],
        paymentHistory: saved.paymentHistory ?? [],
      };
      setCustomers(prev => [...prev, mapped]);
      toast({ title: "Customer Added", description: `${mapped.name} added successfully.` });
      setFormData({ name: "", creditGiven: "", paidAmount: "", date: "" });
    } catch (err) {
      console.error("Save customer error:", err);
      toast({ title: "Save failed", description: "Could not save customer", variant: "destructive" });
    }
  };

  /* ---------- Printing ---------- */
  const handlePrint = (m: Customer) => {
    const payRows = (m.paymentHistory || [])
      .map((r, i) => `<tr><td>${i + 1}</td><td>${formatINR(r.amount)}</td><td>${r.date}</td><td>${r.note || "-"}</td></tr>`)
      .join("");
    const creditRows = (m.creditHistory || [])
      .map((r, i) => `<tr><td>${i + 1}</td><td>${formatINR(r.amount)}</td><td>${r.date}</td><td>${r.note || "-"}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head>
          <title>${m.name} - Transactions</title>
          <style>
            body { font-family: Arial; padding: 20px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Balan Oil Mart - ${m.name}</h2>
          <p>Date: ${new Date().toLocaleString()}</p>
          <table>
            <tr><th>Total Credit</th><td>${formatINR(m.creditGiven)}</td></tr>
            <tr><th>Total Paid</th><td>${formatINR(m.paidAmount)}</td></tr>
            <tr><th>Balance</th><td>${formatINR(m.balance)}</td></tr>
          </table>
          <h3>Credit History</h3>
          <table><tr><th>#</th><th>Amount</th><th>Date</th><th>Note</th></tr>${creditRows || "<tr><td colspan='4'>No records</td></tr>"}</table>
          <h3>Payment History</h3>
          <table><tr><th>#</th><th>Amount</th><th>Date</th><th>Note</th></tr>${payRows || "<tr><td colspan='4'>No records</td></tr>"}</table>
          <script>window.print()</script>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  /* ---------- UI ---------- */
  return (
    <DashboardLayout>
       <div className="mb-6">
        <br />
        <center>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Customers and Business Owners Credit</h1>
          <p className="text-base text-muted-foreground">Track credits and payments from Customers and Business Owners </p>
        </center>
        <br />

        {/* Add Form */}
        {/* Add Form */}
<Card>
  <CardHeader>
    <CardTitle>Add Customer / Business Owner</CardTitle>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label className="mb-2 block">Name</Label>
        <Input
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label className="mb-2 block">Credit Given (₹)</Label>
        <Input
          type="number"
          value={formData.creditGiven}
          onChange={e => setFormData({ ...formData, creditGiven: e.target.value })}
        />
      </div>
      <div>
        <Label className="mb-2 block">Paid (₹)</Label>
        <Input
          type="number"
          value={formData.paidAmount}
          onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="gap-2 w-full">
          <PlusCircle className="h-4 w-4" /> Add
        </Button>
      </div>
    </form>
  </CardContent>
</Card>


        {/* All Customers */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Credit Given </TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(c => (
                  <Fragment key={c._id}>
                    <TableRow>
                      <TableCell>
                        <Link to={`/customers/${c._id}`} className="text-blue-600 underline">{c.name}</Link>
                      </TableCell>
                      <TableCell>{formatINR(c.creditGiven)}</TableCell>
                      <TableCell>{formatINR(c.paidAmount)}</TableCell>
                      <TableCell>{formatINR(c.balance)}</TableCell>
                      <TableCell>{c.date}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button onClick={() => handleCreditUpdate(c._id!, parseFloat(prompt("Enter credit amount") || "0"))}>Add Credit</Button>
                        <Button onClick={() => handlePaymentUpdate(c._id!, parseFloat(prompt("Enter payment amount") || "0"))}>Add Payment</Button>
                        <Button onClick={() => handlePrint(c)} variant="outline">Print</Button>
                      </TableCell>
                    </TableRow>

                    {/* Payment + Credit History Rows */}
                    {(c.paymentHistory?.length || c.creditHistory?.length) ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="rounded-md border bg-amber-50/60 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="font-semibold mb-2 text-amber-800">Credit History</h3>
                                {(c.creditHistory ?? []).length ? (
                                  <ul className="text-sm space-y-1">
                                    {c.creditHistory!.map((ch, i) => (
                                      <li key={i}>₹{ch.amount} on {ch.date} {ch.note && `(${ch.note})`}</li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">No credit records</p>}
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2 text-green-800">Payment History</h3>
                                {(c.paymentHistory ?? []).length ? (
                                  <ul className="text-sm space-y-1">
                                    {c.paymentHistory!.map((ph, i) => (
                                      <li key={i}>₹{ph.amount} on {ph.date} {ph.note && `(${ph.note})`}</li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">No payment records</p>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerCredit;
