import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

interface Sale {
  _id?: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
  createdAt?: string;
}

const SalesEntry = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    price: "",
    date: "",
  });

  // 🧠 Fetch existing sales from backend
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sales");
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("Fetch sales error:", err);
        toast({
          title: "Load Failed",
          description: "Couldn't load sales from backend.",
          variant: "destructive",
        });
      }
    };

    fetchSales();
  }, []);

  // 🧾 Handle form submission (POST to backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const price = parseFloat(formData.price);
    const total = quantity * price;

    if (!formData.productName || !quantity || !price || !formData.date) {
      toast({ title: "Missing Info", description: "Please fill all fields." });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName.trim(),
          quantity,
          price,
          total,
          date: formData.date,
        }),
      });

      if (!res.ok) throw new Error("Failed to save sale");
      const saved = await res.json();

      setSales(prev => [saved, ...prev]);

      toast({
        title: "Sale Recorded",
        description: `Sale of ${formData.productName} added successfully.`,
      });

      setFormData({ productName: "", quantity: "", price: "", date: "" });
    } catch (err) {
      console.error("Save sale error:", err);
      toast({
        title: "Save Failed",
        description: "Couldn't save sale to backend.",
        variant: "destructive",
      });
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-heading font-bold">Sales Entry</h1>
          <p className="text-muted-foreground mt-1">
            Record and track all product sales
          </p>
        </div>

        {/* Sales Summary */}
        <Card className="shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales Value</p>
                <p className="text-4xl font-heading font-bold text-primary">
                  ₹{totalSales.toLocaleString()}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Sale Form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Record New Sale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div>
                <Label>Product Name</Label>
                <Input
                  value={formData.productName}
                  onChange={e =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <Label>Quantity (Liters)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={e =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label>Price per Liter (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button type="submit" className="w-full md:w-auto">
                  Record Sale
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity (L)</TableHead>
                    <TableHead className="text-right">Price/L</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map(sale => (
                    <TableRow key={sale._id || sale.date}>
                      <TableCell>{sale.productName}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">₹{sale.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        ₹{sale.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesEntry;
