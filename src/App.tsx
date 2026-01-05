import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManufacturersCredit from "./pages/ManufacturersCredit";
import ManufacturerDetail from "./pages/ManufacturerDetail";
import CustomersCredit from "./pages/CustomersCredit";
import CustomerDetail from "./pages/CustomerDetail";
import SalesEntry from "./pages/SalesEntry";
import NotFound from "./pages/NotFound";

/* 🆕 Inventory Pages */
import Inventory from "./pages/Inventory";
import InventoryHistory from "./pages/InventoryHistory";
import MobileScan from "./pages/MobileScan";

/* Context Providers */
import { ManufacturerProvider } from "@/context/ManufacturerContext";
import { CustomerProvider } from "@/context/CustomerContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ManufacturerProvider>
          <CustomerProvider>
            <Routes>
              {/* Auth */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Core */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Manufacturers */}
              <Route path="/manufacturers" element={<ManufacturersCredit />} />
              <Route path="/manufacturers/:id" element={<ManufacturerDetail />} />

              {/* Customers */}
              <Route path="/customers" element={<CustomersCredit />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />

              {/* Sales */}
              <Route path="/sales" element={<SalesEntry />} />

              {/* 🧾 Inventory System */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/history" element={<InventoryHistory />} />

              {/* 📱 Mobile Barcode Scanner */}
              <Route path="/scan" element={<MobileScan />} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CustomerProvider>
        </ManufacturerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
