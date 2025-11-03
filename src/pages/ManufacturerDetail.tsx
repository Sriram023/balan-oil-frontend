import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, PlusCircle, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useEffect,useState } from "react";
import { useManufacturers } from "@/context/ManufacturerContext"; // 👈 make sure the path matches your file structure
import { fetchManufacturerById, addCredit, addPayment, Manufacturer, Transaction, } from "@/api";
/* ---------- Types ---------- */
interface Product {
  id: number;
  name: string;
  quantity: number;
  rate: number;
  total: number;
  date: string;
}

/* ---------- Print helpers (added) ---------- */
const buildProductsHTML = (
  manufacturerName: string,
  products: Product[],
  totals: { qty: number; sum: number }
) => {
  const rupee = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const rows = products
    .map(
      (p, i) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd;">${i + 1}</td>
        <td style="padding:6px;border:1px solid #ddd;">${p.name}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">${p.quantity}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">${rupee(p.rate)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right;">${rupee(p.total)}</td>
        <td style="padding:6px;border:1px solid #ddd;">${p.date}</td>
      </tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <title>${manufacturerName} - Products Purchased</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 16px; color: #111; }
          h1 { margin: 0 0 4px 0; font-size: 20px; }
          .muted { color: #666; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
          th { background: #f9fafb; text-align: left; }
          .totals { margin-top: 10px; font-size: 13px; display:flex; gap:16px; }
        </style>
      </head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <h1>Balan Oil Mart</h1>
            <div class="muted">Products Purchased from ${manufacturerName}</div>
          </div>
          <div class="muted">${new Date().toLocaleString()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th style="text-align:right;">Quantity</th>
              <th style="text-align:right;">Rate (₹)</th>
              <th style="text-align:right;">Total (₹)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="6" style="padding:8px;text-align:center;color:#666;">No products added</td></tr>`}
          </tbody>
        </table>

        <div class="totals">
          <div><strong>Total Qty:</strong> ${totals.qty}</div>
          <div><strong>Grand Total:</strong> ${rupee(totals.sum)}</div>
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
    try { document.body.removeChild(iframe); } catch {}
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

/* ---------- Component ---------- */
const ManufacturerDetail = () => {
  const { id } = useParams();
const { manufacturers } = useManufacturers(); // ✅ must come first
console.log("🧭 URL ID:", id);
console.log("🗂️ Manufacturers in context:", manufacturers);

  const navigate = useNavigate();
   // 👈 pulling real-time data from context

  // ✅ Find the manufacturer that matches the URL id
  const manufacturer = manufacturers.find((m) => m._id === id);


  if (!manufacturer) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button onClick={() => navigate("/manufacturers")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <p className="mt-4 text-red-600">Manufacturer not found 😕</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const balance = manufacturer.creditGiven - manufacturer.paidAmount;

  // 🧾 Products list (starts empty but can be filled manually)
  // 🧾 Products list fetched from backend


/* ---------- Handlers ---------- */
// 🧾 Products list (starts empty but can be filled manually)
const [products, setProducts] = useState<Product[]>([]);
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch manufacturer details");

      const data = await res.json();

      // ✅ MongoDB stores products inside "products"
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching manufacturer details:", err);
      toast({
        title: "Load Failed",
        description: "Couldn't load products from backend.",
        variant: "destructive",
      });
    }
  };

  fetchProducts();
}, [id]);

const [formData, setFormData] = useState({
  name: "",
  quantity: "",
  rate: "",
});

/* ---------- Handlers ---------- */
const handleAddProduct = async (e: React.FormEvent) => {
  e.preventDefault();

  const quantity = parseFloat(formData.quantity);
  const rate = parseFloat(formData.rate);
  const total = quantity * rate;

  if (!formData.name || !quantity || !rate) {
    toast({ title: "Missing info", description: "Please fill all fields!" });
    return;
  }

  const newProduct: Product = {
    id: Date.now(),
    name: formData.name.trim(),
    quantity,
    rate,
    total,
    date: new Date().toLocaleDateString(),
  };

  try {
    // ✅ Send to backend (replace localhost with your Render backend link later)
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/manufacturers/${manufacturer._id || manufacturer.id}/add-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (!res.ok) throw new Error("Failed to save product to backend");

    const updated = await res.json();

    // ✅ Update local state
    setProducts(updated.products || []);
    toast({ title: "Product Added", description: `${formData.name} added successfully.` });
    setFormData({ name: "", quantity: "", rate: "" });
  } catch (err) {
    console.error("Error saving product:", err);
    toast({ title: "Error", description: "Couldn't save product to backend.", variant: "destructive" });
  }
};


  const handlePrintProducts = () => {
    const totals = {
      qty: products.reduce((s, p) => s + Number(p.quantity || 0), 0),
      sum: products.reduce((s, p) => s + Number(p.total || 0), 0),
    };
    const html = buildProductsHTML(manufacturer.name, products, totals);
    printHTMLviaIframe(html);
  };

  /* ---------- Rendera ---------- */
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* 🔙 Back button */}
        <Button
          
          className="flex items-center gap-2"
          onClick={() => navigate("/manufacturers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="border-b pb-3 text-center">
          <h1 className="text-3xl font-bold">{manufacturer.name}</h1>
          <p className="text-muted-foreground mt-1">
            Detailed view of all products, credits & payments
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <h2 className="text-lg font-semibold">Total Credit</h2>
              <p className="text-2xl font-bold text-amber-600">
                ₹{manufacturer.creditGiven.toLocaleString()}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Total Paid</h2>
              <p className="text-2xl font-bold text-green-600">
                ₹{manufacturer.paidAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Balance</h2>
              <p className="text-2xl font-bold text-blue-600">
                ₹{balance.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add Product Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Product Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Qty"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Rate (₹)</Label>
                <Input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="Rate per unit"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="gap-2 w-full">
                  <PlusCircle className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Products Purchased</CardTitle>
            <br></br>
            {/* Print button (added) */}
            <Button variant="outline" className="gap-2" onClick={handlePrintProducts} title="Print products">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <br></br>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate (₹)</TableHead>
                  <TableHead>Total (₹)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{p.rate.toLocaleString()}</TableCell>
                    <TableCell>{p.total.toLocaleString()}</TableCell>
                    <TableCell>{p.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};


export default ManufacturerDetail;
