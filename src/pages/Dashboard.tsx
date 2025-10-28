import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    budgetCount: 0,
    stocksValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [transactionsRes, budgetsRes, stocksRes] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("budgets").select("*").eq("user_id", user.id),
        supabase.from("stocks").select("*").eq("user_id", user.id),
      ]);

      const transactions = transactionsRes.data || [];
      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      const stocksValue = (stocksRes.data || [])
        .reduce((sum, s) => sum + (parseFloat(s.shares.toString()) * parseFloat(s.purchase_price.toString())), 0);

      setStats({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        budgetCount: budgetsRes.data?.length || 0,
        stocksValue,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Balance",
      value: `$${stats.balance.toFixed(2)}`,
      description: "Current balance",
      icon: DollarSign,
      trend: stats.balance >= 0 ? "up" : "down",
    },
    {
      title: "Total Income",
      value: `$${stats.totalIncome.toFixed(2)}`,
      description: "All time income",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Total Expenses",
      value: `$${stats.totalExpenses.toFixed(2)}`,
      description: "All time expenses",
      icon: TrendingDown,
      trend: "down",
    },
    {
      title: "Active Budgets",
      value: stats.budgetCount,
      description: "Budget categories",
      icon: Wallet,
      trend: "neutral",
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial health</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your recent transactions in the Transactions tab
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value</CardTitle>
              <CardDescription>Your stock investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.stocksValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total portfolio value</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}