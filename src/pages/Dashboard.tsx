import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo, useEffect, useState } from "react";
import { useCustomers } from "@/context/CustomerContext";
import { useManufacturers } from "@/context/ManufacturerContext";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface Sale {
  _id: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

const Dashboard = () => {
  const { customers } = useCustomers();
  const { manufacturers } = useManufacturers();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sales");
        if (!res.ok) throw new Error("Failed to load sales");
        const data = await res.json();
        setSales(data);
      } catch (err) {
        console.error("Error loading sales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const startOfThisMonth = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1), []);
  const parseDate = (s: string) => new Date(s);

  // --- Customer Aggregates ---
  const {
    totalCustomerCredit,
    totalCustomerPaid,
    outstandingReceivables,
    monthlySalesFromCustomerPayments,
  } = useMemo(() => {
    const totals = {
      totalCustomerCredit: 0,
      totalCustomerPaid: 0,
      outstandingReceivables: 0,
      monthlySalesFromCustomerPayments: 0,
    };

    for (const c of customers) {
      totals.totalCustomerCredit += c.creditGiven || 0;
      totals.totalCustomerPaid += c.paidAmount || 0;
      totals.outstandingReceivables += c.balance || (c.creditGiven || 0) - (c.paidAmount || 0);

      const monthPayments =
        (c.paymentHistory || [])
          .filter(r => parseDate(r.date) >= startOfThisMonth)
          .reduce((s, r) => s + (r.amount || 0), 0);
      totals.monthlySalesFromCustomerPayments += monthPayments;
    }
    return totals;
  }, [customers, startOfThisMonth]);

  // --- Manufacturer Aggregates ---
  const {
    totalManufacturerCredit,
    totalManufacturerPaid,
    outstandingPayables,
  } = useMemo(() => {
    const totals = {
      totalManufacturerCredit: 0,
      totalManufacturerPaid: 0,
      outstandingPayables: 0,
    };
    for (const m of manufacturers) {
      totals.totalManufacturerCredit += m.creditGiven || 0;
      totals.totalManufacturerPaid += m.paidAmount || 0;
      totals.outstandingPayables += m.balance || (m.creditGiven || 0) - (m.paidAmount || 0);
    }
    return totals;
  }, [manufacturers]);

  // --- Sales Aggregates ---
  const { totalSalesValue, monthlySalesValue, salesByProduct } = useMemo(() => {
    const totals = {
      totalSalesValue: 0,
      monthlySalesValue: 0,
      salesByProduct: {} as Record<string, number>,
    };

    for (const sale of sales) {
      totals.totalSalesValue += sale.total || 0;

      if (parseDate(sale.date) >= startOfThisMonth) {
        totals.monthlySalesValue += sale.total || 0;
      }

      totals.salesByProduct[sale.productName] =
        (totals.salesByProduct[sale.productName] || 0) + (sale.total || 0);
    }

    return totals;
  }, [sales, startOfThisMonth]);

  // --- Chart Data (Dynamic) ---
  const salesData = useMemo(() => {
    const entries = Object.entries(salesByProduct);
    if (!entries.length) {
      // fallback to dummy only if no real sales yet
      return [
        { name: "No Sales Yet", value: 1, color: CHART_COLORS[0] },
      ];
    }
    return entries.map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [salesByProduct]);

  const outstandingBalanceCard = outstandingReceivables;
  const rupee = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your business performance
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {rupee(monthlySalesValue)}
              </div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                Live from this month’s sales entries
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Given</CardTitle>
              <TrendingDown className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{rupee(totalCustomerCredit)}</div>
              <p className="text-xs text-muted-foreground mt-1">To customers & businesses</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Received</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{rupee(totalManufacturerCredit)}</div>
              <p className="text-xs text-muted-foreground mt-1">From manufacturers</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <AlertCircle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{rupee(outstandingBalanceCard)}</div>
              <p className="text-xs text-destructive mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Sales Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Product Sales Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly breakdown by product category
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
