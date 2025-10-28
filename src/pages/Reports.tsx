import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(214, 95%, 55%)', 'hsl(152, 65%, 52%)', 'hsl(270, 75%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    if (transactions) {
      // Category breakdown
      const categoryMap = new Map();
      transactions.forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + parseFloat(t.amount));
      });

      const catData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value: parseFloat(value.toString()),
      }));
      setCategoryData(catData);

      // Monthly breakdown
      const monthlyMap = new Map();
      transactions.forEach((t) => {
        const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const current = monthlyMap.get(month) || { income: 0, expense: 0 };
        if (t.type === 'income') {
          current.income += parseFloat(t.amount);
        } else {
          current.expense += parseFloat(t.amount);
        }
        monthlyMap.set(month, current);
      });

      const monthData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }));
      setMonthlyData(monthData.slice(-6)); // Last 6 months
    }

    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Visualize your financial data</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="hsl(152, 65%, 52%)" />
                  <Bar dataKey="expense" fill="hsl(0, 84%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}