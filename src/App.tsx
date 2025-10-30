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
import SalesEntry from "./pages/SalesEntry";
import NotFound from "./pages/NotFound";

import { ManufacturerProvider } from "@/context/ManufacturerContext";
import { CustomerProvider } from "@/context/CustomerContext"; // 🆕 add this
import CustomerDetail from "./pages/CustomerDetail"; // 🆕 add this

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
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Manufacturers */}
              <Route path="/manufacturers" element={<ManufacturersCredit />} />
              <Route path="/manufacturers/:id" element={<ManufacturerDetail />} />

              {/* Customers */}
              <Route path="/customers" element={<CustomersCredit />} />
              <Route path="/customers/:id" element={<CustomerDetail />} /> {/* 🆕 detail route */}

              <Route path="/sales" element={<SalesEntry />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CustomerProvider>
        </ManufacturerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
