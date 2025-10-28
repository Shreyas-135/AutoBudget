import { Link, useLocation } from "react-router-dom";
import { Home, Wallet, CreditCard, BarChart3, Bot, Heart, TrendingUp, Calculator, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Stock Advisor", href: "/stocks", icon: TrendingUp },
  { name: "Tax Estimate", href: "/tax-estimate", icon: Calculator },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Wellness Chat", href: "/wellness", icon: Heart },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          FinanceAI
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};