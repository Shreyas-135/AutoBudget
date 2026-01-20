import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import StockAdvisor from "./pages/StockAdvisor";
import TaxEstimate from "./pages/TaxEstimate";
import AIAssistant from "./pages/AIAssistant";
import Wellness from "./pages/Wellness";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 🌗 Theme toggle state and handlers
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(saved);
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* 🌙 Simple top navbar to toggle theme */}
          <header className="w-full flex justify-between items-center px-6 py-3 bg-gray-50 dark:bg-gray-900 shadow-sm">
            <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              AutoBudget AI
            </Link>
            <button
              onClick={handleToggleTheme}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                         bg-blue-600 text-white hover:bg-blue-700 dark:bg-yellow-400 dark:text-black"
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>

          <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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
              <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

