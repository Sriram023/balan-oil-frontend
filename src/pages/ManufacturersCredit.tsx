// src/pages/ManufacturersCredit.tsx
import { useState, Fragment, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useManufacturers } from "@/context/ManufacturerContext";
import { ManufacturerCredit } from "@/types/manufacturer";

/* ---------- Types ---------- */
/* interface PaymentRecord {
  amount: number;
  date: string;
  note?: string;
}
interface CreditRecord {
  amount: number;
  date: string;
  note?: string;
}
interface ManufacturerCredit {
  id: number;      // for frontend display
  _id?: string;    // ✅ actual MongoDB id
  name: string;
  creditGiven: number;
  paidAmount: number;
  balance: number;
  date: string;
  paymentHistory?: PaymentRecord[];
  creditHistory?: CreditRecord[];
} */


/* ---------- Utils ---------- */
const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const normalize = (s: string) => s.trim().toLowerCase();
const isValidNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v > 0;

/* ---------- Printable HTML (unchanged) ---------- */
const buildPrintableHTML = (m: ManufacturerCredit) => {
  const rupee = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const payRows = (m.paymentHistory || [])
    .map(
      (r, i) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;">${rupee(r.amount)}</td>
          <td style="padding:6px;border:1px solid #ddd;">${r.date}</td>
          <td style="padding:6px;border:1px solid #ddd;">${r.note || "-"}</td>
        </tr>`
    )
    .join("");

  const creditRows = (m.creditHistory || [])
    .map(
      (r, i) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd;">${rupee(r.amount)}</td>
          <td style="padding:6px;border:1px solid #ddd;">${r.date}</td>
          <td style="padding:6px;border:1px solid #ddd;">${r.note || "-"}</td>
        </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <title>${m.name} - Transactions</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 16px; color: #111; }
          h1 { margin: 0 0 4px 0; font-size: 20px; }
          h2 { margin: 16px 0 8px 0; font-size: 16px; }
          .muted { color: #666; font-size: 12px; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0 16px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
          .label { font-size: 12px; color: #666; }
          .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
          table { border-collapse: collapse; width: 100%; margin-top: 8px; }
          th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
          th { background: #f9fafb; text-align: left; }
          .section { margin-top: 14px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <h1>Balan Oil Mart</h1>
            <div class="muted">Manufacturer Transactions Report</div>
          </div>
          <div class="muted">${new Date().toLocaleString()}</div>
        </div>

        <div class="card">
          <div style="font-weight:600;font-size:14px;margin-bottom:6px;">${m.name}</div>
          <div class="summary">
            <div>
              <div class="label">Total Credit</div>
              <div class="value">${rupee(m.creditGiven)}</div>
            </div>
            <div>
              <div class="label">Total Paid</div>
              <div class="value">${rupee(m.paidAmount)}</div>
            </div>
            <div>
              <div class="label">Balance</div>
              <div class="value">${rupee(m.creditGiven - m.paidAmount)}</div>
            </div>
          </div>

          <div class="section">
            <h2>Payment History</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Date/Time</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${payRows || `<tr><td colspan="4" style="padding:8px;text-align:center;color:#666;">No payments</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Credit History</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Date/Time</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                ${creditRows || `<tr><td colspan="4" style="padding:8px;text-align:center;color:#666;">No credits</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>

        <div class="no-print" style="margin-top:16px;">
          <button onclick="window.print()" style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;background:#111;color:#fff;">Print</button>
        </div>
      </body>
    </html>
  `;
};

const printHTMLviaIframe = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  const cleanup = () => {
    try {
      document.body.removeChild(iframe);
    } catch {}
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = cleanup;
        iframe.contentWindow.print();
      } else {
        setTimeout(cleanup, 1500);
      }
    } catch {
      setTimeout(cleanup, 1500);
    }
  };
};

const ManufacturersCredit = () => {
  // context returns object { manufacturers, setManufacturers } — your context already uses numeric ids
  const { manufacturers, setManufacturers } = useManufacturers();

  const [formData, setFormData] = useState({
    name: "",
    creditGiven: "",
    paidAmount: "",
    date: "",
  });

  const [editingManufacturer, setEditingManufacturer] = useState<ManufacturerCredit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
  });

  /* ---------- Load from backend on mount (map backend ids to numbers) ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers`);
        if (!res.ok) throw new Error("Failed to fetch manufacturers");
        const data = await res.json();

        // Map backend objects to frontend ManufacturerCredit (use numeric id)
        const mapped: ManufacturerCredit[] = (data || []).map((d: any, i: number) => ({
           id: i + 1, // numeric id for UI
           _id: d._id, // ✅ store actual MongoDB id for backend operations
           name: d.name ?? "Unnamed",
           creditGiven: Number(d.creditGiven ?? 0),
           paidAmount: Number(d.paidAmount ?? 0),
           balance: Number((d.creditGiven ?? 0) - (d.paidAmount ?? 0)),
           date: d.createdAt ?? d.date ?? new Date().toISOString(),
           paymentHistory: d.paymentHistory ?? [],
           creditHistory: d.creditHistory ?? [],
}));


        setManufacturers(mapped);
      } catch (err) {
        console.error("Load manufacturers error:", err);
        toast({ title: "Load failed", description: "Couldn't load manufacturers from backend", variant: "destructive" });
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Updaters (accept numeric id) ---------- */
  const handleCreditUpdate = async (_id: string | number, credit: number) => {
  if (!isValidNumber(credit) || !_id) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers/${_id}/add-credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: credit }),
    });

    if (!response.ok) throw new Error("Failed to update credit");
    const updated = await response.json();

    setManufacturers(prev =>
      prev.map(m =>
        m._id === _id
          ? {
              ...m,
              creditGiven: updated.creditGiven,
              balance: updated.creditGiven - updated.paidAmount,
              creditHistory: updated.creditHistory || m.creditHistory,
            }
          : m
      )
    );

    toast({ title: "Credit Updated", description: `₹${credit.toLocaleString()} added successfully.` });
  } catch (err) {
    console.error("Error updating credit:", err);
    toast({ title: "Error", description: "Failed to update credit.", variant: "destructive" });
  }
};



  const handlePaymentUpdate = async (_id: string | number, payment: number) => {
  if (!isValidNumber(payment) || !_id) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers/${_id}/add-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: payment }),
    });

    if (!response.ok) throw new Error("Failed to update payment");
    const updated = await response.json();

    setManufacturers(prev =>
      prev.map(m =>
        m._id === _id
          ? {
              ...m,
              paidAmount: updated.paidAmount,
              balance: updated.creditGiven - updated.paidAmount,
              paymentHistory: updated.paymentHistory || m.paymentHistory,
            }
          : m
      )
    );

    toast({ title: "Payment Updated", description: `₹${payment.toLocaleString()} recorded successfully.` });
  } catch (err) {
    console.error("Error updating payment:", err);
    toast({ title: "Error", description: "Failed to update payment.", variant: "destructive" });
  }
};



  /* ---------- Create / Merge (POST to backend, convert saved doc to numeric id) ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const credit = parseFloat(formData.creditGiven) || 0;
    const paid = parseFloat(formData.paidAmount) || 0;

    const existing = manufacturers.find(m => normalize(m.name) === normalize(formData.name));
    if (existing) {
      if (credit > 0) handleCreditUpdate(existing._id || existing.id, credit);
      if (paid > 0) handlePaymentUpdate(existing._id || existing.id, paid);


      setFormData({ name: "", creditGiven: "", paidAmount: "", date: "" });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          creditGiven: credit,
          paidAmount: paid,
        }),
      });
      if (!res.ok) throw new Error("Failed to save manufacturer");

      const saved = await res.json();

      // Map saved backend object to frontend ManufacturerCredit with numeric id
      const mapped: ManufacturerCredit = {
        id: typeof saved.id === "number" ? saved.id : Number(saved._id) || Date.now(),
        name: saved.name,
        creditGiven: Number(saved.creditGiven ?? 0),
        paidAmount: Number(saved.paidAmount ?? 0),
        balance: Number((saved.creditGiven ?? 0) - (saved.paidAmount ?? 0)),
        date: saved.createdAt ?? new Date().toISOString(),
        creditHistory: saved.creditHistory ?? (credit > 0 ? [{ amount: credit, date: new Date().toLocaleString() }] : []),
        paymentHistory: saved.paymentHistory ?? (paid > 0 ? [{ amount: paid, date: new Date().toLocaleString() }] : []),
      };

      setManufacturers(prev => [...prev, mapped]);

      toast({ title: "Entry Added", description: `Manufacturer ${mapped.name} added successfully.` });
      setFormData({ name: "", creditGiven: "", paidAmount: "", date: "" });
    } catch (err) {
      console.error("Save manufacturer error:", err);
      toast({ title: "Save failed", description: "Could not save manufacturer to backend", variant: "destructive" });
    }
  };

  /* ---------- Edit ---------- */
  const handleEditClick = (m: ManufacturerCredit) => {
    setEditingManufacturer(m);
    setEditFormData({ name: m.name });
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editingManufacturer) return;
    setManufacturers(prev =>
      prev.map(m => (m._id === editingManufacturer.id ? { ...m, name: editFormData.name.trim() } : m))
    );
    toast({ title: "Entry Updated", description: "Details updated successfully." });
    setEditDialogOpen(false);
    setEditingManufacturer(null);
  };

  const handlePrint = (m: ManufacturerCredit) => {
    const html = buildPrintableHTML(m);
    printHTMLviaIframe(html);
  };

  /* ---------- Render ---------- */
  return (
    <DashboardLayout>
      <div className="mb-6">
        <br />
        <center>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Manufacturers Credit</h1>
          <p className="text-base text-muted-foreground">Track credits and payments to oil manufacturers</p>
        </center>
        <br />

        {/* Add New Entry */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Manufacturer Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Manufacturer Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter manufacturer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Credit Given (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.creditGiven}
                  onChange={e => setFormData({ ...formData, creditGiven: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Paid Amount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.paidAmount}
                  onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  placeholder="dd-mm-yyyy"
                />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Entry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Manufacturer Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Credit Given</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manufacturers.map(m => (
                  <Fragment key={m._id}>
                    <TableRow>
                      <TableCell className="font-medium text-primary underline underline-offset-2">
                        <Link to={`/manufacturers/${m._id}`}>{m.name}</Link>
                      </TableCell>
                      <TableCell>{formatINR(m.creditGiven)}</TableCell>
                      <TableCell>{formatINR(m.paidAmount)}</TableCell>
                      <TableCell className={m.balance > 0 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                        {formatINR(m.balance)}
                      </TableCell>
                      <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                      <TableCell className="flex flex-wrap gap-2">
                        <Dialog open={editDialogOpen && editingManufacturer?.id === m._id} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(m)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Manufacturer Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Manufacturer Name</Label>
                                <Input
                                  value={editFormData.name}
                                  onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))}
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button onClick={handleEditSave}>Save Changes</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" className="gap-2" onClick={() => handlePrint(m)} title="Print transactions">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const v = prompt("Enter credit amount:");
                            if (!v) return;
                            const amt = parseFloat(v);
                            if (!isValidNumber(amt)) return;
                            handleCreditUpdate(m._id, amt);

                          }}
                        >
                          Add Credit
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            const v = prompt("Enter payment amount:");
                            if (!v) return;
                            const amt = parseFloat(v);
                            if (!isValidNumber(amt)) return;
                            handlePaymentUpdate(m._id, amt);
                          }}
                          disabled={m.balance === 0}
                        >
                          Add Payment
                        </Button>
                      </TableCell>
                    </TableRow>

                    {(m.paymentHistory?.length || m.creditHistory?.length) ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-md bg-muted/40 p-3">
                              <div className="text-sm font-medium mb-2">Payment History</div>
                              <div className="space-y-1">
                                {[...(m.paymentHistory || [])]
                                  .slice()
                                  .reverse()
                                  .map((r, idx) => (
                                    <div key={`p-${m.id}-${idx}`} className="flex items-center justify-between text-sm">
                                      <span>💰 {formatINR(r.amount)}</span>
                                      <span className="text-muted-foreground">{r.date}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <div className="rounded-md bg-amber-50 p-3 border border-amber-200">
                              <div className="text-sm font-medium mb-2">Credit History</div>
                              <div className="space-y-1">
                                {[...(m.creditHistory || [])]
                                  .slice()
                                  .reverse()
                                  .map((r, idx) => (
                                    <div key={`c-${m._id}-${idx}`} className="flex items-center justify-between text-sm">
                                      <span>🧾 {formatINR(r.amount)}</span>
                                      <span className="text-muted-foreground">{r.date}</span>
                                    </div>
                                  ))}
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

export default ManufacturersCredit;
