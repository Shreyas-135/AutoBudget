import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import StockAdvisor from "./pages/StockAdvisor";
import TaxEstimate from "./pages/TaxEstimate";
import AIAssistant from "./pages/AIAssistant";
import Wellness from "./pages/Wellness";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/stocks" element={<StockAdvisor />} />
          <Route path="/tax-estimate" element={<TaxEstimate />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/wellness" element={<Wellness />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
